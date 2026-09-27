/**
 * ===================================================================
 * MAISON AURA — CENTRALIZED DEMO PRODUCT DATA
 * Single-Brand Luxury Perfume E-Commerce Store
 * ===================================================================
 */

const BASE_MAISON_PRODUCTS = [
  {
    id: 'noir-oud',
    name: 'Noir Oud',
    subtitle: 'Extrait de Parfum',
    family: 'Woody & Resinous',
    category: 'woody',
    tag: 'Bestseller',
    shortDescription: 'A hypnotic encounter of smoky Cambodian oud, rare saffron, and velvety Taif rose with dry golden amber.',
    fullDescription: 'Noir Oud is an opulent testament to the ancient art of oriental perfumery. Sourced from ethically harvested, naturally aged Aquilaria trees, this formulation balances raw resinous power with the romantic delicacy of night-blooming Taif rose and crimson saffron threads. Designed for cold evenings and commanding presence.',
    concentration: 'Extrait de Parfum (32% Essence Concentration)',
    longevity: '14–18 Hours',
    sillage: 'Commanding & Resinous',
    stockStatus: 'in_stock',
    stockText: 'In Stock — Small Batch #084',
    sizes: [
      { size: '50ml', label: '50ml / 1.7 fl.oz.', price: 5400 },
      { size: '100ml', label: '100ml / 3.4 fl.oz.', price: 8600 }
    ],
    fragranceNotes: {
      top: ['Crimson Saffron', 'Wild Cardamom', 'Bergamot Zest'],
      heart: ['Taif Rose Absolute', 'Smoked Frankincense', 'Nutmeg'],
      base: ['Aged Cambodian Oud', 'Dry Amber', 'Cedarwood', 'Bourbon Vanilla']
    },
    primaryImage: 'assets/images/perfume_oud_noir.jpg',
    galleryImages: [
      'assets/images/perfume_oud_noir.jpg',
      'assets/images/hero_perfume_campaign.jpg'
    ],
    featured: true,
    details: {
      howToWear: 'Apply 1-2 sprays directly onto pulse points (inner wrists, neck, and collarbone). Do not rub wrists together; allow the heat of your skin to naturally unfold the three olfactory stages.',
      ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Alpha-Isomethyl Ionone, Benzyl Benzoate, Eugenol, Geraniol, Limonene, Linalool, Citronellol. Free from parabens, phthalates, and synthetic dyes.',
      shippingReturns: 'Complimentary Pan-India Express shipping on all orders. Every bottle includes 2 complimentary 2ml discovery vials to test before opening the sealed full flacon.'
    }
  },
  {
    id: 'santal-ambre',
    name: 'Santal Ambré',
    subtitle: 'Extrait de Parfum',
    family: 'Warm Sandalwood & Balsamic',
    category: 'woody',
    tag: 'Signature Edition',
    shortDescription: 'Creamy Mysore sandalwood fused with golden benzoin tears, violet leaf, and warm roasted tonka bean.',
    fullDescription: 'An intimate tribute to the sacred sandalwood forests of southern India. Santal Ambré unfolds with an airy violet leaf greenness before descending into a comforting, buttery sandalwood heart enriched by warm balsamic resins and tonka bean. An aura of effortless serenity and timeless warmth.',
    concentration: 'Extrait de Parfum (30% Essence Concentration)',
    longevity: '12–16 Hours',
    sillage: 'Warm & Intimate',
    stockStatus: 'in_stock',
    stockText: 'In Stock — Small Batch #042',
    sizes: [
      { size: '50ml', label: '50ml / 1.7 fl.oz.', price: 4800 },
      { size: '100ml', label: '100ml / 3.4 fl.oz.', price: 7600 }
    ],
    fragranceNotes: {
      top: ['Violet Leaf', 'Italian Bergamot', 'Coriander Seed'],
      heart: ['Mysore Sandalwood', 'Papyrus', 'White Iris'],
      base: ['Warm Benzoin Resin', 'Roasted Tonka Bean', 'Cashmere Musk']
    },
    primaryImage: 'assets/images/perfume_santal_ambre.jpg',
    galleryImages: [
      'assets/images/perfume_santal_ambre.jpg',
      'assets/images/hero_perfume_campaign.jpg'
    ],
    featured: true,
    details: {
      howToWear: 'Best worn on clean, moisturized skin. Spray generously on the chest and pulse points. Beautiful for both daytime professional composure and intimate evening gatherings.',
      ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Coumarin, Farnesol, Geraniol, Hydroxycitronellal, Limonene, Linalool. Sustainably sourced botanicals.',
      shippingReturns: 'Delivered in bespoke cushioned packaging within 48–72 hours across metro cities. Includes complimentary sample vials.'
    }
  },
  {
    id: 'rose-nocturne',
    name: 'Rose Nocturne',
    subtitle: 'Extrait de Parfum',
    family: 'Chypre & Sensual Floral',
    category: 'floral',
    tag: 'Extrait Collection',
    shortDescription: 'Damask rose absolute draped in dark Indonesian patchouli, pink pepper, and smoky bourbon vanilla.',
    fullDescription: 'A nocturnal reimagining of the classic rose. Rose Nocturne eschews innocent sweetness in favor of dark allure, pairing lush velvet rose petals with spicy pink peppercorns and earthy Indonesian patchouli. As the hours evolve, Madagascar vanilla and benzoin impart an irresistible, sensual trail.',
    concentration: 'Extrait de Parfum (30% Essence Concentration)',
    longevity: '12–15 Hours',
    sillage: 'Alluring & Romantic',
    stockStatus: 'in_stock',
    stockText: 'In Stock — Small Batch #063',
    sizes: [
      { size: '50ml', label: '50ml / 1.7 fl.oz.', price: 5100 },
      { size: '100ml', label: '100ml / 3.4 fl.oz.', price: 8100 }
    ],
    fragranceNotes: {
      top: ['Pink Peppercorn', 'Mandarin Essence', 'Blackcurrant Bud'],
      heart: ['Damask Rose Absolute', 'Florentine Orris', 'Turkish Rose'],
      base: ['Indonesian Patchouli', 'Smoked Bourbon Vanilla', 'Labdanum']
    },
    primaryImage: 'assets/images/perfume_rose_nocturne.jpg',
    galleryImages: [
      'assets/images/perfume_rose_nocturne.jpg',
      'assets/images/perfume_iris_poudre.jpg'
    ],
    featured: true,
    details: {
      howToWear: 'Mist over collarbones and hair ends. The high oil concentration ensures a captivating scent trail that blooms with body movement.',
      ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Citronellol, Geraniol, Eugenol, Benzyl Alcohol, Evernia Prunastri (Oakmoss) Extract.',
      shippingReturns: 'Dispatched via premium express courier. Sealed packaging with trial discovery atomizers included.'
    }
  },
  {
    id: 'bergamote-celeste',
    name: 'Bergamote Céleste',
    subtitle: 'Extrait de Parfum',
    family: 'Fresh Citrus & Aromatic',
    category: 'citrus',
    tag: 'New Edition',
    shortDescription: 'Sun-drenched Calabrian bergamot, neroli petals, and luminous white tea anchored by Virginia cedarwood.',
    fullDescription: 'An uplifting composition capturing the crystalline golden light of Mediterranean dawn. First-press Calabrian bergamot provides an exhilarating burst of solar energy, seamlessly tempered by dewy neroli and delicate white tea. The dry-down settles into a refined, skin-close veil of clean cedar and white musk.',
    concentration: 'Extrait de Parfum (28% Essence Concentration)',
    longevity: '10–12 Hours',
    sillage: 'Luminous & Crisp',
    stockStatus: 'in_stock',
    stockText: 'In Stock — Small Batch #019',
    sizes: [
      { size: '50ml', label: '50ml / 1.7 fl.oz.', price: 4500 },
      { size: '100ml', label: '100ml / 3.4 fl.oz.', price: 6900 }
    ],
    fragranceNotes: {
      top: ['Calabrian Bergamot', 'Bitter Orange Petitgrain', 'Cardamom'],
      heart: ['Tunisian Neroli', 'White Tea Leaves', 'Orange Blossom'],
      base: ['Virginia Cedarwood', 'Clean White Musk', 'Ambroxan']
    },
    primaryImage: 'assets/images/perfume_fleur_celeste.jpg',
    galleryImages: [
      'assets/images/perfume_fleur_celeste.jpg',
      'assets/images/perfume_santal_ambre.jpg'
    ],
    featured: true,
    details: {
      howToWear: 'Perfect for morning rituals, warm weather, and whenever an instant aura of clarity and vitality is desired.',
      ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Geraniol, Farnesol. Cruelty-free and vegan formulation.',
      shippingReturns: 'Complimentary Pan-India delivery within 48–72 hours. Sample included for risk-free testing.'
    }
  },
  {
    id: 'alabaster-oud',
    name: 'Alabaster & Oud',
    subtitle: 'Extrait de Parfum',
    family: 'Smoky Resinous & Ambré',
    category: 'woody',
    tag: 'Campaign Masterpiece',
    shortDescription: 'A masterwork of white incense, smoky Assam oud, and rare cardamoms encased in warm amber resins.',
    fullDescription: 'The crown jewel of the Maison Aura permanent collection. Alabaster & Oud represents the delicate harmony between radiant white alabaster minerality and the profound, dark mystery of pure Assam agarwood. Intensely sophisticated with extraordinary longevity.',
    concentration: 'Extrait de Parfum (35% Essence Concentration)',
    longevity: '16–20 Hours',
    sillage: 'Ethereal yet Enduring',
    stockStatus: 'in_stock',
    stockText: 'In Stock — Reserve Batch #007',
    sizes: [
      { size: '50ml', label: '50ml / 1.7 fl.oz.', price: 5800 },
      { size: '100ml', label: '100ml / 3.4 fl.oz.', price: 9200 }
    ],
    fragranceNotes: {
      top: ['Green Cardamom', 'Incense Mist', 'Crushed Pink Pepper'],
      heart: ['Taif Rose', 'Somalian Myrrh', 'Papyrus'],
      base: ['Aged Assam Agarwood', 'Cistus Labdanum', 'Smoked Vetiver', 'Ambergris']
    },
    primaryImage: 'assets/images/hero_perfume_campaign.jpg',
    galleryImages: [
      'assets/images/hero_perfume_campaign.jpg',
      'assets/images/perfume_oud_noir.jpg'
    ],
    featured: false,
    details: {
      howToWear: 'Spray on collarbones, wrists, and behind ears for an enveloping, majestic sillage that evolves beautifully over an entire 24-hour cycle.',
      ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Alpha-Isomethyl Ionone, Benzyl Benzoate, Cinnamal, Eugenol, Geraniol, Limonene.',
      shippingReturns: 'Handcrafted luxury flacon in velvet-lined box. Complimentary shipping across India with 2 discovery vials.'
    }
  },
  {
    id: 'cuir-imperial',
    name: 'Cuir Impérial',
    subtitle: 'Extrait de Parfum',
    family: 'Leather & Rare Spices',
    category: 'leather',
    tag: 'Limited Release',
    shortDescription: 'Supple Tuscan leather infused with smoked birch tar, nutmeg, saffron, and aged tobacco leaf.',
    fullDescription: 'Cuir Impérial captures the distinguished atmosphere of an aristocratic private salon. Rich, supple leather accords are warmed by golden spices, dried tobacco leaves, and smoky cade oil. A profound fragrance of undeniable character, depth, and distinction.',
    concentration: 'Extrait de Parfum (30% Essence Concentration)',
    longevity: '14–18 Hours',
    sillage: 'Distinguished & Bold',
    stockStatus: 'in_stock',
    stockText: 'In Stock — Batch #031',
    sizes: [
      { size: '50ml', label: '50ml / 1.7 fl.oz.', price: 5200 },
      { size: '100ml', label: '100ml / 3.4 fl.oz.', price: 8400 }
    ],
    fragranceNotes: {
      top: ['Nutmeg', 'Wild Thyme', 'Saffron'],
      heart: ['Tuscan Leather Accord', 'Dried Tobacco Leaf', 'Violet Leaf'],
      base: ['Smoked Birch Tar', 'Patchouli', 'Atlas Cedar', 'Ambergris']
    },
    primaryImage: 'assets/images/perfume_cuir_imperial.jpg',
    galleryImages: [
      'assets/images/perfume_cuir_imperial.jpg',
      'assets/images/perfume_oud_noir.jpg'
    ],
    featured: false,
    details: {
      howToWear: 'Best suited for evening wear, cooler weather, and formal occasions. Apply 2 sprays to pulse points.',
      ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Isoeugenol, Linalool, Coumarin, Benzyl Cinnamate. Crafted without synthetic fillers.',
      shippingReturns: 'Express dispatch within 24 hours. Includes 2 complimentary trial samples.'
    }
  },
  {
    id: 'iris-poudre',
    name: 'Iris Poudré',
    subtitle: 'Extrait de Parfum',
    family: 'Floral Powdery & Soft Musk',
    category: 'floral',
    tag: 'Artisanal Harvest',
    shortDescription: 'Aged Florentine orris butter, tender violet petals, almond blossom, and skin-soft white musk.',
    fullDescription: 'The pinnacle of understated luxury. Crafted from precious Florentine orris root aged for three full years before extraction, Iris Poudré exudes a gossamer-soft powdery elegance. Delicate floral accords melt into a warm, creamy embrace of almond milk and cashmere musk.',
    concentration: 'Extrait de Parfum (28% Essence Concentration)',
    longevity: '12–14 Hours',
    sillage: 'Subtle, Silken & Intimate',
    stockStatus: 'in_stock',
    stockText: 'In Stock — Batch #014',
    sizes: [
      { size: '50ml', label: '50ml / 1.7 fl.oz.', price: 4900 },
      { size: '100ml', label: '100ml / 3.4 fl.oz.', price: 7800 }
    ],
    fragranceNotes: {
      top: ['Almond Blossom', 'Mandarin Zest', 'Rice Powder'],
      heart: ['Florentine Orris Butter', 'French Violet', 'Heliotrope'],
      base: ['White Cashmere Musk', 'Sandalwood', 'Tonka Bean']
    },
    primaryImage: 'assets/images/perfume_iris_poudre.jpg',
    galleryImages: [
      'assets/images/perfume_iris_poudre.jpg',
      'assets/images/perfume_rose_nocturne.jpg'
    ],
    featured: false,
    details: {
      howToWear: 'An exquisite daily signature. Spray on wrists, neck, and clothing lining for a soft, powdery halo that lingers all day.',
      ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Alpha-Isomethyl Ionone, Hydroxycitronellal, Anise Alcohol, Benzyl Benzoate.',
      shippingReturns: 'Complimentary shipping across India. Comes with matching 2ml trial vial.'
    }
  }
];

