// Store records (docs/store/store-spec.md Section 1) — one per store, shaped like the Magento
// store record the live page is built from, plus the fields the new page needs: structured
// hours instead of an HTML string, lat/lng instead of a pasted iframe, alt text per image, and
// per-store FAQs, areas served and showroom products.
//
// Contact details, hours, local copy (Magento seo_text) and photos are each store's own live
// page (crawled 2026-09-29); lat/lng are from its Google listing; images[].live is the live
// Magento path (the prototype's copies in _shared/stores/ are resized .webp). FAQs are drafts
// for the store teams to check — only facts from the store's own live page. onDisplay is demo
// data (real live products, invented showroom).
//
// Eleven stores: the three worked examples (North Lakes, Moorebank, Castle Hill) plus every
// store that appears in their "Other stores near …" list and has a live page (Brenton,
// 2026-09-29: every nearby card links). Sunshine Coast has no live page, so it stays unlinked.

const STORE_IMG = path => `https://www.roofracksgalore.com.au/marcwatts/theme/cache/media/product/215x190/pub/media/catalog/product/${path}`;
const STORE_LOGOS = { 'Thule': '../_shared/brand-thule.webp', 'Yakima': '../_shared/brand-yakima.webp', 'Cruz': '../_shared/brand-cruz.webp', 'Rhino-Rack': '../_shared/brand-rhino-rack.webp' };
const storeProduct = (id, brand, name, image, price, wasPrice) => ({ id, brand, brandLogo: STORE_LOGOS[brand], name, image: STORE_IMG(image), price, wasPrice, stock: 'in_stock' });
const STORE_PRODUCTS = {
  approachM: storeProduct('d1', 'Thule', 'Thule Approach M Dark Slate - 901014', 'A/p/Apporach_M_Slate_HBM6HN_1.webp', 2349.00, 4999.95),
  foothill: storeProduct('d2', 'Thule', 'Thule Tepui Foothill Roof Top Tent - 901250', 't/h/thule-tepui-foothill-roof-top-tent-901250_1.webp', 1999.00, 3999.95),
  rhinoRtt: storeProduct('d3', 'Rhino-Rack', 'Rhino Rack Low Profile Roof Top Tent - 61052', 'r/h/rhino-rack-low-profile-roof-top-tent-61052.webp', 4300.00),
  dome1300: storeProduct('d4', 'Rhino-Rack', 'Rhino Rack Dome 1300 Awning - 32141', '3/2/32141_1LHC5X_1.webp', 299.00, 427.00),
  darcheSolar: storeProduct('d5', 'Darche', 'Darche Solar Roof Top Tent - T050801577', 'd/a/darche-solar-roof-top-tent-t050801577-ba391a209d95.webp', 4999.00, 5999.00),
  cruz430: storeProduct('d6', 'Cruz', 'Cruz Easy Gloss Black 430 litre Roof Box - 940-349U', 'c/r/cruz-easy-gloss-black-430-litre-roof-box-940-349u-1b1957dc9c9b.webp', 499.00, 699.00),
  touringL: storeProduct('d7', 'Thule', 'Thule Touring L Matte Black 420 litre Roof Box - 634804', 't/h/thule-touring-l-matte-black-420-litre-roof-box-634804.webp', 899.00, 1099.95),
  easyTrip: storeProduct('d8', 'Yakima', 'Yakima EasyTrip Textured Black 550 litre Roof Box - 9812111', 'Y/a/Yakima-9812111-Roof-Boxes._1_1.webp', 1099.00, 1299.00),
  pulse2: storeProduct('d9', 'Thule', 'Thule Pulse 2 Roof Box M - 610200', 't/h/thule-pulse-2-roof-box-m-610200_1.webp', 899.95, 999.95),
  stageTwo: storeProduct('d10', 'Yakima', 'Yakima StageTwo +2 Add-On Anthracite Black - 8002727', 'y/a/yakima-stagetwo-2-add-on-anthracite-black-8002727.webp', 499.00, 749.00),
  euroway: storeProduct('d11', 'Thule', 'Thule EuroWay G2 3 Bike Tow Ball Mounted Carrier - 922020', 't/h/thule-euroway-g2-3-bike-tow-ball-mounted-carrier-922020.webp', 799.00, 1199.95),
  hangOn: storeProduct('d12', 'Thule', 'Thule HangOn Towball Mounted 4 Bike Carrier - 970805', 't/h/thule-hangon-towball-mounted-4-bike-carrier-970805.webp', 432.35, 469.95),
  twinbuzz: storeProduct('d13', 'Buzzrack', 'Buzzrack Twinbuzz H Modular Hitch Mounted Platform Rack - BR-TWINBUZZ-H', 'b/u/buzzrack-twinbuzz-h-modular-hitch-mounted-platform-rack-br-twinbuzz-h.webp', 899.00, 1300.00),
  arcos: storeProduct('d14', 'Thule', 'Thule Arcos Hitch Platform AU - 906301', 'T/h/Thule-906301-Rear-Cargo-Boxes._1.webp', 850.00)
};
const STANDARD_HOURS = { mon: ['08:30', '17:00'], tue: ['08:30', '17:00'], wed: ['08:30', '17:00'], thu: ['08:30', '17:00'], fri: ['08:30', '17:00'], sat: ['08:30', '12:30'], sun: null };

// Every store's FAQ follows the same shape — a few questions written from that store's own
// facts, then its hours and its nearest other store (both generated from the record, so they
// can't drift). These helpers keep the repeated wording in one place; the store-specific parts
// are arguments.
const faqFitting = (name, phone) => ({ q: `Can I get a roof rack fitted at ${name}?`, a: `Yes. The ${name} team installs roof racks, bike racks, awnings, roof boxes and touring accessories. Book an installation online or call the store on ${phone} to arrange a time.` });
const faqClosest = (name, askFrom, region, suburbs) => ({ q: `I’m in ${askFrom} — is ${name} my closest store?`, a: `For most of ${region}, yes. ${name} serves ${suburbs} and the surrounding suburbs.` });

