// Buying Guide pages (2026-10-06, docs/buying-guide/buying-guide-spec.md). Loaded only by guide
// pages, after shared.js. Three pieces:
//   initBikeRackFinder()  the 3-question finder (markup: rrgWidgetBikeRackFinderHTML, widgets.js)
//   initGuideToc()        the sticky "On this page" bar: current section + reading progress
//   initGuideStickyCta()  mobile bottom button, shown once the finder has scrolled away
//
// The finder's rules come only from the live /bike-racks-info copy (spec §3). Where the live page
// says nothing (e.g. eBikes on a spare wheel rack) the finder never recommends that style; it
// falls back to "talk to us" instead of inventing advice.

// ---------------------------------------------------------------- Finder data

// Mounting styles, in the order the finder prefers them (the live page: tow hitch / tow ball
// first, "the best long-term investment"). `needs` = what the vehicle must have; null = nothing.
// `heavy`/`carbon`: true = live copy confirms it, false = not suitable, null = live copy is silent.
const BRF_MOUNTS = {
  tow:      { name: 'Tow hitch or tow ball rack', max: 6, needs: 'towbar', heavy: true, carbon: true, cards: ['hitch', 'towball'], filter: 'tow-ball-mounting,hitch-mounting' },
  roof:     { name: 'Roof mounted bike racks', max: 4, needs: 'roofbars', heavy: false, carbon: true, cards: ['roof'], filter: 'roof-mounting' },
  ute:      { name: 'Ute tub bike rack', max: 5, needs: 'ute', heavy: null, carbon: null, cards: ['ute'], filter: 'rear-mounting', type: 'ute-tub' },
  spare:    { name: 'Spare wheel bike rack', max: 2, needs: 'spare', heavy: null, carbon: null, cards: ['spare'], filter: 'rear-mounting', type: 'spare-wheel' },
  reardoor: { name: 'Rear door / boot bike rack', max: 3, needs: null, heavy: null, carbon: null, cards: ['reardoor'], filter: 'rear-mounting', type: 'rear-door-boot' },
  suction:  { name: 'Suction bike rack', max: 3, needs: null, heavy: null, carbon: null, cards: ['suction'], filter: 'treefrog' },
};

// "Why" lines — live copy, lightly trimmed.
const BRF_WHY = {
  tow: ['Carries up to 6 bikes, the best long-term investment.', 'Everything is done at waist level, so it suits eBikes and heavy bikes.', 'Very secure, with good boot access.'],
  roof: ['Carries up to 4 bikes, depending on roof bar length and rack width.', 'Bikes are held securely and upright. You need one rack per bike.', 'Not ideal for tall vehicles.'],
  ute: ['Carries up to 5 bikes, in the tub or draped over the tailgate.', 'Super-quick and easy to get multiple bikes on and off.'],
  spare: ['Carries up to 2 bikes on your rear-mounted spare wheel.'],
  reardoor: ['Carries up to 3 bikes, clipped onto your boot or hatch with hooks and straps.', 'Not suitable for some vehicles, so check yours first.'],
  suction: ['Carries up to 3 bikes on vacuum suckers.', 'Ideal for vehicles that can\'t take roof racks, e.g. sports cars and coupes.'],
};
const BRF_BIKE_WHY = {
  ebike: 'eBikes typically weigh 25 to 35kg. Use tow hitch or tow ball racks only. Roof racks are not safe for eBike loading.',
  carbon: 'Carbon frames must be held by the wheels, never the downtube. Use a wheel-hold rack.',
  fat: 'Fat and XXL bikes have wide tyres and only fit specialist racks with wider trays.',
  kids: 'Platform tow hitch racks work best for mixed adult and kids\' loads.',
  stepthrough: 'Step-through bikes have no top tube, so a wheel-hold rack or a frame adapter works best.',
};

// Which way the rack should hold the bike, per mount + bike mix. Returns { label, cards[] }.
function brfHold(mount, bikes) {
  const b = k => bikes.has(k);
  if (mount === 'tow') {
    if (b('carbon') || b('ebike') || b('fat')) return { label: 'Platform wheel hold', cards: ['pwheel'] };
    if (b('stepthrough')) return { label: 'Platform wheel hold', cards: ['pwheel'] };
    if (b('kids')) return { label: 'Platform (frame or wheel hold)', cards: ['pframe', 'pwheel'] };
    return { label: 'Platform or hanging, your choice', cards: ['pframe', 'pwheel', 'vertical', 'framehang'] };
  }
  if (mount === 'roof') {
    if (b('carbon')) return { label: 'Wheel hold', cards: ['wheel'] };
    if (b('stepthrough')) return { label: 'Wheel hold or a frame adapter', cards: ['wheel'] };
    return { label: 'Fork, frame or wheel hold', cards: ['fork', 'frame', 'wheel'] };
  }
  if (mount === 'ute') return { label: 'Tailgate hang or in the tub', cards: ['tailgate'] };
  return null;
}

