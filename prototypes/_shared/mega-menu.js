// Header & Mega Menu — builds the desktop 3-level hover cascade and the mobile full-screen
// drill-down from HEADER_NAV (nav-data.js), and wires the "Products" toggle. See
// header-spec.md Section 3.6 for the confirmed design this implements.

const MM_CHEVRON = '<svg class="mm-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
const MM_BACK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
const MM_CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
// The mobile takeover's root screen isn't part of the plain nav's flat link list any more
// (Brenton, 2026-09-13: "Products" shouldn't be its own tab, the category list should just
// be the root) — these 4 are hand-mirrored from the plain nav links in prototypes/header/
// index.html since that markup is static HTML, not JS-driven data. Keep in sync if their
// hrefs/labels ever change there.
const MM_MOBILE_UTILITY_LINKS = [
  { label: 'Store Finder', href: '#' },
  { label: 'Fit My Vehicle', href: '#' },
  { label: 'Catalogue', href: '#' },
  { label: 'Services', href: '#' },
];
// Level-1 category icons (header-spec.md Section 8, build-order item 4) — Brenton supplied a
// real set 2026-09-13, but not one per category yet: only 5 of the 7 icon-bearing categories
// (Brands gets no icon, yellow bar only) have a specific asset so far. Missing ones fall back
// to the generic roof-bars icon rather than guessing at art that doesn't exist — swap
// MM_CATEGORY_ICONS in as real icons for Water & Snow Sports / Camping & Offroad get sourced.
// "Roof Top Type.png" is the real filename for the Awnings & Roof Top Tents icon (a tent
// shape, not a roof-bars variant like the others) — kept its own key since the source
// filename doesn't match the category label the way the others do.
const MM_ICON_FALLBACK = '../_shared/icons/fallback.png';
const MM_CATEGORY_ICONS = {
  'Roof Racks': '../_shared/icons/roof-racks.png',
  'Bike Racks': '../_shared/icons/bike-racks.png',
  'Platforms & Trays': '../_shared/icons/platforms-trays.png',
  'Roof Boxes & Cargo': '../_shared/icons/roof-boxes-cargo.png',
  'Awnings & Roof Top Tents': '../_shared/icons/roof-top-type.png',
};
function mmCategoryIconSrc(label) {
  return MM_CATEGORY_ICONS[label] || MM_ICON_FALLBACK;
}

// Merchandising promo tile (the red bar pinned to the bottom of Level 2/3) is per-entity, not
// a global default with a placeholder fallback (Brenton, 2026-09-13): Level 2's tile comes
// from the Level 1 *category's* own promoTile, Level 3's from that specific Level 2 *column's*
// own promoTile — independently assignable in Magento (dev-brief note: needs an image + a
// heading + a CTA link field on both the category and the column/grouping entities). If an
// entity has no promoTile configured, the whole bar doesn't render for it at all — no
// fallback image/copy, matching how it'll behave once real Magento data drives this.
function mmPromoTileHTML(promoTile) {
  if (!promoTile) return '';
  const p = promoTile;
  return `<a class="mega-menu-promo" href="${p.href || '#'}">
    <span class="mega-menu-promo-img">${p.image ? `<img src="${p.image}" alt="">` : 'Image<br>pending'}</span>
    <span class="mega-menu-promo-text"><span class="mega-menu-promo-eyebrow">${p.eyebrow || 'New Product Release'}</span><strong>${p.label || ''}</strong></span>
  </a>`;
}

// Clearance/sale banner (Level 1's top strip) swaps between two real creatives rather than a
// single banner that just disappears when off (Brenton, 2026-09-13, after supplying real
// assets): the sale creative while a sale is actually on, a fallback evergreen creative
// (e.g. Store Finder promo) the rest of the time — never blank. Admin-toggleable, persisted
// the same way as the Demo State Panel visibility toggle (admin-panel.js) — read directly
// here rather than depending on load order between the two files, since only the Site Admin
// Panel's checkbox needs to call rrgSetSaleBannerOn (on user interaction, well after both
// scripts have run).
const MM_SALE_BANNER_KEY = 'rrgSaleBannerOn';
const MM_SALE_BANNER_SRC = '../_shared/sale-banner.png';
const MM_SALE_BANNER_FALLBACK_SRC = '../_shared/sale-banner-fallback.png';
// `src` is set by mmApplySaleBannerVisibility() right after this markup is inserted (both
// desktop and mobile) — kept out of this string so there's one place deciding which image.
const MM_BANNER_HTML = '<a class="mega-menu-banner" href="#"><img alt="Sale"></a>';
function mmIsSaleBannerOn() {
  const v = localStorage.getItem(MM_SALE_BANNER_KEY);
  return v === null ? true : v === 'true';
}
function mmApplySaleBannerVisibility() {
  const src = mmIsSaleBannerOn() ? MM_SALE_BANNER_SRC : MM_SALE_BANNER_FALLBACK_SRC;
  document.querySelectorAll('.mega-menu-banner img').forEach(img => { img.src = src; });
}
window.rrgSetSaleBannerOn = (on) => {
  localStorage.setItem(MM_SALE_BANNER_KEY, on);
  mmApplySaleBannerVisibility();
};

