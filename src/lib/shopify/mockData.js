export const mockProducts = [
  {
    id: 'gid://shopify/Product/1',
    handle: 'emerald-green-anarkali-suit',
    title: 'Emerald Green Anarkali Suit',
    description: 'A stunning emerald green Anarkali suit featuring intricate gold zari embroidery. Perfect for festive occasions and weddings.',
    descriptionHtml: '<p>A stunning emerald green Anarkali suit featuring <strong>intricate gold zari embroidery</strong>. Perfect for festive occasions and weddings.</p><ul><li>100% Pure Silk Blend</li><li>Hand-embroidered neckline</li><li>Includes matching dupatta and churidar</li></ul>',
    vendor: 'Rivaaz Couture',
    productType: 'Anarkali Suit',
    tags: ['Festive', 'Silk', 'Embroidered', 'New Arrival', 'Bestseller'],
    publishedAt: '2026-06-01T00:00:00Z',
    availableForSale: true,
    priceRange: {
      minVariantPrice: { amount: '249.99', currencyCode: 'USD' },
      maxVariantPrice: { amount: '249.99', currencyCode: 'USD' }
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: '310.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '310.00', currencyCode: 'USD' }
    },
    images: {
      edges: [
        { node: { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Emerald Green Anarkali Front View', width: 800, height: 1200 } }
      ],
      nodes: [
        { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Emerald Green Anarkali Front View', width: 800, height: 1200 }
      ]
    },
    options: [
      { id: 'opt1', name: 'Size', values: ['S', 'M', 'L', 'XL'] },
      { id: 'opt2', name: 'Color', values: ['Emerald Green', 'Royal Gold'] }
    ],
    variants: {
      edges: [
        { 
          node: { 
            id: 'gid://shopify/ProductVariant/1', 
            title: 'S / Emerald Green', 
            availableForSale: true,
            quantityAvailable: 15,
            sku: 'RVZ-EMR-S',
            barcode: '890123456701',
            requiresShipping: true,
            weight: 1.2,
            weightUnit: 'KILOGRAMS',
            price: { amount: '249.99', currencyCode: 'USD' },
            compareAtPrice: { amount: '310.00', currencyCode: 'USD' },
            selectedOptions: [
              { name: 'Size', value: 'S' },
              { name: 'Color', value: 'Emerald Green' }
            ],
            image: { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Emerald Green Anarkali Front View' }
          } 
        },
        { 
          node: { 
            id: 'gid://shopify/ProductVariant/2', 
            title: 'M / Emerald Green', 
            availableForSale: true,
            quantityAvailable: 5,
            sku: 'RVZ-EMR-M',
            barcode: '890123456702',
            requiresShipping: true,
            weight: 1.2,
            weightUnit: 'KILOGRAMS',
            price: { amount: '249.99', currencyCode: 'USD' },
            compareAtPrice: { amount: '310.00', currencyCode: 'USD' },
            selectedOptions: [
              { name: 'Size', value: 'M' },
              { name: 'Color', value: 'Emerald Green' }
            ],
            image: { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Emerald Green Anarkali Front View' }
          } 
        },
        { 
          node: { 
            id: 'gid://shopify/ProductVariant/2b', 
            title: 'L / Emerald Green', 
            availableForSale: false,
            quantityAvailable: 0,
            sku: 'RVZ-EMR-L',
            barcode: '890123456703',
            requiresShipping: true,
            weight: 1.2,
            weightUnit: 'KILOGRAMS',
            price: { amount: '249.99', currencyCode: 'USD' },
            compareAtPrice: { amount: '310.00', currencyCode: 'USD' },
            selectedOptions: [
              { name: 'Size', value: 'L' },
              { name: 'Color', value: 'Emerald Green' }
            ],
            image: { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Emerald Green Anarkali Front View' }
          } 
        },
        { 
          node: { 
            id: 'gid://shopify/ProductVariant/2c', 
            title: 'M / Royal Gold', 
            availableForSale: true,
            quantityAvailable: 8,
            sku: 'RVZ-GLD-M',
            barcode: '890123456704',
            requiresShipping: true,
            weight: 1.2,
            weightUnit: 'KILOGRAMS',
            price: { amount: '259.99', currencyCode: 'USD' },
            compareAtPrice: { amount: '320.00', currencyCode: 'USD' },
            selectedOptions: [
              { name: 'Size', value: 'M' },
              { name: 'Color', value: 'Royal Gold' }
            ],
            image: { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Royal Gold Anarkali' }
          } 
        }
      ],
      nodes: [
        { 
          id: 'gid://shopify/ProductVariant/1', 
          title: 'S / Emerald Green', 
          availableForSale: true,
          quantityAvailable: 15,
          sku: 'RVZ-EMR-S',
          barcode: '890123456701',
          requiresShipping: true,
          weight: 1.2,
          weightUnit: 'KILOGRAMS',
          price: { amount: '249.99', currencyCode: 'USD' },
          compareAtPrice: { amount: '310.00', currencyCode: 'USD' },
          selectedOptions: [
            { name: 'Size', value: 'S' },
            { name: 'Color', value: 'Emerald Green' }
          ],
          image: { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Emerald Green Anarkali Front View' }
        },
        { 
          id: 'gid://shopify/ProductVariant/2', 
          title: 'M / Emerald Green', 
          availableForSale: true,
          quantityAvailable: 5,
          sku: 'RVZ-EMR-M',
          barcode: '890123456702',
          requiresShipping: true,
          weight: 1.2,
          weightUnit: 'KILOGRAMS',
          price: { amount: '249.99', currencyCode: 'USD' },
          compareAtPrice: { amount: '310.00', currencyCode: 'USD' },
          selectedOptions: [
            { name: 'Size', value: 'M' },
            { name: 'Color', value: 'Emerald Green' }
          ],
          image: { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Emerald Green Anarkali Front View' }
        },
        { 
          id: 'gid://shopify/ProductVariant/2b', 
          title: 'L / Emerald Green', 
          availableForSale: false,
          quantityAvailable: 0,
          sku: 'RVZ-EMR-L',
          barcode: '890123456703',
          requiresShipping: true,
          weight: 1.2,
          weightUnit: 'KILOGRAMS',
          price: { amount: '249.99', currencyCode: 'USD' },
          compareAtPrice: { amount: '310.00', currencyCode: 'USD' },
          selectedOptions: [
            { name: 'Size', value: 'L' },
            { name: 'Color', value: 'Emerald Green' }
          ],
          image: { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Emerald Green Anarkali Front View' }
        },
        { 
          id: 'gid://shopify/ProductVariant/2c', 
          title: 'M / Royal Gold', 
          availableForSale: true,
          quantityAvailable: 8,
          sku: 'RVZ-GLD-M',
          barcode: '890123456704',
          requiresShipping: true,
          weight: 1.2,
          weightUnit: 'KILOGRAMS',
          price: { amount: '259.99', currencyCode: 'USD' },
          compareAtPrice: { amount: '320.00', currencyCode: 'USD' },
          selectedOptions: [
            { name: 'Size', value: 'M' },
            { name: 'Color', value: 'Royal Gold' }
          ],
          image: { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Royal Gold Anarkali' }
        }
      ]
    },
    collections: {
      nodes: [
        { id: 'gid://shopify/Collection/1', title: 'Designer Suits', handle: 'suits' },
        { id: 'gid://shopify/Collection/3', title: 'Bestsellers', handle: 'bestsellers' }
      ]
    },
    metafields: [
      { namespace: 'custom', key: 'material', value: 'Pure Banarasi Silk with Zari weave', type: 'single_line_text_field' },
      { namespace: 'custom', key: 'care_instructions', value: 'Dry clean only. Store in a cool, dry place wrapped in muslin.', type: 'single_line_text_field' },
      { namespace: 'custom', key: 'size_guide', value: 'Standard Indian sizing. Model is 5\'8" wearing size S.', type: 'single_line_text_field' }
    ]
  },
  {
    id: 'gid://shopify/Product/2',
    handle: 'maroon-silk-shawl',
    title: 'Maroon Silk Blend Shawl',
    description: 'Luxurious maroon silk blend shawl with traditional pashmina-style patterns. Wraps beautifully and provides elegant warmth.',
    vendor: 'Rivaaz Heritage',
    productType: 'Shawl',
    tags: ['Winter', 'Shawl', 'Silk', 'Maroon'],
    priceRange: {
      minVariantPrice: { amount: '89.99', currencyCode: 'USD' },
      maxVariantPrice: { amount: '89.99', currencyCode: 'USD' }
    },
    images: {
      edges: [
        { node: { url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Maroon Silk Shawl', width: 800, height: 1200 } }
      ],
      nodes: [
        { url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Maroon Silk Shawl', width: 800, height: 1200 }
      ]
    },
    options: [
      { id: 'opt1', name: 'Title', values: ['Default Title'] }
    ],
    variants: {
      edges: [
        { node: { id: 'gid://shopify/ProductVariant/3', title: 'One Size', availableForSale: true, quantityAvailable: 25, sku: 'RVZ-SHL-MRN', price: { amount: '89.99', currencyCode: 'USD' }, selectedOptions: [{ name: 'Title', value: 'Default Title' }] } }
      ],
      nodes: [
        { id: 'gid://shopify/ProductVariant/3', title: 'One Size', availableForSale: true, quantityAvailable: 25, sku: 'RVZ-SHL-MRN', price: { amount: '89.99', currencyCode: 'USD' }, selectedOptions: [{ name: 'Title', value: 'Default Title' }] }
      ]
    }
  },
  {
    id: 'gid://shopify/Product/3',
    handle: 'royal-blue-lehenga-choli',
    title: 'Royal Blue Lehenga Choli',
    description: 'Regal blue lehenga choli with heavy silver embellishments. A masterpiece of traditional Indian craftsmanship.',
    vendor: 'Rivaaz Bridal',
    productType: 'Lehenga',
    tags: ['Bridal', 'Lehenga', 'Royal Blue', 'Embellished'],
    priceRange: {
      minVariantPrice: { amount: '399.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '399.00', currencyCode: 'USD' }
    },
    images: {
      edges: [
        { node: { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Royal Blue Lehenga Choli', width: 800, height: 1200 } }
      ],
      nodes: [
        { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Royal Blue Lehenga Choli', width: 800, height: 1200 }
      ]
    },
    options: [
      { id: 'opt1', name: 'Size', values: ['S', 'M', 'L'] }
    ],
    variants: {
      edges: [
        { node: { id: 'gid://shopify/ProductVariant/4', title: 'S', availableForSale: true, quantityAvailable: 3, sku: 'RVZ-LHG-S', price: { amount: '399.00', currencyCode: 'USD' }, selectedOptions: [{ name: 'Size', value: 'S' }] } },
        { node: { id: 'gid://shopify/ProductVariant/5', title: 'M', availableForSale: true, quantityAvailable: 12, sku: 'RVZ-LHG-M', price: { amount: '399.00', currencyCode: 'USD' }, selectedOptions: [{ name: 'Size', value: 'M' }] } }
      ],
      nodes: [
        { id: 'gid://shopify/ProductVariant/4', title: 'S', availableForSale: true, quantityAvailable: 3, sku: 'RVZ-LHG-S', price: { amount: '399.00', currencyCode: 'USD' }, selectedOptions: [{ name: 'Size', value: 'S' }] },
        { id: 'gid://shopify/ProductVariant/5', title: 'M', availableForSale: true, quantityAvailable: 12, sku: 'RVZ-LHG-M', price: { amount: '399.00', currencyCode: 'USD' }, selectedOptions: [{ name: 'Size', value: 'M' }] }
      ]
    }
  },
  {
    id: 'gid://shopify/Product/4',
    handle: 'kashmiri-embroidered-shawl',
    title: 'Kashmiri Embroidered Shawl',
    description: 'Authentic Kashmiri shawl with vibrant floral embroidery on an ivory base.',
    vendor: 'Rivaaz Heritage',
    productType: 'Shawl',
    tags: ['Kashmiri', 'Embroidered', 'Ivory'],
    priceRange: {
      minVariantPrice: { amount: '129.50', currencyCode: 'USD' },
      maxVariantPrice: { amount: '129.50', currencyCode: 'USD' }
    },
    images: {
      edges: [
        { node: { url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Kashmiri Embroidered Shawl', width: 800, height: 1200 } }
      ],
      nodes: [
        { url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', altText: 'Kashmiri Embroidered Shawl', width: 800, height: 1200 }
      ]
    },
    options: [
      { id: 'opt1', name: 'Title', values: ['Default Title'] }
    ],
    variants: {
      edges: [
        { node: { id: 'gid://shopify/ProductVariant/6', title: 'One Size', availableForSale: true, quantityAvailable: 10, sku: 'RVZ-KSH-IVR', price: { amount: '129.50', currencyCode: 'USD' }, selectedOptions: [{ name: 'Title', value: 'Default Title' }] } }
      ],
      nodes: [
        { id: 'gid://shopify/ProductVariant/6', title: 'One Size', availableForSale: true, quantityAvailable: 10, sku: 'RVZ-KSH-IVR', price: { amount: '129.50', currencyCode: 'USD' }, selectedOptions: [{ name: 'Title', value: 'Default Title' }] }
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
