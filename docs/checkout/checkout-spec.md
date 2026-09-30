# Checkout — Engineering Spec (DRAFT for sign-off)

Project: the mini-cart, cart page, checkout and order confirmation. Spec.md §16 item 30 (checkout) and item 6 (the confirmation page pushes fitting). Companion to `docs/installation/installation-spec.md`, where the confirmation page's fitting card goes.

Planning session: 2026-09-30. The decisions in Section 8 were answered by Brenton the same day. **Nothing is built yet.**

---

## 0. Goal & scope

**In scope:** four new prototype surfaces:
- the **mini-cart** drawer (site-wide, after Add to Cart)
- the **cart page** (`prototypes/cart/`)
- a restyled **Magento 2-step checkout** (`prototypes/checkout/`)
- the **order confirmation** page (`prototypes/order-confirmation/`)

Plus one shared demo cart that every Add to Cart on the site fills.

**Out of scope:**
- real payments, addresses, stock reservation or order creation (the backend)
- the confirmation *email* (described in Section 6 for Mark, not built)
- account pages

## 1. The live flow today (checked 2026-09-30 with one item in the cart; no details entered, no order placed)

| Step | Live | Problem |
|---|---|---|
| Add to Cart | Right-hand slide-out: "Item Added To Your Cart", qty select, remove, subtotal with was-price, **Proceed to Cart** (gold), then a "nationwide expert fitting → Store Finder" promo. | No way to go straight to checkout. The fitting promo appears before the sale is made. |
| Cart `/checkout/cart/` | A table of lines (price, qty ± and total). Summary: Estimate Shipping and Tax, Subtotal, **Tax $27.18**, Order Total, the Afterpay line, Apply Discount Code, **Proceed to Checkout** (gold), **Buy with Google Pay**, the Zip line. | "Tax" as its own line reads like an extra charge when it's GST already included. There's no stock or fitment on the lines. An empty cart is a dead end. |
| Checkout step 1 `#shipping` | Progress bar (Shipping → Review & Payments) and a Sign In link. Fields: email ("You can create an account after checkout"), a marketing opt-in, first and last name, "Ship to Business address", street, country, state, city, postcode, phone. Then a **Click & Collect** section below it: the stores in accordions by state. Next. | **A shopper collecting in store must still fill in the full delivery address first.** The store choice sits under the address as 7 state accordions, with no saved store, distance or ready time. |
| Step 2 `#payment` | Not seen (it needs details entered). Payment methods per the help pages and cart: Visa, Mastercard, PayPal, Google Pay, Afterpay, Zip, bank transfer. | — |

Other live facts:
- Click & Collect is free. SMS when ready, held 14 days, allow about 48 hours if stock moves between stores.
- Delivery takes 1–3 business days to metro areas and 3–5 regional (longer to WA/NT/SA).
- No free-shipping threshold is published.
- Fitting is never booked or paid for online.

---

## 2. Mini-cart drawer (site-wide)

Opens on every Add to Cart: PDPs, product cards on the PLP family and Search, and the Home and store carousels. It replaces today's prototype behaviour of just bumping the cart count. The header cart icon opens it too.

It's the site's standard right-edge drawer (420px, `role="dialog"`, Escape, backdrop).

- **Head:** "✓ Added to your cart" (or "Your cart" when opened from the icon).
- **Lines:** image, brand, name, variant (colour or size), the qty stepper, remove, and line price with the was-price. A bundle shows as one line with its parts listed under it (the risk flagged in spec.md §5).
- **Subtotal:** "Subtotal (3 items) $1,247.00". Then one line for the saved store: "**Free Click & Collect** from North Lakes", or "Delivery calculated at checkout".
- **Actions:** **Checkout** (gold, the one primary), then **View cart** (outline).
- **BNPL line** per region: AU Afterpay and Zip. NZ and UK have none.
- **"Goes well with":** up to 3 small cross-sells from the product's related items, each with a quick add. It's the live "Accessories to suit your cart". Whether a PLP quick-add still shows cross-sells is an open question for Mark (PLP brief item 11).
- **No fitting promo** (decision 4: fitting is pushed on the confirmation page only).

## 3. Cart page (`/checkout/cart/`)