// Desktop — one shared full-width drawer (header-spec.md Section 3.6, restructured
// 2026-09-13 per Brenton's direction): Level 1 is a static sidebar; Level 2 and Level 3 are
// independent columns whose *content* swaps on hover/focus of an L1/L2 row, rather than each
// L1 row carrying its own nested flyout. This is what makes L2/L3 always occupy the full
// drawer height regardless of which row is hovered (a nested-flyout anchored to the row
// itself can't do that — it starts wherever that row sits). Drawer height is pinned to L1's
// natural content height (fixed, 8 categories + banner) via syncDrawerHeight(); L2/L3 scroll
// internally past that, with their promo tile pinned to the bottom via flex-column layout.
function mmLevel1RowHTML(cat, i) {
  const isBrands = i === HEADER_NAV.length - 1;
  return `
    <div class="mega-menu-l1-item${isBrands ? ' mega-menu-l1-item--brand' : ''}" data-cat="${i}" tabindex="0">
      ${isBrands ? '' : `<span class="mm-icon"><img src="${mmCategoryIconSrc(cat.label)}" alt=""></span>`}
      <span class="mm-label">${isBrands ? 'Shop By Brand' : cat.label}</span>
      ${MM_CHEVRON}
    </div>`;
}

function mmLevel2ColumnHTML(cat) {
  const rows = cat.columns.map((col, i) => `
    <div class="mega-menu-l2-row" data-col="${i}" tabindex="0">
      <span>Shop ${col.heading}</span>${MM_CHEVRON}
    </div>`).join('');
  return `
    <div class="mega-menu-l2-head">${cat.label}</div>
    <div class="mega-menu-l2-body${cat.promoTile ? ' has-promo' : ''}">
      ${rows}
      <a class="mega-menu-l2-row mm-viewall" href="${cat.href}">View All</a>
    </div>
    ${mmPromoTileHTML(cat.promoTile)}`;
}

// Level 3 links are split into 2 CSS columns rather than scrolling (Brenton, 2026-09-13) —
// they're plain text, so most real columns (up to ~17 links) comfortably fit two columns
// within the drawer's fixed height. `.mega-menu-l3-body` keeps `overflow-y:auto` as a safety
// net, not the primary mechanism: Brands' Vehicle Makes list (~70 entries) still overflows
// even 2 columns and will scroll — flagged as a known exception, not silently "fixed".
function mmLevel3ColumnHTML(col) {
  if (!col) return '';
  const links = col.links.map(l => `<a href="${l.href}">${l.label}</a>`).join('');
  return `
    <div class="mega-menu-l3-head">${col.heading}</div>
    <div class="mega-menu-l3-body${col.promoTile ? ' has-promo' : ''}">
      <div class="mega-menu-l3-links">${links}</div>
      <a href="#" class="mm-viewall">View All ${col.heading}</a>
    </div>
    ${mmPromoTileHTML(col.promoTile)}`;
}

