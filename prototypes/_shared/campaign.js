// Sale takeover (docs/campaign/campaign-spec.md, 2026-10-02). When a big sale is on, the whole site
// takes on the campaign's colours without changing any layout: favicon, a campaign strip with a
// countdown above the header, a lime utility bar, a sale link in the nav, the mega-menu banner,
// the campaign sale tag on the PDP and on every discounted product card, a lime Add to Cart, the
// footer, the home hero's campaign slide and the cart's savings line.
//
// One switch (Site Admin → Promotions & design → "Sale on", saved as rrgSaleOn) turns it on and
// off; RRG_CAMPAIGN below is everything that changes from one sale to the next. The takeover is
// AU and NZ only — the UK (The Roof Box Company) keeps its own skin.
//
// Load this after session-state.js and before widgets.js, so the header widget can draw the strip
// and nav link. Everything else reads rrgCampaignActive() / body.campaign-on.

const RRG_CAMPAIGN = {
  id: 'rack-friday',
  name: 'Rack Friday',
  title: 'Rack Friday Sale',
  offer: 'Up to 50% off racks, platforms & more',
  terms: 'In-store + online',
  // End of the sale, Brisbane time (the hero creative: 1–29 Nov 2026).
  ends: '2026-11-29T23:59:59+10:00',
  href: '#',
  favicon: '_shared/campaign/favicon-sale.ico',
  saleTag: '_shared/campaign/rack-friday-tag.webp',
  megaMenuBanner: '_shared/campaign/rack-friday-mega-menu.webp',
};

const RRG_SALE_ON_KEY = 'rrgSaleOn';

function rrgSaleOn() {
  try { return localStorage.getItem(RRG_SALE_ON_KEY) === 'true'; } catch (err) { return false; }
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

// Admin toggle — reloads so every page part (hero slides, cards, tags) is drawn for the new state.
window.rrgSetSaleOn = (on) => {
  try { localStorage.setItem(RRG_SALE_ON_KEY, on); } catch (err) {}
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

function rrgCampaignNavLinkHTML() {
  if (!rrgSaleOn()) return '';
  return `<a class="rrg-nav-campaign" href="${RRG_CAMPAIGN.href}">${RRG_CAMPAIGN.title}</a>`;
}

function rrgCampaignCountdownTick() {
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
  document.querySelectorAll('img.sale-tag').forEach(img => { img.src = `${RRG_PROTO}${RRG_CAMPAIGN.saleTag}`; });

  if (typeof mmApplySaleBannerVisibility === 'function') mmApplySaleBannerVisibility();
}

// Home hero: a slide marked data-campaign only shows while its campaign is on (removed before
// initHomeHero counts the slides).
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
