// Site Admin Panel — GLOBAL prototype state only (rebuilt 2026-09-29, spec.md §15 P2–P11):
// every template and developer brief, the shopper session (logged in / vehicle / nearest store),
// the build phase, site promotions, and prototype tools. Anything that only applies to the page
// you're on lives in the Demo State Panel instead (buildAdminPanel() in shared.js).
//
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

  // Every template, grouped the way the template index groups them (P2 — reverses the
  // 2026-09-17 PDP-only trim).
  const templateGroups = [
    { title: 'Product pages', items: [
      { key: 'simple', label: 'Simple' },
      { key: 'config-variant', label: 'Config-Variant' },
      { key: 'sibling-color', label: 'Sibling-Colour' },
      { key: 'vehicle-specific', label: 'Vehicle-Specific' },
      { key: 'grouped-bundle', label: 'Grouped/Bundle' },
    ] },
    { title: 'Category &amp; listing', items: [
      { key: 'vehicle-category-landing', label: 'Vehicle Landing (VCLP)' },
      { key: 'plp', label: 'PLP — Bike Racks' },
      { key: 'plp-camping', label: 'PLP — Camping' },
      { key: 'vplp', label: 'VPLP — Roof Racks' },
    ] },
    { title: 'Other', items: [
      { key: 'search-results', label: 'Search Results' },
      { key: 'header', label: 'Header (standalone)' },
      { key: 'index', label: 'All templates', href: RRG_PROTO + 'index.html' },
    ] },
  ];
  // Every developer brief (P3).
  const briefs = [
    { label: 'Product Pages (PDP)', href: 'docs/pdp/dev-brief-viewer.html' },
    { label: 'PLP / VPLP', href: 'docs/plp/plp-dev-brief-viewer.html' },
    { label: 'Search Results', href: 'docs/search-results/search-results-dev-brief-viewer.html' },
    { label: 'Vehicle Landing (VCLP)', href: 'docs/vehicle-category-landing/vclp-dev-brief-viewer.html' },
    { label: 'Header', href: 'docs/header/header-dev-brief-viewer.html' },
    { label: 'Footer', href: 'docs/footer/footer-dev-brief-viewer.html' },
  ];
  const templateHref = t => t.href || `${RRG_PROTO}${t.key}/index.html`;
  const hasDemoPanel = !!document.querySelector('.admin-fab');

  const panel = document.createElement('div');
  panel.className = 'site-admin-panel';
  panel.innerHTML = `
    <div class="site-admin-panel-head">
      <span>Site Admin <span class="site-admin-sub">— all pages</span></span>
      <button type="button" class="site-admin-close" aria-label="Close">&times;</button>
    </div>
    <div class="site-admin-body">
      <div class="site-admin-section">
        <h5>Templates</h5>
        ${templateGroups.map(g => `
          <div class="site-admin-group">${g.title}</div>
          <div class="site-admin-links">
            ${g.items.map(t => `<a href="${templateHref(t)}" class="${t.key === key ? 'current' : ''}">${t.label}</a>`).join('')}
          </div>`).join('')}
      </div>
      <div class="site-admin-section">
        <h5>Developer Briefs</h5>
        <div class="site-admin-links">
          ${briefs.map(b => `<a href="${RRG_PROTO}../${b.href}" target="_blank" rel="noopener">${b.label}</a>`).join('')}
        </div>
      </div>
      <div class="site-admin-section">
        <h5>Shopper Session</h5>
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
      </div>
      <div class="site-admin-section">
        <h5>Build Phase</h5>
        <div class="site-admin-radios">
          <label><input type="radio" name="rrgBuildPhase" value="1"> Phase 1 — launch build</label>
          <label><input type="radio" name="rrgBuildPhase" value="2"> Phase 2 — future features</label>
        </div>
        <p class="site-admin-note">Phase 2 adds store-level stock, product ribbons and Compare Products.</p>
      </div>
      <div class="site-admin-section">
        <h5>Site Promotions</h5>
        <label class="site-admin-toggle">
          <span>Clearance sale banner</span>
          <input type="checkbox" data-admin-flag="saleBannerOn">
        </label>
      </div>
      <div class="site-admin-section">
        <h5>Prototype Tools</h5>
        ${hasDemoPanel ? `<label class="site-admin-toggle">
          <span>Show Demo State panel</span>
          <input type="checkbox" data-admin-flag="showDemoPanel">
        </label>` : ''}
        <button type="button" class="site-admin-reset" data-admin-reset>Reset all demo settings</button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  document.body.appendChild(fab);

  fab.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.add('open'); });
  panel.querySelector('.site-admin-close').addEventListener('click', () => panel.classList.remove('open'));
  panel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => panel.classList.remove('open'));

  // Sale banner state lives in mega-menu.js (rrgSetSaleBannerOn/localStorage) since that's what
  // renders it — this panel just reflects and toggles it.
  const SALE_BANNER_KEY = 'rrgSaleBannerOn';
  const saleBannerToggle = panel.querySelector('[data-admin-flag="saleBannerOn"]');
  const storedSale = localStorage.getItem(SALE_BANNER_KEY);
  saleBannerToggle.checked = storedSale === null ? true : storedSale === 'true';
  saleBannerToggle.addEventListener('change', () => {
    if (window.rrgSetSaleBannerOn) window.rrgSetSaleBannerOn(saleBannerToggle.checked);
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

  // Reset (P10): clears every saved prototype setting — session, phase, promotions and each
  // template's Demo State choices — back to the defaults, then reloads.
  panel.querySelector('[data-admin-reset]').addEventListener('click', () => {
    if (!window.confirm('Reset every demo setting on every template back to its default?')) return;
    Object.keys(localStorage).filter(k => /^rrg/.test(k)).forEach(k => localStorage.removeItem(k));
    window.location.reload();
  });
}