function buildMegaMenuDesktop(root) {
  const l1El = root.querySelector('.mega-menu-l1');
  const l2El = root.querySelector('.mega-menu-l2');
  const l3El = root.querySelector('.mega-menu-l3');
  const state = { catIndex: 0, colIndex: 0 };

  l1El.innerHTML = `
    ${MM_BANNER_HTML}
    ${HEADER_NAV.map(mmLevel1RowHTML).join('')}
  `;
  mmApplySaleBannerVisibility();

  // Level 1's own row height is the reference every "top strip" element (the sale banner,
  // the Level 2 head, the Level 3 head) is pinned to, so they all line up as one continuous
  // strip across the drawer (Brenton, 2026-09-13) — measured from a real rendered row rather
  // than hardcoded, same reasoning as syncDrawerHeight() below. Re-run whenever L2/L3 rebuild
  // their head (innerHTML swap loses the inline height each time).
  function syncRowHeight() {
    const row = l1El.querySelector('.mega-menu-l1-item:not(.mega-menu-l1-item--brand)');
    if (!row) return;
    const h = row.getBoundingClientRect().height;
    if (h <= 0) return;
    const px = h + 'px';
    const banner = l1El.querySelector('.mega-menu-banner');
    if (banner) banner.style.height = px;
    const l2head = l2El.querySelector('.mega-menu-l2-head');
    if (l2head) l2head.style.height = px;
    const l3head = l3El.querySelector('.mega-menu-l3-head');
    if (l3head) l3head.style.height = px;
  }

  function renderL3() {
    const cat = HEADER_NAV[state.catIndex];
    l3El.innerHTML = mmLevel3ColumnHTML(cat.columns[state.colIndex]);
    l2El.querySelectorAll('.mega-menu-l2-row[data-col]').forEach(el => {
      el.classList.toggle('active', Number(el.dataset.col) === state.colIndex);
    });
    syncRowHeight();
  }

  function renderL2() {
    const cat = HEADER_NAV[state.catIndex];
    l2El.innerHTML = mmLevel2ColumnHTML(cat);
    l1El.querySelectorAll('.mega-menu-l1-item').forEach(el => {
      el.classList.toggle('active', Number(el.dataset.cat) === state.catIndex);
    });
    l2El.querySelectorAll('.mega-menu-l2-row[data-col]').forEach(row => {
      const activate = () => { state.colIndex = Number(row.dataset.col); renderL3(); };
      row.addEventListener('mouseenter', activate);
      row.addEventListener('focus', activate);
    });
    state.colIndex = 0;
    renderL3();
    syncRowHeight();
  }

  l1El.querySelectorAll('.mega-menu-l1-item[data-cat]').forEach(row => {
    const activate = () => { state.catIndex = Number(row.dataset.cat); renderL2(); };
    row.addEventListener('mouseenter', activate);
    row.addEventListener('focus', activate);
  });

  renderL2();

  function syncDrawerHeight() {
    const h = l1El.getBoundingClientRect().height;
    if (h > 0) { l2El.style.height = h + 'px'; l3El.style.height = h + 'px'; }
    syncRowHeight();
  }
  syncDrawerHeight();
  window.addEventListener('resize', syncDrawerHeight);
  root.closest('.mega-menu').addEventListener('mm-open', syncDrawerHeight);
}

