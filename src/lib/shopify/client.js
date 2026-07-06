import { mockProducts, mockCollections } from './mockData';

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const isConfigured = domain && domain !== 'your-store.myshopify.com' && storefrontAccessToken && storefrontAccessToken !== 'your-access-token';

export async function shopifyFetch({ query, variables }) {
  if (!isConfigured) {
    console.warn('Shopify environment variables not configured. Falling back to mock data.');
    return handleMockRequest(query, variables);
  }

  const endpoint = `https://${domain}/api/2024-01/graphql.json`;
  
  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    const body = await result.json();

    if (body.errors) {
      console.error('GraphQL Errors:', body.errors);
      throw new Error('GraphQL request failed');
    }

    return { status: result.status, body };
  } catch (error) {
    console.error('Error in shopifyFetch:', error);
    return { status: 500, error: 'Error receiving data' };
  }
}

// Simple mock request handler to return mock data based on query structure
function handleMockRequest(query, variables) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = {};
      
      if (query.includes('products(')) {
        data = { products: { edges: mockProducts.map(node => ({ node })) } };
      } 
      else if (query.includes('product(') && variables?.handle) {
        const product = mockProducts.find(p => p.handle === variables.handle);
        data = { product };
      }
      else if (query.includes('collection(') && variables?.handle) {
        const collection = mockCollections.find(c => c.handle === variables.handle);
        data = { collection };
      }
      else if (query.includes('collections(')) {
        data = { collections: { edges: mockCollections.map(node => ({ node })) } };
      }

      resolve({
        status: 200,
        body: { data }
      });
    }, 500); // Simulate network delay
  });
}
