// Shared widgets (2026-10-01) — docs/widgets/widgets-spec.md. One render function per widget that
// used to be copied into every page; a page keeps only a placeholder:
//
//   <div data-widget="header"></div>     utility bar + main header/nav, sticky mobile header,
//                                        mobile menu takeover (checkout has its own header)
//   <div data-widget="footer"></div>
//   <div data-widget="vehicle-finder"></div>   the Fit Finder / vehicle bar (options below)
//
// rrgMountWidgets() swaps each placeholder for the widget's markup (the placeholder itself is
// replaced, not filled, so the page's element order is exactly what it was — e.g. the footer stays
// the next sibling of <main> for shared.css's `main:has(...) + .rrg-footer`). It runs as soon as
// this file loads: load it after nav-data.js / session-state.js and before mega-menu.js,
// admin-panel.js, shared.js, cart.js and plp.js, so their DOMContentLoaded set-up finds the real
// elements. Text that depends on region or session (store, vehicle, login, flags, footer copy) is
// the AU default here and is rewritten after load by applyRegion / rrgApplySessionState
// (shared.js, session-state.js), exactly as when the markup was static in each page.
//
// RULE (spec.md §17): change a widget here and check it in the Component Library
// (prototypes/components/) — every page that uses it updates together.

// ---------------------------------------------------------------- Header

// Red utility bar: nearest store, vehicle, Call Us, region selector (initRegionSwitcher, shared.js),
// login.
function rrgWidgetUtilityBarHTML() {
  return `<div class="rrg-utility-bar">
  <div class="wrap rrg-utility-inner">
    <div class="rrg-utility-left">
      <span class="u-item"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s7-7.58 7-13A7 7 0 1 0 5 9c0 5.42 7 13 7 13zm0-9a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/></svg> <span class="u-item-label" data-session-store-label>Your Nearest Store:</span> <a href="#" data-region-nearest-store>North Lakes</a></span>
      <span class="u-item"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h1zm2.1-4l-1.2 4h12.2l-1.2-4a1 1 0 0 0-.9-.5H8a1 1 0 0 0-.9.5zM7 15.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg> <a href="#" data-session="vehicleSet"><span class="u-item-label">Your Vehicle:</span> Toyota Hilux</a></span>
    </div>
    <div class="rrg-utility-right">
      <span class="u-item"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z"/></svg> Call Us</span>
      <div class="region-switcher u-item">
        <button type="button" class="region-switcher-toggle" aria-haspopup="true" aria-expanded="false"><img class="flag-icon" data-region-flag src="../_shared/flags/au.svg" alt="" width="20" height="15"> <span data-region-label>Australia</span> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px;"><path d="M6 9l6 6 6-6"/></svg></button>
        <div class="region-switcher-menu">
          <span class="tsm-label">Region</span>
          <a href="#" data-region="AU" class="current"><img class="flag-icon" src="../_shared/flags/au.svg" alt="" width="20" height="15"> Australia</a>
          <a href="#" data-region="NZ"><img class="flag-icon" src="../_shared/flags/nz.svg" alt="" width="20" height="15"> New Zealand</a>
          <a href="#" data-region="UK"><img class="flag-icon" src="../_shared/flags/gb.svg" alt="" width="20" height="15"> United Kingdom</a>
        </div>
      </div>
      <span class="u-item"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7v1H4v-1z"/></svg> <a href="#" data-session="loggedIn">Graham</a></span>
    </div>
  </div>
</div>`;
}

// Main header: logo, Products mega menu (shell only — buildMegaMenuDesktop, mega-menu.js, fills
// .mega-menu-drawer-inner), nav links, search + typeahead (initHeaderSearchSuggest, shared.js), cart
// count (cart.js).
function rrgWidgetMainHeaderHTML() {
  return `<header class="rrg-main-header">
  <div class="wrap rrg-main-inner">
    <button type="button" class="mobile-nav-toggle" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    <a class="rrg-logo" href="../home/index.html" aria-label="Roof Racks Galore — home"><img src="../_shared/headerlogo.png" alt="Roof Racks Galore"></a>
    <nav class="rrg-nav">
      <div class="mega-menu">
        <button type="button" class="mega-menu-toggle" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg> Products</button>
        <div class="mega-menu-drawer">
          <div class="wrap mega-menu-drawer-inner">
            <div class="mega-menu-l1"></div>
            <div class="mega-menu-l2"></div>
            <div class="mega-menu-l3"></div>
          </div>
        </div>
      </div>
      <span class="sep">|</span>
      <a href="#">Store Finder</a>
      <a href="#">Fit My Vehicle</a>
      <a href="#">Clearance</a>
      <a href="../installation/index.html">Fitting</a>
    </nav>
    <div class="rrg-search">
      <input type="text" placeholder="Search Roof Racks or Accessories">
      <button type="button" class="rrg-search-clear" aria-label="Clear search" hidden>&times;</button>
      <button class="rrg-search-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg></button>
    </div>
    <div class="rrg-cart">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.8h7.6a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none"/></svg>
      <span class="cart-badge">0</span>
    </div>
  </div>
</header>`;
}