// Mobile — a full-screen takeover (rebuilt 2026-09-13, header-spec.md Section 3.6, per
// Brenton's direction — see Mega Menu Designs/Mega Menu - Final - Level 1 - Mob.png), not a
// drawer nested inside the scrolling page. Screen state is just two indices; re-rendered on
// every tap rather than pre-building every screen up front.
//
// Renamed Level 1/2/3 → Level 0/1/2 for this mobile hierarchy specifically (Brenton,
// 2026-09-13): the category list is the *root* screen here — there's no separate "Products"
// tab gating it — so it doesn't map onto desktop's Level 1 (which sits *inside* a Products
// trigger). Content-wise Level 0 here = desktop's Level 1, mobile Level 1 = desktop's Level 2,
// mobile Level 2 = desktop's Level 3 — the "0" just accounts for mobile's extra root screen
// (utility row, search, the 4 plain nav links) that desktop's sidebar doesn't need a level
// number for at all.
//
// Only Level 0 shows the takeover's static topbar (logo/login/vehicle) and search bar — set
// via a `data-screen` attribute on .mm-mobile-takeover, read by mega-menu.css. Levels 1/2 use
// the simpler back+title bar instead (matching the Figma's Level 2/3 mobile screens), with its
// own close button since the topbar's close button isn't visible on those screens.
function buildMegaMenuMobile(mobileEl) {
  const state = { catIndex: null, colIndex: null };
  const takeover = mobileEl.closest('.mm-mobile-takeover');
  const setScreen = (n) => { if (takeover) takeover.dataset.screen = n; };

  function closeBtnHTML() {
    return `<button type="button" class="mm-mobile-close mm-mobile-head-close" data-close="1" aria-label="Close menu">${MM_CLOSE_ICON}</button>`;
  }
  function wireClose() {
    const btn = mobileEl.querySelector('[data-close]');
    if (btn) btn.addEventListener('click', () => { if (takeover) takeover.classList.remove('open'); });
  }

  function renderLevel0() {
    setScreen(0);
    mobileEl.classList.remove('has-promo');
    mobileEl.innerHTML = `
      ${MM_BANNER_HTML}
      ${HEADER_NAV.map((cat, i) => {
        const isBrands = i === HEADER_NAV.length - 1;
        return `
      <div class="mm-mobile-row${isBrands ? ' mm-mobile-row--brand' : ''}" data-cat="${i}">
        <span class="mm-mobile-row-label">${isBrands ? '' : `<span class="mm-icon"><img src="${mmCategoryIconSrc(cat.label)}" alt=""></span>`}<span>${isBrands ? 'Shop By Brand' : cat.label}</span></span>
        ${MM_CHEVRON}
      </div>`;
      }).join('')}
      <div class="mm-mobile-utility-links">
        ${MM_MOBILE_UTILITY_LINKS.map(l => `<a class="mm-mobile-row" href="${l.href}">${l.label}</a>`).join('')}
      </div>
    `;
    mobileEl.querySelectorAll('[data-cat]').forEach(row => {
      row.addEventListener('click', () => { state.catIndex = Number(row.dataset.cat); renderLevel1(); });
    });
    mmApplySaleBannerVisibility();
  }

  function renderLevel1() {
    setScreen(1);
    const cat = HEADER_NAV[state.catIndex];
    mobileEl.innerHTML = `
      <div class="mm-mobile-head">
        <button type="button" class="mm-mobile-back" data-back="1">${MM_BACK_ICON}</button>
        <span class="mm-mobile-title">${cat.label}</span>
        ${closeBtnHTML()}
      </div>
      ${cat.columns.map((col, i) => `
      <div class="mm-mobile-row" data-col="${i}">
        <span>Shop ${col.heading}</span>${MM_CHEVRON}
      </div>`).join('')}
      <a class="mm-mobile-row mm-viewall" href="${cat.href}">View All</a>
      ${mmPromoTileHTML(cat.promoTile)}
    `;
    mobileEl.classList.toggle('has-promo', !!cat.promoTile);
    mobileEl.querySelector('[data-back]').addEventListener('click', renderLevel0);
    mobileEl.querySelectorAll('[data-col]').forEach(row => {
      row.addEventListener('click', () => { state.colIndex = Number(row.dataset.col); renderLevel2(); });
    });
    wireClose();
  }

  function renderLevel2() {
    setScreen(2);
    const cat = HEADER_NAV[state.catIndex];
    const col = cat.columns[state.colIndex];
    mobileEl.innerHTML = `
      <div class="mm-mobile-head">
        <button type="button" class="mm-mobile-back" data-back="1">${MM_BACK_ICON}</button>
        <span class="mm-mobile-title">${cat.label}</span>
        ${closeBtnHTML()}
      </div>
      <div class="mm-mobile-subrow">Shop ${col.heading}${MM_CHEVRON}</div>
      ${col.links.map(l => `<a class="mm-mobile-leaf" href="${l.href}">${l.label}</a>`).join('')}
      <a class="mm-mobile-leaf mm-viewall" href="#">View All ${col.heading}</a>
      ${mmPromoTileHTML(col.promoTile)}
    `;
    mobileEl.classList.toggle('has-promo', !!col.promoTile);
    mobileEl.querySelector('[data-back]').addEventListener('click', renderLevel1);
    wireClose();
  }

  window.rrgResetMobileMenu = renderLevel0;
  renderLevel0();
}

function initMegaMenu() {
  const menu = document.querySelector('.mega-menu');
  if (!menu) return;
  const toggle = menu.querySelector('.mega-menu-toggle');
  const drawer = menu.querySelector('.mega-menu-drawer-inner');
  // .mega-menu-mobile now lives inside .mm-mobile-takeover (index.html), not nested in
  // .mega-menu — it's the mobile full-screen takeover's content area, opened by the
  // hamburger (header-standalone.js initMobileNav()), not by this "Products" toggle.
  const mobile = document.querySelector('.mega-menu-mobile');
  if (!toggle || !drawer || !mobile) return;

  buildMegaMenuDesktop(drawer);
  buildMegaMenuMobile(mobile);

  // Backdrop dims the rest of the page while the menu is open, so focus stays on the header
  // + drawer (Brenton, 2026-09-13). Lives at body level (not inside .mega-menu) since it
  // needs to cover the whole viewport — .rrg-utility-bar/.rrg-main-header get a z-index above
  // it in shared.css so the header (and the drawer, its descendant) stay undimmed; everything
  // else in normal page flow, with no z-index, sits below it. Clicking it closes the menu via
  // the existing document click-outside handler below (the backdrop isn't inside .mega-menu,
  // so its clicks aren't stopped by menu's own stopPropagation).
  const backdrop = document.createElement('div');
  backdrop.className = 'mega-menu-backdrop';
  document.body.appendChild(backdrop);

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    backdrop.classList.toggle('visible', open);
    // .mega-menu-l1 has height:0 while the drawer is display:none, so the height measured
    // at build time is 0 — re-measure once it's actually visible so L2/L3 get pinned to
    // L1's real height, not 0.
    if (open) menu.dispatchEvent(new Event('mm-open'));
  });
  menu.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    backdrop.classList.remove('visible');
  });
}