// The recommendation. answers = { count, bikes:Set, vehicle:Set }.
function brfRecommend({ count, bikes, vehicle }) {
  const heavy = bikes.has('ebike') || bikes.has('fat');
  const carbon = bikes.has('carbon');
  const has = k => vehicle.has(k);
  // What the vehicle has comes first; rear door and suction (no fitting needed) only when none of
  // those can take the load.
  const order = ['tow', 'roof', 'ute', 'spare'].filter(k => has(BRF_MOUNTS[k].needs));
  const fallback = ['reardoor', 'suction'];

  const fits = k => {
    const m = BRF_MOUNTS[k];
    if (heavy && m.heavy !== true) return false;
    if (carbon && m.carbon !== true) return false;
    return count <= m.max;
  };
  let ok = order.filter(fits);
  if (!ok.length) ok = fallback.filter(fits);
  if (ok.length) return { kind: 'match', mount: ok[0], also: ok.slice(1, 3) };
  const pool = order.length ? order : fallback;

  // Nothing fits. Say why, using the live copy.
  if (heavy && !has('towbar')) return { kind: 'needs-towbar' };
  const fitsIgnoringCount = pool.filter(k => { const m = BRF_MOUNTS[k]; return !(heavy && m.heavy !== true) && !(carbon && m.carbon !== true); });
  if (fitsIgnoringCount.length) return { kind: 'too-many', mounts: fitsIgnoringCount };
  return { kind: 'ask' };
}

// ---------------------------------------------------------------- Finder UI