// Sticky condensed mobile header (2026-09-11, matched to client-supplied Figma export
// "Mob Navbar - Final - Sticky.png") — hamburger/logo/cart only, shown via
// initPersistentBar('.rrg-search', '.rrg-sticky-header') once the search row scrolls out of view.
// Hidden entirely on desktop (see .rrg-sticky-header in shared.css).
function rrgWidgetStickyHeaderHTML() {
  return `<div class="rrg-sticky-header">
  <button type="button" class="mobile-nav-toggle" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
  <a class="rrg-logo" href="../home/index.html" aria-label="Roof Racks Galore — home"><img src="../_shared/headerlogo.png" alt="Roof Racks Galore"></a>
  <div class="rrg-cart">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.8h7.6a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none"/></svg>
    <span class="cart-badge">0</span>
  </div>
</div>`;
}

// Full-screen mobile menu takeover (header-spec.md Section 3.6, rebuilt 2026-09-13 per Brenton's
// direction — see Mega Menu Designs/Mega Menu - Final - Level 1 - Mob.png). position:fixed to the
// full viewport with its own self-contained header (logo/login/vehicle/search), so it doesn't
// depend on the page header's scroll position. Opened by either hamburger (initMobileNav,
// shared.js); buildMegaMenuMobile() (mega-menu.js) only ever writes into .mega-menu-mobile, and
// hides the topbar/search itself (via a data-screen attribute on this wrapper) once drilled past
// the root screen.
function rrgWidgetMobileTakeoverHTML() {
  return `<div class="mm-mobile-takeover">
  <div class="mm-mobile-panel">
    <div class="mm-mobile-topbar">
      <a class="mm-mobile-logo" href="../home/index.html" aria-label="Roof Racks Galore — home"><img src="../_shared/headerlogo.png" alt="Roof Racks Galore"></a>
      <div class="mm-mobile-utility">
        <a href="#" class="mm-mobile-utility-item"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7v1H4v-1z"/></svg><span data-session="loggedIn">Graham</span></a>
        <a href="#" class="mm-mobile-utility-item"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11h1a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h1zm2.1-4l-1.2 4h12.2l-1.2-4a1 1 0 0 0-.9-.5H8a1 1 0 0 0-.9.5zM7 15.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg><span data-session="vehicleSet"><span class="u-item-label">Your Vehicle:</span> Toyota Hilux</span></a>
      </div>
      <button type="button" class="mm-mobile-close" aria-label="Close menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="mm-mobile-search">
      <input type="text" placeholder="Search Roof Racks or Accessories">
      <button type="button" class="mm-mobile-search-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg></button>
    </div>
    <div class="mega-menu-mobile"></div>
  </div>
</div>`;
}

// The whole header: .rrg-header-shell (utility bar + main header; the desktop sticky header,
// initStickyHeader in shared.js, pins this), then the sticky mobile header and the takeover —
// three siblings at body level, as the pages always had them.
function rrgWidgetHeaderHTML() {
  return `<div class="rrg-header-shell">
${rrgWidgetUtilityBarHTML()}
${rrgWidgetMainHeaderHTML()}
</div>
${rrgWidgetStickyHeaderHTML()}
${rrgWidgetMobileTakeoverHTML()}`;
}

// ---------------------------------------------------------------- Footer

