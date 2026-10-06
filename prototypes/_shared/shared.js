// Roof Racks Galore — shared fitment logic for vehicle-specific PDP prototypes
// Implements spec Section 2.1: getFitmentStatus is a pure function of (productFitment, sessionVehicle).

const PRODUCT_FITMENT = {
  vehicle_make: "Toyota",
  vehicle_model: "Hilux",
  vehicle_generation: "N80",
  vehicle_years: "2015-2026",
  body_style: "4dr Ute",
  roof_type: "Bare Roof"
};

// Vehicle slug/ID for the sticky-bar copy-to-clipboard icon (2026-09-11, backlog item 10)
// — no real per-vehicle slug/ID field exists in the data model yet, so this is derived
// from PRODUCT_FITMENT the same way a URL slug would be, same demo-data caveat as
// DEMO_VEHICLES below.
const VEHICLE_SLUG = `${PRODUCT_FITMENT.vehicle_make}-${PRODUCT_FITMENT.vehicle_model}-${PRODUCT_FITMENT.vehicle_generation}`.toLowerCase().replace(/\s+/g, '-');

// body_style/roof_type (2026-09-10, Graham Sowerby meeting) — added so the "doesn't fit"
// message can name the customer's saved vehicle's full spec, not just its name (two
// vehicles can share a make/model/generation but differ by roof/rail type). No real
// per-customer vehicle data source exists at prototype stage, so these are demo values,
// same caution as the rest of this file's fabricated data.
const DEMO_VEHICLES = {
  none: null,
  match: { make: "Toyota", model: "Hilux", generation: "N80", year: 2022, body_style: "4dr Ute", roof_type: "Bare Roof" },
  mismatch: { make: "Ford", model: "Ranger", generation: "P703", year: 2023, body_style: "4dr Ute", roof_type: "Raised Roof Rail" }
};

function getFitmentStatus(productFitment, sessionVehicle) {
  if (!sessionVehicle) return "unknown";
  const [startYear, endYear] = productFitment.vehicle_years.split("-").map(Number);
  const makeMatch = sessionVehicle.make === productFitment.vehicle_make;
  const modelMatch = sessionVehicle.model === productFitment.vehicle_model;
  const genMatch = sessionVehicle.generation === productFitment.vehicle_generation;
  const yearMatch = sessionVehicle.year >= startYear && sessionVehicle.year <= endYear;
  if (makeMatch && modelMatch && genMatch && yearMatch) return "fits";
  return "no_fit";
}

const FITMENT_COPY = {
  fits: {
    label: "Fits your vehicle",
    detail: `Confirmed for your ${PRODUCT_FITMENT.vehicle_make} ${PRODUCT_FITMENT.vehicle_model} ${PRODUCT_FITMENT.vehicle_generation} (${PRODUCT_FITMENT.body_style}, ${PRODUCT_FITMENT.roof_type}).`,
    actions: []
  },
  unknown: {
    label: "Confirm your vehicle",
    detail: `This product suits ${PRODUCT_FITMENT.vehicle_make} ${PRODUCT_FITMENT.vehicle_model} ${PRODUCT_FITMENT.vehicle_generation} (${PRODUCT_FITMENT.body_style}, ${PRODUCT_FITMENT.roof_type}). Set your vehicle to confirm an exact fit before ordering.`,
    actions: ["Select your vehicle"]
  },
  no_fit: {
    label: "Doesn't fit your vehicle",
    // A function, not a static string (2026-09-10, Graham Sowerby meeting) — needs the
    // customer's full saved vehicle spec (body style, roof type, year), not just its name,
    // since two vehicles can share a make/model/generation but differ by roof/rail type.
    detail: (vehicle) => `This product is built for ${PRODUCT_FITMENT.vehicle_make} ${PRODUCT_FITMENT.vehicle_model} ${PRODUCT_FITMENT.vehicle_generation} — not your ${vehicle.make} ${vehicle.model} ${vehicle.generation} (${vehicle.body_style}, ${vehicle.roof_type}, ${vehicle.year}).`,
    actions: ["Change vehicle", "Find the right fit"]
  }
};

function renderFitmentHTML(state, vehicle, mode) {
  const c = FITMENT_COPY[state];
  const icon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h1zm2.1-4l-1.2 4h12.2l-1.2-4a1 1 0 0 0-.9-.5H8a1 1 0 0 0-.9.5zM7 15.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>`;
  // Compact + copy-to-clipboard variants (2026-09-11, backlog item 10) — the two condensed
  // sticky bars get no detail sentence/actions (there's no room at that width, and the
  // full explanation already showed once in the main decision-panel card above). The
  // desktop persistent bar has room for icon + short label ("compact"); the mobile sticky
  // bar is tighter still (competing with the new product-name block) so it's icon-only
  // there, same "icon only, tooltip carries the caption" convention already used for the
  // Rack Fit Guarantee badge. Icon doubles as a click-to-copy button for the vehicle
  // slug/ID in both; the main card keeps a plain, non-interactive icon plus its full copy.
  // See applyFitmentState() below for which slots opt into which mode via
  // [data-fitment-copyable]'s value.
  if (mode === 'icon-only') {
    return `<span class="dot dot-copy" data-vehicle-copy="${VEHICLE_SLUG}" role="button" tabindex="0" title="${c.label} — click to copy vehicle ID">${icon}</span>`;
  }
  if (mode === 'compact') {
    return `
      <span class="dot dot-copy" data-vehicle-copy="${VEHICLE_SLUG}" role="button" tabindex="0" title="Click to copy vehicle ID">${icon}</span>
      <strong>${c.label}</strong>
    `;
  }
  const detail = typeof c.detail === 'function' ? c.detail(vehicle) : c.detail;
  const actions = c.actions.length
    ? `<div class="actions">${c.actions.map(a => `<button type="button" class="btn btn-outline-red btn-sm"${/vehicle/i.test(a) ? ' data-open-fit-finder' : ''}>${a}</button>`).join("")}</div>`
    : "";
  return `
    <span class="dot">${icon}</span>
    <div>
      <strong>${c.label}</strong>
      ${detail}
      ${actions}
    </div>
  `;
}

function applyFitmentState(state, vehicle) {
  document.querySelectorAll('[data-fitment-slot]').forEach(el => {
    el.className = el.className.replace(/\b(fits|unknown|no_fit)\b/g, '').trim();
    el.classList.add(state);
    el.innerHTML = renderFitmentHTML(state, vehicle, el.dataset.fitmentCopyable);
    // Rack Fit Guarantee badge (2026-09-10) only makes sense when the vehicle is
    // actually confirmed to fit — hide it for "confirm your vehicle"/"doesn't fit".
    const badge = el.nextElementSibling;
    if (badge && (badge.classList.contains('rack-fit-badge') || badge.classList.contains('rack-fit-badge-icon'))) {
      // toggleAttribute, not `badge.hidden = ...`: badge is an <svg>, and SVGElement doesn't
      // reflect the boolean `hidden` IDL property to the content attribute in every browser —
      // setting `.hidden` silently no-ops, leaving [hidden]{display:none} never applied and
      // the badge visible in every fitment state (found 2026-09-12 while recapturing §7.2/7.3
      // screenshots — this had never actually hidden in "doesn't fit"/"confirm your vehicle").
      badge.toggleAttribute('hidden', state !== 'fits');
    }
  });
  // Add to Cart stays plain "Add To Cart" / primary style in every fitment state
  // (2026-09-12, spec.md §12 item 9 follow-up) — purchase should never look any
  // different depending on fitment status, only the fitment card itself (rendered
  // above via renderFitmentHTML(), which does its own FITMENT_COPY lookup) communicates
  // the verdict and its own "Select your vehicle"/"Find the right fit" actions.
  document.querySelectorAll('[data-cta-label]').forEach(btn => {
    btn.textContent = 'Add To Cart';
    btn.classList.remove('btn-outline');
    btn.classList.add('btn-cta');
  });
  initVehicleIdCopy();
}

// Vehicle ID copy-to-clipboard (2026-09-11, backlog item 10) — bound fresh every time
// applyFitmentState() re-renders a [data-fitment-copyable] slot's innerHTML (re-binding
// is cheap and dataset.copyBound guards against double-binding on unaffected slots).
// A dedicated handler rather than the generic .sku-copy convention in initCopyButtons()
// above: that one replaces the clicked element's own textContent with "✓ Copied", which
// would blank out this element's <svg> icon instead of giving visible feedback.
function initVehicleIdCopy() {
  document.querySelectorAll('[data-vehicle-copy]').forEach(el => {
    if (el.dataset.copyBound) return;
    el.dataset.copyBound = 'true';
    const activate = () => {
      const text = el.dataset.vehicleCopy || '';
      if (!text) return;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
      el.classList.add('copied');
      clearTimeout(el._copyTimer);
      el._copyTimer = setTimeout(() => el.classList.remove('copied'), 1400);
    };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

// The fitment card follows the session vehicle (Site Admin "Vehicle", session-state.js) —
// was the Demo State Panel's own "Session Vehicle" buttons, which contradicted the header
// (spec.md §15 P4). Re-applied on every session change.
function applySessionFitment() {
  if (typeof PRODUCT_FITMENT === 'undefined' || !document.querySelector('[data-fitment-slot]')) return;
  const session = typeof rrgVehicle === 'function' ? rrgVehicle() : null;
  const vehicle = session ? DEMO_VEHICLES[session.demoKey] : null;
  applyFitmentState(getFitmentStatus(PRODUCT_FITMENT, vehicle), vehicle);
}
document.addEventListener('rrg-session-change', () => {
  applySessionFitment();
  // applyFitmentState() resets Add to Cart — re-apply an Out of Stock/Discontinued block on top.
  const stock = adminState.stockStatus && STOCK_STATUS[adminState.stockStatus];
  if (stock && stock.blocksCta) applyStockStatus(adminState.stockStatus);
});

// Delivery / Click & Collect widget — tab switching (reusable across templates)
function initDeliveryCollectTabs(root = document) {
  root.querySelectorAll('.dc-widget').forEach(widget => {
    const tabs = widget.querySelectorAll('.dc-tab');
    const panels = widget.querySelectorAll('.dc-panel');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        panels.forEach(p => p.hidden = p.dataset.dcPanel !== tab.dataset.dcTab);
      });
    });
  });
}

// Reveals a results block below a postcode input — mock lookup for prototype purposes.
function revealResults(resultsId) {
  const el = document.getElementById(resultsId);
  if (el) el.hidden = false;
}

// Delivery / Click & Collect widget — the single postcode field shared across both tabs
// (2026-09-10 rework: was two separate, unsynced inputs), starts empty (2026-09-10 follow-up
// — a prefilled demo postcode read as real customer data it isn't). The "Update" button is a
// light demo re-trigger against the same static data (no real geocoding), which swaps the
// copy on the Click & Collect view-all line between the two states below, AND — since
// showing named stores or delivery rates with no postcode entered implied a real match that
// wasn't real — hides BOTH panels' results entirely until a postcode is actually typed in
// (corrected 2026-09-10, second follow-up: Delivery was originally left showing regardless,
// same bug the Collect tab had already been fixed for). The "In stock and on display in N
// stores — View all stores" line stays visible either way; only the named store rows are
// gated. Delivery's `.dc-postcode-prompt` swaps places with its results the same way.
//
// Backlog item 13 (2026-09-11): a second `.dc-widget` now also lives at the top of the
// Shipping Info tab on every template, so this function runs once per widget on the page
// (root.querySelectorAll below). Committing a postcode in either one calls syncDcPostcode()
// below, which mirrors the value into every other `.dc-widget` and re-runs their own
// update() — "pre-filled if a postcode was entered anywhere else in the session" applies
// live, in both directions, not just once at load. The postcode input is found via
// `[data-dc-postcode]` (not an id) since a page can now carry more than one.
function initDcPostcode(root = document) {
  root.querySelectorAll('.dc-widget').forEach(widget => {
    const input = widget.querySelector('[data-dc-postcode]');
    const btn = widget.querySelector('[data-dc-update]');
    const line = widget.querySelector('.dc-viewall-line');
    const collectResults = widget.querySelector('[data-dc-panel="collect"] .dc-results');
    const deliveryResults = widget.querySelector('[data-dc-panel="delivery"] .dc-results');
    const deliveryPrompt = widget.querySelector('[data-dc-panel="delivery"] .dc-postcode-prompt');
    if (!input || !btn) return;
    // Region Selector (2026-09-11, backlog item 21): NZ/UK are single-store demo regions
    // with no real postcode-matched store data (the named `.dc-store` rows and 100km-radius
    // copy are all real AU network content) — while either is selected, the line always
    // shows the fixed single-store copy and named results stay hidden regardless of what's
    // typed, rather than searching AU postcodes against a region that isn't AU.
    const update = () => {
      const val = input.value.trim();
      if (line) {
        if (currentRegion !== 'AU') {
          // No trailing " — " here (unlike the AU branch below) since the "View all
          // stores" link that dash used to lead into is hidden for single-store regions.
          const singleStore = REGION_SINGLE_STORES[currentRegion];
          line.firstChild.textContent = singleStore.onDisplay
            ? `On display at the ${singleStore.name} Store`
            : `In stock at the ${singleStore.name} Store`;
        } else {
          line.firstChild.textContent = val
            ? `Showing stores within 100km of ${val} — `
            : `Click & Collect from ${rrgStoreCount()} stores — `;
        }
      }
      const regionOk = currentRegion === 'AU';
      if (collectResults) collectResults.hidden = !val || !regionOk;
      if (deliveryResults) deliveryResults.hidden = !val || !regionOk;
      if (deliveryPrompt) deliveryPrompt.hidden = !!val && regionOk;
    };
    input._dcUpdate = update;
    const commit = () => syncDcPostcode(input.value.trim());
    btn.addEventListener('click', commit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    update();
  });
}

// Mirrors a postcode typed into any one `.dc-widget` into every other one on the page (see
// initDcPostcode() above) and, AU-only, re-renders the Store Slide-out's "Within 100km"
// grouping (backlog item 14 — see renderStoreSlideoutBody()/postcodeToState() below) so it
// reflects whatever postcode is currently live, without needing separate wiring.
function syncDcPostcode(value) {
  document.querySelectorAll('.dc-widget').forEach(widget => {
    const input = widget.querySelector('[data-dc-postcode]');
    if (!input) return;
    input.value = value;
    if (input._dcUpdate) input._dcUpdate();
  });
  renderStoreSlideoutBody(currentRegion === 'AU' ? postcodeToState(value) : null);
}

// Real AU postcode-digit ranges (Australia Post's own zoning, not a fabricated guess) — used
// only to work out which state's stores to promote into the Store Slide-out's "Within 100km"
// group (backlog item 14). This is genuine postal-district logic, not literal distance/
// geocoding, which this prototype has never had (same flagged gap as the Showroom map's own
// postcode search) — same "demo precision, real underlying relationship" convention as the
// rest of this project's store data.
function postcodeToState(postcode) {
  const trimmed = String(postcode || '').trim();
  if (!/^\d{4}$/.test(trimmed)) return null;
  const n = parseInt(trimmed, 10);
  if (n >= 2600 && n <= 2618) return 'Australian Capital Territory';
  if (n >= 2900 && n <= 2920) return 'Australian Capital Territory';
  if (n >= 1000 && n <= 2999) return 'New South Wales';
  if ((n >= 3000 && n <= 3999) || (n >= 8000 && n <= 8999)) return 'Victoria';
  if ((n >= 4000 && n <= 4999) || (n >= 9000 && n <= 9999)) return 'Queensland';
  if (n >= 5000 && n <= 5999) return 'South Australia';
  if (n >= 6000 && n <= 6999) return 'Western Australia';
  if (n >= 7000 && n <= 7999) return 'Tasmania';
  if (n >= 800 && n <= 999) return 'Northern Territory';
  return null;
}

// Persistent decision bar — shows once the given sentinel element scrolls above the viewport.
function initPersistentBar(sentinelSelector, barSelector) {
  const sentinel = document.querySelector(sentinelSelector);
  const bar = document.querySelector(barSelector);
  if (!sentinel || !bar) return;
  const observer = new IntersectionObserver(([entry]) => {
    const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    bar.classList.toggle('visible', scrolledPast);
  }, { threshold: 0 });
  observer.observe(sentinel);
}

document.addEventListener('DOMContentLoaded', () => {
  initDeliveryCollectTabs();
  initDcPostcode();
});

// Gallery thumbnail carousel — wraps every .gallery-thumbs row (however its images got
// there: static markup or a page's own renderGallery()) in a scroll container with
// prev/next nav, so 5+ images scroll in one row instead of wrapping to a second row.
// Runs once at load; a MutationObserver keeps nav state in sync with later re-renders
// (variant/colour swaps that replace .gallery-thumbs' innerHTML).
// Gallery thumbnails — one delegated handler for every PDP (spec.md §15 D3): swaps the main
// image and moves the .active border to the clicked thumb. Was an inline onclick per thumb,
// and on Simple/Grouped/Vehicle-Specific the active border never moved off thumb 1.
document.addEventListener('click', e => {
  const thumb = e.target.closest('.gallery-thumbs img');
  if (!thumb) return;
  const main = document.getElementById('mainImg');
  if (main) main.src = thumb.src;
  thumb.parentElement.querySelectorAll('img').forEach(img => img.classList.toggle('active', img === thumb));
});

function initGalleryCarousels() {
  document.querySelectorAll('.gallery-thumbs').forEach(el => {
    if (el.parentElement.classList.contains('gallery-thumbs-wrap')) return;

    const wrap = document.createElement('div');
    wrap.className = 'gallery-thumbs-wrap';
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'thumb-nav prev';
    prev.setAttribute('aria-label', 'Scroll thumbnails left');
    prev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'thumb-nav next';
    next.setAttribute('aria-label', 'Scroll thumbnails right');
    next.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';

    wrap.appendChild(prev);
    wrap.appendChild(next);

    prev.addEventListener('click', () => el.scrollBy({ left: -el.clientWidth * 0.8, behavior: 'smooth' }));
    next.addEventListener('click', () => el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' }));

    const updateNav = () => {
      const scrollable = el.scrollWidth > el.clientWidth + 2;
      wrap.classList.toggle('has-overflow', scrollable);
      prev.disabled = el.scrollLeft <= 2;
      next.disabled = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
    };
    el.addEventListener('scroll', updateNav);
    window.addEventListener('resize', updateNav);
    new MutationObserver(updateNav).observe(el, { childList: true });
    updateNav();
  });
}

document.addEventListener('DOMContentLoaded', initGalleryCarousels);

// ---- Demo state panel ----
// Floating button + panel letting a reviewer toggle simulated product states (video, sale,
// stock, shipping/click&collect availability) and, on vehicle-specific, the session vehicle
// used for fitment — so any template can be previewed in whichever state is relevant to it.
// Everything is driven generically off existing markup (.install-media-row, .price-block,
// .dc-widget, [data-cta-label], [data-fitment-slot]) — no page-specific wiring required,
// beyond one optional reapplySaleFlag() call pages with their own re-render loop should
// make at the end of it (see config-variant / sibling-color).

const adminState = { video: true, sale: true, stock: true, shipping: true, collect: true, exdemo: false, fittedOption: false, fittedMode: 'card', fitGallery: true, vehicleFitNotes: false };

function detectInitialVideoState() {
  const pairedRow = document.querySelector('.install-media-row');
  if (pairedRow) return !pairedRow.classList.contains('no-video');
  const standalone = document.querySelector('[data-admin-video]');
  if (standalone) return !standalone.hidden;
  return false;
}

function detectInitialSaleState() {
  const wasEl = document.querySelector('.price-block .price-was');
  return !!wasEl && !wasEl.hidden;
}

function detectInitialShippingState() {
  const tab = document.querySelector('.dc-widget [data-dc-tab="delivery"]');
  return !tab || !tab.hidden;
}

function detectInitialCollectState() {
  const tab = document.querySelector('.dc-widget [data-dc-tab="collect"]');
  return !tab || !tab.hidden;
}

// Showroom Finder is now standard on every template (client ask, 2026-09-10) — the
// Demo State Panel toggle previews the case where a given SKU isn't on display anywhere,
// rather than gating whether the section exists at all.
function applyShowroomFlag(on) {
  adminState.showroom = on;
  const section = document.getElementById('showroom');
  if (section) section.hidden = !on;
}

function detectInitialFitGalleryState() {
  return !!document.getElementById('fitGallerySection');
}

// Fitment Gallery on/off (2026-09-10, Graham Sowerby meeting; count thresholds added
// 2026-09-11, backlog item 17) — toggle previews a vehicle with no real Fitment Gallery:
// hides the section itself and swaps the Get It Installed CTA back to the generic fallback
// copy, so the two stay in sync rather than showing a changed CTA next to a gallery that's
// still there. Count itself branches three ways: a real 5+ count is worth naming ("We've
// fitted this N times"), 1-4 is technically real but too small to read as an impressive
// number so it's dropped ("See real fitments"), and a gallery that exists but has zero
// fitments has nothing to show at all — same literal "Get It Installed" copy and external
// fallback link as the no-gallery-at-all state below, just kept as its own branch since it's
// a genuinely different scenario (gallery present vs. gallery absent).
function applyFitGalleryFlag(on) {
  adminState.fitGallery = on;
  const section = document.getElementById('fitGallerySection');
  if (section) section.hidden = !on;
  const cta = document.querySelector('.install-cta-panel .btn');
  if (!cta) return;
  const count = section ? parseInt(section.dataset.count, 10) || 0 : 0;
  const fallbackLink = () => {
    cta.href = '/roof-rack-installation-and-fitting-costs';
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
  };
  if (on && count >= 5) {
    cta.textContent = `We've fitted this ${count} times — view the gallery`;
    cta.href = '#fitGallerySection';
    cta.removeAttribute('target');
    cta.removeAttribute('rel');
  } else if (on && count > 0) {
    cta.textContent = 'See real fitments';
    cta.href = '#fitGallerySection';
    cta.removeAttribute('target');
    cta.removeAttribute('rel');
  } else if (on) {
    cta.textContent = 'Get It Installed';
    fallbackLink();
  } else {
    cta.textContent = 'See Fitting Options';
    fallbackLink();
  }
}

// Important Vehicle Fit Notes (2026-09-10, Graham Sowerby meeting) — variable-length,
// not present on every vehicle, so it's demo-toggled off by default (no real per-vehicle
// notes data source exists yet).
function applyVehicleFitNotesFlag(on) {
  adminState.vehicleFitNotes = on;
  const block = document.getElementById('vehicleFitNotes');
  if (block) block.hidden = !on;
}

function applyVideoFlag(on) {
  adminState.video = on;
  document.querySelectorAll('.install-media-row').forEach(row => row.classList.toggle('no-video', !on));
  document.querySelectorAll('[data-admin-video]').forEach(el => { el.hidden = !on; });
}

// Mirrors every .sale-tag corner graphic on the page (the price-block instance, desktop;
// the .gallery-sale-tag instance over the main image, mobile — spec.md Section 12 item 23
// follow-up) to the price block's real discount-visible state — kept separate from the
// admin-flag override below so it stays correct even when a variant/colour with no real
// discount (e.g. Titanium Grey) is showing. Not scoped to a single .decision-panel: a page
// only ever has one product/one sale state, regardless of how many tag instances currently
// show, so every .sale-tag on the page should always agree.
function syncSaleTag(block) {
  const wasEl = block.querySelector('.price-was');
  if (!wasEl) return;
  document.querySelectorAll('.sale-tag').forEach(tag => { tag.hidden = wasEl.hidden; });
  // Save band on the main product photo — the same diagonal "Save N%" corner every product card
  // uses (.plp-save-corner), replacing the price block's old Save pill (2026-09-29, spec.md §15
  // L9: PDP sale styling = card styling + the sale-tag image). Mirrors the price block's own
  // .badge-save text/visibility, which every template's price code already keeps current.
  const badge = block.querySelector('.badge-save');
  const main = document.querySelector('.gallery-main');
  if (!badge || !main) return;
  let corner = main.querySelector('.plp-save-corner');
  if (!corner) {
    corner = document.createElement('div');
    corner.className = 'plp-save-corner';
    corner.innerHTML = '<span></span>';
    main.appendChild(corner);
  }
  corner.querySelector('span').textContent = badge.textContent;
  // A saving that rounds to 0% (Thule Motion 3 L Gloss Black: 95c off) shows no band — same rule
  // as the product cards (plp.js only draws the corner when pct > 0).
  corner.hidden = wasEl.hidden || badge.hidden || !badge.textContent.trim() || /\b0%/.test(badge.textContent);
}

// Payment-plan badge provider set, per region (backlog items 31/31a, 2026-09-11): AU keeps
// Afterpay + PayPal ("Pay in 4" each) + Zip (weekly rate); NZ drops Zip entirely (not offered
// there — array just has 2 entries, syncPaymentBadges() below hides whatever slot is left
// over generically); UK swaps to a different 3-provider set — Clearpay (Afterpay's UK/EU
// brand, same "Pay in 4" structure) + PayPal (same provider, but "Pay in 3" — ÷3 not ÷4) +
// Klarna (a separate "Pay in 3" provider from PayPal's own, kept as its own badge rather than
// merged/deduped, confirmed with Brenton). Zip's weekly-rate formula is unchanged from before
// this rework: approximates its real "as low as $X/week" widget as price/10 rounded up to the
// dollar, floored at $10.
function paymentBadgeSet(region) {
  const payIn4 = price => `4 payments of ${fmtAud(price / 4)}`;
  const zipWeekly = price => `From ${regionCurrencySymbol()}${Math.max(10, Math.ceil(price / 10))} a week`;

  // NZ and UK offer no buy-now-pay-later on their live sites (2026-09-30), so no instalment
  // badges there — was Afterpay (NZ) and Clearpay/PayPal/Klarna (UK).
  if (region === 'UK' || region === 'NZ') return [];
  return [
    { src: 'afterpay.svg', alt: 'Afterpay', text: payIn4 },
    { src: 'paypal.svg', alt: 'PayPal', text: payIn4 },
    { src: 'zip.svg', alt: 'Zip', text: zipWeekly, height: '13px' }
  ];
}

// Fills each of the 3 generic .payment-badge slots (logo + instalment text) from the current
// region's provider set — runs on load and after every price-changing render (via
// reapplySaleFlag()) and on every region switch (via applyRegion()), so it always reflects
// both the current price and the current region's provider set. A region with fewer than 3
// providers (NZ) just hides the leftover slot(s); the flex row re-centers on its own since
// .payment-badge{flex:1} + a hidden 3rd child collapses out of the layout with no gap.
function syncPaymentBadges(block) {
  const panel = block.closest('.decision-panel');
  const badges = panel && panel.querySelector('.payment-badges');
  if (!badges) return;
  const price = currentPagePrice(block);
  const set = paymentBadgeSet(currentRegion);
  badges.hidden = !set.length;
  badges.querySelectorAll('.payment-badge').forEach((el, i) => {
    const entry = set[i];
    el.hidden = !entry;
    if (!entry) return;
    const img = el.querySelector('.pb-logo');
    const text = el.querySelector('.pb-text');
    if (img) { img.src = `${RRG_PROTO}_shared/payment-logos/${entry.src}`; img.alt = entry.alt; img.style.height = entry.height || ''; }
    if (text) text.textContent = entry.text(price);
  });
}

// Hides the real sale price/badge if the panel currently has "on sale" switched off, and
// keeps the sale tag graphic in sync either way. Safe to call after any re-render (the
// price-override half is a no-op once adminState.sale is true again) — pages with their
// own renderAll()/renderPrice() loop should call this at the end of it, since that's the
// only state a re-render can clobber (video/stock/availability use class or attribute
// toggles that a re-render never touches).
// "Now"/"Was" labels + the stacked price-line layout (spec.md Section 12 item 23) only
// make sense when there's a real was-price to contrast against — this mirrors .price-was's
// own hidden state rather than tracking the demo sale toggle directly, so it stays correct
// for a per-variant/colour discount too (e.g. sibling-color's Titanium Grey, which has no
// real discount even while the page's overall "sale" flag is on), not just the admin panel.
function syncPriceLabels(block) {
  const wasEl = block.querySelector('.price-was');
  const lineWas = block.querySelector('.price-line-was');
  const labelNow = block.querySelector('.price-line-now .price-label');
  const onSale = !!wasEl && !wasEl.hidden;
  block.classList.toggle('on-sale', onSale);
  if (lineWas) lineWas.hidden = !onSale;
  if (labelNow) labelNow.hidden = !onSale;
}

