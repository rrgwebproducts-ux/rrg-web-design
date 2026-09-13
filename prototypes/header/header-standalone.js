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
  initPersistentBar('.rrg-search', '.rrg-sticky-header');
  initMegaMenu();
  buildSiteAdminPanel('header');
  rrgApplySessionState();
});