// Global footer — footer-spec.md. Region-aware text/asset swaps (brand, copyright, phone, store
// copy, social and payment icons) are made by applyRegionFooter / renderFooterSocial /
// renderFooterPayments in shared.js.
function rrgWidgetFooterHTML() {
  return `<footer class="rrg-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-col">
        <h4>Information</h4>
        <ul>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Opening Hours</a></li>
          <li><a href="#">Wholesale Policy</a></li>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Feedback</a></li>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Checkout Error Form</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Customer Service</h4>
        <ul>
          <li><a href="#">Terms and Conditions</a></li>
          <li><a href="#">Warranty</a></li>
          <li><a href="#">Payment and Pricing</a></li>
          <li><a href="#">Shipping &amp; Delivery</a></li>
          <li><a href="#">Refund &amp; Exchange</a></li>
          <li><a href="#">Frequently Asked Questions</a></li>
        </ul>
      </div>
      <div class="footer-info-block">
        <div class="footer-col">
          <h4>Store Finder</h4>
          <div class="footer-store-finder">
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 5.5 8 12 8 12s8-6.5 8-12c0-4.42-3.58-8-8-8Zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" fill="#FFCA48"/></svg>
            <p><a href="#">Click here</a> <span data-footer-store-copy>to find your closest store from our <strong>35 nationwide locations</strong>.</span></p>
          </div>
        </div>
        <div class="footer-col footer-enquiries">
          <h4>Online Orders and Enquiries</h4>
          <p>Our team is here to support you. Phone and chat is open Monday to Friday, 8:30am to 5pm AEST (closed Public Hols).</p>
          <div class="footer-contact-row">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="9" r="9" fill="#fff"/><rect x="8" y="7.5" width="2" height="6" rx="1" fill="#211E20"/><rect x="8" y="4.5" width="2" height="2" rx="1" fill="#211E20"/></svg>
            <a href="mailto:help@roofracksgalore.com.au" data-footer-email>help@roofracksgalore.com.au</a>
          </div>
          <div class="footer-contact-row" data-trust="phone">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2.6 1.2 5.4 1c.5 0 1 .3 1.1.8l.8 2.9c.1.4 0 .9-.3 1.2L5.6 7.3a11 11 0 0 0 4.1 4.1l1.4-1.4c.3-.3.8-.4 1.2-.3l2.9.8c.5.1.8.6.8 1.1l-.2 2.8c0 .6-.5 1-1.1 1C7.3 15.4 1.6 9.7 1.6 2.3c0-.6.4-1 1-1.1Z" fill="#fff"/></svg>
            <span>Call Us <a href="tel:1300071264">1300 071 264</a></span>
          </div>
        </div>
      </div>
      <div class="footer-col footer-brand-col">
        <div class="footer-logo rrg-logo"><img src="../_shared/headerlogo-white.png" alt="Roof Racks Galore"></div>
        <div class="footer-tagline" data-footer-tagline hidden>#TakeMoreDoMore</div>
        <div class="footer-social">
          <h4>Follow Us</h4>
          <div class="footer-social-icons" data-footer-social-icons></div>
        </div>
        <div class="footer-payment">
          <h4>Payment Options</h4>
          <div class="footer-payment-icons" data-footer-payment-icons></div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span data-footer-copyright>© 2026 Roof Racks Galore</span>
  </div>
</footer>`;
}

// ---------------------------------------------------------------- Mount

// ---------------------------------------------------------------- Vehicle finder

