// Sale takeover (docs/campaign/campaign-spec.md, 2026-10-02). When a big sale is on, the whole site
// takes on the campaign's colours without changing any layout: favicon, a campaign strip with a
// countdown above the header, a lime utility bar, a sale link in the nav, the mega-menu banner,
// the campaign sale tag on the PDP and on every discounted product card, a lime Add to Cart, the
// footer, the home hero's campaign slide and the cart's savings line.
//
// One control (Site Admin → Promotions & design → "Sale takeover", saved as rrgSale) picks which
// campaign is running, or none. RRG_CAMPAIGNS below holds one entry per sale — everything that
// changes from one sale to the next (full list of takeover items + the new-sale checklist:
// campaign-spec.md Sections 3 and 4); its colours live in campaign.css. The takeover is AU and NZ
// only — the UK (The Roof Box Company) keeps its own skin.
//
// Load this after session-state.js and before widgets.js, so the header widget can draw the strip
// and nav link. Everything else reads rrgCampaignActive() / body.campaign-on.

const RRG_CAMPAIGNS = {
  'rack-friday': {
    id: 'rack-friday',
    name: 'Rack Friday',
    title: 'Rack Friday Sale',
    // The header nav button, which takes Clearance's slot while the sale is on — kept short so the
    // nav is no wider than with Clearance (e.g. 'Rack Friday', or just 'Sale').
    navLabel: 'Rack Friday',
    offer: 'Up to 50% off racks, platforms & more',
    terms: 'In-store + online',
    // End of the sale, Brisbane time (the hero creative: 1–29 Nov 2026).
    ends: '2026-11-29T23:59:59+10:00',
    href: '#',
    favicon: '_shared/campaign/rack-friday-favicon.ico',
    saleTag: '_shared/campaign/rack-friday-tag.webp',
    megaMenuBanner: '_shared/campaign/rack-friday-mega-menu.webp',
  },
  // Christmas Sale (2026-10-04) — green + gold, a dark accent with white text. Assets are DRAFTS
  // made in the campaign style until the designer supplies finals; offer and dates are placeholders.
  'christmas': {
    id: 'christmas',
    name: 'Christmas',
    title: 'Christmas Sale',
    navLabel: 'Xmas Sale',
    offer: 'Up to XX% off — gifts for every adventure',
    terms: 'In-store + online',
    ends: '2026-12-24T23:59:59+10:00',
    href: '#',
    favicon: '_shared/campaign/christmas-favicon.ico',
    saleTag: '_shared/campaign/christmas-tag.webp',
    megaMenuBanner: '_shared/campaign/christmas-mega-menu.webp',
  },
};

const RRG_SALE_KEY = 'rrgSale';

// The running campaign's id, or '' for none. (rrgSaleOn = 'true' is the 2026-10-02 on/off switch,
// when Rack Friday was the only campaign — still honoured so saved demo state carries over.)
function rrgSaleId() {
  try {
    const id = localStorage.getItem(RRG_SALE_KEY);
    if (id !== null) return RRG_CAMPAIGNS[id] ? id : '';
    return localStorage.getItem('rrgSaleOn') === 'true' ? 'rack-friday' : '';
  } catch (err) { return ''; }
}

// The running campaign (null when no sale is on).
const RRG_CAMPAIGN = RRG_CAMPAIGNS[rrgSaleId()] || null;

function rrgSaleOn() {
  return !!RRG_CAMPAIGN;
}

// The region as shared.js will resolve it (initialRegion) — read here too because this runs before
// shared.js, so the first paint is already right.
function rrgCampaignRegion() {
  if (document.body.classList.contains('region-uk')) return 'UK';
  const fromUrl = (new URLSearchParams(window.location.search).get('region') || '').toUpperCase();
  if (['AU', 'NZ', 'UK'].includes(fromUrl)) return fromUrl;
  try { return localStorage.getItem('rrgRegion') || 'AU'; } catch (err) { return 'AU'; }
}

function rrgCampaignActive() {
  return rrgSaleOn() && rrgCampaignRegion() !== 'UK';
}

// Admin control — reloads so every page part (hero slides, cards, tags) is drawn for the new state.
window.rrgSetSale = (id) => {
  try { localStorage.setItem(RRG_SALE_KEY, id); localStorage.removeItem('rrgSaleOn'); } catch (err) {}
  window.location.reload();
};

// Label for the cart / checkout / mini-cart savings line.
function rrgSavingsLabel() {
  return rrgCampaignActive() ? `${RRG_CAMPAIGN.name} savings` : "You're saving";
}

