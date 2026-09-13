// Header & Mega Menu — real navigation content, crawled live from roofracksgalore.com.au
// via Playwright (2026-09-13) and restructured to the Figma cascade (header-spec.md
// Section 3.6): Level 1 = category, Level 2 = "Shop " + each real column heading (+ a
// generated "View All"), Level 3 = that column's real leaf links. See header-spec.md
// Section 4 Open Questions 9/10 for why there's no "Shop By Vehicle" entry and why
// "Brands" reuses the live site's own Brands panel content instead of a special case.
//
// Every leaf `href` below is "#" — the live-site crawl captured labels/hierarchy only,
// not per-link URLs (only the top-level utility links in header-spec.md Section 3.3 have
// confirmed real paths). Wire real Magento category URLs at integration time, same
// placeholder-until-supplied convention as the plain nav links (Store Finder etc.).

const HEADER_NAV = [
  {
    label: 'Roof Racks',
    href: '#',
    // Test content for the merchandising promo tile (header-spec.md, 2026-09-13): assigned
    // per Level 1 category (shown in the Level 2 column) *and* independently per Level 2
    // column (shown in the Level 3 column) — set here on only one category and one of its
    // columns on purpose, to prove both the independent-assignment behaviour and the
    // no-fallback behaviour (every other category/column below has no promoTile at all,
    // so their Level 2/3 promo bar shouldn't render). See mmPromoTileHTML() in mega-menu.js.
    promoTile: { image: '../_shared/promo-merch-1.png', eyebrow: 'New Product Release', label: 'Rhino Rack Roof Top Tent', href: '#' },
    columns: [
      { heading: 'Roof Racks', links: ['Cruz Roof Racks', 'Rhino Rack Roof Racks', 'Thule Roof Racks', 'Yakima Roof Racks', 'Yakima StreamLine', 'Prorack Roof Racks', 'Front Runner Roof Racks', 'Wedgetail Roof Racks', 'TreeFrog Roof Racks', 'Van Racks', 'Canopy Roof Racks', 'Ute Racks', 'DropRacks Roof Racks', 'Turtle Roof Racks'].map(mkLink) },
      { heading: 'Roof Bars', links: ['Thule Roof Bars', 'Prorack Bars', 'Rhino Rack Cross Bars', 'Rhino Rack Stealthbars', 'Yakima Roof Bars', 'Yakima StreamLine Bars', 'Thule Leg Packs', 'Yakima Leg Packs', 'Rhino Rack Leg Packs', 'Cruz Leg Packs', 'Tracklander Legs'].map(mkLink) },
      { heading: 'Roof Rack Tracks', links: ['Rhino Rack Tracks', 'Yakima Tracks', 'Prorack Tracks', 'Canopy Tracks'].map(mkLink) },
      { heading: 'Roof Rack Fitting Kits', links: ['Prorack Fitting Kits', 'Thule Fitting Kits', 'Yakima Fitting Kits', 'Cruz Fitting Kits', 'Rhino Rack Dk Fitting Kits', 'Rhino Rack Base Fitting Kits', 'Spacers & Adapters', 'DropRacks Fitting Kits'].map(mkLink) },
      {
        heading: 'Roof Rack Accessories',
        // Column-level promoTile, deliberately different copy from the category's above —
        // proves Level 3's tile is independently configurable, not just inherited from
        // Level 2's.
        promoTile: { image: '../_shared/promo-merch-1.png', eyebrow: 'Now In Stock', label: 'Rhino Rack Low Profile Roof Top Tent', href: '#' },
        links: ['Bike Roof Racks', 'Kayak Roof Racks', 'Snowboard Roof Racks', 'SUP Roof Racks', 'Ski Roof Racks', 'Surfboard Roof Racks', 'Roof Baskets & Bags', 'Roof Top Tents', 'Awnings', 'Fishing Rod Holders', 'Wind Fairings', 'Trade and Work Solutions', 'Other Accessories', 'Tie Downs', 'Cargo Nets', 'Spare Parts', 'Keys and Locks'].map(mkLink),
      },
    ],
  },
  {
    label: 'Bike Racks',
    href: '#',
    columns: [
      { heading: 'Vehicle Attachment Style', links: ['Roof Mounting', 'Tow Ball Mounting', 'Hitch Mounting', 'Rear Mounting'].map(mkLink) },
      { heading: 'Bike Attachment Style', links: ['Frame Hold', 'Fork Hold', 'Wheel Hold', 'Vertical Hanging', 'Frame Hanging'].map(mkLink) },
      { heading: 'Number of Bike Carriers', links: ['1 Bike Carriers', '2 Bike Carriers', '3 Bike Carriers', '4 Bike Carriers', '5 Bike Carriers', '6 Bike Carriers', 'E-Bike Carriers', 'Bike Rack Accessories', 'Bike Rack Spares'].map(mkLink) },
      { heading: 'Brands', links: ['Thule', 'Yakima', 'Cruz', 'Kuat', 'Prorack', 'Rhino Rack', 'Shingleback', 'Buzzrack', 'Rockymounts', 'Rola', 'TreeFrog', 'Front Runner'].map(mkLink) },
    ],
  },
  {
    label: 'Platforms & Trays',
    href: '#',
    columns: [
      { heading: 'Roof Rack Platforms', links: ['Rhino Rack Pioneer Platforms', 'Rhino Rack Pioneer Tradies', 'Yakima LockNload Platforms', 'Thule Caprock Platforms', 'Cruz Tanami Platforms', 'Tracklander P-Series Platforms', 'Tracklander Flat Rack', 'Tracklander Tradie Rack', 'Rola Titan Platforms', 'Front Runner Slimline', 'Wedgetail Platforms', 'Prorack Platforms'].map(mkLink) },
      { heading: 'Roof Trays & Baskets', links: ['Rola Titan Roof Trays', 'Rhino Rack Roof Trays & Baskets', 'Prorack Alloy Trays', 'Yakima Roof Trays'].map(mkLink) },
      { heading: 'Commercial/Trade', links: ['Tracklander Trays', 'Cruz Evo Rack Trays'].map(mkLink) },
      { heading: 'Platform and Tray Mounts & Accessories', links: ['Prorack Alloy Tray Accessories', 'Rhino Rack Pioneer Platform Accessories', 'Front Runner Slimline Accessories', 'Yakima LockNLoad Platform Accessories', 'Yakima Tray Accessories', 'Rola Titan Tray Accessories', 'Tracklander Accessories', 'Cruz Evo Rack Accessories', 'Rhino Rack Backbone', 'Yakima Ruggedline', 'Wedgetail Accessories', 'Wedgetail Mounting Rails', 'Rola Ridge Mount', 'Tracklander Tough Bar', 'Platform Roof Boxes'].map(mkLink) },
    ],
  },
  {
    label: 'Roof Boxes & Cargo',
    href: '#',
    columns: [
      { heading: 'Roof Box Shape', links: ['Long Wide Roof Boxes', 'Medium Roof Boxes', 'Narrow Roof Boxes', 'Short Wide Roof Boxes'].map(mkLink) },
      { heading: 'Roof Box Size', links: ['Small', 'Medium', 'Large', 'X Large', 'XX Large', 'Low Profile Roof Boxes'].map(mkLink) },
      { heading: 'Roof Box Accessories', links: ['Roof Box Accessories', 'Roof Box Spares', 'DropRacks'].map(mkLink) },
      { heading: 'Brands', links: ['Thule', 'Rhino Rack', 'Yakima', 'Cruz', 'Hapro'].map(mkLink) },
    ],
  },
  {
    label: 'Water & Snow Sports',
    href: '#',
    columns: [
      { heading: 'Water Carriers', links: ['Kayak Carriers', 'SUP & Surfboard Carriers', 'Boat Loaders', 'Load Assist', 'Soft Racks', 'Tie Downs', 'Water Carrier Accessories', 'Water Carrier Spares'].map(mkLink) },
      { heading: 'Snow Carriers', links: ['Ski Carriers', 'Snowboard Carriers', 'Load Assist', 'Snow Carrier Spares'].map(mkLink) },
      { heading: 'Fishing Rod Holders', links: ['Roof Mounted', 'Bull Bar Mounted', 'Rod Holder Spares'].map(mkLink) },
      { heading: 'Brands', links: ['Rhino Rack', 'Yakima', 'Thule', 'Cruz', 'Rola', 'Prorack', 'Front Runner', 'Rodezi', 'Kuat', 'Treefrog', 'Creatures of Leisure'].map(mkLink) },
    ],
  },
  {
    label: 'Awnings & Roof Top Tents',
    href: '#',
    columns: [
      { heading: 'Awning Type', links: ['All Awnings', 'Pullout Awnings', '180 Awnings', '270 Awnings', '360 Awnings', 'Shower Awnings', 'Awning Brackets', 'Awning Extensions', 'Awning Accessories', 'Awning Spares'].map(mkLink) },
      { heading: 'Roof Top Tent Types', links: ['All Roof Top Tents', 'Hard Shell Roof Top Tents', 'Soft Shell Roof Top Tents', 'Roof Top Tent Accessories', 'Roof Top Tent Spares'].map(mkLink) },
      { heading: 'Brands', links: ['Darche', 'Rhino Rack', 'Yakima', 'Thule', 'Campboss', 'Roof Space', 'Front Runner', 'DMH'].map(mkLink) },
    ],
    // Left over from an earlier pre-real-asset pass with image:null (rendering "Image
    // pending" instead of a photo) — fixed 2026-09-13, reusing the one real merch photo
    // available (a roof top tent fits this category thematically better than most others).
    promoTile: { eyebrow: 'New Product Release', label: 'Rhino Racks Low Profile Roof Top Tent', image: '../_shared/promo-merch-1.png', href: '#' },
  },
  {
    label: 'Camping & Offroad',
    href: '#',
    columns: [
      { heading: '4x4 Accessories', links: ['Towing Mirrors', 'Recovery Gear', 'Boat Loaders', 'Storage & Drawers', 'Fridge Slides', 'Battery Management', 'Protection & Trim', 'Gullwing', 'DropRacks'].map(mkLink) },
      { heading: 'Vehicle Accessories', links: ['LED Lighting', 'Outdoor Speakers', 'Switches & Plugs', 'Car Mats', 'Towbar Carrying Solutions', 'Vehicle Ladders', 'Roller Shutters', 'Misc Vehicle Accessories', 'Snow Chains'].map(mkLink) },
      { heading: 'Camping', links: ['Roof Top Tents', 'Tents', 'Swags', 'Camp Site', 'Camp Furniture', 'Fridge Accessories', 'Ezy Anchor', 'Torches', 'First Aid'].map(mkLink) },
      { heading: 'Brands', links: ['Prorack', 'Thule', 'Yakima', 'Rhino Rack', 'Stedi', 'MSA 4x4', 'Maxtrax', 'Tred Outdoors', 'Front Runner', 'Darche', 'EGR', 'CampBoss', 'EcoXGear'].map(mkLink) },
    ],
  },
  {
    label: 'Brands',
    href: '#',
    columns: [
      { heading: 'Product Brands', links: ['Cruz', 'Thule', 'Rhino Rack', 'Yakima', 'Prorack', 'Stedi', 'DropRacks', 'BuzzRacks', 'Wedgetail', 'Front Runner', 'Darche', 'Tred Outdoors', 'Maxtrax', 'Master Lock', 'MSA 4x4', 'Rola Roof Racks', 'Tracklander', 'CampBoss', 'Mister Hitches', 'Shingleback Off Road', 'EGR', 'RacksBrax', 'Safeguard', 'Command', 'TreeFrog', 'Turtle', 'Rocky Mounts', 'KanuLock', 'EcoXGear', 'Kuat', 'Ezy Anchor', 'Kaon', 'TieGear', 'Real Truck', 'ClearView'].map(mkLink) },
      { heading: 'Vehicle Makes', links: ['Alfa Romeo', 'Audi', 'BMW', 'Chery', 'Chevrolet', 'Chrysler', 'Citroen', 'Dacia', 'Daewoo', 'Daihatsu', 'Daimler', 'Dodge', 'DS', 'Fiat', 'Ford', 'Foton', 'FPV', 'GMC', 'Great Wall', 'Hino', 'Holden', 'Honda', 'HSV', 'Hyundai', 'Haval', 'Infiniti', 'Isuzu', 'Iveco', 'Jac', 'Jaguar', 'Jeep', 'JMC', 'Kia', 'Land Rover', 'LDV', 'Lexus', 'Lada', 'Mahindra', 'Maserati', 'Mazda', 'Mercedes Benz', 'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Porsche', 'Proton', 'RAM', 'Renault', 'Rover', 'Saab', 'Scion', 'Seat', 'Skoda', 'Smart', 'Ssangyong', 'Subaru', 'Suzuki', 'Tata', 'Tesla', 'Toyota', 'Vauxhall', 'Volkswagen', 'Volvo'].map(mkLink) },
    ],
  },
];

function mkLink(label) { return { label, href: '#' }; }
