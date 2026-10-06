// Demo cart, mini-cart drawer and site-wide Add to Cart (docs/checkout/checkout-spec.md, 2026-09-30).
// One cart in localStorage shared by every page: every Add to Cart writes to it and opens the
// mini-cart; the header count reads it; the cart, checkout and confirmation pages render from it.
// Prototype only: no real stock, prices, delivery rates or payments. Load after shared.js (uses
// fmtAud(), RRG_PROTO, currentRegion) and session-state.js (rrgStoreContext(), rrgVehicle()).

const RRG_CART_KEY = 'rrgCart';
const RRG_ORDER_KEY = 'rrgLastOrder';
const RRG_CART_IMG = path => `https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/215x190/pub/media/catalog/product/${path}`;

// ---- Region rules (spec Section 6) — follow the live sites ----
// Click & Collect is AU only online. Delivery rates are DEMO flat rates (live quotes by postcode
// and item; no free-shipping threshold is published).
const RRG_REGION_CHECKOUT = {
  AU: {
    collect: true, taxName: 'GST', taxFraction: 1 / 11, bnpl: ['afterpay', 'zip'], express: ['paypal', 'googlepay'],
    delivery: [
      { key: 'standard', label: 'Standard delivery', eta: '1–3 business days metro, 3–5 regional', price: 19.95 },
      { key: 'express', label: 'Express delivery', eta: 'Next business day to metro areas', price: 34.95 }
    ],
    payments: ['card', 'paypal', 'googlepay', 'afterpay', 'zip', 'eft'], cards: ['visa', 'mastercard'],
    regionLabel: 'State', regionOptions: ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'], postcodeLabel: 'Postcode', country: 'Australia'
  },
  NZ: {
    collect: false, taxName: 'GST', taxFraction: 3 / 23, bnpl: [], express: ['paypal'],
    delivery: [{ key: 'standard', label: 'Standard delivery', eta: '2–5 business days', price: 15.00 }],
    payments: ['card', 'paypal', 'eft'], cards: ['visa', 'mastercard'],
    regionLabel: 'Region', regionOptions: ['Auckland', 'Bay of Plenty', 'Canterbury', 'Otago', 'Waikato', 'Wellington', 'Other'], postcodeLabel: 'Postcode', country: 'New Zealand'
  },
  UK: {
    collect: false, taxName: 'VAT', taxFraction: 1 / 6, bnpl: [], express: ['paypal', 'googlepay'],
    delivery: [
      { key: 'standard', label: 'Standard delivery', eta: '2–4 working days, UK mainland', price: 9.95 },
      { key: 'express', label: 'Express delivery', eta: 'Next working day, UK mainland', price: 19.50 }
    ],
    payments: ['card', 'paypal', 'googlepay'], cards: ['visa', 'mastercard', 'amex'],
    regionLabel: 'County (optional)', regionOptions: null, postcodeLabel: 'Postcode', country: 'United Kingdom'
  }
};
const RRG_PAYMENT_LABELS = {
  card: 'Credit or debit card', paypal: 'PayPal', googlepay: 'Google Pay', afterpay: 'Afterpay', zip: 'Zip', eft: 'Bank transfer (EFT)'
};
function rrgRegionCheckout() {
  return RRG_REGION_CHECKOUT[typeof currentRegion === 'undefined' ? 'AU' : currentRegion] || RRG_REGION_CHECKOUT.AU;
}