function reapplySaleFlag() {
  document.querySelectorAll('.price-block').forEach(block => {
    const nowEl = block.querySelector('.price-now');
    const wasEl = block.querySelector('.price-was');
    const badgeEl = block.querySelector('.badge-save');
    if (nowEl && wasEl && !adminState.sale && !wasEl.hidden) {
      nowEl.dataset.saleText = nowEl.textContent;
      nowEl.textContent = wasEl.textContent;
      wasEl.hidden = true;
      if (badgeEl) badgeEl.hidden = true;
    }
    syncPriceLabels(block);
    syncSaleTag(block);
    syncPaymentBadges(block);
  });
  syncBarPrices();
}

// Sticky mobile bar + desktop persistent bar mirror the decision panel's price (spec.md §15 D8)
// — previously each template updated them its own way, and the Demo "On sale" toggle never
// reached them on any template. The decision panel's .price-block is the one source.
function syncBarPrices() {
  const block = document.querySelector('.decision-panel .price-block');
  if (!block) return;
  const nowEl = block.querySelector('.price-now');
  const wasEl = block.querySelector('.price-was');
  if (!nowEl || !wasEl) return;
  document.querySelectorAll('.sticky-cta-mobile .sticky-price, .persistent-bar .price-row').forEach(row => {
    const n = row.querySelector('.price-now');
    const w = row.querySelector('.price-was');
    if (n) { n.textContent = nowEl.textContent; n.classList.toggle('no-sale', wasEl.hidden); }
    if (w) { w.textContent = wasEl.textContent; w.hidden = wasEl.hidden; }
  });
}

function setSaleFlag(on) {
  adminState.sale = on;
  if (on) {
    if (typeof renderAll === 'function') { renderAll(); return; }
    document.querySelectorAll('.price-block .price-was').forEach(el => { el.hidden = false; });
    document.querySelectorAll('.price-block .badge-save').forEach(el => { el.hidden = false; });
    document.querySelectorAll('.price-block .price-now[data-sale-text]').forEach(el => {
      el.textContent = el.dataset.saleText;
      delete el.dataset.saleText;
    });
    // Real bug found 2026-09-12 (spec.md Section 12 item 23 build): this restore path never
    // called reapplySaleFlag(), so the Sale Tag graphic (and, now, the new price labels)
    // stayed hidden from the "off" toggle even after the price itself was restored. Safe to
    // call unconditionally here — reapplySaleFlag()'s own price-swap branch is a no-op once
    // adminState.sale is true again, so this only runs the sync-the-rest-of-the-UI half.
    reapplySaleFlag();
    return;
  }
  reapplySaleFlag();
}

// Five real stock states (was a plain in-stock/out-of-stock boolean) — the decision
// panel's .stock-status-line reflects whichever is selected in the demo admin panel's
// "Stock status" radio group. Low Stock reads as a warning but doesn't block purchase;
// Not in Stock blocks it the same way the old "out of stock" toggle did. Special Order
// used to be a separate checkbox layered on top of whichever status was showing (backlog
// item 25 flagged this as contradictory, e.g. "✓ In Stock" plus an ordered-in banner at
// the same time) — folded in as a 4th mutually-exclusive value instead, so it fully
// replaces the label rather than sitting alongside it. Discontinued (backlog item 23,
// 2026-09-11) is a 5th value on the same principle — a discontinued item can't also be
// "In Stock," so it belongs in this same mutually-exclusive set rather than a separate
// toggle layered on top. ctaLabel drives the generic [data-cta-label] disabled-button
// text in applyStockStatus() below, so every blocksCta state can have its own wording
// without a special-cased branch.
// Wording now comes from rrgStockStatus() (session-state.js, spec.md §14.1) so the PDP,
// cards and filters can't drift apart again; this table only holds PDP-specific behaviour
// (what blocks Add to Cart, which banner shows). not_in_stock was renamed out_of_stock to
// match the cards (2026-09-29) — rrgStockKey() still maps the old key.
const STOCK_STATUS = {
  in_stock: { blocksCta: false, specialOrder: false },
  low_stock: { blocksCta: false, specialOrder: false },
  out_of_stock: { blocksCta: true, specialOrder: false, ctaLabel: 'Out Of Stock' },
  special_order: { blocksCta: false, specialOrder: true },
  discontinued: { blocksCta: true, specialOrder: false, discontinued: true, ctaLabel: 'Discontinued' }
};

// Phase 2 demo: where the product is in stock relative to the session's nearest store —
// Demo State Panel "Store stock" radio. Real build: per-store inventory feed.
function pdpStockKeyFor(line) {
  // sibling-color sets a per-colour data-stock-key on its line; the Demo State Panel's
  // stock radio overrides it once touched.
  return (!adminState.stockOverride && line && line.dataset.stockKey) || adminState.stockStatus || 'in_stock';
}

// Renders a .stock-status-line's base text/class from the current stock state, then
// appends the B-Stock/Ex-Demo suffix inline when that admin flag is on — e.g.
// "In Stock Online — Ex-Demo/Factory Seconds from $1,495" (UK: "… — Graded from £1,495" —
// see exdemoCopy() below) with the price as a clickable link into the ex-demo slide-in
// drawer. Replaces the old standalone .exdemo-cta button (Graham Sowerby meeting,
// 2026-09-10: this needed to read as part of the stock line, not its own button-weight
// element). Re-run by applyRegion() too, so this text/wording flips live if the region
// switches while the drawer's trigger is already visible. The second line (.stock-subline —
// dispatch/collect timing, "Contact our team", "Set your store") sits directly below it.
function renderStockLine(line) {
  const key = rrgStockKey(pdpStockKeyFor(line));
  const cfg = STOCK_STATUS[key] || STOCK_STATUS.in_stock;
  const status = rrgStockStatus(key, adminState.storeStock);
  let sub = line.nextElementSibling && line.nextElementSibling.classList.contains('stock-subline') ? line.nextElementSibling : null;
  if (!sub) {
    sub = document.createElement('div');
    sub.className = 'stock-subline';
    line.after(sub);
  }
  // Discontinued (2026-09-12, spec.md §12 item 35): the .discontinued-banner already
  // states the product is discontinued, so this line is hidden entirely instead of
  // duplicating that message — every other state clears `hidden` so it doesn't stay
  // stuck hidden after toggling back off Discontinued.
  sub.hidden = !!cfg.discontinued || !(status.subline || status.detail || status.contact || status.setStore);
  if (!sub.hidden) {
    const parts = [];
    if (status.subline) parts.push(status.subline);
    // Which other stores have it, or the warehouse it ships from (spec.md §16 item 19).
    if (status.detail) parts.push(status.detail);
    if (status.contact) parts.push('<a href="#" class="stock-subline-link">Contact our team</a> for availability');
    if (status.setStore) parts.push('<a href="#" class="stock-subline-link" data-set-store>Set your store</a> to see local stock');
    sub.innerHTML = parts.join(' · ');
  }
  line.hidden = !!cfg.discontinued;
  if (cfg.discontinued) return;
  line.className = 'stock-status-line ' + status.tone;
  line.textContent = status.pdpLabel;
  if (!adminState.exdemo) return;
  const block = line.closest('.price-block');
  const basePrice = block ? currentPagePrice(block) : 0;
  const from = buildExdemoOptions(basePrice).reduce((min, o) => Math.min(min, o.price), Infinity);
  const link = document.createElement('a');
  link.href = '#';
  link.className = 'exdemo-inline-link';
  link.textContent = `${exdemoCopy().inline} from ${fmtAud(from)}`;
  link.addEventListener('click', e => {
    e.preventDefault();
    const titleEl = document.querySelector('h1');
    const imgEl = document.querySelector('#mainImg, .gallery-main img');
    openExdemoSlideout(basePrice, titleEl ? titleEl.textContent : 'This product', imgEl ? imgEl.src : '');
  });
  line.append(' — ', link);
}

function applyStockStatus(status) {
  status = rrgStockKey(status);
  adminState.stockStatus = status;
  const cfg = STOCK_STATUS[status] || STOCK_STATUS.in_stock;
  rrgRefreshStockSurfaces();
  document.querySelectorAll('.price-block').forEach(block => {
    block.classList.toggle('discontinued', !!cfg.discontinued);
  });
  document.querySelectorAll('.discontinued-alternates').forEach(el => {
    el.hidden = !cfg.discontinued;
  });
  document.querySelectorAll('.cta-col').forEach(col => {
    const parent = col.parentNode;
    const banner = parent.querySelector(':scope > .stock-banner');
    if (cfg.blocksCta && !cfg.discontinued && !banner) {
      const el = document.createElement('div');
      el.className = 'stock-banner';
      el.textContent = '✕ Currently out of stock';
      parent.insertBefore(el, col);
    } else if ((!cfg.blocksCta || cfg.discontinued) && banner) {
      banner.remove();
    }
    const specialBanner = parent.querySelector(':scope > .special-order-banner');
    if (cfg.specialOrder && !specialBanner) {
      const el = document.createElement('div');
      el.className = 'special-order-banner';
      el.innerHTML = '⏱ <strong>Note:</strong> This item is ordered in as required, please allow 5-7 business days before item is ready';
      parent.insertBefore(el, col);
    } else if (!cfg.specialOrder && specialBanner) {
      specialBanner.remove();
    }
    const discBanner = parent.querySelector(':scope > .discontinued-banner');
    if (cfg.discontinued && !discBanner) {
      const el = document.createElement('div');
      el.className = 'discontinued-banner';
      el.innerHTML = '⛔ This product has been discontinued and is no longer available for purchase — see similar alternatives below.';
      parent.insertBefore(el, col);
    } else if (!cfg.discontinued && discBanner) {
      discBanner.remove();
    }
    col.hidden = !!cfg.discontinued;
  });
  if (cfg.blocksCta) {
    document.querySelectorAll('[data-cta-label]').forEach(btn => {
      btn.disabled = true;
      btn.textContent = cfg.ctaLabel || 'Out Of Stock';
      btn.classList.remove('btn-cta');
      btn.classList.add('btn-outline');
    });
  } else {
    if (document.querySelector('[data-fitment-slot]') && typeof PRODUCT_FITMENT !== 'undefined') {
      applySessionFitment();
    } else {
      document.querySelectorAll('[data-cta-label]').forEach(btn => {
        btn.disabled = false;
        btn.textContent = 'Add To Cart';
        btn.classList.add('btn-cta');
        btn.classList.remove('btn-outline');
      });
    }
  }
  // col.hidden just changed above (discontinued toggling hides/shows .cta-col) — re-sync
  // the compatibility banner, which must never show alongside a hidden CTA.
  applyCartConflict(adminState.cartConflict);
  // Out of Stock / Discontinued turn Delivery + Click & Collect off (spec.md §14.1) —
  // re-run with the Demo State Panel's own toggles so switching back restores them.
  applyAvailabilityFlags(adminState.shipping, adminState.collect);
}

// Everything on the PDP that shows stock, re-rendered from the one status (spec.md §14.1):
// the stock line + sub-line, store pills (Click & Collect widget, Store Slide-out),
// Click & Collect timing, the Low Stock "only a few left" box on every PDP,
// and JSON-LD availability. Runs on every stock change and on every 'rrg-session-change'
// (Build Phase / Nearest Store Set toggles), so Phase 1/2 flips live.
function rrgRefreshStockSurfaces() {
  // PDP only — listing pages carry their own per-product stock (plp.js) and JSON-LD.
  if (!adminState.stockStatus || !document.querySelector('.stock-status-line')) return;
  document.querySelectorAll('.stock-status-line').forEach(renderStockLine);
  const status = rrgStockStatus(adminState.stockStatus, adminState.storeStock);
  document.querySelectorAll('[data-store-pills]').forEach(el => { el.innerHTML = rrgStorePillsHTML(el.dataset.storePills); });
  document.querySelectorAll('[data-collect-eta]').forEach(el => { el.textContent = status.collectEta; });
  document.querySelectorAll('.scarcity').forEach(el => { el.hidden = status.key !== 'low_stock'; });
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => {
    el.textContent = el.textContent.replace(/("availability"\s*:\s*"https:\/\/schema\.org\/)\w+"/g, `$1${status.schema}"`);
  });
}
document.addEventListener('rrg-session-change', rrgRefreshStockSurfaces);

// Static Click & Collect store rows in each template's markup carry hand-typed pills —
// swap them for a [data-store-pills] slot so they follow the product's stock state like
// the JS-rendered rows do. Only rows with a real store address (not the Showroom Finder's
// "On Display" list, which is about display, not stock).
function rrgWrapStaticStorePills() {
  document.querySelectorAll('.dc-store > div > strong:first-child').forEach(strong => {
    if (strong.closest('#showroom')) return;
    const chips = [];
    let n = strong.nextElementSibling;
    while (n && n.classList.contains('stock-chip')) { chips.push(n); n = n.nextElementSibling; }
    if (!chips.length) return;
    chips.forEach(c => c.remove());
    const slot = document.createElement('span');
    slot.dataset.storePills = strong.textContent.trim();
    slot.innerHTML = rrgStorePillsHTML(slot.dataset.storePills);
    strong.after(slot);
  });
}

// Compatibility feature (backlog item 24, 2026-09-11 backlog) — simulates cart contents
// against the current PDP product, since this prototype has no real cart/session. Three
// states: no item in cart (default), a compatible item in cart (shown as a selectable
// state but renders nothing — nothing to warn about), and an incompatible item in cart
// (renders a non-blocking warning banner above Add to Cart, same insertion pattern as
// applyStockStatus()'s banners). The conflicting item's name/reason are read off
// data-conflict-item/data-conflict-reason on each template's own .cta-col rather than
// hardcoded here, so this function stays generic across all 5 templates — in a real
// Magento build this pair would come from a per-product compatibility rule the team sets,
// not a hardcoded string. Never disables the CTA — informational only, per spec.
// Compatibility banner above Add to Cart (PDP brief 4.19). Since the Package Deal (spec.md §19
// phase 3, 2026-10-06) it shows both ways — green when what's in the cart IS compatible, amber
// heads-up when it isn't — each with an info tooltip, and never disables the CTA.
//   • A page whose .cta-col has data-pkg-category (a rack or roof accessory) reads the REAL cart
//     (cart.js rrgPackageCompatHTML) and re-checks whenever the cart changes. Demo State's "Cart
//     already has" control doesn't apply there; Site Admin's Demo cart presets drive it.
//   • Every other PDP keeps the Demo State mock: "A compatible item" / "An incompatible item"
//     name the template's own data-conflict-item, with its data-conflict-reason as the tooltip.
function applyCartConflict(state) {
  adminState.cartConflict = state;
  document.querySelectorAll('.cta-col').forEach(col => {
    // Build the message BEFORE clearing: reading the cart can itself fire rrg-cart-change (a
    // lazily seeded cart in the Component Library), which re-enters this function — clearing
    // first let both passes insert a banner.
    let html = '';
    if (col.hidden) {
      // never alongside a hidden CTA
    } else if (col.dataset.pkgCategory !== undefined) {
      if (typeof rrgPackageCompatHTML === 'function') html = rrgPackageCompatHTML(rrgPdpCartItem(), 'banner');
    } else if (state === 'compatible' || state === 'incompatible') {
      const item = col.dataset.conflictItem || 'an item';
      const reason = col.dataset.conflictReason || 'it may not be fully compatible with this product';
      // Same fitment-style card as the real-cart message (cart.js rrgNoticeCardHTML).
      if (typeof rrgNoticeCardHTML === 'function') html = state === 'compatible'
        ? rrgNoticeCardHTML('fits', 'Compatible', `Works with <b>${item}</b> in your cart.`, RRG_COMPAT_TIP, 'cart-conflict-banner')
        : rrgNoticeCardHTML('unknown', 'Heads up: not compatible', `Not compatible with <b>${item}</b> in your cart. Choose a different one, or contact us and we'll help.`,
          `Why: ${reason}. You can still order both. If you're not sure, contact us and we'll check your setup.`, 'cart-conflict-banner');
    }
    col.parentNode.querySelectorAll(':scope > .cart-conflict-banner').forEach(b => b.remove());
    if (html) col.insertAdjacentHTML('beforebegin', html);
  });
  // The Package Deal tag (cart.js) redraws on the same triggers: load, cart change, colour swap.
  if (typeof rrgRenderPackageTag === 'function') rrgRenderPackageTag();
}
// Real-cart pages: draw on load (cart.js has loaded by DOMContentLoaded) and on every cart change.
['DOMContentLoaded', 'rrg-cart-change'].forEach(evt => document.addEventListener(evt, () => {
  if (document.querySelector('.cta-col[data-pkg-category]')) applyCartConflict(adminState.cartConflict);
}));

function applyAvailabilityFlags(shipping, collect) {
  adminState.shipping = shipping;
  adminState.collect = collect;
  // Out of Stock / Discontinued (spec.md §14.1): neither option is available, whatever the
  // panel toggles say — the note explains why instead of the generic "both unavailable".
  const stockBlocked = ['out_of_stock', 'discontinued'].includes(rrgStockKey(adminState.stockStatus));
  if (stockBlocked) { shipping = false; collect = false; }
  document.querySelectorAll('.dc-widget').forEach(widget => {
    const deliveryTab = widget.querySelector('[data-dc-tab="delivery"]');
    const collectTab = widget.querySelector('[data-dc-tab="collect"]');
    const deliveryPanel = widget.querySelector('[data-dc-panel="delivery"]');
    const collectPanel = widget.querySelector('[data-dc-panel="collect"]');
    if (deliveryTab) deliveryTab.hidden = !shipping;
    if (collectTab) collectTab.hidden = !collect;

    let note = widget.parentNode.querySelector(':scope > .dc-unavailable-note');
    if (!shipping && !collect) {
      widget.hidden = true;
      if (!note) {
        note = document.createElement('div');
        note.className = 'dc-unavailable-note';
        widget.parentNode.insertBefore(note, widget.nextSibling);
      }
      note.textContent = stockBlocked
        ? (rrgStockKey(adminState.stockStatus) === 'discontinued'
          ? "This product has been discontinued, so Delivery and Click & Collect aren't available."
          : "This item is currently out of stock, so Delivery and Click & Collect aren't available right now.")
        : 'Delivery and Click & Collect are both currently unavailable for this item.';
      note.hidden = false;
      return;
    }
    widget.hidden = false;
    if (note) note.hidden = true;

    const activeTab = widget.querySelector('.dc-tab.active');
    if (!activeTab || activeTab.hidden) {
      const fallback = shipping ? deliveryTab : collectTab;
      if (fallback) {
        widget.querySelectorAll('.dc-tab').forEach(t => t.classList.remove('active'));
        fallback.classList.add('active');
        widget.querySelectorAll('.dc-panel').forEach(p => { p.hidden = p.dataset.dcPanel !== fallback.dataset.dcTab; });
      }
    } else if (deliveryPanel && collectPanel) {
      const activeKey = activeTab.dataset.dcTab;
      deliveryPanel.hidden = activeKey !== 'delivery';
      collectPanel.hidden = activeKey !== 'collect';
    }
  });
}

// ---- Ex-Demo / Factory Seconds (B-Stock) ----
// A CTA next to price that opens a slide-in drawer (buildExdemoSlideout() below, backlog
// item 4: converted 2026-09-11 from a centered modal to match the Store Slide-out pattern)
// with 3 placeholder ex-demo/factory-second/sellable-return options, priced as a discount
// off whatever the page's real current price is (read live from .price-now, so it tracks
// variant/colour switches automatically). Each option's store name is region-aware —
// exdemoStoreName() below — rather than the old standalone fabricated EXDEMO_STORES list.
const EXDEMO_OPTION_SPECS = [
  { tag: 'Ex-Demo', cut: 0.30 },
  { tag: 'Sellable Return', cut: 0.22 },
  { tag: 'Factory Second', cut: 0.15 }
];

// regionCurrencySymbol() lives here (not just in the Region Selector section further down)
// since fmtAud() below and the per-template fmtMoney() helpers all need it and this file is
// parsed top-to-bottom before any of them can actually be called — `currentRegion` itself
// (declared later in the Region Selector section) is safe to reference here too, for the
// same reason: this is a plain function declaration (hoisted), and nothing calls it until
// after the whole script has finished executing.
function regionCurrencySymbol() { return currentRegion === 'UK' ? '£' : '$'; }