const STORES = {
  // ---------- Queensland ----------
  'north-lakes': {
    name: 'North Lakes', state: 'QLD', stateName: 'Queensland', timeZone: 'Australia/Brisbane',
    url: '/roof-racks-north-lakes-superstore',
    title: 'Roof Racks Galore North Lakes | North Brisbane Roof Racks & Touring Superstore',
    metaDescription: 'Visit Roof Racks Galore North Lakes for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in North Brisbane with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'North Brisbane',
    address: { street: '1/74 Flinders Parade', suburb: 'North Lakes', postcode: '4509' },
    phone: '(07) 3103 8414', email: 'northlakes@roofracksgalore.com.au',
    lat: -27.2192, lng: 152.9964, mapUrl: 'https://maps.app.goo.gl/gCEyKzgxP1jaJkyr6',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'northlakes-outside.webp', live: '3/northlakes-outside.jpg', alt: 'Roof Racks Galore North Lakes store front on Flinders Parade' },
      { src: 'northlakes-inside-1.webp', live: '3/northlakes-inside-1.jpg', alt: 'North Lakes showroom with bike racks and Rhino-Rack displays' },
      { src: 'northlakes-inside-2.webp', live: '3/northlakes-inside-2.jpg', alt: 'North Lakes service counter and showroom' },
      { src: 'northlakes-inside-3.webp', live: '3/northlakes-inside-3.jpg', alt: 'North Lakes showroom aisle with roof rack and bike rack displays' },
      { src: 'northlakes-inside-4.webp', live: '3/northlakes-inside-4.jpg', alt: 'Roof top tents and platforms on display downstairs at North Lakes' }
    ],
    seoText: [
      'Roof Racks Galore North Lakes provides premium roof racks, cargo systems, and vehicle accessories for work, touring, and outdoor adventure across Brisbane’s northern suburbs. Whether you’re a tradie needing a reliable carrying setup, a family preparing for a holiday road trip, or an outdoor enthusiast loading up bikes, camping gear, or water sports equipment, we’ve got the right solution for your vehicle.',
      'Our experienced team offers trusted advice and professional installation, helping customers carry more and travel with confidence. We proudly serve North Lakes, Mango Hill, Kallangur, Redcliffe, Deception Bay, Narangba, Burpengary, Caboolture, and surrounding north Brisbane regions with industry-leading brands and expert service.',
      'From weekends exploring Bribie Island and Moreton Bay, to camping trips through the Sunshine Coast hinterland or adventures further north to K’gari, we’ll make sure your setup is secure, dependable, and ready for wherever the road leads.'
    ],
    areasServed: ['North Lakes', 'Mango Hill', 'Kallangur', 'Redcliffe', 'Deception Bay', 'Narangba', 'Burpengary', 'Caboolture'],
    onDisplay: ['approachM', 'foothill', 'rhinoRtt', 'dome1300', 'cruz430', 'touringL', 'hangOn'],
    faqs: [
      { q: 'Can the North Lakes team set my vehicle up for Bribie Island, Moreton Bay or K’gari?', a: 'Yes. Bring your vehicle in and tell the team what you’re carrying and where you’re headed. They’ll recommend a setup to suit it, from roof racks and platforms to awnings and roof top tents, and can fit it for you in store.' },
      faqFitting('North Lakes', '(07) 3103 8414'),
      faqClosest('North Lakes', 'Redcliffe or Caboolture', 'Brisbane’s north', 'Mango Hill, Kallangur, Redcliffe, Deception Bay, Narangba, Burpengary, Caboolture'),
      { q: 'Can I see roof top tents and awnings in person at North Lakes?', a: 'Yes. The North Lakes showroom has roof top tents, awnings, roof boxes and bike racks on display, so you can see how they open, pack down and mount before you buy. Call ahead if you’re coming in for a particular model.' },
      { hours: true }, { nearest: true }
    ]
  },
  'kedron': {
    name: 'Kedron', state: 'QLD', stateName: 'Queensland', timeZone: 'Australia/Brisbane',
    url: '/roof-racks-kedron-superstore',
    title: 'Roof Racks Galore Kedron | North Brisbane Roof Racks & Touring Superstore',
    metaDescription: 'Visit Roof Racks Galore Kedron for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in Brisbane’s northside with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'North Brisbane',
    address: { street: '1/14 Boothby St', suburb: 'Kedron', postcode: '4031' },
    phone: '(07) 3350 3711', email: 'kedron@roofracksgalore.com.au',
    lat: -27.3972, lng: 153.0294, mapUrl: 'https://goo.gl/maps/FGRrDi9CrZS2',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'kedron-1.webp', live: '2/kedron-1.jpg', alt: 'Roof Racks Galore Kedron store front with a roof top tent set up out the front' },
      { src: 'kedron-2.webp', live: '2/kedron-2.jpg', alt: 'Roof rack foot packs and fit kits on the Kedron showroom wall' },
      { src: 'kedron-4.webp', live: '2/kedron-4.jpg', alt: 'Rhino-Rack accessories and Prorack displays at Kedron' },
      { src: 'kedron-8.webp', live: '2/kedron-8.jpg', alt: 'Kedron showroom with roof boxes and bags on display' },
      { src: 'kedron-9.webp', live: '2/kedron-9.jpg', alt: 'Tow ball bike racks on display at Kedron' }
    ],
    // Kedron's live copy is a single paragraph with no suburb list, so no "Areas we serve".
    seoText: [
      'As the original Roof Racks Galore store, Kedron has been serving Brisbane since 1989—a true local institution for roof racks, accessories, and expert installation. Whether you need to outfit your vehicle for work, travel, or weekend getaways, our knowledgeable team is here to help with leading brands and professional service.'
    ],
    areasServed: [],
    onDisplay: ['hangOn', 'euroway', 'cruz430', 'touringL', 'dome1300', 'stageTwo'],
    faqs: [
      { q: 'Is Kedron the original Roof Racks Galore store?', a: 'Yes. Kedron is where Roof Racks Galore started, and it’s been serving Brisbane since 1989.' },
      { q: 'Can the Kedron team fit out my work vehicle?', a: 'Yes. Whether you need to outfit your vehicle for work, travel or weekend getaways, the Kedron team can recommend the right roof racks and accessories and fit them for you in store.' },
      faqFitting('Kedron', '(07) 3350 3711'),
      { q: 'Can I see bike racks and roof boxes in person at Kedron?', a: 'Yes. The Kedron showroom has tow ball bike racks, roof boxes and roof rack parts on display, so you can see how they fit together before you buy. Call ahead if you’re coming in for a particular model.' },
      { hours: true }, { nearest: true }
    ]
  },
  'east-brisbane': {
    name: 'East Brisbane', state: 'QLD', stateName: 'Queensland', timeZone: 'Australia/Brisbane',
    url: '/roof-racks-east-brisbane-superstore',
    title: 'Roof Racks Galore East Brisbane | Brisbane Roof Racks & Touring Superstore',
    // Live says "Conveniently located in Gold Coast southside" — corrected here.
    metaDescription: 'Visit Roof Racks Galore East Brisbane for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in East Brisbane with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'Brisbane',
    address: { street: '46 Caswell St', suburb: 'East Brisbane', postcode: '4169' },
    phone: '(07) 3256 3630', email: 'eastbrisbane@roofracksgalore.com.au',
    lat: -27.4888, lng: 153.0476, mapUrl: 'https://goo.gl/maps/JAqUCMi5rYmZhZ1T7',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'eastbrisbane-outside.webp', live: '8/eastbrisbane-outside.jpg', alt: 'Roof Racks Galore East Brisbane store front on Caswell Street' },
      { src: 'eastbrisbane-inside-1.webp', live: '8/eastbrisbane-inside-1.jpg', alt: 'East Brisbane showroom aisle with Rhino-Rack displays' },
      { src: 'eastbrisbane-inside-2.webp', live: '8/eastbrisbane-inside-2.jpg', alt: 'Roof racks and platforms on the East Brisbane showroom floor' },
      { src: 'eastbrisbane-inside-4.webp', live: '8/eastbrisbane-inside-4.jpg', alt: 'Bike racks on display at East Brisbane' },
      { src: 'eastbrisbane-inside-5.webp', live: '8/eastbrisbane-inside-5.jpg', alt: 'Roof boxes and bike racks in the East Brisbane showroom' }
    ],
    seoText: [
      'Roof Racks Galore East Brisbane provides premium roof racks, cargo systems, and vehicle accessories for work, touring, and everyday adventure. Whether you’re a tradie needing a durable carrying solution, a cyclist heading out for weekend rides, or a family preparing for a camping getaway, we’ve got the gear to help you travel smarter and carry more with confidence.',
      'Our experienced team offers trusted advice and professional installation, helping customers find the right setup for their vehicle and lifestyle. We proudly serve East Brisbane, Woolloongabba, Coorparoo, Camp Hill, Morningside, Norman Park, Carindale, Bulimba, and surrounding Brisbane suburbs with industry-leading brands and expert service.',
      'From weekends exploring Moreton Bay and the Scenic Rim, to camping trips on K’gari and road trips along the Sunshine Coast, we’ll make sure your setup is secure, dependable, and ready for wherever the road takes you.'
    ],
    areasServed: ['East Brisbane', 'Woolloongabba', 'Coorparoo', 'Camp Hill', 'Morningside', 'Norman Park', 'Carindale', 'Bulimba'],
    onDisplay: ['stageTwo', 'euroway', 'twinbuzz', 'hangOn', 'easyTrip', 'dome1300'],
    faqs: [
      { q: 'Can the East Brisbane team set my vehicle up for the Scenic Rim or a K’gari camping trip?', a: 'Yes. Bring your vehicle in and tell the team what you’re carrying and where you’re headed. They’ll recommend a setup to suit it and can fit it for you in store.' },
      { q: 'I ride on weekends — can East Brisbane help me choose a bike rack?', a: 'Yes. The East Brisbane showroom has bike racks on display, from tow ball to hitch-mounted, so you can compare how they load before you buy, and the team can fit one to your vehicle.' },
      faqFitting('East Brisbane', '(07) 3256 3630'),
      faqClosest('East Brisbane', 'Coorparoo or Carindale', 'Brisbane’s inner east', 'Woolloongabba, Coorparoo, Camp Hill, Morningside, Norman Park, Carindale, Bulimba'),
      { hours: true }, { nearest: true }
    ]
  },
  'rocklea': {
    name: 'Rocklea', state: 'QLD', stateName: 'Queensland', timeZone: 'Australia/Brisbane',
    url: '/roof-racks-rocklea-superstore',
    title: 'Roof Racks Galore Rocklea | Brisbane South West Roof Racks & Touring Superstore',
    metaDescription: 'Visit Roof Racks Galore Rocklea for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in Brisbane\'s South West with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'South West Brisbane',
    address: { street: '2/1620 Ipswich Road', suburb: 'Rocklea', postcode: '4106' },
    phone: '(07) 3277 5722', email: 'rocklea@roofracksgalore.com.au',
    lat: -27.5576, lng: 153.0049, mapUrl: 'https://goo.gl/maps/HxDPHYUJnYm',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'rocklea-outside.webp', live: '1/Rocklea-outside.png', alt: 'Roof Racks Galore Rocklea store front on Ipswich Road' },
      { src: 'rocklea-2.webp', live: '1/Rocklea-2.png', alt: 'Rocklea service counter with roof boxes on display behind' },
      { src: 'rocklea-3.webp', live: '1/Rocklea-3.png', alt: 'Rocklea showroom with platforms and bike racks' },
      { src: 'rocklea-4.webp', live: '1/Rocklea-4.png', alt: 'Recovery boards and Rhino-Rack accessories on the Rocklea wall' }
    ],
    seoText: [
      'Roof Racks Galore Rocklea provides premium roof racks, cargo systems, and vehicle accessories for work, touring, and everyday adventure across Brisbane’s south-west. Whether you’re a tradie needing a dependable carrying setup, a family preparing for a road trip, or an outdoor enthusiast loading up bikes, camping gear, or water sports equipment, we’ve got the right solution for your vehicle.',
      'Our experienced team offers trusted advice and professional installation, helping customers carry more and travel with confidence. We proudly serve Rocklea, Salisbury, Acacia Ridge, Moorooka, Oxley, Sherwood, Archerfield, and surrounding Brisbane suburbs with industry-leading brands and expert service.',
      'From weekends exploring the Scenic Rim and Moreton Bay, to camping trips along the Sunshine Coast or adventures further north to K’gari, we’ll make sure your setup is secure, reliable, and ready for wherever the journey takes you.'
    ],
    areasServed: ['Rocklea', 'Salisbury', 'Acacia Ridge', 'Moorooka', 'Oxley', 'Sherwood', 'Archerfield'],
    onDisplay: ['cruz430', 'pulse2', 'foothill', 'dome1300', 'hangOn', 'arcos'],
    faqs: [
      { q: 'Can the Rocklea team set my vehicle up for the Scenic Rim or a trip to K’gari?', a: 'Yes. Bring your vehicle in and tell the team what you’re carrying and where you’re headed. They’ll recommend a setup to suit it, from roof racks and platforms to recovery gear, and can fit it for you in store.' },
      faqFitting('Rocklea', '(07) 3277 5722'),
      faqClosest('Rocklea', 'Oxley or Acacia Ridge', 'Brisbane’s south-west', 'Salisbury, Acacia Ridge, Moorooka, Oxley, Sherwood, Archerfield'),
      { q: 'Can I see roof boxes and platforms in person at Rocklea?', a: 'Yes. The Rocklea showroom has roof boxes, platforms, bike racks and recovery gear on display, so you can check sizes and mounting before you buy. Call ahead if you’re coming in for a particular model.' },
      { hours: true }, { nearest: true }
    ]
  },

  // ---------- New South Wales ----------
  'moorebank': {
    name: 'Moorebank', state: 'NSW', stateName: 'New South Wales', timeZone: 'Australia/Sydney',
    url: '/roof-racks-moorebank-superstore',
    title: 'Roof Racks Galore Moorebank | Sydney South West Racks & Touring Superstore',
    metaDescription: 'Visit Roof Racks Galore Moorebank for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in South West Sydney with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'South West Sydney',
    address: { street: '12 Centenary Ave', suburb: 'Moorebank', postcode: '2170' },
    phone: '(02) 9053 8621', email: 'moorebank@roofracksgalore.com.au',
    lat: -33.9400, lng: 150.9344, mapUrl: 'https://maps.app.goo.gl/371QHZWa4pDU4qzA7',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'moorebank-outside.webp', live: '43/moorebank-outside.webp', alt: 'Roof Racks Galore Moorebank store front on Centenary Avenue' },
      { src: 'moorebank-inside1.webp', live: '43/moorebank-inside1.webp', alt: 'Moorebank showroom wall with roof boxes and Kaon accessories' },
      { src: 'moorebank-inside2.webp', live: '43/moorebank-inside2.webp', alt: 'Yakima display and bike trays in the Moorebank showroom' },
      { src: 'moorebank-inside3.webp', live: '43/moorebank-inside3.webp', alt: 'Yakima wall and service counter at Moorebank' },
      { src: 'moorebank-inside4.webp', live: '43/moorebank-inside4.webp', alt: 'Lighting and roof rack accessory displays at Moorebank' },
      { src: 'moorebank-inside5.webp', live: '43/moorebank-inside5.webp', alt: 'Bike racks and a Yakima display at Moorebank' },
      { src: 'moorebank-inside6.webp', live: '43/moorebank-inside6.webp', alt: 'Roof boxes on display at Moorebank' },
      { src: 'moorebank-inside7.webp', live: '43/moorebank-inside7.webp', alt: 'Yakima roof rack wall at Moorebank' }
    ],
    seoText: [
      'Roof Racks Galore Moorebank provides premium roof racks, cargo systems, and vehicle accessories for work, touring, and everyday adventure across Sydney’s south-west. Whether you’re a tradie needing a reliable carrying setup, a family preparing for a road trip, or an outdoor enthusiast loading up bikes, camping gear, kayaks, or touring equipment, we’ve got the right solution for your vehicle.',
      'Our experienced team offers trusted advice and professional installation, helping customers carry more and travel with confidence. We proudly serve Moorebank, Liverpool, Casula, Wattle Grove, Chipping Norton, Prestons, Holsworthy, and surrounding south-west Sydney suburbs with industry-leading brands and expert service.',
      'From weekends exploring the Blue Mountains and NSW coastline, to camping trips through the South Coast or adventures further inland, we’ll make sure your setup is secure, dependable, and ready for wherever the road leads.'
    ],
    areasServed: ['Moorebank', 'Liverpool', 'Casula', 'Wattle Grove', 'Chipping Norton', 'Prestons', 'Holsworthy'],
    onDisplay: ['easyTrip', 'touringL', 'pulse2', 'stageTwo', 'euroway', 'twinbuzz', 'arcos'],
    faqs: [
      { q: 'Can the Moorebank team set my vehicle up for a South Coast or Blue Mountains trip?', a: 'Yes. Bring your vehicle in and tell the team what you’re carrying — bikes, kayaks, camping gear — and where you’re headed. They’ll recommend a setup to suit it and can fit it for you in store.' },
      faqFitting('Moorebank', '(02) 9053 8621'),
      faqClosest('Moorebank', 'Liverpool or Prestons', 'south-west Sydney', 'Liverpool, Casula, Wattle Grove, Chipping Norton, Prestons, Holsworthy'),
      { q: 'Can I see bike racks and roof boxes in person at Moorebank?', a: 'Yes. The Moorebank showroom has roof boxes and bike racks — tow ball, hitch and tray-mounted — on display, so you can compare sizes and see how they mount before you buy. Call ahead if you’re coming in for a particular model.' },
      { hours: true }, { nearest: true }
    ]
  },
  'castle-hill': {
    name: 'Castle Hill', state: 'NSW', stateName: 'New South Wales', timeZone: 'Australia/Sydney',
    url: '/roof-racks-castle-hill-superstore',
    title: 'Roof Racks Galore Castle Hill | Sydney Roof Racks & Touring Superstore',
    metaDescription: 'Visit Roof Racks Galore Castle Hill for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in Sydney\'s northside with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'North West Sydney',
    address: { street: '3/8 Anella Avenue', suburb: 'Castle Hill', postcode: '2154' },
    phone: '(02) 9899 3256', email: 'castlehill@roofracksgalore.com.au',
    lat: -33.7252, lng: 150.9775, mapUrl: 'https://goo.gl/maps/QebgyjaDAjpKVDw96',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'castlehill-front.webp', live: '18/castlehill-front.jpg', alt: 'Roof Racks Galore Castle Hill store front on Anella Avenue' },
      { src: 'castlehill-inside-1.webp', live: '18/castlehill-inside-1.jpg', alt: 'Castle Hill showroom with roof top tents, awnings and roof boxes on display' },
      { src: 'castlehill-inside-2.webp', live: '18/castlehill-inside-2.jpg', alt: 'Castle Hill showroom aisle with bike racks and accessories' }
    ],
    seoText: [
      'Roof Racks Galore Castle Hill provides premium roof racks, cargo systems, and vehicle accessories for work, travel, and outdoor adventure across Sydney’s north-west. Whether you’re a tradie needing extra carrying capacity, a family preparing for a holiday road trip, or an outdoor enthusiast loading up bikes, kayaks, or camping gear, we’ve got the right setup for your vehicle.',
      'Our experienced team offers trusted advice and professional installation, helping customers travel with confidence and convenience. We proudly serve Castle Hill, Baulkham Hills, Kellyville, Bella Vista, Dural, Glenhaven, Rouse Hill, Parramatta, and surrounding suburbs with industry-leading brands and expert service.',
      'From weekends exploring the Blue Mountains and Hawkesbury region, to coastal escapes along the NSW coastline or camping trips further afield, we’ll help make sure your setup is secure, reliable, and ready for the journey ahead.'
    ],
    areasServed: ['Castle Hill', 'Baulkham Hills', 'Kellyville', 'Bella Vista', 'Dural', 'Glenhaven', 'Rouse Hill', 'Parramatta'],
    onDisplay: ['foothill', 'darcheSolar', 'dome1300', 'cruz430', 'easyTrip', 'hangOn'],
    faqs: [
      { q: 'Can the Castle Hill team set my vehicle up for the Blue Mountains or the Hawkesbury?', a: 'Yes. Bring your vehicle in and tell the team what you’re carrying and where you’re headed. They’ll recommend a setup to suit it, from roof racks and bike carriers to awnings and roof top tents, and can fit it for you in store.' },
      faqFitting('Castle Hill', '(02) 9899 3256'),
      faqClosest('Castle Hill', 'Kellyville or Parramatta', 'Sydney’s north-west', 'Baulkham Hills, Kellyville, Bella Vista, Dural, Glenhaven, Rouse Hill, Parramatta'),
      { q: 'Can I see roof top tents in person at Castle Hill?', a: 'Yes. The Castle Hill showroom has roof top tents and awnings on display alongside roof boxes and bike racks, so you can see how they open and pack down before you buy. Call ahead if you’re coming in for a particular model.' },
      { hours: true }, { nearest: true }
    ]
  },
  'silverwater': {
    name: 'Silverwater', state: 'NSW', stateName: 'New South Wales', timeZone: 'Australia/Sydney',
    url: '/roof-racks-silverwater-superstore',
    title: 'Roof Racks Galore Silverwater | Sydney Western Suburbs Roof Racks & Touring Superstore',
    metaDescription: 'Visit Roof Racks Galore Silverwater for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in Sydney Western Suburbs with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'Western Sydney',
    address: { street: '104 Wetherill St N', suburb: 'Silverwater', postcode: '2128' },
    phone: '(02) 8007 6155', email: 'silverwater@roofracksgalore.com.au',
    lat: -33.8374, lng: 151.0445, mapUrl: 'https://maps.app.goo.gl/NCofTPDD28BDfZRv5',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'silverwater-outside-1.webp', live: '29/silverwater-outside-1.jpg', alt: 'Roof Racks Galore Silverwater store front on Wetherill Street' },
      { src: 'silverwater-inside-1.webp', live: '29/silverwater-inside-1.jpg', alt: 'Bike racks and Tigerz11 displays in the Silverwater showroom' },
      { src: 'silverwater-inside-2.webp', live: '29/silverwater-inside-2.jpg', alt: 'Silverwater service counter with Front Runner and Rhino-Rack displays' },
      { src: 'silverwater-inside-3.webp', live: '29/silverwater-inside-3.jpg', alt: 'Yakima and Thule roof rack walls at Silverwater' },
      { src: 'silverwater-inside-4.webp', live: '29/silverwater-inside-4.jpg', alt: 'Roof boxes and bike racks on the Silverwater showroom floor' }
    ],
    seoText: [
      'Roof Racks Galore Silverwater provides premium roof racks, cargo systems, and vehicle accessories for work, travel, and outdoor adventure across Sydney’s western suburbs. Whether you’re a tradie needing a reliable carrying setup, a family preparing for a holiday road trip, or an outdoor enthusiast loading up bikes, camping gear, kayaks, or touring equipment, we’ve got the right solution for your vehicle.',
      'Our experienced team offers trusted advice and professional installation, helping customers carry more and travel with confidence. We proudly serve Silverwater, Auburn, Parramatta, Lidcombe, Homebush, Ryde, Granville, and surrounding western Sydney suburbs with industry-leading brands and expert service.',
      'From weekends exploring the Blue Mountains and NSW coastline, to camping trips through the South Coast or adventures further inland, we’ll make sure your setup is secure, dependable, and ready for wherever the road leads.'
    ],
    areasServed: ['Silverwater', 'Auburn', 'Parramatta', 'Lidcombe', 'Homebush', 'Ryde', 'Granville'],
    onDisplay: ['touringL', 'pulse2', 'euroway', 'hangOn', 'stageTwo', 'approachM'],
    faqs: [
      { q: 'Can the Silverwater team set my vehicle up for the Blue Mountains or a South Coast trip?', a: 'Yes. Bring your vehicle in and tell the team what you’re carrying — bikes, kayaks, camping gear — and where you’re headed. They’ll recommend a setup to suit it and can fit it for you in store.' },
      faqFitting('Silverwater', '(02) 8007 6155'),
      faqClosest('Silverwater', 'Auburn or Ryde', 'Sydney’s western suburbs', 'Auburn, Parramatta, Lidcombe, Homebush, Ryde, Granville'),
      { q: 'Can I compare Yakima and Thule roof racks in person at Silverwater?', a: 'Yes. The Silverwater showroom has Yakima and Thule roof rack walls side by side, plus roof boxes and bike racks, so you can compare them before you buy. Call ahead if you’re coming in for a particular model.' },
      { hours: true }, { nearest: true }
    ]
  },
  'smeaton-grange': {
    name: 'Smeaton Grange', state: 'NSW', stateName: 'New South Wales', timeZone: 'Australia/Sydney',
    url: '/roof-racks-smeaton-grange-superstore',
    title: 'Roof Racks Galore Smeaton Grange | Sydney South West Roof Racks & Touring Superstore',
    metaDescription: 'Visit Roof Racks Galore Smeaton Grange for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in Sydney\'s South West with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'South West Sydney',
    address: { street: '3/18 Exchange Parade', suburb: 'Smeaton Grange', postcode: '2567' },
    phone: '(02) 8215 7092', email: 'smeatongrange@roofracksgalore.com.au',
    lat: -34.0390, lng: 150.7454, mapUrl: 'https://maps.app.goo.gl/Khp5w9LoxReciEho7',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'smeaton-6.webp', live: '34/smeaton-6.jpg', alt: 'Roof Racks Galore Smeaton Grange store front on Exchange Parade' },
      { src: 'smeaton-2.webp', live: '34/smeaton-2.jpg', alt: 'Smeaton Grange showroom with the service counter and bike racks' },
      { src: 'smeaton-3.webp', live: '34/smeaton-3.jpg', alt: 'Rhino-Rack accessory wall at Smeaton Grange' },
      { src: 'smeaton-4.webp', live: '34/smeaton-4.jpg', alt: 'Platforms and bike racks on the Smeaton Grange showroom floor' },
      { src: 'smeaton-5.webp', live: '34/smeaton-5.jpg', alt: 'Roof boxes and camp chairs on display at Smeaton Grange' }
    ],
    seoText: [
      'Roof Racks Galore Smeaton Grange provides premium roof racks, cargo systems, and vehicle accessories for work, touring, and outdoor adventure across Sydney’s south-west. Whether you’re a tradie needing a durable carrying setup, a family preparing for a road trip, or an outdoor enthusiast loading up bikes, camping gear, or water sports equipment, we’ve got the right solution for your vehicle.',
      'Our experienced team offers trusted advice and professional installation, helping customers carry more and travel with confidence. We proudly serve Smeaton Grange, Camden, Narellan, Gregory Hills, Campbelltown, Oran Park, Harrington Park, and surrounding south-west Sydney suburbs with industry-leading brands and expert service.',
      'From weekends exploring the Southern Highlands and NSW South Coast, to camping trips through the Blue Mountains or adventures further inland, we’ll make sure your setup is secure, dependable, and ready for wherever the road leads.'
    ],
    areasServed: ['Smeaton Grange', 'Camden', 'Narellan', 'Gregory Hills', 'Campbelltown', 'Oran Park', 'Harrington Park'],
    onDisplay: ['easyTrip', 'cruz430', 'foothill', 'dome1300', 'twinbuzz', 'hangOn'],
    faqs: [
      { q: 'Can the Smeaton Grange team set my vehicle up for the Southern Highlands or the South Coast?', a: 'Yes. Bring your vehicle in and tell the team what you’re carrying and where you’re headed. They’ll recommend a setup to suit it and can fit it for you in store.' },
      faqFitting('Smeaton Grange', '(02) 8215 7092'),
      faqClosest('Smeaton Grange', 'Camden or Campbelltown', 'Sydney’s south-west', 'Camden, Narellan, Gregory Hills, Campbelltown, Oran Park, Harrington Park'),
      { q: 'Can I see roof boxes and platforms in person at Smeaton Grange?', a: 'Yes. The Smeaton Grange showroom has roof boxes, platforms and bike racks on display, so you can check sizes and mounting before you buy. Call ahead if you’re coming in for a particular model.' },
      { hours: true }, { nearest: true }
    ]
  },
  'miranda': {
    name: 'Miranda', state: 'NSW', stateName: 'New South Wales', timeZone: 'Australia/Sydney',
    url: '/roof-racks-miranda-superstore',
    title: 'Roof Racks Galore Miranda | South Sydney Racks & Touring Superstore',
    metaDescription: 'Visit Roof Racks Galore Miranda for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in South East Sydney with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'South Sydney',
    address: { street: '132 Wyralla Road', suburb: 'Miranda', postcode: '2228' },
    phone: '(02) 9526 2777', email: 'miranda@roofracksgalore.com.au',
    lat: -34.0391, lng: 151.0892, mapUrl: 'https://goo.gl/maps/f3wCEmtgtHEGBPcn8',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'miranda-store-1.webp', live: '17/miranda-store-1.jpg', alt: 'Roof Racks Galore Miranda store front on Wyralla Road' },
      { src: 'miranda-store-2.webp', live: '17/miranda-store-2.jpg', alt: 'Bike racks and roof rack displays in the Miranda showroom' },
      { src: 'miranda-store-3.webp', live: '17/miranda-store-3.jpg', alt: 'Miranda showroom with bike racks and accessories' },
      { src: 'miranda-store-4.webp', live: '17/miranda-store-4.jpg', alt: 'Roof rack and bike rack displays along the Miranda showroom' }
    ],
    seoText: [
      'Roof Racks Galore Miranda provides premium roof racks, cargo systems, and vehicle accessories for work, travel, and outdoor adventure across Sydney’s south. Whether you’re a tradie needing a practical carrying setup, a family preparing for a holiday road trip, or an outdoor enthusiast loading up bikes, camping gear, or water sports equipment, we’ve got the right solution for your vehicle.',
      'Our experienced team offers trusted advice and professional installation, helping customers travel with confidence and convenience. We proudly serve Miranda, Sutherland, Caringbah, Cronulla, Menai, Engadine, Kirrawee, and surrounding southern Sydney suburbs with industry-leading brands and expert service.',
      'From weekends exploring the Royal National Park and NSW coastline, to camping trips through the South Coast or adventures further inland, we’ll make sure your setup is secure, reliable, and ready for wherever the journey takes you.'
    ],
    areasServed: ['Miranda', 'Sutherland', 'Caringbah', 'Cronulla', 'Menai', 'Engadine', 'Kirrawee'],
    onDisplay: ['hangOn', 'euroway', 'stageTwo', 'arcos', 'cruz430', 'pulse2'],
    faqs: [
      { q: 'Can the Miranda team set my vehicle up for the Royal National Park or a South Coast trip?', a: 'Yes. Bring your vehicle in and tell the team what you’re carrying — bikes, camping gear, water sports equipment — and where you’re headed. They’ll recommend a setup to suit it and can fit it for you in store.' },
      faqFitting('Miranda', '(02) 9526 2777'),
      faqClosest('Miranda', 'Cronulla or Sutherland', 'southern Sydney', 'Sutherland, Caringbah, Cronulla, Menai, Engadine, Kirrawee'),
      { q: 'Can I see bike racks in person at Miranda?', a: 'Yes. The Miranda showroom has bike racks on display alongside roof racks and accessories, so you can see how they load and mount before you buy. Call ahead if you’re coming in for a particular model.' },
      { hours: true }, { nearest: true }
    ]
  },
  'warriewood': {
    name: 'Warriewood', state: 'NSW', stateName: 'New South Wales', timeZone: 'Australia/Sydney',
    url: '/roof-racks-warriewood-superstore',
    title: 'Roof Racks Galore Warriewood | North Sydney Racks & Touring Superstore',
    metaDescription: 'Visit Roof Racks Galore Warriewood for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in North Sydney with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'Northern Beaches',
    address: { street: '18/3 Vuko Place', suburb: 'Warriewood', postcode: '2102' },
    phone: '(02) 8007 6177', email: 'warriewood@roofracksgalore.com.au',
    lat: -33.6929, lng: 151.2998, mapUrl: 'https://maps.app.goo.gl/paxnS1CPK26xbeC59',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'warriewood.webp', live: '42/warriewood.png', alt: 'Roof Racks Galore Warriewood store on Vuko Place' },
      { src: 'warriewood-1.webp', live: '42/warriewood-1.jpg', alt: 'Roof boxes and a bike rack on display at Warriewood' },
      { src: 'warriewood-2.webp', live: '42/warriewood-2.jpg', alt: 'Warriewood showroom seen from the mezzanine stairs' },
      { src: 'warriewood-3.webp', live: '42/warriewood-3.jpg', alt: 'Rhino-Rack accessory wall and showroom floor at Warriewood' },
      { src: 'warriewood-4.webp', live: '42/warriewood-4.jpg', alt: 'Warriewood showroom from the mezzanine' }
    ],
    seoText: [
      'Roof Racks Galore Warriewood provides premium roof racks, cargo systems, and vehicle accessories for work, travel, and coastal adventure across Sydney’s Northern Beaches. Whether you’re a tradie needing a practical carrying setup, a surfer heading to the beach, or a family preparing for a camping trip or holiday getaway, we’ve got the right solution for your vehicle.',
      'Our experienced team offers trusted advice and professional installation, helping customers carry more and travel with confidence. We proudly serve Warriewood, Mona Vale, Narrabeen, Dee Why, Collaroy, Avalon Beach, Brookvale, and surrounding Northern Beaches suburbs with industry-leading brands and expert service.',
      'From weekends exploring the NSW coastline and Ku-ring-gai Chase National Park, to camping trips through the Blue Mountains or road trips along the South Coast, we’ll make sure your setup is secure, dependable, and ready for wherever the journey takes you.'
    ],
    areasServed: ['Warriewood', 'Mona Vale', 'Narrabeen', 'Dee Why', 'Collaroy', 'Avalon Beach', 'Brookvale'],
    onDisplay: ['cruz430', 'touringL', 'easyTrip', 'hangOn', 'stageTwo', 'dome1300'],
    faqs: [
      { q: 'Can Warriewood set my car up to carry surfboards or a SUP?', a: 'Yes. SUP and surfboard carriers are part of our water sports range, and the Warriewood team can recommend one to suit your vehicle and fit it for you in store.' },
      faqFitting('Warriewood', '(02) 8007 6177'),
      faqClosest('Warriewood', 'Dee Why or Avalon Beach', 'the Northern Beaches', 'Mona Vale, Narrabeen, Dee Why, Collaroy, Avalon Beach, Brookvale'),
      { q: 'Can the Warriewood team set my vehicle up for Ku-ring-gai Chase or a Blue Mountains camping trip?', a: 'Yes. Bring your vehicle in and tell the team what you’re carrying and where you’re headed. They’ll recommend a setup to suit it and can fit it for you in store.' },
      { hours: true }, { nearest: true }
    ]
  },
  'matraville': {
    name: 'Matraville', state: 'NSW', stateName: 'New South Wales', timeZone: 'Australia/Sydney',
    url: '/roof-racks-matraville-superstore',
    title: 'Roof Racks Galore Matraville | Sydney Eastern Suburbs Roof Racks & Touring Superstore',
    metaDescription: 'Visit Roof Racks Galore Matraville for roof racks, bike racks, roof boxes, platforms, camping and touring accessories. Conveniently located in Sydney\'s Eastern Suburbs with expert advice, professional fitting and products from leading brands including Rhino-Rack, Thule and Yakima.',
    area: 'Eastern Suburbs',
    address: { street: '35 Raymond Avenue', suburb: 'Matraville', postcode: '2036' },
    phone: '(02) 9159 6777', email: 'matraville@roofracksgalore.com.au',
    lat: -33.9612, lng: 151.2203, mapUrl: 'https://maps.app.goo.gl/U7Cfof4Wkkk77KqM8',
    hours: STANDARD_HOURS, clickAndCollect: true,
    images: [
      { src: 'matraville-outside-1.webp', live: '28/matraville-outside-1.jpg', alt: 'Roof Racks Galore Matraville store on Raymond Avenue' },
      { src: 'matraville-inside-1.webp', live: '28/matraville-inside-1.jpg', alt: 'Matraville showroom and service counter' },
      { src: 'matraville-inside-2.webp', live: '28/matraville-inside-2.jpg', alt: 'Thule and Rhino-Rack displays at Matraville' },
      { src: 'matraville-inside-3.webp', live: '28/matraville-inside-3.jpg', alt: 'Recovery gear and roof rack accessory displays at Matraville' }
    ],
    seoText: [
      'Roof Racks Galore Matraville provides premium roof racks, cargo systems, and vehicle accessories for work, travel, and coastal adventure across Sydney’s eastern suburbs. Whether you’re a tradie needing a reliable carrying setup, a surfer chasing the next swell, or a family preparing for a weekend getaway, we’ve got the right solution for your vehicle.',
      'Our experienced team offers trusted advice and professional installation, helping customers carry more and travel with confidence. We proudly serve Matraville, Maroubra, Botany, Mascot, Randwick, Coogee, Eastgardens, Alexandria, and surrounding eastern Sydney suburbs with industry-leading brands and expert service.',
      'From weekends exploring the NSW coastline and Royal National Park, to camping trips through the Blue Mountains or surf escapes down the South Coast, we’ll make sure your setup is secure, dependable, and ready for wherever the road leads.'
    ],
    areasServed: ['Matraville', 'Maroubra', 'Botany', 'Mascot', 'Randwick', 'Coogee', 'Eastgardens', 'Alexandria'],
    onDisplay: ['touringL', 'pulse2', 'cruz430', 'hangOn', 'euroway', 'dome1300'],
    faqs: [
      { q: 'Can Matraville set my car up to carry surfboards for a South Coast trip?', a: 'Yes. SUP and surfboard carriers are part of our water sports range, and the Matraville team can recommend one to suit your vehicle and fit it for you in store.' },
      faqFitting('Matraville', '(02) 9159 6777'),
      faqClosest('Matraville', 'Maroubra or Randwick', 'Sydney’s eastern suburbs', 'Maroubra, Botany, Mascot, Randwick, Coogee, Eastgardens, Alexandria'),
      { q: 'Can I see Thule and Rhino-Rack gear in person at Matraville?', a: 'Yes. The Matraville showroom has Thule and Rhino-Rack displays alongside roof rack accessories and recovery gear, so you can see what suits your vehicle before you buy. Call ahead if you’re coming in for a particular model.' },
      { hours: true }, { nearest: true }
    ]
  }
};
