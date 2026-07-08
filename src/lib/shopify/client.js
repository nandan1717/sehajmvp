import { mockProducts, mockCollections } from './mockData';
import {
  isShopifyConfigured,
  STOREFRONT_API_URL,
  STOREFRONT_PUBLIC_TOKEN,
  COUNTRY_COOKIE_NAME,
  DEFAULT_COUNTRY,
} from './config';
import {
  parseMockCart,
  createEmptyMockCart,
  addToMockCart,
  updateMockCartLine,
  removeMockCartLine,
} from './mockCart';

/**
 * Read the buyer's country code.
 * Falls back to DEFAULT_COUNTRY if not set.
 */
async function getCountryFromCookie() {
  if (typeof window !== 'undefined') {
    // Client-side
    const match = document.cookie.match(new RegExp('(^| )' + COUNTRY_COOKIE_NAME + '=([^;]+)'));
    return match ? match[2] : DEFAULT_COUNTRY;
  } else {
    // Server-side
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return cookieStore.get(COUNTRY_COOKIE_NAME)?.value || DEFAULT_COUNTRY;
    } catch {
      return DEFAULT_COUNTRY;
    }
  }
}

/**
 * Inject @inContext(country: XX, language: EN) into a GraphQL query/mutation.
 * Handles both named operations (query Foo { ... }) and anonymous ones (query { ... }).
 */
function injectInContext(query, countryCode) {
  if (!countryCode || query.includes('@inContext')) return query;

  const directive = `@inContext(country: ${countryCode}, language: EN)`;

  // Match named operations: query Name(...) { or mutation Name(...) {
  // Also matches anonymous: query { or mutation {
  return query.replace(
    /(query|mutation)\s+(\w+)?(\([^)]*\))?\s*\{/,
    (match, opType, opName, opArgs) => {
      const parts = [opType];
      if (opName) parts.push(opName);
      if (opArgs) parts.push(opArgs);
      parts.push(directive);
      parts.push('{');
      return parts.join(' ');
    }
  );
}

export async function shopifyFetch({ query, variables, cache = 'default' }) {
  if (!isShopifyConfigured) {
    return handleMockRequest(query, variables);
  }

  // Get the buyer's country and inject @inContext into the query
  const countryCode = await getCountryFromCookie();
  const contextualQuery = injectInContext(query, countryCode);

  const endpoint = STOREFRONT_API_URL;
  const storefrontAccessToken = STOREFRONT_PUBLIC_TOKEN;

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query: contextualQuery, variables }),
  };

  if (cache === 'no-store' || process.env.NODE_ENV === 'development') {
    fetchOptions.cache = 'no-store';
  } else {
    fetchOptions.next = { revalidate: 60, tags: ['shopify'] };
  }

  try {
    const result = await fetch(endpoint, fetchOptions);
    const body = await result.json();

    if (body.errors) {
      console.error('GraphQL Errors:', body.errors);
      throw new Error(body.errors[0]?.message || 'GraphQL request failed');
    }

    return { status: result.status, body };
  } catch (error) {
    console.error('Error in shopifyFetch:', error);
    console.warn('Falling back to mock data due to Shopify API error.');
    return handleMockRequest(query, variables);
  }
}

function handleMockRequest(query, variables) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = {};

      if (query.includes('getProducts') || query.includes('products(first:')) {
        data = { products: { edges: mockProducts.map((node) => ({ node })) } };
      } else if (query.includes('getProduct') && variables?.handle) {
        const product = mockProducts.find((p) => p.handle === variables.handle);
        data = { product: product || null };
      } else if (query.includes('getCollection') && variables?.handle) {
        if (variables.handle === 'all') {
          data = {
            collection: {
              id: 'gid://shopify/Collection/all',
              handle: 'all',
              title: 'All Products',
              description: 'Browse our complete collection of Indian wear.',
              products: { edges: mockProducts.map((node) => ({ node })) },
            },
          };
        } else if (variables.handle === 'bestsellers') {
          data = {
            collection: {
              id: 'gid://shopify/Collection/bestsellers',
              handle: 'bestsellers',
              title: 'Bestsellers',
              description: 'Our most loved pieces, curated for you.',
              products: { edges: mockProducts.slice(0, 3).map((node) => ({ node })) },
            },
          };
        } else {
          const collection = mockCollections.find((c) => c.handle === variables.handle);
          data = { collection: collection || null };
        }
      } else if (query.includes('getCollections') || query.includes('collections(first:')) {
        data = { collections: { edges: mockCollections.map((node) => ({ node })) } };
      } else if (query.includes('getCart') || query.includes('cart(id:')) {
        data = { cart: createEmptyMockCart() };
      } else if (query.includes('cartCreate')) {
        const lines = variables?.input?.lines || [];
        let cart = createEmptyMockCart();
        for (const line of lines) {
          const result = addToMockCart(cart, line.merchandiseId, line.quantity);
          cart = result.cart;
        }
        data = { cartCreate: { cart, userErrors: [] } };
      } else if (query.includes('cartLinesAdd')) {
        let cart = createEmptyMockCart();
        const lines = variables?.lines || [];
        for (const line of lines) {
          const result = addToMockCart(cart, line.merchandiseId, line.quantity);
          cart = result.cart;
        }
        data = { cartLinesAdd: { cart, userErrors: [] } };
      } else if (query.includes('cartLinesUpdate')) {
        let cart = createEmptyMockCart();
        const line = variables?.lines?.[0];
        if (line) {
          const result = updateMockCartLine(cart, line.id, line.quantity);
          cart = result.cart;
        }
        data = { cartLinesUpdate: { cart, userErrors: [] } };
      } else if (query.includes('cartLinesRemove')) {
        data = { cartLinesRemove: { cart: createEmptyMockCart(), userErrors: [] } };
      }

      resolve({ status: 200, body: { data } });
    }, 300);
  });
}

export { isShopifyConfigured };
