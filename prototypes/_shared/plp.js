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
  const v = product.facets[facetKey];
  if (v === undefined) return false;
  if (facetDef.mode === 'atleast') return Number(v) >= Number(selectedValue);
  return String(v) === String(selectedValue);
}

function plpMatchesShopBy(product, activeSubcat) {
  return !activeSubcat || activeSubcat === 'all' || (product.subcategories || []).includes(activeSubcat);
}

function plpMatchesFiltersExcept(product, activeFilters, exceptFacetKey, activeSubcat) {
  if (!plpMatchesShopBy(product, activeSubcat)) return false;
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
  activeFilters: {},     // { facetKey: Set(values) }
  view: 'grid',          // 'grid' | 'list' — reset from PLP_CONFIG.defaultView on init
  gridCols: 3,           // 3 | 4 — Demo State Panel test toggle, grid view only, desktop only (see plp.css). 3 is the default (2026-09-18, Brenton signed off), 4 kept as the fallback option.
  sort: 'relevance',
  page: 1,               // desktop numbered pagination
  visibleCount: PLP_PAGE_SIZE, // mobile "show more" cumulative count
  compareEnabled: false, // Demo State Panel toggle, off by default (spec Section 12)
  compareSelected: []    // up to 2 product ids
};

function plpFilteredSortedProducts() {
  const cfg = window.PLP_CONFIG;
  let list = cfg.products.filter(p => plpMatchesFiltersExcept(p, plpState.activeFilters, null, plpState.activeSubcat));
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
  plpState.activeFilters = {};
  plpState.page = 1;
  plpState.visibleCount = PLP_PAGE_SIZE;
  plpRenderShopBy();
  plpRenderFilters();
  plpRenderResults();
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

// ==== Filters sidebar ========================================================
function plpFilterGroupHTML(facetDef, isPriority) {
  const cfg = window.PLP_CONFIG;
  const options = facetDef.options.map(opt => {
    const count = cfg.products.filter(p => plpMatchesFiltersExcept(p, plpState.activeFilters, facetDef.key, plpState.activeSubcat) && plpValueMatches(p, facetDef.key, facetDef, opt.value)).length;
    const checked = plpState.activeFilters[facetDef.key] && plpState.activeFilters[facetDef.key].has(String(opt.value));
    return `
      <label class="plp-filter-option ${count === 0 && !checked ? 'is-zero' : ''}">
        <input type="checkbox" data-facet="${facetDef.key}" value="${opt.value}" ${checked ? 'checked' : ''}>
        <span>${opt.label}</span>
        <span class="plp-filter-count">${count}</span>
      </label>
    `;
  }).join('');
  if (isPriority) {
    return `
      <div class="plp-filter-group plp-filter-priority-group" data-facet-group="${facetDef.key}">
        <h4>${facetDef.label}</h4>
        <div class="plp-filter-options">${options}</div>
      </div>
    `;
  }
  return `
    <details class="plp-filter-group" data-facet-group="${facetDef.key}" open>
      <summary>${facetDef.label}</summary>
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
  return '';
}

function plpPriceHTML(product) {
  const now = plpFmtMoney(product.price);
  if (!product.wasPrice) return `<div class="plp-price"><span class="plp-price-now">${now}</span></div>`;
  const was = plpFmtMoney(product.wasPrice);
  return `
    <div class="plp-price">
      <span class="plp-price-now">${now}</span>
      <span class="plp-price-was">${was}</span>
    </div>
  `;
}

// Same seasonal graphic + same on-sale condition as the PDP gallery/price-block sale tag
// (shared.css .gallery-sale-tag / .price-block .sale-tag) — only shown when the product
// actually has a wasPrice, mirroring plpPriceHTML's own check above.
function plpSaleTagHTML(product) {
  if (!product.wasPrice) return '';
  return `<img class="plp-sale-tag" src="../_shared/sale-tag.png" alt="Sale">`;
}

function plpFmtMoney(n) {
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function plpRatingHTML(product) {
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
    low_stock: { cls: 'low-stock', label: '⚠ Low Stock' }
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

function plpCardHTML(product, cfg) {
  const vrsRow = cfg.vrs ? `
    <div class="plp-vrs-actions">
      <button type="button" class="btn btn-outline plp-fitgallery-btn" data-fitgallery-id="${product.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        Fitment Gallery (${product.fitmentCount})
      </button>
      <a href="#" class="btn btn-gold plp-view-options-btn">View Options</a>
    </div>
  ` : `<a href="#" class="btn btn-gold btn-block">View Details</a>`;

  return `
    <div class="plp-card" data-product-id="${product.id}">
      <div class="plp-card-media ${product.imageSvg ? 'is-placeholder' : ''}">
        ${plpRibbonHTML(product)}
        ${plpSaleTagHTML(product)}
        ${product.imageSvg ? product.imageSvg : `<img class="plp-card-photo" src="${product.image}" alt="${product.name}">`}
      </div>
      <div class="plp-card-body">
        ${plpBrandHTML(product)}
        <h3 class="plp-card-title">${product.name}</h3>
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
  const ctaLabel = cfg.vrs ? 'View Options' : 'View Details';
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
        <div class="plp-card-media ${product.imageSvg ? 'is-placeholder' : ''}">
          ${plpBrandOverlayHTML(product)}
          ${product.imageSvg ? product.imageSvg : `<img class="plp-card-photo" src="${product.image}" alt="${product.name}">`}
        </div>
        ${fitGalleryBtn}
      </div>
      <div class="plp-list-col-info">
        <h3 class="plp-card-title">${product.name}</h3>
        ${plpRatingHTML(product)}
        ${usps}
      </div>
      <div class="plp-list-col-actions">
        ${plpRibbonHTML(product)}
        ${plpPriceHTML(product)}
        ${plpSaleTagHTML(product)}
        ${plpStockLineHTML(product)}
        <a href="#" class="btn btn-gold">${ctaLabel}</a>
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

  const all = plpFilteredSortedProducts();
  const total = all.length;

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

  if (countLabel) {
    const from = total === 0 ? 0 : (isMobile ? 1 : (plpState.page - 1) * PLP_PAGE_SIZE + 1);
    const to = isMobile ? visible.length : Math.min(plpState.page * PLP_PAGE_SIZE, total);
    countLabel.textContent = `Showing ${from}-${to} of ${total} Results`;
  }
  if (mobileCountLabel) mobileCountLabel.textContent = `Showing ${visible.length} of ${total} Results`;

  plpRenderPagination(total);
  plpBindCardEvents();
  if (cfg.vrs && plpVehicleIsSet()) {
    plpInitFitGalleryWidget();
  }
}

function plpRenderPagination(total) {
  const desktopWrap = document.getElementById('plpPaginationDesktop');
  const mobileWrap = document.getElementById('plpPaginationMobile');
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
function plpRenderVideos() {
  const cfg = window.PLP_CONFIG;
  const sidebar = document.getElementById('plpVideoSidebar');
  const carousel = document.getElementById('plpVideoCarouselTrack');
  if (sidebar) {
    const vids = (cfg.videos || []).slice(0, 2); // sidebar module capped at 2 (Section 10.1)
    sidebar.innerHTML = vids.length ? `
      <h4 class="plp-video-sidebar-heading">Watch &amp; Learn</h4>
      ${vids.map(v => `
        <a class="plp-video-tile" href="${v.url || '#'}" target="_blank" rel="noopener">
          <img src="${v.thumb}" alt="${v.title}">
          <span class="plp-video-play">&#9658;</span>
          <span class="plp-video-title">${v.title}</span>
        </a>
      `).join('')}
    ` : '';
  }
  if (carousel) {
    // Bottom carousel aggregates every video across the category and its subcategories, no
    // cap (Section 10.2) — this demo's whole video set stands in for that combined pool.
    carousel.innerHTML = (cfg.videos || []).map(v => `
      <a class="plp-video-tile" href="${v.url || '#'}" target="_blank" rel="noopener">
        <img src="${v.thumb}" alt="${v.title}">
        <span class="plp-video-play">&#9658;</span>
        <span class="plp-video-title">${v.title}</span>
      </a>
    `).join('');
  }
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

function plpOpenRowFitGallery(product) {
  plpRowFgProduct = product;
  plpRenderRowFgGrid(product);
  document.getElementById('rowFitGallerySlideoutBackdrop').classList.add('open');
}

function plpRenderRowFgGrid(product) {
  const photos = product.fitmentPhotos && product.fitmentPhotos.length ? product.fitmentPhotos : (typeof FIT_GALLERY_PHOTOS !== 'undefined' ? FIT_GALLERY_PHOTOS : []);
  document.getElementById('rowFgsTitle').hidden = false;
  document.getElementById('rowFgsTitle').textContent = `In-store Fitments (${product.fitmentCount})`;
  document.getElementById('rowFgsBackLink').hidden = true;
  const body = document.getElementById('rowFgsBody');
  body.className = 'fit-gallery-slideout-body';
  const tileCount = Math.min(100, product.fitmentCount || photos.length);
  let html = '';
  for (let i = 0; i < tileCount; i++) {
    html += `<img src="${photos[i % photos.length].thumb}" data-fgs-open-index="${i}" role="button" tabindex="0" alt="${product.name} fitted to a customer's vehicle — view fitment detail">`;
  }
  body.innerHTML = html;
}

function plpRenderRowFgDetail(product, index) {
  const photos = product.fitmentPhotos && product.fitmentPhotos.length ? product.fitmentPhotos : (typeof FIT_GALLERY_PHOTOS !== 'undefined' ? FIT_GALLERY_PHOTOS : []);
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
}

// ==== Init ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  if (!window.PLP_CONFIG) return;
  plpState.view = window.PLP_CONFIG.defaultView === 'list' ? 'list' : 'grid';
  plpRenderShopBy();
  plpRenderFilters();
  plpBuildFilterDrawer();
  plpInitToolbar();
  plpRenderVideos();
  plpBuildCompareDrawer();
  if (window.PLP_CONFIG.vrs) plpBuildRowFitGalleryDrawer();
  plpRenderHero();
  plpRenderResults();
  window.addEventListener('resize', () => plpRenderResults());
  document.addEventListener('rrg-session-change', plpRenderHero);
  document.addEventListener('rrg-session-change', plpRenderResults);
});
