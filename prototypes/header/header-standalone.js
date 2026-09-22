// Standalone header logic for the isolated prototypes/header/ build (header-spec.md
// Section 8, build order item 1 — "not a rebuild from scratch," but also not pulling in the
// whole of shared.js, which assumes PDP-page elements that don't exist here and would also
// spin up the PDP-only Demo State Panel via its own DOMContentLoaded listener). This is a
// deliberately trimmed copy of the region-switcher/mobile-nav/sticky-header logic already
// live in prototypes/_shared/shared.js — same behaviour, scoped to what this page actually
// has. Once the header is integrated into the 5 PDP templates (a separate, later item),
// this can be retired in favour of the real shared.js functions it mirrors.

const REGION_LABELS = { AU: 'Australia', NZ: 'New Zealand', UK: 'United Kingdom' };
const REGION_FLAGS = { AU: '🇦🇺', NZ: '🇳🇿', UK: '🇬🇧' };
const REGION_SINGLE_STORES = {
  NZ: { name: 'Auckland' },
  UK: { name: 'Bolton' },
};
const RRG_LOGO = { src: '../_shared/headerlogo.png', alt: 'Roof Racks Galore' };
const UK_LOGO = { src: '../_shared/brand-roofbox-uk-logo.svg', alt: 'The Roof Box Company' };

function applyRegionNearestStore(region) {
  const link = document.querySelector('[data-region-nearest-store]');
  if (!link) return;
  if (!link.dataset.auStore) link.dataset.auStore = link.textContent;
  link.dataset.currentStoreName = region === 'AU' ? link.dataset.auStore : REGION_SINGLE_STORES[region].name;
  applyStoreSessionDisplay();
}

// "Nearest store set?" (Site Admin Panel, session-state.js) interacts with the region-driven
// store name above rather than being a simple on/off text swap, so it's handled here instead
// of in session-state.js's generic loop — re-applied both when region changes (name changes)
// and when the session toggle changes (rrg-session-change event, session-state.js).
function applyStoreSessionDisplay() {
  const link = document.querySelector('[data-region-nearest-store]');
  const label = document.querySelector('[data-session-store-label]');
  if (!link) return;
  const on = rrgSessionGet('storeSet');
  if (label) label.hidden = !on;
  link.textContent = on ? link.dataset.currentStoreName : 'Find A Store';
}

function applyRegionBrand(region) {
  document.body.classList.toggle('region-uk', region === 'UK');
  const logo = region === 'UK' ? UK_LOGO : RRG_LOGO;
  document.querySelectorAll('.rrg-logo img').forEach(img => {
    img.src = logo.src;
    img.alt = logo.alt;
  });
}

function applyRegion(region) {
  const flagEl = document.querySelector('[data-region-flag]');
  const labelEl = document.querySelector('[data-region-label]');
  if (flagEl) flagEl.textContent = REGION_FLAGS[region];
  if (labelEl) labelEl.textContent = REGION_LABELS[region];
  document.querySelectorAll('.region-switcher-menu a').forEach(a => {
    a.classList.toggle('current', a.dataset.region === region);
  });
  applyRegionNearestStore(region);
  applyRegionBrand(region);
}

function initRegionSwitcher() {
  const wrap = document.querySelector('.region-switcher');
  if (!wrap) return;
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
      wrap.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
  applyRegion('AU');
}

// Mobile menu — opens the full-screen takeover (.mm-mobile-takeover, built into
// prototypes/header/index.html; content populated by buildMegaMenuMobile() in mega-menu.js),
// not the old .rrg-nav slide-down drawer (Brenton, 2026-09-13: that drawer stayed put while
// scrolling past it detached from the sticky header, since it wasn't part of the same
// self-contained unit — the takeover fixes this by being position:fixed to the full viewport,
// with its own logo/login/vehicle/search, independent of the real header's scroll position
// entirely). .rrg-nav's own mobile-drawer CSS (shared.css) is left as-is, unused here — it's
// still what the 5 PDP templates' own placeholder header uses for their simpler mobile nav.
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

