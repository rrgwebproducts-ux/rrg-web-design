// Site Admin Panel — GLOBAL prototype state only (rebuilt 2026-09-29, spec.md §15 P2–P11):
// every template and developer brief, the shopper session (logged in / vehicle / nearest store),
// the build phase, site promotions, and prototype tools. Anything that only applies to the page
// you're on lives in the Demo State Panel instead (buildAdminPanel() in shared.js).
//
// 2026-10-01 layout: no accordions. Every template and brief sits in one "Pages & briefs"
// flyout that opens to the side of the panel (hover or click, like a mega menu); on phones it
// slides over the panel with a Back button. The settings below it are always visible.

// `currentKey` is the page's folder name ('simple', 'plp', …) — marks that template "current".
// The root template index passes its parent folder name ('prototypes'), mapped to 'index'.
function buildSiteAdminPanel(currentKey) {
  const DEMO_PANEL_PREF_KEY = 'rrgShowDemoStatePanel';
  const key = currentKey === 'prototypes' || !currentKey ? 'index' : currentKey;

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'site-admin-fab';
  fab.setAttribute('aria-label', 'Open site admin panel');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg><span class="fab-label">Site Admin</span>';

  // Every template, grouped the same way as the template index (prototypes/index.html).
  const templateGroups = [
    { title: 'Home &amp; stores', items: [
      { key: 'home', label: 'Home Page' },
      { key: 'store', label: 'Store Page — North Lakes' },
      { key: 'store-finder', label: 'Store Finder' },
      { key: 'fit-my-vehicle', label: 'Fit My Vehicle' },
      { key: 'installation', label: 'Installation &amp; Booking' },
      { key: 'buying-guide', label: 'Buying Guide — Bike Racks' },
    ] },
    { title: 'Cart &amp; checkout', items: [
      { key: 'cart', label: 'Cart' },
      { key: 'checkout', label: 'Checkout' },
      { key: 'order-confirmation', label: 'Order Confirmation' },
    ] },
    { title: 'Product pages', items: [
      { key: 'vehicle-specific', label: 'Vehicle-Specific Kit' },
      { key: 'config-variant', label: 'Config-Variant' },
      { key: 'sibling-color', label: 'Sibling / Colour' },
      { key: 'simple', label: 'Simple' },
      { key: 'grouped-bundle', label: 'Grouped / Bundle' },
    ] },
    { title: 'Category &amp; listing', items: [
      { key: 'vehicle-category-landing', label: 'Vehicle Category Landing (VCLP)' },
      { key: 'vlp', label: 'Vehicle Landing (VLP)' },
      { key: 'plp-camping', label: 'PLP Camping' },
      { key: 'plp', label: 'PLP Bike Racks' },
      { key: 'vplp', label: 'VPLP Roof Racks' },
      { key: 'brand', label: 'Brand Page — Thule', href: RRG_PROTO + 'brand/index.html?brand=thule' },
      { key: 'brands', label: 'Brands Hub' },
      { key: 'search-results', label: 'Search Results' },
    ] },
    { title: 'Review tools', items: [
      { key: 'header', label: 'Header &amp; Footer' },
      { key: 'components', label: 'Component Library' },
      { key: 'index', label: 'All templates (index)', href: RRG_PROTO + 'index.html' },
    ] },
  ];
  // Every developer brief (P3).
  const briefs = [
    { label: 'Product Pages (PDP)', href: 'docs/pdp/dev-brief-viewer.html' },
    { label: 'PLP / VPLP', href: 'docs/plp/plp-dev-brief-viewer.html' },
    { label: 'Search Results', href: 'docs/search-results/search-results-dev-brief-viewer.html' },
    { label: 'Vehicle Category Landing (VCLP)', href: 'docs/vehicle-category-landing/vclp-dev-brief-viewer.html' },
    { label: 'Header', href: 'docs/header/header-dev-brief-viewer.html' },
    { label: 'Footer', href: 'docs/footer/footer-dev-brief-viewer.html' },
  ];
  const templateHref = t => t.href || `${RRG_PROTO}${t.key}/index.html`;
  const hasDemoPanel = !!document.querySelector('.admin-fab');
  const current = templateGroups.flatMap(g => g.items).find(t => t.key === key);

  const panel = document.createElement('div');
  panel.className = 'site-admin-panel';
  panel.innerHTML = `
    <div class="site-admin-panel-head">
      <span>Site Admin <span class="site-admin-sub">— all pages</span></span>
      <button type="button" class="site-admin-close" aria-label="Close">&times;</button>
    </div>
    <div class="site-admin-body">
      <button type="button" class="site-admin-nav" aria-haspopup="true" aria-expanded="false" aria-controls="siteAdminFlyout">
        <span class="site-admin-nav-label">Pages &amp; briefs</span>
        <span class="site-admin-nav-current">${current ? current.label : ''}</span>
      </button>
      <div class="site-admin-heading">Shopper session</div>
      <label class="site-admin-toggle">
        <span>Logged in</span>
        <input type="checkbox" data-admin-flag="loggedIn">
      </label>
      <label class="site-admin-select">
        <span>Vehicle</span>
        <select data-admin-vehicle>
          <option value="none">None</option>
          <option value="hilux">Toyota Hilux</option>
          <option value="ranger">Ford Ranger</option>
        </select>
      </label>
      <label class="site-admin-toggle">
        <span>Nearest store set</span>
        <input type="checkbox" data-admin-flag="storeSet">
      </label>
      <label class="site-admin-select">
        <span>Demo cart</span>
        <select data-admin-cart>
          <option value="empty">Empty</option>
          <option value="accessories">Accessories (2 items)</option>
          <option value="full">Rack, bike rack, bundle + tank</option>
          <option value="custom" disabled>Your own items</option>
        </select>
      </label>
      <div class="site-admin-heading">Build phase</div>
      <div class="site-admin-segment">
        <label><input type="radio" name="rrgBuildPhase" value="1"><span>Phase 1 · launch</span></label>
        <label><input type="radio" name="rrgBuildPhase" value="2"><span>Phase 2 · future</span></label>
      </div>
      <p class="site-admin-note">Phase 2 adds store-level stock, product ribbons and Compare Products.</p>
      <div class="site-admin-heading">Promotions &amp; design</div>
      <label class="site-admin-select" title="Sale website takeover — colours, strip + countdown, sale tags, favicon. AU & NZ only.">
        <span>Sale takeover</span>
        <select data-admin-sale>
          <option value="">Off</option>
          ${typeof RRG_CAMPAIGNS === 'object' ? Object.values(RRG_CAMPAIGNS).map(c => `<option value="${c.id}">${c.title}</option>`).join('') : ''}
        </select>
      </label>
      <label class="site-admin-select" title="The merged vehicle bar + Fit Finder on Home and Fit My Vehicle">
        <span>Vehicle finder style</span>
        <select data-admin-vf-style>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      <label class="site-admin-toggle" title="Demo placeholders in the UK and NZ Store Finder">
        <span>"Opening soon" stores (UK/NZ)</span>
        <input type="checkbox" data-admin-coming-soon>
      </label>
      <div class="site-admin-heading">Prototype</div>
      ${hasDemoPanel ? `<label class="site-admin-toggle">
        <span>Show Demo State panel</span>
        <input type="checkbox" data-admin-flag="showDemoPanel">
      </label>` : ''}
      <button type="button" class="site-admin-reset" data-admin-reset>Reset all demo settings</button>
    </div>
  `;

  // The flyout is its own fixed element (not inside the panel) so the panel's scroll box can't
  // clip it.
  const flyout = document.createElement('div');
  flyout.className = 'site-admin-flyout';
  flyout.id = 'siteAdminFlyout';
  flyout.hidden = true;
  flyout.innerHTML = `
    <div class="site-admin-flyout-head">
      <button type="button" class="site-admin-flyout-back" aria-label="Back to Site Admin">&lsaquo; Back</button>
      <span>Pages &amp; briefs</span>
    </div>
    <div class="site-admin-flyout-cols">
      ${templateGroups.map(g => `<div class="site-admin-flyout-col">
        <div class="site-admin-heading">${g.title}</div>
        <div class="site-admin-links">
          ${g.items.map(t => `<a href="${templateHref(t)}" class="${t.key === key ? 'current' : ''}">${t.label}</a>`).join('')}
        </div>
      </div>`).join('')}
      <div class="site-admin-flyout-col">
        <div class="site-admin-heading">Developer briefs</div>
        <div class="site-admin-links">
          ${briefs.map(b => `<a href="${RRG_PROTO}../${b.href}" target="_blank" rel="noopener">${b.label}</a>`).join('')}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  document.body.appendChild(flyout);
  document.body.appendChild(fab);

  // Flyout: opens on hover (desktop) or click/Enter (everywhere). A click pins it open; leaving
  // an un-pinned flyout closes it after a short grace period so the pointer can cross the gap.
  const navBtn = panel.querySelector('.site-admin-nav');
  const canHover = window.matchMedia('(hover: hover) and (min-width: 901px)');
  let pinned = false;
  let closeTimer = null;
  const placeFlyout = () => {
    if (!canHover.matches) { flyout.style.top = ''; return; }
    const top = navBtn.getBoundingClientRect().top;
    flyout.style.top = Math.max(12, Math.min(top, window.innerHeight - flyout.offsetHeight - 12)) + 'px';
  };
  const openFlyout = (pin) => {
    clearTimeout(closeTimer);
    if (pin) pinned = true;
    flyout.hidden = false;
    navBtn.setAttribute('aria-expanded', 'true');
    placeFlyout();
  };
  const closeFlyout = () => {
    clearTimeout(closeTimer);
    pinned = false;
    flyout.hidden = true;
    navBtn.setAttribute('aria-expanded', 'false');
  };
  const scheduleClose = () => {
    if (pinned || !canHover.matches) return;
    clearTimeout(closeTimer);
    closeTimer = setTimeout(closeFlyout, 250);
  };
  navBtn.addEventListener('click', () => {
    if (!flyout.hidden && pinned) { closeFlyout(); return; }
    openFlyout(true);
    if (!canHover.matches) flyout.querySelector('.site-admin-flyout-back').focus();
  });
  navBtn.addEventListener('mouseenter', () => { if (canHover.matches) openFlyout(false); });
  navBtn.addEventListener('mouseleave', scheduleClose);
  flyout.addEventListener('mouseenter', () => clearTimeout(closeTimer));
  flyout.addEventListener('mouseleave', scheduleClose);
  flyout.querySelector('.site-admin-flyout-back').addEventListener('click', () => { closeFlyout(); navBtn.focus(); });
  flyout.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || flyout.hidden) return;
    closeFlyout();
    navBtn.focus();
  });
  window.addEventListener('resize', () => { if (!flyout.hidden) placeFlyout(); });

  const closePanel = () => { closeFlyout(); panel.classList.remove('open'); };
  fab.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.add('open'); });
  panel.querySelector('.site-admin-close').addEventListener('click', closePanel);
  panel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', closePanel);

  // Sale takeover state lives in campaign.js (rrgSaleId / rrgSetSale, which reloads the page) —
  // this panel just reflects and sets it.
  const saleSelect = panel.querySelector('[data-admin-sale]');
  saleSelect.value = typeof rrgSaleId === 'function' ? rrgSaleId() : '';
  saleSelect.addEventListener('change', () => {
    if (window.rrgSetSale) window.rrgSetSale(saleSelect.value);
  });

  // Session state lives in session-state.js — this panel reflects and sets it.
  ['loggedIn', 'storeSet'].forEach(field => {
    const toggle = panel.querySelector(`[data-admin-flag="${field}"]`);
    toggle.checked = rrgSessionGet(field);
    toggle.addEventListener('change', () => { if (window.rrgSetSession) window.rrgSetSession(field, toggle.checked); });
  });
  const vehicleSelect = panel.querySelector('[data-admin-vehicle]');
  vehicleSelect.value = rrgVehicleGet();
  vehicleSelect.addEventListener('change', () => { if (window.rrgSetVehicle) window.rrgSetVehicle(vehicleSelect.value); });

  // Demo cart (cart.js) — load a preset to review the cart, checkout and confirmation pages.
  const cartSelect = panel.querySelector('[data-admin-cart]');
  const syncCartSelect = () => { if (typeof rrgCartPresetName === 'function') cartSelect.value = rrgCartPresetName(); };
  syncCartSelect();
  cartSelect.addEventListener('change', () => { if (typeof rrgCartLoadPreset === 'function') rrgCartLoadPreset(cartSelect.value); });
  document.addEventListener('rrg-cart-change', syncCartSelect);

  // Vehicle finder style (shared.js rrgVehicleFinderStyle / rrgSetVehicleFinderStyle).
  const vfStyleSelect = panel.querySelector('[data-admin-vf-style]');
  vfStyleSelect.value = typeof rrgVehicleFinderStyle === 'function' ? rrgVehicleFinderStyle() : 'light';
  vfStyleSelect.addEventListener('change', () => { if (window.rrgSetVehicleFinderStyle) window.rrgSetVehicleFinderStyle(vfStyleSelect.value); });

  const comingSoonToggle = panel.querySelector('[data-admin-coming-soon]');
  comingSoonToggle.checked = typeof rrgShowComingSoon === 'function' ? rrgShowComingSoon() : true;
  comingSoonToggle.addEventListener('change', () => { if (window.rrgSetShowComingSoon) window.rrgSetShowComingSoon(comingSoonToggle.checked); });

  // Build phase (session-state.js rrgPhaseGet/rrgSetPhase).
  panel.querySelectorAll('input[name="rrgBuildPhase"]').forEach(radio => {
    radio.checked = Number(radio.value) === (typeof rrgPhaseGet === 'function' ? rrgPhaseGet() : 1);
    radio.addEventListener('change', () => {
      if (radio.checked && window.rrgSetPhase) window.rrgSetPhase(Number(radio.value));
    });
  });

  // Show/hide the Demo State Panel's button (only offered on pages that have one).
  const demoPanelToggle = panel.querySelector('[data-admin-flag="showDemoPanel"]');
  if (demoPanelToggle) {
    const applyDemoPanelVisibility = (show) => {
      const demoFab = document.querySelector('.admin-fab');
      if (demoFab) demoFab.hidden = !show;
      const demoPanel = document.querySelector('.admin-panel');
      if (demoPanel && !show) demoPanel.classList.remove('open');
    };
    const storedPref = localStorage.getItem(DEMO_PANEL_PREF_KEY);
    demoPanelToggle.checked = storedPref === null ? true : storedPref === 'true';
    applyDemoPanelVisibility(demoPanelToggle.checked);
    demoPanelToggle.addEventListener('change', () => {
      localStorage.setItem(DEMO_PANEL_PREF_KEY, demoPanelToggle.checked);
      applyDemoPanelVisibility(demoPanelToggle.checked);
    });
  }


  document.addEventListener('rrg-session-change', () => {
    ['loggedIn', 'storeSet'].forEach(f => { panel.querySelector(`[data-admin-flag="${f}"]`).checked = rrgSessionGet(f); });
    vehicleSelect.value = rrgVehicleGet();
  });

  // Reset (P10): clears every saved prototype setting — session, phase, promotions and each
  // template's Demo State choices — back to the defaults, then reloads.
  panel.querySelector('[data-admin-reset]').addEventListener('click', () => {
    if (!window.confirm('Reset every demo setting on every template back to its default?')) return;
    Object.keys(localStorage).filter(k => /^rrg/.test(k)).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  });
}