function initBikeRackFinder() {
  const root = document.querySelector('[data-bike-rack-finder]');
  if (!root) return;
  const steps = [...root.querySelectorAll('[data-brf-step]')];
  const dots = [...root.querySelectorAll('.brf-progress li')];
  const resultEl = root.querySelector('[data-brf-result]');
  const shopBase = root.dataset.brfShopHref || '#';
  const state = { count: 0, bikes: new Set(), vehicle: new Set() };

  const show = n => {
    steps.forEach(s => { s.hidden = Number(s.dataset.brfStep) !== n; });
    resultEl.hidden = n !== 4;
    dots.forEach((d, i) => d.classList.toggle('is-on', i < n));
    root.classList.toggle('has-result', n === 4);
  };
  const sync = () => {
    root.querySelectorAll('.brf-chip').forEach(c => {
      const q = c.dataset.brfQ, v = c.dataset.brfValue;
      const on = q === 'count' ? Number(v) === state.count : state[q].has(v);
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', on);
    });
    steps[1].querySelector('[data-brf-next]').disabled = !state.bikes.size;
    steps[2].querySelector('[data-brf-next]').disabled = !state.vehicle.size;
  };
  const save = () => {
    try { sessionStorage.setItem('rrgBrf', JSON.stringify({ count: state.count, bikes: [...state.bikes], vehicle: [...state.vehicle] })); } catch (e) {}
  };

  root.addEventListener('click', e => {
    const chip = e.target.closest('.brf-chip');
    if (chip) {
      const q = chip.dataset.brfQ, v = chip.dataset.brfValue;
      if (q === 'count') { state.count = Number(v); sync(); show(2); return; }
      const set = state[q];
      if (chip.hasAttribute('data-brf-only')) { const had = set.has(v); set.clear(); if (!had) set.add(v); }
      else { set.delete('none'); set.has(v) ? set.delete(v) : set.add(v); }
      sync();
      return;
    }
    if (e.target.closest('[data-brf-next]')) {
      const cur = steps.findIndex(s => !s.hidden) + 1;
      if (cur === 3) { renderResult(); save(); show(4); } else show(cur + 1);
      return;
    }
    if (e.target.closest('[data-brf-back]')) { show(steps.findIndex(s => !s.hidden)); return; }
    if (e.target.closest('[data-brf-restart]')) {
      state.count = 0; state.bikes.clear(); state.vehicle.clear();
      try { sessionStorage.removeItem('rrgBrf'); } catch (err) {}
      clearMatches(); sync(); show(1);
      document.dispatchEvent(new CustomEvent('rrg-brf-change', { detail: null }));
      return;
    }
    const why = e.target.closest('[data-brf-why]');
    if (why) {
      const target = document.getElementById(why.dataset.brfWhy);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  });

  function clearMatches() {
    document.querySelectorAll('.is-match').forEach(el => el.classList.remove('is-match'));
  }
  // "Your match" highlights on the cards further down the page.
  function markMatches(mount, bikes, hold) {
    clearMatches();
    const mark = sel => document.querySelectorAll(sel).forEach(el => el.classList.add('is-match'));
    if (mount) BRF_MOUNTS[mount].cards.forEach(c => mark(`[data-brf-mount="${c}"]`));
    bikes.forEach(b => mark(`[data-brf-bike="${b}"]`));
    if (hold) hold.cards.forEach(c => mark(`[data-brf-hold="${c}"]`));
    mark(`[data-brf-count="${state.count}"]`);
  }
  function shopHref(mount, hold) {
    const m = BRF_MOUNTS[mount];
    const p = new URLSearchParams({ attachment: m.filter, bikes: state.count });
    if (m.type) p.set('type', m.type);
    if (hold) p.set('hold', hold.cards.join(','));
    if (state.bikes.has('ebike')) p.set('ebike', '1');
    return shopBase + (shopBase.includes('?') ? '&' : '?') + p.toString();
  }

  function renderResult() {
    const bikes = new Set([...state.bikes].filter(b => b !== 'none'));
    const rec = brfRecommend({ count: state.count, bikes, vehicle: state.vehicle });
    const bikeWhy = [...bikes].map(b => BRF_BIKE_WHY[b]).filter(Boolean);
    const restart = `<button type="button" class="brf-back" data-brf-restart>&#8634; Start again</button>`;
    const summary = `<p class="brf-summary">${state.count} bike${state.count > 1 ? 's' : ''}${bikes.size ? ' · ' + [...bikes].map(b => root.querySelector(`[data-brf-value="${b}"]`).textContent).join(', ') : ''} · ${[...state.vehicle].map(v => root.querySelector(`[data-brf-q="vehicle"][data-brf-value="${v}"]`).textContent).join(', ')}</p>`;
    let html, detail = null;

    if (rec.kind === 'match') {
      const m = BRF_MOUNTS[rec.mount];
      const hold = brfHold(rec.mount, bikes);
      const why = [...bikeWhy.slice(0, 2), ...BRF_WHY[rec.mount]].slice(0, 3);
      const towNote = rec.mount === 'tow' ? `<p class="brf-note"><strong>Hitch or tow ball?</strong> A hitch rack slides into a 50mm square hitch receiver; a tow ball rack clamps onto your tow ball. Check which your tow bar has, and its rated capacity.</p>` : '';
      const also = rec.also.length ? `<p class="brf-also">Also works for you: ${rec.also.map(k => `<a href="#mount-${BRF_MOUNTS[k].cards[0]}" data-brf-why="mount-${BRF_MOUNTS[k].cards[0]}">${BRF_MOUNTS[k].name}</a>`).join(' · ')}</p>` : '';
      const href = shopHref(rec.mount, hold);
      html = `<p class="brf-eyebrow">Your best match</p>
        <h3 class="brf-match">${m.name}</h3>
        ${hold ? `<p class="brf-hold">Holds the bike by: <strong>${hold.label}</strong></p>` : ''}
        ${summary}
        <ul class="brf-why">${why.map(w => `<li>${w}</li>`).join('')}</ul>
        ${towNote}
        <div class="brf-actions"><a class="btn btn-primary" href="${href}">Shop These Racks</a><a class="brf-link" href="#mount-${m.cards[0]}" data-brf-why="mount-${m.cards[0]}">Show me why &darr;</a></div>
        ${also}${restart}`;
      markMatches(rec.mount, bikes, hold);
      detail = { label: m.name, href };
    } else {
      const title = { 'needs-towbar': 'You\'ll need a tow bar', 'too-many': `That's a lot of bikes for one rack`, ask: 'Let\'s talk it through' }[rec.kind];
      const body = {
        'needs-towbar': `<ul class="brf-why">${bikeWhy.map(w => `<li>${w}</li>`).join('')}</ul><p class="brf-note">Your vehicle needs a tow bar before it can carry ${bikes.has('ebike') ? 'eBikes' : 'these bikes'} safely. Our team can tell you what your vehicle can take.</p>`,
        'too-many': `<p class="brf-note">${rec.mounts.map(k => `${BRF_MOUNTS[k].name}: up to ${BRF_MOUNTS[k].max} bikes`).join('. ')}. You can combine rack styles, e.g. two bikes on the roof and four on a tow hitch.</p>`,
        ask: `<ul class="brf-why">${bikeWhy.map(w => `<li>${w}</li>`).join('')}</ul><p class="brf-note">For this mix of bikes and vehicle, we'd rather check your setup with you than guess.</p>`,
      }[rec.kind];
      html = `<p class="brf-eyebrow">Your result</p><h3 class="brf-match">${title}</h3>${summary}${body}
        <div class="brf-actions"><a class="btn btn-primary" href="tel:1300071264">Call 1300 071 264</a><a class="brf-link" href="#" data-store-finder-link>Find a store</a></div>${restart}`;
      markMatches(null, bikes, null);
    }
    resultEl.innerHTML = html;
    document.dispatchEvent(new CustomEvent('rrg-brf-change', { detail }));
  }

  // Restore the last answers in this tab (e.g. coming back from the listing).
  try {
    const saved = JSON.parse(sessionStorage.getItem('rrgBrf') || 'null');
    if (saved && saved.count && saved.bikes.length && saved.vehicle.length) {
      state.count = saved.count; saved.bikes.forEach(b => state.bikes.add(b)); saved.vehicle.forEach(v => state.vehicle.add(v));
      sync(); renderResult(); show(4);
      return;
    }
  } catch (e) {}
  sync();
}

// ---------------------------------------------------------------- On this page

function initGuideToc() {
  const toc = document.querySelector('[data-guide-toc]');
  if (!toc) return;
  const links = [...toc.querySelectorAll('a[href^="#"]')];
  const sections = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  const bar = toc.querySelector('.guide-toc-progress span');
  const article = document.querySelector('[data-guide-article]');
  // Below 900px the bar pins under the fixed mobile logo header, so publish its real height.
  const mobileHeader = document.querySelector('.rrg-sticky-header');
  const measure = () => { if (mobileHeader && mobileHeader.offsetHeight) document.documentElement.style.setProperty('--guide-mobile-header-h', mobileHeader.offsetHeight + 'px'); };
  measure();
  let ticking = false;
  const update = () => {
    ticking = false;
    const line = toc.getBoundingClientRect().bottom + 24;
    let current = null;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= line) current = s.id; });
    links.forEach(a => {
      const on = a.getAttribute('href') === '#' + current;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      // Keep the active chip in view in the mobile scroller, without moving the page.
      if (on && toc.scrollWidth > toc.clientWidth) {
        const list = a.parentElement.parentElement;
        const l = a.offsetLeft - list.offsetLeft;
        if (l < list.scrollLeft || l + a.offsetWidth > list.scrollLeft + list.clientWidth) list.scrollTo({ left: l - 16, behavior: 'smooth' });
      }
    });
    if (bar && article) {
      const r = article.getBoundingClientRect();
      const done = Math.min(1, Math.max(0, (line - r.top) / r.height));
      bar.style.transform = `scaleX(${done})`;
    }
    toc.classList.toggle('is-stuck', toc.getBoundingClientRect().top <= parseFloat(getComputedStyle(toc).top) + 1);
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', () => { measure(); update(); });
  update();
}

