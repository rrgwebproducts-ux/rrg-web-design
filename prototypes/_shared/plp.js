// Roof Racks Galore — PLP / VPLP shared engine (docs/plp/plp-spec.md)
// Loaded only by prototypes/plp/ and prototypes/vplp/, alongside shared.js/mega-menu.js/
// admin-panel.js/session-state.js — mirrors those pages' header/footer/session-state exactly
// (see plp-spec.md Section 0), but everything in this file is new: neither the 5 PDP
// templates nor the Vehicle Category Landing Page have a filterable listing grid.
//
// Each page defines its own data as `window.PLP_CONFIG` (same convention as the PDP
// templates' own inline VEHICLE_PRODUCT/FIT_GALLERY_PHOTOS blocks) — this file is the one
// generic engine both templates run against. See plp-spec.md Section 13: not a separate
// template per category, one engine + per-page config.

const PLP_PAGE_SIZE = 12;

// ---- Facet matching -------------------------------------------------------
// Two comparison modes: 'eq' (exact match — colour, brand, vehicle fit type, plank
// direction, bar profile, platform style) and 'atleast' (the demo's real-world shorthand for
// "this option's requirement is satisfied by anything at or above it" — a bike rack rated
// for 4 bikes also satisfies a "I need to carry 2" filter, a 100kg-rated rack also satisfies
// a 75kg requirement). Config-driven per plp-spec.md Section 6's "real configurable
// structure, not a hardcoded one-off list" instruction.
function plpValueMatches(product, facetKey, facetDef, selectedValue) {
  // 'range' (search-results Price filter, docs/search-results/search-results-spec.md Section
  // 4) compares product.price directly rather than a product.facets[] entry — the only facet
  // mode that reads off the product itself instead of its facets map, since price already
  // exists as a top-level field everywhere (plpPriceHTML) and duplicating it into facets would
  // just be a second source of truth to keep in sync.
  if (facetDef.mode === 'range') {
    const [min, max] = String(selectedValue).split('-').map(Number);
    const price = product.price || 0;
    return price >= min && (Number.isNaN(max) ? true : price <= max);
  }
  const v = (product.facets || {})[facetKey];
  if (v === undefined) return false;
  if (facetDef.mode === 'atleast') return Number(v) >= Number(selectedValue);
  return String(v) === String(selectedValue);
}

// activeSubsubcat: nav-depth Level 3 (2026-09-18 design review item 39/40 — icon cards inside
// the results grid, under a Level 2 tab that has `children`). Kept separate from activeSubcat
// rather than folded into it, since Level 2 tabs must stay persistent/highlighted regardless
// of which (if any) Level 3 card is selected under them — see plpRenderShopBy(), which only
// ever reads activeSubcat.
function plpMatchesShopBy(product, activeSubcat, activeSubsubcat) {
  if (activeSubcat && activeSubcat !== 'all' && !(product.subcategories || []).includes(activeSubcat)) return false;
  if (activeSubsubcat && !(product.subcategories || []).includes(activeSubsubcat)) return false;
  return true;
}

function plpMatchesFiltersExcept(product, activeFilters, exceptFacetKey, activeSubcat, activeSubsubcat) {
  if (!plpMatchesShopBy(product, activeSubcat, activeSubsubcat)) return false;
  // Search-results page only (cfg.isSearch) — gated here, the single choke point both
  // plpFilteredSortedProducts() and every filter option's live count (plpFilterGroupHTML) run
  // through, so a query like "roof rack" narrows the product pool BEFORE facet counts are
  // computed, not just the final grid. Doing this in plpFilteredSortedProducts alone would have
  // left the sidebar showing counts against the whole catalogue instead of the search matches.
  const cfg = window.PLP_CONFIG;
  if (cfg && cfg.isSearch && !plpSearchQueryMatches(product, plpState.searchQuery)) return false;
  return Object.keys(activeFilters).every(facetKey => {
    if (facetKey === exceptFacetKey) return true;
    const selected = activeFilters[facetKey];
    if (!selected || !selected.size) return true;
    const facetDef = plpFacetDefByKey(facetKey);
    return [...selected].some(val => plpValueMatches(product, facetKey, facetDef, val));
  });
}

function plpFacetDefByKey(key) {
  const cfg = window.PLP_CONFIG;
  const all = [...cfg.facets.priority, ...cfg.facets.standard];
  return all.find(f => f.key === key) || {};
}

// ---- State ------------------------------------------------------------
const plpState = {
  activeSubcat: 'all',
  activeSubsubcat: null, // nav-depth Level 3 (2026-09-18 review item 39/40) — see plpMatchesShopBy()
  activeFilters: {},     // { facetKey: Set(values) }
  view: 'grid',          // 'grid' | 'list' — reset from PLP_CONFIG.defaultView on init
  searchQuery: '',       // search-results page only, from PLP_CONFIG.initialQuery on init
  gridCols: 3,           // 3 | 4 — Demo State Panel test toggle, grid view only, desktop only (see plp.css). 3 is the default (2026-09-18, Brenton signed off), 4 kept as the fallback option.
  sort: 'relevance',
  page: 1,               // desktop numbered pagination
  visibleCount: PLP_PAGE_SIZE, // mobile "show more" cumulative count
  compareEnabled: false, // Demo State Panel toggle, off by default (spec Section 12)
  compareSelected: []    // up to 2 product ids
};

function plpFilteredSortedProducts() {
  const cfg = window.PLP_CONFIG;
  let list = cfg.products.filter(p => plpMatchesFiltersExcept(p, plpState.activeFilters, null, plpState.activeSubcat, plpState.activeSubsubcat));
  const sorters = {
    relevance: (a, b) => (b.relevanceRank || 0) - (a.relevanceRank || 0),
    price_low: (a, b) => a.price - b.price,
    price_high: (a, b) => b.price - a.price,
    newest: (a, b) => (b.newnessRank || 0) - (a.newnessRank || 0),
    bestselling: (a, b) => (b.salesRank || 0) - (a.salesRank || 0),
    rating: (a, b) => b.rating - a.rating
  };
  list = list.slice().sort(sorters[plpState.sort] || sorters.relevance);
  return list;
}

// ==== SHOP BY row ============================================================
// Real build: each tile is its own fixed URL (plp-spec.md Section 5) — this demo simulates
// that navigation in-page (reset filters/paging, swap the result set) rather than an
// AJAX in-place filter, since there's no second real page to link to. "Show All" is always
// the first tile in the row itself (not a separate link above it) so the whole row reads as
// one tab strip with a permanent "all" tab, per the Figma reference.
function plpSelectSubcat(key) {
  plpState.activeSubcat = key;
  plpState.activeSubsubcat = null;
  plpState.activeFilters = {};
  plpState.page = 1;
  plpState.visibleCount = PLP_PAGE_SIZE;
  plpRenderShopBy();
  plpRenderFilters();
  plpRenderResults();
  plpRenderFAQ();
  plpRenderCategoryContent();
}

// Level 3 icon-card selection — toggles (click again to clear), leaves the Level 2 tab row
// untouched (see plpMatchesShopBy()'s comment on why activeSubsubcat is a separate field).
function plpSelectSubsubcat(key) {
  plpState.activeSubsubcat = plpState.activeSubsubcat === key ? null : key;
  plpState.page = 1;
  plpState.visibleCount = PLP_PAGE_SIZE;
  plpRenderResults();
  plpRenderFAQ();
  plpRenderCategoryContent();
}

// ==== Category content (heading/description/hero image/breadcrumb), 2026-09-21 =============
// Each SHOP BY tab is its own real URL in production (see plpRenderShopBy()'s comment) — so
// switching Level 2/3 tabs needs to change everything a real category page navigation would
// change, not just re-filter the results grid. Level 2/3 entries in PLP_CONFIG.shopBy/children
// can each carry heading/description/breadcrumbLabel/heroImage; PLP_CONFIG.categoryRoot holds
// the same fields for the "Show All" / no-tab-selected state. Falls back up the chain (L3 → L2
// → categoryRoot) for any field a given tab doesn't override.
function plpActiveTabChain() {
  const cfg = window.PLP_CONFIG;
  const l2 = plpState.activeSubcat && plpState.activeSubcat !== 'all'
    ? (cfg.shopBy || []).find(t => t.key === plpState.activeSubcat)
    : null;
  const l3 = l2 && l2.children ? l2.children.find(c => c.key === plpState.activeSubsubcat) : null;
  return { l2, l3 };
}

function plpActiveCategoryImage() {
  const cfg = window.PLP_CONFIG;
  const { l2, l3 } = plpActiveTabChain();
  return (l3 && l3.heroImage) || (l2 && l2.heroImage) || (cfg.categoryRoot && cfg.categoryRoot.heroImage) || cfg.categoryImage || null;
}

