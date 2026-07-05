export const products = [
  {
    id: 1,
    name: "Safari Midnight",
    slug: "safari-midnight",
    price: 149,
    originalPrice: 179,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=800&fit=crop"
    ],
    category: "Men",
    size: "100ml",
    sizePrices: [
      { size: "30ml", price: 89, originalPrice: 109 },
      { size: "50ml", price: 119, originalPrice: 149 },
      { size: "100ml", price: 149, originalPrice: 179 },
    ],
    fragranceFamily: "Oriental",
    rating: 4.8,
    reviews: 124,
    description: "A bold and mysterious fragrance that captures the essence of midnight adventures. Rich oud blends with exotic spices to create an unforgettable sensory experience.",
    notes: {
      top: ["Bergamot", "Black Pepper", "Saffron"],
      heart: ["Rose", "Jasmine", "Patchouli"],
      base: ["Oud", "Amber", "Musk"]
    },
    inStock: true,
    isBestseller: true,
    isNew: false
  },
  {
    id: 2,
    name: "Safari Rose",
    slug: "safari-rose",
    price: 129,
    image: "https://images.unsplash.com/photo-1585232351009-31338186ce39?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1585232351009-31338186ce39?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=800&fit=crop"
    ],
    category: "Women",
    size: "50ml",
    sizePrices: [
      { size: "30ml", price: 89, originalPrice: 109 },
      { size: "50ml", price: 129, originalPrice: 159 },
      { size: "100ml", price: 169, originalPrice: 199 },
    ],
    fragranceFamily: "Floral",
    rating: 4.9,
    reviews: 89,
    description: "An enchanting rose bouquet that embodies elegance and femininity. Fresh petals of Bulgarian rose intertwine with delicate florals for a timeless scent.",
    notes: {
      top: ["Rose Petals", "Peach", "Citrus"],
      heart: ["Jasmine", "Lily", "Iris"],
      base: ["Sandalwood", "Musk", "Vanilla"]
    },
    inStock: true,
    isBestseller: true,
    isNew: true
  },
  {
    id: 3,
    name: "Safari Oud",
    slug: "safari-oud",
    price: 199,
    image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&fit=crop"
    ],
    category: "Unisex",
    size: "100ml",
    sizePrices: [
      { size: "30ml", price: 129, originalPrice: 149 },
      { size: "50ml", price: 169, originalPrice: 189 },
      { size: "100ml", price: 199, originalPrice: 229 },
    ],
    fragranceFamily: "Woody",
    rating: 4.7,
    reviews: 56,
    description: "Pure luxury captured in a bottle. Rare agarwood from the depths of ancient forests meets precious amber for an intensely sophisticated fragrance.",
    notes: {
      top: ["Agarwood", "Leather", "Tobacco"],
      heart: ["Cedar", "Vetiver", "Amber"],
      base: ["Musk", "Patchouli", "Sandalwood"]
    },
    inStock: true,
    isBestseller: false,
    isNew: true
  },
  {
    id: 4,
    name: "Safari Citrus",
    slug: "safari-citrus",
    price: 89,
    image: "https://images.unsplash.com/photo-1595444813083-2aa77c829cb7?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595444813083-2aa77c829cb7?w=600&h=800&fit=crop"
    ],
    category: "Men",
    size: "100ml",
    sizePrices: [
      { size: "30ml", price: 49, originalPrice: 59 },
      { size: "50ml", price: 69, originalPrice: 79 },
      { size: "100ml", price: 89, originalPrice: 109 },
    ],
    fragranceFamily: "Fresh",
    rating: 4.5,
    reviews: 78,
    description: "An invigorating blend of Mediterranean citrus fruits that awakens the senses. Perfect for the modern man who embraces life with zest.",
    notes: {
      top: ["Lemon", "Grapefruit", "Bergamot"],
      heart: ["Mint", "Basil", "Sea Salt"],
      base: ["Cedar", "Musk", "Ambergris"]
    },
    inStock: true,
    isBestseller: true,
    isNew: false
  },
  {
    id: 5,
    name: "Safari Vanilla",
    slug: "safari-vanilla",
    price: 119,
    image: "https://images.unsplash.com/photo-1543863646-3c7bfd28ad9b?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1543863646-3c7bfd28ad9b?w=600&h=800&fit=crop"
    ],
    category: "Women",
    size: "50ml",
    sizePrices: [
      { size: "30ml", price: 79, originalPrice: 99 },
      { size: "50ml", price: 119, originalPrice: 139 },
      { size: "100ml", price: 159, originalPrice: 179 },
    ],
    fragranceFamily: "Oriental",
    rating: 4.6,
    reviews: 45,
    description: "A warm and sensual vanilla whisper that wraps you in comfort. Rich Madagascar vanilla harmonizes with exotic spices for pure indulgence.",
    notes: {
      top: ["Vanilla Bean", "Coconut", "Tangerine"],
      heart: ["Jasmine", "Orchid", "Cinnamon"],
      base: ["Vanilla", "Amber", "Musk"]
    },
    inStock: true,
    isBestseller: false,
    isNew: true
  },
  {
    id: 6,
    name: "Safari Noir",
    slug: "safari-noir",
    price: 159,
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=800&fit=crop"
    ],
    category: "Men",
    size: "100ml",
    sizePrices: [
      { size: "30ml", price: 99, originalPrice: 119 },
      { size: "50ml", price: 129, originalPrice: 149 },
      { size: "100ml", price: 159, originalPrice: 189 },
    ],
    fragranceFamily: "Woody",
    rating: 4.9,
    reviews: 167,
    description: "The essence of sophistication. Dark woody notes blend with aromatic spices to create a commanding presence that leaves a lasting impression.",
    notes: {
      top: ["Black Pepper", "Cardamom", "Bergamot"],
      heart: ["Leather", "Cedar", "Vetiver"],
      base: ["Oud", "Amber", "Musk"]
    },
    inStock: true,
    isBestseller: true,
    isNew: false
  },
  {
    id: 7,
    name: "Safari Bloom",
    slug: "safari-bloom",
    price: 109,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=800&fit=crop"
    ],
    category: "Women",
    size: "50ml",
    sizePrices: [
      { size: "30ml", price: 69, originalPrice: 89 },
      { size: "50ml", price: 109, originalPrice: 129 },
      { size: "100ml", price: 149, originalPrice: 169 },
    ],
    fragranceFamily: "Floral",
    rating: 4.7,
    reviews: 92,
    description: "A celebration of spring in a bottle. Delicate floral notes dance together creating a fresh, romantic scent that captures the essence of blooming gardens.",
    notes: {
      top: ["Green Apple", "Freesia", "Peony"],
      heart: ["Rose", "Jasmine", "Lily"],
      base: ["Musk", "Woody Notes", "Sheer Amber"]
    },
    inStock: true,
    isBestseller: false,
    isNew: true
  },
  {
    id: 8,
    name: "Safari Sand",
    slug: "safari-sand",
    price: 139,
    image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=800&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600&h=800&fit=crop"
    ],
    category: "Unisex",
    size: "100ml",
    sizePrices: [
      { size: "30ml", price: 79, originalPrice: 99 },
      { size: "50ml", price: 109, originalPrice: 129 },
      { size: "100ml", price: 139, originalPrice: 169 },
    ],
    fragranceFamily: "Woody",
    rating: 4.4,
    reviews: 38,
    description: "A grounding fragrance inspired by vast desert landscapes. Warm sands meet ancient cedar for a serene, meditative sensory experience.",
    notes: {
      top: ["Desert Rose", "Pink Pepper", "Saffron"],
      heart: ["Cedar", "Agarwood", "Violet"],
      base: ["Sandalwood", "Amber", "Musk"]
    },
    inStock: true,
    isBestseller: false,
    isNew: false
  }
];

