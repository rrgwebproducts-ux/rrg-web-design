// Site-wide session state — logged in?, vehicle set?, nearest store set? — admin-toggleable
// (header-spec.md, 2026-09-13, Brenton). Drives the desktop utility bar's account/vehicle
// items and the mobile takeover's mini header (mega-menu.css/.js), same way the sale-banner
// toggle already works: localStorage-backed, applied via a shared function every consumer
// calls, re-applied on every toggle change via window.rrgSetSession(). Loaded before
// mega-menu.js/shared.js in every page's <head> so rrgApplySessionState() exists
// by the time either calls it.
//
// "Nearest store set?" isn't handled here — it interacts with the region switcher's own
// per-region store name (shared.js's applyRegionNearestStore()), so it's handled
// there instead, listening for the 'rrg-session-change' event this file dispatches on every
// change (including for loggedIn/vehicleSet, so shared.js doesn't need to know
// which field changed — it just re-applies its own store display each time).
const RRG_SESSION_FIELDS = {
  loggedIn: { key: 'rrgSessionLoggedIn', default: true, on: 'Graham', off: 'Log In' },
  vehicleSet: { off: 'Select Your Vehicle' },
  storeSet: { key: 'rrgSessionStoreSet', default: true },
};

// Session vehicle — one control for the whole prototype (2026-09-29, spec.md §15 P4): Site Admin's
// "Vehicle" None / Toyota Hilux / Ford Ranger. Replaces the old Site Admin "Vehicle Set" on/off
// switch AND the Demo State Panel's separate Vehicle-Specific "Session Vehicle" buttons, which
// contradicted each other (header "Select Your Vehicle" while the fitment card said it fits your
// Hilux). Everything reads this: header text, the VS fitment card (demoKey → DEMO_VEHICLES in
// shared.js), PLP-family card fitment + hero (plpKey → PLP_VEHICLES in plp.js), search results.
const RRG_VEHICLES = {
  hilux: { label: 'Toyota Hilux', demoKey: 'match', plpKey: 'toyota-hilux-n80', image: 'vehicle-toyota-hilux.webp', badge: 'brand-toyota-badge.png' },
  ranger: { label: 'Ford Ranger', demoKey: 'mismatch', plpKey: 'ford-ranger-p703', image: 'vehicle-ford-ranger.png', badge: null }
};
const RRG_VEHICLE_KEY = 'rrgSessionVehicle';

// 'none' | 'hilux' | 'ranger'. Default Toyota Hilux; carries over the old on/off key once.
function rrgVehicleGet() {
  const v = localStorage.getItem(RRG_VEHICLE_KEY);
  if (v === 'none' || RRG_VEHICLES[v]) return v;
  return localStorage.getItem('rrgSessionVehicleSet') === 'false' ? 'none' : 'hilux';
}
// The session vehicle's record, or null when none is set.
function rrgVehicle() {
  return RRG_VEHICLES[rrgVehicleGet()] || null;
}

function rrgSessionGet(field) {
  if (field === 'vehicleSet') return rrgVehicleGet() !== 'none';
  const cfg = RRG_SESSION_FIELDS[field];
  const v = localStorage.getItem(cfg.key);
  return v === null ? cfg.default : v === 'true';
}

function rrgApplySessionState() {
  const loggedIn = rrgSessionGet('loggedIn');
  document.querySelectorAll('[data-session="loggedIn"]').forEach(el => {
    el.textContent = loggedIn ? RRG_SESSION_FIELDS.loggedIn.on : RRG_SESSION_FIELDS.loggedIn.off;
  });
  const vehicle = rrgVehicle();
  document.querySelectorAll('[data-session="vehicleSet"]').forEach(el => {
    el.textContent = vehicle ? `Your Vehicle: ${vehicle.label}` : RRG_SESSION_FIELDS.vehicleSet.off;
  });
  document.dispatchEvent(new CustomEvent('rrg-session-change'));
}

window.rrgSetVehicle = (key) => {
  localStorage.setItem(RRG_VEHICLE_KEY, RRG_VEHICLES[key] ? key : 'none');
  document.querySelectorAll('select[data-admin-vehicle]').forEach(sel => { sel.value = rrgVehicleGet(); });
  rrgApplySessionState();
};