// Breadcrumb trail, fully rebuilt on every tab change (real build: a distinct URL per tile
// carries its own breadcrumb; this demo rebuilds the one crumb element in-page instead).
// cfg.breadcrumbRoot holds the page's own fixed leading segments (just "Home" for a standard
// category page; the full vehicle path for a VRS page like vplp, since a VRS category is
// always scoped to the vehicle first — see vplp's own PLP_CONFIG comment). categoryRoot and any
// selected Level 2/3 tab are appended after that as the dynamic, tab-driven segments.
function plpRenderBreadcrumb() {
  const cfg = window.PLP_CONFIG;
  const trail = document.getElementById('plpCrumbTrail');
  if (!trail) return;
  const { l2, l3 } = plpActiveTabChain();
  const segments = [
    ...(cfg.breadcrumbRoot || [{ label: 'Home' }]),
    { label: (cfg.categoryRoot && cfg.categoryRoot.breadcrumbLabel) || cfg.categoryKey },
    ...(l2 ? [{ label: l2.breadcrumbLabel || l2.label }] : []),
    ...(l3 ? [{ label: l3.breadcrumbLabel || l3.label }] : [])
  ];
  trail.innerHTML = segments.map((seg, i) => {
    const isLast = i === segments.length - 1;
    const sep = i > 0 ? ' &gt; ' : '';
    return sep + (isLast ? `<span id="plpCrumbLast">${seg.label}</span>` : `<a href="#">${seg.label}</a>`);
  }).join('');
}

// Heading/description swap across both hero states — cfg.vehicleHeadingSuffix is the page's
// own fixed "for your Toyota Hilux" (or full vehicle-spec, for vplp) phrase appended to the
// Vehicle-Set state's H1 only; the Simple state's H1 is the bare category heading.
function plpRenderCategoryContent() {
  const cfg = window.PLP_CONFIG;
  if (!cfg.categoryRoot) return;
  const { l2, l3 } = plpActiveTabChain();
  const active = l3 || l2 || cfg.categoryRoot;
  const heading = active.heading || active.label || cfg.categoryRoot.heading;
  const description = active.description || cfg.categoryRoot.description;
  const suffix = cfg.vehicleHeadingSuffix ? ` ${cfg.vehicleHeadingSuffix}` : '';
  const setH1 = document.querySelector('#plpHeroVehicleSet h1');
  const simpleH1 = document.querySelector('#plpHeroSimple h1');
  if (setH1) setH1.textContent = heading + suffix;
  if (simpleH1) simpleH1.textContent = heading;
  document.querySelectorAll('#plpHeroVehicleSet > div > p, #plpHeroSimple > div > p').forEach(p => { p.textContent = description; });
  plpRenderBreadcrumb();
  plpApplyCategoryImage();
}

// Simple (no-vehicle) hero's image follows the same vehicle → category → none fallback as the
// Vehicle-Set hero's Demo State Panel preview (see applyPlpHeroImageFlag()) — no vehicle photo
// applies here (there's no vehicle), so it's just category → none.
function plpApplyCategoryImage() {
  const heroSimple = document.getElementById('plpHeroSimple');
  if (heroSimple) {
    const img = plpActiveCategoryImage();
    const mediaWrap = heroSimple.querySelector('.plp-hero-media');
    const imgEl = mediaWrap ? mediaWrap.querySelector('img') : null;
    heroSimple.classList.toggle('no-media', !img);
    if (mediaWrap) mediaWrap.hidden = !img;
    if (imgEl && img) imgEl.src = img;
  }
  // Re-apply the Vehicle-Set hero's own image only if the Demo State Panel is currently
  // previewing the "category" state — "vehicle" mode is untouched by tab changes.
  if (plpState.heroImageMode === 'category') applyPlpHeroImageFlag('category');
}

const PLP_SHOWALL_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`;

function plpRenderShopBy() {
  const cfg = window.PLP_CONFIG;
  const track = document.getElementById('plpShopByTrack');
  if (!track) return;
  const tiles = [{ key: 'all', label: 'Show All', icon: cfg.shopByAllIcon || PLP_SHOWALL_ICON }, ...cfg.shopBy];
  track.innerHTML = tiles.map(t => `
    <button type="button" class="plp-shopby-tile ${plpState.activeSubcat === t.key ? 'active' : ''}" data-shopby="${t.key}">
      <span class="plp-shopby-icon">${t.icon}</span>
      <span class="plp-shopby-label">${t.label}</span>
    </button>
  `).join('');
  track.querySelectorAll('[data-shopby]').forEach(btn => {
    btn.addEventListener('click', () => plpSelectSubcat(btn.dataset.shopby));
  });
}

// Level 3 icon card — reuses .plp-shopby-icon/.plp-shopby-label so the icon renders at the
// same size as the Level 2 tabs (spec: "explicitly not shrunk"), inside a .plp-icon-card
// wrapper sized like a product card instead of a tab. `count` is only passed on the search
// page (see call site below) — on plain PLP/plp-camping this is pure category navigation with
// a fixed catalogue, so a result count doesn't apply there; on search it's filtering a
// query-matched pool, same as the tabs above it and the sidebar's Category facet, so it gets
// the same "(N)" treatment for consistency (Brenton, 2026-09-22).
function plpIconCardHTML(child, count) {
  const active = plpState.activeSubsubcat === child.key ? ' active' : '';
  const countStr = count === undefined ? '' : ` (${count})`;
  return `
    <button type="button" class="plp-icon-card${active}" data-subsubcat="${child.key}">
      <span class="plp-shopby-icon">${child.icon}</span>
      <span class="plp-shopby-label">${child.label}${countStr}</span>
    </button>
  `;
}

// ==== Search results page (new template, docs/search-results/search-results-spec.md) =========
// Only loaded/exercised by prototypes/search-results/ (cfg.isSearch) — every other PLP-family
// page leaves cfg.isSearch undefined, so plpMatchesFiltersExcept's gate above and every
// function below are no-ops for plp/vplp/plp-camping. Category quick-tabs (spec Section 3) and
// the inline search box (Section 2) replace SHOP BY + hero for this page type; the quick-tabs
// are just a second UI surface onto the same `category` standard facet as the sidebar filter
// (plpSelectSearchCategory), not a parallel selection mechanism, so they can't drift out of
// sync with each other.
function plpSearchQueryMatches(product, query) {
  if (!query) return true;
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = `${product.name} ${product.brand} ${(product.searchCategory && product.searchCategory.label) || ''} ${(product.searchKeywords || []).join(' ')}`.toLowerCase();
  return words.every(w => haystack.includes(w));
}

function plpRenderSearchTabs() {
  const cfg = window.PLP_CONFIG;
  const track = document.getElementById('plpSearchTabsTrack');
  if (!track) return;
  const queryMatched = cfg.products.filter(p => plpSearchQueryMatches(p, plpState.searchQuery));
  const activeCategory = plpState.activeFilters.category ? [...plpState.activeFilters.category][0] : null;
  const categories = cfg.searchCategories || [];
  const countFor = key => queryMatched.filter(p => !key || (p.searchCategory && p.searchCategory.key === key)).length;
  const tiles = [{ key: '', label: 'All', icon: cfg.shopByAllIcon || PLP_SHOWALL_ICON }, ...categories];
  track.innerHTML = tiles.map(t => `
    <button type="button" class="plp-shopby-tile ${(!activeCategory && !t.key) || activeCategory === t.key ? 'active' : ''}" data-search-cat="${t.key}">
      ${t.icon ? `<span class="plp-shopby-icon">${t.icon}</span>` : ''}
      <span class="plp-shopby-label">${t.label} (${countFor(t.key)})</span>
    </button>
  `).join('');
  track.querySelectorAll('[data-search-cat]').forEach(btn => {
    btn.addEventListener('click', () => plpSelectSearchCategory(btn.dataset.searchCat));
  });
}

// Sets/clears the same `category` facet the sidebar's Category filter reads — see the module
// comment above. Full filter reset would be too aggressive (Brand/Price selections a shopper
// already made are still meaningful within one category), so only the category facet changes.
// Level 3/4 icon cards for a search category (spec's nav-depth pattern, same as
// plp-camping's Level 3 children) — only meaningful once the shopper has narrowed to exactly
// one category via plpSelectSearchCategory/the sidebar Category filter, mirroring PLP's own
// rule that Level 3 only shows within one active Level 2 tab. Reuses plpIconCardHTML() and
// plpState.activeSubsubcat/plpMatchesShopBy() completely unchanged — a search product's
// `subcategories` array is keyed exactly like a PLP product's, so the existing Level-3
// filtering logic needs no engine change at all, just this one lookup to find which
// searchCategories entry (if any) is the single active one.
function plpActiveSearchCategoryEntry() {
  const cfg = window.PLP_CONFIG;
  const activeKey = plpState.activeFilters.category && plpState.activeFilters.category.size === 1 ? [...plpState.activeFilters.category][0] : null;
  return activeKey ? (cfg.searchCategories || []).find(c => c.key === activeKey) : null;
}

function plpSelectSearchCategory(key) {
  if (!key) delete plpState.activeFilters.category;
  else plpState.activeFilters.category = new Set([key]);
  plpState.activeSubsubcat = null; // a Level 3 selection from the previous category no longer applies
  plpState.page = 1;
  plpState.visibleCount = PLP_PAGE_SIZE;
  plpRenderSearchTabs();
  plpRenderFilters();
  plpRenderResults();
}

// Inline, resubmittable search box (spec Section 2) — a new query intentionally clears active
// filters (a Brand/Category selection from the old query's result set may not even exist in
// the new one) but leaves sort/view alone.
function plpInitSearchBar() {
  const form = document.getElementById('plpSearchForm');
  const input = document.getElementById('plpSearchInput');
  if (input) input.value = plpState.searchQuery;
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    plpState.searchQuery = (input.value || '').trim();
    plpState.activeFilters = {};
    plpState.page = 1;
    plpState.visibleCount = PLP_PAGE_SIZE;
    plpRenderSearchTabs();
    plpRenderFilters();
    plpRenderResults();
  });
}

// Zero-results state (spec Section 5) — doesn't exist anywhere else in the PLP family (every
// category prototype has products by construction); replaces the grid entirely rather than
// just swapping in a "no products match" line the way an over-filtered category page does.
function plpZeroResultsHTML() {
  const cfg = window.PLP_CONFIG;
  const cats = cfg.popularCategories || [];
  const featured = cfg.featuredForEmpty || cfg.products.slice(0, 4);
  return `
    <div class="plp-search-empty">
      <h2>No results for &quot;${plpState.searchQuery}&quot;</h2>
      <p>Check your spelling, try fewer words, or a more general term.</p>
      ${cats.length ? `
        <h3 class="plp-search-empty-subheading">Popular Categories</h3>
        <div class="plp-search-empty-cats">
          ${cats.map(c => `<a class="plp-search-empty-cat" href="${c.href}">${c.icon ? `<img src="${c.icon}" alt="">` : ''}<span>${c.label}</span></a>`).join('')}
        </div>
      ` : ''}
      ${featured.length ? `
        <h3 class="plp-search-empty-subheading">You Might Like</h3>
        <div class="plp-search-empty-featured plp-results is-grid">${featured.map(p => plpCardHTML(p, cfg)).join('')}</div>
      ` : ''}
    </div>
  `;
}

// ==== Filters sidebar ========================================================
function plpFilterGroupHTML(facetDef, isPriority) {
  const cfg = window.PLP_CONFIG;
  const options = facetDef.options.map(opt => {
    const count = cfg.products.filter(p => plpMatchesFiltersExcept(p, plpState.activeFilters, facetDef.key, plpState.activeSubcat, plpState.activeSubsubcat) && plpValueMatches(p, facetDef.key, facetDef, opt.value)).length;
    const checked = plpState.activeFilters[facetDef.key] && plpState.activeFilters[facetDef.key].has(String(opt.value));
    return `
      <label class="plp-filter-option ${count === 0 && !checked ? 'is-zero' : ''}">
        <input type="checkbox" data-facet="${facetDef.key}" value="${opt.value}" ${checked ? 'checked' : ''}>
        <span>${opt.label}</span>
        <span class="plp-filter-count">${count}</span>
      </label>
    `;
  }).join('');
  // Tooltip (2026-09-18 design review) — placeholder copy only, real per-attribute text is
  // blocked on Graham's tooltip spreadsheet (plp-spec.md Section 15). facetDef.tooltip lets a
  // page override it; falls back to a generic placeholder so every filter demoes the mechanism.
  const tooltipCopy = facetDef.tooltip || `Filters the results by ${facetDef.label.toLowerCase()}. (Placeholder copy — real wording pending Graham's attribute glossary.)`;
  const tooltipIcon = `<span class="plp-filter-tooltip" tabindex="0" data-tooltip="${tooltipCopy.replace(/"/g, '&quot;')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg></span>`;
  if (isPriority) {
    return `
      <div class="plp-filter-group plp-filter-priority-group" data-facet-group="${facetDef.key}">
        <h4>${facetDef.label} ${tooltipIcon}</h4>
        <div class="plp-filter-options">${options}</div>
      </div>
    `;
  }
  return `
    <details class="plp-filter-group" data-facet-group="${facetDef.key}" open>
      <summary>${facetDef.label} ${tooltipIcon}</summary>
      <div class="plp-filter-options">${options}</div>
    </details>
  `;
}