const MaisonProducts = (() => {
  const OVERRIDES_KEY = 'maison_aura_product_overrides_v1';

  function loadOverrides() {
    try {
      const data = localStorage.getItem(OVERRIDES_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for product overrides', e);
    }
    return {};
  }

  function saveOverrides(overrides) {
    try {
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
    } catch (e) {
      console.warn('Could not save product overrides', e);
    }
    window.dispatchEvent(new CustomEvent('maison:products-updated'));
  }

  function getProducts() {
    const overrides = loadOverrides();
    return BASE_MAISON_PRODUCTS.map(product => {
      const pOverride = overrides[product.id];
      if (!pOverride) return { ...product };

      return {
        ...product,
        stockStatus: pOverride.stockStatus !== undefined ? pOverride.stockStatus : product.stockStatus,
        stockText: pOverride.stockText !== undefined ? pOverride.stockText : product.stockText,
        sizes: product.sizes.map((s, idx) => {
          if (pOverride.sizes && pOverride.sizes[idx] !== undefined) {
            return { ...s, price: pOverride.sizes[idx].price };
          }
          return { ...s };
        })
      };
    });
  }

  function getProductById(id) {
    return getProducts().find(p => p.id === id) || null;
  }

  function updateProduct(productId, updates) {
    const overrides = loadOverrides();
    overrides[productId] = {
      ...(overrides[productId] || {}),
      ...updates
    };
    saveOverrides(overrides);
    return { success: true, product: getProductById(productId) };
  }

  function resetProducts() {
    try {
      localStorage.removeItem(OVERRIDES_KEY);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('maison:products-updated'));
  }

  return {
    getProducts,
    getProductById,
    updateProduct,
    resetProducts
  };
})();

if (typeof window !== 'undefined') {
  window.MaisonProducts = MaisonProducts;
  // Dynamic getter so existing window.MAISON_PRODUCTS accesses current overrides
  Object.defineProperty(window, 'MAISON_PRODUCTS', {
    get: () => MaisonProducts.getProducts(),
    configurable: true
  });
}
