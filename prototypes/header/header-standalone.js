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
// DUPLICATE of shared.js's copy — this standalone header prototype intentionally doesn't load
// shared.js, so keep the two in step when either changes.
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
  { type: 'page', title: 'Fit My Vehicle', image: '../_shared/vehicle-ford-ranger.png', imageStandIn: true, desc: 'Tell us your vehicle and see only the roof racks, platforms and accessories that fit it.', href: RRG_LIVE_URL + '/fit-my-vehicle', kw: 'fit my vehicle fitment finder roof racks platforms crossbars bars car ute 4wd', cta: true },
  { type: 'vehicle', title: 'Toyota Hilux Roof Racks', image: '../_shared/vehicle-toyota-hilux.webp', desc: 'Every roof rack, platform and crossbar that fits the Hilux N70, N80 and N90.', href: '../vehicle-category-landing/index.html', kw: 'toyota hilux roof racks platforms crossbars bars n70 n80 n90', vehicle: 'toyota hilux', cta: true },
  { type: 'category', title: 'Roof Racks for Toyota Hilux N80', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/e/7/e775e3debebdc8ba3b70b79f87a0a59466cb68e1b3800433f011a483b3fc2679_1_20.jpg', imageStandIn: true, desc: 'Roof racks for the 2015–2026 Hilux 4dr Ute with bare roof.', href: '../vplp/index.html', kw: 'roof racks platforms crossbars bars toyota hilux n80', vehicle: 'toyota hilux' },
  { type: 'category', title: 'Bike Racks', image: 'https://www.roofracksgalore.com.au/pub/media/catalog/product/cache/7523b1877f1a63c7cb82ba8541af57bb/T/h/Thule-532002-Bike-Rack---Roof-Mount._1_2.jpg', imageStandIn: true, desc: 'Roof-mounted, tow ball and rear-mounted bike carriers.', href: '../plp/index.html', kw: 'bike racks bike carriers roof mounted tow ball bicycle' },
  { type: 'category', title: 'Camping Gear', image: 'https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/240x240/pub/media/catalog/product/d/a/darche-ranger-solo-050801183r.webp', imageStandIn: true, desc: 'Tents, swags, camp furniture and camp site essentials.', href: '../plp-camping/index.html', kw: 'camping gear tents swags camp furniture' },
  { type: 'page', title: 'Find a Store', image: '../_shared/installer.png', imageStandIn: true, desc: '35 stores nationwide, with opening hours, directions and fitting bays.', href: RRG_LIVE_URL + '/locations', kw: 'find a store stores locations near me opening hours showroom fitting', cta: true },
  { type: 'page', title: 'Warranty', desc: 'How warranty claims work for the products we sell.', href: RRG_LIVE_URL + '/warranty', kw: 'warranty claims guarantee' },
  { type: 'page', title: 'Shipping & Delivery', desc: 'Delivery options, timeframes and costs.', href: RRG_LIVE_URL + '/delivery', kw: 'shipping delivery freight postage' },
  { type: 'page', title: 'Refund & Exchange', desc: 'Our returns, refunds and exchange policy.', href: RRG_LIVE_URL + '/returns', kw: 'refund returns exchange' },
  { type: 'article', topic: 'Roof Racks', title: 'Do you offer an installation service?', image: '../_shared/installer.png', imageStandIn: true, desc: 'All of our stores offer professional installation for roof racks and vehicle accessories.', href: RRG_HELP_URL + 'do-you-offer-an-installation-service-uru7hc/', kw: 'installation install fitting service roof racks' },
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

function rrgBrandUrl(brand) {
  return `${RRG_LIVE_URL}/brands/brands/${brand.slug}`;
}

// Prototype-relative hrefs ("../plp/index.html") are resolved against the current page so they
// work from every template; live-site/help-centre links open in a new tab since they leave the
// prototype.
function rrgSearchLinkAttrs(href) {
  const external = /^https?:/.test(href);
  return external
    ? `href="${href}" target="_blank" rel="noopener"`
    : `href="${new URL(href, window.location.href).href}"`;
}

// ==== Header search dropdown ===================================================================
// Two states. Box focused but empty: Recent / Trending / Popular Categories chips (2026-09-22).
// 1+ characters typed (reworked 2026-09-29 on Brenton's ask, modelled on Supercheap Auto's
// search): a "Search for '<query>'" row across the top (same as pressing Enter), then two
// columns — Popular searches / Looking for these brands? / Pages that might be interesting on
// the left, matching products on the right. Everything in it is matched against the typed text
// for real (rrgSearch*For above), unlike the 2026-09-22 version's rotating canned batches. The
// panel collapses to one stacked column when it's narrower than 640px (mobile takeover).
//
// Recent Searches is a fixed canned list (session-based in production — each shopper's own),
// with a Clear action that hides it for this page view only. Trending and Popular Categories are
// merchandiser-controlled in production.
// Trending (2026-09-29) = the real top searches from Algolia, shown in the 2026-09-24 meeting:
// U-Bolts by a long way, then Roof Boxes and Light Bars; "Rhino Rack tie down" was in the
// "searches without results" report, so it's worth fixing in Algolia too. Every term here was
// checked as a real category/search first — don't add one without doing the same (2026-09-22:
// the client's team caught invented terms like "snorkels" and "dual battery kits").
const HEADER_SEARCH_RECENT = ['Roof Rack for Hilux', 'Bike Rack', 'Thule Bars'];
const HEADER_SEARCH_TRENDING = ['U-Bolts', 'Roof Boxes', 'Light Bars', 'Rhino Rack Tie Downs'];
const HEADER_SEARCH_POPULAR_CATEGORIES = [
  { label: 'Roof Racks', href: '../vplp/index.html' },
  { label: 'Bike Racks', href: '../plp/index.html' },
  { label: 'Camping Gear', href: '../plp-camping/index.html' },
];

// Resolved against the current page's own URL (not a hardcoded "../search-results/..." string)
// so this works unchanged from every template regardless of folder depth.
function headerSearchResultsUrl(query) {
  return new URL(`../search-results/index.html?${new URLSearchParams({ q: query })}`, window.location.href).href;
}

function headerSearchFocusHTML(recentCleared) {
  return `
    ${recentCleared ? '' : `
      <div class="rrg-search-suggest-section">
        <div class="rrg-search-suggest-section-head">
          <span>Recent Searches</span>
          <button type="button" class="rrg-search-suggest-clear" data-clear-recent>Clear</button>
        </div>
        <div class="rrg-search-suggest-chips">
          ${HEADER_SEARCH_RECENT.map(term => `<a class="rrg-search-suggest-chip" href="${headerSearchResultsUrl(term)}">${term}</a>`).join('')}
        </div>
      </div>
    `}
    <div class="rrg-search-suggest-section">
      <div class="rrg-search-suggest-section-head"><span>Trending Searches</span></div>
      <div class="rrg-search-suggest-chips">
        ${HEADER_SEARCH_TRENDING.map(term => `<a class="rrg-search-suggest-chip" href="${headerSearchResultsUrl(term)}">${term}</a>`).join('')}
      </div>
    </div>
    <div class="rrg-search-suggest-section">
      <div class="rrg-search-suggest-section-head"><span>Popular Categories</span></div>
      <div class="rrg-search-suggest-chips">
        ${HEADER_SEARCH_POPULAR_CATEGORIES.map(c => `<a class="rrg-search-suggest-chip" href="${new URL(c.href, window.location.href).href}">${c.label}</a>`).join('')}
      </div>
    </div>
  `;
}

function headerSearchTypingHTML(query) {
  const queries = rrgSearchQueriesFor(query).slice(0, 5);
  const brands = rrgSearchBrandsFor(query).slice(0, 3);
  const pages = rrgSearchPagesFor(query).slice(0, 5);
  const matchedProducts = rrgSearchProductsFor(query).slice(0, 5);
  // Nothing matched: fall back to a generic "popular right now" set rather than an empty
  // column (Supercheap does the same).
  const products = matchedProducts.length ? matchedProducts : RRG_SEARCH_SUGGEST_PRODUCTS.slice(0, 4);
  const listSection = (title, items) => items.length ? `
    <div class="rrg-search-suggest-group">
      <div class="rrg-search-suggest-coltitle">${title}</div>
      ${items.join('')}
    </div>` : '';
  const left = [
    listSection('Popular searches', queries.map(s => `<a class="rrg-search-suggest-link" href="${headerSearchResultsUrl(s)}">${rrgEscapeHTML(s)}</a>`)),
    listSection('Looking for these brands?', brands.map(b => `<a class="rrg-search-suggest-link" ${rrgSearchLinkAttrs(rrgBrandUrl(b))}>${b.name}</a>`)),
    listSection('Pages that might be interesting', pages.map(p => `<a class="rrg-search-suggest-link" ${rrgSearchLinkAttrs(p.href)}>${rrgEscapeHTML(p.title)}</a>`))
  ].join('');
  return `
    <a class="rrg-search-suggest-searchfor" href="${headerSearchResultsUrl(query)}">Search for <strong>${rrgEscapeHTML(query)}</strong></a>
    <div class="rrg-search-suggest-cols${left ? '' : ' is-single'}">
      ${left ? `<div class="rrg-search-suggest-col">${left}</div>` : ''}
      <div class="rrg-search-suggest-col rrg-search-suggest-col-products">
        <div class="rrg-search-suggest-coltitle">${matchedProducts.length ? 'Products' : 'Popular right now'}</div>
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
        <a class="rrg-search-suggest-viewall" href="${headerSearchResultsUrl(query)}">View All Results</a>
      </div>
    </div>
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
    // Typing state is wider than the box itself (two columns need the room), capped to the
    // viewport. The desktop box sits at the right of the header, so the extra width grows
    // leftwards — right edge stays aligned with the box's right edge. The empty focus state
    // stays box-width.
    const position = () => {
      const r = wrap.getBoundingClientRect();
      const typing = !!input.value.trim();
      const width = typing ? Math.min(Math.max(r.width, 760), window.innerWidth - 32) : r.width;
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

// Fit Finder drawer — DUPLICATE of shared.js's copy (this standalone header prototype doesn't
// load shared.js; keep the two in step). Original notes:
// a site-wide, right-edge slide-out version of the
// Vehicle Category Landing Page's Fit Finder widget (same .fit-finder-widget look, fields
// stacked for the drawer's width), so "set your vehicle" can be answered from wherever it's
// asked instead of sending the shopper elsewhere. Any element with [data-open-fit-finder] opens
// it (delegated, so links rendered later — product-card tooltips, the search strip, the Add to
// Cart notice — work too); the header's vehicle link and the PLP-family pages' Set/Change
// Vehicle buttons are wired up to it here as well. Same backdrop/drawer convention as the Store
// slide-out (.store-slideout*), its own instance.
// Demo: Make/Model are fixed to Toyota Hilux, like the landing page's own widget — the only
// vehicle this prototype's session knows (session-state.js). "View Results" sets that session
// vehicle and closes; production has full make/model cascades and real results routing.
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
        <section class="fit-finder-widget">
          <div class="ff-head">
            <span class="ff-badge"><svg viewBox="0 0 27 22" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#vi-clip-ffdrawer)"><path d="M24.9152 14.5953V14.0848C24.9152 12.0661 23.2893 10.4418 21.2815 10.4418C20.6739 10.4418 20.1127 10.1054 19.8234 9.56589L17.8676 5.97512C17.5726 5.43563 17.0113 5.10498 16.4038 5.10498L5.13237 5.12238C4.63477 5.12238 4.1603 5.34862 3.84206 5.73728L1.51025 8.60874C0.567114 9.76892 0.248877 11.3236 0.653906 12.7622L1.17466 14.6185C0.931641 14.7055 0.705981 14.8505 0.520825 15.0362C0.191016 15.3668 0.00585938 15.8193 0.00585938 16.2892C0.00585938 17.2637 0.792773 18.0584 1.76484 18.0584H2.66748C2.66748 18.1165 2.66748 18.1687 2.66748 18.2209C2.66748 19.9321 4.05037 21.3244 5.76306 21.3244C7.47576 21.3244 8.85864 19.9379 8.85864 18.2209C8.85864 18.1687 8.85864 18.1165 8.85864 18.07L15.6168 18.0816C15.6168 18.1281 15.6168 18.1803 15.6168 18.2267C15.6168 19.9379 16.9997 21.3302 18.7124 21.3302C20.4251 21.3302 21.808 19.9437 21.808 18.2267C21.808 18.1803 21.808 18.1397 21.808 18.0932H24.9672C25.9219 18.0874 26.6915 17.3159 26.6915 16.3588V16.324C26.6915 15.3726 25.9219 14.5953 24.973 14.5953H24.9441H24.9152ZM5.91929 10.4708H3.1188C2.86421 10.4708 2.62698 10.3258 2.51704 10.0938C2.40132 9.86174 2.43025 9.5891 2.58647 9.38606L4.64634 6.67123C4.81992 6.43919 5.09766 6.30577 5.38696 6.30577H5.92507V10.465L5.91929 10.4708ZM11.8096 10.4708H7.60884V6.31157H11.8096V10.4708ZM18.0702 10.146C17.9487 10.3432 17.7288 10.4708 17.4973 10.4708H13.4702V6.31157H15.8946C16.2417 6.31157 16.5658 6.5088 16.722 6.81625L18.0933 9.49048C18.2032 9.69931 18.1917 9.94875 18.0702 10.146Z" fill="currentColor"/><path d="M3.92297 4.19981H16.2474C18.099 4.19981 19.6092 2.69157 19.6092 0.835275C19.6092 0.371201 19.2331 -0.00585938 18.7702 -0.00585938C18.3073 -0.00585938 17.9312 0.377002 17.9312 0.841076C17.9312 1.76922 17.1732 2.52915 16.2474 2.52915H3.92297C3.46008 2.52915 3.08398 2.8946 3.08398 3.35868C3.08398 3.82275 3.46008 4.19401 3.92297 4.19401V4.19981Z" fill="currentColor"/></g><defs><clipPath id="vi-clip-ffdrawer"><rect width="26.6966" height="21.3028" fill="white"/></clipPath></defs></svg></span>
            <h2><span class="italic-lead">Fit</span> Finder</h2>
            <p>Select your vehicle to see what fits it across the whole site.</p>
          </div>
          <div class="ff-row">
            <select aria-label="Make"><option value="toyota">Toyota</option></select>
            <select aria-label="Model"><option value="hilux">Hilux</option></select>
            <select aria-label="Year range" data-ff-required>
              <option value="" selected disabled>Year</option>
              <option value="2024+">2024 Onwards (N90)</option>
              <option value="2015-2023">2015–2023 (N80)</option>
              <option value="2005-2015">2005–2015 (N70)</option>
              <option value="pre-2005">Pre-2005</option>
            </select>
            <select aria-label="Body style" data-ff-required>
              <option value="" selected disabled>Body Style</option>
              <option value="double-cab">Double Cab (4dr Ute)</option>
              <option value="xtra-cab">Xtra Cab</option>
              <option value="single-cab">Single Cab</option>
            </select>
            <select aria-label="Roof type" data-ff-required>
              <option value="" selected disabled>Roof Type</option>
              <option value="bare">No Rails — Bare Roof</option>
              <option value="styling-bar">Styling Bars Only (Non Load-Rated)</option>
              <option value="aftermarket-rails">Aftermarket Rails Fitted</option>
            </select>
            <button type="button" class="btn btn-cta" data-ff-submit disabled>Set My Vehicle</button>
          </div>
        </section>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  const required = [...backdrop.querySelectorAll('[data-ff-required]')];
  const submit = backdrop.querySelector('[data-ff-submit]');
  const sync = () => { submit.disabled = required.some(s => !s.value); };
  required.forEach(s => s.addEventListener('change', sync));
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeFitFinderDrawer(); });
  backdrop.querySelector('.store-slideout-close').addEventListener('click', closeFitFinderDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFitFinderDrawer(); });
  submit.addEventListener('click', () => {
    if (window.rrgSetSession) window.rrgSetSession('vehicleSet', true);
    closeFitFinderDrawer();
  });
}

function openFitFinderDrawer() {
  buildFitFinderDrawer();
  document.getElementById('fitFinderDrawerBackdrop').classList.add('open');
}

function closeFitFinderDrawer() {
  const backdrop = document.getElementById('fitFinderDrawerBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

function initFitFinderTriggers() {
  // Header vehicle link (desktop utility bar + mobile takeover) and the PLP-family pages' own
  // Set/Change Vehicle buttons. The Vehicle Category Landing Page keeps its own behaviour — its
  // Fit Finder is already on the page.
  document.querySelectorAll('[data-session="vehicleSet"]').forEach(el => {
    const link = el.closest('a');
    if (link) link.setAttribute('data-open-fit-finder', '');
  });
  if (document.querySelector('[data-plp-page]')) {
    document.querySelectorAll('[data-vclp-cta="set-vehicle"], [data-vclp-cta="change-vehicle"]').forEach(el => el.setAttribute('data-open-fit-finder', ''));
  }
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-open-fit-finder]');
    if (!trigger) return;
    e.preventDefault();
    openFitFinderDrawer();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initRegionSwitcher();
  initMobileNav();
  initSearchClear();
  initHeaderSearchSuggest();
  initFitFinderTriggers();
  initPersistentBar('.rrg-search', '.rrg-sticky-header');
  initMegaMenu();
  buildSiteAdminPanel('header');
  rrgApplySessionState();
});