// ---- Campaign strip (sits above the header on every page except checkout) ----
function rrgCampaignStripHTML() {
  if (!rrgSaleOn()) return '';
  const c = RRG_CAMPAIGN;
  return `<a class="campaign-strip" href="${c.href}" data-campaign="${c.id}">
  <span class="wrap campaign-strip-inner">
    <span class="campaign-strip-title">${c.title}</span>
    <span class="campaign-strip-offer">${c.offer} <span class="campaign-strip-terms">· ${c.terms}</span></span>
    <span class="campaign-countdown" data-campaign-countdown aria-label="Time left in the sale">
      <span class="campaign-countdown-label">Ends in</span>
      <span class="campaign-countdown-units"></span>
    </span>
    <span class="campaign-strip-cta">Shop the sale <span aria-hidden="true">→</span></span>
  </span>
</a>`;
}

// Takes the Clearance link's slot (campaign.css hides Clearance while a sale is on): a sale takes
// priority over clearance, and the nav keeps its width so the search box never drops a row.
function rrgCampaignNavLinkHTML() {
  if (!rrgSaleOn()) return '';
  return `<a class="rrg-nav-campaign" href="${RRG_CAMPAIGN.href}" aria-label="${RRG_CAMPAIGN.title}">${RRG_CAMPAIGN.navLabel}</a>`;
}

function rrgCampaignCountdownTick() {
  if (!RRG_CAMPAIGN) return;
  const left = new Date(RRG_CAMPAIGN.ends) - Date.now();
  document.querySelectorAll('[data-campaign-countdown]').forEach(el => {
    el.hidden = left <= 0;
    if (left <= 0) return;
    const s = Math.floor(left / 1000);
    const parts = [[Math.floor(s / 86400), 'd'], [Math.floor(s / 3600) % 24, 'h'], [Math.floor(s / 60) % 60, 'm'], [s % 60, 's']];
    el.querySelector('.campaign-countdown-units').innerHTML = parts
      .map(([n, u]) => `<span class="campaign-countdown-unit"><b>${String(n).padStart(2, '0')}</b>${u}</span>`).join('');
  });
}

// ---- Apply ----
// Runs now (body exists — every page loads this at the end of <body>) and again from
// applyRegionBrand (shared.js) whenever the region changes, since the UK switches it off.
function rrgApplyCampaign() {
  const on = rrgCampaignActive();
  const body = document.body;
  body.classList.toggle('campaign-on', on);
  if (on) {
    body.dataset.campaign = RRG_CAMPAIGN.id;
    body.style.setProperty('--campaign-tag', `url("${RRG_PROTO}${RRG_CAMPAIGN.saleTag}")`);
  } else {
    delete body.dataset.campaign;
  }

  // Favicon: remember the page's own so it can go back.
  let icon = document.querySelector('link[rel="icon"]');
  if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon); }
  if (!icon.dataset.defaultHref) icon.dataset.defaultHref = icon.getAttribute('href') || `${RRG_PROTO}_shared/favicon.ico`;
  icon.href = on ? `${RRG_PROTO}${RRG_CAMPAIGN.favicon}` : icon.dataset.defaultHref;

  // PDP sale tags: the campaign's tag while a sale is on (CSS hides them otherwise).
  document.querySelectorAll('img.sale-tag').forEach(img => { img.src = `${RRG_PROTO}${RRG_CAMPAIGN.saleTag}`; img.alt = RRG_CAMPAIGN.title; });

  if (typeof mmApplySaleBannerVisibility === 'function') mmApplySaleBannerVisibility();
}

// Home hero: a slide marked data-campaign-slide="<id>" only shows while that campaign is on
// (removed before initHomeHero counts the slides).
function rrgCampaignPruneSlides() {
  document.querySelectorAll('[data-campaign-slide]').forEach(slide => {
    if (rrgCampaignActive() && slide.dataset.campaignSlide === RRG_CAMPAIGN.id) return;
    slide.remove();
  });
  document.querySelectorAll('.home-hero').forEach(hero => {
    const slides = hero.querySelectorAll('.home-hero-slide');
    slides.forEach((s, i) => {
      s.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
      s.classList.toggle('is-active', i === 0);
    });
  });
}

rrgApplyCampaign();
rrgCampaignPruneSlides();
document.addEventListener('DOMContentLoaded', () => {
  rrgCampaignCountdownTick();
  if (document.querySelector('[data-campaign-countdown]')) setInterval(rrgCampaignCountdownTick, 1000);
});