function fmtAud(n) { return regionCurrencySymbol() + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// UK (The Roof Box Company) calls this umbrella term "Graded" instead of "Ex-Demo/Factory
// Seconds" — confirmed 2026-09-11, backlog item 4 follow-up. UK-only; AU/NZ keep the
// original wording. The 3 individual option tags above (Ex-Demo/Sellable Return/Factory
// Second) are specific conditions, not this umbrella term, so they're unaffected in every
// region. Same safe-to-reference-currentRegion-here reasoning as regionCurrencySymbol().
function exdemoCopy() {
  return currentRegion === 'UK'
    ? { heading: 'Graded Stock', inline: 'Graded' }
    : { heading: 'Ex-Demo & Factory Seconds', inline: 'Ex-Demo/Factory Seconds' };
}

// Real store name per option, region-aware (RRG_STORE_NETWORK/REGION_SINGLE_STORES are both
// declared further down this file — safe to reference here for the same hoisting reason as
// regionCurrencySymbol() above). AU cycles through every real store (flattened + cached on
// first use); NZ/UK only have one region store, so all 3 options show that same one.
const STATE_ABBR = {
  'New South Wales': 'NSW', 'Victoria': 'VIC', 'South Australia': 'SA', 'Tasmania': 'TAS',
  'Queensland': 'QLD', 'Australian Capital Territory': 'ACT', 'Western Australia': 'WA'
};
let _exdemoAuStoreNames = null;
function exdemoStoreName(i) {
  if (currentRegion !== 'AU') return `${REGION_SINGLE_STORES[currentRegion].name}, ${currentRegion}`;
  if (!_exdemoAuStoreNames) {
    _exdemoAuStoreNames = RRG_STORE_NETWORK.flatMap(group =>
      group.stores.map(s => `${s.name}, ${STATE_ABBR[group.state] || group.state}`)
    );
  }
  return _exdemoAuStoreNames[i % _exdemoAuStoreNames.length];
}

function buildExdemoOptions(basePrice) {
  return EXDEMO_OPTION_SPECS.map((spec, i) => {
    const price = Math.max(5, Math.round((basePrice * (1 - spec.cut)) / 5) * 5);
    const collectOnly = basePrice > 500 && i === 0;
    const store = exdemoStoreName(i);
    return {
      tag: spec.tag,
      price,
      was: basePrice,
      note: collectOnly ? `Collect only — on display at ${store}` : `Shipping available · currently at ${store}`
    };
  });
}

// Right-edge slide-in drawer — same convention as buildStoreSlideout() below (one shared
// backdrop/drawer built once per page, reused on every open).
function buildExdemoSlideout() {
  if (document.getElementById('exdemoSlideoutBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'exdemo-slideout-backdrop';
  backdrop.id = 'exdemoSlideoutBackdrop';
  backdrop.innerHTML = `
    <div class="exdemo-slideout" role="dialog" aria-modal="true">
      <div class="exdemo-slideout-head">
        <div><h2 id="exdemoSlideoutTitle">Ex-Demo &amp; Factory Seconds</h2><p id="exdemoSlideoutSub"></p></div>
        <button type="button" class="exdemo-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="exdemo-slideout-body" id="exdemoSlideoutBody"></div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeExdemoSlideout(); });
  backdrop.querySelector('.exdemo-slideout-close').addEventListener('click', closeExdemoSlideout);
}

function closeExdemoSlideout() {
  const backdrop = document.getElementById('exdemoSlideoutBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

function openExdemoSlideout(basePrice, productTitle, imageSrc) {
  const backdrop = document.getElementById('exdemoSlideoutBackdrop');
  if (!backdrop) return;
  document.getElementById('exdemoSlideoutTitle').textContent = exdemoCopy().heading;
  document.getElementById('exdemoSlideoutSub').textContent = `${productTitle} — sold as-is, inspected and covered by our standard guarantee.`;
  document.getElementById('exdemoSlideoutBody').innerHTML = buildExdemoOptions(basePrice).map(o => `
    <div class="exdemo-option">
      ${imageSrc ? `<img class="eo-img" src="${imageSrc}" alt="${productTitle}">` : ''}
      <div class="eo-info">
        <span class="eo-tag">${o.tag}</span>
        <div><span class="eo-price">${fmtAud(o.price)}</span><span class="eo-was">${fmtAud(o.was)}</span></div>
        <div class="eo-note">${o.note}</div>
      </div>
      <button type="button" class="btn btn-outline">View Item</button>
    </div>
  `).join('');
  backdrop.classList.add('open');
}

function currentPagePrice(block) {
  const nowEl = block.querySelector('.price-now');
  if (!nowEl) return 0;
  return parseFloat(nowEl.textContent.replace(/[^0-9.]/g, '')) || 0;
}

function applyExdemoFlag(on) {
  adminState.exdemo = on;
  document.querySelectorAll('.stock-status-line').forEach(renderStockLine);
}

// ---- Real store network (scraped 2026-09-10 from the live site's own Store Inventory
// slide-out, roofracksgalore.com.au — a real product's Click & Collect card, "View all
// Stock") ----
// Real names, addresses, phone numbers and Google Maps links for every physical store —
// store identity doesn't vary by product, so this is one canonical list shared by every
// template's Click & Collect widget, the store slide-out, and the Showroom Finder map,
// grouped by state to match the live site's own presentation. Per-store IN-STOCK/ORDER-IN
// status and the ON_DISPLAY_STORES set below are still demo/placeholder (no real per-SKU
// per-store stock feed exists) — same caution as the rest of this widget's data. `lat`/`lng`
// are approximate suburb-centre coordinates (demo precision, same caution), added 2026-09-11
// for the Showroom Finder map rework so every store can be plotted without a separate
// per-template pin list.
const RRG_STORE_NETWORK = [
  { state: "New South Wales", stores: [
    { name: "Moorebank", street: "12 Centenary Ave", city: "Moorebank", postcode: "2170", phone: "(02) 9053 8621", mapLink: "https://maps.app.goo.gl/371QHZWa4pDU4qzA7", lat: -33.9400, lng: 150.9344 },
    { name: "Smeaton Grange", street: "3/18 Exchange Parade", city: "Smeaton Grange", postcode: "2567", phone: "(02) 8215 7092", mapLink: "https://maps.app.goo.gl/Khp5w9LoxReciEho7", lat: -34.039, lng: 150.7454 },
    { name: "Matraville", street: "35 Raymond Avenue", city: "Matraville", postcode: "2036", phone: "(02) 9159 6777", mapLink: "https://maps.app.goo.gl/U7Cfof4Wkkk77KqM8", lat: -33.9612, lng: 151.2203 },
    { name: "Warriewood", street: "3 Vuko Place", city: "Warriewood", postcode: "2102", phone: "(02) 8007 6177", mapLink: "https://maps.app.goo.gl/paxnS1CPK26xbeC59", lat: -33.6929, lng: 151.2998 },
    { name: "Silverwater", street: "1/104 Wetherill St N", city: "Silverwater", postcode: "2128", phone: "(02) 8007 6155", mapLink: "https://maps.app.goo.gl/NCofTPDD28BDfZRv5", lat: -33.8374, lng: 151.0445 },
    { name: "Miranda", street: "132 Wyralla Rd", city: "Miranda", postcode: "2228", phone: "(02) 9526 2777", mapLink: "https://goo.gl/maps/f3wCEmtgtHEGBPcn8", lat: -34.0391, lng: 151.0892 },
    { name: "Castle Hill", street: "3/8 Anella Avenue", city: "Castle Hill", postcode: "2154", phone: "(02) 9899 3256", mapLink: "https://goo.gl/maps/QebgyjaDAjpKVDw96", lat: -33.7252, lng: 150.9775 }
  ]},
  { state: "Victoria", stores: [
    { name: "Hoppers Crossing", street: "352 Old Geelong Road", city: "Hoppers Crossing", postcode: "3029", phone: "(03) 9015 8615", mapLink: "https://maps.app.goo.gl/HPHsUyA4yfpUVp8V6", lat: -37.877, lng: 144.694 },
    { name: "Frankston", street: "43 New Street", city: "Frankston", postcode: "3199", phone: "(03) 9015 8656", mapLink: "https://maps.app.goo.gl/tjTwH36rzw1oQJso6", lat: -38.146, lng: 145.123 },
    { name: "Preston", street: "3/1 Bell St", city: "Preston", postcode: "3072", phone: "(03) 9484 3447", mapLink: "https://goo.gl/maps/6DDmf3KREjGmqn8z8", lat: -37.740, lng: 145.005 },
    { name: "Geelong", street: "34/8 Lewalan St", city: "Grovedale", postcode: "3216", phone: "(03) 5221 3433", mapLink: "https://maps.app.goo.gl/NGfvQ9yKvYPv3hwq9", lat: -38.204, lng: 144.335 },
    { name: "Moorabbin", street: "6/265 - 269 Wickham Rd", city: "Moorabbin", postcode: "3189", phone: "(03) 9553 2799", mapLink: "https://goo.gl/maps/3bj1XdzQqReSdaJz7", lat: -37.939, lng: 145.048 },
    { name: "Hallam", street: "1/237 Princes Hwy", city: "Hallam", postcode: "3803", phone: "(03) 9703 1295", mapLink: "https://goo.gl/maps/sX8KjK28XqjC5BVMA", lat: -38.005, lng: 145.267 },
    { name: "Mitcham", street: "3/660 Whitehorse Rd", city: "Mitcham", postcode: "3132", phone: "(03) 9874 6261", mapLink: "https://goo.gl/maps/eqRzmAGA7RDZ7Go79", lat: -37.814, lng: 145.192 },
    { name: "Maidstone", street: "3/72 - 80 Hampstead Rd", city: "Maidstone", postcode: "3012", phone: "(03) 9318 5846", mapLink: "https://goo.gl/maps/gocCgS8Jk5tNZfw48", lat: -37.780, lng: 144.870 },
    { name: "Epping", street: "8/168 Jersey Dr", city: "Epping", postcode: "3076", phone: "(03) 7006 5180", mapLink: "https://goo.gl/maps/HGZxbcKqbiZeDjTE6", lat: -37.650, lng: 145.019 }
  ]},
  { state: "South Australia", stores: [
    { name: "Pooraka", street: "222 Bridge Road", city: "Pooraka", postcode: "5095", phone: "(08) 7078 4574", mapLink: "https://maps.app.goo.gl/qKNoRaN4etFaXJhd9", lat: -34.831, lng: 138.628 },
    { name: "Adelaide City", street: "37 Gilbert St", city: "Adelaide", postcode: "5000", phone: "(08) 8211 7600", mapLink: "https://goo.gl/maps/9DA31eWAsSPAgcCe9", lat: -34.928, lng: 138.601 },
    { name: "Lonsdale", street: "8/4 Aldenhoven Rd", city: "Lonsdale", postcode: "5160", phone: "(08) 7081 5535", mapLink: "https://goo.gl/maps/a9PHVjoo3PzQbaHj6", lat: -35.117, lng: 138.501 },
    { name: "Edinburgh", street: "1/5b Peachey Rd", city: "Edinburgh North", postcode: "5113", phone: "(08) 7081 5550", mapLink: "https://maps.app.goo.gl/KJxUWzc6gj2B6U1aA", lat: -34.708, lng: 138.667 }
  ]},
  { state: "Tasmania", stores: [
    { name: "Hobart", street: "134-136 Main Rd", city: "Moonah", postcode: "7009", phone: "(03) 6273 7555", mapLink: "https://goo.gl/maps/Cyi2N7UE4qvE5ZFb6", lat: -42.833, lng: 147.302 }
  ]},
  { state: "Queensland", stores: [
    { name: "Kedron", street: "Unit 1/14 Boothby Street", city: "Kedron", postcode: "4031", phone: "(07) 3350 3711", mapLink: "https://goo.gl/maps/FGRrDi9CrZS2", lat: -27.3972, lng: 153.0294 },
    { name: "East Brisbane", street: "46 Caswell St", city: "East Brisbane", postcode: "4169", phone: "(07) 3256 3630", mapLink: "https://goo.gl/maps/JAqUCMi5rYmZhZ1T7", lat: -27.4888, lng: 153.0476 },
    { name: "Sunshine Coast", street: "1/224 Nicklin Way", city: "Warana", postcode: "4575", phone: "(07) 5408 5040", mapLink: "https://goo.gl/maps/twjqFgLGGMXotKtcA", lat: -26.760, lng: 153.117 },
    { name: "Gold Coast", street: "3/10 Kamholtz Court", city: "Molendinar", postcode: "4214", phone: "(07) 5619 5800", mapLink: "https://g.page/roof-racks-galore-gold-coast?share", lat: -28.002, lng: 153.379 },
    { name: "Springwood", street: "3/11 Judds Court", city: "Slacks Creek", postcode: "4127", phone: "(07) 3103 8422", mapLink: "https://goo.gl/maps/GShsfi9yfoK2", lat: -27.664, lng: 153.150 },
    { name: "North Lakes", street: "1/74 Flinders Parade", city: "North Lakes", postcode: "4509", phone: "(07) 3103 8414", mapLink: "https://maps.app.goo.gl/gCEyKzgxP1jaJkyr6", lat: -27.2192, lng: 152.9964 },
    { name: "Burleigh Heads", street: "1/11 Hutchinson Street", city: "Burleigh Heads", postcode: "4220", phone: "(07) 5619 5822", mapLink: "https://maps.app.goo.gl/m9cdKVoTojrfBC82A", lat: -28.093, lng: 153.450 },
    { name: "Rocklea", street: "Unit 2/1620 Ipswich Road", city: "Rocklea", postcode: "4106", phone: "(07) 3277 5722", mapLink: "https://goo.gl/maps/HxDPHYUJnYm", lat: -27.5576, lng: 153.0049 }
  ]},
  { state: "Australian Capital Territory", stores: [
    { name: "Canberra", street: "107 Wollongong Street", city: "Fyshwick", postcode: "2609", phone: "(02) 6176 1909", mapLink: "https://goo.gl/maps/6EP4rtQWnJu9hrRBA", lat: -35.339, lng: 149.166 }
  ]},
  { state: "Western Australia", stores: [
    { name: "Joondalup", street: "Tenancy 4, 27-29 Sundew Rise", city: "Joondalup", postcode: "6027", phone: "(08) 9513 7225", mapLink: "https://goo.gl/maps/2Tnnk6qAgDCxcSBA9", lat: -31.744, lng: 115.766 },
    { name: "Osborne Park", street: "51 Frobisher Street", city: "Osborne Park", postcode: "6017", phone: "(08) 9444 5061", mapLink: "https://maps.app.goo.gl/zEvXaoWceNKR7TgeA", lat: -31.891, lng: 115.816 },
    { name: "Welshpool", street: "74 Dowd St", city: "Welshpool", postcode: "6106", phone: "(08) 9258 7663", mapLink: "https://maps.app.goo.gl/y6btYejbz9eQ39vD8", lat: -31.988, lng: 115.940 },
    { name: "Malaga", street: "9 Rowe St", city: "Malaga", postcode: "6090", phone: "(08) 6102 6767", mapLink: "https://maps.app.goo.gl/ZFEKHyycGL8YhgoE8", lat: -31.861, lng: 115.895 },
    { name: "Rockingham", street: "6B Leach Crescent", city: "Rockingham", postcode: "6168", phone: "(08) 6102 6722", mapLink: "https://maps.app.goo.gl/fvpWNyA1HTyT2Rwf7", lat: -32.277, lng: 115.729 }
  ]}
];

// Which stores show the "On Display" pill (this specific product is set up in-showroom
// there) — demo/placeholder, same two stores the Showroom Finder widget's copy already
// named before this rework, kept for continuity across the page.
// Widened 2026-09-29 (stock-status rework, spec.md §14.1) from just Moorebank + Castle Hill —
// the Showroom Finder heading's store count is now read off this set instead of hand-typed
// per template (it claimed 12–26 stores while only 2 were marked).
const ON_DISPLAY_STORES = new Set(["Moorebank", "Castle Hill", "Silverwater", "Hoppers Crossing", "Moorabbin", "Preston", "Pooraka", "Kedron", "North Lakes", "Gold Coast", "Osborne Park", "Canberra"]);

// Which stores show "Need to Order In" instead of "In Stock" — demo/placeholder, needs a
// real per-store inventory feed before production (same caveat as ON_DISPLAY_STORES above).
// Spread across a few different states so most postcode checks surface some real-looking
// variety rather than every store always reading "In Stock."
const ORDER_IN_STORES = new Set(["Epping", "Malaga", "Hallam", "Matraville", "Smeaton Grange"]);

// Store pages (docs/store/store-spec.md Section 4) — every store has its own landing page in
// production (/roof-racks-<store>-superstore); the prototype builds eleven of them on one
// template (prototypes/store/?store=). Anywhere a store is named links to its page.
const RRG_STORE_PAGES = {
  'North Lakes': 'north-lakes', 'Kedron': 'kedron', 'East Brisbane': 'east-brisbane', 'Rocklea': 'rocklea',
  'Moorebank': 'moorebank', 'Castle Hill': 'castle-hill', 'Silverwater': 'silverwater', 'Smeaton Grange': 'smeaton-grange',
  'Miranda': 'miranda', 'Warriewood': 'warriewood', 'Matraville': 'matraville'
};
// Stores the prototype hasn't built link to North Lakes' page as a placeholder (Brenton,
// 2026-09-30 — building every live store page would be overkill). Only AU stores have pages;
// the NZ/UK single stores return null.
function rrgStorePageHref(name) {
  const slug = RRG_STORE_PAGES[name] || (rrgAuStore(name) ? 'north-lakes' : null);
  return slug ? `${RRG_PROTO}store/index.html?store=${slug}` : null;
}
function rrgAuStore(name) {
  for (const g of RRG_STORE_NETWORK) { const st = g.stores.find(x => x.name === name); if (st) return { ...st, state: g.state }; }
  return null;
}
const RRG_STORE_FINDER_HREF = () => `${RRG_PROTO}store-finder/index.html`;
const RRG_FMV_HREF = () => `${RRG_PROTO}fit-my-vehicle/index.html`;
const RRG_INSTALL_HREF = () => `${RRG_PROTO}installation/index.html`;

// Each store's own inbox — the live store pages all follow <name without spaces>@ (northlakes@,
// eastbrisbane@, smeatongrange@…). Fitting requests go here (docs/installation/installation-spec.md).
const rrgStoreEmail = name => `${name.toLowerCase().replace(/[^a-z]/g, '')}@roofracksgalore.com.au`;

// Installation links (docs/installation/installation-spec.md Section 5) — every "Book An
// Installation" / "Book a Fitting" button goes to the booking form on the Installation page,
// "See Fitting Costs" to its price list, and the PDP's "See Fitting Options" (which pointed at
// the live /roof-rack-installation-and-fitting-costs URL) to the page itself. Matched by text
// (like the Store Finder and Fit My Vehicle links) so no template needs a markup change; links
// that already point somewhere real are left alone.
function rrgLinkInstallation(root = document) {
  root.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href');
    const text = a.textContent.trim().toLowerCase();
    if (href === '/roof-rack-installation-and-fitting-costs') { a.href = RRG_INSTALL_HREF(); a.removeAttribute('target'); return; }
    if (href !== '#') return;
    if (text === 'book an installation' || text === 'book a fitting') a.href = RRG_INSTALL_HREF() + '#book';
    else if (text === 'see fitting costs') a.href = RRG_INSTALL_HREF() + '#costs';
  });
}
document.addEventListener('DOMContentLoaded', () => rrgLinkInstallation());

// "Shop The Best Brands" strip (every template): each logo links to its brand page
// (docs/brand/brand-spec.md 0), matched by the logo's alt text. Logos already inside a link
// (the brand page's own "Shop more brands" strip) are left alone.
function rrgLinkBrandStrip(root = document) {
  if (typeof RRG_BUILT_BRANDS === 'undefined') return;
  root.querySelectorAll('.brands-track > img').forEach(img => {
    const slug = RRG_BUILT_BRANDS[img.alt];
    if (!slug) return;
    const a = document.createElement('a');
    a.href = rrgBrandPageUrl(slug);
    a.setAttribute('aria-label', `Shop ${img.alt}`);
    img.replaceWith(a);
    a.appendChild(img);
  });
}
document.addEventListener('DOMContentLoaded', () => rrgLinkBrandStrip());

// ---- Store hours + open now (store page and Store Finder) ----
// Structured hours per day, worked out in the store's own time zone so a Sydney store reads
// right from Perth. Stores without their own record use the standard hours shown on the live
// store pages and locator (Mon–Fri 8:30–5, Sat 8:30–12:30, Sun closed) — to confirm per store
// in production. ?now=sat-10:00 fakes the day/time for review (prototype only).
const RRG_STANDARD_HOURS = { mon: ['08:30', '17:00'], tue: ['08:30', '17:00'], wed: ['08:30', '17:00'], thu: ['08:30', '17:00'], fri: ['08:30', '17:00'], sat: ['08:30', '12:30'], sun: null };
const RRG_DAYS = [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']];
const RRG_STATE_TZ = { 'Queensland': 'Australia/Brisbane', 'New South Wales': 'Australia/Sydney', 'Australian Capital Territory': 'Australia/Sydney', 'Victoria': 'Australia/Melbourne', 'Tasmania': 'Australia/Hobart', 'South Australia': 'Australia/Adelaide', 'Western Australia': 'Australia/Perth', 'Northern Territory': 'Australia/Darwin' };
const RRG_STATE_ABBR = { 'Queensland': 'QLD', 'New South Wales': 'NSW', 'Australian Capital Territory': 'ACT', 'Victoria': 'VIC', 'Tasmania': 'TAS', 'South Australia': 'SA', 'Western Australia': 'WA', 'Northern Territory': 'NT' };
const rrgFmtTime = t => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`; };
const rrgToMins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
// Public holidays (spec.md §16 item 14) — the stores close on them. Real dates for the rest of
// 2026, by state. Production: the store hours (entered in cPanel today) should carry these, and
// ideally feed Google Business Profile too so there's one source of truth.
const RRG_PUBLIC_HOLIDAYS = [
  { date: '2026-10-05', name: 'King’s Birthday', states: ['QLD'] },
  { date: '2026-10-05', name: 'Labour Day', states: ['NSW', 'ACT', 'SA'] },
  { date: '2026-12-25', name: 'Christmas Day', states: ['QLD', 'NSW', 'ACT', 'VIC', 'TAS', 'SA', 'WA', 'NT'] },
  { date: '2026-12-26', name: 'Boxing Day', states: ['QLD', 'NSW', 'ACT', 'VIC', 'TAS', 'WA', 'NT'] },
  { date: '2027-01-01', name: 'New Year’s Day', states: ['QLD', 'NSW', 'ACT', 'VIC', 'TAS', 'SA', 'WA', 'NT'] }
];
function rrgStoreHolidays(stateAbbr) {
  return RRG_PUBLIC_HOLIDAYS.filter(h => h.states.includes(stateAbbr));
}
// A date in the store's own time zone as YYYY-MM-DD, `plusDays` from today.
function rrgStoreIsoDate(timeZone, plusDays = 0) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-AU', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(x => [x.type, x.value]));
  const d = new Date(Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day) + plusDays));
  return d.toISOString().slice(0, 10);
}
function rrgStoreNow(timeZone) {
  const fake = new URLSearchParams(location.search).get('now');
  if (fake && /^[a-z]{3}-\d\d:\d\d$/.test(fake)) { const [day, time] = fake.split('-'); return { day, mins: rrgToMins(time) }; }
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-AU', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(p => [p.type, p.value]));
  return { day: parts.weekday.toLowerCase().slice(0, 3), mins: Number(parts.hour) * 60 + Number(parts.minute) };
}
// { open, text, holiday } — "Closes 5:00pm" / "Opens 8:30am today" / "Opens tomorrow 8:30am" /
// "Opens Mon 8:30am". `holidays` (rrgStoreHolidays()) close the store on those dates; they're
// ignored while ?now= fakes the day, since a faked weekday has no date.
function rrgStoreOpenStatus(hours, timeZone, holidays = []) {
  const now = rrgStoreNow(timeZone);
  const faked = new URLSearchParams(location.search).has('now');
  const holidayOn = n => faked ? null : holidays.find(h => h.date === rrgStoreIsoDate(timeZone, n)) || null;
  const i = RRG_DAYS.findIndex(([k]) => k === now.day);
  const todayHoliday = holidayOn(0);
  const today = todayHoliday ? null : hours[now.day];
  if (today && now.mins >= rrgToMins(today[0]) && now.mins < rrgToMins(today[1])) return { open: true, text: `Closes ${rrgFmtTime(today[1])}` };
  if (today && now.mins < rrgToMins(today[0])) return { open: false, text: `Opens ${rrgFmtTime(today[0])} today` };
  for (let n = 1; n <= 7; n++) {
    const [key, label] = RRG_DAYS[(i + n) % 7];
    if (hours[key] && !holidayOn(n)) return { open: false, holiday: todayHoliday, text: `${todayHoliday ? `${todayHoliday.name} · ` : ''}Opens ${n === 1 ? 'tomorrow' : label.slice(0, 3)} ${rrgFmtTime(hours[key][0])}` };
  }
  return { open: false, holiday: todayHoliday, text: '' };
}
function rrgKmBetween(a, b) {
  const R = 6371, rad = x => x * Math.PI / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// Turns the store name in every store row (.dc-store — Click & Collect, Showroom Finder, the
// Store slide-out) into a link to that store's page. Showroom rows read "Moorebank, NSW", so
// the name is matched up to the comma. Safe to re-run after a re-render.
function rrgLinkStoreNames(root = document) {
  root.querySelectorAll('.dc-store strong').forEach(strong => {
    if (strong.querySelector('a')) return;
    const text = strong.textContent.trim();
    const href = rrgStorePageHref(text.split(',')[0].trim());
    if (!href) return;
    strong.innerHTML = `<a class="store-page-link" href="${href}">${text}</a>`;
  });
}
document.addEventListener('DOMContentLoaded', () => rrgLinkStoreNames());

// "Make this my store" (store page) — the visitor's saved store, which "Your Nearest Store" in the
// header and the store-aware stock lines read. Before this, the AU store name was fixed in
// each page's header markup (still the default when nothing is saved).
const RRG_STORE_NAME_KEY = 'rrgSessionStoreName';
function rrgSavedStoreName() {
  try { return localStorage.getItem(RRG_STORE_NAME_KEY); } catch (e) { return null; }
}
window.rrgSetStore = name => {
  try { localStorage.setItem(RRG_STORE_NAME_KEY, name); } catch (e) {}
  const link = document.querySelector('[data-region-nearest-store]');
  if (link) {
    link.dataset.auStore = name;
    if (currentRegion === 'AU') link.dataset.currentStoreName = name;
  }
  window.rrgSetSession('storeSet', true);
};

function rrgStoreCount() {
  return RRG_STORE_NETWORK.reduce((n, group) => n + group.stores.length, 0);
}

// Follows the product's stock state (spec.md §14.1): Out of Stock / Special Order apply to
// every store. In Phase 2 with a store set, the session store and the demo nearby store
// follow the Demo State Panel's "Store stock" radio so the pills agree with the stock line.
function rrgStorePillsHTML(name) {
  const key = typeof adminState !== 'undefined' ? rrgStockKey(adminState.stockStatus) : 'in_stock';
  const displayPill = ON_DISPLAY_STORES.has(name) ? `<span class="stock-chip display">On Display</span>` : '';
  if (key === 'out_of_stock' || key === 'discontinued') return `<span class="stock-chip out">Out of Stock</span>` + displayPill;
  if (key === 'special_order') return `<span class="stock-chip order">Special Order — 5-7 Days</span>` + displayPill;
  const inPill = `<span class="stock-chip in">In Stock</span>`;
  const orderPill = `<span class="stock-chip order">Ready Within 2 Business Days</span>`;
  const ctx = rrgStoreContext();
  if (ctx.storeAware && name === ctx.store) return (adminState.storeStock === 'here' ? inPill : orderPill) + displayPill;
  if (ctx.storeAware && ctx.nearby && name === ctx.nearby.name) return (['here', 'nearby'].includes(adminState.storeStock) ? inPill : orderPill) + displayPill;
  const statusPill = ORDER_IN_STORES.has(name) ? orderPill : inPill;
  return statusPill + displayPill;
}

// ---- Store slide-out ("View all stores", Click & Collect + Showroom Finder widgets,
// 2026-09-10) ----
// Lists the full real store network (RRG_STORE_NETWORK above), grouped by state to match
// the live site's own Store Inventory slide-out. Same once-per-page drawer convention as
// buildExdemoSlideout() above (both are right-edge slide-ins, independent of each other).
// Multiple triggers on one page (Click & Collect's link and, where present, the Showroom
// Finder's) all open the same drawer.
// Fit Finder drawer (Brenton, 2026-09-29) — a site-wide, right-edge slide-out holding the shared
// vehicle finder (rrgWidgetVehicleFinderHTML, widgets.js — the same widget as Home, Fit My Vehicle,
// Cart, Brand and VCLP since 2026-10-02; fields stacked for the drawer's width), so "set your vehicle" can be answered from wherever it's
// asked instead of sending the shopper elsewhere. Any element with [data-open-fit-finder] opens
// it (delegated, so links rendered later — product-card tooltips, the search strip, the Add to
// Cart notice — work too); the header's vehicle link and the PLP-family pages' Set/Change
// Vehicle buttons are wired up to it here as well. Same backdrop/drawer convention as the Store
// slide-out (.store-slideout*), its own instance.
// Demo: Make → Model → Year/Body/Roof cascade over the two vehicles this prototype's session
// knows, Toyota Hilux and Ford Ranger (FIT_FINDER_VEHICLES below, 2026-09-29 for the VLP).
// "Set My Vehicle" sets that session vehicle; from a header trigger it then lands on the VLP.
function buildFitFinderDrawer() {
  if (document.getElementById('fitFinderDrawerBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'store-slideout-backdrop fit-finder-drawer-backdrop';
  backdrop.id = 'fitFinderDrawerBackdrop';
  backdrop.innerHTML = `
    <div class="store-slideout fit-finder-drawer" role="dialog" aria-modal="true" aria-labelledby="fitFinderDrawerTitle">
      <div class="store-slideout-head">
        <h2 id="fitFinderDrawerTitle">Set Your Vehicle</h2>
        <button type="button" class="store-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="store-slideout-body">
        ${rrgWidgetVehicleFinderHTML({ inline: false, submit: 'Set My Vehicle' })}
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  // Always the no-vehicle cascade (it only opens to set or change a vehicle), in the same light/dark
  // style as the inline widget — rrgSetVehicleFinderStyle restyles it with them.
  const widget = backdrop.querySelector('.fit-finder-widget');
  widget.dataset.vfStyle = rrgVehicleFinderStyle();
  widget.querySelector('[data-ff-make]').innerHTML = ffOptions(FIT_FINDER_MAKES, 'Make');
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeFitFinderDrawer(); });
  backdrop.querySelector('.store-slideout-close').addEventListener('click', closeFitFinderDrawer);
  // Opened from the header (Fit My Vehicle nav link, utility-bar vehicle link, a VLP's own
  // Change Vehicle) → set the vehicle and land on its VLP (docs/vlp/vlp-spec.md Section 3).
  // Opened anywhere else (PLP cards, Set/Change Vehicle on the PLP family, search strip, Add to
  // Cart notice) → set it in place and stay on the page.
  initFitFinderCascade(backdrop, key => {
    if (window.rrgSetVehicle) window.rrgSetVehicle(key);
    closeFitFinderDrawer();
    if (backdrop.dataset.mode === 'navigate') window.location.href = `${RRG_PROTO}vlp/index.html?vehicle=${key}`;
  });
}

// The Make → Model → Year/Body/Roof cascade itself, shared by the drawer above and the home
// page's inline hero Fit Finder ([data-fit-finder-inline], docs/home/home-spec.md 5.2) so the
// two can never drift. `root` holds the [data-ff-*] fields; onSubmit gets the vehicle key.
function initFitFinderCascade(root, onSubmit) {
  const make = root.querySelector('[data-ff-make]');
  const model = root.querySelector('[data-ff-model]');
  const required = [...root.querySelectorAll('[data-ff-required]')];
  const submit = root.querySelector('[data-ff-submit]');
  const reset = (sel, placeholder) => { sel.innerHTML = `<option value="" selected disabled>${placeholder}</option>`; sel.disabled = true; };
  const sync = () => { submit.disabled = !model.value || required.some(s => !s.value); };
  make.addEventListener('change', () => {
    const models = Object.entries(FIT_FINDER_VEHICLES).filter(([, v]) => v.make === make.value).map(([key, v]) => [key, v.model]);
    model.innerHTML = ffOptions(models, 'Model');
    model.disabled = false;
    required.forEach(s => reset(s, FF_PLACEHOLDERS[s.dataset.ffField]));
    sync();
  });
  model.addEventListener('change', () => {
    const v = FIT_FINDER_VEHICLES[model.value];
    required.forEach(s => { s.innerHTML = ffOptions(v[s.dataset.ffField], FF_PLACEHOLDERS[s.dataset.ffField]); s.disabled = false; });
    sync();
  });
  required.forEach(s => s.addEventListener('change', sync));
  submit.addEventListener('click', () => onSubmit(model.value));
}

// Home page hero Fit Finder (docs/home/home-spec.md Section 3) — lands on the VLP, the same as
// the header's Fit My Vehicle drawer. [data-vf-stay="#target"] (brand pages, docs/brand/
// brand-spec.md 3.5) sets the vehicle in place instead and scrolls to that page's own results,
// which filter themselves on the session change.
// [data-vf-submit-href] sends it somewhere else instead (VCLP → its roof rack listing, the VPLP).
// [data-vf-preset="hilux"] (VCLP, 2026-10-02) pre-picks that vehicle's Make and Model, still
// changeable, so a single make/model page starts the shopper at Year.
function initInlineFitFinders() {
  document.querySelectorAll('[data-fit-finder-inline]').forEach(root => {
    const make = root.querySelector('[data-ff-make]');
    make.innerHTML = ffOptions(FIT_FINDER_MAKES, 'Make');
    initFitFinderCascade(root, key => {
      rrgVehicleSpecSave(key, root);
      if (window.rrgSetVehicle) window.rrgSetVehicle(key);
      const stay = root.dataset.vfStay && document.querySelector(root.dataset.vfStay);
      if (stay) stay.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.location.href = root.dataset.vfSubmitHref || `${RRG_PROTO}vlp/index.html?vehicle=${key}`;
    });
    const preset = FIT_FINDER_VEHICLES[root.dataset.vfPreset];
    if (preset) {
      const model = root.querySelector('[data-ff-model]');
      make.value = preset.make;
      make.dispatchEvent(new Event('change'));
      model.value = root.dataset.vfPreset;
      model.dispatchEvent(new Event('change'));
    }
    if (root.hasAttribute('data-vehicle-finder')) initVehicleFinder(root);
  });
}

// ==== Vehicle finder: the vehicle bar and the Fit Finder merged (spec.md §16 items 7/26) ====
// One component. With no session vehicle it's the Fit Finder, plus "Shop without a vehicle".
// With one, it never shows blank fields: "Shopping for your Toyota Hilux?", the vehicle photo, a
// read-only summary of what was picked, Shop for my Hilux (→ VLP) and Change vehicle. Change
// resets the cascade to Make (focus there) with "← Back to Hilux" to undo, instead of opening the
// drawer. Light or dark (Site Admin → Design options). Opt in with [data-vehicle-finder] on a
// [data-fit-finder-inline] widget; data-vf-browse-href sets where "Shop without a vehicle" goes,
// data-vf-shop-href / data-vf-shop-label ("{model}" = the vehicle's model) override the known
// state's button (brand pages: "Shop Thule for my Hilux" → the page's own filtered grid).
const RRG_VEHICLE_SPEC_KEY = 'rrgSessionVehicleSpec';
const RRG_VF_STYLE_KEY = 'rrgVehicleFinderStyle';
// The last Year/Body/Roof picked for each vehicle. Demo default: the generation the rest of the
// prototype uses (RRG_VEHICLES plpKey — Hilux N80, Ranger P703), else each list's first option.
const RRG_VEHICLE_SPEC_DEFAULTS = { hilux: { years: '2015-2023' } };
function rrgVehicleSpec(key) {
  const v = FIT_FINDER_VEHICLES[key];
  if (!v) return null;
  let saved = { ...(RRG_VEHICLE_SPEC_DEFAULTS[key] || {}) };
  try { Object.assign(saved, JSON.parse(localStorage.getItem(RRG_VEHICLE_SPEC_KEY) || '{}')[key] || {}); } catch (e) {}
  const pick = field => (v[field].find(([val]) => val === saved[field]) || v[field][0])[1];
  return { years: pick('years'), bodies: pick('bodies'), roofs: pick('roofs') };
}
function rrgVehicleSpecSave(key, root) {
  try {
    const all = JSON.parse(localStorage.getItem(RRG_VEHICLE_SPEC_KEY) || '{}');
    all[key] = Object.fromEntries([...root.querySelectorAll('[data-ff-field]')].map(s => [s.dataset.ffField, s.value]));
    localStorage.setItem(RRG_VEHICLE_SPEC_KEY, JSON.stringify(all));
  } catch (e) {}
}
function rrgVehicleFinderStyle() {
  try { return localStorage.getItem(RRG_VF_STYLE_KEY) === 'dark' ? 'dark' : 'light'; } catch (e) { return 'light'; }
}
window.rrgSetVehicleFinderStyle = style => {
  try { localStorage.setItem(RRG_VF_STYLE_KEY, style); } catch (e) {}
  document.querySelectorAll('[data-vehicle-finder]').forEach(el => el.dataset.vfStyle = rrgVehicleFinderStyle());
};
function initVehicleFinder(root) {
  const head = root.querySelector('.ff-head');
  const row = root.querySelector('.ff-row');
  const make = root.querySelector('[data-ff-make]');
  root.dataset.vfStyle = rrgVehicleFinderStyle();
  const known = document.createElement('div');
  known.className = 'vf-known';
  root.insertBefore(known, head);
  const browse = document.createElement('p');
  browse.className = 'vf-browse';
  browse.innerHTML = `<a href="${root.dataset.vfBrowseHref || RRG_PROTO + 'home/index.html'}">Shop without a vehicle ›</a>`;
  root.appendChild(browse);
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'vf-back';
  head.appendChild(back);
  // Optional compact proof line (home hero, spec.md §16 item 22) — shows in both states.
  if (root.dataset.vfProof) {
    const proof = document.createElement('p');
    proof.className = 'vf-proof';
    proof.textContent = root.dataset.vfProof;
    root.appendChild(proof);
  }
  let changing = false;

  const render = () => {
    const key = rrgVehicleGet();
    const v = rrgVehicle();
    const isKnown = !!v && !changing;
    root.classList.toggle('is-known', isKnown);
    known.hidden = !isKnown;
    head.hidden = row.hidden = isKnown;
    browse.hidden = !!v;
    back.hidden = !(v && changing);
    if (v) back.textContent = `← Back to ${v.label.split(' ').slice(1).join(' ')}`;
    if (!isKnown) return;
    const model = v.label.split(' ').slice(1).join(' ');
    const spec = rrgVehicleSpec(key);
    known.innerHTML = `
      <div class="vf-photo"><img src="${RRG_PROTO}_shared/${v.image}" alt="" width="956" height="556"></div>
      <div class="vf-text">
        <span class="vf-eyebrow">Your vehicle</span>
        <h2>Shopping for your ${v.label}?</h2>
        ${spec ? `<ul class="vf-spec" aria-label="Your vehicle details"><li>${spec.years}</li><li>${spec.bodies}</li><li>${spec.roofs}</li></ul>` : ''}
      </div>
      <div class="vf-actions">
        <a class="btn btn-cta" href="${root.dataset.vfShopHref || `${RRG_PROTO}vlp/index.html?vehicle=${key}`}">${(root.dataset.vfShopLabel || 'Shop for my {model}').replace('{model}', model)}</a>
        <button type="button" class="vf-change" data-vf-change>Change vehicle</button>
      </div>`;
  };
  root.addEventListener('click', e => {
    if (e.target.closest('[data-vf-change]')) {
      changing = true;
      // Reset the cascade to Make, the same as picking a make from scratch.
      make.selectedIndex = 0;
      root.querySelector('[data-ff-model]').innerHTML = '<option value="" selected disabled>Model</option>';
      root.querySelectorAll('[data-ff-model], [data-ff-required]').forEach(s => { s.disabled = true; });
      root.querySelectorAll('[data-ff-required]').forEach(s => { s.innerHTML = `<option value="" selected disabled>${FF_PLACEHOLDERS[s.dataset.ffField]}</option>`; });
      root.querySelector('[data-ff-submit]').disabled = true;
      render();
      make.focus();
    } else if (e.target.closest('.vf-back')) {
      changing = false;
      render();
      known.querySelector('.vf-change')?.focus();
    }
  });
  document.addEventListener('rrg-session-change', () => { changing = false; render(); });
  render();
}

// Home page Current Offers (docs/home/home-spec.md 5.6) — since 2026-10-02 one tile that
// cross-fades between the offers, beside the Roof Racks / Bike Racks tiles. Dots and swipe;
// autoplays every 6s on desktop only (never auto-rotate on mobile — spec.md §16 item 22),
// pausing while the pointer or focus is inside it, and never under prefers-reduced-motion.
// Inactive offers are aria-hidden and out of the tab order.
function initOfferCarousel() {
  document.querySelectorAll('[data-offer-carousel]').forEach(box => {
    const tiles = [...box.querySelectorAll('.home-offer-tile')];
    const dotsEl = box.querySelector('.home-offer-dots');
    if (tiles.length < 2) return;
    let current = 0;
    let timer = null;
    dotsEl.innerHTML = tiles.map((t, i) => `<button type="button" aria-label="Show offer ${i + 1}: ${t.getAttribute('aria-label')}"></button>`).join('');
    const dots = [...dotsEl.children];
    const show = i => {
      current = (i + tiles.length) % tiles.length;
      tiles.forEach((t, n) => {
        const on = n === current;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) t.removeAttribute('tabindex'); else t.setAttribute('tabindex', '-1');
      });
      dots.forEach((d, n) => d.setAttribute('aria-current', n === current ? 'true' : 'false'));
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktop = window.matchMedia('(min-width:901px)');
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { if (!reduced && desktop.matches && !timer) timer = setInterval(() => show(current + 1), 6000); };
    desktop.addEventListener('change', () => { stop(); start(); });
    dots.forEach((d, n) => d.addEventListener('click', () => show(n)));
    let touchX = null;
    box.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
      touchX = null;
    });
    box.addEventListener('mouseenter', stop);
    box.addEventListener('mouseleave', start);
    box.addEventListener('focusin', stop);
    box.addEventListener('focusout', e => { if (!box.contains(e.relatedTarget)) start(); });
    show(0);
    start();
  });
}

// Home page hero slider (docs/home/home-spec.md 5.2). Dots, prev/next, swipe; autoplays every 10s
// on desktop only (was 6s everywhere; 2026-09-30, spec.md §16 item 22 — never auto-rotate on
// mobile), pausing while the pointer or focus is inside the hero, and never under
// prefers-reduced-motion.
// Inactive slides are aria-hidden with their links taken out of the tab order.
function initHomeHero() {
  document.querySelectorAll('.home-hero').forEach(hero => {
    const slides = [...hero.querySelectorAll('.home-hero-slide')];
    const dotsEl = hero.querySelector('.home-hero-dots');
    if (slides.length < 2) return;
    let current = 0;
    let timer = null;
    dotsEl.innerHTML = slides.map((s, i) => `<button type="button" aria-label="Show slide ${i + 1}: ${s.dataset.title}"></button>`).join('');
    const dots = [...dotsEl.children];
    const show = i => {
      current = (i + slides.length) % slides.length;
      slides.forEach((s, n) => {
        const on = n === current;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        s.querySelectorAll('a').forEach(a => { if (on) a.removeAttribute('tabindex'); else a.setAttribute('tabindex', '-1'); });
        // Lazy slides start loading the first time they come round.
        if (on) s.querySelectorAll('img[loading="lazy"]').forEach(img => img.removeAttribute('loading'));
      });
      dots.forEach((d, n) => d.setAttribute('aria-current', n === current ? 'true' : 'false'));
    };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stop = () => { clearInterval(timer); timer = null; };
    const desktop = window.matchMedia('(min-width:901px)');
    const start = () => { if (!reduced && desktop.matches && !timer) timer = setInterval(() => show(current + 1), 10000); };
    desktop.addEventListener('change', () => { stop(); start(); });
    dots.forEach((d, n) => d.addEventListener('click', () => show(n)));
    hero.querySelector('.home-hero-nav.prev')?.addEventListener('click', () => show(current - 1));
    hero.querySelector('.home-hero-nav.next')?.addEventListener('click', () => show(current + 1));
    const stage = hero.querySelector('.home-hero-stage');
    let touchX = null;
    stage.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
      touchX = null;
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', e => { if (!hero.contains(e.relatedTarget)) start(); });
    show(0);
    start();
  });
}

// The two vehicles this prototype's session knows (RRG_VEHICLES, session-state.js), as a real
// Make → Model → Year/Body/Roof cascade. Production has every make/model and maps the full
// selection to one exact vehicle; the demo maps any Hilux or Ranger selection to that record.
const FIT_FINDER_VEHICLES = {
  hilux: { make: 'toyota', model: 'Hilux',
    years: [['2024+', '2024 Onwards (N90)'], ['2015-2023', '2015–2023 (N80)'], ['2005-2015', '2005–2015 (N70)'], ['pre-2005', 'Pre-2005']],
    bodies: [['double-cab', 'Double Cab (4dr Ute)'], ['xtra-cab', 'Xtra Cab'], ['single-cab', 'Single Cab']],
    roofs: [['bare', 'No Rails — Bare Roof'], ['styling-bar', 'Styling Bars Only (Non Load-Rated)'], ['aftermarket-rails', 'Aftermarket Rails Fitted']] },
  ranger: { make: 'ford', model: 'Ranger',
    years: [['2022+', '2022 Onwards (P703)'], ['2015-2022', '2015–2022 (PX2/PX3)'], ['2011-2015', '2011–2015 (PX1)']],
    bodies: [['double-cab', 'Double Cab (4dr Ute)'], ['super-cab', 'Super Cab'], ['single-cab', 'Single Cab']],
    roofs: [['raised-rails', 'Raised Roof Rails'], ['bare', 'No Rails — Bare Roof']] }
};
const FIT_FINDER_MAKES = [['ford', 'Ford'], ['toyota', 'Toyota']];
const FF_PLACEHOLDERS = { years: 'Year', bodies: 'Body Style', roofs: 'Roof Type' };
function ffOptions(pairs, placeholder) {
  return `<option value="" selected disabled>${placeholder}</option>` + pairs.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
}

// mode 'navigate' = header trigger (lands on the VLP on submit); anything else stays in place.
function openFitFinderDrawer(mode) {
  buildFitFinderDrawer();
  const backdrop = document.getElementById('fitFinderDrawerBackdrop');
  backdrop.dataset.mode = mode === 'navigate' ? 'navigate' : '';
  backdrop.classList.add('open');
}

function closeFitFinderDrawer() {
  const backdrop = document.getElementById('fitFinderDrawerBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

function initFitFinderTriggers() {
  // Header vehicle link (desktop utility bar + mobile takeover) → navigate mode (lands on the VLP),
  // and the PLP-family pages' own Set/Change Vehicle buttons → in place. On the Vehicle Category
  // Landing Page, Change Vehicle (breadcrumb row) opens this same drawer in place — changing
  // make/model — while its on-page Fit Finder narrows the Hilux down and hands off to the VPLP.
  document.querySelectorAll('[data-session="vehicleSet"]').forEach(el => {
    const link = el.closest('a');
    if (link) link.setAttribute('data-open-fit-finder', 'navigate');
  });
  if (document.querySelector('[data-plp-page]')) {
    document.querySelectorAll('[data-vclp-cta="set-vehicle"], [data-vclp-cta="change-vehicle"]').forEach(el => el.setAttribute('data-open-fit-finder', ''));
  }
  document.addEventListener('click', e => {
    // The "Fit My Vehicle" nav link (desktop nav and the mobile menu, which mega-menu.js builds
    // later) is matched by its text, so it needs no per-page markup change. It goes to the Fit My
    // Vehicle page (docs/fit-my-vehicle/fit-my-vehicle-spec.md, Brenton 2026-09-30) — it used to
    // open this drawer. The utility-bar vehicle link and in-page triggers still open the drawer.
    const navLink = e.target.closest('a');
    if (navLink && !navLink.hasAttribute('data-open-fit-finder') && navLink.textContent.trim() === 'Fit My Vehicle') {
      e.preventDefault();
      location.href = RRG_FMV_HREF();
      return;
    }
    const trigger = e.target.closest('[data-open-fit-finder]');
    if (!trigger) return;
    e.preventDefault();
    openFitFinderDrawer(trigger.getAttribute('data-open-fit-finder'));
  });
}

function buildStoreSlideout() {
  const triggers = document.querySelectorAll('[data-store-slideout]');
  if (!triggers.length || document.getElementById('storeSlideoutBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'store-slideout-backdrop';
  backdrop.id = 'storeSlideoutBackdrop';
  backdrop.innerHTML = `
    <div class="store-slideout" role="dialog" aria-modal="true">
      <div class="store-slideout-head">
        <h2>All Stores</h2>
        <button type="button" class="store-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="store-slideout-body" id="storeSlideoutBody"></div>
    </div>
  `;
  document.body.appendChild(backdrop);
  renderStoreSlideoutBody(null);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeStoreSlideout(); });
  backdrop.querySelector('.store-slideout-close').addEventListener('click', closeStoreSlideout);
  triggers.forEach(trigger => trigger.addEventListener('click', e => { e.preventDefault(); openStoreSlideout(); }));
}

// Store slide-out body — split out from buildStoreSlideout() (2026-09-11, backlog item 14)
// so it can be re-run any time the shared postcode changes (see syncDcPostcode() above), not
// just once at page load. When `nearState` resolves (via postcodeToState()), that state's
// real stores are promoted into a "Within 100km" group at the top, open by default, and left
// out of the state list below so it isn't shown twice; every other state remains reachable
// below as a closed accordion group. With no `nearState` (no postcode yet, or a non-AU
// region), every state group renders open, matching this widget's original always-visible
// flat order. Native `<details>/<summary>`, same no-JS accordion convention as the FAQ
// section (`.faq-item` in shared.css).
function renderStoreSlideoutBody(nearState) {
  const body = document.getElementById('storeSlideoutBody');
  if (!body) return;
  const storeRowHTML = s => `
    <div class="dc-store">
      <div>
        <strong>${s.name}</strong><span data-store-pills="${s.name}">${rrgStorePillsHTML(s.name)}</span><br>
        <span class="muted">${s.street}, ${s.city} ${s.postcode}</span><br>
        <a class="store-phone" href="tel:${s.phone.replace(/[^0-9+]/g, '')}">${s.phone}</a>
        <a class="store-map-link" href="${s.mapLink}" target="_blank" rel="noopener noreferrer">View on map</a>
      </div>
    </div>
  `;
  const groupHTML = (label, stores, open) => `
    <details class="store-slideout-group"${open ? ' open' : ''}>
      <summary class="store-slideout-state">${label}</summary>
      <div class="store-slideout-group-stores">${stores.map(storeRowHTML).join('')}</div>
    </details>
  `;
  const nearGroup = nearState ? RRG_STORE_NETWORK.find(g => g.state === nearState) : null;
  let html = nearGroup ? groupHTML('Within 100km', nearGroup.stores, true) : '';
  RRG_STORE_NETWORK.forEach(group => {
    if (nearGroup && group.state === nearGroup.state) return;
    html += groupHTML(group.state, group.stores, !nearGroup);
  });
  body.innerHTML = html + `<a class="store-slideout-finder-link" href="${RRG_STORE_FINDER_HREF()}">Open the Store Finder map ›</a>`;
  rrgLinkStoreNames(body);
}

function openStoreSlideout() {
  const backdrop = document.getElementById('storeSlideoutBackdrop');
  if (backdrop) backdrop.classList.add('open');
}

function closeStoreSlideout() {
  const backdrop = document.getElementById('storeSlideoutBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

// ---- Interactive map (Showroom Finder widget, 2026-09-10 Graham Sowerby meeting; reworked
// 2026-09-11 per backlog item 22) ----
// Piloted on Vehicle-Specific only at first; locked in as the default and rolled out to all
// 5 templates the same day after client review. No longer a Demo State Panel preview toggle
// — called unconditionally from buildAdminPanel() wherever #showroomMap exists. Leaflet +
// OpenStreetMap tiles (free, no API key). Runs the map ALONGSIDE the existing black block
// (split-view), not as a full swap — corrected 2026-09-10 after the first version replaced
// the block outright, which lost the postcode entry / "Find Nearest Showroom" CTA. Real
// postcode-driven radius search isn't implemented (no geocoding service wired up) — the map
// shows a fixed demo view of the store network; flagged here as the gap to close before this
// leaves prototype stage.
//
// 2026-09-11 rework: pins now come straight from RRG_STORE_NETWORK (all 35 real stores,
// every state) instead of a separate 4-store-NSW-only demo list duplicated per template —
// the old per-template `window.SHOWROOM_MAP_STORES` arrays are gone. Default view is
// `fitBounds()` over every store (zoomed out to the whole country) rather than a fixed
// Sydney zoom. Pins are colour-coded red (on display, per ON_DISPLAY_STORES) vs grey (not)
// via a custom `L.divIcon` — no image assets needed. Leaflet.markercluster groups pins when
// zoomed out and splits them apart on zoom in; cluster bubbles are grey by default and red
// if any store inside has the product on display (`rrgClusterIcon()` below), so the "on
// display nearby" signal is visible before a viewer even zooms in.
// 2026-09-11 (Region Selector, backlog item 21): the map is now region-aware. AU keeps the
// full 35-store clustered network from the rework above; NZ/UK are single-store demo
// regions (RRG has no real stores there — this previews a hypothetical future expansion,
// not a real network) so the map just zooms to one always-on-display pin instead. See
// REGION_SINGLE_STORES below and applyRegion()/renderShowroomMapPins() further down.
let showroomLeafletMap = null;
let showroomPinLayer = null;

function rrgPinIcon(onDisplay) {
  return L.divIcon({
    className: `rrg-map-pin${onDisplay ? ' on-display' : ''}`,
    html: '<span></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -20]
  });
}

function rrgClusterIcon(cluster) {
  const markers = cluster.getAllChildMarkers();
  const hasDisplay = markers.some(m => m.options.rrgOnDisplay);
  return L.divIcon({
    className: `rrg-map-cluster${hasDisplay ? ' on-display' : ''}`,
    html: `<span>${cluster.getChildCount()}</span>`,
    iconSize: [36, 36]
  });
}

// Rebuilds whatever pins/clusters are currently on the map for the given region — called
// once on first map init and again every time the header region dropdown changes. Removes
// the previous pin layer first (region switches, not just initial load, can call this).
function renderShowroomMapPins(region) {
  if (!showroomLeafletMap) return;
  if (showroomPinLayer) {
    showroomLeafletMap.removeLayer(showroomPinLayer);
    showroomPinLayer = null;
  }
  if (region === 'AU') {
    const clusterGroup = typeof L.markerClusterGroup === 'function'
      ? L.markerClusterGroup({ iconCreateFunction: rrgClusterIcon, maxClusterRadius: 60 })
      : L.layerGroup();
    const latLngs = [];
    RRG_STORE_NETWORK.forEach(group => group.stores.forEach(s => {
      const onDisplay = ON_DISPLAY_STORES.has(s.name);
      // rrgStoreName + the 'rrg-store-pin' event let the Store Finder match pins to its list.
      L.marker([s.lat, s.lng], { icon: rrgPinIcon(onDisplay), rrgOnDisplay: onDisplay, rrgStoreName: s.name })
        .bindPopup(`<strong>${s.name}</strong><br>${s.street}, ${s.city}<br>${onDisplay ? 'On Display' : 'In-store stock varies'}<br><a href="${rrgStorePageHref(s.name)}">View store ›</a>`)
        .on('click', () => document.dispatchEvent(new CustomEvent('rrg-store-pin', { detail: s.name })))
        .addTo(clusterGroup);
      latLngs.push([s.lat, s.lng]);
    }));
    showroomPinLayer = clusterGroup.addTo(showroomLeafletMap);
    showroomLeafletMap.fitBounds(L.latLngBounds(latLngs), { padding: [24, 24] });
  } else {
    const s = REGION_SINGLE_STORES[region];
    if (!s) return;
    showroomPinLayer = L.marker([s.lat, s.lng], { icon: rrgPinIcon(s.onDisplay), rrgOnDisplay: s.onDisplay })
      .bindPopup(`<strong>${s.name} Store</strong><br>${s.address}<br>${s.onDisplay ? 'On Display' : 'In-store stock varies'}`)
      .addTo(showroomLeafletMap);
    showroomLeafletMap.setView([s.lat, s.lng], 12);
  }
}

function applyShowroomMapFlag(on) {
  const mapEl = document.getElementById('showroomMap');
  const widget = mapEl && mapEl.closest('.showroom-widget');
  if (!mapEl) return;
  mapEl.hidden = !on;
  if (widget) widget.classList.toggle('split-view', on);
  if (!on || typeof L === 'undefined') return;
  if (!showroomLeafletMap) {
    showroomLeafletMap = L.map(mapEl);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(showroomLeafletMap);
    renderShowroomMapPins(currentRegion);
  }
  setTimeout(() => showroomLeafletMap.invalidateSize(), 0);
}

// ---- Region Selector (header dropdown, 2026-09-11, backlog item 21) ----
// A header dropdown (the utility bar's existing "🇦🇺 Australia" item, previously
// decorative-only) that behaves like the Demo State Panel toggles elsewhere on this
// prototype: a live, client-side copy/widget swap across all 5 templates, no page reload,
// no separate per-region page files. Resets to AU on every fresh page load — same
// no-persistence convention as the rest of the demo-state toggles, not saved across visits.
//
// RRG's real store network (RRG_STORE_NETWORK, 35 stores) is AU-only — NZ/UK are entirely
// hypothetical single-store demo regions for previewing what an international expansion
// would look like on this page, not real business fact. Their address/copy below is
// explicitly placeholder (flagged in DEVELOPER-BRIEF.md's Region-specific heading copy
// note) — don't mistake it for real store data if this file is read out of context.
// Real data, sourced 2026-09-11 (backlog items 29/30) — replaces the earlier fabricated
// placeholders (NZ had no real address/phone, UK was wrongly labelled "London"; the real
// store's own town is Bolton, even though the listing itself is titled "Manchester North
// Store"). Changing UK's `name` here fixes both the Showroom Finder heading
// (applyRegionShowroomHeading()) and the Click & Collect "On display at the ___ Store" line
// (initDcPostcode()) at once, since both already read from this one field.
// onDisplay (2026-09-12, spec.md §12 item 22): same real/placeholder on-display concept
// as AU's ON_DISPLAY_STORES set — both single-store regions default to true here (demo
// state, same as the rest of this file's data), but the flag now actually gates the
// Click & Collect "On display" line and the Showroom map's single-pin popup instead of
// both being hardcoded to assert it unconditionally.
// "Opening soon" stores (spec.md §16 item 12) — UK and NZ keep a Store Finder so the rollout is
// future-proofed (Graham expects two more UK stores by December). DEMO PLACEHOLDERS: none of these
// locations is confirmed. Shown only in the Store Finder, as non-clickable cards (no store page, no
// map pin, no phone), and switchable in Site Admin → Design options. Production rule: list a store
// here only once its site is signed and the opening month is known, then give it a full card once
// it opens.
const REGION_COMING_SOON = {
  NZ: [{ name: 'West Auckland', city: 'Auckland' }, { name: 'Christchurch', city: 'Christchurch' }],
  UK: [{ name: 'Leeds', city: 'Leeds' }, { name: 'Birmingham', city: 'Birmingham' }]
};
const RRG_COMING_SOON_KEY = 'rrgShowComingSoonStores';
function rrgShowComingSoon() {
  try { return localStorage.getItem(RRG_COMING_SOON_KEY) !== 'false'; } catch (e) { return true; }
}
window.rrgSetShowComingSoon = on => {
  try { localStorage.setItem(RRG_COMING_SOON_KEY, on); } catch (e) {}
  document.dispatchEvent(new CustomEvent('rrg-coming-soon-change'));
};
// Open stores in a region — the header's store link follows it (spec.md §16 item 13).
function rrgOpenStoreCount(region) {
  return region === 'AU' ? rrgStoreCount() : 1;
}
// Header nav store link: "Store Finder" while a region has 2+ open stores; with one it goes
// straight to that store ("Visit Our Bolton Store"), and flips back automatically when the second
// opens. NZ/UK have no store page in the prototype, so the single-store link opens the Store
// Finder (which shows that one store).
function rrgStoreNavLink(region = typeof currentRegion === 'undefined' ? 'AU' : currentRegion) {
  if (rrgOpenStoreCount(region) > 1) return { label: 'Store Finder', href: '#' };
  const name = REGION_SINGLE_STORES[region].name;
  return { label: `Visit Our ${name} Store`, href: rrgStorePageHref(name) || RRG_STORE_FINDER_HREF() };
}
function applyRegionStoreNav(region) {
  const link = rrgStoreNavLink(region);
  document.querySelectorAll('.rrg-nav a').forEach(a => {
    if (!a.dataset.storeNav && a.textContent.trim() !== 'Store Finder') return;
    a.dataset.storeNav = 'true';
    a.textContent = link.label;
    a.setAttribute('href', link.href);
  });
  if (window.rrgResetMobileMenu) window.rrgResetMobileMenu();
}

const REGION_SINGLE_STORES = {
  NZ: { name: 'Auckland', address: '195A Wairau Road, Wairau Valley, Auckland, 0627', phone: '09 481 1910', lat: -36.7747, lng: 174.7381, onDisplay: true, note: 'Roof Racks Galore, Auckland — roofracksgalore.co.nz/contact-us' },
  UK: { name: 'Bolton', address: 'Unit B9, Edge Fold Industrial Estate, Plodder Lane, Farnworth, Bolton, BL4 0LR', phone: '01204 899778', lat: 53.5503, lng: -2.3882, onDisplay: true, note: 'The Roof Box Company, Manchester North Store — roofbox.co.uk/locations/manchester-north.php' }
};

// Trust Row phone number (backlog item 28, 2026-09-11) — real numbers per region. Applied
// separately from REGION_TRUST_COPY below since this item's markup nests a <a href="tel:">
// inside its <p> (`<p>Contact us on: <a href="tel:...">...</a></p>`), which a plain
// `p.textContent = ...` swap (as used for the other two trust items) would silently destroy.
const REGION_PHONE = { AU: '1300 071 264', NZ: '09 481 1910', UK: '01204 899778' };

// Footer region copy (footer-spec.md Section 3) — support-email domain per region. NZ/UK
// emails are a placeholder (no real address exists anywhere in this project yet — footer-
// spec.md Section 4 data gap, needs Brenton to confirm before this leaves prototype stage),
// built as the equivalent domain so the footer isn't left blank.
const REGION_FOOTER_EMAIL = { AU: 'help@roofracksgalore.com.au', NZ: 'help@roofracksgalore.co.nz', UK: 'help@roofbox.co.uk' };

// Real UK legal/company footer line (Brenton, 2026-09-14) — TRBC's actual registered-company
// details, replacing the generic "© 2026 [brand]" line AU/NZ use. Not a placeholder like the
// email above; this is the real text, copied verbatim.
const REGION_FOOTER_LEGAL = {
  AU: '© 2026 Roof Racks Galore',
  NZ: '© 2026 Roof Racks Galore',
  UK: '© The Roof Box Company (TRBC) Ltd, Unit 4 Station Yard, Station Road, Sedbergh, Cumbria, LA10 5HP<br>Registered in England No. 16901742&nbsp;&nbsp;&nbsp;&nbsp;VAT No. 512 2969 95'
};

// Real TRBC social accounts + their own site's real icon assets (thin white ring + glyph,
// transparent background — vendored into prototypes/_shared/social-icons/, fetched live from
// roofbox.co.uk 2026-09-14, not traced/recreated) — visually distinct from AU/NZ's solid-white-
// circle-button treatment, which has no real social accounts yet (`href="#"` placeholders).
// Platform set also genuinely differs: TRBC runs Facebook/YouTube/Twitter/Instagram, no TikTok.
const REGION_FOOTER_SOCIAL = {
  default: [
    { label: 'YouTube', href: '#', kind: 'solid', svg: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 14V8l7 4-7 4Z"/></svg>' },
    { label: 'Facebook', href: '#', kind: 'solid', svg: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H16.7V3.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.2H7.6V13h2.7v8h3.2Z"/></svg>' },
    { label: 'Instagram', href: '#', kind: 'solid', svg: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>' },
    { label: 'TikTok', href: '#', kind: 'solid', svg: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8c-.9-.6-1.5-1.6-1.6-2.8h-3v13c0 1.3-1.1 2.4-2.4 2.4a2.4 2.4 0 0 1 0-4.8c.3 0 .5 0 .8.1v-3c-.3 0-.5-.1-.8-.1a5.4 5.4 0 1 0 5.4 5.4V9.2a7.4 7.4 0 0 0 4 1.2v-3c-.9 0-1.7-.2-2.4-.6Z"/></svg>' }
  ],
  UK: [
    { label: 'Facebook', href: 'https://www.facebook.com/The-Roof-Box-Company-160612236596/?ref=ts', kind: 'outline', img: 'trbc-facebook.svg' },
    { label: 'YouTube', href: 'https://www.youtube.com/user/RoofBoxCompany', kind: 'outline', img: 'trbc-youtube.svg' },
    { label: 'Twitter', href: 'https://twitter.com/roofbox_company', kind: 'outline', img: 'trbc-twitter.svg' },
    { label: 'Instagram', href: 'https://www.instagram.com/roofboxcompany/', kind: 'outline', img: 'trbc-instagram.svg' }
  ]
};

function renderFooterSocial(region) {
  const set = REGION_FOOTER_SOCIAL[region] || REGION_FOOTER_SOCIAL.default;
  document.querySelectorAll('[data-footer-social-icons]').forEach(container => {
    container.innerHTML = set.map(item => {
      const inner = item.img ? `<img src="${RRG_PROTO}_shared/social-icons/${item.img}" alt="">` : item.svg;
      const external = item.href.startsWith('http');
      return `<a href="${item.href}" aria-label="${item.label}" class="social-btn-${item.kind}"${external ? ' target="_blank" rel="noopener"' : ''}>${inner}</a>`;
    }).join('');
  });
}

// Footer Store Finder blurb — AU's real "35 nationwide locations" claim doesn't apply to
// NZ/UK, which reuse REGION_SINGLE_STORES (already the source of truth for this store data
// elsewhere, e.g. the Showroom Finder heading) rather than duplicating it here.
function regionFooterStoreCopy(region) {
  if (region === 'AU') return 'to find your closest store from our <strong>35 nationwide locations</strong>.';
  return `to find our <strong>${REGION_SINGLE_STORES[region].name}</strong> store.`;
}

// Footer "Payment Options" row (footer-spec.md Section 3.5) — card networks/wallets
// (Visa/MasterCard/Apple Pay/Google Pay) are shown in every region; only the BNPL providers
// change, reusing the same real per-region set as paymentBadgeSet() above rather than a
// second copy of that data.
// Payment marks per region, as each live site shows them (checked 2026-09-30, docs/checkout/
// checkout-spec.md Section 6): AU cards, PayPal, Zip, Afterpay and Google Pay (on the cart);
// NZ cards and PayPal only (no Afterpay); UK Google Pay, cards, Amex and PayPal (no Clearpay or
// Klarna). No site shows Apple Pay.
const REGION_FOOTER_PAYMENTS = {
  AU: ['paypal', 'visa', 'mastercard', 'zip', 'afterpay', 'google-pay'],
  NZ: ['paypal', 'visa', 'mastercard'],
  UK: ['google-pay', 'visa', 'mastercard', 'amex', 'paypal']
};

// "-dark" assets are real brand marks built to sit directly on a dark background with no
// added white chip behind them (Brenton's ask, 2026-09-14) — distinct from this same folder's
// plain versions (paypal.svg, zip.svg, etc.), which are colour logos meant for a light
// background and used elsewhere (e.g. the Decision Panel's payment badges). Visa, MasterCard,
// Apple Pay, Google Pay and Klarna are real CC0 monochrome marks from Simple Icons
// (cdn.simpleicons.org, requested pre-coloured white); Zip and Clearpay have no equivalent
// there, so their existing local assets were recoloured by hand instead — Zip keeps its real
// purple accent and turns its dark wordmark white (matching Zip's own official "on dark"
// lockup), Clearpay's solid-black wordmark is turned fully white.
const FOOTER_PAYMENT_ICON = {
  paypal: ['paypal-dark.svg', 'PayPal'],
  visa: ['visa-dark.svg', 'Visa'],
  mastercard: ['mastercard-dark.svg', 'MasterCard'],
  'apple-pay': ['applepay-dark.svg', 'Apple Pay'],
  'google-pay': ['googlepay-dark.svg', 'Google Pay'],
  zip: ['zip-dark.svg', 'Zip'],
  afterpay: ['afterpay-dark.svg', 'Afterpay'],
  clearpay: ['clearpay-dark.svg', 'Clearpay'],
  klarna: ['klarna-dark.svg', 'Klarna'],
  amex: ['amex-dark.svg', 'American Express']
};

function renderFooterPayments(region) {
  document.querySelectorAll('[data-footer-payment-icons]').forEach(container => {
    const order = REGION_FOOTER_PAYMENTS[region] || REGION_FOOTER_PAYMENTS.AU;
    container.innerHTML = order.map(key => {
      const [src, alt] = FOOTER_PAYMENT_ICON[key];
      return `<span class="payment-icon"><img src="${RRG_PROTO}_shared/payment-logos/${src}" alt="${alt}"></span>`;
    }).join('');
  });
}

// Footer region sweep — copyright/email/store-copy text swaps plus the payment-icon re-render
// above. Brand logo swap needs no footer-specific code: the footer logo carries the same
// `.rrg-logo` class as the header, so it's already covered by applyRegionBrand() below; its
// UK sizing override lives in footer.css (`body.region-uk .footer-brand-col .rrg-logo img`).
// Phone number reuses the existing `[data-trust="phone"]` sweep earlier in applyRegion() —
// the footer's Call Us row carries that same data attribute, not a separate one.
function applyRegionFooter(region) {
  document.querySelectorAll('[data-footer-copyright]').forEach(el => {
    el.innerHTML = REGION_FOOTER_LEGAL[region];
  });
  document.querySelectorAll('[data-footer-email]').forEach(a => {
    a.textContent = REGION_FOOTER_EMAIL[region];
    a.href = `mailto:${REGION_FOOTER_EMAIL[region]}`;
  });
  document.querySelectorAll('[data-footer-store-copy]').forEach(el => {
    el.innerHTML = regionFooterStoreCopy(region);
  });
  document.querySelectorAll('[data-footer-tagline]').forEach(el => {
    el.hidden = region !== 'UK';
  });
  renderFooterPayments(region);
  renderFooterSocial(region);
}

const REGION_LABELS = { AU: 'Australia', NZ: 'New Zealand', UK: 'United Kingdom' };
// Flag images, not emoji — Windows has no flag emoji and showed the letters ("AU", "GB")
// instead (Brenton, 2026-09-29). SVGs from the flag-icons set, in _shared/flags/.
const REGION_FLAGS = { AU: 'au', NZ: 'nz', UK: 'gb' };

// AU/UK default to the Click & Collect tab, NZ defaults to Delivery — per spec.md item 21.
const REGION_DEFAULT_DC_TAB = { AU: 'collect', NZ: 'delivery', UK: 'delivery' };

// Trust row's founded/network claims are real facts about the current AU-only business —
// swapped to honest regional placeholders rather than a literal "Australia's Largest" claim
// showing while NZ/UK is selected. Placeholder copy, flagged for real client wording once
// this leaves prototype stage (same convention as the rest of this project's demo copy).
const REGION_TRUST_COPY = {
  AU: {
    founded: { h4: 'Trusted Since 1989', p: 'Now with over 30 locations Australia wide' },
    network: { h4: "Australia's Largest", p: "We're the only nationwide roof rack specialists" }
  },
  NZ: {
    founded: { h4: 'Trusted Since 1989', p: 'Now serving New Zealand' },
    network: { h4: 'Visit In Person', p: 'Check it out at our Auckland showroom' }
  },
  UK: {
    founded: { h4: 'Trusted Since 1989', p: 'Now serving the United Kingdom' },
    network: { h4: 'Visit In Person', p: 'Check it out at our Bolton showroom' }
  }
};

let currentRegion = 'AU';

// Showroom Finder heading text is per-template static markup (each product shows a
// different AU on-display store count) — cached the first time this runs so switching back
// to AU restores the real per-page count instead of a hardcoded generic string.
function applyRegionShowroomHeading(region, heading) {
  if (!heading) return;
  if (!heading.dataset.auHeading) heading.dataset.auHeading = `See It In Person — On Display At ${ON_DISPLAY_STORES.size} Stores Nationwide`;
  heading.textContent = region === 'AU'
    ? heading.dataset.auHeading
    : `See It In Person — On Display At the ${REGION_SINGLE_STORES[region].name} Store`;
}

// Utility bar "Your Nearest Store" (backlog item 32, 2026-09-11) — was hardcoded per-template
// AU text ("North Lakes"), not wired into the region cascade at all. Same restore-on-AU
// caching pattern as applyRegionShowroomHeading() above: cache the real per-page AU value the
// first time this runs, NZ/UK reuse the same REGION_SINGLE_STORES name already driving the
// Showroom heading and Click & Collect single-store copy (Auckland/Bolton for free).
// Stores the resolved name on the link's dataset rather than writing it straight to
// textContent (2026-09-13, header integration) — the "Nearest Store Set?" session toggle
// (Site Admin Panel, session-state.js) now also governs what actually renders, so the real
// display is deferred to applyStoreSessionDisplay() below.
function applyRegionNearestStore(region) {
  const link = document.querySelector('[data-region-nearest-store]');
  if (!link) return;
  if (!link.dataset.auStore) link.dataset.auStore = rrgSavedStoreName() || link.textContent;
  link.dataset.currentStoreName = region === 'AU' ? link.dataset.auStore : REGION_SINGLE_STORES[region].name;
  applyStoreSessionDisplay();
}

// "Nearest store set?" (Site Admin Panel, session-state.js) interacts with the region-driven
// store name above rather than being a simple on/off text swap, so it's handled here instead
// of in session-state.js's generic loop — re-applied both when region changes (name changes,
// via applyRegionNearestStore above) and when the session toggle itself changes
// ('rrg-session-change' event, dispatched by session-state.js).
function applyStoreSessionDisplay() {
  const link = document.querySelector('[data-region-nearest-store]');
  const label = document.querySelector('[data-session-store-label]');
  if (!link) return;
  const on = rrgSessionGet('storeSet');
  if (label) label.hidden = !on;
  link.textContent = on ? link.dataset.currentStoreName : 'Find A Store';
  const storeHref = on ? rrgStorePageHref(link.dataset.currentStoreName) : RRG_STORE_FINDER_HREF();
  link.setAttribute('href', storeHref || '#');
  // VLP Store Finder tile's "Your Nearest Store" line mirrors the header's.
  document.querySelectorAll('[data-sft-nearest]').forEach(a => {
    a.textContent = link.textContent;
    const line = a.closest('.sft-nearest');
    if (line) line.hidden = !on;
  });
}
document.addEventListener('rrg-session-change', applyStoreSessionDisplay);

function applyRegion(region) {
  currentRegion = region;

  // Utility bar trigger label/flag
  const flagEl = document.querySelector('[data-region-flag]');
  const labelEl = document.querySelector('[data-region-label]');
  if (flagEl) flagEl.src = `${RRG_PROTO}_shared/flags/${REGION_FLAGS[region]}.svg`;
  if (labelEl) labelEl.textContent = REGION_LABELS[region];
  document.querySelectorAll('.region-switcher-menu a').forEach(a => {
    a.classList.toggle('current', a.dataset.region === region);
  });

  // Click & Collect vs Delivery default tab — reuses the existing tab-click handler
  // (initDeliveryCollectTabs) via a real click, rather than duplicating its class/hidden
  // toggling logic here. Also hides the Click & Collect card's own "View all stores" link
  // for NZ/UK (its store slide-out lists the real 35-store AU network, which doesn't apply
  // to a single-store region) and re-triggers the existing postcode-widget's update() via
  // its real Update button, so `.dc-viewall-line`'s text picks up the region-aware copy
  // from initDcPostcode() below rather than staying stuck on whatever it last showed.
  document.querySelectorAll('.dc-widget').forEach(widget => {
    const tab = widget.querySelector(`[data-dc-tab="${REGION_DEFAULT_DC_TAB[region]}"]`);
    if (tab && !tab.hidden) tab.click();
    const viewAllLink = widget.querySelector('.dc-viewall-row .dc-viewall');
    if (viewAllLink) viewAllLink.hidden = region !== 'AU';
    widget.querySelector('[data-dc-update]')?.click();
  });


  // Showroom Finder heading + map pins + "View all stores" (real AU-only store list, so it
  // doesn't apply once a single-store region is showing)
  document.querySelectorAll('#showroomDefaultView').forEach(view => {
    applyRegionShowroomHeading(region, view.querySelector('h3'));
    const viewAllRow = view.querySelector('.dc-viewall-row');
    if (viewAllRow) viewAllRow.hidden = region !== 'AU';
  });
  renderShowroomMapPins(region);
  // VLP Store Finder tile subline — same AU-cached / single-store swap as the heading above.
  document.querySelectorAll('[data-region-store-count]').forEach(el => {
    if (!el.dataset.auCopy) el.dataset.auCopy = el.textContent;
    el.textContent = region === 'AU' ? el.dataset.auCopy : `Our ${REGION_SINGLE_STORES[region].name} Store`;
  });

  // Trust row founded/network claims
  const copy = REGION_TRUST_COPY[region];
  document.querySelectorAll('[data-trust]').forEach(item => {
    const c = copy[item.dataset.trust];
    if (!c) return;
    const h4 = item.querySelector('h4'), p = item.querySelector('p');
    if (h4) h4.textContent = c.h4;
    if (p) p.textContent = c.p;
  });

  // Trust row phone number (backlog item 28) — real number per region, see REGION_PHONE
  // above for why this is a separate pass from the founded/network copy loop.
  const phone = REGION_PHONE[region];
  document.querySelectorAll('[data-trust="phone"] a[href^="tel:"]').forEach(a => {
    a.textContent = phone;
    a.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  });

  // Utility bar "Your Nearest Store" (backlog item 32, 2026-09-11) — same simple text-swap
  // treatment as the phone number above.
  applyRegionNearestStore(region);
  applyRegionStoreNav(region);

  // Ex-Demo/Factory Seconds inline link (backlog item 4 follow-up, 2026-09-11): re-render
  // any stock line already showing the B-Stock link so its wording ("Graded" for UK) and
  // store-derived price both flip live if the region switches while it's visible.
  document.querySelectorAll('.stock-status-line').forEach(renderStockLine);

  // Payment-plan badges (backlog items 31/31a, 2026-09-11) — provider set differs per region,
  // not just the instalment amount, so it needs a full re-sync on every region switch, not
  // just on price-changing renders. currentRegion is already updated above, so this is safe
  // regardless of ordering against the currency sweep below.
  document.querySelectorAll('.price-block').forEach(syncPaymentBadges);

  // Currency symbol (UK backlog ask, 2026-09-11) and UK brand skin — run last, after every
  // other region-driven re-render above, so both act on the final DOM state rather than
  // something about to be overwritten.
  applyRegionCurrency(region);
  applyRegionBrand(region);

  // Footer text/asset swaps (footer-spec.md Section 3) — run last for the same reason as the
  // two calls above: acts on final DOM state, not something about to be overwritten.
  applyRegionFooter(region);
  document.dispatchEvent(new CustomEvent('rrg-region-change', { detail: region }));
}

// Store Finder links (docs/store-finder/store-finder-spec.md Section 4) — the header nav's
// "Store Finder" (desktop and the mobile menu mega-menu.js builds), the footer's "Click here to
// find your closest store", and any [data-store-finder-link]. Matched by text like the "Fit My
// Vehicle" nav link, so no template needs its own markup change. Delegated, so the mobile
// menu's later-built links work too.
document.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a || a.getAttribute('href') !== '#' || a.hasAttribute('data-store-slideout')) return;
  if (!(a.hasAttribute('data-store-finder-link') || a.hasAttribute('data-store-nav') || a.textContent.trim() === 'Store Finder' || a.closest('.footer-store-finder'))) return;
  e.preventDefault();
  location.href = RRG_STORE_FINDER_HREF();
});

// fmtAud()/fmtMoney() (this file + the per-template inline scripts) already pick up the
// right symbol on their NEXT call via regionCurrencySymbol() — this sweep instead fixes
// whatever's already sitting in the DOM at the moment the region changes: static per-SKU
// markup (Related Products' `.price` divs, Simple/Grouped-Bundle's non-variant price block)
// and anything rendered before this specific switch (payment badges, exdemo suffix, etc.).
// Same numeric values either way — this is a symbol swap, not a currency conversion; no FX
// math anywhere in this prototype. Scoped away from <script>/<style> (their text nodes are
// still part of the DOM text-node tree, so an unscoped walk would silently corrupt inline
// JS/CSS) and the Demo State Panel (a reviewer tool, not page content).
function applyRegionCurrency(region) {
  const symbol = region === 'UK' ? '£' : '$';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!/[$£]\d/.test(node.nodeValue)) return NodeFilter.FILTER_SKIP;
      return node.parentElement && node.parentElement.closest('script, style, .admin-panel')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(node => { node.nodeValue = node.nodeValue.replace(/[$£](?=\d)/g, symbol); });
}

// UK brand skin (backlog ask, 2026-09-11): RRG trades in the UK as "The Roof Box Company"
// (roofbox.co.uk) — a real sister brand, not a reskin RRG invented. Scope confirmed with
// Brenton: logo + the core brand colour (navy, replacing RRG red everywhere `--rrg-red` is
// already used, so every component built against that token picks it up for free) plus
// their real Add to Cart green — NOT a typography change, Barlow Condensed/Lato stay for
// build simplicity and consistency with the rest of the prototype. NZ is unaffected (real
// scraped tab copy already treats AU+NZ as one brand/network) — this only ever toggles for
// 'UK'. Logo swap is a straight `src`/`alt` swap on every `.rrg-logo img` on the page (main
// header + the sticky condensed mobile header both reuse the same markup pattern); colours
// are driven by toggling a `body.region-uk` class that overrides the `--rrg-red`/
// `--rrg-red-dark` custom properties in shared.css, plus a direct override for the Add to
// Cart button (which isn't on the `--rrg-red` token to begin with — it's RRG's separate
// locked-in gold default, see shared.css).
const RRG_LOGO = { src: RRG_PROTO + '_shared/headerlogo.png', alt: 'Roof Racks Galore' };
// White-on-transparent recolour of RRG_LOGO (footer-spec.md Section 3) — the header's logo is
// black text built for its white background; the footer's background is dark, so it needs
// its own variant. UK reuses the same self-contained badge everywhere (it already carries its
// own background box, so it works on both the light header and the dark footer unchanged).
const RRG_LOGO_WHITE = { src: RRG_PROTO + '_shared/headerlogo-white.png', alt: 'Roof Racks Galore' };
const UK_LOGO = { src: RRG_PROTO + '_shared/brand-roofbox-uk-logo.svg', alt: 'The Roof Box Company' };
// The trading name per region, for page copy (UK trades as The Roof Box Company; NZ is RRG).
function rrgBrandName(region = typeof currentRegion === 'undefined' ? 'AU' : currentRegion) {
  return region === 'UK' ? 'The Roof Box Company' : 'Roof Racks Galore';
}

function applyRegionBrand(region) {
  document.body.classList.toggle('region-uk', region === 'UK');
  const logo = region === 'UK' ? UK_LOGO : RRG_LOGO;
  document.querySelectorAll('.rrg-logo img').forEach(img => {
    if (img.closest('.rrg-footer')) return;
    img.src = logo.src;
    img.alt = logo.alt;
  });
  const footerLogo = region === 'UK' ? UK_LOGO : RRG_LOGO_WHITE;
  document.querySelectorAll('.rrg-footer .rrg-logo img').forEach(img => {
    img.src = footerLogo.src;
    img.alt = footerLogo.alt;
  });
  // The sale takeover is AU/NZ only (campaign.js) — re-check it whenever the region changes.
  if (typeof rrgApplyCampaign === 'function') rrgApplyCampaign();
}

function initRegionSwitcher() {
  const wrap = document.querySelector('.region-switcher');
  // Pages without the switcher (the distraction-free checkout) still follow the saved region.
  if (!wrap) {
    const region = initialRegion();
    applyRegion(region);
    if (region === 'UK') setTimeout(() => applyRegionCurrency(currentRegion), 0);
    return;
  }
  const toggle = wrap.querySelector('.region-switcher-toggle');
  const menu = wrap.querySelector('.region-switcher-menu');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = wrap.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  menu.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => {
    wrap.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
  menu.querySelectorAll('a[data-region]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      applyRegion(a.dataset.region);
      try { localStorage.setItem(REGION_STORE_KEY, a.dataset.region); } catch (err) {}
      wrap.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
  const region = initialRegion();
  applyRegion(region);
  // Some templates draw more prices after this runs (e.g. the Search Results price filter,
  // plp.js's own DOMContentLoaded) — re-sweep the currency once every setup handler is done.
  if (region === 'UK') setTimeout(() => applyRegionCurrency(currentRegion), 0);
}

// Region sticks across pages (2026-09-29, Brenton): a shareable link can set it with
// ?region=uk (or au/nz), and that — or a pick from the header flag menu — is remembered until
// the header menu changes it again. Site Admin → Reset clears it (it's an rrg* key).
const REGION_STORE_KEY = 'rrgRegion';
function initialRegion() {
  const valid = r => ['AU', 'NZ', 'UK'].includes(r) ? r : null;
  const fromUrl = valid((new URLSearchParams(window.location.search).get('region') || '').toUpperCase());
  if (fromUrl) {
    try { localStorage.setItem(REGION_STORE_KEY, fromUrl); } catch (err) {}
    return fromUrl;
  }
  let stored = null;
  try { stored = valid(localStorage.getItem(REGION_STORE_KEY)); } catch (err) {}
  return stored || 'AU';
}

// ---- Paid "Fitted" option (demo-preview only, 2026-09-10 client meeting) ----
// Client is enthusiastic about a paid professional-fitting upsell as a future real
// feature, but fitting costs aren't standardized store-to-store yet, so this previews
// the *concept* only — neither mode is wired to real cart/checkout totals. Applies only
// on templates with a .variant-picker (config-variant, vehicle-specific).
const FITTED_PRICE_ADD = 199;

function buildFittedCard() {
  const el = document.createElement('div');
  el.className = 'variant-option fitted-option';
  el.dataset.fittedCard = 'true';
  el.innerHTML = `
    <div class="radio"></div>
    <div class="v-label">Get It Fitted</div>
    <div class="v-price">+ ${fmtAud(FITTED_PRICE_ADD)}</div>
    <div class="v-note">Professionally installed by our nationwide fit network — booked after checkout.</div>
  `;
  el.addEventListener('click', () => {
    const picker = el.parentElement;
    const wasSelected = el.classList.contains('selected');
    picker.querySelectorAll(':scope > .variant-option').forEach(o => o.classList.remove('selected'));
    if (!wasSelected) el.classList.add('selected');
    else picker.querySelector(':scope > .variant-option:not([data-fitted-card])')?.classList.add('selected');
  });
  return el;
}

// Re-injects whichever Fitted-option UI is currently toggled on. Safe to call after any
// page re-render (variant switch clears .variant-picker's innerHTML, wiping the injected
// card) — pages with a .variant-picker should call this at the end of their own
// renderAll(), same convention as reapplySaleFlag().
function reapplyFittedOption() {
  document.querySelectorAll('.variant-picker [data-fitted-card]').forEach(el => el.remove());
  document.querySelectorAll('.cta-col .fitted-upsell-checkbox').forEach(el => el.remove());
  if (!adminState.fittedOption) return;
  if (adminState.fittedMode === 'checkbox') {
    document.querySelectorAll('.cta-col').forEach(col => {
      const btn = col.querySelector('[data-cta-label]');
      if (!btn) return;
      const label = document.createElement('label');
      label.className = 'fitted-upsell-checkbox';
      label.innerHTML = `<input type="checkbox"><span><strong>Get It Fitted</strong> — add professional installation for <strong>+${fmtAud(FITTED_PRICE_ADD)}</strong><span class="fitted-sub">Booked after checkout.</span></span>`;
      btn.insertAdjacentElement('beforebegin', label);
    });
  } else {
    document.querySelectorAll('.variant-picker').forEach(picker => picker.appendChild(buildFittedCard()));
  }
}

function setFittedOptionFlag(on) {
  adminState.fittedOption = on;
  reapplyFittedOption();
}

function setFittedOptionMode(mode) {
  adminState.fittedMode = mode;
  reapplyFittedOption();
}

// ---- Fitted Photos Gallery — "View All In-store Fitments" slide-out (2026-09-12, reworked
// same day per Brenton's live-site screenshot) ----
// Final placement/colour locked in 2026-09-12 (spec.md Section 12 item 5): full-width above
// the Trust Row, non-red background, permanently — the placement/red-background Demo State
// Panel toggles that previously existed to help decide this have been removed. Right-edge
// slide-in drawer, same backdrop/drawer convention as buildStoreSlideout()/buildExdemoSlideout()
// above (independent instance), but with two views: a photo grid (default) and a per-fitment
// detail view (opened by clicking a grid photo), matching the live site's own "Browse Fitment"
// popup. Brenton's calls on the data gaps here (no per-photo vehicle/component/multi-angle data
// exists for our 16 real scraped photos): every fitment shows the same real vehicle/components
// (this page's own data, not fabricated), and the detail view's 3 "other angle" thumbnails reuse
// other real photos from the same 16 rather than inventing new ones — flagged in spec.md Section
// 7 alongside the existing 16-vs-283 count gap. "Fit #" uses each photo's own real Rackit
// `product_id` (FIT_GALLERY_PHOTOS[].id), not a fabricated number.
let fitGallerySlideoutIndex = 0;

function buildFitGallerySlideout() {
  const triggers = document.querySelectorAll('[data-fit-gallery-slideout]');
  if (!triggers.length || document.getElementById('fitGallerySlideoutBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'fit-gallery-slideout-backdrop';
  backdrop.id = 'fitGallerySlideoutBackdrop';
  backdrop.innerHTML = `
    <div class="fit-gallery-slideout" role="dialog" aria-modal="true">
      <div class="fit-gallery-slideout-head">
        <h2 id="fitGallerySlideoutTitle">In-store Fitments</h2>
        <button type="button" class="fgs-back-link" id="fgsBackLink" hidden>
          <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.3"/><rect x="14" y="3" width="7" height="7" rx="1.3"/><rect x="3" y="14" width="7" height="7" rx="1.3"/><rect x="14" y="14" width="7" height="7" rx="1.3"/></svg>
          Back to Grid View
        </button>
        <button type="button" class="fit-gallery-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="fit-gallery-slideout-body" id="fitGallerySlideoutBody"></div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeFitGallerySlideout(); });
  backdrop.querySelector('.fit-gallery-slideout-close').addEventListener('click', closeFitGallerySlideout);
  backdrop.querySelector('#fgsBackLink').addEventListener('click', renderFitGallerySlideoutGrid);
  // Delegated on the body container (not bound per-photo/per-button) since both views replace
  // this container's innerHTML wholesale on every render.
  backdrop.querySelector('#fitGallerySlideoutBody').addEventListener('click', e => {
    if (e.target.closest('[data-fgs-load-more]')) { fitGallerySlideoutLoadMore(); return; }
    const photo = e.target.closest('[data-fgs-open-index]');
    if (photo) { renderFitGallerySlideoutDetail(Number(photo.dataset.fgsOpenIndex)); return; }
    const prev = e.target.closest('.fgs-prev');
    if (prev && !prev.disabled) { renderFitGallerySlideoutDetail(fitGallerySlideoutIndex - 1); return; }
    const next = e.target.closest('.fgs-next');
    if (next && !next.disabled) { renderFitGallerySlideoutDetail(fitGallerySlideoutIndex + 1); return; }
    if (e.target.closest('.fgs-back-to-product')) closeFitGallerySlideoutAndReturn();
  });
  triggers.forEach(trigger => trigger.addEventListener('click', e => { e.preventDefault(); openFitGallerySlideout(); }));
}

// Real count comes from #fitGallerySection's data-count (283 by default, or whatever the Demo
// State Panel's "Fitment count" input is set to); rendered tiles are capped at 100 so the DOM
// doesn't balloon on a very large count, cycling the 16 real photos to fill it.
function fitGalleryTileCount() {
  const section = document.getElementById('fitGallerySection');
  const realCount = parseInt((section && section.dataset.count) || FIT_GALLERY_PHOTOS.length, 10) || FIT_GALLERY_PHOTOS.length;
  return { realCount, tileCount: Math.min(100, realCount) };
}

// ---- Fitment gallery grid-view redesign (2026-09-18, PLP review item 5) ------------------
// Brenton's feedback on the design review: the individual fitment detail view is fine as-is,
// but the grid view (reached directly, or via "Back to Grid View") was "very busy, harsh on
// the eyes" — a flat wall of bare <img> tags with no structure. Fix: group tiles into labelled
// sections (by the fabricated FIT_GALLERY_PHOTOS[].colour — see that array's own comment for
// why colour, not vehicle, is the fabricated axis) with a caption under each tile, and reveal
// only FGS_INITIAL_REVEAL tiles up front with a "Load More" button instead of dumping the
// whole tileCount at once. Shared by both the page-level widget (renderFitGallerySlideoutGrid
// below) and the PLP per-row widget (plpRenderRowFgGrid in plp.js) so both drawers redesign
// identically despite being independent instances.
const FGS_INITIAL_REVEAL = 8;
const FGS_LOAD_STEP = 8;

function fgsGroupedGridHTML(photos, tileCount, revealedCount) {
  const revealed = Math.min(revealedCount, tileCount);
  const groups = [];
  const groupIndexByColour = {};
  for (let i = 0; i < revealed; i++) {
    const photo = photos[i % photos.length];
    const colour = photo.colour || 'Other';
    if (!(colour in groupIndexByColour)) {
      groupIndexByColour[colour] = groups.length;
      groups.push({ colour, tiles: [] });
    }
    groups[groupIndexByColour[colour]].tiles.push({ i, photo });
  }
  let html = `<p class="fgs-grid-intro">Showing <strong>${revealed}</strong> of <strong>${tileCount}</strong> in-store fitments</p>`;
  html += groups.map(g => `
    <div class="fgs-group">
      <h3 class="fgs-group-label">${g.colour} <span class="fgs-group-count">(${g.tiles.length})</span></h3>
      <div class="fgs-group-grid">
        ${g.tiles.map(t => `
          <div class="fgs-photo-tile">
            <img src="${t.photo.thumb}" data-fgs-open-index="${t.i}" role="button" tabindex="0" alt="Fitted to a customer's vehicle — view fitment detail">
            <span class="fgs-photo-caption">Fit #${t.photo.id}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  if (revealed < tileCount) {
    html += `<button type="button" class="btn btn-outline fgs-load-more" data-fgs-load-more>Load More (${Math.min(FGS_LOAD_STEP, tileCount - revealed)})</button>`;
  }
  return html;
}

let fitGallerySlideoutRevealed = FGS_INITIAL_REVEAL;

function fitGallerySlideoutLoadMore() {
  const { tileCount } = fitGalleryTileCount();
  fitGallerySlideoutRevealed = Math.min(tileCount, fitGallerySlideoutRevealed + FGS_LOAD_STEP);
  document.getElementById('fitGallerySlideoutBody').innerHTML = fgsGroupedGridHTML(FIT_GALLERY_PHOTOS, tileCount, fitGallerySlideoutRevealed);
}

function openFitGallerySlideout() {
  const backdrop = document.getElementById('fitGallerySlideoutBackdrop');
  if (!backdrop || typeof FIT_GALLERY_PHOTOS === 'undefined' || !FIT_GALLERY_PHOTOS.length) return;
  renderFitGallerySlideoutGrid();
  backdrop.classList.add('open');
}

// Opens the slide-out straight to one fitment's detail view (2026-09-12) — used by the
// in-page carousel (renderFitGalleryTrack() in vehicle-specific/index.html), so clicking a
// photo there jumps directly to its detail rather than requiring "View All" first.
function openFitGallerySlideoutAt(index) {
  const backdrop = document.getElementById('fitGallerySlideoutBackdrop');
  if (!backdrop) return;
  renderFitGallerySlideoutDetail(index);
  backdrop.classList.add('open');
}

function renderFitGallerySlideoutGrid() {
  const { realCount, tileCount } = fitGalleryTileCount();
  fitGallerySlideoutRevealed = Math.min(FGS_INITIAL_REVEAL, tileCount);
  document.getElementById('fitGallerySlideoutTitle').hidden = false;
  document.getElementById('fitGallerySlideoutTitle').textContent = `In-store Fitments (${realCount})`;
  document.getElementById('fgsBackLink').hidden = true;
  const body = document.getElementById('fitGallerySlideoutBody');
  body.className = 'fit-gallery-slideout-body';
  body.innerHTML = fgsGroupedGridHTML(FIT_GALLERY_PHOTOS, tileCount, fitGallerySlideoutRevealed);
}

// Reuses the page's own real What's Included rows (Platform/Backbone/Tracks) rather than a
// second hardcoded copy, so the two lists can't drift out of sync with each other.
function rackComponentsFromPage() {
  return Array.from(document.querySelectorAll('.package-items .package-item')).map(row => ({
    qty: row.querySelector('.pi-qty') ? row.querySelector('.pi-qty').textContent : '1x',
    name: row.querySelector('.pi-name') ? row.querySelector('.pi-name').textContent : ''
  }));
}

function renderFitGallerySlideoutDetail(index) {
  const { realCount, tileCount } = fitGalleryTileCount();
  const clamped = Math.max(0, Math.min(tileCount - 1, index));
  fitGallerySlideoutIndex = clamped;
  const photo = FIT_GALLERY_PHOTOS[clamped % FIT_GALLERY_PHOTOS.length];
  const others = FIT_GALLERY_PHOTOS.filter((_, i) => i !== (clamped % FIT_GALLERY_PHOTOS.length)).slice(0, 3);
  const vehicleLine = (typeof VEHICLE_PRODUCT !== 'undefined' && VEHICLE_PRODUCT.shared.specifications_shared['Vehicle']) || '';
  const productTitle = document.querySelector('h1') ? document.querySelector('h1').textContent : '';
  const components = rackComponentsFromPage();

  document.getElementById('fitGallerySlideoutTitle').hidden = true;
  document.getElementById('fgsBackLink').hidden = false;

  const body = document.getElementById('fitGallerySlideoutBody');
  body.className = 'fit-gallery-slideout-body fgs-detail-body';
  body.innerHTML = `
    <div class="fgs-browse-bar">
      <span>Browse Fitment <strong>${clamped + 1}</strong> of ${realCount}</span>
      <span class="fgs-fit-id">Fit #${photo.id}</span>
    </div>
    <div class="fgs-nav-row">
      <button type="button" class="btn btn-outline fgs-prev" ${clamped === 0 ? 'disabled' : ''}>&lsaquo; Prev</button>
      <button type="button" class="btn btn-outline fgs-next" ${clamped === tileCount - 1 ? 'disabled' : ''}>Next &rsaquo;</button>
    </div>
    <div class="fgs-main-image"><img src="${photo.thumb}" alt="Rhino Rack Pioneer Platform fitted to a customer's Hilux N80"></div>
    <div class="fgs-thumbs">${[photo, ...others].map(p => `<img src="${p.thumb}" alt="">`).join('')}</div>
    <h3 class="fgs-product-title">${productTitle}</h3>
    <div class="fgs-vehicle-line">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h1zm2.1-4l-1.2 4h12.2l-1.2-4a1 1 0 0 0-.9-.5H8a1 1 0 0 0-.9.5zM7 15.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>
      ${vehicleLine}
    </div>
    <div class="fgs-components">
      <h4>Rack Components</h4>
      ${components.map(c => `<div class="fgs-component-row"><span class="fgs-c-name">${c.name}</span><span class="fgs-c-qty">${c.qty}</span></div>`).join('')}
    </div>
    <p class="fgs-note">Note: fitment images may contain additional accessories or hardware that are not included in the rack system. <strong>Only items listed above are included.</strong></p>
    <button type="button" class="btn btn-outline fgs-back-to-product">Back to Product</button>
  `;
}

// "Back to Product" (Brenton's call, replacing the live site's "View Rack & Buy" — this page
// already IS that product, so "buy" doesn't apply the same way): close the drawer and return
// focus to the decision panel rather than navigate anywhere.
function closeFitGallerySlideoutAndReturn() {
  closeFitGallerySlideout();
  const panel = document.querySelector('.decision-panel');
  if (!panel) return;
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  panel.classList.add('fgs-highlight');
  setTimeout(() => panel.classList.remove('fgs-highlight'), 1200);
}

function closeFitGallerySlideout() {
  const backdrop = document.getElementById('fitGallerySlideoutBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

// Fitted Photos Gallery carousel — horizontal scroll-snap track with prev/next nav and
// page dots (click a dot to jump to that page; scrolling updates the active dot). Mirrors
// initGalleryCarousels()'s overflow-detection convention but adds dot pagination, since
// this widget's reference design calls for it and the main product gallery's doesn't.
// ==== Fitment Gallery section — one builder for every page that shows it (2026-09-29, spec.md
// §15 C9). Vehicle-Specific and VCLP mount it into <section class="fit-gallery-section"
// data-fit-gallery data-count="N">; VPLP's plpFitGallerySectionHTML() wraps the same panel. Was
// hand-copied markup on two pages plus a generated copy on VPLP, each with a different badge
// SVG, alt text and image attributes.
function fitGalleryPanelHTML(count) {
  return `
    <div class="fit-gallery-panel" id="fitGalleryPanel">
      <div class="fit-gallery-head">
        <div class="fit-gallery-title">
          <span class="fit-gallery-badge">
            <svg viewBox="0 0 27 22" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#vi-clip-fitgallery)"><path d="M24.9152 14.5953V14.0848C24.9152 12.0661 23.2893 10.4418 21.2815 10.4418C20.6739 10.4418 20.1127 10.1054 19.8234 9.56589L17.8676 5.97512C17.5726 5.43563 17.0113 5.10498 16.4038 5.10498L5.13237 5.12238C4.63477 5.12238 4.1603 5.34862 3.84206 5.73728L1.51025 8.60874C0.567114 9.76892 0.248877 11.3236 0.653906 12.7622L1.17466 14.6185C0.931641 14.7055 0.705981 14.8505 0.520825 15.0362C0.191016 15.3668 0.00585938 15.8193 0.00585938 16.2892C0.00585938 17.2637 0.792773 18.0584 1.76484 18.0584H2.66748C2.66748 18.1165 2.66748 18.1687 2.66748 18.2209C2.66748 19.9321 4.05037 21.3244 5.76306 21.3244C7.47576 21.3244 8.85864 19.9379 8.85864 18.2209C8.85864 18.1687 8.85864 18.1165 8.85864 18.07L15.6168 18.0816C15.6168 18.1281 15.6168 18.1803 15.6168 18.2267C15.6168 19.9379 16.9997 21.3302 18.7124 21.3302C20.4251 21.3302 21.808 19.9437 21.808 18.2267C21.808 18.1803 21.808 18.1397 21.808 18.0932H24.9672C25.9219 18.0874 26.6915 17.3159 26.6915 16.3588V16.324C26.6915 15.3726 25.9219 14.5953 24.973 14.5953H24.9441H24.9152ZM5.91929 10.4708H3.1188C2.86421 10.4708 2.62698 10.3258 2.51704 10.0938C2.40132 9.86174 2.43025 9.5891 2.58647 9.38606L4.64634 6.67123C4.81992 6.43919 5.09766 6.30577 5.38696 6.30577H5.92507V10.465L5.91929 10.4708ZM11.8096 10.4708H7.60884V6.31157H11.8096V10.4708ZM18.0702 10.146C17.9487 10.3432 17.7288 10.4708 17.4973 10.4708H13.4702V6.31157H15.8946C16.2417 6.31157 16.5658 6.5088 16.722 6.81625L18.0933 9.49048C18.2032 9.69931 18.1917 9.94875 18.0702 10.146Z" fill="currentColor"/><path d="M3.92297 4.19981H16.2474C18.099 4.19981 19.6092 2.69157 19.6092 0.835275C19.6092 0.371201 19.2331 -0.00585938 18.7702 -0.00585938C18.3073 -0.00585938 17.9312 0.377002 17.9312 0.841076C17.9312 1.76922 17.1732 2.52915 16.2474 2.52915H3.92297C3.46008 2.52915 3.08398 2.8946 3.08398 3.35868C3.08398 3.82275 3.46008 4.19401 3.92297 4.19401V4.19981Z" fill="currentColor"/></g><defs><clipPath id="vi-clip-fitgallery"><rect width="26.6966" height="21.3028" fill="white"/></clipPath></defs></svg>
          </span>
          <h2><span class="italic-lead">Fitment</span> Gallery</h2>
        </div>
        <a href="#" class="fit-gallery-viewall" data-fit-gallery-slideout>View All In-store Fitments (${count})</a>
      </div>
      <div class="fit-gallery-carousel">
        <button type="button" class="fit-gallery-nav prev" aria-label="Previous photos">‹</button>
        <div class="fit-gallery-track" id="fitGalleryTrack"></div>
        <button type="button" class="fit-gallery-nav next" aria-label="Next photos">›</button>
      </div>
      <div class="fit-gallery-dots" id="fitGalleryDots"></div>
    </div>`;
}
function mountFitGallery() {
  document.querySelectorAll('.fit-gallery-section[data-fit-gallery]').forEach(section => {
    if (!section.querySelector('.fit-gallery-panel')) section.innerHTML = fitGalleryPanelHTML(section.dataset.count || 0);
  });
}
// Photo track — clicking a photo opens that fitment's detail in the "View All" slide-out.
// altText describes what's fitted (page-specific), e.g. "Roof rack fitted to a customer's Toyota Hilux".
function renderFitGalleryTrack(altText) {
  const track = document.getElementById('fitGalleryTrack');
  if (!track || typeof FIT_GALLERY_PHOTOS === 'undefined') return;
  track.innerHTML = FIT_GALLERY_PHOTOS.map((p, i) =>
    `<img src="${p.thumb}" data-fgs-open-index="${i}" role="button" tabindex="0" alt="${altText} — view fitment detail" width="142" height="106" loading="lazy">`
  ).join('');
  track.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => openFitGallerySlideoutAt(Number(img.dataset.fgsOpenIndex)));
  });
}

function initFitGalleryCarousel() {
  const track = document.getElementById('fitGalleryTrack');
  const dotsWrap = document.getElementById('fitGalleryDots');
  const carousel = track ? track.closest('.fit-gallery-carousel') : null;
  const prev = document.querySelector('.fit-gallery-nav.prev');
  const next = document.querySelector('.fit-gallery-nav.next');
  if (!track || !dotsWrap || !carousel) return;

  let pageCount = 1;

  function renderDots() {
    const width = track.clientWidth || 1;
    pageCount = Math.max(1, Math.round(track.scrollWidth / width));
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'fit-gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to photo set ${i + 1} of ${pageCount}`);
      dot.addEventListener('click', () => track.scrollTo({ left: i * width, behavior: 'smooth' }));
      dotsWrap.appendChild(dot);
    }
    dotsWrap.hidden = pageCount <= 1;
    updateNav();
  }

  function updateNav() {
    const width = track.clientWidth || 1;
    const scrollable = track.scrollWidth > width + 2;
    carousel.classList.toggle('has-overflow', scrollable);
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= track.scrollWidth - width - 2;
    const active = Math.min(pageCount - 1, Math.round(track.scrollLeft / width));
    dotsWrap.querySelectorAll('.fit-gallery-dot').forEach((d, i) => d.classList.toggle('active', i === active));
  }

  prev?.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }));
  track.addEventListener('scroll', () => { clearTimeout(track._dotTimer); track._dotTimer = setTimeout(updateNav, 60); });
  window.addEventListener('resize', renderDots);
  new ResizeObserver(renderDots).observe(track);
  renderDots();
}