Two columns: lines on the left, a sticky summary on the right. It stacks on mobile, with the summary below and a sticky "Checkout · $1,247.00" bar.

**Lines:**
- image, brand, name (links to the PDP), SKU and variant
- **fitment** on vehicle-specific products ("✓ Fits your 2015–2023 Toyota Hilux", or a soft warning when it doesn't match the session vehicle)
- **stock and collect time** in the shared stock wording (`rrgStockStatus()`), e.g. "In Stock · Collect from North Lakes today"
- qty stepper, remove and line total with the was-price

Bundles show as a parent line with their parts indented under it.

**Summary:**
1. **How do you want it?** Two small toggles: **Click & Collect** (free, the saved store with a Change link, or "Choose a store") or **Delivery** (postcode → estimated cost and time). This reuses the PDP's Delivery / Click & Collect widget. AU only; NZ and UK show Delivery only.
2. Subtotal, delivery ("Free" or "$19.95" or "Calculated at checkout"), **Total**, then "Includes GST of $113.36" as a small note under the total. It is **not** a separate tax line.
3. **Discount or gift card code**, collapsed.
4. **Checkout** (gold). Express pay under it per region: **AU** PayPal and Google Pay; **UK** PayPal and Google Pay; **NZ** PayPal.
5. BNPL line (AU: Afterpay, Zip).
6. Trust row: Secure checkout · 90 Day Exchange · Price Guarantee · Help on 1300 071 264.

**Below the lines:** "You might also need" (a product carousel of compatible accessories).

**Empty cart:** "Your cart is empty", the vehicle finder, Shop by Category tiles, and Recently viewed if there are any.

## 4. Checkout: Magento 2-step, restyled (decision 2)

A **distraction-free shell**: logo, "Secure checkout", help phone number, **no mega menu, search or promos**, and a short footer (legal and help only). The progress bar reads **1 Details & delivery → 2 Payment**. The order summary is on the right (collapsed to "Show order summary · $1,247.00" on mobile), with an "Edit cart" link.

### Step 1 — Details & delivery (`#shipping`)
1. **Email** first, **guest by default** (decision 3): "Check out as a guest. You can create an account after your order." Then "Already have an account? Sign in", which shows a password field inline. The marketing opt-in is **unticked**.
2. **How do you want to get it?** Two large choice cards, **before** any address (this fixes the live problem):
   - **Click & Collect — Free** (AU only): the saved store preselected as a card (name, address, open now, **ready time** from stock, e.g. "Ready today" or "Ready within 2 business days"). **Change store** opens a list sorted by the postcode's nearest store (the Store Finder logic), not 7 state accordions. "We'll SMS you when it's ready. Orders are held for 14 days."
   - **Delivery:** an address with autocomplete (one search box, "Enter address manually" as the fallback), plus the "Business address" tickbox. Then the shipping methods as radio rows with price and time ("Standard · 1–3 business days · $19.95").
3. **Contact:** first name, last name and mobile ("for your SMS when it's ready" / "for the courier"). Click & Collect asks for **no address** here; billing is taken at payment.
4. **Continue to payment** (gold). Errors show inline and focus moves to the first one.

### Step 2 — Payment (`#payment`)
- A summary of step 1 with **Change** links ("Collecting from North Lakes · Ready today", or the delivery address and method).
- **Billing address:** "Same as delivery" ticked by default. For Click & Collect it's a short billing address form, or it's taken by the wallet or BNPL provider.
- **Payment method** radio cards, per region:
  - **AU:** Card (Visa, Mastercard), PayPal, Google Pay, Afterpay, Zip, Bank transfer
  - **NZ:** Card, PayPal, Bank transfer
  - **UK:** Card (Visa, Mastercard, Amex), PayPal, Google Pay

  Card fields show inline (the prototype uses dummy fields; in production they're the gateway's hosted fields). The BNPL options show the instalment amount.
- Terms tickbox if Legal needs one (live has none visible at step 1), then **Place order · $1,247.00** (gold).
- The prototype places a fake order, saves it to the session and goes to the confirmation page.

## 5. Order confirmation (`/checkout/onepage/success/`)
1. **"Thanks, Brenton. Your order is confirmed."** Order #100045678 and "We've emailed your receipt to b…@…".
2. **What happens next:** a short timeline per method.
   - Click & Collect: "We're getting it ready → SMS when ready → collect from North Lakes within 14 days (bring your order number)", with the store card (map, hours, Directions).
   - Delivery: "Dispatched next business day → tracking email → delivered in 1–3 business days".
3. **Book fitting at {store}** (item 6, the one prominent secondary action):
   - "Your products are locked in, now let's get them fitted."
   - The store card plus the fittable items from the order.
   - **Book a Fitting** → the Installation form with the store, vehicle and order number filled in (`?store=&order=#book`).
   - It only shows when the order contains something fittable (racks, bike racks, boxes, awnings and so on). The store is the Click & Collect store, or the saved or nearest store for a delivery.
   - No fitting prices (stores confirm them).
4. **Order summary** (lines, delivery, payment method, total with GST noted).
5. **Create an account** (guests only): a password field only, since the email is already known. "Track this order and check out faster next time."
6. Help: the order-enquiries phone and email.

**Confirmation email (for Mark, not built):** the same order summary, the same "what happens next" steps, and the same **Book fitting at {store}** card.

## 6. Regions (decision 5: follow the live sites)

| | AU | NZ | UK |
|---|---|---|---|
| Fulfilment | Delivery **or** Click & Collect | Delivery only | Delivery only |
| Express pay | PayPal, Google Pay | PayPal | PayPal, Google Pay |
| Payment methods | Visa, Mastercard, PayPal, Google Pay, Afterpay, Zip, bank transfer | Visa, Mastercard, PayPal, bank transfer | Visa, Mastercard, Amex, PayPal, Google Pay |
| BNPL line | Afterpay, Zip | — | — |
| Tax note | Includes GST | Includes GST | Includes VAT |
| Address | State + postcode | Region + postcode | County (optional) + postcode |
| Fitting card on confirmation | Yes | Yes (Auckland) | No (not offered online) |

**Also fixed with this work:**
- The prototype footer's payment logos are wrong for two regions (`REGION_FOOTER_BNPL`, shared.js): NZ shows Afterpay, and the UK shows Clearpay and Klarna.
- The live NZ site has no BNPL; the live UK site shows Google Pay, Visa, Mastercard, Amex and PayPal. The footer and the PDP payment badges will follow the table above.

## 7. Prototype mechanics
- **One demo cart** in localStorage (`rrgCart`), shared by every page. Every existing Add to Cart writes to it and opens the mini-cart; the header count reads from it.
- **Site Admin → Shopper session:** a **Demo cart** option: Empty · Accessories (2 items) · Roof rack + bike rack + bundle (for review).
- Totals are worked out from the cart. Delivery is a flat demo rate by method; GST is 1/11 of the total. The currency follows the region.
- The steps use the URL hash (`#shipping`, `#payment`), as Magento does. Browser Back works between them.
- No real payment: Place order validates the form, saves a fake order and goes to the confirmation page.

## 8. Decisions log (2026-09-30)

| # | Question | Answer |
|---|---|---|
| 1 | Screens | Mini-cart, cart, checkout, order confirmation. |
| 2 | Structure | **Magento 2-step, restyled**, not a one-page checkout. |
| 3 | Accounts | **Guest first**; create an account after the order. |
| 4 | Fitting | **Confirmation page only.** Nothing in the mini-cart, cart or checkout. |
| 5 | Regions | Follow the live sites (Section 6). |

## 9. Open items (for sign-off, then Mark)
- **Click & Collect before the address:** it needs a Magento checkout customisation. Confirm with Mark that it's feasible (the store-pickup module or custom layout).
- **Address autocomplete provider** (e.g. Google Places, Loqate or AddressFinder): a cost and privacy decision.
- **Ready times at checkout** need the per-store stock feed (spec.md §14.1 Phase 2); Phase 1 says "Ready within 2 business days".
- **Cross-sells in the mini-cart:** the source (Magento related or cross-sell products) and the PLP quick-add behaviour.
- **Terms tickbox:** does Legal need one?
- **Bank transfer (EFT):** keep it as an online payment method?