function plpRenderFilters() {
  const cfg = window.PLP_CONFIG;
  const priorityWrap = document.getElementById('plpPriorityFilters');
  const standardWrap = document.getElementById('plpStandardFilters');
  const chipsWrap = document.getElementById('plpPriorityChips');
  if (priorityWrap) {
    priorityWrap.innerHTML = cfg.facets.priority.length
      ? `<div class="plp-filter-priority">${cfg.facets.priority.map(f => plpFilterGroupHTML(f, true)).join('')}</div>`
      : '';
  }
  if (standardWrap) {
    standardWrap.innerHTML = cfg.facets.standard.map(f => plpFilterGroupHTML(f, false)).join('');
  }
  // Mobile priority chips (spec Section 6) — quick-access row above "Refine Results";
  // tapping one opens the full drawer, scrolled to that filter's group (Section 14 item 3,
  // Brenton's working "maybe" assumption).
  if (chipsWrap) {
    chipsWrap.innerHTML = cfg.facets.priority.map(f => `<button type="button" class="plp-filter-chip" data-chip-facet="${f.key}">${f.label}</button>`).join('');
    chipsWrap.querySelectorAll('[data-chip-facet]').forEach(chip => {
      chip.addEventListener('click', () => plpOpenFilterDrawer(chip.dataset.chipFacet));
    });
  }
  // Stop the tooltip icon's own click/keyboard activation from also toggling the parent
  // <details> open/closed — it sits inside <summary> (standard filter groups only; the
  // priority groups' <h4> isn't a disclosure widget) so a plain click would otherwise bubble
  // into the native summary-toggle behaviour.
  [priorityWrap, standardWrap].forEach(wrap => {
    if (!wrap) return;
    wrap.querySelectorAll('.plp-filter-tooltip').forEach(tip => {
      tip.addEventListener('click', e => e.preventDefault());
      tip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); });
    });
  });
  [priorityWrap, standardWrap].forEach(wrap => {
    if (!wrap) return;
    wrap.querySelectorAll('[data-facet]').forEach(input => {
      input.addEventListener('change', () => {
        const key = input.dataset.facet;
        const val = input.value;
        if (!plpState.activeFilters[key]) plpState.activeFilters[key] = new Set();
        if (input.checked) plpState.activeFilters[key].add(val); else plpState.activeFilters[key].delete(val);
        plpState.page = 1;
        plpState.visibleCount = PLP_PAGE_SIZE;
        plpRenderFilters();
        plpRenderResults();
        plpSyncFilterDrawerFromMain();
      });
    });
  });
}

// Reset/Clear Filters (2026-09-18 design review — Graham/Tim: no way to clear an active
// selection today, on this prototype or the live site). Leaves the active SHOP BY subcategory
// alone — only clears facet filters, same scope as the mobile drawer's own filter state.
function plpClearFilters() {
  plpState.activeFilters = {};
  plpState.page = 1;
  plpState.visibleCount = PLP_PAGE_SIZE;
  plpRenderFilters();
  plpRenderResults();
  plpSyncFilterDrawerFromMain();
}

