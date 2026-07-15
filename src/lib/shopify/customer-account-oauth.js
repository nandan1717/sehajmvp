'use client';

import {
  SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
  SHOPIFY_SHOP_ID,
  isCustomerAccountApiConfigured,
  APP_URL,
  CUSTOMER_ACCOUNT_API_URL,
} from './config';
import {
  customerDashboardQuery,
  customerOrdersQuery,
  customerAddressesQuery,
  customerAccessTokenCreateMutation,
} from './customer-account-queries';

// Step 2a: Generate PKCE code verifier and challenge
export async function generatePKCE() {
  // Generate code_verifier (random 64-char string using randomUUIDs)
  const code_verifier = crypto.randomUUID() + crypto.randomUUID();

  // Generate code_challenge (SHA-256 hash, base64url encoded)
  const encoder = new TextEncoder();
  const data = encoder.encode(code_verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const code_challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Generate random state for CSRF protection
  const state = crypto.randomUUID();

  // Store securely in both sessionStorage and localStorage (resilience against mobile browser redirects)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('code_verifier', code_verifier);
    sessionStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_code_verifier', code_verifier);
    localStorage.setItem('oauth_state', state);
  }

  return { code_verifier, code_challenge, state };
}

// Step 2b: Redirect customer to Shopify auth
// Helper to determine accurate callback URI (Option 2: forces production URL on localhost to satisfy Shopify whitelist)
export function getOAuthRedirectUri(customRedirectUri = null) {
  if (customRedirectUri) return customRedirectUri;
  if (process.env.NEXT_PUBLIC_SHOPIFY_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_SHOPIFY_REDIRECT_URI;
  }
  if (typeof window !== 'undefined' && window.location.origin.includes('localhost')) {
    const prodDomain = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sehajmvp.vercel.app');
    return `${prodDomain.replace(/\/$/, '')}/account/callback`;
  }
  return `${APP_URL.replace(/\/$/, '')}/account/callback`;
}

export async function loginWithShopifyOAuth(customRedirectUri = null) {

  if (!isCustomerAccountApiConfigured) {
    console.error('Shopify Customer Account API Client ID is missing in environment variables.');
    return {
      success: false,
      error: 'Shopify Customer Account API is not configured. Please add NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID to your .env.local file.',
    };
  }

  try {
    const { code_challenge, state } = await generatePKCE();

    const redirectUri = getOAuthRedirectUri(customRedirectUri);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_redirect_uri', redirectUri);
      localStorage.setItem('oauth_redirect_uri', redirectUri);
    }

    const authUrl = new URL(`https://shopify.com/${SHOPIFY_SHOP_ID}/auth/oauth/authorize`);
    authUrl.searchParams.append('client_id', SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    const scopes = process.env.NEXT_PUBLIC_SHOPIFY_OAUTH_SCOPES || 'openid email profile';
    authUrl.searchParams.append('scope', scopes);
    authUrl.searchParams.append('code_challenge', code_challenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);
    // Redirect user to Shopify authorization endpoint
    window.location.href = authUrl.toString();
    return { success: true };
  } catch (error) {
    console.error('Failed to initiate Shopify OAuth flow:', error);
    return { success: false, error: 'Could not initiate Shopify login flow.' };
  }
}