// vehicleSet on/off still works for callers that only know "set a vehicle" (the Fit Finder drawer
// and VCLP's Fit Finder — both demo-select the Toyota Hilux) — keeps the current vehicle if one is set.
window.rrgSetSession = (field, on) => {
  if (field === 'vehicleSet') {
    window.rrgSetVehicle(on ? (rrgVehicleGet() !== 'none' ? rrgVehicleGet() : 'hilux') : 'none');
    return;
  }
  localStorage.setItem(RRG_SESSION_FIELDS[field].key, on);
  document.querySelectorAll(`[data-admin-flag="${field}"]`).forEach(t => { t.checked = !!on; });
  rrgApplySessionState();
};

// Build phase (2026-09-29, Brenton) — Phase 1 is what launches; Phase 2 previews everything
// agreed as a later addition (Best Seller / Staff Pick ribbons, Compare Products, ...), so the
// prototype can show the launch build by default without deleting future features. Set from the
// Site Admin Panel; defaults to 1. Fires the same 'rrg-session-change' event as the session
// toggles above so every page re-renders through its existing listener.
const RRG_BUILD_PHASE_KEY = 'rrgBuildPhase';

function rrgPhaseGet() {
  return localStorage.getItem(RRG_BUILD_PHASE_KEY) === '2' ? 2 : 1;
}

window.rrgSetPhase = (phase) => {
  localStorage.setItem(RRG_BUILD_PHASE_KEY, String(phase));
  document.dispatchEvent(new CustomEvent('rrg-session-change'));
};

// ---- Stock status (spec.md §14.1, agreed with Brenton 2026-09-29) ----------------------
// One status model for every surface that shows stock — PDP stock line, PLP-family cards,
// the Availability filter, the Delivery/Click & Collect widget and JSON-LD all call
// rrgStockStatus() instead of keeping their own wording.
//   stock (online, product-level): in_stock | low_stock | out_of_stock | special_order | discontinued
//   storeStock (Phase 2 only, relative to the session's nearest store): here | nearby | warehouse
// Phase 1 (and Phase 2 with no store set) only knows online stock — "In Stock Online",
// dispatched next business day, ready in any store within 2 business days (often sooner,
// since many stores hold it). Phase 2 with a store set names the store that has it.
const RRG_NEARBY_KM = 25;
const RRG_STOCK_LEGACY_KEYS = { not_in_stock: 'out_of_stock', limited: 'low_stock', click_collect: 'in_stock' };

function rrgStockKey(stock) {
  return RRG_STOCK_LEGACY_KEYS[stock] || stock || 'in_stock';
}

// Demo nearby store per region — Kedron is ~18km from North Lakes. NZ/UK are single-store
// regions, so "nearby" falls back to the warehouse wording there.
const RRG_DEMO_NEARBY_STORE = { AU: { name: 'Kedron', km: 18 } };

function rrgStoreContext() {
  const phase = rrgPhaseGet();
  const storeSet = rrgSessionGet('storeSet');
  const link = document.querySelector('[data-region-nearest-store]');
  const store = (link && (link.dataset.currentStoreName || link.dataset.auStore)) || 'North Lakes';
  const region = typeof currentRegion !== 'undefined' ? currentRegion : 'AU';
  return { phase, storeSet, storeAware: phase === 2 && storeSet, store, nearby: RRG_DEMO_NEARBY_STORE[region] || null };
}

