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
    image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/e/7/e775e3debebdc8ba3b70b79f87a0a59466cb68e1b3800433f011a483b3fc2679_1_26.jpg', url: 'vehicle-specific/index.html', fitsVehicle: 'hilux' },
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
  full: ['platformKit', 'bikeRack', 'showerBundle', 'waterTank']
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
function rrgCartTotals(cart = rrgCartGet(), method = null) {
  const rc = rrgRegionCheckout();
  const subtotal = cart.lines.reduce((n, l) => n + l.price * l.qty, 0);
  const was = cart.lines.reduce((n, l) => n + (l.wasPrice || l.price) * l.qty, 0);
  const opt = rc.delivery.find(d => d.key === method);
  const delivery = method === 'collect' ? 0 : opt ? opt.price : null;
  const total = subtotal + (delivery || 0);
  return { count: rrgCartCount(cart), subtotal, savings: Math.max(0, was - subtotal), delivery, total, tax: total * rc.taxFraction, taxName: rc.taxName };
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
    ${t.savings > 0 ? `<p class="mini-cart-savings">You're saving ${rrgMoney(t.savings)}</p>` : ''}
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
    fitsVehicle: document.querySelector('[data-fitment-slot]') ? 'hilux' : undefined
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