// Step 2c: On callback page, exchange code for tokens
export async function exchangeCodeForTokens(code, receivedState) {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Token exchange must happen on client side.' };
  }

  // Retrieve code_verifier and state from sessionStorage (fallback to localStorage)
  const code_verifier =
    sessionStorage.getItem('code_verifier') ||
    localStorage.getItem('oauth_code_verifier');
  const storedState =
    sessionStorage.getItem('oauth_state') ||
    localStorage.getItem('oauth_state');
  const redirectUri =
    sessionStorage.getItem('oauth_redirect_uri') ||
    localStorage.getItem('oauth_redirect_uri') ||
    getOAuthRedirectUri();

  if (!code_verifier) {
    return {
      success: false,
      error: 'Missing code verifier in session. Please try logging in again.',
    };
  }

  if (storedState && receivedState && storedState !== receivedState) {
    console.error('Security error: OAuth state mismatch during token exchange.');
    return {
      success: false,
      error: 'Security verification failed (OAuth state mismatch). Please try logging in again.',
    };
  }

  try {
    const response = await fetch(`https://shopify.com/${SHOPIFY_SHOP_ID}/auth/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
        redirect_uri: redirectUri,
        code: code,
        code_verifier: code_verifier,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify OAuth token exchange failed:', response.status, errorText);
      return {
        success: false,
        error: `Authentication failed (${response.status}). Please check Client ID and Redirect URI in Shopify Admin.`,
      };
    }

    const { access_token, refresh_token, expires_in, id_token } = await response.json();

    if (!access_token) {
      return { success: false, error: 'No access token received from Shopify.' };
    }

    // Store securely in localStorage and session
    localStorage.setItem('access_token', access_token);
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }
    if (id_token) {
      localStorage.setItem('id_token', id_token);
    }
    const expiryTime = Date.now() + (expires_in || 7200) * 1000;
    localStorage.setItem('token_expiry', expiryTime.toString());

    // Connect to app auth session
    localStorage.setItem('rivaaz_customer_token', access_token);
    localStorage.setItem('rivaaz_auth_provider', 'shopify_oauth');

    // Clean up temporary PKCE verifiers
    sessionStorage.removeItem('code_verifier');
    sessionStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_code_verifier');
    localStorage.removeItem('oauth_state');

    return { success: true, access_token, refresh_token, expires_in };
  } catch (error) {
    console.error('Error during token exchange:', error);
    return { success: false, error: 'Network error during token exchange.' };
  }
}

// Step 4: Token Refresh Logic utility function that wraps every API call
export async function getValidToken() {
  if (typeof window === 'undefined') return null;

  const authProvider = localStorage.getItem('rivaaz_auth_provider');
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const expiryStr = localStorage.getItem('token_expiry');

  // If not using OAuth provider or no expiry set, return existing token (legacy/Google auth)
  if (authProvider !== 'shopify_oauth' || !expiryStr || !refreshToken) {
    return localStorage.getItem('rivaaz_customer_token') || accessToken;
  }

  const expiry = parseInt(expiryStr, 10);

  // Still valid (with 60 second safety buffer)
  if (Date.now() < expiry - 60000) {
    return accessToken;
  }

  // Token expired — refresh it
  try {
    const response = await fetch(`https://shopify.com/${SHOPIFY_SHOP_ID}/auth/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.warn('Shopify token refresh failed, triggering logout.');
      await logoutShopifyOAuth(false);
      window.location.href = '/profile';
      return null;
    }

    const { access_token, refresh_token: new_refresh_token, expires_in } = await response.json();

    localStorage.setItem('access_token', access_token);
    if (new_refresh_token) {
      localStorage.setItem('refresh_token', new_refresh_token);
    }
    const newExpiry = Date.now() + (expires_in || 7200) * 1000;
    localStorage.setItem('token_expiry', newExpiry.toString());
    localStorage.setItem('rivaaz_customer_token', access_token);

    return access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

// Step 3 Helper: Execute GraphQL Query against Customer Account API (2024-07)
export async function customerAccountFetch({ query, variables = {} }) {
  const token = await getValidToken();
  if (!token) {
    return { success: false, error: 'Not authenticated with Shopify Customer Account API.' };
  }

  try {
    const response = await fetch(CUSTOMER_ACCOUNT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Customer API error (${response.status}): ${errText}` };
    }

    const result = await response.json();
    if (result.errors && result.errors.length > 0) {
      return { success: false, errors: result.errors, data: result.data };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('customerAccountFetch network error:', error);
    return { success: false, error: 'Network error executing Customer Account API query.' };
  }
}

// Step 3: Wire Account Dashboard, Order History, Address Book queries
export async function fetchOAuthCustomerProfile() {
  const [dashboardRes, ordersRes, addressesRes] = await Promise.all([
    customerAccountFetch({ query: customerDashboardQuery }),
    customerAccountFetch({ query: customerOrdersQuery, variables: { first: 20 } }),
    customerAccountFetch({ query: customerAddressesQuery, variables: { first: 10 } }),
  ]);

  if (!dashboardRes.success || !dashboardRes.data?.customer) {
    return {
      success: false,
      error: dashboardRes.error || dashboardRes.errors?.[0]?.message || 'Failed to fetch dashboard profile.',
    };
  }

  const cust = dashboardRes.data.customer;
  const rawOrders = ordersRes.data?.customer?.orders?.nodes || [];
  const rawAddresses = addressesRes.data?.customer?.addresses?.nodes || [];

  // Map orders to match existing UI structure
  const formattedOrders = rawOrders.map((order) => {
    // Convert Customer Account API lineItems nodes to edges/node structure expected by UI
    const lineItemNodes = order.lineItems?.nodes || [];
    const lineItemEdges = lineItemNodes.map((item) => ({
      node: {
        title: item.title,
        quantity: item.quantity,
        variant: {
          id: item.id,
          title: 'Standard',
          price: item.price,
          image: item.image,
        },
      },
    }));

    // Convert fulfillments
    const fulfillmentStatus = order.fulfillments?.nodes?.[0]?.status || order.financialStatus || 'PROCESSING';

    return {
      id: order.id,
      orderNumber: order.number || order.id.slice(-4),
      processedAt: order.processedAt,
      financialStatus: order.financialStatus,
      fulfillmentStatus: fulfillmentStatus,
      totalPrice: order.totalPrice,
      lineItems: { edges: lineItemEdges },
    };
  });

  // Map addresses
  const formattedAddresses = rawAddresses.map((addr) => ({
    id: addr.id,
    firstName: addr.firstName || cust.firstName || '',
    lastName: addr.lastName || cust.lastName || '',
    address1: addr.address1 || '',
    address2: addr.address2 || '',
    city: addr.city || '',
    province: addr.province || '',
    zip: addr.zip || '',
    country: addr.country || 'India',
    phone: addr.phoneNumber || cust.phoneNumber?.phoneNumber || '',
  }));

  const defaultAddress = cust.defaultAddress
    ? {
        id: cust.defaultAddress.id,
        firstName: cust.defaultAddress.firstName || cust.firstName || '',
        lastName: cust.defaultAddress.lastName || cust.lastName || '',
        address1: cust.defaultAddress.address1 || '',
        address2: cust.defaultAddress.address2 || '',
        city: cust.defaultAddress.city || '',
        province: cust.defaultAddress.province || '',
        zip: cust.defaultAddress.zip || '',
        country: cust.defaultAddress.country || 'India',
        phone: cust.phoneNumber?.phoneNumber || '',
      }
    : formattedAddresses[0] || null;

  return {
    success: true,
    customer: {
      id: cust.id,
      firstName: cust.firstName || '',
      lastName: cust.lastName || '',
      email: cust.emailAddress?.emailAddress || '',
      phone: cust.phoneNumber?.phoneNumber || '',
      defaultAddress,
      orders: formattedOrders,
      addresses: formattedAddresses,
    },
  };
}

// Step 5: Logout with Shopify token revocation
export async function logoutShopifyOAuth(redirect = true) {
  if (typeof window === 'undefined') return;

  const accessToken = localStorage.getItem('access_token');
  const authProvider = localStorage.getItem('rivaaz_auth_provider');

  if (accessToken && authProvider === 'shopify_oauth' && SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) {
    try {
      // Call Shopify logout/revoke endpoint
      await fetch(`https://shopify.com/${SHOPIFY_SHOP_ID}/auth/oauth/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
          token: accessToken,
        }),
      });
    } catch (error) {
      console.error('Error calling Shopify OAuth revoke:', error);
    }
  }

  // Clear local storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('token_expiry');
  localStorage.removeItem('rivaaz_customer_token');
  localStorage.removeItem('rivaaz_auth_provider');
  localStorage.removeItem('checkout_customer_token');

  if (redirect && typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

// Step 6: Connect Auth to Checkout
export async function getCheckoutToken() {
  const token = await getValidToken();
  if (!token) return null;

  // Try creating a customer access token for checkout using GraphQL mutation
  const res = await customerAccountFetch({
    query: customerAccessTokenCreateMutation,
  });

  if (res.success && res.data?.customerAccessTokenCreate?.customerAccessToken?.accessToken) {
    const checkoutToken = res.data.customerAccessTokenCreate.customerAccessToken.accessToken;
    localStorage.setItem('checkout_customer_token', checkoutToken);
    return checkoutToken;
  }

  // If mutation not supported on this endpoint or falls back, use existing access token or stored checkout token
  return localStorage.getItem('checkout_customer_token') || token;
}

export async function getAuthenticatedCheckoutUrl(baseCheckoutUrl) {
  if (!baseCheckoutUrl) return baseCheckoutUrl;

  const authProvider = typeof window !== 'undefined' ? localStorage.getItem('rivaaz_auth_provider') : null;
  const existingToken = typeof window !== 'undefined' ? localStorage.getItem('rivaaz_customer_token') : null;

  if (!authProvider && !existingToken) {
    return baseCheckoutUrl;
  }

  try {
    const checkoutToken = await getCheckoutToken();
    if (!checkoutToken) return baseCheckoutUrl;

    const url = new URL(baseCheckoutUrl, window.location.origin);
    url.searchParams.set('logged_in', 'true');
    url.searchParams.set('customer_token', checkoutToken);
    return url.toString();
  } catch (err) {
    console.error('Error formatting authenticated checkout URL:', err);
    // Fallback string manipulation if URL parsing fails on relative/custom URLs
    const separator = baseCheckoutUrl.includes('?') ? '&' : '?';
    const fallbackToken = existingToken || '';
    return `${baseCheckoutUrl}${separator}logged_in=true&customer_token=${fallbackToken}`;
  }
}