// Returns { key, label (cards), pdpLabel, subline, tone (CSS class), schema (JSON-LD),
// collectToday, collectEta, contact (show "Contact our team"), setStore (show the
// Phase 2 "Set your store" prompt) }. storeStock is ignored unless Phase 2 + store set.
function rrgStockStatus(stock, storeStock, ctx = rrgStoreContext()) {
  const key = rrgStockKey(stock);
  const base = { key, subline: '', contact: false, setStore: false, collectToday: false };
  if (key === 'out_of_stock') {
    return { ...base, label: '✕ Out of Stock', pdpLabel: '✕ Out of Stock', tone: 'out-of-stock', schema: 'OutOfStock', contact: true, collectEta: 'Unavailable' };
  }
  if (key === 'special_order') {
    return { ...base, label: '⏱ Special Order', pdpLabel: '⏱ Special Order', subline: 'Ordered in for you — ready in 5–7 business days', tone: 'special-order', schema: 'BackOrder', collectEta: 'Ready in 5–7 business days' };
  }
  if (key === 'discontinued') {
    return { ...base, label: 'Discontinued', pdpLabel: 'Discontinued', tone: 'discontinued', schema: 'Discontinued', collectEta: 'Unavailable' };
  }
  const low = key === 'low_stock';
  const icon = low ? '⚠' : '✓';
  const word = low ? 'Low Stock' : 'In Stock';
  const pdpSuffix = low ? ' — order soon' : '';
  const common = { ...base, tone: low ? 'low-stock' : 'in-stock', schema: low ? 'LimitedAvailability' : 'InStock' };
  let where = ctx.storeAware ? (storeStock || 'warehouse') : null;
  if (where === 'nearby' && !ctx.nearby) where = 'warehouse';
  if (where === 'here') {
    const label = `${icon} ${word} at ${ctx.store}`;
    return { ...common, label, pdpLabel: label + pdpSuffix, subline: 'Click & Collect today · delivery dispatched next business day', collectToday: true, collectEta: 'Available Today' };
  }
  if (where === 'nearby') {
    const label = `${icon} ${word} at ${ctx.nearby.name} (${ctx.nearby.km}km)`;
    return { ...common, label, pdpLabel: label + pdpSuffix, subline: `Collect today from ${ctx.nearby.name}, or from ${ctx.store} within 2 business days`, collectToday: true, collectEta: `Today from ${ctx.nearby.name}` };
  }
  const label = `${icon} ${word} Online`;
  return {
    ...common, label, pdpLabel: label + pdpSuffix,
    subline: where === 'warehouse'
      ? `Collect at ${ctx.store} within 2 business days · delivery dispatched next business day`
      : 'Dispatched next business day · Click & Collect ready in-store within 2 business days',
    setStore: ctx.phase === 2 && !ctx.storeSet,
    collectEta: 'Ready within 2 business days'
  };
}

// Availability filter options — same set on every product-listing page, built from the
// current phase/store (spec.md §14.1). The store-aware options are nested: Nearby includes
// your own store; In Stock Online includes everything in stock anywhere.
function rrgAvailabilityOptions(ctx = rrgStoreContext()) {
  const opts = [];
  if (ctx.storeAware) {
    opts.push({ value: 'here', label: `In Stock at ${ctx.store}` });
    if (ctx.nearby) opts.push({ value: 'nearby', label: `In Stock Nearby (within ${RRG_NEARBY_KM}km)` });
  }
  opts.push({ value: 'online', label: 'In Stock Online' }, { value: 'special_order', label: 'Special Order' }, { value: 'out_of_stock', label: 'Out of Stock' });
  return opts;
}

function rrgAvailabilityMatches(stock, storeStock, value) {
  const key = rrgStockKey(stock);
  const inStock = key === 'in_stock' || key === 'low_stock';
  if (value === 'online') return inStock;
  if (value === 'here') return inStock && storeStock === 'here';
  if (value === 'nearby') return inStock && (storeStock === 'here' || storeStock === 'nearby');
  return key === value;
}

function rrgAvailabilityTooltip(ctx = rrgStoreContext()) {
  return ctx.storeAware
    ? `See what's on the shelf at ${ctx.store}, at stores within ${RRG_NEARBY_KM}km, or in our online warehouse (collect at ${ctx.store} within 2 business days).`
    : 'In Stock Online means it\'s ready to dispatch from our warehouse the next business day. Many stores hold it too — if yours doesn\'t, we can have it there within 2 business days.';
}

// "Set your store" prompt (Phase 2, no store set). In production this opens the store
// picker; the prototype just sets the session store, same as the Site Admin toggle.
document.addEventListener('click', e => {
  const link = e.target.closest('[data-set-store]');
  if (!link) return;
  e.preventDefault();
  document.querySelectorAll('[data-admin-flag="storeSet"]').forEach(t => { t.checked = true; });
  window.rrgSetSession('storeSet', true);
});
