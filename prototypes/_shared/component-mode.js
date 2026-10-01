// Component mode (2026-10-01) — lets the Component Library (prototypes/components/) show any
// widget straight from the real page it lives on, in any state, without a separate copy of its
// markup. Loaded first on every template; does nothing unless the URL has ?component=<selector>.
//
//   ?component=.price-block   CSS selector of the widget (&nth=1 picks a later match;
//                             component=* only sets the state — nothing is hidden)
//   &keep=.sel                also keep these visible (dropdowns that live outside the widget,
//                             e.g. the search suggestions or the mega menu drawer)
//   &ls={"rrgRegion":"UK"}    seed this frame's storage (rrg* keys only — session, region,
//                             phase, a template's Demo State choices "rrgDemo:<template>", …)
//   &cart=full                load a demo cart preset (empty / accessories / full)
//   &order=collect|delivery   fake a placed order for the confirmation page
//   &do=click:.sel,…          run after the page has finished setting up (open a drawer, focus
//                             the search box, …) — see run() below
//
// Storage is swapped for an in-memory copy in this mode, so a library frame can never change the
// session, cart or Demo State that you see on the real pages.
(function () {
  const q = new URLSearchParams(location.search);
  const selector = q.get('component');
  if (!selector) return;
  document.documentElement.classList.add('rrg-component-mode');

  // `lazy` fills a key the first time a page reads it (the cart and order need cart.js's data,
  // which hasn't loaded yet when this file runs).
  const memoryStorage = (lazy = {}) => {
    const m = new Map();
    return {
      getItem: k => {
        k = String(k);
        if (lazy[k]) { const fill = lazy[k]; delete lazy[k]; fill(); }
        return m.has(k) ? m.get(k) : null;
      },
      setItem: (k, v) => { m.set(String(k), String(v)); },
      removeItem: k => { m.delete(String(k)); },
      clear: () => m.clear(),
      key: i => [...m.keys()][i] ?? null,
      get length() { return m.size; },
    };
  };
  const lazy = {};
  const local = memoryStorage(lazy);
  try {
    const seed = JSON.parse(q.get('ls') || '{}');
    Object.entries(seed).forEach(([k, v]) => { if (/^rrg/.test(k)) local.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); });
  } catch (e) {}
  const preset = q.get('cart') || (q.get('order') ? 'full' : '');
  if (preset) lazy.rrgCart = () => { if (typeof rrgCartLoadPreset === 'function') rrgCartLoadPreset(preset); };
  const orderMethod = q.get('order');
  if (orderMethod) lazy.rrgLastOrder = () => {
    if (typeof rrgCartGet !== 'function') return;
    const cart = rrgCartGet();
    const options = rrgRegionCheckout().delivery;
    const opt = options.find(d => d.key === 'standard') || options[0];
    const method = orderMethod === 'collect' ? 'collect' : opt.key;
    local.setItem('rrgLastOrder', JSON.stringify({
      number: '100045123', placed: new Date().toISOString(), region: 'AU',
      email: 'graham@example.com', first: 'Graham', last: 'Smith', phone: '0400 000 000',
      method, store: method === 'collect' ? 'North Lakes' : null,
      address: method === 'collect' ? null : { street: '12 Example St', suburb: 'North Lakes', region: 'QLD', postcode: '4509' },
      delivery: method === 'collect' ? null : { label: opt.label, eta: opt.eta, price: opt.price },
      payment: 'Credit or debit card', lines: cart.lines, totals: rrgCartTotals(cart, method),
      guest: false, vehicle: 'hilux',
    }));
  };
  try {
    Object.defineProperty(window, 'localStorage', { value: local, configurable: true });
    Object.defineProperty(window, 'sessionStorage', { value: memoryStorage(), configurable: true });
  } catch (e) {}

  const pad = 16;
  let target = null;
  let kept = [];
  const report = () => {
    if (!target) return;
    const fixed = getComputedStyle(target).position === 'fixed';
    // The frame's height covers the widget plus anything kept with it (an open dropdown).
    const rects = [target, ...kept].map(el => el.getBoundingClientRect()).filter(r => r.height);
    const top = Math.min(...rects.map(r => r.top)), bottom = Math.max(...rects.map(r => r.bottom));
    if (!fixed) window.scrollTo(0, Math.max(0, top + window.scrollY - pad));
    parent.postMessage({ type: 'rrg-component', id: q.get('frame'), height: fixed ? null : Math.ceil(bottom - top + pad * 2) }, '*');
  };

  const isolate = () => {
    if (selector === '*') { parent.postMessage({ type: 'rrg-component', id: q.get('frame'), height: null }, '*'); return; }
    kept = q.get('keep') ? [...document.querySelectorAll(q.get('keep'))] : [];
    const matches = document.querySelectorAll(selector);
    target = matches[Number(q.get('nth') || 0)] || null;
    if (!target) {
      document.body.innerHTML = `<p style="padding:16px;font:14px Lato,Arial,sans-serif;color:#BB0220">Widget not found on this page: <code>${selector.replace(/</g, '&lt;')}</code></p>`;
      parent.postMessage({ type: 'rrg-component', id: q.get('frame'), height: 60, missing: true }, '*');
      return;
    }
    // Hide everything that isn't the widget or one of its ancestors. Ancestors stay, so the
    // widget keeps the exact width and styling context it has on the real page.
    for (let node = target; node && node !== document.body; node = node.parentElement) {
      [...node.parentElement.children].forEach(sib => {
        if (sib === node || /^(SCRIPT|STYLE|LINK)$/.test(sib.tagName) || kept.some(k => sib === k || sib.contains(k))) return;
        sib.style.setProperty('display', 'none', 'important');
      });
    }
    target.setAttribute('data-component-target', '');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.paddingBottom = '100vh';
    report();
    if ('ResizeObserver' in window) { const ro = new ResizeObserver(report); [target, ...kept].forEach(el => ro.observe(el)); }
  };

  // Actions, comma-separated: click:<sel>, focus:<sel>, type:<sel>|<text>, addclass:<sel>|<class>,
  // call:<globalFunction>|<arg> (only rrg*/open*/plp*/apply* functions).
  const run = actions => actions.forEach(a => {
    const i = a.indexOf(':');
    const kind = a.slice(0, i);
    const [sel, arg] = a.slice(i + 1).split('|');
    if (kind === 'call') {
      if (/^(rrg|open|plp|apply)\w*$/.test(sel) && typeof window[sel] === 'function') window[sel](arg === undefined ? undefined : arg === 'true' ? true : arg);
      return;
    }
    const el = document.querySelector(sel);
    if (!el) return;
    if (kind === 'click') el.click();
    else if (kind === 'addclass') el.classList.add(arg);
    else if (kind === 'focus' || kind === 'type') {
      // Library frames take focus from each other; keep this state frozen when focus leaves.
      el.addEventListener('blur', e => e.stopImmediatePropagation(), true);
      el.focus();
      el.dispatchEvent(new Event('focus'));
      el.dispatchEvent(new Event('focusin', { bubbles: true }));
      if (kind === 'type') { el.value = arg || ''; el.dispatchEvent(new Event('input', { bubbles: true })); }
    }
  });

  window.addEventListener('load', () => {
    // Let async renders settle (maps, reviews, carousels) before acting and isolating.
    setTimeout(() => {
      const actions = (q.get('do') || '').split(',').filter(Boolean);
      run(actions);
      setTimeout(isolate, actions.length ? 450 : 0);
    }, 700);
  });

  // In a library frame, links open in a new tab instead of navigating the frame away.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
    e.preventDefault();
    window.open(a.href, '_blank', 'noopener');
  }, true);
})();
