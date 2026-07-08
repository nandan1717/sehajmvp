'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  isShopifyConfigured,
  CART_COOKIE_NAME,
  MOCK_CART_COOKIE_NAME,
  COUNTRY_COOKIE_NAME,
  DEFAULT_COUNTRY,
} from './config';
import { shopifyFetch } from './client';
import { getCartQuery } from './queries';
import {
  cartCreateMutation,
  cartLinesAddMutation,
  cartLinesUpdateMutation,
  cartLinesRemoveMutation,
  cartBuyerIdentityUpdateMutation,
} from './mutations';
import {
  parseMockCart,
  serializeMockCart,
  createEmptyMockCart,
  addToMockCart,
  updateMockCartLine,
  removeMockCartLine,
} from './mockCart';

const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

function getUserErrors(data, key) {
  return data?.[key]?.userErrors?.filter(Boolean) ?? [];
}

async function getMockCartFromCookie() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(MOCK_CART_COOKIE_NAME)?.value;
  return parseMockCart(raw);
}

async function saveMockCart(cart) {
  const cookieStore = await cookies();
  cookieStore.set(MOCK_CART_COOKIE_NAME, serializeMockCart(cart), CART_COOKIE_OPTIONS);
}

async function fetchShopifyCart(cartId) {
  const { body } = await shopifyFetch({
    query: getCartQuery,
    variables: { cartId },
    cache: 'no-store',
  });
  return body?.data?.cart ?? null;
}

export async function getCart() {
  if (!isShopifyConfigured) {
    return getMockCartFromCookie();
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) return null;

  return fetchShopifyCart(cartId);
}

export async function addToCart(variantId, quantity = 1) {
  if (!variantId) {
    return { success: false, error: 'Please select a variant' };
  }

  if (!isShopifyConfigured) {
    const current = await getMockCartFromCookie();
    const { cart, error } = addToMockCart(current, variantId, quantity);
    if (error) return { success: false, error };
    await saveMockCart(cart);
    revalidatePath('/', 'layout');
    return { success: true, cart };
  }

  const cookieStore = await cookies();
  let cartId = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!cartId) {
    const countryCode = cookieStore.get(COUNTRY_COOKIE_NAME)?.value || DEFAULT_COUNTRY;
    
    const { body } = await shopifyFetch({
      query: cartCreateMutation,
      variables: {
        input: { 
          lines: [{ merchandiseId: variantId, quantity }],
          buyerIdentity: { countryCode }
        },
      },
      cache: 'no-store',
    });

    const errors = getUserErrors(body?.data, 'cartCreate');
    if (errors.length) {
      return { success: false, error: errors[0].message };
    }

    const cart = body?.data?.cartCreate?.cart;
    if (!cart?.id) {
      return { success: false, error: 'Failed to create cart' };
    }

    cookieStore.set(CART_COOKIE_NAME, cart.id, CART_COOKIE_OPTIONS);
    revalidatePath('/', 'layout');
    return { success: true, cart };
  }

  const { body } = await shopifyFetch({
    query: cartLinesAddMutation,
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    },
    cache: 'no-store',
  });

  const errors = getUserErrors(body?.data, 'cartLinesAdd');
  if (errors.length) {
    return { success: false, error: errors[0].message };
  }

  const cart = body?.data?.cartLinesAdd?.cart;
  revalidatePath('/', 'layout');
  return { success: true, cart };
}

export async function updateCartLine(lineId, quantity) {
  if (!lineId) {
    return { success: false, error: 'Invalid line item' };
  }

  if (!isShopifyConfigured) {
    const current = await getMockCartFromCookie();
    const { cart } = updateMockCartLine(current, lineId, quantity);
    await saveMockCart(cart);
    revalidatePath('/', 'layout');
    return { success: true, cart };
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) {
    return { success: false, error: 'Cart not found' };
  }

  const { body } = await shopifyFetch({
    query: cartLinesUpdateMutation,
    variables: {
      cartId,
      lines: [{ id: lineId, quantity }],
    },
    cache: 'no-store',
  });

  const errors = getUserErrors(body?.data, 'cartLinesUpdate');
  if (errors.length) {
    return { success: false, error: errors[0].message };
  }

  const cart = body?.data?.cartLinesUpdate?.cart;
  revalidatePath('/', 'layout');
  return { success: true, cart };
}

export async function removeFromCart(lineId) {
  if (!lineId) {
    return { success: false, error: 'Invalid line item' };
  }

  if (!isShopifyConfigured) {
    const current = await getMockCartFromCookie();
    const { cart } = removeMockCartLine(current, lineId);
    await saveMockCart(cart);
    revalidatePath('/', 'layout');
    return { success: true, cart };
  }

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) {
    return { success: false, error: 'Cart not found' };
  }

  const { body } = await shopifyFetch({
    query: cartLinesRemoveMutation,
    variables: { cartId, lineIds: [lineId] },
    cache: 'no-store',
  });

  const errors = getUserErrors(body?.data, 'cartLinesRemove');
  if (errors.length) {
    return { success: false, error: errors[0].message };
  }

  const cart = body?.data?.cartLinesRemove?.cart;
  if (cart?.totalQuantity === 0) {
    cookieStore.delete(CART_COOKIE_NAME);
  }
  revalidatePath('/', 'layout');
  return { success: true, cart: cart?.totalQuantity === 0 ? createEmptyMockCart() : cart };
}

export async function updateCartBuyerIdentity(countryCode) {
  if (!isShopifyConfigured) return { success: true };

  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  if (!cartId) return { success: true };

  const { body } = await shopifyFetch({
    query: cartBuyerIdentityUpdateMutation,
    variables: {
      cartId,
      buyerIdentity: { countryCode }
    },
    cache: 'no-store',
  });

  const errors = getUserErrors(body?.data, 'cartBuyerIdentityUpdate');
  if (errors.length) {
    return { success: false, error: errors[0].message };
  }

  const cart = body?.data?.cartBuyerIdentityUpdate?.cart;
  revalidatePath('/', 'layout');
  return { success: true, cart };
}