// ---------------------------------------------------------------- Mobile sticky button

function initGuideStickyCta() {
  const bar = document.querySelector('[data-guide-sticky]');
  const finder = document.querySelector('[data-bike-rack-finder]');
  if (!bar || !finder) return;
  const btn = bar.querySelector('a');
  const footer = document.querySelector('.rrg-footer');
  let finderVisible = true, footerVisible = false;
  const update = () => {
    const on = !finderVisible && !footerVisible;
    bar.classList.toggle('visible', on);
    document.body.classList.toggle('has-sticky-cta', on);
  };
  new IntersectionObserver(([e]) => { finderVisible = e.isIntersecting; update(); }).observe(finder);
  if (footer) new IntersectionObserver(([e]) => { footerVisible = e.isIntersecting; update(); }).observe(footer);
  const setLabel = detail => {
    if (detail) { btn.textContent = 'Shop My Match'; btn.href = detail.href; bar.querySelector('.guide-sticky-label').innerHTML = `Your match<strong>${detail.label}</strong>`; }
    else { btn.textContent = 'Find My Rack'; btn.href = '#bike-rack-finder'; bar.querySelector('.guide-sticky-label').innerHTML = `Not sure which rack?<strong>3 quick questions</strong>`; }
  };
  document.addEventListener('rrg-brf-change', e => setLabel(e.detail));
  btn.addEventListener('click', e => {
    if (btn.getAttribute('href') === '#bike-rack-finder') { e.preventDefault(); finder.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // The sticky button listens for the finder's result, so it's wired first.
  initGuideStickyCta();
  initBikeRackFinder();
  initGuideToc();
});