// ---- Mobile filter drawer (right-edge slide-out, same convention as the Store Slide-out —
// plp-spec.md Section 6: "no supplied design; build it following the existing right-edge
// slide-out convention already established elsewhere in this prototype") ----
function plpBuildFilterDrawer() {
  if (document.getElementById('plpFilterSlideoutBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'store-slideout-backdrop plp-filter-slideout-backdrop';
  backdrop.id = 'plpFilterSlideoutBackdrop';
  backdrop.innerHTML = `
    <div class="store-slideout plp-filter-slideout">
      <div class="store-slideout-head">
        <h2>Refine Results</h2>
        <button type="button" class="plp-filter-clear-drawer" id="plpFilterClearDrawer">Clear All</button>
        <button type="button" class="store-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="store-slideout-body plp-filter-slideout-body" id="plpFilterSlideoutBody"></div>
      <div class="plp-filter-slideout-foot">
        <button type="button" class="btn btn-primary btn-block" id="plpFilterApply">Show Results</button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) plpCloseFilterDrawer(); });
  backdrop.querySelector('.store-slideout-close').addEventListener('click', plpCloseFilterDrawer);
  backdrop.querySelector('#plpFilterApply').addEventListener('click', plpCloseFilterDrawer);
  backdrop.querySelector('#plpFilterClearDrawer').addEventListener('click', plpClearFilters);
}

function plpSyncFilterDrawerFromMain() {
  const body = document.getElementById('plpFilterSlideoutBody');
  const priority = document.getElementById('plpPriorityFilters');
  const standard = document.getElementById('plpStandardFilters');
  if (!body || !priority || !standard) return;
  body.innerHTML = priority.innerHTML + standard.innerHTML;
  body.querySelectorAll('[data-facet]').forEach(input => {
    input.addEventListener('change', () => {
      const key = input.dataset.facet;
      const val = input.value;
      if (!plpState.activeFilters[key]) plpState.activeFilters[key] = new Set();
      if (input.checked) plpState.activeFilters[key].add(val); else plpState.activeFilters[key].delete(val);
      plpState.page = 1;
      plpState.visibleCount = PLP_PAGE_SIZE;
      plpRenderFilters();
      plpRenderResults();
      plpSyncFilterDrawerFromMain();
    });
  });
  const applyBtn = document.getElementById('plpFilterApply');
  if (applyBtn) applyBtn.textContent = `Show ${plpFilteredSortedProducts().length} Results`;
}

function plpOpenFilterDrawer(scrollToFacetKey) {
  plpSyncFilterDrawerFromMain();
  const backdrop = document.getElementById('plpFilterSlideoutBackdrop');
  if (!backdrop) return;
  backdrop.classList.add('open');
  if (scrollToFacetKey) {
    requestAnimationFrame(() => {
      const target = document.querySelector(`#plpFilterSlideoutBody [data-facet-group="${scrollToFacetKey}"]`);
      if (target) target.scrollIntoView({ block: 'start' });
    });
  }
}
function plpCloseFilterDrawer() {
  const backdrop = document.getElementById('plpFilterSlideoutBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

// ==== Product card / row ======================================================
function plpRibbonHTML(product) {
  // Bestseller vs Staff Pick — mutually exclusive, Staff Pick wins if a product somehow
  // carries both (plp-spec.md Section 7, Section 14 item 1 — flagged assumption). Full-width
  // bar across the top of the card's media, matching the Figma reference exactly (not a
  // corner badge).
  if (product.ribbon === 'staffpick') return `<div class="plp-ribbon plp-ribbon-staffpick">★ Staff Pick</div>`;
  if (product.ribbon === 'bestseller') return `<div class="plp-ribbon plp-ribbon-bestseller">Bestseller</div>`;
  // Arbitrary custom ribbon text (2026-09-18 design review) — any other truthy string on
  // product.ribbon renders verbatim (e.g. "Discontinued", "Limited Stock Left"). The Racket
  // flagging mechanism behind this is still a blocked/open item (plp-spec.md Section 15).
  if (product.ribbon) return `<div class="plp-ribbon plp-ribbon-custom">${product.ribbon}</div>`;
  return '';
}

// "From $X" prefix for sibling/variant products (2026-09-18 design review) — product.hasOptions
// marks a product that lands on "View Options" instead of a quick Add to Cart (see
// plpCardHTML/plpListCardHTML), same condition this prefix keys off. This demo dataset treats
// the product's own listed price as already being the cheapest option's price (no separate
// sibling records exist to compute a real minimum from).
// Price on Application (2026-09-18, Camping scrape) — a chunk of real scraped Camping SKUs
// have no listed price on the live site (not out of stock, just no price shown in the
// listing). Rather than fabricate a number, show POA and swap the primary action to a
// straight "View Details" link (see plpPrimaryActionHTML) since quick-add needs a real price.
function plpPriceHTML(product) {
  if (!product.price) {
    return `<div class="plp-price"><div class="plp-price-col"><span class="plp-price-poa">Price on Application</span></div></div>`;
  }
  const now = plpFmtMoney(product.price);
  // "From" reuses the same small .plp-price-label style as "Now"/"RRP" (2026-09-19 2nd
  // follow-up) — it used to be plain text prepended inside .plp-price-now, which rendered it
  // at the same oversized price font as the digits themselves.
  const fromSpan = product.hasOptions ? `<span class="plp-price-label">From</span>` : '';
  if (!product.wasPrice) {
    return `<div class="plp-price"><div class="plp-price-col"><div class="plp-price-line-now">${fromSpan}<span class="plp-price-now">${now}</span></div></div></div>`;
  }
  const was = plpFmtMoney(product.wasPrice);
  // Two-column on-sale layout (2026-09-18 design review) — price/RRP/Save badge stacked on
  // the left, the same seasonal sale-tag graphic as the PDP price-block (shared.css
  // .price-block .sale-tag) sitting beside it on the right, instead of overlaying the product
  // photo (Graham: that placement was hard to control and landed wrong too often). Reuses
  // shared.css's .badge/.badge-save verbatim, per this file's own "reuse a shared.css class
  // where it happens" convention, so the Save pill matches the PDP's exactly.
  //
  // "Now"/"RRP" labels (2026-09-19 follow-up) — same wording/strikethrough-on-both-spans
  // treatment as the PDP price-block (shared.css .price-line-now/.price-line-was/.price-label,
  // syncPriceLabels()), just at card scale via the plp-prefixed equivalents in plp.css.
  // "Now" is suppressed for hasOptions products even on sale (2026-09-19 3rd follow-up,
  // Brenton) — a variant/sibling product on sale still just reads "From $X", not
  // "Now From $X"; RRP/strikethrough/Save% still show as normal, only the "Now" label drops.
  // A non-variant product keeps the plain PDP behaviour: "Now" only on sale, plain unlabelled
  // number off-sale.
  const savePct = Math.round((1 - product.price / product.wasPrice) * 100);
  const nowLabel = product.hasOptions ? '' : `<span class="plp-price-label">Now</span>`;
  return `
    <div class="plp-price plp-price-on-sale">
      <div class="plp-price-col">
        <div class="plp-price-line-now">${nowLabel}${fromSpan}<span class="plp-price-now">${now}</span></div>
        <div class="plp-price-line-was"><span class="plp-price-label">RRP</span><span class="plp-price-was">${was}</span></div>
        <span class="badge badge-save">Save ${savePct}%</span>
      </div>
      <img class="plp-sale-tag" src="../_shared/sale-tag.png" alt="Sale">
    </div>
  `;
}

function plpFmtMoney(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// No-rating gap (2026-09-18, Camping scrape) — the real Camping category listing tiles don't
// render a star/review widget at all (not zero reviews, just not part of that page's markup),
// so scraped Camping products carry no rating field. Hide the row rather than fabricate stars,
// same pattern as plpSpecsHTML's existing "no specs" guard below.
function plpRatingHTML(product) {
  if (!product.rating) return '';
  const full = Math.round(product.rating);
  return `
    <div class="plp-rating">
      <span class="stars">${'★'.repeat(full)}<span class="stars-empty">${'★'.repeat(5 - full)}</span></span>
      <span class="plp-rating-num">${product.rating.toFixed(1)}</span>
      <span class="plp-review-count">(${product.reviews} Reviews)</span>
    </div>
  `;
}

function plpSpecsHTML(product) {
  if (!product.specs || !product.specs.length) return '';
  return `
    <details class="plp-specs">
      <summary class="plp-specs-toggle"><span class="plp-specs-toggle-show">Show Specs</span><span class="plp-specs-toggle-hide">Hide Specs</span></summary>
      <div class="plp-specs-panel">
        ${product.specs.map(s => `<div class="plp-spec-row"><span class="plp-spec-icon">${s.icon}</span><span class="plp-spec-label">${s.label}</span><span class="plp-spec-value">${s.value}</span></div>`).join('')}
      </div>
    </details>
  `;
}

function plpCompareCheckHTML(product) {
  if (!plpState.compareEnabled) return '';
  const checked = plpState.compareSelected.includes(product.id);
  const disabled = !checked && plpState.compareSelected.length >= 2;
  return `
    <label class="plp-compare-check ${disabled ? 'is-disabled' : ''}">
      <input type="checkbox" data-compare-id="${product.id}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <span>Compare Product</span>
    </label>
  `;
}

function plpStockLineHTML(product) {
  const map = {
    in_stock: { cls: 'in-stock', label: '✓ In Stock' },
    click_collect: { cls: 'in-stock', label: '✓ In Stock — Click &amp; Collect Available' },
    low_stock: { cls: 'low-stock', label: '⚠ Low Stock' },
    // out_of_stock (2026-09-18, Camping re-scrape) — real gap: several real Camping SKUs are
    // genuinely OutOfStock per the live PDP's own schema.org availability, not just missing a
    // price. See plpPrimaryActionHTML() for the matching disabled primary action.
    out_of_stock: { cls: 'out-of-stock', label: '✕ Out of Stock' }
  };
  const s = map[product.stock] || map.in_stock;
  return `<div class="plp-stock-line ${s.cls}">${s.label}</div>`;
}

// Real brand-logo assets where one already exists in _shared/ (reused verbatim from the PDP
// templates); brands with no supplied logo file fall back to a plain text wordmark, same
// convention as shared.css's .brand-logo-text on the PDP decision panel.
function plpBrandHTML(product) {
  if (product.brandLogo) return `<img class="plp-card-brand-logo" src="${product.brandLogo}" alt="${product.brand}">`;
  return `<div class="plp-card-brand-text">${product.brand}</div>`;
}

// List view only: brand logo overlaid on the photo itself (top-left) rather than sitting in
// the info column below it — a small white chip keeps it legible over any product image.
function plpBrandOverlayHTML(product) {
  return `<div class="plp-card-brand-overlay">${plpBrandHTML(product)}</div>`;
}

// Primary card action (2026-09-18 design review): simple/single-SKU products get a quick
// Add to Cart button; products with sibling/variant options (product.hasOptions) get
// "View Options" through to the PDP instead — no quick add, since the customer needs to pick
// an option first. Independent of cfg.vrs (VRS/Fitment Gallery is a separate concern), so a
// VRS product can be either state just like a standard one.
function plpPrimaryActionHTML(product, blockClass) {
  if (product.stock === 'out_of_stock') {
    return `<button type="button" class="btn btn-outline plp-view-options-btn${blockClass ? ' ' + blockClass : ''}" disabled>Out of Stock</button>`;
  }
  if (!product.price) {
    return `<a href="${product.url || '#'}" class="btn btn-outline plp-view-options-btn${blockClass ? ' ' + blockClass : ''}">View Details</a>`;
  }
  if (product.hasOptions) {
    return `<a href="#" class="btn btn-gold plp-view-options-btn${blockClass ? ' ' + blockClass : ''}">View Options</a>`;
  }
  // Cart icon (2026-09-19 follow-up) — same outline glyph as the header cart, sized down via
  // .plp-btn-icon rather than reusing the header's own sizing rules.
  return `<button type="button" class="btn btn-gold plp-addtocart-btn${blockClass ? ' ' + blockClass : ''}" data-addtocart-id="${product.id}"><svg class="plp-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.8h7.6a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none"/></svg>Add to Cart</button>`;
}

function plpCardHTML(product, cfg) {
  const primaryBtn = plpPrimaryActionHTML(product, cfg.vrs ? '' : 'btn-block');
  const vrsRow = cfg.vrs ? `
    <div class="plp-vrs-actions">
      <button type="button" class="btn btn-outline plp-fitgallery-btn" data-fitgallery-id="${product.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        Fitment Gallery (${product.fitmentCount})
      </button>
      ${primaryBtn}
    </div>
  ` : primaryBtn;

  return `
    <div class="plp-card" data-product-id="${product.id}">
      <a href="${product.url || '#'}" class="plp-card-media-link">
        <div class="plp-card-media ${product.imageSvg ? 'is-placeholder' : ''}">
          ${plpRibbonHTML(product)}
          ${product.imageSvg ? product.imageSvg : `<img class="plp-card-photo" src="${product.image}" alt="${product.name}">`}
        </div>
      </a>
      <div class="plp-card-body">
        ${plpBrandHTML(product)}
        <h3 class="plp-card-title"><a href="${product.url || '#'}" class="plp-card-title-link">${product.name}</a></h3>
        ${plpRatingHTML(product)}
        ${plpPriceHTML(product)}
        ${plpStockLineHTML(product)}
        ${plpSpecsHTML(product)}
        <div class="plp-card-actions">
          ${vrsRow}
          ${plpCompareCheckHTML(product)}
        </div>
      </div>
    </div>
  `;
}

// List view's own 3-column layout (image | info | actions, 1:2:1) — different enough from
// the grid card (USPs instead of specs, brand overlaid on the photo instead of sitting below
// it, Fitment Gallery under the photo instead of paired with View Options) that reusing
// plpCardHTML with view-conditional bits would be harder to follow than a dedicated function.
function plpListCardHTML(product, cfg) {
  const fitGalleryBtn = cfg.vrs ? `
    <button type="button" class="btn btn-outline plp-fitgallery-btn" data-fitgallery-id="${product.id}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
      Fitment Gallery (${product.fitmentCount})
    </button>
  ` : '';
  const usps = (product.usps && product.usps.length)
    ? `<ul class="plp-list-usps">${product.usps.map(u => `<li>${u}</li>`).join('')}</ul>`
    : '';

  return `
    <div class="plp-card" data-product-id="${product.id}">
      <div class="plp-list-col-media">
        <a href="${product.url || '#'}" class="plp-card-media-link">
          <div class="plp-card-media ${product.imageSvg ? 'is-placeholder' : ''}">
            ${plpBrandOverlayHTML(product)}
            ${product.imageSvg ? product.imageSvg : `<img class="plp-card-photo" src="${product.image}" alt="${product.name}">`}
          </div>
        </a>
        ${fitGalleryBtn}
      </div>
      <div class="plp-list-col-info">
        <h3 class="plp-card-title"><a href="${product.url || '#'}" class="plp-card-title-link">${product.name}</a></h3>
        ${plpRatingHTML(product)}
        ${usps}
      </div>
      <div class="plp-list-col-actions">
        ${plpRibbonHTML(product)}
        ${plpPriceHTML(product)}
        ${plpStockLineHTML(product)}
        ${plpPrimaryActionHTML(product)}
        ${plpCompareCheckHTML(product)}
      </div>
    </div>
  `;
}

// ==== Results (grid/list) + pagination =======================================
function plpRenderResults() {
  const cfg = window.PLP_CONFIG;
  const wrap = document.getElementById('plpResults');
  const countLabel = document.getElementById('plpResultCount');
  const mobileCountLabel = document.getElementById('plpResultCountMobile');
  if (!wrap) return;

  // A Level 3 selection only means something within the category it belongs to — if the
  // Category quick-tab/filter changed since it was set (or the sidebar Category checkbox was
  // used directly, which doesn't go through plpSelectSearchCategory's own reset), drop it
  // before filtering rather than silently matching nothing in the new category.
  if (cfg.isSearch && plpState.activeSubsubcat) {
    const activeEntry = plpActiveSearchCategoryEntry();
    if (!activeEntry || !(activeEntry.children || []).some(c => c.key === plpState.activeSubsubcat)) {
      plpState.activeSubsubcat = null;
    }
  }

  const all = plpFilteredSortedProducts();
  const total = all.length;

  if (cfg.isSearch && total === 0) {
    wrap.className = 'plp-results plp-results-empty';
    wrap.innerHTML = plpZeroResultsHTML();
    if (countLabel) countLabel.textContent = `0 Results for "${plpState.searchQuery}"`;
    if (mobileCountLabel) mobileCountLabel.textContent = `0 Results for "${plpState.searchQuery}"`;
    const emptyLevel3Row = document.getElementById('plpLevel3Row');
    if (emptyLevel3Row) { emptyLevel3Row.hidden = true; emptyLevel3Row.innerHTML = ''; }
    plpRenderPagination(0);
    plpBindCardEvents();
    return;
  }

  // Desktop: numbered pages. Mobile: cumulative "Show More Results" (spec Section 8).
  const isMobile = window.matchMedia('(max-width:900px)').matches;
  let visible;
  if (isMobile) {
    visible = all.slice(0, plpState.visibleCount);
  } else {
    const start = (plpState.page - 1) * PLP_PAGE_SIZE;
    visible = all.slice(start, start + PLP_PAGE_SIZE);
  }

  const gridColsClass = plpState.view === 'grid' && plpState.gridCols === 4 ? ' cols-4' : '';
  wrap.className = `plp-results ${plpState.view === 'list' ? 'is-list' : 'is-grid'}${gridColsClass}`;
  const cardsArr = visible.map(p => plpState.view === 'list' ? plpListCardHTML(p, cfg) : plpCardHTML(p, cfg));

  // Nav-depth Level 3 icon cards (2026-09-18 review item 39/40, revised same day after Brenton
  // saw the first pass): originally merged into the results grid as leading cells, but sharing
  // a grid row with a full product card stretched the icon cards to match its height, leaving
  // them tall and sparse. Now a dedicated row of their own — .plp-level3-row, fixed at 5
  // columns on desktop regardless of how many children a tab has — sitting above the results
  // grid rather than inside it. Only on the first page (see plpBindCardEvents() for the click
  // binding, which now targets this row instead of #plpResults).
  const activeTile = cfg.isSearch ? plpActiveSearchCategoryEntry() : (cfg.shopBy || []).find(t => t.key === plpState.activeSubcat);
  const showLevel3 = activeTile && activeTile.children && activeTile.children.length && (isMobile || plpState.page === 1);
  let level3Row = document.getElementById('plpLevel3Row');
  if (showLevel3) {
    if (!level3Row) {
      level3Row = document.createElement('div');
      level3Row.className = 'plp-level3-row';
      level3Row.id = 'plpLevel3Row';
      wrap.parentElement.insertBefore(level3Row, wrap);
    }
    level3Row.hidden = false;
    level3Row.innerHTML = activeTile.children.map(child => {
      const count = cfg.isSearch ? cfg.products.filter(p => plpMatchesFiltersExcept(p, plpState.activeFilters, null, plpState.activeSubcat, child.key)).length : undefined;
      return plpIconCardHTML(child, count);
    }).join('');
  } else if (level3Row) {
    level3Row.hidden = true;
    level3Row.innerHTML = '';
  }

  // Fitment Gallery, once per results page, at position 2 (spec Section 9): 2nd row in list
  // view (index 2), directly after the first full row in grid view (index = plpState.gridCols,
  // the Demo State Panel's 3/4-per-row test toggle — the closest fixed position to "first
  // full row" without measuring live responsive reflow, same simplification this prototype
  // set already applies elsewhere to "row"-based rules that only truly hold at one
  // breakpoint). Only on VRS categories with a vehicle set — never standard PLPs, never
  // Simple state.
  if (cfg.vrs && plpVehicleIsSet() && total > 0) {
    const insertAt = Math.min(plpState.view === 'list' ? 2 : plpState.gridCols, cardsArr.length);
    cardsArr.splice(insertAt, 0, plpFitGallerySectionHTML());
  }

  wrap.innerHTML = cardsArr.join('') || `<div class="plp-no-results">No products match the selected filters.</div>`;

  const searchSuffix = cfg.isSearch ? ` for "${plpState.searchQuery}"` : '';
  if (countLabel) {
    const from = total === 0 ? 0 : (isMobile ? 1 : (plpState.page - 1) * PLP_PAGE_SIZE + 1);
    const to = isMobile ? visible.length : Math.min(plpState.page * PLP_PAGE_SIZE, total);
    countLabel.textContent = `Showing ${from}-${to} of ${total} Results${searchSuffix}`;
  }
  if (mobileCountLabel) mobileCountLabel.textContent = `Showing ${visible.length} of ${total} Results${searchSuffix}`;

  plpRenderPagination(total);
  plpBindCardEvents();
  if (cfg.vrs && plpVehicleIsSet()) {
    plpInitFitGalleryWidget();
  }
}

function plpRenderPagination(total) {
  const desktopWrap = document.getElementById('plpPaginationDesktop');
  const mobileWrap = document.getElementById('plpPaginationMobile');
  if (total === 0) {
    if (desktopWrap) desktopWrap.innerHTML = '';
    if (mobileWrap) mobileWrap.innerHTML = '';
    return;
  }
  const pageCount = Math.max(1, Math.ceil(total / PLP_PAGE_SIZE));
  if (desktopWrap) {
    if (pageCount <= 1) { desktopWrap.innerHTML = ''; }
    else {
      let html = `<button type="button" class="plp-page-btn" data-page="${Math.max(1, plpState.page - 1)}" ${plpState.page === 1 ? 'disabled' : ''}>&lsaquo;</button>`;
      for (let i = 1; i <= pageCount; i++) {
        html += `<button type="button" class="plp-page-btn ${i === plpState.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      html += `<button type="button" class="plp-page-btn" data-page="${Math.min(pageCount, plpState.page + 1)}" ${plpState.page === pageCount ? 'disabled' : ''}>&rsaquo;</button>`;
      desktopWrap.innerHTML = html;
      desktopWrap.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          plpState.page = Number(btn.dataset.page);
          plpRenderResults();
          window.scrollTo({ top: document.getElementById('plpResults').offsetTop - 100, behavior: 'smooth' });
        });
      });
    }
  }
  if (mobileWrap) {
    const isDone = plpState.visibleCount >= total;
    mobileWrap.innerHTML = isDone ? '' : `<button type="button" class="btn btn-outline btn-block" id="plpShowMore">Show More Results</button>`;
    const showMoreBtn = document.getElementById('plpShowMore');
    if (showMoreBtn) showMoreBtn.addEventListener('click', () => {
      plpState.visibleCount += PLP_PAGE_SIZE;
      plpRenderResults();
    });
  }
}

function plpBindCardEvents() {
  document.querySelectorAll('#plpResults [data-compare-id]').forEach(input => {
    input.addEventListener('change', () => {
      const id = input.dataset.compareId;
      if (input.checked) {
        if (plpState.compareSelected.length < 2) plpState.compareSelected.push(id);
      } else {
        plpState.compareSelected = plpState.compareSelected.filter(x => x !== id);
      }
      plpRenderResults();
      plpUpdateCompareBar();
    });
  });
  document.querySelectorAll('#plpResults [data-fitgallery-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cfg = window.PLP_CONFIG;
      const product = cfg.products.find(p => p.id === btn.dataset.fitgalleryId);
      if (product) plpOpenRowFitGallery(product);
    });
  });
  // Quick Add to Cart (2026-09-18 design review) — simple visual confirmation + bumps the
  // real header cart-badge count (both the main header and sticky header share that class);
  // no real cart/line-items model exists anywhere in this prototype set to add to.
  document.querySelectorAll('#plpResults [data-addtocart-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cart-badge').forEach(el => { el.textContent = String(Number(el.textContent || 0) + 1); });
      // innerHTML, not textContent — the button now carries a cart-icon <svg> (2026-09-19
      // follow-up), so a plain textContent capture/restore would silently drop the icon on
      // revert.
      const original = btn.innerHTML;
      btn.textContent = 'Added ✓';
      btn.disabled = true;
      setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 1200);
    });
  });
  document.querySelectorAll('#plpLevel3Row [data-subsubcat]').forEach(btn => {
    btn.addEventListener('click', () => plpSelectSubsubcat(btn.dataset.subsubcat));
  });
}

// ==== Sort / view toggle ======================================================
function plpInitToolbar() {
  const sortSelect = document.getElementById('plpSort');
  if (sortSelect) sortSelect.addEventListener('change', () => {
    plpState.sort = sortSelect.value;
    plpState.page = 1;
    plpRenderResults();
  });
  const gridBtn = document.getElementById('plpViewGrid');
  const listBtn = document.getElementById('plpViewList');
  function setView(v) {
    plpState.view = v;
    if (gridBtn) gridBtn.classList.toggle('active', v === 'grid');
    if (listBtn) listBtn.classList.toggle('active', v === 'list');
    plpRenderResults();
  }
  // Sync the toggle buttons' visual state to PLP_CONFIG.defaultView (set on plpState before
  // this runs — see the DOMContentLoaded handler below) rather than hardcoding an "active"
  // class in each page's own markup, which could silently drift out of sync with the actual
  // initial render.
  if (gridBtn) gridBtn.classList.toggle('active', plpState.view === 'grid');
  if (listBtn) listBtn.classList.toggle('active', plpState.view === 'list');
  if (gridBtn) gridBtn.addEventListener('click', () => setView('grid'));
  if (listBtn) listBtn.addEventListener('click', () => setView('list'));
  const refineBtn = document.getElementById('plpRefineBtn');
  if (refineBtn) refineBtn.addEventListener('click', () => plpOpenFilterDrawer());
  const clearBtn = document.getElementById('plpFilterClear');
  if (clearBtn) clearBtn.addEventListener('click', plpClearFilters);
}

// Demo State Panel hook (buildAdminPanel() in shared.js calls this if defined — see the
// PLP-only section added there, gated behind [data-plp-page]).
function applyPlpViewFlag(mode) {
  plpState.view = mode;
  const gridBtn = document.getElementById('plpViewGrid');
  const listBtn = document.getElementById('plpViewList');
  if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
  if (listBtn) listBtn.classList.toggle('active', mode === 'list');
  plpRenderResults();
}

function applyPlpGridColsFlag(cols) {
  plpState.gridCols = Number(cols) === 4 ? 4 : 3;
  plpRenderResults();
}

function applyPlpCompareFlag(on) {
  plpState.compareEnabled = on;
  if (!on) plpState.compareSelected = [];
  plpRenderResults();
  plpUpdateCompareBar();
}

// ==== Compare Products (spec Section 12 — gated behind the Demo State Panel, off by
// default) ====
function plpBuildCompareDrawer() {
  if (document.getElementById('plpCompareSlideoutBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'store-slideout-backdrop plp-compare-slideout-backdrop';
  backdrop.id = 'plpCompareSlideoutBackdrop';
  backdrop.innerHTML = `
    <div class="store-slideout plp-compare-slideout">
      <div class="store-slideout-head">
        <h2>Compare Products</h2>
        <button type="button" class="store-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="store-slideout-body" id="plpCompareBody"></div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.classList.remove('open'); });
  backdrop.querySelector('.store-slideout-close').addEventListener('click', () => backdrop.classList.remove('open'));

  const bar = document.createElement('div');
  bar.className = 'plp-compare-bar';
  bar.id = 'plpCompareBar';
  bar.hidden = true;
  bar.innerHTML = `<span id="plpCompareBarText"></span> <button type="button" class="btn btn-primary" id="plpCompareOpenBtn">Compare</button>`;
  document.body.appendChild(bar);
  bar.querySelector('#plpCompareOpenBtn').addEventListener('click', plpOpenCompareDrawer);
}

function plpUpdateCompareBar() {
  const bar = document.getElementById('plpCompareBar');
  if (!bar) return;
  const n = plpState.compareSelected.length;
  bar.hidden = !plpState.compareEnabled || n === 0;
  const text = document.getElementById('plpCompareBarText');
  if (text) text.textContent = `${n} of 2 products selected`;
  const openBtn = document.getElementById('plpCompareOpenBtn');
  if (openBtn) openBtn.disabled = n < 2;
}

function plpOpenCompareDrawer() {
  const cfg = window.PLP_CONFIG;
  const [aId, bId] = plpState.compareSelected;
  const a = cfg.products.find(p => p.id === aId);
  const b = cfg.products.find(p => p.id === bId);
  const body = document.getElementById('plpCompareBody');
  if (!body || !a || !b) return;
  const allSpecLabels = [...new Set([...(a.specs || []), ...(b.specs || [])].map(s => s.label))];
  const specRow = label => {
    const av = (a.specs || []).find(s => s.label === label);
    const bv = (b.specs || []).find(s => s.label === label);
    return `<tr><th scope="row">${label}</th><td>${av ? av.value : '—'}</td><td>${bv ? bv.value : '—'}</td></tr>`;
  };
  body.innerHTML = `
    <div class="plp-compare-heads">
      <div></div>
      <div class="plp-compare-head"><img src="${a.image}" alt="${a.name}"><h4>${a.name}</h4><div class="plp-price-now">${plpFmtMoney(a.price)}</div></div>
      <div class="plp-compare-head"><img src="${b.image}" alt="${b.name}"><h4>${b.name}</h4><div class="plp-price-now">${plpFmtMoney(b.price)}</div></div>
    </div>
    <table class="specs-table plp-compare-table">
      <tr><th scope="row">Brand</th><td>${a.brand}</td><td>${b.brand}</td></tr>
      ${allSpecLabels.map(specRow).join('')}
    </table>
  `;
  document.getElementById('plpCompareSlideoutBackdrop').classList.add('open');
}

// ==== Category videos (spec Section 10) ======================================
// Sidebar video module (old Section 10.1) was replaced by the Merchandising + Featured
// Product sidebar below (2026-09-18 design review) — the bottom-of-page carousel is
// unchanged, still aggregating every video across the category and its subcategories, no cap
// (Section 10.2) — this demo's whole video set stands in for that combined pool.
function plpRenderVideos() {
  const cfg = window.PLP_CONFIG;
  const carousel = document.getElementById('plpVideoCarouselTrack');
  if (!carousel) return;
  carousel.innerHTML = (cfg.videos || []).map(v => `
    <a class="plp-video-tile" href="${v.url || '#'}" target="_blank" rel="noopener">
      <img src="${v.thumb}" alt="${v.title}">
      <span class="plp-video-play">&#9658;</span>
      <span class="plp-video-title">${v.title}</span>
    </a>
  `).join('');
}

// ==== Category FAQ, dynamic per Level 2/3 tab (spec Section 15 item 5: "Buyer's Guide/FAQ/
// Video are dynamic — hide when no content exists for that category") — opt-in via
// cfg.faqByCategory (keyed by shopBy/children key, plus an 'all' fallback for Show All), so
// pages without it (plp/vplp, whose FAQ is static hardcoded content) are unaffected. Re-run on
// every Level 2/3 tab change, not just at init, so the section actually demonstrates the
// dynamic swap rather than just the empty/non-empty toggle.
function plpRenderFAQ() {
  const cfg = window.PLP_CONFIG;
  const section = document.getElementById('faqSection');
  const list = document.getElementById('faqList');
  if (!section || !list || !cfg.faqByCategory) return;
  const key = plpState.activeSubsubcat || plpState.activeSubcat || 'all';
  const items = cfg.faqByCategory[key] || cfg.faqByCategory.all || [];
  section.hidden = !items.length;
  if (!items.length) return;
  list.innerHTML = items.map(item => `
    <details class="faq-item">
      <summary>${item.q}</summary>
      <div class="faq-answer"><p>${item.a}</p></div>
    </details>
  `).join('');
}

// ==== Merchandising + Featured Product sidebar (2026-09-18 design review) ===================
// Real category-level inheritance (most-specific-set-wins, per the design review) is a
// Magento-side concern for the eventual dev brief — this static demo just renders whichever
// promos/featured product the page's own PLP_CONFIG carries.
function plpRenderMerchSidebar() {
  const cfg = window.PLP_CONFIG;
  const wrap = document.getElementById('plpMerchSidebar');
  if (!wrap) return;
  const promos = cfg.merchPromos || [];
  const featured = cfg.featuredProduct;
  let html = '';
  if (promos.length) {
    html += `
      <div class="plp-merch-carousel" id="plpMerchCarousel">
        <div class="plp-merch-track">
          ${promos.map(p => `
            <a class="plp-merch-slide" href="${p.href || '#'}">
              <img src="${p.image}" alt="${p.label || ''}">
              ${(p.eyebrow || p.label) ? `<span class="plp-merch-caption">${p.eyebrow ? `<em>${p.eyebrow}</em>` : ''}${p.label ? `<strong>${p.label}</strong>` : ''}</span>` : ''}
            </a>
          `).join('')}
        </div>
        ${promos.length > 1 ? `<div class="plp-merch-dots">${promos.map((_, i) => `<button type="button" class="plp-merch-dot ${i === 0 ? 'active' : ''}" data-merch-dot="${i}" aria-label="Promotion ${i + 1}"></button>`).join('')}</div>` : ''}
      </div>
    `;
  }
  if (featured) {
    html += `
      <div class="plp-featured-product">
        <h4 class="plp-featured-product-heading">Featured Product</h4>
        <a class="plp-featured-card" href="#">
          <img src="${featured.image}" alt="${featured.name}">
          <span class="plp-featured-name">${featured.name}</span>
          <span class="plp-featured-price">${plpFmtMoney(featured.price)}</span>
        </a>
      </div>
    `;
  }
  wrap.innerHTML = html;
  plpInitMerchCarousel();
}

// Carousel/swipe between multiple active promos (2026-09-18 resolution) — falls back to a
// single non-swipeable slide with no dots when only one promo is configured.
function plpInitMerchCarousel() {
  const carousel = document.getElementById('plpMerchCarousel');
  if (!carousel) return;
  const track = carousel.querySelector('.plp-merch-track');
  const dots = carousel.querySelectorAll('[data-merch-dot]');
  if (!track || !dots.length) return;
  const slides = [...track.querySelectorAll('.plp-merch-slide')];
  dots.forEach(dot => {
    dot.addEventListener('click', e => {
      e.preventDefault();
      const slide = slides[Number(dot.dataset.merchDot)];
      if (slide) slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
  });
  let scrollTimer;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const idx = slides.findIndex(el => Math.abs(el.offsetLeft - track.scrollLeft) < el.offsetWidth / 2);
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }, 80);
  });
}

// ==== Fitment Gallery (page-level, VPLP only) — reuses shared.js's PDP widget as-is =======
function plpFitGallerySectionHTML() {
  return `
  <section class="fit-gallery-section plp-fitgallery-inline" id="fitGallerySection" data-count="${window.PLP_CONFIG.fitGalleryCount || 300}">
    <div class="fit-gallery-panel" id="fitGalleryPanel">
      <div class="fit-gallery-head">
        <div class="fit-gallery-title">
          <span class="fit-gallery-badge">
            <svg viewBox="0 0 27 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.9 14.6c0-2-1.6-3.6-3.6-3.6-.6 0-1.2-.3-1.5-.9l-2-3.6c-.3-.5-.8-.9-1.4-.9l-11.3.02c-.5 0-1 .2-1.3.6L1.5 8.6C.6 9.8.2 11.3.7 12.8l.5 1.8c-.2.1-.5.2-.7.4-.3.3-.5.8-.5 1.2 0 1 .8 1.8 1.8 1.8h.9v.2c0 1.7 1.4 3.1 3.1 3.1s3.1-1.4 3.1-3.1v-.2l6.8.01v.2c0 1.7 1.4 3.1 3.1 3.1s3.1-1.4 3.1-3.1v-.1h3.2c1 0 1.7-.8 1.7-1.7v-.1c0-.9-.7-1.7-1.7-1.7z" fill="currentColor"/></svg>
          </span>
          <h2><span class="italic-lead">Fitment</span> Gallery</h2>
        </div>
        <a href="#" class="fit-gallery-viewall" data-fit-gallery-slideout>View All In-store Fitments (${window.PLP_CONFIG.fitGalleryCount || 300})</a>
      </div>
      <div class="fit-gallery-carousel">
        <button type="button" class="fit-gallery-nav prev" aria-label="Previous photos">‹</button>
        <div class="fit-gallery-track" id="fitGalleryTrack"></div>
        <button type="button" class="fit-gallery-nav next" aria-label="Next photos">›</button>
      </div>
      <div class="fit-gallery-dots" id="fitGalleryDots"></div>
    </div>
  </section>`;
}

// Re-run on every plpRenderResults() call (filters/sort/paging all re-insert this section
// fresh via innerHTML) — initFitGalleryCarousel() adds its own resize listener per call with
// no unbind, so a long filter-clicking session accumulates a few harmless stale listeners
// against detached nodes. Accepted for a reviewer-facing prototype rather than reworking
// shared.js's carousel init to be idempotent, which would touch all 6 templates that
// already call it once at load.
function plpInitFitGalleryWidget() {
  const track = document.getElementById('fitGalleryTrack');
  if (!track || typeof FIT_GALLERY_PHOTOS === 'undefined') return;
  track.innerHTML = FIT_GALLERY_PHOTOS.map((p, i) =>
    `<img src="${p.thumb}" data-fgs-open-index="${i}" role="button" tabindex="0" alt="Fitted to a customer's Toyota Hilux — view fitment detail">`
  ).join('');
  track.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => { if (typeof openFitGallerySlideoutAt === 'function') openFitGallerySlideoutAt(Number(img.dataset.fgsOpenIndex)); });
  });
  if (typeof buildFitGallerySlideout === 'function') buildFitGallerySlideout();
  if (typeof initFitGalleryCarousel === 'function') initFitGalleryCarousel();
}

// ==== Per-row Fitment Gallery (VPLP list rows, spec Section 7) ===============
// A distinct, independent drawer instance from the page-level widget above (same pattern
// the PDP prototypes already use for the Ex-Demo slide-out vs. the Store slide-out: "same
// backdrop/drawer/transition/close-button convention, just its own class family since the
// two drawers are independent"). Reuses the shared .fit-gallery-slideout* CSS classes
// directly so it is visually identical to the page-level widget's own drawer, per spec
// Section 7's "opens the exact same drawer/component as the PDP's Fitment Gallery."
function plpBuildRowFitGalleryDrawer() {
  if (document.getElementById('rowFitGallerySlideoutBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'fit-gallery-slideout-backdrop';
  backdrop.id = 'rowFitGallerySlideoutBackdrop';
  backdrop.innerHTML = `
    <div class="fit-gallery-slideout">
      <div class="fit-gallery-slideout-head">
        <h2 id="rowFgsTitle">In-store Fitments</h2>
        <button type="button" class="fgs-back-link" id="rowFgsBackLink" hidden>
          <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.3"/><rect x="14" y="3" width="7" height="7" rx="1.3"/><rect x="3" y="14" width="7" height="7" rx="1.3"/><rect x="14" y="14" width="7" height="7" rx="1.3"/></svg>
          Back to Grid View
        </button>
        <button type="button" class="fit-gallery-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="fit-gallery-slideout-body" id="rowFgsBody"></div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.classList.remove('open'); });
  backdrop.querySelector('.fit-gallery-slideout-close').addEventListener('click', () => backdrop.classList.remove('open'));
  backdrop.querySelector('#rowFgsBackLink').addEventListener('click', () => plpRenderRowFgGrid(plpRowFgProduct));
  backdrop.querySelector('#rowFgsBody').addEventListener('click', e => {
    if (e.target.closest('[data-fgs-load-more]')) { plpRowFgLoadMore(plpRowFgProduct); return; }
    const photo = e.target.closest('[data-fgs-open-index]');
    if (photo) { plpRenderRowFgDetail(plpRowFgProduct, Number(photo.dataset.fgsOpenIndex)); return; }
    const prev = e.target.closest('.fgs-prev');
    if (prev && !prev.disabled) { plpRenderRowFgDetail(plpRowFgProduct, plpRowFgIndex - 1); return; }
    const next = e.target.closest('.fgs-next');
    if (next && !next.disabled) { plpRenderRowFgDetail(plpRowFgProduct, plpRowFgIndex + 1); return; }
    if (e.target.closest('.fgs-back-to-product')) backdrop.classList.remove('open');
  });
}

let plpRowFgProduct = null;
let plpRowFgIndex = 0;
// Grid-view redesign (2026-09-18, PLP review item 5) shares fgsGroupedGridHTML/FGS_INITIAL_REVEAL/
// FGS_LOAD_STEP with the page-level widget — see their definition and rationale in shared.js.
let plpRowFgRevealed = FGS_INITIAL_REVEAL;

function plpRowFgPhotos(product) {
  return product.fitmentPhotos && product.fitmentPhotos.length ? product.fitmentPhotos : (typeof FIT_GALLERY_PHOTOS !== 'undefined' ? FIT_GALLERY_PHOTOS : []);
}

function plpOpenRowFitGallery(product) {
  plpRowFgProduct = product;
  plpRenderRowFgGrid(product);
  document.getElementById('rowFitGallerySlideoutBackdrop').classList.add('open');
}

function plpRenderRowFgGrid(product) {
  const photos = plpRowFgPhotos(product);
  const tileCount = Math.min(100, product.fitmentCount || photos.length);
  plpRowFgRevealed = Math.min(FGS_INITIAL_REVEAL, tileCount);
  document.getElementById('rowFgsTitle').hidden = false;
  document.getElementById('rowFgsTitle').textContent = `In-store Fitments (${product.fitmentCount})`;
  document.getElementById('rowFgsBackLink').hidden = true;
  const body = document.getElementById('rowFgsBody');
  body.className = 'fit-gallery-slideout-body';
  body.innerHTML = fgsGroupedGridHTML(photos, tileCount, plpRowFgRevealed);
}

function plpRowFgLoadMore(product) {
  const photos = plpRowFgPhotos(product);
  const tileCount = Math.min(100, product.fitmentCount || photos.length);
  plpRowFgRevealed = Math.min(tileCount, plpRowFgRevealed + FGS_LOAD_STEP);
  document.getElementById('rowFgsBody').innerHTML = fgsGroupedGridHTML(photos, tileCount, plpRowFgRevealed);
}

function plpRenderRowFgDetail(product, index) {
  const photos = plpRowFgPhotos(product);
  const tileCount = Math.min(100, product.fitmentCount || photos.length);
  const clamped = Math.max(0, Math.min(tileCount - 1, index));
  plpRowFgIndex = clamped;
  const photo = photos[clamped % photos.length];
  const others = photos.filter((_, i) => i !== (clamped % photos.length)).slice(0, 3);
  document.getElementById('rowFgsTitle').hidden = true;
  document.getElementById('rowFgsBackLink').hidden = false;
  const body = document.getElementById('rowFgsBody');
  body.className = 'fit-gallery-slideout-body fgs-detail-body';
  body.innerHTML = `
    <div class="fgs-browse-bar">
      <span>Browse Fitment <strong>${clamped + 1}</strong> of ${product.fitmentCount}</span>
      <span class="fgs-fit-id">Fit #${photo.id}</span>
    </div>
    <div class="fgs-nav-row">
      <button type="button" class="btn btn-outline fgs-prev" ${clamped === 0 ? 'disabled' : ''}>&lsaquo; Prev</button>
      <button type="button" class="btn btn-outline fgs-next" ${clamped === tileCount - 1 ? 'disabled' : ''}>Next &rsaquo;</button>
    </div>
    <div class="fgs-main-image"><img src="${photo.thumb}" alt="${product.name} fitted to a customer's vehicle"></div>
    <div class="fgs-thumbs">${[photo, ...others].map(p => `<img src="${p.thumb}" alt="">`).join('')}</div>
    <h3 class="fgs-product-title">${product.name}</h3>
    <div class="fgs-vehicle-line">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h1zm2.1-4l-1.2 4h12.2l-1.2-4a1 1 0 0 0-.9-.5H8a1 1 0 0 0-.9.5zM7 15.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>
      ${window.PLP_CONFIG.vehicleLabel || ''}
    </div>
    <div class="fgs-components">
      <h4>Rack Components</h4>
      ${(product.packageItems || []).map(c => `<div class="fgs-component-row"><span class="fgs-c-name">${c.name}</span><span class="fgs-c-qty">${c.qty}</span></div>`).join('')}
    </div>
    <p class="fgs-note">Note: fitment images may contain additional accessories or hardware that are not included in the rack system. <strong>Only items listed above are included.</strong></p>
    <button type="button" class="btn btn-outline fgs-back-to-product">Back to Product</button>
  `;
}

// ==== Vehicle-Set / Simple hero state ========================================
// Reuses the real, already-wired site-wide session flag (session-state.js's `vehicleSet`,
// toggled from the Site Admin Panel) rather than a new page-local control — see
// plp-spec.md Section 2 ("a vehicle exists in session, however it got there") and the
// 2026-09-17 build-plan decision to not add a new vehicle-selection UI this round.
function plpVehicleIsSet() {
  return typeof rrgSessionGet === 'function' ? rrgSessionGet('vehicleSet') : true;
}

function plpRenderHero() {
  const cfg = window.PLP_CONFIG;
  const heroSet = document.getElementById('plpHeroVehicleSet');
  const heroSimple = document.getElementById('plpHeroSimple');
  const isSet = plpVehicleIsSet();
  if (heroSet) heroSet.hidden = !isSet;
  if (heroSimple) heroSimple.hidden = isSet;
  // VRS categories: no vehicle set still shows the real, unfiltered catalogue (spec Section
  // 2's live-site finding) plus this CTA banner — never gated/empty.
  const vrsBanner = document.getElementById('plpVrsNoVehicleBanner');
  if (vrsBanner) vrsBanner.hidden = isSet;
  // Change Vehicle CTA up by the breadcrumbs (2026-09-18) only makes sense once a vehicle is
  // actually set — the no-vehicle state has its own, bigger "Set Your Vehicle" CTA in the
  // Simple hero instead, not a duplicate up here.
  const crumbsCta = document.querySelector('.plp-crumbs-cta');
  if (crumbsCta) crumbsCta.hidden = !isSet;
}

// Hero image 3-state fallback (2026-09-18 design review): session vehicle photo → category
// image → no image at all, in that priority order. Demo State Panel-only preview (see
// applyPlpHeroImageFlag's admin-panel radio group in shared.js buildAdminPanel()) — an
// independent override rather than derived from the Vehicle Set toggle, so a reviewer can see
// all 3 states without also having to flip session vehicle state. "None" collapses the
// Vehicle-Set hero to the same full-width .no-media layout the Simple-state hero already uses
// (2026-09-18 resolution: don't keep the empty second column).
function applyPlpHeroImageFlag(mode) {
  plpState.heroImageMode = mode;
  const cfg = window.PLP_CONFIG;
  const heroSet = document.getElementById('plpHeroVehicleSet');
  if (!heroSet) return;
  const mediaWrap = heroSet.querySelector('.plp-hero-media');
  const img = mediaWrap ? mediaWrap.querySelector('img.plp-hero-vehicle-img') : null;
  const badge = heroSet.querySelector('.plp-hero-make-badge');
  if (mode === 'none') {
    heroSet.classList.add('no-media');
    if (mediaWrap) mediaWrap.hidden = true;
    return;
  }
  const catImg = mode === 'category' ? plpActiveCategoryImage() : null;
  if (mode === 'category' && !catImg) {
    heroSet.classList.add('no-media');
    if (mediaWrap) mediaWrap.hidden = true;
    return;
  }
  heroSet.classList.remove('no-media');
  if (mediaWrap) mediaWrap.hidden = false;
  if (catImg) {
    if (img) img.src = catImg;
    if (badge) badge.hidden = true;
  } else {
    if (img) img.src = cfg.vehicleImage;
    if (badge) badge.hidden = false;
  }
}

// ==== Init ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  if (!window.PLP_CONFIG) return;
  plpState.view = window.PLP_CONFIG.defaultView === 'list' ? 'list' : 'grid';
  plpState.heroImageMode = 'vehicle';
  // ?q= (set by the header search dropdown's "View All Results" link, 2026-09-22) takes
  // priority over the page's own demo default so a real typed query actually lands here.
  if (window.PLP_CONFIG.isSearch) {
    const urlQuery = new URLSearchParams(window.location.search).get('q');
    plpState.searchQuery = (urlQuery !== null ? urlQuery : window.PLP_CONFIG.initialQuery) || '';
  }
  plpRenderShopBy();
  if (window.PLP_CONFIG.isSearch) { plpInitSearchBar(); plpRenderSearchTabs(); }
  plpRenderFilters();
  plpBuildFilterDrawer();
  plpInitToolbar();
  plpRenderVideos();
  plpRenderMerchSidebar();
  plpBuildCompareDrawer();
  if (window.PLP_CONFIG.vrs) plpBuildRowFitGalleryDrawer();
  plpRenderHero();
  plpRenderResults();
  plpRenderFAQ();
  plpRenderCategoryContent();
  window.addEventListener('resize', () => plpRenderResults());
  document.addEventListener('rrg-session-change', plpRenderHero);
  document.addEventListener('rrg-session-change', plpApplyCategoryImage);
  document.addEventListener('rrg-session-change', plpRenderResults);
});