// ---- Demo products (real live products, prices as live 2026-09-29/30) ----
const RRG_DEMO_CART_ITEMS = {
  platformKit: { sku: 'GP01M1TZZ', brand: 'Rhino-Rack', name: 'Rhino Rack Pioneer 6 Platform Kit — Toyota Hilux N80 (2015–2026), Bare Roof', price: 1893.09, wasPrice: 2137.00,
    image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/e/7/e775e3debebdc8ba3b70b79f87a0a59466cb68e1b3800433f011a483b3fc2679_1_26.jpg', url: 'vehicle-specific/index.html', fitsVehicle: 'hilux', pkgCategory: 'rack' },
  // Package Deal demo (2026-10-06): the real CRUZ Easy 430 from the Roof Boxes PLP — CRUZ, so 15%.
  roofBox: { sku: 'C940-349U', brand: 'CRUZ', name: 'Cruz Easy Gloss Black 430 litre Roof Box - 940-349U', price: 499.00, wasPrice: 699.00,
    image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/c/r/cruz-easy-gloss-black-430-litre-roof-box-940-349u-view-6.jpg', url: 'plp-roof-boxes/index.html', pkgCategory: 'roof-box' },
  // A Thule bar rack (real live listing, 2026-10-06) — the Thule Motion 3 L shows as compatible
  // with it, against the demo exclusion with the Pioneer platform above.
  thuleRack: { sku: 'GP03U93PK', brand: 'Thule', name: 'Thule WingBar Evo Black 2 Bar Roof Rack for Ford Everest U704 5dr SUV with Raised Roof Rail (2022 onwards)', price: 499.85, wasPrice: 529.95,
    image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/t/h/thule-wingbar-evo-black-2-bar-roof-rack-for-ford-everest-u704-5dr-suv-with-raised-roof-rail-2022-onwards-roof-raised-rail-mount-view-1-90a2a18f9a6e.jpg', url: '#', pkgCategory: 'rack' },
  // The Roof Box PDP's product (roof-box/), Gloss Black — Thule, so 10%.
  motionBox: { sku: 'T639700', brand: 'Thule', name: 'Thule Motion 3 L Roof Box', variant: 'Gloss Black', price: 1999.00, wasPrice: 1999.95,
    image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/t/h/thule-motion-3-l-gloss-black-roof-box-639700-f854bc4c2831.jpg', url: 'roof-box/index.html', pkgCategory: 'roof-box' },
  bikeRack: { sku: '922020', brand: 'Thule', name: 'Thule EuroWay G2 3 Bike Tow Ball Mounted Carrier - 922020', price: 799.00, wasPrice: 1199.95,
    image: RRG_CART_IMG('t/h/thule-euroway-g2-3-bike-tow-ball-mounted-carrier-922020.webp'), url: '#' },
  showerBundle: { sku: '8004109PROMO', brand: 'Yakima', name: 'Yakima RoadShower 15L Complete Shower & Hose Bundle', price: 449.00, wasPrice: 846.00,
    image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/y/a/yakima-8004109-camping_1.jpg', url: 'grouped-bundle/index.html',
    parts: ['1× Yakima RoadShower SM 15L (8004109)', '1× Yakima RoadShower On-Off Elbow (8004103)', '1× Yakima RoadShower Extra Long Hose 214cm (8881251)', '1× Yakima RoadShower FlexHead Shower LG 76cm (8004106)'] },
  waterTank: { sku: 'FRWTAN063', brand: 'Front Runner', name: 'Front Runner Pro Water Tank With Strap 42L', price: 299.00, wasPrice: 350.00,
    image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/F/r/Front-Runner-WTAN063-Platforms--Trays---Accessories._1_1.jpg', url: 'simple/index.html' },
  wheelHolder: { sku: '547001', brand: 'Thule', name: 'Thule Front Wheel Holder - 547001', price: 199.00, wasPrice: 239.95,
    image: RRG_CART_IMG('T/h/Thule-547001-Bike-Rack---Accessories._1_1.webp'), url: '#' }
};
// "Goes well with" in the mini-cart — DEMO: production uses each product's Magento cross-sells.
const RRG_DEMO_CROSS_SELLS = [
  { sku: '8001118', brand: 'Yakima', name: 'Yakima Locking Blockhead - 8001118', price: 79.00, wasPrice: 99.00, image: RRG_CART_IMG('Y/a/Yakima-8001118-Bike-Rack---Ute._1_1.webp'), url: '#' },
  { sku: '565100', brand: 'Thule', name: 'Thule Thruride 9mm Adapter - 565100', price: 49.00, wasPrice: 85.00, image: RRG_CART_IMG('T/h/Thule-565100-Bike-Rack---Accessories._1_1.webp'), url: '#' },
  { sku: '31130', brand: 'Rhino-Rack', name: 'Rhino Rack Awning Extension 2M - 31130', price: 179.00, image: RRG_CART_IMG('r/h/rhino-rack-awning-extension-31130_1.webp'), url: '#' },
  RRG_DEMO_CART_ITEMS.wheelHolder
];
const RRG_DEMO_CARTS = {
  empty: [],
  accessories: ['waterTank', 'wheelHolder'],
  full: ['platformKit', 'bikeRack', 'showerBundle', 'waterTank'],
  roofBox: ['roofBox'],                  // Package Deal: accessory, no rack yet (potential saving)
  packageDeal: ['platformKit', 'roofBox'], // Package Deal: rack + accessory (active)
  // Rack only — to view an accessory page against a rack (compatibility, phase 3):
  platformOnly: ['platformKit'],         // Pioneer platform: the Motion 3 L shows "not compatible" (demo exclusion)
  thuleRackOnly: ['thuleRack'],          // Thule bars: the Motion 3 L shows "compatible"
  notCompatible: ['platformKit', 'motionBox'] // Package Deal active, but the pair is a demo exclusion
};

// ---- Store ----
function rrgCartGet() {
  try {
    const c = JSON.parse(localStorage.getItem(RRG_CART_KEY) || 'null');
    return c && Array.isArray(c.lines) ? c : { lines: [] };
  } catch (e) { return { lines: [] }; }
}
function rrgCartSave(cart) {
  try { localStorage.setItem(RRG_CART_KEY, JSON.stringify(cart)); } catch (e) {}
  rrgCartSyncBadges();
  document.dispatchEvent(new CustomEvent('rrg-cart-change'));
}
const rrgCartCount = (cart = rrgCartGet()) => cart.lines.reduce((n, l) => n + l.qty, 0);
// Racks, bars, platforms, boxes, awnings, tents, bike carriers, shutters, ladder racks — what the
// stores fit. Drives the confirmation page's "Book fitting" card (spec Section 5).
const rrgIsFittable = line => /rack|bar\b|bars\b|platform|backbone|roof box|awning|tent|carrier|shutter|ladder|tray/i.test(line.name);

// ---- Package Deal (spec.md §19, 2026-10-06 Roof Box meeting) ----
// Buy any roof rack and any qualifying roof-mounted product (RMP) in the same order and the RMP
// gets a set % off its current price (so it stacks on a sale price). Rack first or accessory
// first, the basket works it out. No package SKUs (the UK store's way) — any rack + any RMP.
// Production: two Magento product attributes — package category (below) and, on accessories, the
// rate — with the brand rates as the defaults. The demo stores the category on each cart line.
const RRG_PACKAGE_DEAL = {
  name: 'Package Deal',     // customer-facing name (may change, Brenton 2026-10-06)
  defaultRate: 0.10,
  brandRates: { CRUZ: 0.15 },
  // Which RMP categories qualify. Roof boxes first (Graham: start there, bike racks are more
  // complex); the rest are switched on as each is demoed.
  qualifying: { 'roof-box': true, 'roof-bike': false, 'rooftop-tent': false, 'awning': false, 'water-snow': false }
};
// Name fallback for lines that don't carry pkgCategory (older demo data, related-product cards).
// Deliberately narrow: tracks, brackets, tub/ladder racks, spares and extensions are neither.
const RRG_PACKAGE_NOT = /\b(tub|ladder|lid roller|bracket|tracks?|mounting system|spine|foot rails?|leg pack|fitting kit|spares?|extension|accessor(y|ies)|cover|bag|lock)\b/i;
const RRG_PACKAGE_CATEGORY_RE = [
  ['rack', /\b(roof racks?|platform|cross ?bars?|roof bars?|bar set|\d bar|rack (kit|system))\b/i],
  ['roof-box', /\b(roof box|cargo box)\b/i],
  ['roof-bike', /\broof[- ]mount(ed|ing)? bike|bike (carrier|rack)[^,]*roof[- ]mount/i],
  ['rooftop-tent', /\b(roof ?top tent)\b/i],
  ['awning', /\bawning\b/i],
  ['water-snow', /\b(kayak|sup|ski|snowboard) (carrier|rack)\b/i]
];
function rrgPackageCategory(item) {
  if (!item) return null;
  if (item.pkgCategory !== undefined) return item.pkgCategory || null;
  const name = item.name || '';
  if (RRG_PACKAGE_NOT.test(name)) return null;
  const hit = RRG_PACKAGE_CATEGORY_RE.find(([, re]) => re.test(name));
  return hit ? hit[0] : null;
}
// 'rack' | 'rmp' (a qualifying accessory) | null
function rrgPackageRole(item) {
  const cat = rrgPackageCategory(item);
  if (cat === 'rack') return 'rack';
  return cat && RRG_PACKAGE_DEAL.qualifying[cat] ? 'rmp' : null;
}
function rrgPackageRate(item) {
  if (rrgPackageRole(item) !== 'rmp') return 0;
  const brand = Object.keys(RRG_PACKAGE_DEAL.brandRates).find(b => b.toLowerCase() === String(item.brand || '').toLowerCase());
  return brand ? RRG_PACKAGE_DEAL.brandRates[brand] : RRG_PACKAGE_DEAL.defaultRate;
}
// Per-unit saving on a qualifying accessory, off its current price.
const rrgPackageSaving = item => Math.round((item.price || 0) * rrgPackageRate(item) * 100) / 100;
// The cart's Package Deal state. Every unit of every qualifying accessory saves while at least one
// rack is in the cart (assumption — no one-accessory-per-rack cap was discussed).
//   active     a rack and a qualifying accessory are both in the cart
//   discount   what the order saves now (0 unless active)
//   potential  what adding a rack would save (accessories in the cart, no rack yet)
//   lines      { [line key]: saving for that line (all units) }
function rrgPackageDeal(cart = rrgCartGet()) {
  const racks = cart.lines.filter(l => rrgPackageRole(l) === 'rack');
  const accessories = cart.lines.filter(l => rrgPackageRole(l) === 'rmp');
  const lines = {};
  accessories.forEach(l => { lines[l.key] = Math.round(rrgPackageSaving(l) * l.qty * 100) / 100; });
  const sum = Object.values(lines).reduce((n, v) => n + v, 0);
  const active = racks.length > 0 && accessories.length > 0;
  return { racks, accessories, active, hasRack: racks.length > 0, discount: active ? sum : 0, potential: active ? 0 : sum, lines };
}

// ---- Package Deal: rack-aware compatibility (spec.md §19 phase 3) ----
// Every roof-mounted accessory works with every rack until merchandising adds an exclusion (the
// meeting: "by default everything's compatible with everything else until we put an exclusion
// in"). Production: an exclusion list maintained per product. Compatibility applies to every
// roof-mounted category, whether or not it qualifies for the Package Deal discount yet.
// Messages show both ways: on an accessory, against the racks in the cart; on a rack, against the
// accessories in the cart. Products are never hidden — the shopper can still add either.
const RRG_PACKAGE_EXCLUSIONS = [
  // DEMO ONLY — not a real fitment rule. One exclusion so the "not compatible" message can be
  // reviewed: the Thule Motion 3 L (roof-box/) against the Rhino-Rack Pioneer platforms.
  { demo: true, accessories: ['T639700', 'T639701'], racks: ['GP01M1TZZ', 'RH62109', 'RH62112', 'JC-02306'] }
];
const RRG_PACKAGE_CATEGORY_LABEL = { rack: 'roof rack', 'roof-box': 'roof box', 'roof-bike': 'bike rack', 'rooftop-tent': 'rooftop tent', awning: 'awning', 'water-snow': 'carrier' };
const RRG_COMPAT_TIP = "Some roof racks and platforms don't suit some accessories because of the channel size or the way they mount. You can still order both. If you're not sure, contact us and we'll check your setup.";
const rrgIsRoofAccessory = item => { const c = rrgPackageCategory(item); return !!c && c !== 'rack'; };
function rrgPackageCompatible(accessory, rack) {
  return !RRG_PACKAGE_EXCLUSIONS.some(x => x.accessories.includes(accessory.sku) && x.racks.includes(rack.sku));
}
// The item's compatibility with the other kind of product in the cart: [{ line, compatible }].
// Empty when the item isn't a rack or roof accessory, or there's nothing to compare it with.
function rrgPackageCompatInCart(item, cart = rrgCartGet()) {
  const cat = rrgPackageCategory(item);
  if (!cat) return [];
  const self = item.key || item.sku;
  const others = cart.lines.filter(l => l.key !== self && (cat === 'rack' ? rrgIsRoofAccessory(l) : rrgPackageCategory(l) === 'rack'));
  return others.map(l => ({ line: l, compatible: cat === 'rack' ? rrgPackageCompatible(l, item) : rrgPackageCompatible(item, l) }));
}
// Product names run long ("… for Toyota Hilux N80 (2015–2026), Bare Roof"): the message names
// the product up to its vehicle/SKU suffix.
const rrgShortName = name => String(name || '').split(/ — | - | for /)[0].trim();
const rrgInfoTipHTML = text => `<span class="rrg-info-tip" tabindex="0" role="img" aria-label="${rrgEsc(text)}" data-tooltip="${rrgEsc(text)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg></span>`;
// One message per matching cart line. 'banner' = the PDP banner above Add to Cart (shared.js
// applyCartConflict); 'line' = the small note on a cart line (rrgCartLineHTML).
function rrgPackageCompatHTML(item, mode = 'banner', cart = rrgCartGet()) {
  const cat = rrgPackageCategory(item);
  return rrgPackageCompatInCart(item, cart).map(({ line, compatible }) => {
    const swap = RRG_PACKAGE_CATEGORY_LABEL[cat === 'rack' ? rrgPackageCategory(line) : 'rack'];
    if (mode === 'banner') {
      const name = `<b>${rrgEsc(rrgShortName(line.name))}</b>`;
      return rrgNoticeCardHTML(compatible ? 'fits' : 'unknown', compatible ? 'Compatible' : 'Heads up: not compatible',
        compatible ? `Works with the ${name} in your cart.` : `Not compatible with the ${name} in your cart. Choose a different ${swap}, or contact us and we'll help.`,
        RRG_COMPAT_TIP, 'cart-conflict-banner');
    }
    const name = `<strong>${rrgEsc(rrgShortName(line.name))}</strong>`;
    const msg = compatible ? `✓ Compatible with the ${name} in your cart` : `Heads up: not compatible with the ${name} in your cart.`;
    return `<div class="cart-line-compat ${compatible ? 'is-ok' : 'is-warn'}"><span>${msg}</span>${rrgInfoTipHTML(RRG_COMPAT_TIP)}</div>`;
  }).join('');
}
// Decision-panel notice in the PDP's fitment-card style (Brenton, 2026-10-06: the compatibility
// note should match the "Fits your vehicle" message, not a tinted box) — it reuses the .fitment
// classes: white card, 3px state-colour left edge, state-coloured icon + uppercase label, grey
// body. state: 'fits' (green) | 'unknown' (amber) | 'deal' (brand red, the Package Deal tag).
// Names in the body use <b>: .fitment strong is the label style.
const RRG_NOTICE_ICONS = {
  fits: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="m7.5 12.5 3 3 6-6.5"/></svg>',
  unknown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>'
};
function rrgNoticeCardHTML(state, label, body, tip, extraClass = '') {
  const icon = RRG_NOTICE_ICONS[state] || (typeof RRG_PACKAGE_ICON !== 'undefined' ? RRG_PACKAGE_ICON : '');
  return `<div class="fitment ${state} rrg-notice ${extraClass}">
    <span class="dot">${icon}</span>
    <div class="rrg-notice-text"><strong>${label}${tip ? ' ' + rrgInfoTipHTML(tip) : ''}</strong>${body}</div>
  </div>`;
}

function rrgCartAdd(item, { open = true } = {}) {
  const cart = rrgCartGet();
  const key = item.sku || item.name;
  const line = cart.lines.find(l => l.key === key);
  if (line) line.qty += 1;
  else cart.lines.push({ ...item, key, qty: 1 });
  rrgCartSave(cart);
  if (open) rrgOpenMiniCart(true);
}
function rrgCartSetQty(key, qty) {
  const cart = rrgCartGet();
  cart.lines = cart.lines.map(l => l.key === key ? { ...l, qty } : l).filter(l => l.qty > 0);
  rrgCartSave(cart);
}
function rrgCartLoadPreset(name) {
  rrgCartSave({ lines: (RRG_DEMO_CARTS[name] || []).map(k => ({ ...RRG_DEMO_CART_ITEMS[k], key: RRG_DEMO_CART_ITEMS[k].sku, qty: 1 })) });
}
function rrgCartPresetName(cart = rrgCartGet()) {
  const keys = cart.lines.map(l => l.key).sort().join();
  const hit = Object.entries(RRG_DEMO_CARTS).find(([, items]) => items.map(k => RRG_DEMO_CART_ITEMS[k].sku).sort().join() === keys && cart.lines.every(l => l.qty === 1));
  return hit ? hit[0] : 'custom';
}

// Totals. method: 'collect' (free) | a delivery key | null (not chosen yet). Prices include tax.
// fullSubtotal is before savings (every line at its was-price): the cart, checkout and order
// confirmation summaries show it as Subtotal, so Subtotal − You're saving + delivery = Total adds up
// on the page (2026-10-02, Brenton — it showed the already-discounted subtotal, then subtracted the
// saving again, so the Total looked wrong). `subtotal` stays the amount payable (mini-cart, BNPL).
function rrgCartTotals(cart = rrgCartGet(), method = null) {
  const rc = rrgRegionCheckout();
  const subtotal = cart.lines.reduce((n, l) => n + l.price * l.qty, 0);
  const was = cart.lines.reduce((n, l) => n + (l.wasPrice || l.price) * l.qty, 0);
  const opt = rc.delivery.find(d => d.key === method);
  const delivery = method === 'collect' ? 0 : opt ? opt.price : null;
  const total = subtotal + (delivery || 0);
  // Package Deal (2026-10-06): reported here, NOT yet taken off subtotal/total — the cart,
  // mini-cart and checkout summaries get their "Package Deal" line in phase 5 (spec.md §19), and
  // taking it off before then would show totals that don't add up on the page.
  const deal = rrgPackageDeal(cart);
  return { count: rrgCartCount(cart), subtotal, fullSubtotal: Math.max(was, subtotal), savings: Math.max(0, was - subtotal), delivery, total, tax: total * rc.taxFraction, taxName: rc.taxName,
    packageDiscount: deal.discount, packagePotential: deal.potential };
}
const rrgMoney = n => fmtAud(Math.round(n * 100) / 100);
const rrgPath = rel => rel === '#' ? '#' : RRG_PROTO + rel;
const rrgEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Header cart count (main + sticky header), from the cart.
function rrgCartSyncBadges() {
  const n = rrgCartCount();
  document.querySelectorAll('.cart-badge').forEach(el => { el.textContent = String(n); });
}

// ---- Shared line markup (mini-cart, cart page, order summaries) ----
function rrgCartLineHTML(line, { editable = true, compact = false } = {}) {
  const vehicle = typeof rrgVehicle === 'function' ? rrgVehicle() : null;
  const fit = line.fitsVehicle
    ? (vehicle && typeof rrgVehicleGet === 'function' && rrgVehicleGet() === line.fitsVehicle
      ? `<span class="cart-line-fit fits">✓ Fits your ${vehicle.label}</span>`
      : `<span class="cart-line-fit check">Check fit: made for the ${RRG_VEHICLES[line.fitsVehicle].label}</span>`)
    : '';
  return `
    <li class="cart-line${compact ? ' is-compact' : ''}" data-cart-key="${rrgEsc(line.key)}">
      <a class="cart-line-img" href="${rrgPath(line.url || '#')}"><img src="${line.image}" alt="" loading="lazy"></a>
      <div class="cart-line-info">
        <span class="cart-line-brand">${rrgEsc(line.brand || '')}</span>
        <a class="cart-line-name" href="${rrgPath(line.url || '#')}">${rrgEsc(line.name)}</a>
        ${line.variant ? `<span class="cart-line-meta">${rrgEsc(line.variant)}</span>` : ''}
        ${line.parts ? `<ul class="cart-line-parts" aria-label="Included in this bundle">${line.parts.map(p => `<li>${rrgEsc(p)}</li>`).join('')}</ul>` : ''}
        ${fit}
        ${rrgIsRoofAccessory(line) ? rrgPackageCompatHTML(line, 'line') : '' /* Package Deal compatibility — on the accessory's line only, so each pairing shows once */}
        ${compact ? '' : `<span class="cart-line-meta">SKU ${rrgEsc(line.sku || '')}</span>`}
        ${editable ? `
          <div class="cart-line-controls">
            <div class="qty-stepper" role="group" aria-label="Quantity">
              <button type="button" data-cart-qty="-1" aria-label="Decrease quantity">−</button>
              <span aria-live="polite">${line.qty}</span>
              <button type="button" data-cart-qty="1" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="cart-line-remove" data-cart-remove>Remove</button>
          </div>` : `<span class="cart-line-meta">Qty ${line.qty}</span>`}
      </div>
      <div class="cart-line-price">
        <strong>${rrgMoney(line.price * line.qty)}</strong>
        ${line.wasPrice && line.wasPrice > line.price ? `<s>${rrgMoney(line.wasPrice * line.qty)}</s>` : ''}
      </div>
    </li>`;
}
// BNPL line per region (AU: Afterpay 4 payments, Zip from $10/week). NZ/UK have none on live.
function rrgBnplHTML(total) {
  const rc = rrgRegionCheckout();
  if (!rc.bnpl.length || !total) return '';
  return `<p class="cart-bnpl">or 4 interest-free payments of <strong>${rrgMoney(total / 4)}</strong> with <b>Afterpay</b> · or from $10/week with <b>Zip</b></p>`;
}
// Qty / remove buttons, delegated — works in the mini-cart and on the cart page.
document.addEventListener('click', e => {
  const line = e.target.closest('[data-cart-key]');
  if (!line) return;
  const key = line.dataset.cartKey;
  const current = rrgCartGet().lines.find(l => l.key === key);
  if (!current) return;
  if (e.target.closest('[data-cart-remove]')) rrgCartSetQty(key, 0);
  const step = e.target.closest('[data-cart-qty]');
  if (step) rrgCartSetQty(key, Math.max(0, current.qty + Number(step.dataset.cartQty)));
});

// ---- Mini-cart drawer (spec Section 2) ----
function rrgBuildMiniCart() {
  if (document.getElementById('miniCartBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'store-slideout-backdrop mini-cart-backdrop';
  backdrop.id = 'miniCartBackdrop';
  backdrop.innerHTML = `
    <div class="store-slideout mini-cart" role="dialog" aria-modal="true" aria-labelledby="miniCartTitle">
      <div class="store-slideout-head">
        <h2 id="miniCartTitle"></h2>
        <button type="button" class="store-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="mini-cart-body" id="miniCartBody"></div>
      <div class="mini-cart-foot" id="miniCartFoot"></div>
    </div>`;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) rrgCloseMiniCart(); });
  backdrop.querySelector('.store-slideout-close').addEventListener('click', rrgCloseMiniCart);
  backdrop.addEventListener('click', e => {
    const add = e.target.closest('[data-cross-sell]');
    if (add) rrgCartAdd(RRG_DEMO_CROSS_SELLS.find(p => p.sku === add.dataset.crossSell), { open: false });
  });
}
let rrgMiniCartJustAdded = false;
function rrgRenderMiniCart() {
  const body = document.getElementById('miniCartBody');
  if (!body) return;
  const cart = rrgCartGet();
  const t = rrgCartTotals(cart);
  const rc = rrgRegionCheckout();
  document.getElementById('miniCartTitle').innerHTML = rrgMiniCartJustAdded && cart.lines.length
    ? '<span class="mini-cart-added">✓</span> Added to your cart' : `Your cart${t.count ? ` (${t.count})` : ''}`;
  if (!cart.lines.length) {
    body.innerHTML = `<div class="cart-empty-mini"><p>Your cart is empty.</p><a class="btn btn-outline btn-sm" href="${RRG_PROTO}home/index.html#shop-by-category">Shop by category</a></div>`;
    document.getElementById('miniCartFoot').innerHTML = '';
    return;
  }
  const inCart = new Set(cart.lines.map(l => l.key));
  const cross = RRG_DEMO_CROSS_SELLS.filter(p => !inCart.has(p.sku)).slice(0, 3);
  body.innerHTML = `
    <ul class="cart-lines">${cart.lines.map(l => rrgCartLineHTML(l, { compact: true })).join('')}</ul>
    ${cross.length ? `
      <div class="mini-cart-cross">
        <h3>Goes well with</h3>
        <ul>${cross.map(p => `
          <li><img src="${p.image}" alt="" loading="lazy"><span><a href="${rrgPath(p.url)}">${rrgEsc(p.name)}</a><strong>${rrgMoney(p.price)}</strong></span>
            <button type="button" class="btn btn-outline btn-sm" data-cross-sell="${p.sku}" aria-label="Add ${rrgEsc(p.name)} to cart">Add</button></li>`).join('')}
        </ul>
      </div>` : ''}`;
  const ctx = typeof rrgStoreContext === 'function' ? rrgStoreContext() : { storeSet: false };
  const fulfil = rc.collect
    ? `<span class="mini-cart-collect"><strong>Free Click &amp; Collect</strong> ${ctx.storeSet ? `from ${ctx.store}` : 'from any store'}</span>`
    : '<span class="mini-cart-collect">Delivery calculated at checkout</span>';
  document.getElementById('miniCartFoot').innerHTML = `
    <div class="mini-cart-subtotal"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><strong>${rrgMoney(t.subtotal)}</strong></div>
    ${t.savings > 0 ? `<p class="mini-cart-savings">${typeof rrgSavingsLabel === 'function' ? rrgSavingsLabel() : "You're saving"} ${rrgMoney(t.savings)}</p>` : ''}
    ${fulfil}
    <a class="btn btn-cta btn-block" href="${RRG_PROTO}checkout/index.html">Checkout</a>
    <a class="btn btn-outline btn-block" href="${RRG_PROTO}cart/index.html">View cart</a>
    ${rrgBnplHTML(t.subtotal)}`;
}
function rrgOpenMiniCart(justAdded = false) {
  rrgBuildMiniCart();
  rrgMiniCartJustAdded = justAdded;
  rrgRenderMiniCart();
  const backdrop = document.getElementById('miniCartBackdrop');
  backdrop.classList.add('open');
  backdrop.querySelector('.store-slideout-close').focus({ preventScroll: true });
}
function rrgCloseMiniCart() {
  const backdrop = document.getElementById('miniCartBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}
document.addEventListener('rrg-cart-change', () => {
  if (document.getElementById('miniCartBackdrop')?.classList.contains('open')) rrgRenderMiniCart();
});
document.addEventListener('rrg-region-change', () => {
  if (document.getElementById('miniCartBackdrop')?.classList.contains('open')) rrgRenderMiniCart();
});

// ---- Package Deal: PDP tag + drawer (spec.md §19 phase 4, 2026-10-06) ----
// A tag under the price on rack and qualifying-accessory product pages (any page whose .cta-col
// has data-pkg-category). It never shows a third price on the page (RRP and sale price are already
// there); the saving is a "Save $X" amount, and the drawer it opens is where the with-a-rack price
// lives. The drawer: explains the deal → "Add to cart & choose your rack" adds this product, then
// lists racks for the session vehicle (each with its compatibility) → "Package Deal applied".
// Racks per vehicle — DEMO: real live listings already scraped for the two demo vehicles (header
// search data / VPLP, prices as scraped; the Wedgetail and Yakima listings have no captured SKU, so
// they key by name). Production: the vehicle's roof racks, best sellers first.
const RRG_PACKAGE_RACKS = {
  hilux: [
    RRG_DEMO_CART_ITEMS.platformKit,
    { sku: 'RH62112', brand: 'Rhino-Rack', name: 'Rhino Rack 62112 Pioneer Platform (1500mm x 1240mm) for Toyota Hilux N80 - Heavy Duty Trade', price: 1750.00,
      image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/R/h/Rhino-Rack-62112-Platforms--Trays._1.jpg', url: 'vplp/index.html', fitsVehicle: 'hilux', pkgCategory: 'rack' },
    { sku: 'RH-VTX2', brand: 'Rhino-Rack', name: 'Rhino Rack Vortex 2 Bar Cross Bar Set for Toyota Hilux N80 - Roof Track Mount', price: 389.00,
      image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/R/h/Rhino-Rack-RTS556-Tracks._1_6.jpg', url: 'vplp/index.html', fitsVehicle: 'hilux', pkgCategory: 'rack' },
    { sku: '730402', brand: 'Thule', name: 'Thule SmartRack XT Silver 2 Bar Roof Rack for Toyota Hilux N80', price: 379.95,
      image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/T/h/Thule-730402-Roof-Rack---Bars--Legs._1_269.jpg', url: 'vplp/index.html', fitsVehicle: 'hilux', pkgCategory: 'rack' },
    { sku: 'KRTH011T', brand: 'Front Runner', name: 'Front Runner Slimline II Flush Bar Kit for Toyota Hilux N80 - Roof Track Mount', price: 409.00,
      image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/F/r/Front-Runner-KRTH011T_1.jpg', url: 'vplp/index.html', fitsVehicle: 'hilux', pkgCategory: 'rack' }
  ],
  ranger: [
    { sku: 'JC-01605', brand: 'Rhino-Rack', name: 'Rhino Rack JC-01605 Pioneer 6 Platform for Ford Ranger P703', price: 597.52,
      image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/e/7/e775e3debebdc8ba3b70b79f87a0a59466cb68e1b3800433f011a483b3fc2679_1_20.jpg', url: '#', fitsVehicle: 'ranger', pkgCategory: 'rack' },
    { brand: 'Wedgetail', name: 'Wedgetail Adventure Platform Roof Rack for Ford Ranger P703', price: 399.00,
      image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/p/l/platform_and_mounting_4_1.jpg', url: '#', fitsVehicle: 'ranger', pkgCategory: 'rack' },
    { brand: 'Yakima', name: 'Yakima LockNLoad Platform with RuggedLine HD for Ford Ranger P703', price: 467.50,
      image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/p/r/primary-image-8005080-1-8005201-1-c68025f9f4f7.jpg', url: '#', fitsVehicle: 'ranger', pkgCategory: 'rack' }
  ]
};
// The Ranger's Pioneer platform joins the demo exclusion with its Hilux siblings.
RRG_PACKAGE_EXCLUSIONS[0].racks.push('JC-01605');

const rrgPctLabel = r => `${Math.round(r * 100)}%`;
// The qualifying categories as words: "roof box" now; "roof box or bike rack" as more switch on.
const rrgPackageQualifyingLabel = () => Object.keys(RRG_PACKAGE_DEAL.qualifying).filter(k => RRG_PACKAGE_DEAL.qualifying[k]).map(k => RRG_PACKAGE_CATEGORY_LABEL[k]).join(' or ');
// The rate range across brands ("10–15%"), for a rack page where the accessory isn't known yet.
function rrgPackageRateRange() {
  const rates = [RRG_PACKAGE_DEAL.defaultRate, ...Object.values(RRG_PACKAGE_DEAL.brandRates)];
  const lo = Math.min(...rates), hi = Math.max(...rates);
  return lo === hi ? rrgPctLabel(lo) : `${Math.round(lo * 100)}–${rrgPctLabel(hi)}`;
}
const RRG_PACKAGE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>';

function rrgPackagePageItem() {
  return document.querySelector('.cta-col[data-pkg-category]') && typeof rrgPdpCartItem === 'function' ? rrgPdpCartItem() : null;
}
// The tag under the price block. Re-drawn with the compatibility banner (load, cart change,
// colour swap) and on a region change.
function rrgRenderPackageTag() {
  document.querySelectorAll('.pkg-deal-tag').forEach(el => el.remove());
  const item = rrgPackagePageItem();
  const role = item && rrgPackageRole(item);
  const block = document.querySelector('.decision-panel .price-block');
  if (!role || !block) return;
  const deal = rrgPackageDeal();
  let body, active = false;
  if (role === 'rmp') {
    const save = rrgMoney(rrgPackageSaving(item));
    const rack = deal.racks[0];
    active = !!rack;
    body = rack
      ? `You'll save <b>${save}</b> on this ${RRG_PACKAGE_CATEGORY_LABEL[rrgPackageCategory(item)]} with the <b>${rrgEsc(rrgShortName(rack.name))}</b> in your cart.`
      : `Save <b>${rrgPctLabel(rrgPackageRate(item))} (${save})</b> on this ${RRG_PACKAGE_CATEGORY_LABEL[rrgPackageCategory(item)]} when you buy it with any roof rack.`;
  } else {
    const acc = deal.accessories;
    const inCart = deal.racks.some(l => l.key === item.sku);
    active = acc.length > 0 && inCart;
    const accSave = rrgMoney(acc.reduce((n, l) => n + (deal.lines[l.key] || 0), 0));
    body = acc.length
      ? (inCart ? `You're saving <b>${accSave}</b> on the ${rrgPackageQualifyingLabel()} in your cart with this rack.`
        : `Add this rack and save <b>${accSave}</b> on the <b>${rrgEsc(rrgShortName(acc[0].name))}</b> in your cart.`)
      : `Buy this rack with a ${rrgPackageQualifyingLabel()} and save <b>${rrgPackageRateRange()}</b> on the ${rrgPackageQualifyingLabel()}.`;
  }
  // Same fitment-card style as the compatibility notice: red edge/label, green once active.
  block.insertAdjacentHTML('afterend', rrgNoticeCardHTML(active ? 'fits' : 'deal',
    active ? `${RRG_PACKAGE_DEAL.name} applied` : RRG_PACKAGE_DEAL.name,
    `${body} <button type="button" class="link-btn" data-package-open>How it works</button>`, '', 'pkg-deal-tag'));
}
document.addEventListener('rrg-region-change', rrgRenderPackageTag);

// ---- Drawer ----
let rrgPackageStep = 'intro'; // 'intro' | 'racks' | 'done'
function rrgBuildPackageDrawer() {
  if (document.getElementById('pkgDrawerBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'store-slideout-backdrop pkg-drawer-backdrop';
  backdrop.id = 'pkgDrawerBackdrop';
  backdrop.innerHTML = `
    <div class="store-slideout pkg-drawer" role="dialog" aria-modal="true" aria-labelledby="pkgDrawerTitle">
      <div class="store-slideout-head">
        <h2 id="pkgDrawerTitle">${RRG_PACKAGE_DEAL.name}</h2>
        <button type="button" class="store-slideout-close" aria-label="Close">&times;</button>
      </div>
      <div class="pkg-drawer-body" id="pkgDrawerBody"></div>
      <div class="pkg-drawer-foot" id="pkgDrawerFoot"></div>
    </div>`;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) rrgClosePackageDrawer(); });
  backdrop.querySelector('.store-slideout-close').addEventListener('click', rrgClosePackageDrawer);
  backdrop.addEventListener('click', e => {
    const item = rrgPackagePageItem();
    if (e.target.closest('[data-pkg-add-choose]')) { rrgCartAdd(item, { open: false }); rrgPackageStep = 'racks'; rrgRenderPackageDrawer(); }
    if (e.target.closest('[data-pkg-add-only]')) { rrgClosePackageDrawer(); rrgCartAdd(item); }
    const rack = e.target.closest('[data-pkg-add-rack]');
    if (rack) {
      const r = (RRG_PACKAGE_RACKS[rrgVehicleGet()] || []).find(x => (x.sku || x.name) === rack.dataset.pkgAddRack);
      if (r) { rrgCartAdd(r, { open: false }); rrgPackageStep = 'done'; rrgRenderPackageDrawer(); }
    }
    if (e.target.closest('[data-pkg-view-cart]')) { rrgClosePackageDrawer(); rrgOpenMiniCart(false); }
    if (e.target.closest('[data-pkg-close]')) rrgClosePackageDrawer();
  });
}
function rrgPackageSteps(role) {
  const acc = rrgPackageQualifyingLabel();
  const steps = role === 'rmp'
    ? ['Add this ' + acc + ' to your cart.', 'Add any roof rack for your vehicle (we\'ll show you the ones that fit).', 'The saving comes off in your cart. Either order works.']
    : ['Add this roof rack to your cart.', `Add any ${acc}, any brand.`, `${rrgPackageRateRange()} comes off the ${acc} in your cart. Either order works.`];
  return `<ol class="pkg-steps">${steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
}
function rrgRenderPackageDrawer() {
  const body = document.getElementById('pkgDrawerBody');
  const foot = document.getElementById('pkgDrawerFoot');
  if (!body) return;
  const item = rrgPackagePageItem();
  const role = item && rrgPackageRole(item);
  if (!role) { body.innerHTML = ''; foot.innerHTML = ''; return; }
  const deal = rrgPackageDeal();
  const acc = rrgPackageQualifyingLabel();
  const intro = `<p class="pkg-lead">Buy any roof rack and a ${acc} in the same order and the ${acc} is <strong>${role === 'rmp' ? rrgPctLabel(rrgPackageRate(item)) : rrgPackageRateRange()} off</strong>. It stacks on sale prices.</p>`;

  if (role === 'rack') {
    body.innerHTML = `${intro}${rrgPackageSteps('rack')}
      <a class="pkg-shop-link" href="${RRG_PROTO}plp-roof-boxes/index.html">Shop roof boxes ›</a>`;
    foot.innerHTML = `<button type="button" class="btn btn-outline btn-block" data-pkg-close>Got it</button>`;
    return;
  }

  const price = item.price || 0;
  const save = rrgPackageSaving(item);
  const card = `
    <div class="pkg-product">
      <img src="${item.image}" alt="">
      <div>
        <span class="cart-line-brand">${rrgEsc(item.brand || '')}</span>
        <strong class="pkg-product-name">${rrgEsc(item.name)}</strong>
        <dl class="pkg-prices">
          <dt>Today</dt><dd>${rrgMoney(price)}</dd>
          <dt>With a roof rack</dt><dd class="pkg-price-deal">${rrgMoney(price - save)}</dd>
        </dl>
        <span class="pkg-save">You save ${rrgMoney(save)}</span>
      </div>
    </div>`;
  const vehicle = rrgVehicle();

  if (rrgPackageStep === 'done') {
    const now = rrgPackageDeal();
    body.innerHTML = `
      <div class="pkg-done">
        <span class="mini-cart-added">✓</span>
        <h3>${RRG_PACKAGE_DEAL.name} applied</h3>
        <p>You're saving <strong>${rrgMoney(now.discount)}</strong> on your ${acc} in this order.</p>
      </div>
      <ul class="cart-lines">${[...now.racks, ...now.accessories].map(l => rrgCartLineHTML(l, { editable: false, compact: true })).join('')}</ul>`;
    foot.innerHTML = `<button type="button" class="btn btn-cta btn-block" data-pkg-view-cart>View cart</button>
      <button type="button" class="btn btn-outline btn-block" data-pkg-close>Keep shopping</button>`;
    return;
  }

  if (rrgPackageStep === 'racks') {
    // Compatible racks first; incompatible ones still listed (never hidden), below them.
    const racks = (vehicle ? (RRG_PACKAGE_RACKS[rrgVehicleGet()] || []) : [])
      .map((r, i) => ({ r, i, ok: rrgPackageCompatible(item, r) }))
      .sort((a, b) => (b.ok - a.ok) || (a.i - b.i)).map(x => x.r);
    body.innerHTML = `
      <p class="pkg-added">✓ ${rrgEsc(rrgShortName(item.name))} added to your cart</p>
      <h3 class="pkg-h3">${vehicle ? `Choose a roof rack for your ${vehicle.label}` : 'Which vehicle is it for?'}</h3>
      ${vehicle ? `
        <ul class="pkg-racks">${racks.map(r => {
          const ok = rrgPackageCompatible(item, r);
          return `<li class="pkg-rack">
            <img src="${r.image}" alt="" loading="lazy">
            <div class="pkg-rack-info">
              <span class="cart-line-brand">${rrgEsc(r.brand)}</span>
              <span class="pkg-rack-name">${rrgEsc(rrgShortName(r.name))}</span>
              <span class="cart-line-compat ${ok ? 'is-ok' : 'is-warn'}"><span>${ok ? `✓ Compatible with this ${acc}` : `Not compatible with this ${acc}`}</span></span>
              <strong>${rrgMoney(r.price)}</strong>
            </div>
            <button type="button" class="btn btn-outline btn-sm" data-pkg-add-rack="${rrgEsc(r.sku || r.name)}">Add</button>
          </li>`;
        }).join('')}</ul>
        <a class="pkg-shop-link" href="${rrgVehicleGet() === 'hilux' ? RRG_PROTO + 'vplp/index.html' : RRG_PROTO + 'fit-my-vehicle/index.html'}">See every roof rack for your ${vehicle.label} ›</a>`
      : `<p>Set your vehicle and we'll show you the roof racks that fit it.</p>
         <button type="button" class="btn btn-cta btn-block" data-open-fit-finder>Set your vehicle</button>`}`;
    foot.innerHTML = `<button type="button" class="btn btn-outline btn-block" data-pkg-close>I'll choose a rack later</button>`;
    return;
  }

  // intro
  const rackInCart = deal.racks[0];
  body.innerHTML = `${intro}${card}${rrgPackageSteps('rmp')}
    ${rackInCart ? `<p class="pkg-added">✓ You already have the <strong>${rrgEsc(rrgShortName(rackInCart.name))}</strong> in your cart, so the saving applies as soon as you add this ${acc}.</p>` : ''}`;
  foot.innerHTML = rackInCart
    ? `<button type="button" class="btn btn-cta btn-block" data-pkg-add-only>Add to cart</button>`
    : `<button type="button" class="btn btn-cta btn-block" data-pkg-add-choose>Add to cart &amp; choose your rack</button>
       <button type="button" class="btn btn-outline btn-block" data-pkg-add-only>Add to cart only</button>`;
}
function rrgOpenPackageDrawer() {
  rrgBuildPackageDrawer();
  rrgPackageStep = 'intro';
  rrgRenderPackageDrawer();
  const backdrop = document.getElementById('pkgDrawerBackdrop');
  backdrop.classList.add('open');
  backdrop.querySelector('.store-slideout-close').focus({ preventScroll: true });
}
function rrgClosePackageDrawer() {
  document.getElementById('pkgDrawerBackdrop')?.classList.remove('open');
}
document.addEventListener('click', e => { if (e.target.closest('[data-package-open]')) { e.preventDefault(); rrgOpenPackageDrawer(); } });
// Vehicle set from inside the drawer (Fit Finder) or region switched: redraw the open drawer.
['rrg-session-change', 'rrg-region-change'].forEach(evt => document.addEventListener(evt, () => {
  if (document.getElementById('pkgDrawerBackdrop')?.classList.contains('open')) rrgRenderPackageDrawer();
}));

// ---- Add to Cart, everywhere (one delegated handler) ----
// 1. Product cards (plpCardHTML — PLP family, Search, Home, VLP, store page): the button carries
//    its line as data-cart-item. If the PLP's "different vehicle" notice opened for it (plp.js runs
//    first, on the button), the item is still added but the notice stays in front.
// 2. PDP Add To Cart ([data-cta-label]: panel, sticky and persistent bars): read from the page.
// 3. PDP related-product cards (.product-card .btn-cta): read from the card.
function rrgPdpCartItem() {
  const panel = document.querySelector('.decision-panel') || document;
  const num = el => el ? Number(el.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
  const was = panel.querySelector('.price-was');
  const brandImg = panel.querySelector('.brand-logo');
  const parts = [...document.querySelectorAll('.package-items .package-item')].map(p =>
    `${p.querySelector('.pi-qty')?.textContent.trim().replace('x', '×')} ${p.querySelector('.pi-name')?.textContent.trim()} (${p.querySelector('.pi-sku')?.textContent.trim()})`);
  const img = document.getElementById('mainImg') || document.querySelector('.gallery-main img');
  return {
    sku: document.getElementById('skuValue')?.textContent.trim() || document.querySelector('h1').textContent.trim(),
    brand: brandImg ? brandImg.alt : (panel.querySelector('.brand-logo-text')?.textContent.trim() || ''),
    name: document.querySelector('h1').textContent.trim(),
    price: num(panel.querySelector('.price-now')),
    wasPrice: was && was.offsetParent ? num(was) : null,
    image: img ? img.src : '',
    url: location.pathname.split('/prototypes/')[1] || '#',
    parts: parts.length ? parts : undefined,
    fitsVehicle: document.querySelector('[data-fitment-slot]') ? 'hilux' : undefined,
    // Package Deal category, set per template on .cta-col (cart.js rrgPackageCategory); falls back to the name
    pkgCategory: document.querySelector('.cta-col[data-pkg-category]')?.dataset.pkgCategory
  };
}
document.addEventListener('click', e => {
  const card = e.target.closest('[data-cart-item]');
  if (card) {
    let item;
    try { item = JSON.parse(card.dataset.cartItem); } catch (err) { return; }
    const notice = document.getElementById('plpVehicleNotice');
    rrgCartAdd(item, { open: !(notice && !notice.hidden) });
    return;
  }
  const pdp = e.target.closest('[data-cta-label]');
  if (pdp) {
    if (pdp.disabled || !/add to cart/i.test(pdp.textContent)) return;
    rrgCartAdd(rrgPdpCartItem());
    return;
  }
  const related = e.target.closest('.product-card .btn-cta');
  if (related) {
    const c = related.closest('.product-card');
    const name = c.querySelector('h3')?.textContent.trim() || 'Product';
    rrgCartAdd({ sku: name, brand: '', name, price: Number((c.querySelector('.price')?.textContent || '0').replace(/[^0-9.]/g, '').split('.').slice(0, 2).join('.')) || 0,
      image: c.querySelector('img')?.src || '', url: '#' });
  }
});

// Header cart icon opens the mini-cart.
document.addEventListener('click', e => {
  const icon = e.target.closest('.rrg-cart');
  if (!icon) return;
  e.preventDefault();
  rrgOpenMiniCart(false);
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.rrg-cart')) { e.preventDefault(); rrgOpenMiniCart(false); }
});
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.rrg-cart').forEach(el => {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Open cart');
  });
  rrgCartSyncBadges();
});
// Another tab changed the cart.
window.addEventListener('storage', e => { if (e.key === RRG_CART_KEY) { rrgCartSyncBadges(); document.dispatchEvent(new CustomEvent('rrg-cart-change')); } });
