// Site Admin Panel — new, separate from the PDP templates' existing Demo State Panel
// (buildAdminPanel() in shared.js). Houses the Template Switcher and Dev Brief links moved
// out of the main nav (header-spec.md Section 5/6), plus a toggle that shows/hides the
// Demo State Panel's own FAB wherever it exists (inert on this header-only prototype,
// ready for when both panels coexist on a PDP template post-integration).
//
// `currentKey` identifies which nav item to mark "current" in the Template Switcher list —
// pass 'header' from the isolated header prototype, or the template's own key ('simple',
// 'config-variant', etc.) once integrated.
function buildSiteAdminPanel(currentKey) {
  const DEMO_PANEL_PREF_KEY = 'rrgShowDemoStatePanel';

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'site-admin-fab';
  fab.setAttribute('aria-label', 'Open site admin panel');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg> Site Admin';

  // PDP prototypes only (2026-09-17, per Brenton) — Mark's dev focus is the PDP templates
  // right now, so the standalone header build's own entry was removed here (it's still
  // reachable directly, just no longer advertised in this panel) to stop it reading as
  // in-scope work alongside the PDP templates.
  const templates = [
    { key: 'simple', label: 'Simple', href: '../simple/index.html' },
    { key: 'config-variant', label: 'Config-Variant', href: '../config-variant/index.html' },
    { key: 'sibling-color', label: 'Sibling-Color', href: '../sibling-color/index.html' },
    { key: 'vehicle-specific', label: 'Vehicle-Specific', href: '../vehicle-specific/index.html' },
    { key: 'grouped-bundle', label: 'Grouped/Bundle', href: '../grouped-bundle/index.html' },
  ];

  const panel = document.createElement('div');
  panel.className = 'site-admin-panel';
  panel.innerHTML = `
    <div class="site-admin-panel-head">
      <span>Site Admin</span>
      <button type="button" class="site-admin-close" aria-label="Close">&times;</button>
    </div>
    <div class="site-admin-body">
      <div class="site-admin-section">
        <h5>Prototype Templates</h5>
        <div class="site-admin-links">
          ${templates.map(t => `<a href="${t.href}" class="${t.key === currentKey ? 'current' : ''}">${t.label}</a>`).join('')}
        </div>
      </div>
      <div class="site-admin-section">
        <h5>Developer Briefs</h5>
        <div class="site-admin-links">
          <!-- PDP only (2026-09-17, per Brenton) — Header/Footer/VLP dev briefs pulled out of
               this panel so Mark isn't shown background work alongside his current PDP focus. -->
          <a href="../../docs/pdp/dev-brief-viewer.html" target="_blank" rel="noopener">PDP Developer Brief</a>
        </div>
      </div>
      <div class="site-admin-section">
        <h5>Header Promotions</h5>
        <label class="site-admin-toggle">
          <span>Clearance Sale Banner</span>
          <input type="checkbox" data-admin-flag="saleBannerOn">
        </label>
      </div>
      <div class="site-admin-section">
        <h5>Session State</h5>
        <label class="site-admin-toggle">
          <span>Logged In</span>
          <input type="checkbox" data-admin-flag="loggedIn">
        </label>
        <label class="site-admin-toggle">
          <span>Vehicle Set</span>
          <input type="checkbox" data-admin-flag="vehicleSet">
        </label>
        <label class="site-admin-toggle">
          <span>Nearest Store Set</span>
          <input type="checkbox" data-admin-flag="storeSet">
        </label>
      </div>
      <div class="site-admin-section">
        <h5>Demo State Panel</h5>
        <label class="site-admin-toggle">
          <span>Show Demo State Panel</span>
          <input type="checkbox" data-admin-flag="showDemoPanel">
        </label>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  document.body.appendChild(fab);

  fab.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.add('open'); });
  panel.querySelector('.site-admin-close').addEventListener('click', () => panel.classList.remove('open'));
  panel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => panel.classList.remove('open'));

  // Mobile trigger — the FAB is hidden below 900px (same crowded-viewport reasoning as the
  // Demo State Panel's own FAB in shared.js). The utility bar's "Your Nearest Store" link
  // doubles as a mobile trigger (data-admin-trigger), but only for whichever panel actually
  // needs one: on a real PDP template, shared.js's buildAdminPanel() already binds that same
  // link to open the Demo State Panel, so binding it here too would open both panels on one
  // tap. This page (the isolated header prototype) has no Demo State Panel to conflict with,
  // so it's the only place this trigger ends up controlling Site Admin instead.
  const adminTrigger = document.querySelector('[data-admin-trigger]');
  if (adminTrigger && !document.querySelector('.admin-fab')) {
    adminTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      panel.classList.add('open');
    });
  }

  // Sale banner state itself lives in mega-menu.js (rrgSetSaleBannerOn/localStorage) since
  // that's what actually renders it, on both the desktop drawer and mobile drill-down — this
  // panel just reflects and toggles it, same separation as the Demo Panel toggle below.
  const SALE_BANNER_KEY = 'rrgSaleBannerOn';
  const saleBannerToggle = panel.querySelector('[data-admin-flag="saleBannerOn"]');
  const storedSale = localStorage.getItem(SALE_BANNER_KEY);
  saleBannerToggle.checked = storedSale === null ? true : storedSale === 'true';
  saleBannerToggle.addEventListener('change', () => {
    if (window.rrgSetSaleBannerOn) window.rrgSetSaleBannerOn(saleBannerToggle.checked);
  });

  // Session state (logged in / vehicle set / nearest store set) lives in session-state.js
  // (rrgSessionGet/rrgSetSession/localStorage) — same separation as the sale banner toggle
  // above, this panel just reflects and toggles it.
  ['loggedIn', 'vehicleSet', 'storeSet'].forEach(field => {
    const toggle = panel.querySelector(`[data-admin-flag="${field}"]`);
    if (!toggle) return;
    toggle.checked = rrgSessionGet(field);
    toggle.addEventListener('change', () => {
      if (window.rrgSetSession) window.rrgSetSession(field, toggle.checked);
    });
  });

  const demoPanelToggle = panel.querySelector('[data-admin-flag="showDemoPanel"]');
  const applyDemoPanelVisibility = (show) => {
    const demoFab = document.querySelector('.admin-fab');
    if (demoFab) demoFab.hidden = !show;
    const demoPanel = document.querySelector('.admin-panel');
    if (demoPanel && !show) demoPanel.classList.remove('open');
  };
  const storedPref = localStorage.getItem(DEMO_PANEL_PREF_KEY);
  const initialShow = storedPref === null ? true : storedPref === 'true';
  demoPanelToggle.checked = initialShow;
  applyDemoPanelVisibility(initialShow);
  demoPanelToggle.addEventListener('change', () => {
    localStorage.setItem(DEMO_PANEL_PREF_KEY, demoPanelToggle.checked);
    applyDemoPanelVisibility(demoPanelToggle.checked);
  });
}
