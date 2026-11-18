import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const P = (n) => `/images/products/img-${String(n).padStart(2, "0")}.jpg`;

async function main() {
  console.log("Resetting database...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.groupBuy.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.address.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@bazaarflow.com",
      name: "Nadia Rahman",
      passwordHash: password,
      role: "ADMIN",
      phone: "+8801711000001",
    },
  });
  const seller = await prisma.user.create({
    data: {
      email: "seller@bazaarflow.com",
      name: "Tanvir Hasan",
      passwordHash: password,
      role: "SELLER",
      sellerStatus: "APPROVED",
      requestedShopName: "TechMatrix BD",
      phone: "+8801711000002",
    },
  });
  const customer = await prisma.user.create({
    data: {
      email: "customer@bazaarflow.com",
      name: "Ayesha Karim",
      passwordHash: password,
      role: "CUSTOMER",
      phone: "+8801711000003",
    },
  });

  await prisma.user.create({
    data: {
      email: "rifat@bazaarflow.com",
      name: "Rifat Ahmed",
      passwordHash: password,
      role: "CUSTOMER",
      sellerStatus: "PENDING",
      sellerRequestedAt: new Date(Date.now() - 2 * 3600000),
      requestedShopName: "Nexus Gadgets",
      phone: "+8801711000004",
    },
  });
  await prisma.user.create({
    data: {
      email: "nusrat@bazaarflow.com",
      name: "Nusrat Jahan",
      passwordHash: password,
      role: "CUSTOMER",
      sellerStatus: "PENDING",
      sellerRequestedAt: new Date(Date.now() - 30 * 3600000),
      requestedShopName: "Aura Living",
      phone: "+8801711000005",
    },
  });
  await prisma.notification.createMany({
    data: [
      { userId: admin.id, title: "New seller application", body: "Rifat Ahmed applied to sell under “Nexus Gadgets”.", kind: "seller" },
      { userId: admin.id, title: "New seller application", body: "Nusrat Jahan applied to sell under “Aura Living”.", kind: "seller" },
    ],
  });

  await prisma.address.createMany({
    data: [
      {
        userId: customer.id,
        label: "Home",
        fullName: "Ayesha Karim",
        phone: "+8801711000003",
        street: "House 24, Road 11, Banani",
        area: "Banani",
        city: "Dhaka",
        postal: "1213",
        isDefault: true,
      },
      {
        userId: customer.id,
        label: "Office",
        fullName: "Ayesha Karim",
        phone: "+8801711000003",
        street: "Level 8, Gulshan Tower, Gulshan 1",
        area: "Gulshan",
        city: "Dhaka",
        postal: "1212",
      },
    ],
  });

  const categories = await Promise.all(
    [
      ["electronics", "Electronics", "Silicon compute, displays & mobile hubs", "devices", 4, "primary"],
      ["gaming", "Gaming & Esports", "Ultra-polling mice, GPUs & monitors", "sports_esports", 5, "secondary"],
      ["audio", "Studio & Audio", "DACs, IEMs, monitors & reference gear", "graphic_eq", 6, "tertiary"],
      ["home", "Home & Living", "Risers, leather pads, cable systems", "desk", 8, "secondary"],
      ["accessories", "Accessories & EDC", "Titanium carry, RFID sleeves & keys", "cases", 10, "primary"],
      ["smart", "Smart Living", "Luminaires, climate dials & hubs", "nest_multi_room", 9, "tertiary"],
      ["sports", "Sports & Performance", "Biometric rings, sensors & recovery", "fitness_center", 11, "secondary"],
      ["lifestyle", "Luxury Lifestyle", "Swiss timepieces, writing pens & carry", "watch", 7, "primary"],
    ].map(([slug, name, description, icon, img, accent]) =>
      prisma.category.create({
        data: { slug, name, description, icon, accent, image: P(img) },
      }),
    ),
  );
  const cat = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const brands = await Promise.all(
    [
      ["sony", "Sony"],
      ["keychron", "Keychron"],
      ["apple", "Apple"],
      ["logitech", "Logitech"],
      ["bose", "Bang & Olufsen"],
      ["leica", "Leica"],
      ["sennheiser", "Sennheiser"],
      ["dell", "Dell"],
      ["benq", "BenQ"],
      ["herman", "Herman Miller"],
      ["kef", "KEF"],
      ["fiio", "FiiO"],
    ].map(([slug, name]) => prisma.brand.create({ data: { slug, name } })),
  );
  const brand = Object.fromEntries(brands.map((b) => [b.slug, b]));

  const shopsData = [
    ["techmatrix", "TechMatrix BD", "Authorized flagship for Sony, Apple & Keychron pro lines.", "TM", "Gulshan 2, Dhaka", 4.97, 18200000, 14, true],
    ["aesthetic-desk", "Aesthetic Desk Co.", "Ergonomic walnut surfaces, Herman Miller & Grovemade accessories.", "AD", "Banani, Dhaka", 4.94, 12800000, 8, true],
    ["audiophile-dhaka", "Audiophile Dhaka", "Pristine transducers, balanced silver cables & vacuum tube amps.", "AD", "Dhanmondi, Dhaka", 4.99, 9400000, 6, true],
    ["lumina-optics", "Lumina Optics", "Certified Hasselblad, Leica & Sony G-Master distribution hub.", "LO", "Uttara, Dhaka", 4.91, 22100000, 16, true],
    ["pixel-forge", "Pixel Forge Gaming", "Tournament-grade peripherals tuned for esports professionals.", "PF", "Dhanmondi, Dhaka", 4.88, 7600000, 5, true],
    ["clockwork", "Clockwork Atelier", "Swiss automatic timepieces, curated & authenticated in-house.", "CA", "Gulshan 1, Dhaka", 4.96, 15400000, 10, true],
    ["oasis-living", "Oasis Living", "Sculptural lighting and smart home ambience for modern spaces.", "OL", "Bashundhara, Dhaka", 4.9, 6200000, 4, true],
  ];
  const shops = [];
  for (let i = 0; i < shopsData.length; i++) {
    const [slug, name, description, initials, location, rating, totalSales, imgNum, verified] = shopsData[i];
    shops.push(
      await prisma.shop.create({
        data: {
          slug,
          name,
          description,
          initials,
          location,
          rating,
          totalSales,
          verified,
          tagline: description,
          coverImage: P(imgNum),
          ownerId: i === 0 ? seller.id : null,
        },
      }),
    );
  }
  const shop = Object.fromEntries(shops.map((s) => [s.slug, s]));

  const productsData = [
    // name, slug, subtitle, price, oldPrice, rating, reviews, stock, badge, img, cat, shop, brand, featured, trending
    ["Sony WH-1000XM5 Wireless Headphones", "sony-wh-1000xm5", "Industry-leading noise cancelling with dual processors", 38500, 44000, 4.9, 340, 24, "-12% OFF", 12, "audio", "techmatrix", "sony", true, true],
    ["Keychron Q1 Pro Mechanical Keyboard", "keychron-q1-pro", "CNC aluminum chassis with hot-swappable switches", 23900, 27500, 5.0, 188, 18, "ATELIER CHOICE", 13, "accessories", "aesthetic-desk", "keychron", true, true],
    ["Apple Studio Display 27-inch 5K", "apple-studio-display", "Standard glass with tilt-adjustable aluminum base", 215000, null, 4.9, 92, 3, "PRECISION OPTICS", 14, "electronics", "techmatrix", "apple", true, true],
    ["Logitech MX Master 3S Mouse", "logitech-mx-master-3s", "8K DPI any-surface tracking with quieter clicks", 11500, 13200, 4.8, 510, 64, "BESTSELLER", 15, "accessories", "aesthetic-desk", "logitech", false, true],
    ["Sony Alpha 7 IV Full-Frame Camera", "sony-alpha-7-iv", "33MP Exmor R sensor with 4K 60p 10-bit recording", 285000, null, 5.0, 47, 6, "CINEMA GEAR", 16, "electronics", "lumina-optics", "sony", true, false],
    ["Bang & Olufsen Beosound Explore", "b-o-beosound-explore", "Type II anodized scratch-resistant aluminum speaker", 24500, 28000, 4.7, 89, 32, "OUTDOOR ACOUSTIC", 17, "audio", "audiophile-dhaka", "bose", false, true],
    ["Leica Q3 28mm Summilux Camera", "leica-q3", "Full-frame 60MP sensor with Summilux F/1.7 lens", 485000, 640000, 5.0, 61, 2, "GROUP BUY", 21, "lifestyle", "lumina-optics", "leica", true, false],
    ["Sennheiser HD 660S2 Headphones", "sennheiser-hd-660s2", "Open-back audiophile tuning with deep bass extension", 62000, 69500, 4.8, 74, 12, "AUDIOPHILE", 24, "audio", "audiophile-dhaka", "sennheiser", false, true],
    ["Mode Sonnet Custom Keyboard", "mode-sonnet-keyboard", "Ultra-luxury 75% layout with copper weight", 41500, null, 4.9, 58, 9, "ATELIER CHOICE", 25, "accessories", "aesthetic-desk", "keychron", false, false],
    ["FiiO K9 Pro Desktop DAC & Amp", "fiio-k9-pro", "Flagship ESS DAC with balanced THX amplification", 78000, 86000, 4.9, 41, 7, "STUDIO REFERENCE", 26, "audio", "audiophile-dhaka", "fiio", true, false],
    ["Drop Sennheiser HD 8XX Headphones", "drop-sennheiser-hd-8xx", "Open-back planar reference with exceptional detail", 135000, 149000, 4.7, 33, 5, "LIMITED", 27, "audio", "audiophile-dhaka", "sennheiser", false, false],
    ["HHKB Professional Hybrid Type-S", "hhkb-hybrid-type-s", "Electro-capacitive silent switches, wireless", 52000, null, 4.9, 66, 11, "ICONIC", 28, "accessories", "aesthetic-desk", "keychron", false, false],
    ["Genelec 8030C Reference Monitors", "genelec-8030c-pair", "Active studio monitors, pair with balanced inputs", 210000, 228000, 4.9, 28, 4, "STUDIO GRADE", 29, "audio", "audiophile-dhaka", "fiio", true, false],
    ["GMK Laser Cherry Keycap Set", "gmk-laser-keycaps", "Doubleshot cherry profile artisan keycaps", 14500, null, 4.8, 102, 26, "ARTISAN", 30, "accessories", "aesthetic-desk", "keychron", false, true],
    ["Dell UltraSharp 32-inch 4K Monitor", "dell-ultrasharp-32", "IPS Black panel with 98% DCI-P3 and USB-C hub", 98000, 108000, 4.7, 156, 14, "PRO DISPLAY", 31, "electronics", "techmatrix", "dell", false, true],
    ["Anodized Custom Mechanical Keyboard", "anodized-custom-keyboard", "Space-grade aluminum build, tuned stabilizers", 32000, 36000, 4.8, 71, 13, "HAND TUNED", 32, "accessories", "aesthetic-desk", "keychron", false, false],
    ["BenQ ScreenBar Halo Monitor Light", "benq-screenbar-halo", "Asymmetric glare-free light with wireless dial", 13500, 15500, 4.8, 210, 40, "EYE CARE", 33, "smart", "oasis-living", "benq", false, false],
    ["Herman Miller Sayl Ergonomic Chair", "herman-miller-sayl", "Suspension back with 12-year warranty", 88000, 96000, 4.9, 63, 8, "ERGONOMIC", 34, "home", "aesthetic-desk", "herman", true, false],
    ["KEF LSX II Wireless Speakers", "kef-lsx-ii", "Compact hi-fi with room-filling studio sound", 112000, null, 4.8, 44, 6, "HI-FI", 35, "audio", "audiophile-dhaka", "kef", false, false],
    ["Sculptural Smart Ambient Lamp", "smart-ambient-lamp", "Warm gradient lighting with app & voice control", 8900, 10500, 4.6, 188, 52, "SMART HOME", 9, "smart", "oasis-living", "benq", false, true],
    ["Milled Titanium EDC Carry Set", "titanium-edc-set", "Pen, carbon wallet & pocket tool on leather tray", 6500, null, 4.7, 95, 48, "EDC", 10, "accessories", "aesthetic-desk", "logitech", false, false],
    ["Carbon Biometric Fitness Ring", "biometric-fitness-ring", "Sleep, recovery & HRV tracking in titanium", 28000, 32000, 4.7, 121, 30, "PERFORMANCE", 11, "sports", "pixel-forge", "logitech", false, true],
    ["Titanium Automatic Chronometer", "titanium-chronometer", "Swiss automatic movement, 120h power reserve", 168000, null, 4.9, 37, 5, "SWISS MADE", 7, "lifestyle", "clockwork", "apple", false, false],
    ["Anodized Aluminum Monitor Riser", "monitor-riser", "Ventilated shelf with integrated wireless charger", 7800, 9200, 4.6, 134, 44, "WORKSPACE", 8, "home", "aesthetic-desk", "herman", false, true],
    ["Razer Viper V3 Pro Gaming Mouse", "razer-viper-v3-pro", "54g ultra-lightweight with 8000Hz polling", 18500, 21000, 4.8, 260, 27, "ESPORTS", 5, "gaming", "pixel-forge", "logitech", false, true],
    ["Wooting 60HE+ Analog Keyboard", "wooting-60he-plus", "Lekker Hall-effect switches with rapid trigger", 26500, null, 4.9, 149, 15, "RAPID TRIGGER", 22, "gaming", "pixel-forge", "keychron", true, false],
    ["Alienware 34 QD-OLED Monitor", "alienware-34-qd-oled", "0.1ms 175Hz curved ultrawide, 99.3% DCI-P3", 125000, 138000, 4.8, 88, 7, "FLAGSHIP", 37, "gaming", "pixel-forge", "dell", false, true],
  ];

  const products = [];
  for (const d of productsData) {
    const [name, slug, subtitle, price, oldPrice, rating, reviewCount, stock, badge, img, catSlug, shopSlug, brandSlug, featured, trending] = d;
    const gallery = JSON.stringify([P(img), P(((img - 11 + 29) % 40) + 1), P((img % 40) + 1)]);
    const specs = JSON.stringify({
      Brand: brand[brandSlug].name,
      Category: cat[catSlug].name,
      Warranty: "Official 12-month warranty",
      Origin: "Authorized import",
      InStock: stock > 0 ? "In stock" : "Pre-order",
    });
    products.push(
      await prisma.product.create({
        data: {
          name,
          slug,
          subtitle,
          price,
          oldPrice: oldPrice ?? null,
          rating,
          reviewCount,
          stock,
          badge,
          image: P(img),
          gallery,
          specs,
          featured: !!featured,
          trending: !!trending,
          categoryId: cat[catSlug].id,
          shopId: shop[shopSlug].id,
          brandId: brand[brandSlug].id,
        },
      }),
    );
  }
  const prod = Object.fromEntries(products.map((p) => [p.slug, p]));

  const reviewSeeds = [
    ["sony-wh-1000xm5", "Rafiq A.", 5, "Best in class", "The noise cancelling is unreal on Dhaka traffic. Battery lasts my whole week."],
    ["sony-wh-1000xm5", "Mim S.", 4, "Superb but pricey", "Sound is rich and the case is premium. Wish it folded smaller."],
    ["keychron-q1-pro", "Arko D.", 5, "Endgame keyboard", "Gasket mount feels incredible. Arrived sealed with all accessories."],
    ["apple-studio-display", "Tania H.", 5, "Worth every taka", "Colour accuracy is perfect for my design work."],
    ["logitech-mx-master-3s", "Sabbir K.", 5, "Daily driver", "Ergonomics are perfect for long editing sessions."],
    ["leica-q3", "Farhan R.", 5, "Heirloom camera", "The Summilux is magic. Seller authentication was thorough."],
    ["benq-screenbar-halo", "Nusrat J.", 5, "No more eye strain", "The wireless dial is a delight to use."],
    ["herman-miller-sayl", "Imran C.", 4, "Great support", "Back support is excellent, assembly took ten minutes."],
  ];
  for (const [slug, author, rating, title, body] of reviewSeeds) {
    if (!prod[slug]) continue;
    await prisma.review.create({
      data: { productId: prod[slug].id, author, rating, title, body },
    });
  }

  const bundleRows = [
    ["cyberpunk-pro-gaming-rig", "Cyberpunk Pro Gaming Rig", "5 Interconnected Ecosystem Components", "gaming", 345000, 387000, "primary", [
      ["GeForce RTX 4080 Super 16GB OC", "ASUS ROG Strix Edition", 168000, P(37)],
      ["Alienware 34\" QD-OLED Monitor", "175Hz • 0.1ms", 125000, P(37)],
      ["Wooting 60HE+ Keyboard", "Hall Effect • Rapid Trigger", 26500, P(22)],
      ["Razer Viper V3 Pro Mouse", "54g • 8000Hz", 18500, P(5)],
      ["Artisan Hayate Otsu Mousepad", "XL Wine Red • Japan", 9000, P(5)],
    ]],
    ["minimalist-executive-studio", "Minimalist Executive Studio", "4 items • Herman Miller + Studio Display", "office", 365000, 409000, "secondary", [
      ["Apple Studio Display 27\" 5K", "Tilt-adjustable", 215000, P(14)],
      ["Herman Miller Sayl Chair", "12-year warranty", 88000, P(34)],
      ["Keychron Q1 Pro", "Hot-swappable", 23900, P(13)],
      ["BenQ ScreenBar Halo", "Glare-free light", 13500, P(33)],
    ]],
    ["mobile-creator-vlogging-kit", "Mobile Creator & Vlogging Kit", "4 items • Sony FX30 rig", "travel", 312000, 336500, "tertiary", [
      ["Sony Alpha 7 IV", "33MP full-frame", 285000, P(16)],
      ["GMK Laser Keycaps", "Studio aesthetic", 14500, P(30)],
      ["Sculptural Ambient Lamp", "Key light", 8900, P(9)],
      ["Titanium EDC Set", "Field ready", 6500, P(10)],
    ]],
    ["student-focus-setup", "Student Focus Setup", "3 items • Back-to-campus", "student", 94500, 108200, "secondary", [
      ["Dell UltraSharp 32 4K", "IPS Black", 98000, P(31)],
      ["Anodized Monitor Riser", "Wireless charging", 7800, P(8)],
      ["BenQ ScreenBar Halo", "Eye care", 13500, P(33)],
    ]],
    ["nomad-remote-work-setup", "Nomad Remote Work Setup", "3 items • Ultralight travel", "travel", 124500, 138700, "primary", [
      ["Logitech MX Master 3S", "Any-surface tracking", 11500, P(15)],
      ["Sennheiser HD 660S2", "Open-back", 62000, P(24)],
      ["Anodized Custom Keyboard", "Travel tuned", 32000, P(32)],
    ]],
  ];
  for (const [slug, name, tagline, kind, price, oldPrice, accent, items] of bundleRows) {
    await prisma.bundle.create({
      data: {
        slug,
        name,
        tagline,
        kind,
        price,
        oldPrice,
        accent,
        items: JSON.stringify(items.map(([n, s, p, img]) => ({ name: n, subtitle: s, price: p, image: img }))),
      },
    });
  }

  await prisma.bundle.create({
    data: {
      slug: "gift-box-premium",
      name: "Premium Gift Box",
      tagline: "3 items • Curated to delight",
      kind: "gift",
      price: 48500,
      oldPrice: 56000,
      accent: "tertiary",
      items: JSON.stringify([
        { name: "Sculptural Ambient Lamp", subtitle: "Warm ambience", price: 8900, image: P(9) },
        { name: "Titanium EDC Set", subtitle: "Everyday carry", price: 6500, image: P(10) },
        { name: "Sennheiser HD 660S2", subtitle: "Audiophile joy", price: 62000, image: P(24) },
      ]),
    },
  });

  // Orders
  const orderRows = [
    ["BF-20481", "DELIVERED", "COD", ["sony-wh-1000xm5", "benq-screenbar-halo"], 14, 100],
    ["BF-20482", "SHIPPED", "BKASH", ["keychron-q1-pro"], 7, 100],
    ["BF-20483", "PROCESSING", "CARD", ["apple-studio-display"], 30, 250],
    ["BF-20484", "PENDING", "COD", ["logitech-mx-master-3s", "titanium-edc-set"], 2, 100],
    ["BF-20485", "DELIVERED", "NAGAD", ["herman-miller-sayl"], 45, 250],
    ["BF-20486", "CANCELLED", "COD", ["smart-ambient-lamp"], 20, 100],
    ["BF-20487", "DELIVERED", "BKASH", ["fiio-k9-pro"], 60, 250],
    ["BF-20488", "PROCESSING", "COD", ["razer-viper-v3-pro", "gmk-laser-keycaps"], 3, 100],
  ];
  for (let i = 0; i < orderRows.length; i++) {
    const [orderNo, status, paymentMethod, slugs, daysAgo, delivery] = orderRows[i];
    const lineItems = slugs.filter((s) => prod[s]).map((s) => ({
      productId: prod[s].id,
      name: prod[s].name,
      image: prod[s].image,
      price: prod[s].price,
      quantity: 1,
    }));
    const subtotal = lineItems.reduce((a, b) => a + b.price * b.quantity, 0);
    const discount = Math.round(subtotal * 0.03);
    await prisma.order.create({
      data: {
        orderNo,
        userId: customer.id,
        customerName: "Ayesha Karim",
        phone: "+8801711000003",
        email: customer.email,
        address: "House 24, Road 11, Banani, Dhaka 1213",
        city: "Dhaka",
        subtotal,
        deliveryFee: delivery,
        discount,
        total: subtotal + delivery - discount,
        paymentMethod,
        status,
        createdAt: new Date(Date.now() - daysAgo * 86400000),
        items: { create: lineItems },
      },
    });
  }

  await prisma.coupon.createMany({
    data: [
      { code: "FLOW10", type: "PERCENT", value: 10, minSpend: 5000, active: true, uses: 42 },
      { code: "DHAKA500", type: "FLAT", value: 500, minSpend: 10000, active: true, uses: 118 },
      { code: "NEW20", type: "PERCENT", value: 20, minSpend: 15000, active: true, uses: 9 },
    ],
  });

  const now = Date.now();
  await prisma.groupBuy.createMany({
    data: [
      {
        slug: "leica-q3-group",
        title: "Leica Q3 28mm Summilux",
        description: "Unite with fellow Dhaka collectors to secure bulk customs clearance.",
        productImage: P(21),
        targetMembers: 50,
        members: 42,
        price: 485000,
        oldPrice: 640000,
        endsAt: new Date(now + 13 * 3600000),
      },
      {
        slug: "kef-lsx-group",
        title: "KEF LSX II Wireless Speakers",
        description: "Tiered group pricing on compact hi-fi. Two tiers already unlocked.",
        productImage: P(35),
        targetMembers: 30,
        members: 19,
        price: 112000,
        oldPrice: 132000,
        endsAt: new Date(now + 40 * 3600000),
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { userId: customer.id, title: "Order BF-20482 shipped", body: "Your Keychron Q1 Pro is on the way via armored courier.", kind: "shipping", createdAt: new Date(now - 3600000) },
      { userId: customer.id, title: "Price drop alert", body: "Sony WH-1000XM5 dropped by ৳ 2,000 in your watchlist.", kind: "price", createdAt: new Date(now - 8 * 3600000) },
      { userId: customer.id, title: "Group buy almost unlocked", body: "8 more backers to trigger 25% off on Leica Q3.", kind: "group", createdAt: new Date(now - 26 * 3600000) },
    ],
  });

  await prisma.priceAlert.createMany({
    data: [
      { userId: customer.id, productId: prod["sony-wh-1000xm5"].id, targetPrice: 35000, active: true },
      { userId: customer.id, productId: prod["apple-studio-display"].id, targetPrice: 200000, active: true },
      { userId: customer.id, productId: prod["leica-q3"].id, targetPrice: 450000, active: true },
    ],
  });

  await prisma.complaint.createMany({
    data: [
      { subject: "Delayed delivery in Mirpur", message: "Order expected two days ago.", status: "OPEN" },
      { subject: "Damaged box on arrival", message: "Packaging crushed but product intact.", status: "RESOLVED" },
    ],
  });

  console.log(`Seeded: ${products.length} products, ${shops.length} shops, ${categories.length} categories.`);
  console.log("Demo logins:");
  console.log("  admin@bazaarflow.com / password123");
  console.log("  seller@bazaarflow.com / password123");
  console.log("  customer@bazaarflow.com / password123");
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