export const collections = [
  {
    id: 1,
    name: "Signature Collection",
    description: "Our most beloved fragrances",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&h=800&fit=crop",
    link: "/shop?collection=signature"
  },
  {
    id: 2,
    name: "Midnight Series",
    description: "For the bold and mysterious",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=800&fit=crop",
    link: "/shop?collection=midnight"
  },
  {
    id: 3,
    name: "Rose Collection",
    description: "Timeless floral elegance",
    image: "https://images.unsplash.com/photo-1585232351009-31338186ce39?w=600&h=800&fit=crop",
    link: "/shop?collection=rose"
  },
  {
    id: 4,
    name: "Oud Exclusive",
    description: "Luxury agarwood blends",
    image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&h=800&fit=crop",
    link: "/shop?collection=oud"
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    location: "Dubai, UAE",
    rating: 5,
    text: "Safari Midnight has become my signature scent. The quality is exceptional and the packaging is absolutely luxurious. I've received countless compliments.",
    product: "Safari Midnight",
    productSlug: "safari-midnight",
    date: "2024-12-15"
  },
  {
    id: 2,
    name: "James Chen",
    location: "Singapore",
    rating: 5,
    text: "As someone who appreciates fine fragrances, Safari Oud exceeded all my expectations. The depth and longevity are remarkable. Truly a masterpiece.",
    product: "Safari Oud",
    productSlug: "safari-oud",
    date: "2024-11-28"
  },
  {
    id: 3,
    name: "Amira Hassan",
    location: "London, UK",
    rating: 5,
    text: "The Rose collection is breathtaking. Each scent tells a story and the attention to detail is evident in every bottle. Safari has earned a lifelong customer.",
    product: "Safari Rose",
    productSlug: "safari-rose",
    date: "2024-10-10"
  },
  {
    id: 4,
    name: "Usman Khan",
    location: "Karachi, Pakistan",
    rating: 4,
    text: "Safari Noir is absolutely amazing! The longevity is incredible and I get compliments everywhere I go. Highly recommend for evening wear.",
    product: "Safari Noir",
    productSlug: "safari-noir",
    date: "2024-09-05"
  },
  {
    id: 5,
    name: "Fatima Ahmed",
    location: "Lahore, Pakistan",
    rating: 5,
    text: "The Safari Bloom is my go-to daily fragrance. It's fresh, elegant, and lasts all day. Truly impressed with the quality and presentation.",
    product: "Safari Bloom",
    productSlug: "safari-bloom",
    date: "2024-08-22"
  },
  {
    id: 6,
    name: "Ali Raza",
    location: "Islamabad, Pakistan",
    rating: 5,
    text: "Ordered Safari Oud and it exceeded my expectations. The packaging was beautiful and the fragrance is world-class. Will definitely order again.",
    product: "Safari Oud",
    productSlug: "safari-oud",
    date: "2024-07-14"
  }
];

export const filters = {
  categories: ["Men", "Women", "Unisex"],
  sizes: ["30ml", "50ml", "100ml"],
  fragranceFamilies: ["Floral", "Woody", "Oriental", "Fresh"],
  priceRanges: [
    { label: "Under PKR 5,000", min: 0, max: 5000 },
    { label: "PKR 5,000 - PKR 15,000", min: 5000, max: 15000 },
    { label: "PKR 15,000 - PKR 25,000", min: 15000, max: 25000 },
    { label: "Over PKR 25,000", min: 25000, max: Infinity }
  ]
};