// Vehicle finder (2026-10-02, Brenton — one widget everywhere): the Fit Finder with no vehicle,
// "Shopping for your Toyota Hilux" with one, light or dark (Site Admin → Design options). Home,
// Fit My Vehicle, Cart, Brand and VCLP place it with <div data-widget="vehicle-finder">; the Fit
// Finder drawer renders it with inline: false (shared.js buildFitFinderDrawer). Behaviour is
// initInlineFitFinders / initVehicleFinder in shared.js. Options (placeholder data-* attributes):
//   id, class         on the <section>
//   intro             the line under the heading (default "Select your vehicle to find the perfect fit.")
//   submit            the button label (default "View Results")
//   inline            "false" leaves out data-fit-finder-inline (the drawer wires up its own cascade)
//   vf*               passed through as data-vf-* — vfBrowseHref, vfStay, vfShopHref, vfShopLabel,
//                     vfProof, vfPreset, vfSubmitHref; see initVehicleFinder / initInlineFitFinders
function rrgWidgetVehicleFinderHTML(opts = {}) {
  const attr = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const vf = Object.entries(opts).filter(([k]) => /^vf[A-Z]/.test(k))
    .map(([k, v]) => ` data-${k.replace(/[A-Z]/g, c => '-' + c.toLowerCase())}="${attr(v)}"`).join('');
  return `<section class="fit-finder-widget${opts.class ? ' ' + opts.class : ''}"${opts.id ? ` id="${opts.id}"` : ''}${opts.inline === 'false' || opts.inline === false ? '' : ' data-fit-finder-inline'} data-vehicle-finder${vf}>
  <div class="ff-head">
    <span class="ff-badge"><svg viewBox="0 0 27 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.9152 14.5953V14.0848C24.9152 12.0661 23.2893 10.4418 21.2815 10.4418C20.6739 10.4418 20.1127 10.1054 19.8234 9.56589L17.8676 5.97512C17.5726 5.43563 17.0113 5.10498 16.4038 5.10498L5.13237 5.12238C4.63477 5.12238 4.1603 5.34862 3.84206 5.73728L1.51025 8.60874C0.567114 9.76892 0.248877 11.3236 0.653906 12.7622L1.17466 14.6185C0.931641 14.7055 0.705981 14.8505 0.520825 15.0362C0.191016 15.3668 0.00585938 15.8193 0.00585938 16.2892C0.00585938 17.2637 0.792773 18.0584 1.76484 18.0584H2.66748C2.66748 18.1165 2.66748 18.1687 2.66748 18.2209C2.66748 19.9321 4.05037 21.3244 5.76306 21.3244C7.47576 21.3244 8.85864 19.9379 8.85864 18.2209C8.85864 18.1687 8.85864 18.1165 8.85864 18.07L15.6168 18.0816C15.6168 18.1281 15.6168 18.1803 15.6168 18.2267C15.6168 19.9379 16.9997 21.3302 18.7124 21.3302C20.4251 21.3302 21.808 19.9437 21.808 18.2267C21.808 18.1803 21.808 18.1397 21.808 18.0932H24.9672C25.9219 18.0874 26.6915 17.3159 26.6915 16.3588V16.324C26.6915 15.3726 25.9219 14.5953 24.973 14.5953H24.9441H24.9152ZM5.91929 10.4708H3.1188C2.86421 10.4708 2.62698 10.3258 2.51704 10.0938C2.40132 9.86174 2.43025 9.5891 2.58647 9.38606L4.64634 6.67123C4.81992 6.43919 5.09766 6.30577 5.38696 6.30577H5.92507V10.465L5.91929 10.4708ZM11.8096 10.4708H7.60884V6.31157H11.8096V10.4708ZM18.0702 10.146C17.9487 10.3432 17.7288 10.4708 17.4973 10.4708H13.4702V6.31157H15.8946C16.2417 6.31157 16.5658 6.5088 16.722 6.81625L18.0933 9.49048C18.2032 9.69931 18.1917 9.94875 18.0702 10.146Z" fill="currentColor"/><path d="M3.92297 4.19981H16.2474C18.099 4.19981 19.6092 2.69157 19.6092 0.835275C19.6092 0.371201 19.2331 -0.00585938 18.7702 -0.00585938C18.3073 -0.00585938 17.9312 0.377002 17.9312 0.841076C17.9312 1.76922 17.1732 2.52915 16.2474 2.52915H3.92297C3.46008 2.52915 3.08398 2.8946 3.08398 3.35868C3.08398 3.82275 3.46008 4.19401 3.92297 4.19401V4.19981Z" fill="currentColor"/></svg></span>
    <h2><span class="italic-lead">Fit</span> Finder</h2>
    <p>${opts.intro || 'Select your vehicle to find the perfect fit.'}</p>
  </div>
  <div class="ff-row">
    <select aria-label="Make" data-ff-make></select>
    <select aria-label="Model" data-ff-model disabled><option value="" selected disabled>Model</option></select>
    <select aria-label="Year range" data-ff-required data-ff-field="years" disabled><option value="" selected disabled>Year</option></select>
    <select aria-label="Body style" data-ff-required data-ff-field="bodies" disabled><option value="" selected disabled>Body Style</option></select>
    <select aria-label="Roof type" data-ff-required data-ff-field="roofs" disabled><option value="" selected disabled>Roof Type</option></select>
    <button type="button" class="btn btn-cta" data-ff-submit disabled>${opts.submit || 'View Results'}</button>
  </div>
</section>`;
}

const RRG_WIDGETS = {
  header: rrgWidgetHeaderHTML,
  footer: rrgWidgetFooterHTML,
  'vehicle-finder': rrgWidgetVehicleFinderHTML,
};

// Replaces every [data-widget] placeholder under `root` with its widget. The placeholder's data-*
// attributes are passed to the render function as its options.
function rrgMountWidgets(root = document) {
  root.querySelectorAll('[data-widget]').forEach(el => {
    const render = RRG_WIDGETS[el.dataset.widget];
    if (!render) { console.warn(`widgets.js: no widget called "${el.dataset.widget}"`); return; }
    el.outerHTML = render({ ...el.dataset });
  });
}

rrgMountWidgets();
