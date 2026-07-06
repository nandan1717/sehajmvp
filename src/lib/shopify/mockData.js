export const mockProducts = [
  {
    id: 'gid://shopify/Product/1',
    handle: 'emerald-green-anarkali-suit',
    title: 'Emerald Green Anarkali Suit',
    description: 'A stunning emerald green Anarkali suit featuring intricate gold zari embroidery. Perfect for festive occasions and weddings.',
    priceRange: {
      minVariantPrice: { amount: '249.99', currencyCode: 'USD' }
    },
    images: {
      edges: [
        { node: { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Emerald Green Anarkali Front View' } }
      ]
    },
    variants: {
      edges: [
        { node: { id: 'gid://shopify/ProductVariant/1', title: 'M', availableForSale: true } },
        { node: { id: 'gid://shopify/ProductVariant/2', title: 'L', availableForSale: true } }
      ]
    }
  },
  {
    id: 'gid://shopify/Product/2',
    handle: 'maroon-silk-shawl',
    title: 'Maroon Silk Blend Shawl',
    description: 'Luxurious maroon silk blend shawl with traditional pashmina-style patterns. Wraps beautifully and provides elegant warmth.',
    priceRange: {
      minVariantPrice: { amount: '89.99', currencyCode: 'USD' }
    },
    images: {
      edges: [
        { node: { url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Maroon Silk Shawl' } }
      ]
    },
    variants: {
      edges: [
        { node: { id: 'gid://shopify/ProductVariant/3', title: 'One Size', availableForSale: true } }
      ]
    }
  },
  {
    id: 'gid://shopify/Product/3',
    handle: 'royal-blue-lehenga-choli',
    title: 'Royal Blue Lehenga Choli',
    description: 'Regal blue lehenga choli with heavy silver embellishments. A masterpiece of traditional Indian craftsmanship.',
    priceRange: {
      minVariantPrice: { amount: '399.00', currencyCode: 'USD' }
    },
    images: {
      edges: [
        { node: { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Royal Blue Lehenga Choli' } }
      ]
    },
    variants: {
      edges: [
        { node: { id: 'gid://shopify/ProductVariant/4', title: 'S', availableForSale: true } },
        { node: { id: 'gid://shopify/ProductVariant/5', title: 'M', availableForSale: true } }
      ]
    }
  },
  {
    id: 'gid://shopify/Product/4',
    handle: 'kashmiri-embroidered-shawl',
    title: 'Kashmiri Embroidered Shawl',
    description: 'Authentic Kashmiri shawl with vibrant floral embroidery on an ivory base.',
    priceRange: {
      minVariantPrice: { amount: '129.50', currencyCode: 'USD' }
    },
    images: {
      edges: [
        { node: { url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Kashmiri Embroidered Shawl' } }
      ]
    },
    variants: {
      edges: [
        { node: { id: 'gid://shopify/ProductVariant/6', title: 'One Size', availableForSale: true } }
      ]
    }
  }
];

export const mockCollections = [
  {
    id: 'gid://shopify/Collection/1',
    handle: 'suits',
    title: 'Designer Suits',
    description: 'Explore our exquisite collection of designer Indian suits.',
    products: {
      edges: [
        { node: mockProducts[0] },
        { node: mockProducts[2] }
      ]
    }
  },
  {
    id: 'gid://shopify/Collection/2',
    handle: 'shawls',
    title: 'Luxury Shawls',
    description: 'Wrap yourself in luxury with our authentic, beautifully crafted shawls.',
    products: {
      edges: [
        { node: mockProducts[1] },
        { node: mockProducts[3] }
      ]
    }
  },
  {
    id: 'gid://shopify/Collection/3',
    handle: 'bestsellers',
    title: 'Bestsellers',
    description: 'Our most loved pieces, curated for you.',
    products: {
      edges: [
        { node: mockProducts[0] },
        { node: mockProducts[1] },
        { node: mockProducts[2] }
      ]
    }
  }
];