// Generic copy-to-clipboard for SKU buttons — [data-copy] holds a literal value; on pages
// where the SKU changes at runtime (variant/colour switch), [data-copy-source] instead
// names a selector to read the current value from at click time.
// SKU click-to-copy (2026-09-10, Graham Sowerby meeting) — the clickable element is now
// the SKU text itself (e.g. .sku-copy), not a separate "⧉ Copy" button, so [data-copy]/
// [data-copy-source] can point at their own element (self-referencing) as well as another
// one. The "restore" value is captured fresh at click time rather than cached once at
// bind time — the old cached-at-bind-time approach broke on pages where the SKU re-renders
// after a variant/colour switch (a later copy click would revert the text back to
// whatever was showing on first page load, not the current value).
function initCopyButtons() {
  document.querySelectorAll('[data-copy], [data-copy-source]').forEach(el => {
    if (el.dataset.copyBound) return;
    el.dataset.copyBound = 'true';
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    const activate = () => {
      const source = el.dataset.copySource ? document.querySelector(el.dataset.copySource) : el;
      const text = ((source && source.textContent) || el.dataset.copy || '').trim();
      if (!text) return;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {});
      const original = el.textContent;
      el.textContent = '✓ Copied';
      el.classList.add('copied');
      clearTimeout(el._copyTimer);
      el._copyTimer = setTimeout(() => {
        el.textContent = original;
        el.classList.remove('copied');
      }, 1400);
    };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

// "Read more" under the clamped short-desc line jumps to the Details tab
// (2026-09-10, Graham Sowerby meeting). The tabs accordion is pure CSS (a radio input +
// label + sibling-selector .content, no JS anywhere) — a plain anchor jump would scroll to
// the (hidden) radio without checking it, so the tab wouldn't actually switch. This checks
// the target radio directly, then scrolls its .tabs container into view.
// Decision Panel star-rating summary (2026-09-11) — same real data source as the Reviews
// tab's REVIEWS.io Polaris embed, just a compact custom-built badge since REVIEWS.io doesn't
// ship a standalone widget for this above-the-fold placement. Calls the same
// api.reviews.io/timeline/data endpoint the Polaris widget itself calls (confirmed via
// network inspection — it's CORS-open, since it's designed to be embedded on arbitrary
// merchant sites), but with per_page=1 since only the `stats` summary is needed, not the
// review list itself. Deliberately does NOT fall back to the store-wide rating when a SKU
// has zero product reviews (an earlier version did) — on an individual product page, a
// company-wide figure next to that specific product reads as a real per-product rating and
// is misleading, even if technically sourced from real data. So: no product reviews yet =
// hide the whole strip, same as a fetch failure or the account having no data at all.
function initReviewSummary(root = document) {
  root.querySelectorAll('.reviews-strip[data-review-sku]').forEach(async strip => {
    const sku = strip.dataset.reviewSku;
    const starsEl = strip.querySelector('[data-stars]');
    const textEl = strip.querySelector('[data-review-text]');
    if (!starsEl || !textEl) return;
    try {
      const url = `https://api.reviews.io/timeline/data?type=product_review&store=roof-racks-galore&per_page=1&sku=${encodeURIComponent(sku)}&lang=en`;
      const res = await fetch(url);
      const data = await res.json();
      const avg = parseFloat(data.stats?.average_rating || '0');
      const count = data.stats?.review_count || 0;
      if (!count) { strip.hidden = true; return; }
      const filled = Math.round(avg);
      starsEl.innerHTML = '★'.repeat(filled) + `<span class="stars-empty">${'★'.repeat(5 - filled)}</span>`;
      textEl.textContent = `${avg.toFixed(1)} (${count.toLocaleString()} Reviews)`;
    } catch (e) {
      strip.hidden = true;
    }
  });
}

// Short description inline "Read more" (2026-09-11, follow-up to the value-prop/short-desc
// consolidation) — Brenton caught the link landing on its own row below the 2 lines of text
// instead of inline at the end of the visible text. CSS line-clamp can't guarantee that (it
// clips straight through an inline child that doesn't fit on the truncated line), so this
// measures the element's real rendered height with the full text + link both present, then
// trims the text word-by-word until "<text>… Read more" fits within exactly 2 lines. The
// link is expected to already be the last child inside .short-desc (see markup) so it's
// naturally inline with whatever text precedes it — this only ever shortens that text.
// Stores the untouched original text in a data attribute so repeat calls (resize) always
// trim from the real full text, not an already-trimmed one.
function shortDescCollapsedHeight(el) {
  const cs = getComputedStyle(el);
  const lineHeight = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
  return lineHeight * 2 + 1;
}

// Renders the trimmed, 2-line "<text>… Read more" state (unchanged algorithm from before
// item 40) — factored out so both layoutShortDesc() and toggleShortDesc()'s collapse path
// can call it.
function renderShortDescCollapsed(el, link) {
  const fullText = el.dataset.fullText;
  const maxHeight = shortDescCollapsedHeight(el);
  const words = fullText.split(' ');
  const render = n => {
    const truncated = n < words.length;
    el.textContent = words.slice(0, n).join(' ') + (truncated ? '… ' : ' ');
    link.textContent = 'Read more';
    el.appendChild(link);
  };
  let n = words.length;
  render(n);
  while (n > 0 && el.scrollHeight > maxHeight) {
    n--;
    render(n);
  }
}

// Expand/collapse (2026-09-12, Section 12 item 40) — replaces the old tab-jump behaviour.
// Expanding swaps in the full text and animates the container open to its real scrollHeight;
// collapsing animates the still-full content closed first, then swaps the DOM text back to
// the trimmed version once the transition ends, so the text swap itself never causes a jump.
function toggleShortDesc(el) {
  const link = el.querySelector('.short-desc-readmore');
  if (!link) return;
  if (!el.classList.contains('expanded')) {
    el.classList.add('expanded');
    el.textContent = el.dataset.fullText + ' ';
    link.textContent = 'See less';
    el.appendChild(link);
    const target = el.scrollHeight;
    requestAnimationFrame(() => { el.style.maxHeight = target + 'px'; });
  } else {
    const collapsedHeight = shortDescCollapsedHeight(el);
    el.style.maxHeight = el.scrollHeight + 'px';
    el.classList.remove('expanded');
    requestAnimationFrame(() => { el.style.maxHeight = collapsedHeight + 'px'; });
    el.addEventListener('transitionend', function onEnd(e) {
      if (e.propertyName !== 'max-height') return;
      el.removeEventListener('transitionend', onEnd);
      renderShortDescCollapsed(el, link);
    });
  }
}

function layoutShortDesc(root = document) {
  root.querySelectorAll('.short-desc').forEach(el => {
    const link = el.querySelector('.short-desc-readmore');
    if (!link) return;
    if (!el.dataset.fullText) {
      // el.textContent at this point still includes the link's own "Read more" label (it's
      // markup-nested, not yet detached) — strip it out via a clone so the captured source
      // text is just the description, not "...description text. Read more".
      const clone = el.cloneNode(true);
      clone.querySelector('.short-desc-readmore')?.remove();
      el.dataset.fullText = clone.textContent.trim();
      link.addEventListener('click', e => {
        e.preventDefault();
        toggleShortDesc(el);
      });
    }
    if (el.classList.contains('expanded')) {
      // Already showing full text (e.g. a resize while expanded) — just re-measure, don't
      // re-truncate it back down.
      el.style.maxHeight = el.scrollHeight + 'px';
      return;
    }
    renderShortDescCollapsed(el, link);
    el.style.maxHeight = shortDescCollapsedHeight(el) + 'px';
  });
}

function initTabJumpLinks() {
  document.querySelectorAll('[data-jump-tab]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const radio = document.getElementById(link.dataset.jumpTab);
      if (!radio) return;
      radio.checked = true;
      radio.closest('.tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Mobile menu (2026-09-13, header integration) — opens the full-screen takeover
// (.mm-mobile-takeover, populated by mega-menu.js's buildMegaMenuMobile()), replacing the
// .rrg-nav slide-down drawer this used to toggle (2026-09-11, mobile audit): that drawer
// stayed at a fixed scroll position while the page scrolled past it, visually detaching from
// the sticky header, since it wasn't part of the same self-contained unit. The takeover fixes
// this by being position:fixed to the full viewport, with its own logo/login/vehicle/search,
// independent of the real header's scroll position entirely. Two hamburger triggers exist
// (the top-of-page header and the sticky condensed header) — both open the same takeover, so
// this wires up every .mobile-nav-toggle found rather than just the first.
function initMobileNav() {
  const toggles = document.querySelectorAll('.mobile-nav-toggle');
  const takeover = document.querySelector('.mm-mobile-takeover');
  const closeBtn = takeover ? takeover.querySelector('.mm-mobile-close') : null;
  if (!toggles.length || !takeover) return;
  const setExpanded = (open) => toggles.forEach(t => t.setAttribute('aria-expanded', open));
  const open = () => {
    takeover.classList.add('open');
    document.body.classList.add('mm-mobile-locked');
    setExpanded(true);
    if (window.rrgResetMobileMenu) window.rrgResetMobileMenu();
  };
  const close = () => {
    takeover.classList.remove('open');
    document.body.classList.remove('mm-mobile-locked');
    setExpanded(false);
  };
  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (takeover.classList.contains('open')) close(); else open();
    });
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && takeover.classList.contains('open')) close();
  });
}

