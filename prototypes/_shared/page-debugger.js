// Page Debugger (2026-10-13, Graham meeting) — a review tool for the prototypes. Turned on from
// Site Admin → Prototype → "Page debugger", or with a ?debug=1 link (?debug=0 turns it off); the
// choice is saved, like ?sale=. admin-panel.js loads this file (and dynamic-fields.js) only while
// it's on, and never inside a Component Library frame (component-mode.js).
//
// A sticky panel on the left shows the page's metadata (title, meta description, canonical,
// robots, H1, structured data, Open Graph) and a checklist of layers:
//   Dynamic fields       outlines every field in RRG_DYN_FIELDS (dynamic-fields.js), coloured by
//                        source; hover one for its source, attribute and fallback rule
//   Components on hover  hover any widget for its Component Library entry (components/registry.js):
//                        name, green shared / orange mixed / red copied, pages it's used on
//   Outline components   draws every widget on the page in its build colour
//
// The outlines are drawn in a fixed layer above the page (never on the elements themselves), so
// nothing about the page's own layout changes while it's on.

(function () {
  if (document.documentElement.classList.contains('rrg-component-mode')) return;
  if (window.rrgPageDebugger) return;

  const LAYERS_KEY = 'rrgDebugLayers';
  const UI_KEY = 'rrgDebugUi';
  const BUILD = {
    shared: { label: 'Shared', desc: 'Shared code: updates everywhere' },
    mixed: { label: 'Mixed', desc: 'Copied shell + shared code' },
    copied: { label: 'Copied', desc: 'Copied markup: update every page it is used on' },
  };
  const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v && typeof v === 'object' ? { ...d, ...v } : d; } catch (e) { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

  const pageKey = (() => {
    const k = location.pathname.split('/').filter(Boolean).slice(-2, -1)[0];
    return !k || k === 'prototypes' ? 'index' : k;
  })();
  const sources = typeof RRG_DYN_SOURCES === 'object' ? RRG_DYN_SOURCES : {};
  const allFields = typeof RRG_DYN_FIELDS === 'object' ? RRG_DYN_FIELDS : [];
  const fields = allFields.filter(f => f.sel && (!f.pages || f.pages.includes(pageKey)));

  let layers = read(LAYERS_KEY, { fields: true, hover: true, outline: false });
  // Starts minimised on phones, where the open panel would cover most of the page.
  let ui = read(UI_KEY, { min: innerWidth < 900, open: { meta: true, fields: false, comps: false } });
  let components = null;      // registry entries used on this page (null until loaded)
  let registryError = false;

  // Element → entries, rebuilt on every scan.
  let fieldEls = new Map();   // el → [field]
  let fieldHits = new Map();  // field.id → { total, visible: [el] }
  let compEls = new Map();    // el → [component]
  let compHits = new Map();   // component.id → { total, visible: [el] }

  // ---------------------------------------------------------------- DOM
  const root = document.createElement('div');
  root.className = 'rrg-dbg';
  root.innerHTML = `
    <div class="rrg-dbg-layer" aria-hidden="true"></div>
    <div class="rrg-dbg-hover" aria-hidden="true"></div>
    <div class="rrg-dbg-tip" role="tooltip" hidden></div>
    <button type="button" class="rrg-dbg-pill" hidden>Page debugger</button>
    <aside class="rrg-dbg-panel" aria-label="Page debugger">
      <div class="rrg-dbg-head">
        <span>Page debugger</span>
        <span class="rrg-dbg-head-btns">
          <button type="button" data-dbg-min aria-label="Minimise">&minus;</button>
          <button type="button" data-dbg-off aria-label="Turn off the page debugger">&times;</button>
        </span>
      </div>
      <div class="rrg-dbg-body">
        <div class="rrg-dbg-page"></div>
        <details class="rrg-dbg-sec" data-sec="meta"><summary>Page info</summary><div class="rrg-dbg-meta"></div></details>
        <div class="rrg-dbg-checks">
          <div class="rrg-dbg-h">Show on page</div>
          <label><input type="checkbox" data-layer="fields"> <span>Dynamic fields</span> <em data-count="fields"></em></label>
          <label><input type="checkbox" data-layer="hover"> <span>Components on hover</span> <em data-count="comps"></em></label>
          <label><input type="checkbox" data-layer="outline"> <span>Outline all components</span></label>
        </div>
        <details class="rrg-dbg-sec" data-sec="fields"><summary>Fields on this page</summary><div class="rrg-dbg-fields"></div></details>
        <details class="rrg-dbg-sec" data-sec="comps"><summary>Components on this page</summary><div class="rrg-dbg-comps"></div></details>
      </div>
    </aside>`;
  document.body.appendChild(root);
  const $ = s => root.querySelector(s);
  const layerEl = $('.rrg-dbg-layer');
  const hoverEl = $('.rrg-dbg-hover');
  const tip = $('.rrg-dbg-tip');
  const panel = $('.rrg-dbg-panel');
  const pill = $('.rrg-dbg-pill');
  const inUi = el => !!(el && el.closest && el.closest('.rrg-dbg, .site-admin-panel, .site-admin-flyout, .site-admin-fab, .admin-panel, .admin-fab'));

  // ---------------------------------------------------------------- Page info
  function metaRows() {
    const q = s => document.querySelector(s);
    const title = document.title.trim();
    const desc = (q('meta[name="description"]') || {}).content;
    const canon = (q('link[rel="canonical"]') || {}).href;
    const robots = (q('meta[name="robots"]') || {}).content;
    const noindex = /noindex/i.test(robots || '');
    const h1s = [...document.querySelectorAll('h1')].filter(h => !inUi(h));
    const types = [];
    let ldError = 0;
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
      try {
        const data = JSON.parse(s.textContent);
        const walk = d => {
          if (Array.isArray(d)) return d.forEach(walk);
          if (!d || typeof d !== 'object') return;
          if (d['@graph']) walk(d['@graph']);
          if (d['@type']) [].concat(d['@type']).forEach(t => types.push(t));
        };
        walk(data);
      } catch (e) { ldError++; }
    });
    const og = ['og:title', 'og:description', 'og:image'].filter(p => q(`meta[property="${p}"]`));
    const len = (n, lo, hi) => n === 0 ? 'bad' : (n < lo || n > hi ? 'warn' : 'ok');
    return [
      { k: 'Title', s: len(title.length, 30, 60), n: title.length ? `${title.length} chars` : 'Missing', v: title, hint: 'Aim for 30–60 characters' },
      { k: 'Meta description', s: desc ? len(desc.length, 70, 160) : 'bad', n: desc ? `${desc.length} chars` : 'Missing', v: desc || '', hint: 'Aim for 70–160 characters' },
      { k: 'Canonical', s: canon ? 'ok' : (noindex ? 'ok' : 'bad'), n: canon ? '' : (noindex ? 'Not needed (noindex)' : 'Missing'), v: canon ? canon.replace(/^https?:\/\/[^/]+/, '') || canon : '' },
      { k: 'Robots', s: 'ok', n: robots ? '' : 'Default', v: robots || 'index, follow' },
      { k: 'H1', s: h1s.length === 1 ? 'ok' : 'bad', n: h1s.length === 1 ? '' : `${h1s.length} on the page`, v: h1s.map(h => clip(h.textContent, 90)).join(' · ') },
      { k: 'Structured data', s: ldError ? 'bad' : (types.length ? 'ok' : 'warn'), n: ldError ? `${ldError} block won't parse` : (types.length ? '' : 'None'), v: [...new Set(types)].join(', ') },
      { k: 'Open Graph', s: og.length === 3 ? 'ok' : 'warn', n: og.length === 3 ? '' : (og.length ? `Has ${og.map(p => p.slice(3)).join(', ')}` : 'None'), v: og.length === 3 ? 'title, description, image' : '' },
    ];
  }
  const ICON = { ok: '✓', warn: '!', bad: '×' };
  function renderMeta() {
    $('.rrg-dbg-page').innerHTML = `<span>Template</span> <b>${esc(pageKey)}</b>`;
    $('.rrg-dbg-meta').innerHTML = metaRows().map(r => `
      <div class="rrg-dbg-row">
        <div class="rrg-dbg-row-k"><i class="rrg-dbg-st ${r.s}" title="${r.s === 'ok' ? 'OK' : r.s === 'warn' ? 'Check' : 'Missing / wrong'}">${ICON[r.s]}</i>${esc(r.k)}${r.n ? ` <em${r.hint ? ` title="${esc(r.hint)}"` : ''}>${esc(r.n)}</em>` : ''}</div>
        ${r.v ? `<div class="rrg-dbg-row-v">${esc(r.v)}</div>` : ''}
      </div>`).join('');
  }

  // ---------------------------------------------------------------- Registry
  function loadRegistry() {
    const base = typeof RRG_PROTO === 'string' ? RRG_PROTO : new URL('../', location.href).href;
    fetch(base + 'components/registry.js')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      // Run in its own scope: registry.js declares top-level helpers (v, S, demo) that could clash
      // with a page's own globals if it were loaded as a <script>.
      .then(src => new Function(src + '\nreturn RRG_COMPONENTS;')())
      .then(list => {
        // Templates the library doesn't list on their own borrow their twin's widgets.
        const key = { 'vplp-accessories': 'vplp' }[pageKey] || pageKey;
        components = list.filter(c => (c.usedOn || []).includes(key) || (c.variants || []).some(v => v.page === key))
          .map(c => {
            const sels = c.hover ? [c.hover] : [...new Set((c.variants || []).flatMap(v => [v.sel, v.selM]).filter(Boolean))];
            return { ...c, sels };
          })
          .filter(c => c.sels.length);
        scheduleScan();
      })
      .catch(() => { registryError = true; components = []; renderLists(); });
  }

  // ---------------------------------------------------------------- Scan
  const MEDIA = /^(IMG|SVG|VIDEO|IFRAME|INPUT|SELECT|CANVAS|PICTURE)$/i;
  // On screen for real: has a size, isn't hidden, and isn't clipped away by a closed drawer or
  // dropdown (an ancestor with overflow hidden, or faded to opacity 0).
  const visible = el => {
    if (inUi(el)) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0') return false;
    // An empty slot (nothing to show in this state) gets no outline.
    if (!MEDIA.test(el.tagName) && cs.backgroundImage === 'none' && !el.textContent.trim() && !el.querySelector('img, svg, video, iframe, input, select, canvas, picture')) return false;
    let { left, top, right, bottom } = r;
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const ps = getComputedStyle(n);
      if (ps.opacity === '0') return false;
      if (ps.overflowX !== 'visible' || ps.overflowY !== 'visible') {
        const pr = n.getBoundingClientRect();
        left = Math.max(left, pr.left); top = Math.max(top, pr.top);
        right = Math.min(right, pr.right); bottom = Math.min(bottom, pr.bottom);
        if (right - left < 1 || bottom - top < 1) return false;
      }
    }
    return true;
  };
  const addTo = (map, el, item) => { const a = map.get(el); if (a) { if (!a.includes(item)) a.push(item); } else map.set(el, [item]); };
  function safeAll(sel) { try { return [...document.querySelectorAll(sel)]; } catch (e) { return []; } }

  function scan() {
    fieldEls = new Map(); fieldHits = new Map();
    fields.forEach(f => {
      const all = safeAll(f.sel).filter(el => !inUi(el)).slice(0, 80);
      const vis = all.filter(visible);
      all.forEach(el => addTo(fieldEls, el, f));
      fieldHits.set(f.id, { total: all.length, visible: vis });
    });
    compEls = new Map(); compHits = new Map();
    (components || []).forEach(c => {
      const all = c.sels.flatMap(safeAll).filter(el => !inUi(el));
      const vis = all.filter(visible);
      all.forEach(el => addTo(compEls, el, c));
      compHits.set(c.id, { total: all.length, visible: vis });
    });
    renderLists();
    draw();
  }
  let scanTimer = null;
  function scheduleScan() { clearTimeout(scanTimer); scanTimer = setTimeout(scan, 120); }

  // ---------------------------------------------------------------- Drawing
  let raf = 0;
  function draw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const boxes = [];
      if (layers.outline) compHits.forEach((h, id) => {
        const c = components.find(x => x.id === id);
        h.visible.forEach(el => boxes.push(box(el, `rrg-dbg-box comp ${c.build}`)));
      });
      if (layers.fields) fieldHits.forEach((h, id) => {
        const f = fields.find(x => x.id === id);
        h.visible.forEach(el => boxes.push(box(el, `rrg-dbg-box field src-${f.source}${f.status === 'confirmed' ? '' : ' draft'}`)));
      });
      layerEl.innerHTML = boxes.filter(Boolean).join('');
      if (hovered) showHover(hovered.el, hovered.x, hovered.y);
    });
  }
  // Covered by something on top (an open dropdown, drawer, the sticky header): sample a few points
  // inside it and see whether any of them reach the element.
  function onTop(el, r) {
    const xs = [r.left + r.width / 2, r.left + 4, r.right - 4], ys = [r.top + r.height / 2, r.top + 4, r.bottom - 4];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const x = xs[i], y = ys[j];
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const hit = document.elementFromPoint(x, y);
      if (hit && (el.contains(hit) || hit.contains(el))) return true;
    }
    return false;
  }
  function box(el, cls, label, always) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || r.width < 1) return '';
    if (!always && !onTop(el, r)) return '';
    return `<div class="${cls}" style="left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px">${label ? `<span>${esc(label)}</span>` : ''}</div>`;
  }

  // ---------------------------------------------------------------- Hover
  let hovered = null;
  function findUp(el, map) {
    const chain = [];
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const hit = map.get(n);
      if (hit) chain.push({ el: n, items: hit });
    }
    return chain;
  }
  function valueOf(el) {
    if (el.tagName === 'IMG') return el.alt ? `Image: ${el.alt}` : `Image: ${(el.currentSrc || el.src || '').split('/').pop()}`;
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') return el.value || el.placeholder || '';
    return clip(el.textContent, 120);
  }
  function fieldTip(f, el) {
    const src = sources[f.source] || sources.unknown || { label: f.source };
    const rule = [].concat(f.rule || []);
    return `<div class="rrg-dbg-tip-sec">
      <div class="rrg-dbg-tip-top"><i class="rrg-dbg-chip src-${esc(f.source)}">${esc(src.label)}</i>${f.status === 'confirmed' ? '' : '<i class="rrg-dbg-draft">Draft</i>'}</div>
      <div class="rrg-dbg-tip-name">${esc(f.label)}</div>
      ${f.attr ? `<div class="rrg-dbg-tip-attr">${esc(f.attr)}</div>` : ''}
      ${rule.length ? `<ol class="rrg-dbg-tip-rule">${rule.map(r => `<li>${esc(r)}</li>`).join('')}</ol>` : ''}
      <dl class="rrg-dbg-tip-dl">
        <dt>Showing</dt><dd>${esc(valueOf(el)) || '<span class="rrg-dbg-muted">(empty)</span>'}</dd>
        ${f.example ? `<dt>Example</dt><dd>${esc(f.example)}</dd>` : ''}
        ${f.notes ? `<dt>Notes</dt><dd>${esc(f.notes)}</dd>` : ''}
      </dl>
      <div class="rrg-dbg-tip-id">${esc(f.id)}</div>
    </div>`;
  }
  function compTip(chain) {
    const [inner, ...outer] = chain;
    const c = inner.items[0];
    const also = inner.items.slice(1).map(x => x.name);
    return `<div class="rrg-dbg-tip-sec">
      <div class="rrg-dbg-tip-top"><i class="rrg-dbg-build ${esc(c.build)}"></i><b>${esc(BUILD[c.build] ? BUILD[c.build].desc : c.build)}</b></div>
      <div class="rrg-dbg-tip-name">${esc(c.name)}</div>
      <dl class="rrg-dbg-tip-dl">
        <dt>Used on</dt><dd>${(c.usedOn || []).length} page${(c.usedOn || []).length === 1 ? '' : 's'}</dd>
        ${c.source ? `<dt>Code</dt><dd>${esc(c.source)}</dd>` : ''}
        ${also.length ? `<dt>Also</dt><dd>${esc(also.join(', '))}</dd>` : ''}
        ${outer.length ? `<dt>Inside</dt><dd>${esc(outer.map(o => o.items[0].name).join(' › '))}</dd>` : ''}
      </dl>
      <div class="rrg-dbg-tip-id">Component Library: ${esc(c.id)}</div>
    </div>`;
  }
  function showHover(el, x, y) {
    const fChain = layers.fields ? findUp(el, fieldEls) : [];
    const cChain = layers.hover ? findUp(el, compEls) : [];
    if (!fChain.length && !cChain.length) { hideHover(); return; }
    hovered = { el, x, y };
    let html = '';
    let boxes = '';
    if (fChain.length) {
      html += fieldTip(fChain[0].items[0], fChain[0].el);
      boxes += box(fChain[0].el, `rrg-dbg-box field-hover src-${fChain[0].items[0].source}`, '', true);
    }
    if (cChain.length) {
      html += compTip(cChain);
      const c = cChain[0].items[0];
      boxes += box(cChain[0].el, `rrg-dbg-box comp-hover ${c.build}`, c.name, true);
    }
    hoverEl.innerHTML = boxes;
    tip.innerHTML = html;
    tip.hidden = false;
    const pad = 16, w = tip.offsetWidth, h = tip.offsetHeight;
    let left = x + pad, top = y + pad;
    if (left + w > innerWidth - 8) left = Math.max(8, x - w - pad);
    if (top + h > innerHeight - 8) top = Math.max(8, innerHeight - h - 8);
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function hideHover() { hovered = null; hoverEl.innerHTML = ''; tip.hidden = true; }
  const onMove = e => {
    if (inUi(e.target)) { hideHover(); return; }
    showHover(e.target, e.clientX, e.clientY);
  };
  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseleave', hideHover);

  // ---------------------------------------------------------------- Lists
  function flash(el) {
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      const f = document.createElement('div');
      f.className = 'rrg-dbg-flash';
      Object.assign(f.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
      root.appendChild(f);
      setTimeout(() => f.remove(), 1400);
    }, 450);
  }
  // Only touch the panel when its content changes, so the 1.5s rescan never swallows a click.
  const setHTML = (el, html) => { if (el.__html !== html) { el.__html = html; el.innerHTML = html; } };
  function renderLists() {
    const shown = fields.filter(f => (fieldHits.get(f.id) || {}).total);
    const visCount = shown.filter(f => fieldHits.get(f.id).visible.length).length;
    $('[data-count="fields"]').textContent = fields.length ? `${visCount}` : '0';
    const bySource = Object.keys(sources).map(k => ({ k, list: shown.filter(f => f.source === k) })).filter(g => g.list.length);
    const missing = fields.filter(f => f.pages && !(fieldHits.get(f.id) || {}).total);
    setHTML($('.rrg-dbg-fields'), !fields.length
      ? '<p class="rrg-dbg-muted">No dynamic fields are listed for this template yet.</p>'
      : `<div class="rrg-dbg-legend">${bySource.map(g => `<i class="rrg-dbg-chip src-${g.k}" title="${esc(sources[g.k].desc)}">${esc(sources[g.k].label)} ${g.list.length}</i>`).join('')}</div>
        ${bySource.map(g => `<div class="rrg-dbg-h">${esc(sources[g.k].label)}</div>
          <ul class="rrg-dbg-list">${g.list.map(f => {
            const h = fieldHits.get(f.id);
            return `<li><button type="button" data-goto-field="${esc(f.id)}" class="${h.visible.length ? '' : 'off'}" title="${esc(f.id)}${h.visible.length ? '' : ' — not visible right now (closed drawer, hover state or another Demo State)'}">${esc(f.label)}${f.status === 'confirmed' ? '' : ' <i class="rrg-dbg-draft">Draft</i>'}</button></li>`;
          }).join('')}</ul>`).join('')}
        ${missing.length ? `<div class="rrg-dbg-h">Not on the page in this state</div><ul class="rrg-dbg-list">${missing.map(f => `<li><span class="off" title="Only shows in another state (drawer open, item in the cart, a Demo State choice…). Selector: ${esc(f.sel)}">${esc(f.label)}</span></li>`).join('')}</ul>` : ''}`);

    if (registryError) {
      $('[data-count="comps"]').textContent = '';
      setHTML($('.rrg-dbg-comps'), '<p class="rrg-dbg-muted">The component list needs the prototype served over http (Vercel or a local server).</p>');
      return;
    }
    if (!components) { setHTML($('.rrg-dbg-comps'), '<p class="rrg-dbg-muted">Loading…</p>'); return; }
    const found = components.filter(c => (compHits.get(c.id) || {}).total);
    $('[data-count="comps"]').textContent = `${found.length}`;
    const lib = typeof RRG_PROTO === 'string' ? RRG_PROTO + 'components/index.html?only=' : '../components/index.html?only=';
    setHTML($('.rrg-dbg-comps'), `<div class="rrg-dbg-legend">${Object.keys(BUILD).map(b => `<i class="rrg-dbg-chip build-${b}" title="${esc(BUILD[b].desc)}"><i class="rrg-dbg-build ${b}"></i>${BUILD[b].label} ${found.filter(c => c.build === b).length}</i>`).join('')}</div>
      ${Object.keys(BUILD).map(b => {
        const list = found.filter(c => c.build === b);
        return list.length ? `<div class="rrg-dbg-h">${BUILD[b].desc}</div><ul class="rrg-dbg-list">${list.map(c => {
          const h = compHits.get(c.id);
          return `<li><button type="button" data-goto-comp="${esc(c.id)}" class="${h.visible.length ? '' : 'off'}">${esc(c.name)}</button><a href="${lib}${encodeURIComponent(c.id)}" target="_blank" rel="noopener" title="Open in the Component Library">↗</a></li>`;
        }).join('')}</ul>` : '';
      }).join('')}`);
  }
  root.addEventListener('click', e => {
    const fb = e.target.closest('[data-goto-field]');
    if (fb) { const h = fieldHits.get(fb.dataset.gotoField); flash(h && (h.visible[0])); }
    const cb = e.target.closest('[data-goto-comp]');
    if (cb) { const h = compHits.get(cb.dataset.gotoComp); flash(h && (h.visible[0])); }
  });

  // ---------------------------------------------------------------- Panel controls
  root.querySelectorAll('[data-layer]').forEach(cb => {
    cb.checked = !!layers[cb.dataset.layer];
    cb.addEventListener('change', () => {
      layers = { ...layers, [cb.dataset.layer]: cb.checked };
      write(LAYERS_KEY, layers);
      if (!cb.checked) hideHover();
      draw();
    });
  });
  root.querySelectorAll('details[data-sec]').forEach(d => {
    d.open = !!ui.open[d.dataset.sec];
    d.addEventListener('toggle', () => { ui = { ...ui, open: { ...ui.open, [d.dataset.sec]: d.open } }; write(UI_KEY, ui); });
  });
  const setMin = min => {
    ui = { ...ui, min }; write(UI_KEY, ui);
    panel.hidden = min; pill.hidden = !min;
  };
  $('[data-dbg-min]').addEventListener('click', () => setMin(true));
  pill.addEventListener('click', () => setMin(false));
  $('[data-dbg-off]').addEventListener('click', () => { if (window.rrgSetDebug) window.rrgSetDebug(false); });
  setMin(!!ui.min);

  // ---------------------------------------------------------------- Keep up with the page
  const onResize = () => scheduleScan();
  addEventListener('scroll', draw, { passive: true, capture: true });
  addEventListener('resize', onResize);
  const bodyObs = new MutationObserver(muts => {
    if (muts.every(m => inUi(m.target))) return;
    scheduleScan();
  });
  bodyObs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'hidden', 'style', 'open'], characterData: true });
  const headObs = new MutationObserver(renderMeta);
  headObs.observe(document.head, { subtree: true, childList: true, attributes: true, characterData: true });
  // Drawers and accordions animate open; a slow rescan catches where they settle.
  const timer = setInterval(scan, 1500);

  renderMeta();
  loadRegistry();
  scan();

  window.rrgPageDebugger = {
    destroy() {
      clearInterval(timer); clearTimeout(scanTimer); cancelAnimationFrame(raf);
      bodyObs.disconnect(); headObs.disconnect();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', hideHover);
      removeEventListener('scroll', draw, { capture: true });
      removeEventListener('resize', onResize);
      root.remove();
    },
  };
})();