// Header search typeahead demo — kept identical to shared.js's copy (see the comment there for
// full rationale); this prototype intentionally doesn't load shared.js, so it's duplicated here
// rather than adding a new shared <script> tag across every template just for this.
const HEADER_SEARCH_SUGGEST_BATCHES = [
  [
    { name: 'Rhino Rack 62112 Pioneer Platform (1500mm x 1240mm)', price: '$1,750.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/R/h/Rhino-Rack-62112-Platforms--Trays._1.jpg' },
    { name: 'Rhino Rack Vortex 2 Bar Cross Bar Set', price: '$389.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/R/h/Rhino-Rack-RTS556-Tracks._1_6.jpg' },
    { name: 'Front Runner Slimline II Flush Bar Kit', price: '$409.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/F/r/Front-Runner-KRTH011T_1.jpg' },
    { name: 'Front Runner Slimsport Roof Rack Kit', price: '$169.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/F/r/Front-Runner-KSTH005T_1.jpg' },
    { name: 'Thule SmartRack XT Silver 2 Bar Roof Rack', price: '$379.95', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/T/h/Thule-730402-Roof-Rack---Bars--Legs._1_269.jpg' },
    { name: 'Thule SquareBar Evo Black 2 Bar Roof Rack', price: '$100.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/6/7/67f3ebae007f4dc440e6d7c9c380b13c0a05a4cdb52799f3c4089349d9f0cac0_7UE16W_1.jpg' },
  ],
  [
    { name: 'Thule FreeRide 532 Silver Roof Mounted Bike Carrier x1', price: '$218.45', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/T/h/Thule-532002-Bike-Rack---Roof-Mount._1_2.jpg' },
    { name: 'Rhino-Rack Hang-On 2 Bike Tow Ball Carrier', price: '$349.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/R/h/Rhino-Rack-RBC050-Bike-Rack---Roof-Mount._1_1.jpg' },
    { name: 'Yakima FrontLoader Roof Wheel-Support Carrier', price: '$259.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/y/a/yakima-frontloader-black-roof-mounted-bike-carrier-x-1-8002104.jpg' },
    { name: 'Front Runner Bike Mount / Motus Black', price: '$349.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/f/r/front-runner-bike-mount-motus-black-rrac371.jpg' },
    { name: 'ROLA Vertical Bike Rack — 5 Bike Carrier', price: '$949.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/9/4/944fad617fe3cd096ec8e57f6739b9be_G266QQ_1.jpg' },
    { name: 'Thule ProRide 598 Silver Roof Mounted Bike Carrier', price: '$329.00', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/t/h/thule-598001-bike-rack-roof-mount.jpg' },
  ],
  [
    { name: 'Yakima RoadShower MD 26L', price: '$411.50', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/Y/a/Yakima-8004110-Camping._1_1.webp' },
    { name: 'Darche Ranger Solo + Swag', price: '$299.00', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/d/a/darche-ranger-solo-050801183r.webp' },
    { name: 'MSA Half Pack Cargo Bag', price: '$239.00', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/M/S/MSA-HP1.4-Roof-Top-Bags._1_1.webp' },
    { name: 'Darche ECO Bamboo Dinner Set 12Pc', price: '$48.70', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/D/a/Darche-T050802930-Camping._1.webp' },
    { name: 'Stedi FX3300 LED Torch', price: '$149.00', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/S/t/Stedi-TORCH-FX3300-Lighting._1.webp' },
    { name: 'EcoXGear EcoExtreme 2 Grey', price: '$109.95', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/e/c/ecoxgear-ecoextreme-2-grey-gdi-ex3w210.webp' },
  ],
];

function headerSearchSuggestRowsHTML(query) {
  const batch = HEADER_SEARCH_SUGGEST_BATCHES[Math.floor(query.length / 2) % HEADER_SEARCH_SUGGEST_BATCHES.length];
  return `
    <div class="rrg-search-suggest-label">Popular Products</div>
    ${batch.map(p => `
      <div class="rrg-search-suggest-row">
        <img src="${p.image}" alt="" loading="lazy">
        <span class="rrg-search-suggest-name">${p.name}</span>
        <span class="rrg-search-suggest-price">${p.price}</span>
      </div>
    `).join('')}
  `;
}

function initHeaderSearchSuggest() {
  document.querySelectorAll('.rrg-search, .mm-mobile-search').forEach(wrap => {
    const input = wrap.querySelector('input');
    if (!input) return;
    const panel = document.createElement('div');
    panel.className = 'rrg-search-suggest';
    panel.hidden = true;
    document.body.appendChild(panel);
    const position = () => {
      const r = wrap.getBoundingClientRect();
      panel.style.top = `${r.bottom + 4}px`;
      panel.style.left = `${r.left}px`;
      panel.style.width = `${r.width}px`;
    };
    const hide = () => { panel.hidden = true; };
    const sync = () => {
      const query = input.value.trim();
      if (!query) { hide(); return; }
      panel.innerHTML = headerSearchSuggestRowsHTML(query);
      position();
      panel.hidden = false;
    };
    input.addEventListener('input', sync);
    input.addEventListener('focus', sync);
    input.addEventListener('blur', () => setTimeout(hide, 150));
    input.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
    window.addEventListener('resize', () => { if (!panel.hidden) position(); });
    window.addEventListener('scroll', () => { if (!panel.hidden) position(); }, true);
  });
}

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

document.addEventListener('rrg-session-change', applyStoreSessionDisplay);

document.addEventListener('DOMContentLoaded', () => {
  initRegionSwitcher();
  initMobileNav();
  initSearchClear();
  initHeaderSearchSuggest();
  initPersistentBar('.rrg-search', '.rrg-sticky-header');
  initMegaMenu();
  buildSiteAdminPanel('header');
  rrgApplySessionState();
});