// ==== Site search data + matching (2026-09-29, from the 2026-09-24 meeting) ==================
// One shared set of "what a search can find" besides products — popular queries, brands, site
// pages and help-centre articles — used by both the header search dropdown (below) and the
// search-results page (plp.js: the "in Products ▾" switcher's Pages/Articles/Brands views and
// the page buttons beside the heading), so both surfaces agree on what a query matches instead
// of each keeping its own list. Everything here is real: brand pages, site pages and article
// titles were crawled from roofracksgalore.com.au and its help centre
// (roofracksgalore.crisp.help) on 2026-09-29; category/vehicle pages point at this project's
// own prototype templates. In production all of this comes out of the search index (Algolia),
// not hardcoded lists — this is only enough real data to demo the behaviour. Don't add an entry
// without checking it exists on the live site first (see the Trending note further down).
const RRG_LIVE_URL = 'https://www.roofracksgalore.com.au';
const RRG_HELP_URL = 'https://roofracksgalore.crisp.help/en/article/';
const RRG_SEARCH_STOPWORDS = ['for', 'the', 'a', 'an', 'and', 'my', 'to', 'of', 'in', 'on', 'with'];

function rrgEscapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function rrgSearchWords(text) {
  return String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

// Every meaningful query word has to prefix-match some word in the entry ("roo" → "roof",
// "rack" → "racks"), with a trailing plural "s" on the query word ignored ("racks" → "rack")
// and stop words skipped ("roof racks for hilux" doesn't need the entry to say "for").
function rrgSearchTextMatches(text, query) {
  const hay = rrgSearchWords(text);
  const words = rrgSearchWords(query).filter(w => !RRG_SEARCH_STOPWORDS.includes(w));
  if (!words.length) return false;
  return words.every(w => {
    const stem = w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w;
    return hay.some(h => h.startsWith(stem));
  });
}

// Popular search queries — the live site's own category names (main nav + mega menu,
// 2026-09-29) plus the real top Algolia searches from the 2026-09-24 meeting (U-Bolts, Light
// Bars, Rhino Rack Tie Downs, Roof Boxes).
const RRG_SEARCH_POPULAR_QUERIES = [
  'Roof Racks', 'Roof Racks for Hilux', 'Roof Racks for Ranger', 'Roof Boxes', 'Roof Baskets', 'Roof Top Tents',
  'Roof Mounted Bike Racks', 'Rhino Rack Pioneer Platforms', 'Yakima LockNLoad Platforms', 'Platform Roof Boxes',
  'Bike Racks', 'Tow Ball Bike Racks', 'Kayak Carriers', 'Awnings', 'Pullout Awnings', '270 Awnings',
  'Tie Downs', 'Rhino Rack Tie Downs', 'U-Bolts', 'Light Bars', 'LED Lighting', 'Recovery Gear',
  'Fridge Slides', 'Vehicle Ladders', 'Thule Roof Racks', 'Yakima Bike Racks'
];

// Brands — real /brands/brands/<slug> pages. `kw` is the categories each brand is listed under
// in the live mega menu's per-category "Brands" columns, so a category search ("bike racks")
// can suggest the brands that actually sell it, not just brands whose name contains the words.
// Logos only where a real asset already exists in _shared/; the rest render as text wordmarks.
const RRG_SEARCH_BRANDS = [
  { name: 'Rhino-Rack', slug: 'rhino-rack', logo: 'brand-rhino-rack.webp', kw: 'roof racks platforms crossbars bike racks roof boxes awnings roof top tents camping tie downs' },
  { name: 'Thule', slug: 'thule', logo: 'brand-thule.webp', kw: 'roof racks crossbars bike racks roof boxes awnings roof top tents camping kayak' },
  { name: 'Yakima', slug: 'yakima', logo: 'brand-yakima.webp', kw: 'roof racks platforms crossbars bike racks roof boxes awnings roof top tents camping kayak' },
  { name: 'Cruz', slug: 'cruz', logo: 'brand-cruz.webp', kw: 'roof racks platforms crossbars bike racks roof boxes kayak' },
  { name: 'Front Runner', slug: 'front-runner', logo: 'brand-front-runner.webp', kw: 'roof racks platforms bike racks roof top tents camping' },
  { name: 'Prorack', slug: 'prorack', logo: null, kw: 'roof racks crossbars bike racks camping kayak' },
  { name: 'Rola', slug: 'rola-roof-racks', logo: 'brand-rola.webp', kw: 'roof racks platforms bike racks kayak' },
  { name: 'Wedgetail', slug: 'wedgetail', logo: null, kw: 'roof racks platforms' },
  { name: 'Tracklander', slug: 'tracklander', logo: null, kw: 'roof racks platforms' },
  { name: 'DropRacks', slug: 'dropracks', logo: null, kw: 'roof racks' },
  { name: 'BuzzRacks', slug: 'buzzracks', logo: null, kw: 'bike racks' },
  { name: 'Kuat', slug: 'kuat', logo: null, kw: 'bike racks' },
  { name: 'Rocky Mounts', slug: 'rocky-mounts', logo: 'brand-rocky-mounts.png', kw: 'bike racks' },
  { name: 'TreeFrog', slug: 'treefrog', logo: null, kw: 'bike racks kayak' },
  { name: 'Darche', slug: 'darche', logo: null, kw: 'awnings roof top tents camping swags' },
  { name: 'Stedi', slug: 'stedi', logo: null, kw: 'light bars led lighting camping' },
  { name: 'Maxtrax', slug: 'maxtrax', logo: 'brand-maxtrax.webp', kw: 'recovery gear camping' },
  { name: 'MSA 4x4', slug: 'msa', logo: null, kw: 'fridge slides camping' },
  { name: 'CampBoss', slug: 'campboss', logo: null, kw: 'awnings roof top tents camping' },
  { name: 'Tred Outdoors', slug: 'tred-outdoors', logo: null, kw: 'recovery gear camping' }
];

// Listing images (2026-09-29, Brenton: every page and article needs its own primary image on
// the results cards — NOT the site-wide Facebook share image, which is the same on every page).
// Where the real article has an image, that's used (its first in-article image, from the help
// centre). The live site's static pages have no images at all, and 7 of the articles don't
// either, so those use a relevant real product/asset photo instead, flagged `imageStandIn: true`.
// Pages with no image at all (Warranty/Delivery/Returns) render the card's logo fallback tile,
// which is the intended look for any old page/blog that never gets one.
// Pages + help-centre articles. type: 'page' (static site page), 'vehicle' (VCLP), 'category'
// (PLP/VPLP), 'article' (help-centre guide). `cta: true` marks the pages allowed as the
// one-click buttons beside the search-results heading (the meeting's "Fit My Vehicle / VLP /
// relevant static pages" ask) — articles and plain info pages only ever show inside the
// Pages/Articles lists, never as a heading button. `vehicle` pages only surface once a vehicle
// is set in session or the query itself names that vehicle — a "Toyota Hilux" page is noise
// for a shopper with no vehicle who typed "roof racks".
const RRG_SEARCH_PAGES = [
  { type: 'page', title: 'Fit My Vehicle', image: RRG_PROTO + '_shared/vehicle-ford-ranger.webp', imageStandIn: true, desc: 'Tell us your vehicle and see only the roof racks, platforms and accessories that fit it.', href: RRG_LIVE_URL + '/fit-my-vehicle', kw: 'fit my vehicle fitment finder roof racks platforms crossbars bars car ute 4wd', cta: true },
  { type: 'vehicle', title: 'Toyota Hilux Roof Racks', image: RRG_PROTO + '_shared/vehicle-toyota-hilux.webp', desc: 'Every roof rack, platform and crossbar that fits the Hilux N70, N80 and N90.', href: RRG_PROTO + 'vehicle-category-landing/index.html', kw: 'toyota hilux roof racks platforms crossbars bars n70 n80 n90', vehicle: 'toyota hilux', cta: true },
  { type: 'category', title: 'Roof Racks for Toyota Hilux N80', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/e/7/e775e3debebdc8ba3b70b79f87a0a59466cb68e1b3800433f011a483b3fc2679_1_20.jpg', imageStandIn: true, desc: 'Roof racks for the 2015–2026 Hilux 4dr Ute with bare roof.', href: RRG_PROTO + 'vplp/index.html', kw: 'roof racks platforms crossbars bars toyota hilux n80', vehicle: 'toyota hilux' },
  { type: 'category', title: 'Bike Racks', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/T/h/Thule-532002-Bike-Rack---Roof-Mount._1_2.jpg', imageStandIn: true, desc: 'Roof-mounted, tow ball and rear-mounted bike carriers.', href: RRG_PROTO + 'plp/index.html', kw: 'bike racks bike carriers roof mounted tow ball bicycle' },
  { type: 'category', title: 'Roof Boxes', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/T/h/ThuleForce3_Dualsideopening_645XXX_1_4.jpg', imageStandIn: true, desc: 'Long wide, medium, narrow and short wide roof boxes.', href: RRG_PROTO + 'plp-roof-boxes/index.html', kw: 'roof boxes roof box cargo box pod luggage' },
  { type: 'category', title: 'Camping Gear', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/d/a/darche-ranger-solo-050801183r.webp', imageStandIn: true, desc: 'Tents, swags, camp furniture and camp site essentials.', href: RRG_PROTO + 'plp-camping/index.html', kw: 'camping gear tents swags camp furniture' },
  { type: 'page', title: 'Find a Store', image: RRG_PROTO + '_shared/installer.png', imageStandIn: true, desc: '35 stores nationwide, with opening hours, directions and fitting bays.', href: RRG_LIVE_URL + '/locations', kw: 'find a store stores locations near me opening hours showroom fitting', cta: true },
  { type: 'page', title: 'Warranty', desc: 'How warranty claims work for the products we sell.', href: RRG_LIVE_URL + '/warranty', kw: 'warranty claims guarantee' },
  { type: 'page', title: 'Shipping & Delivery', desc: 'Delivery options, timeframes and costs.', href: RRG_LIVE_URL + '/delivery', kw: 'shipping delivery freight postage' },
  { type: 'page', title: 'Refund & Exchange', desc: 'Our returns, refunds and exchange policy.', href: RRG_LIVE_URL + '/returns', kw: 'refund returns exchange' },
  { type: 'article', topic: 'Roof Racks', title: 'Do you offer an installation service?', image: RRG_PROTO + '_shared/installer.png', imageStandIn: true, desc: 'All of our stores offer professional installation for roof racks and vehicle accessories.', href: RRG_HELP_URL + 'do-you-offer-an-installation-service-uru7hc/', kw: 'installation install fitting service roof racks' },
  { type: 'article', topic: 'Roof Racks', title: 'How do I identify my roof type?', image: 'https://storage.crisp.chat/users/helpdesk/website/-/e/4/7/d/e47d0aafa1237000/screenshot-2025-09-11-093153_5ywdec.png', desc: 'Bare roof, raised rail, flush rail or factory track — how to tell which one your vehicle has.', href: RRG_HELP_URL + 'how-do-i-identify-my-roof-type-1rl6ww/', kw: 'identify roof type bare roof raised rail flush rail track roof racks' },
  { type: 'article', topic: 'Roof Racks', title: 'What is the difference between a through bar and a flush bar?', image: 'https://storage.crisp.chat/users/helpdesk/website/-/e/4/7/d/e47d0aafa1237000/screenshot-2025-09-16-075229_1k2p7ic.png', desc: 'Through bars overhang past the legs; flush bars finish at the feet. Which one suits you.', href: RRG_HELP_URL + 'what-is-the-difference-between-a-through-bar-and-a-flush-bar-1bbikox/', kw: 'through bar thru bar flush bar crossbars roof racks' },
  { type: 'article', topic: 'Roof Racks', title: 'How far apart do I need to space my roof racks?', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/R/h/Rhino-Rack-RTS556-Tracks._1_6.jpg', imageStandIn: true, desc: 'Recommended bar spacing for rails, tracks and fixed points.', href: RRG_HELP_URL + 'how-far-apart-do-i-need-to-space-my-roof-racks-m3ntnl/', kw: 'space spacing roof racks crossbars bars apart' },
  { type: 'article', topic: 'Roof Racks', title: 'How much height will crossbars add to my vehicle?', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/T/h/Thule-730402-Roof-Rack---Bars--Legs._1_269.jpg', imageStandIn: true, desc: 'Most crossbar systems add about 10–15cm to your vehicle\'s overall height.', href: RRG_HELP_URL + 'how-much-height-will-crossbars-add-to-my-vehicle-10spb4g/', kw: 'height crossbars roof racks garage clearance' },
  { type: 'article', topic: 'Roof Racks', title: 'Platform, Tradie and Tray Overview', image: 'https://storage.crisp.chat/users/helpdesk/website/-/e/4/7/d/e47d0aafa1237000/screenshot-2025-09-15-143930_n8zwk1.png', desc: 'A quick overview of the main roof storage options for your 4WD.', href: RRG_HELP_URL + 'platform-tradie-and-tray-overview-ldr45m/', kw: 'platform platforms tradie tray trays roof racks 4wd' },
  { type: 'article', topic: 'Roof Racks', title: 'What are the benefits of a leg vs spine fitment?', image: 'https://storage.crisp.chat/users/helpdesk/website/-/e/4/7/d/e47d0aafa1237000/screenshot-2025-09-15-144116_1x6663a.png', desc: 'Leg kits versus spine systems for mounting a platform.', href: RRG_HELP_URL + 'what-are-the-benefits-of-a-leg-vs-spine-fitment-1q3xxt5/', kw: 'leg spine backbone fitment platform roof racks' },
  { type: 'article', topic: 'Roof Racks', title: 'I already have a roof rack, can I reuse it on my new vehicle?', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/c/a/ca1707dde271a374d87246bcdc37fd1f351c162b4413ebba5b5decef9d988ab0_LEGFUW_1.jpg', imageStandIn: true, desc: 'Which roof rack components carry over to a new vehicle, and which don\'t.', href: RRG_HELP_URL + 'i-already-have-a-roof-rack-can-i-reuse-it-on-my-new-vehicle-xanu9o/', kw: 'reuse new vehicle roof racks crossbars' },
  { type: 'article', topic: 'Bike Racks', title: 'Choosing the right bike carrier', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/t/h/thule-598001-bike-rack-roof-mount.jpg', imageStandIn: true, desc: 'The seven main types of bike rack, and which suits your vehicle and bikes.', href: RRG_HELP_URL + 'choosing-the-right-bike-carrier-1x5dl3r/', kw: 'choosing bike carrier bike racks' },
  { type: 'article', topic: 'Bike Racks', title: 'Roof-mounted bike racks', image: 'https://storage.crisp.chat/users/helpdesk/website/-/e/4/7/d/e47d0aafa1237000/screenshot-2025-09-17-090320_1c3vkqq.png', desc: 'Still one of the most common ways to carry bikes — what you need to get started.', href: RRG_HELP_URL + 'roof-mounted-bike-racks-1mbyssy/', kw: 'roof mounted bike racks bike carrier' },
  { type: 'article', topic: 'Bike Racks', title: 'Tow bar mounted bike racks', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/9/4/944fad617fe3cd096ec8e57f6739b9be_G266QQ_1.jpg', imageStandIn: true, desc: 'Why tow bar racks have taken off, especially for e-bikes.', href: RRG_HELP_URL + 'tow-bar-mounted-bike-racks-1af33ov/', kw: 'tow bar tow ball mounted bike racks bike carrier ebike' },
  { type: 'article', topic: 'Bike Racks', title: 'What bike carrier suits an e-bike?', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/R/h/Rhino-Rack-RBC050-Bike-Rack---Roof-Mount._1_1.jpg', imageStandIn: true, desc: 'E-bikes weigh 20–30kg or more — which carriers can handle them.', href: RRG_HELP_URL + 'what-bike-carrier-suits-an-e-bike-5l7r1w/', kw: 'e bike ebike bike carrier bike racks' },
  { type: 'article', topic: 'Roof Boxes', title: 'What size Roof Box/Pod do I need to get?', image: 'https://storage.crisp.chat/users/helpdesk/website/-/e/4/7/d/e47d0aafa1237000/screenshot-2025-09-16-083234_1lt293q.png', desc: 'Matching roof box size to your vehicle and what you carry.', href: RRG_HELP_URL + 'what-size-roof-boxpod-do-i-need-to-get-163mzk6/', kw: 'size roof box boxes pod pods' },
  { type: 'article', topic: 'Roof Boxes', title: 'How do I mount a Roof Box to my vehicle?', image: 'https://storage.crisp.chat/users/helpdesk/website/-/e/4/7/d/e47d0aafa1237000/screenshot-2025-09-16-083556_ys6h4z.png', desc: 'Roof boxes need roof racks first — then most use a Quick Claw mount.', href: RRG_HELP_URL + 'how-do-i-mount-a-roof-box-to-my-vehicle-mqtj75/', kw: 'mount roof box boxes pod roof racks' },
  { type: 'article', topic: 'Roof Boxes', title: 'How do I secure a roof box against theft?', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/T/h/Thule-639801-Roof-Boxes._1.jpg', imageStandIn: true, desc: 'Steps to protect both the box and what\'s inside it.', href: RRG_HELP_URL + 'how-do-i-secure-a-roof-box-against-theft-1q74qf1/', kw: 'secure theft lock roof box boxes pod' }
];

// Header dropdown's product column — real scraped name/brand/price/image data already used
// elsewhere in this project (search-results, plp-camping and the three real Ford Ranger P703
// listings added to the search dataset 2026-09-29). `kw` adds the category words a product's
// shortened display name leaves out, so "roof", "bike" or "hilux" find it.
const RRG_SEARCH_SUGGEST_PRODUCTS = [
  { brand: 'Rhino-Rack', name: 'Rhino Rack 62112 Pioneer Platform (1500mm x 1240mm)', price: '$1,750.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/R/h/Rhino-Rack-62112-Platforms--Trays._1.jpg', kw: 'roof racks platform toyota hilux' },
  { brand: 'Rhino-Rack', name: 'Rhino Rack Vortex 2 Bar Cross Bar Set', price: '$389.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/R/h/Rhino-Rack-RTS556-Tracks._1_6.jpg', kw: 'roof racks crossbars bars toyota hilux' },
  { brand: 'Front Runner', name: 'Front Runner Slimline II Flush Bar Kit', price: '$409.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/F/r/Front-Runner-KRTH011T_1.jpg', kw: 'roof racks crossbars bars toyota hilux' },
  { brand: 'Front Runner', name: 'Front Runner Slimsport Roof Rack Kit', price: '$169.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/F/r/Front-Runner-KSTH005T_1.jpg', kw: 'roof racks crossbars bars toyota hilux' },
  { brand: 'Thule', name: 'Thule SmartRack XT Silver 2 Bar Roof Rack', price: '$379.95', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/T/h/Thule-730402-Roof-Rack---Bars--Legs._1_269.jpg', kw: 'roof racks crossbars bars toyota hilux' },
  { brand: 'Rhino-Rack', name: 'Rhino Rack JC-01605 Pioneer 6 Platform for Ford Ranger P703', price: '$597.52', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/e/7/e775e3debebdc8ba3b70b79f87a0a59466cb68e1b3800433f011a483b3fc2679_1_20.jpg', kw: 'roof racks platform' },
  { brand: 'Wedgetail', name: 'Wedgetail Adventure Platform Roof Rack for Ford Ranger P703', price: '$399.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/p/l/platform_and_mounting_4_1.jpg', kw: 'roof racks platform' },
  { brand: 'Yakima', name: 'Yakima LockNLoad Platform with RuggedLine HD for Ford Ranger P703', price: '$467.50', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/p/r/primary-image-8005080-1-8005201-1-c68025f9f4f7.jpg', kw: 'roof racks platform' },
  { brand: 'Thule', name: 'Thule FreeRide 532 Silver Roof Mounted Bike Carrier x1', price: '$218.45', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/T/h/Thule-532002-Bike-Rack---Roof-Mount._1_2.jpg', kw: 'bike racks' },
  { brand: 'Rhino-Rack', name: 'Rhino-Rack Hang-On 2 Bike Tow Ball Carrier', price: '$349.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/R/h/Rhino-Rack-RBC050-Bike-Rack---Roof-Mount._1_1.jpg', kw: 'bike racks' },
  { brand: 'Yakima', name: 'Yakima FrontLoader Roof Wheel-Support Carrier', price: '$259.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/y/a/yakima-frontloader-black-roof-mounted-bike-carrier-x-1-8002104.jpg', kw: 'bike racks roof mounted' },
  { brand: 'Thule', name: 'Thule ProRide 598 Silver Roof Mounted Bike Carrier', price: '$329.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/t/h/thule-598001-bike-rack-roof-mount.jpg', kw: 'bike racks' },
  { brand: 'ROLA', name: 'ROLA Vertical Bike Rack — 5 Bike Carrier', price: '$949.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/9/4/944fad617fe3cd096ec8e57f6739b9be_G266QQ_1.jpg', kw: 'bike racks tow ball' },
  { brand: 'Yakima', name: 'Yakima RoadShower MD 26L', price: '$411.50', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/Y/a/Yakima-8004110-Camping._1_1.webp', kw: 'camping shower' },
  { brand: 'Darche', name: 'Darche Ranger Solo + Swag', price: '$299.00', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/d/a/darche-ranger-solo-050801183r.webp', kw: 'camping swags tents' },
  { brand: 'MSA 4x4', name: 'MSA Half Pack Cargo Bag', price: '$239.00', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/M/S/MSA-HP1.4-Roof-Top-Bags._1_1.webp', kw: 'roof bags cargo bags camping' },
  { brand: 'Stedi', name: 'Stedi FX3300 LED Torch', price: '$149.00', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/S/t/Stedi-TORCH-FX3300-Lighting._1.webp', kw: 'led lighting camping' },
  { brand: 'EcoXGear', name: 'EcoXGear EcoExtreme 2 Grey', price: '$109.95', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/e/c/ecoxgear-ecoextreme-2-grey-gdi-ex3w210.webp', kw: 'speaker camping' }
];

// Vehicle-scoped entries (see RRG_SEARCH_PAGES' comment) — shown once a vehicle is set in the
// Site Admin Panel's session state, or when the query itself names that vehicle.
function rrgSearchVehicleAllowed(entry, query) {
  if (!entry.vehicle) return true;
  const vehicleSet = typeof rrgSessionGet === 'function' ? rrgSessionGet('vehicleSet') : true;
  return vehicleSet || rrgSearchWords(query).some(w => entry.vehicle.split(' ').includes(w));
}

function rrgSearchQueriesFor(query) {
  const q = query.trim().toLowerCase();
  return RRG_SEARCH_POPULAR_QUERIES.filter(s => s.toLowerCase() !== q && rrgSearchTextMatches(s, query));
}

// Brands whose own name matches come first, then brands that sell the searched category.
function rrgSearchBrandsFor(query) {
  const byName = RRG_SEARCH_BRANDS.filter(b => rrgSearchTextMatches(b.name, query));
  const byCategory = RRG_SEARCH_BRANDS.filter(b => !byName.includes(b) && rrgSearchTextMatches(b.kw, query));
  return [...byName, ...byCategory];
}

// `types` narrows to some entry types (e.g. ['article']); omitted = all of them.
function rrgSearchPagesFor(query, types) {
  return RRG_SEARCH_PAGES.filter(p => (!types || types.includes(p.type))
    && rrgSearchTextMatches(`${p.title} ${p.topic || ''} ${p.kw}`, query)
    && rrgSearchVehicleAllowed(p, query));
}

function rrgSearchProductsFor(query) {
  return RRG_SEARCH_SUGGEST_PRODUCTS.filter(p => rrgSearchTextMatches(`${p.brand} ${p.name} ${p.kw}`, query));
}

// The 8 brands with a prototype brand page (RRG_BUILT_BRANDS, nav-data.js) link there; the rest
// keep their live URL.
function rrgBrandUrl(brand) {
  const built = typeof RRG_BUILT_BRANDS !== 'undefined' && RRG_BUILT_BRANDS[brand.name];
  return built ? rrgBrandPageUrl(built) : `${RRG_LIVE_URL}/brands/brands/${brand.slug}`;
}

// Prototype-relative hrefs ("../plp/index.html") are resolved against the current page so they
// work from every template; live-site/help-centre links open in a new tab since they leave the
// prototype.
function rrgSearchLinkAttrs(href) {
  const external = /^https?:/.test(href) && !href.startsWith(RRG_PROTO);
  return external
    ? `href="${href}" target="_blank" rel="noopener"`
    : `href="${new URL(href, window.location.href).href}"`;
}

// ==== Header search dropdown ===================================================================
// Two states, one layout (2026-10-02, Brenton — the focus state used to be chip rows, so the panel
// changed shape on the first keystroke). Both are two columns: link groups on the left, products
// on the right; the panel collapses to one stacked column when it's narrower than 640px (mobile
// takeover).
// - Box focused but empty: Recent searches (with Clear) / Popular searches / Pages that might be
//   interesting on the left, Suggested products on the right — all merchandiser-picked.
// - 1+ characters typed (reworked 2026-09-29 on Brenton's ask, modelled on Supercheap Auto's
//   search): a "Search for '<query>'" row across the top (same as pressing Enter), then Popular
//   searches / Looking for these brands? / Pages that might be interesting on the left, matching
//   products on the right with View All Results pinned to the bottom of the panel. Everything is
//   matched against the typed text for real (rrgSearch*For above).
//
// Recent Searches is a fixed canned list (session-based in production — each shopper's own),
// with a Clear action that hides it for this page view only. Popular searches, pages and
// suggested products are merchandiser-controlled in production.
// Popular searches (2026-09-29) = the real top searches from Algolia, shown in the 2026-09-24
// meeting: U-Bolts by a long way, then Roof Boxes and Light Bars; "Rhino Rack tie down" was in
// the "searches without results" report, so it's worth fixing in Algolia too. Every term here was
// checked as a real category/search first — don't add one without doing the same (2026-09-22:
// the client's team caught invented terms like "snorkels" and "dual battery kits").
const HEADER_SEARCH_RECENT = ['Roof Rack for Hilux', 'Bike Rack', 'Thule Bars'];
const HEADER_SEARCH_TRENDING = ['U-Bolts', 'Roof Boxes', 'Light Bars', 'Rhino Rack Tie Downs'];
// Picked by title from RRG_SEARCH_PAGES / by name from RRG_SEARCH_SUGGEST_PRODUCTS, so the focus
// state's links and products are the same real entries the typing state matches against.
const HEADER_SEARCH_FOCUS_PAGES = ['Fit My Vehicle', 'Find a Store', 'Do you offer an installation service?', 'Shipping & Delivery'];
const HEADER_SEARCH_FOCUS_PRODUCTS = [
  'Rhino Rack 62112 Pioneer Platform (1500mm x 1240mm)',
  'Thule SmartRack XT Silver 2 Bar Roof Rack',
  'Thule FreeRide 532 Silver Roof Mounted Bike Carrier x1',
  'Yakima RoadShower MD 26L',
  'Darche Ranger Solo + Swag'
];

// Resolved against the current page's own URL (not a hardcoded "../search-results/..." string)
// so this works unchanged from every template regardless of folder depth.
function headerSearchResultsUrl(query) {
  return new URL(`${RRG_PROTO}search-results/index.html?${new URLSearchParams({ q: query })}`, window.location.href).href;
}

// Shared by both states: left-column link group (skipped when empty; `action` sits beside the
// title, e.g. Recent searches' Clear), and the two-column body.
function headerSearchGroupHTML(title, items, action = '') {
  return items.length ? `
    <div class="rrg-search-suggest-group">
      <div class="rrg-search-suggest-coltitle">${title}${action}</div>
      ${items.join('')}
    </div>` : '';
}
function headerSearchColsHTML(left, productsTitle, products, footer = '') {
  return `
    <div class="rrg-search-suggest-cols${left ? '' : ' is-single'}">
      ${left ? `<div class="rrg-search-suggest-col">${left}</div>` : ''}
      <div class="rrg-search-suggest-col rrg-search-suggest-col-products">
        <div class="rrg-search-suggest-coltitle">${productsTitle}</div>
        ${products.map(p => `
          <div class="rrg-search-suggest-product">
            <img src="${p.image}" alt="" loading="lazy">
            <div class="rrg-search-suggest-product-info">
              <span class="rrg-search-suggest-brand">${p.brand}</span>
              <span class="rrg-search-suggest-name">${p.name}</span>
              <span class="rrg-search-suggest-price">${p.price}</span>
            </div>
          </div>
        `).join('')}
        ${footer}
      </div>
    </div>
  `;
}
const headerSearchQueryLink = s => `<a class="rrg-search-suggest-link" href="${headerSearchResultsUrl(s)}">${rrgEscapeHTML(s)}</a>`;
const headerSearchPageLink = p => `<a class="rrg-search-suggest-link" ${rrgSearchLinkAttrs(p.href)}>${rrgEscapeHTML(p.title)}</a>`;

function headerSearchFocusHTML(recentCleared) {
  const pages = HEADER_SEARCH_FOCUS_PAGES.map(t => RRG_SEARCH_PAGES.find(p => p.title === t)).filter(Boolean);
  const products = HEADER_SEARCH_FOCUS_PRODUCTS.map(n => RRG_SEARCH_SUGGEST_PRODUCTS.find(p => p.name === n)).filter(Boolean);
  const left = [
    recentCleared ? '' : headerSearchGroupHTML('Recent searches', HEADER_SEARCH_RECENT.map(headerSearchQueryLink),
      '<button type="button" class="rrg-search-suggest-clear" data-clear-recent>Clear</button>'),
    headerSearchGroupHTML('Popular searches', HEADER_SEARCH_TRENDING.map(headerSearchQueryLink)),
    headerSearchGroupHTML('Pages that might be interesting', pages.map(headerSearchPageLink))
  ].join('');
  return headerSearchColsHTML(left, 'Suggested products', products);
}

function headerSearchTypingHTML(query) {
  const queries = rrgSearchQueriesFor(query).slice(0, 5);
  const brands = rrgSearchBrandsFor(query).slice(0, 3);
  const pages = rrgSearchPagesFor(query).slice(0, 5);
  const matchedProducts = rrgSearchProductsFor(query).slice(0, 5);
  // Nothing matched: fall back to a generic "popular right now" set rather than an empty
  // column (Supercheap does the same).
  const products = matchedProducts.length ? matchedProducts : RRG_SEARCH_SUGGEST_PRODUCTS.slice(0, 4);
  const left = [
    headerSearchGroupHTML('Popular searches', queries.map(headerSearchQueryLink)),
    headerSearchGroupHTML('Looking for these brands?', brands.map(b => `<a class="rrg-search-suggest-link" ${rrgSearchLinkAttrs(rrgBrandUrl(b))}>${b.name}</a>`)),
    headerSearchGroupHTML('Pages that might be interesting', pages.map(headerSearchPageLink))
  ].join('');
  return `
    <a class="rrg-search-suggest-searchfor" href="${headerSearchResultsUrl(query)}">Search for <strong>${rrgEscapeHTML(query)}</strong></a>
    ${headerSearchColsHTML(left, matchedProducts.length ? 'Products' : 'Popular right now', products,
      `<a class="rrg-search-suggest-viewall" href="${headerSearchResultsUrl(query)}">View All Results</a>`)}
  `;
}

// Wires up every header search box on the page (.rrg-search on desktop, .mm-mobile-search in
// the mobile full-screen takeover). The panel is appended to <body> and position:fixed (not a
// child of .rrg-search) because that box's overflow:hidden would otherwise clip it — see the
// CSS comment in shared.css. Each search box gets its own panel/state (including its own
// recentCleared flag) since desktop and mobile are two independent inputs.
// Enter / the search button go to the search-results page with the typed query (2026-09-29) —
// with the results page's own search box removed, the header box is now the only way in.
function initHeaderSearchSuggest() {
  document.querySelectorAll('.rrg-search, .mm-mobile-search').forEach(wrap => {
    const input = wrap.querySelector('input');
    if (!input) return;
    const panel = document.createElement('div');
    panel.className = 'rrg-search-suggest';
    panel.hidden = true;
    document.body.appendChild(panel);
    let recentCleared = false;
    // Wider than the box itself (the typing state's two columns need the room), capped to the
    // viewport. The desktop box sits at the right of the header, so the extra width grows
    // leftwards — right edge stays aligned with the box's right edge. The empty focus state
    // uses the same size (2026-09-29, Brenton — it was box-width, so the panel jumped size on
    // the first keystroke).
    const position = () => {
      const r = wrap.getBoundingClientRect();
      const width = Math.min(Math.max(r.width, 760), window.innerWidth - 32);
      const left = Math.max(16, Math.min(r.left, r.right - width));
      panel.style.top = `${r.bottom + 4}px`;
      panel.style.left = `${left}px`;
      panel.style.width = `${width}px`;
      panel.classList.toggle('is-narrow', width < 640);
    };
    const hide = () => { panel.hidden = true; };
    const sync = () => {
      const query = input.value.trim();
      panel.innerHTML = query ? headerSearchTypingHTML(query) : headerSearchFocusHTML(recentCleared);
      position();
      panel.hidden = false;
    };
    const submit = () => {
      const query = input.value.trim();
      if (query) window.location.href = headerSearchResultsUrl(query);
    };
    input.addEventListener('input', sync);
    input.addEventListener('focus', sync);
    input.addEventListener('blur', () => setTimeout(hide, 150));
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') hide();
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
    const searchBtn = wrap.querySelector('.rrg-search-btn, .mm-mobile-search-btn');
    if (searchBtn) searchBtn.addEventListener('click', submit);
    window.addEventListener('resize', () => { if (!panel.hidden) position(); });
    window.addEventListener('scroll', () => { if (!panel.hidden) position(); }, true);
    // Clear (Recent Searches) — mousedown preventDefault keeps focus in the input (so blur's
    // hide() timer never fires) while click does the actual state change + re-render.
    panel.addEventListener('mousedown', e => { if (e.target.closest('[data-clear-recent]')) e.preventDefault(); });
    panel.addEventListener('click', e => {
      if (!e.target.closest('[data-clear-recent]')) return;
      e.preventDefault();
      recentCleared = true;
      sync();
    });
  });
}

// Search clear (x) button (2026-09-11, matched to client-supplied Figma export) — shown
// only once the input has a value, clears + refocuses + hides itself on click. Generic
// over every .rrg-search on the page (there's exactly one per template today, but this
// doesn't assume that).
function initSearchClear() {
  document.querySelectorAll('.rrg-search').forEach(wrap => {
    const input = wrap.querySelector('input');
    const clearBtn = wrap.querySelector('.rrg-search-clear');
    if (!input || !clearBtn) return;
    const sync = () => { clearBtn.hidden = !input.value; };
    input.addEventListener('input', sync);
    clearBtn.addEventListener('click', () => {
      input.value = '';
      sync();
      input.focus();
    });
    sync();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildExdemoSlideout();
  buildStoreSlideout();
  initFitFinderTriggers();
  initInlineFitFinders();
  initHomeHero();
  initOfferCarousel();
  buildFitGallerySlideout();
  initCopyButtons();
  initFitGalleryCarousel();
  initProductCarousels();
  initRegionSwitcher();
  layoutShortDesc();
  window.addEventListener('resize', () => {
    clearTimeout(window._shortDescResizeTimer);
    window._shortDescResizeTimer = setTimeout(() => layoutShortDesc(), 120);
  });
  initTabJumpLinks();
  initReviewSummary();
  initMobileNav();
  initSearchClear();
  initHeaderSearchSuggest();
  // Sticky condensed mobile header (2026-09-11) — reuses the same sentinel/.visible
  // mechanism already built for the desktop persistent decision bar: shows
  // .rrg-sticky-header once .rrg-search (the top-of-page search row) scrolls out of
  // view. Generic across all pages since every template has both elements identically.
  initPersistentBar('.rrg-search', '.rrg-sticky-header');
  initStickyCta();
  initStickyHeader();
});

// Product-card carousel (.product-carousel, VLP Popular Racks — docs/vlp/vlp-spec.md Section 8):
// arrows scroll one view at a time and hide at either end. The track itself is a native
// scroll-snap row, so touch swipe needs nothing here.
function initProductCarousels() {
  document.querySelectorAll('.product-carousel').forEach(carousel => {
    const track = carousel.querySelector('.product-carousel-track');
    const prev = carousel.querySelector('.product-carousel-nav.prev');
    const next = carousel.querySelector('.product-carousel-nav.next');
    if (!track) return;
    const update = () => {
      // 8px slack: scroll-snap can settle a few px off either end.
      const max = track.scrollWidth - track.clientWidth - 8;
      if (prev) prev.disabled = track.scrollLeft <= 8;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    prev?.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }));
    track.addEventListener('scroll', () => { clearTimeout(track._pcTimer); track._pcTimer = setTimeout(update, 60); });
    new ResizeObserver(update).observe(track);
    new MutationObserver(update).observe(track, { childList: true });
    update();
  });
}

// Sticky desktop header (Brenton, 2026-09-29) — see the .rrg-header-shell comment in shared.css.
// Scrolling down hides the red utility bar and keeps the main header pinned; scrolling up
// brings the red bar back. Publishes --sticky-offset (px of viewport top the header covers
// right now) so other top-pinned elements sit below it. Desktop only.
function initStickyHeader() {
  const shell = document.querySelector('.rrg-header-shell');
  const util = shell && shell.querySelector('.rrg-utility-bar');
  const main = shell && shell.querySelector('.rrg-main-header');
  if (!shell || !util || !main) return;
  const root = document.documentElement.style;
  const desktop = window.matchMedia('(min-width:901px)');
  let lastY = window.scrollY;
  let ticking = false;
  const measure = () => {
    root.setProperty('--utility-h', util.offsetHeight + 'px');
    root.setProperty('--main-header-h', main.offsetHeight + 'px');
  };
  const publishOffset = () => {
    root.setProperty('--sticky-offset', desktop.matches ? Math.max(0, Math.round(shell.getBoundingClientRect().bottom)) + 'px' : '0px');
  };
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    if (!desktop.matches) {
      shell.classList.remove('show-utility', 'is-stuck');
    } else {
      const pastUtility = y > util.offsetHeight;
      shell.classList.toggle('is-stuck', pastUtility);
      // A few px of hysteresis so trackpad jitter doesn't flicker the red bar.
      if (!pastUtility || y > lastY + 4) shell.classList.remove('show-utility');
      else if (y < lastY - 4) shell.classList.add('show-utility');
    }
    if (Math.abs(y - lastY) > 4 || !desktop.matches) lastY = y;
    publishOffset();
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  // The red bar's slide is a CSS transition on `top`, so re-publish the offset once it settles.
  shell.addEventListener('transitionend', publishOffset);
  new ResizeObserver(() => { measure(); publishOffset(); }).observe(shell);
  desktop.addEventListener('change', update);
  measure();
  update();
}

// Sticky mobile Add-to-Cart bar (2026-09-11, backlog item 26) — shows whenever the real
// Add to Cart button isn't currently on-screen, which covers both "starts below the fold
// on load" and "scrolled past it" with one rule (previously the bar was just always
// visible at mobile widths regardless of scroll position, so it showed even while the
// real button was already on-screen). The real button is present in the initial markup
// on every template (only its label/href update dynamically), so this doesn't need to
// wait on any page's own render cycle.
function initStickyCta() {
  const bar = document.querySelector('.sticky-cta-mobile');
  const target = document.querySelector('.decision-panel [data-cta-label]');
  if (!bar || !target) return;
  const observer = new IntersectionObserver(([entry]) => {
    const offscreen = !entry.isIntersecting;
    bar.classList.toggle('visible', offscreen);
    document.body.classList.toggle('has-sticky-cta', offscreen);
  }, { threshold: 0 });
  observer.observe(target);
}

// Escape closes the topmost open drawer — one handler for every right-edge slide-out
// (ex-demo, store, Fit Finder, Fitment Gallery, PLP filter/compare/row gallery) by clicking
// its own close button, so each drawer's own close logic still runs (2026-09-29, spec.md §15 C1).
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const open = [...document.querySelectorAll('.exdemo-slideout-backdrop.open, .store-slideout-backdrop.open, .fit-gallery-slideout-backdrop.open')];
  if (!open.length) return;
  const top = open.sort((a, b) => (parseInt(getComputedStyle(b).zIndex) || 0) - (parseInt(getComputedStyle(a).zIndex) || 0))[0];
  const close = top.querySelector('.exdemo-slideout-close, .store-slideout-close, .fit-gallery-slideout-close');
  if (close) close.click();
});

function buildAdminPanel() {
  // Demo State Panel — PAGE-SPECIFIC previews only (2026-09-29 rebuild, spec.md §15 P1–P11).
  // Global state (templates, briefs, session vehicle/login/store, build phase, promotions) lives
  // in the Site Admin Panel (admin-panel.js). Each section below is only built on the page type
  // it works on — the old panel showed 11 PDP-only controls, inert, on VCLP/PLP/Search.
  // The store page borrows the PDP's .decision-panel layout but has no product states to preview.
  const isPdp = !!document.querySelector('.decision-panel') && !document.querySelector('[data-store-page]');
  const isPlpPage = !!document.querySelector('[data-plp-page]');
  const isSearchPage = !!(window.PLP_CONFIG && window.PLP_CONFIG.isSearch);
  const hasVariantPicker = !!document.querySelector('.variant-picker');
  const hasSwatches = !!document.querySelector('.swatch-grid');
  const hasFitGallery = !!document.getElementById('fitGallerySection') && !isPlpPage;
  const hasVehicleFitNotes = !!document.getElementById('vehicleFitNotes');
  const hasShowroom = !!document.getElementById('showroom');
  const isVlp = !!document.querySelector('[data-vlp-page]') && !!window.VLP_STATE;
  const initialVideo = detectInitialVideoState();
  const initialSale = detectInitialSaleState();
  const initialShipping = detectInitialShippingState();
  const initialCollect = detectInitialCollectState();
  const initialFitGallery = detectInitialFitGalleryState();
  Object.assign(adminState, { video: initialVideo, sale: initialSale, stockStatus: 'in_stock', storeStock: 'here', stockOverride: false, shipping: initialShipping, collect: initialCollect, exdemo: false, fittedOption: false, fittedMode: 'card', showroom: true, fitGallery: initialFitGallery, vehicleFitNotes: false, cartConflict: 'none' });
  // Interactive map is the locked default for the Showroom Finder widget, all 5
  // templates — no longer a Demo State Panel preview toggle. Layout (split-view,
  // revealing #showroomMap) still applies immediately so there's no shift once the map
  // loads, but the actual Leaflet init/tile fetch (2026-09-11, mobile audit — this used
  // to eagerly load map tiles on every page load even when the widget was off-screen,
  // a real mobile data/LCP cost) is deferred until the widget scrolls near the viewport.
  const showroomMapEl = document.getElementById('showroomMap');
  if (showroomMapEl) {
    const showroomMapWidget = showroomMapEl.closest('.showroom-widget');
    showroomMapEl.hidden = false;
    if (showroomMapWidget) showroomMapWidget.classList.add('split-view');
    if ('IntersectionObserver' in window) {
      const showroomMapObserver = new IntersectionObserver((entries, obs) => {
        if (entries.some(entry => entry.isIntersecting)) {
          applyShowroomMapFlag(true);
          obs.disconnect();
        }
      }, { rootMargin: '600px 0px' });
      showroomMapObserver.observe(showroomMapEl);
    } else {
      applyShowroomMapFlag(true);
    }
  }

  // Nothing page-specific to preview (template index, standalone header) → no panel at all.
  if (!isPdp && !isPlpPage && !hasFitGallery && !isVlp) return;

  const templateKey = location.pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'index';
  const STORE_KEY = 'rrgDemo:' + templateKey;
  const hint = (id, text) => `<p class="admin-hint" data-admin-hint="${id}" hidden>${text}</p>`;
  const toggle = (flag, label, checked) => `<label class="admin-toggle"><span>${label}</span><input type="checkbox" data-admin-flag="${flag}" ${checked ? 'checked' : ''}></label>`;
  // One-row dropdown (2026-10-01 — was a stack of radio buttons, one per option).
  const choice = (name, label, opts, sel) => `<label class="admin-select"><span>${label}</span><select name="${name}">${opts.map(([v, l]) => `<option value="${v}" ${v === sel ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
  // Flat groups under a small heading (2026-10-01 — were closed accordion rows, which hid every
  // control behind a click). The whole panel is visible at once.
  const section = (title, body) => `<div class="admin-section"><div class="admin-section-title">${title}</div>${body}</div>`;

  let html = '';
  if (isPdp) {
    html += section('Price &amp; media',
      toggle('video', 'Product has a video', initialVideo) +
      toggle('sale', 'Product is on sale', initialSale));
    const stockOpts = [['in_stock', 'In Stock'], ['low_stock', 'Low Stock'], ['out_of_stock', 'Out of Stock'], ['special_order', 'Special Order'], ['discontinued', 'Discontinued']];
    if (hasSwatches) stockOpts.unshift(['per_colour', 'As per colour (real data)']);
    html += section('Stock',
      choice('stockStatus', 'Stock level', stockOpts, hasSwatches ? 'per_colour' : 'in_stock') +
      choice('storeStock', 'Stock at your store', [['here', 'At your store'], ['nearby', 'Nearby store only'], ['warehouse', 'Warehouse only']], 'here') +
      hint('storeStock', 'Needs Build Phase 2 and a nearest store — both in Site Admin.') +
      toggle('exdemo', 'B-Stock / Ex-Demo available', false));
    html += section('Delivery',
      toggle('shipping', 'Delivery available', initialShipping) +
      toggle('collect', 'Click &amp; Collect available', initialCollect) +
      hint('delivery', 'Off while the product is Out of Stock or Discontinued.'));
    if (hasShowroom) html += section('In-store', toggle('showroom', 'On display in-store (Showroom Finder)', true));
    // Rack / roof-accessory pages read the real cart for compatibility (applyCartConflict).
    html += section('Cart', document.querySelector('.cta-col[data-pkg-category]')
      ? '<p class="admin-hint">Compatibility uses the real cart on this page. Load a cart in Site Admin → Demo cart.</p>'
      : choice('cartConflict', 'Cart already has', [['none', 'Nothing'], ['compatible', 'A compatible item'], ['incompatible', 'An incompatible item']], 'none'));
  }
  if (isVlp) {
    // VLP (docs/vlp/vlp-spec.md Sections 2 + 7.1). Neither control is saved (data-admin-nosave):
    // the page vehicle comes from the URL, and the category list starts from that vehicle's own
    // data, so a saved choice from the other vehicle would be wrong here.
    const vs = window.VLP_STATE;
    const nosave = html => html.replace(/<(input|select) /g, '<$1 data-admin-nosave ');
    html += section('Page vehicle <span class="admin-note">(the URL — session vehicle is in Site Admin)</span>',
      nosave(choice('vlpPageVehicle', 'Landing page for', [['hilux', 'Toyota Hilux N80'], ['ranger', 'Ford Ranger P703']], vs.pageKey)));
    const cats = (typeof VLP_CATEGORIES !== 'undefined' ? VLP_CATEGORIES : []).filter(c => c.vehicleSpecific);
    html += section('Categories with results',
      nosave(cats.map(c => toggle('vlpCat:' + c.slug, c.label, vs.vsAvailable.has(c.slug))).join('')) +
      '<p class="admin-note">Untick one to remove its tile; the Store Finder widens to fill the gap.</p>');
  }
  if (hasFitGallery) {
    const count = document.getElementById('fitGallerySection').dataset.count || 0;
    html += section('Fitment Gallery',
      toggle('fitGallery', 'Has customer fitment photos', initialFitGallery) +
      `<label class="admin-toggle"><span>Number of fitments</span><input type="number" min="0" data-admin-input="fitGalleryCount" value="${count}" class="admin-number"></label>` +
      (hasVehicleFitNotes ? toggle('vehicleFitNotes', 'Important vehicle fit notes', false) : ''));
  }
  if (hasVariantPicker) {
    html += section('Get It Fitted <span class="admin-note">(proposal)</span>',
      choice('fittedMode', 'Show it', [['off', 'Off'], ['card', 'As a 3rd variant card'], ['checkbox', 'As a checkbox']], 'off'));
  }
  if (isPlpPage && !isSearchPage) {
    html += section('Hero image',
      choice('plpHeroImage', 'Show', [['vehicle', 'Vehicle photo'], ['category', 'Category image'], ['none', 'No image']], 'vehicle') +
      hint('heroImage', 'Needs a vehicle — set one in Site Admin.'));
  }
  if (isPlpPage) {
    html += section('Phase 2 previews',
      toggle('plpCompare', 'Compare Products', false) +
      toggle('plpRibbons', 'Product ribbons (Bestseller, Staff Pick)', false) +
      hint('phase2', 'Switch Site Admin to Build Phase 2 to see these.'));
  }
  if (isSearchPage) {
    html += section('Search shortcuts', `<div class="admin-links">
      <a href="${headerSearchResultsUrl('roof rack')}">"roof rack" — two categories, vehicle-aware</a>
      <a href="${headerSearchResultsUrl('ranger')}">"ranger" — another vehicle's products</a>
      <a href="${headerSearchResultsUrl('bike racks')}">"bike racks" — nothing vehicle-specific</a>
      <a href="${headerSearchResultsUrl('warranty')}">"warranty" — pages, no products</a>
      <a href="${headerSearchResultsUrl('snorkel')}">"snorkel" — no results</a></div>`);
  }

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'admin-fab';
  fab.setAttribute('aria-label', 'Open demo state panel');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span class="fab-label">Demo State</span>';

  const panel = document.createElement('div');
  panel.className = 'admin-panel';
  panel.innerHTML = `
    <div class="admin-panel-head">
      <span>Demo State <span class="admin-panel-sub">— this page</span></span>
      <button type="button" class="admin-close" aria-label="Close">&times;</button>
    </div>
    <div class="admin-panel-body">${html}</div>
  `;
  // Busy pages (most PDPs) lay the groups out in two columns so the panel never needs scrolling.
  if (panel.querySelectorAll('.admin-section').length > 3) panel.classList.add('is-wide');
  document.body.appendChild(panel);
  document.body.appendChild(fab);

  // Click-outside-to-close (2026-09-11) — clicks inside the panel never bubble out.
  fab.addEventListener('click', (e) => { e.stopPropagation(); panel.classList.add('open'); });
  panel.querySelector('.admin-close').addEventListener('click', () => panel.classList.remove('open'));
  panel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => panel.classList.remove('open'));

  // Dependencies (P6): a control that can't apply right now is disabled with a short hint,
  // instead of silently doing nothing. Re-checked on every change and every session change.
  const setDisabled = (selector, disabled, hintId) => {
    panel.querySelectorAll(selector).forEach(i => { i.disabled = disabled; const l = i.closest('label'); if (l) l.classList.toggle('is-disabled', disabled); });
    const h = panel.querySelector(`[data-admin-hint="${hintId}"]`);
    if (h) h.hidden = !disabled;
  };
  const syncDependencies = () => {
    const phase2 = typeof rrgPhaseGet === 'function' && rrgPhaseGet() === 2;
    setDisabled('select[name="storeStock"]', !(phase2 && rrgSessionGet('storeSet')), 'storeStock');
    setDisabled('[data-admin-flag="plpCompare"], [data-admin-flag="plpRibbons"]', !phase2, 'phase2');
    setDisabled('select[name="plpHeroImage"]', !rrgSessionGet('vehicleSet'), 'heroImage');
    const stock = STOCK_STATUS[adminState.stockStatus];
    const blocked = !!(adminState.stockOverride && stock && stock.blocksCta);
    panel.querySelectorAll('[data-admin-flag="shipping"], [data-admin-flag="collect"]').forEach(i => {
      if (blocked && !i.disabled) { i.dataset.prev = i.checked; i.checked = false; }
      if (!blocked && i.disabled) i.checked = i.dataset.prev !== 'false';
    });
    setDisabled('[data-admin-flag="shipping"], [data-admin-flag="collect"]', blocked, 'delivery');
  };

  // Persistence (P10): this page's choices are saved per template and restored on reload, the
  // same way Site Admin's global state already persists. Site Admin → Reset clears them.
  const save = () => {
    const state = {};
    panel.querySelectorAll('input:not([data-admin-nosave]), select:not([data-admin-nosave])').forEach(i => {
      if (i.tagName === 'SELECT') state['r:' + i.name] = i.value;
      else if (i.type === 'checkbox') state['c:' + i.dataset.adminFlag] = i.disabled && i.dataset.prev !== undefined ? i.dataset.prev === 'true' : i.checked;
      else state['n:' + i.dataset.adminInput] = i.value;
    });
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  };

  panel.querySelectorAll('[data-admin-flag]').forEach(input => {
    input.addEventListener('change', () => {
      const on = input.checked;
      switch (input.dataset.adminFlag) {
        case 'video': applyVideoFlag(on); break;
        case 'sale': setSaleFlag(on); break;
        case 'shipping':
        case 'collect':
          applyAvailabilityFlags(
            panel.querySelector('[data-admin-flag="shipping"]').checked,
            panel.querySelector('[data-admin-flag="collect"]').checked
          );
          break;
        case 'exdemo': applyExdemoFlag(on); break;
        case 'showroom': applyShowroomFlag(on); break;
        case 'fitGallery': applyFitGalleryFlag(on); break;
        case 'vehicleFitNotes': applyVehicleFitNotesFlag(on); break;
        case 'plpCompare': if (typeof applyPlpCompareFlag === 'function') applyPlpCompareFlag(on); break;
        case 'plpRibbons': if (typeof applyPlpRibbonsFlag === 'function') applyPlpRibbonsFlag(on); break;
        default:
          if (input.dataset.adminFlag.startsWith('vlpCat:') && window.vlpSetCategoryAvailable) window.vlpSetCategoryAvailable(input.dataset.adminFlag.slice(7), on);
      }
    });
  });
  // Dropdown choices (were radio groups) — each handler gets the chosen value.
  const onChoice = (name, fn) => { const sel = panel.querySelector(`select[name="${name}"]`); if (sel) sel.addEventListener('change', () => fn(sel.value)); };
  onChoice('vlpPageVehicle', v => { if (window.vlpSetPageVehicle) window.vlpSetPageVehicle(v); });
  onChoice('plpHeroImage', v => { if (typeof applyPlpHeroImageFlag === 'function') applyPlpHeroImageFlag(v); });
  panel.querySelectorAll('[data-admin-input]').forEach(input => {
    input.addEventListener('input', () => {
      if (input.dataset.adminInput === 'fitGalleryCount') {
        const sectionEl = document.getElementById('fitGallerySection');
        if (sectionEl) sectionEl.dataset.count = input.value;
        applyFitGalleryFlag(adminState.fitGallery);
      }
    });
  });
  onChoice('stockStatus', value => {
    if (value === 'per_colour') {
      // Sibling-Colour (P8): hand the stock line back to each colour's own real stock data.
      adminState.stockOverride = false;
      if (typeof renderAll === 'function') renderAll();
      rrgRefreshStockSurfaces();
      return;
    }
    adminState.stockOverride = true;
    applyStockStatus(value);
  });
  onChoice('storeStock', value => {
    adminState.storeStock = value;
    rrgRefreshStockSurfaces();
  });
  onChoice('cartConflict', value => applyCartConflict(value));
  onChoice('fittedMode', value => {
    if (value === 'off') { setFittedOptionFlag(false); return; }
    setFittedOptionMode(value);
    setFittedOptionFlag(true);
  });
  // Dependencies + save after every control change (the listeners above run first).
  panel.addEventListener('change', () => { syncDependencies(); save(); });
  panel.addEventListener('input', save);
  document.addEventListener('rrg-session-change', syncDependencies);

  if (isPdp) {
    reapplySaleFlag();
    reapplyFittedOption();
  }
  applySessionFitment();

  // Restore this page's saved choices — replayed through the same change events a click fires.
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) {}
  if (saved) {
    panel.querySelectorAll('input:not([data-admin-nosave]), select:not([data-admin-nosave])').forEach(i => {
      if (i.tagName === 'SELECT') {
        const v = saved['r:' + i.name];
        if (v !== undefined && v !== i.value && [...i.options].some(o => o.value === v)) { i.value = v; i.dispatchEvent(new Event('change', { bubbles: true })); }
      } else if (i.type === 'checkbox') {
        const v = saved['c:' + i.dataset.adminFlag];
        if (typeof v === 'boolean' && v !== i.checked) { i.checked = v; i.dispatchEvent(new Event('change', { bubbles: true })); }
      } else {
        const v = saved['n:' + i.dataset.adminInput];
        if (v !== undefined && v !== i.value) { i.value = v; i.dispatchEvent(new Event('input', { bubbles: true })); }
      }
    });
  }
  syncDependencies();
}

document.addEventListener('DOMContentLoaded', () => {
  rrgWrapStaticStorePills();
  buildAdminPanel();
  // Mega menu, Site Admin Panel (global state) and session state on every page. Site Admin is
  // built after the Demo State Panel so it knows whether this page has one (it only offers the
  // "Show Demo State panel" toggle where it does). currentTemplateKey is the page's folder name
  // (prototypes/<key>/), used to mark the current template in Site Admin.
  const currentTemplateKey = location.pathname.split('/').filter(Boolean).slice(-2, -1)[0];
  initMegaMenu();
  buildSiteAdminPanel(currentTemplateKey);
  rrgApplySessionState();
});
