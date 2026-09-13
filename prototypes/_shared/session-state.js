// Site-wide session state — logged in?, vehicle set?, nearest store set? — admin-toggleable
// (header-spec.md, 2026-09-13, Brenton). Drives the desktop utility bar's account/vehicle
// items and the mobile takeover's mini header (mega-menu.css/.js), same way the sale-banner
// toggle already works: localStorage-backed, applied via a shared function every consumer
// calls, re-applied on every toggle change via window.rrgSetSession(). Loaded before
// mega-menu.js/header-standalone.js in every page's <head> so rrgApplySessionState() exists
// by the time either calls it.
//
// "Nearest store set?" isn't handled here — it interacts with the region switcher's own
// per-region store name (header-standalone.js's applyRegionNearestStore()), so it's handled
// there instead, listening for the 'rrg-session-change' event this file dispatches on every
// change (including for loggedIn/vehicleSet, so header-standalone.js doesn't need to know
// which field changed — it just re-applies its own store display each time).
const RRG_SESSION_FIELDS = {
  loggedIn: { key: 'rrgSessionLoggedIn', default: true, on: 'Graham', off: 'Log In' },
  vehicleSet: { key: 'rrgSessionVehicleSet', default: true, on: 'Your Vehicle: Toyota Hilux', off: 'Select Your Vehicle' },
  storeSet: { key: 'rrgSessionStoreSet', default: true },
};

function rrgSessionGet(field) {
  const cfg = RRG_SESSION_FIELDS[field];
  const v = localStorage.getItem(cfg.key);
  return v === null ? cfg.default : v === 'true';
}

function rrgApplySessionState() {
  ['loggedIn', 'vehicleSet'].forEach(field => {
    const cfg = RRG_SESSION_FIELDS[field];
    const on = rrgSessionGet(field);
    document.querySelectorAll(`[data-session="${field}"]`).forEach(el => {
      el.textContent = on ? cfg.on : cfg.off;
    });
  });
  document.dispatchEvent(new CustomEvent('rrg-session-change'));
}

window.rrgSetSession = (field, on) => {
  localStorage.setItem(RRG_SESSION_FIELDS[field].key, on);
  rrgApplySessionState();
};
