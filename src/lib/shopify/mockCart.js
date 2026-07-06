import { mockProducts } from './mockData';

function findVariant(variantId) {
  for (const product of mockProducts) {
    const variant = product.variants.edges.find(({ node }) => node.id === variantId);
    if (variant) {
      return { product, variant: variant.node };
    }
  }
  return null;
}

function buildLine(variantId, quantity) {
  const match = findVariant(variantId);
  if (!match) return null;

  const { product, variant } = match;
  const price = product.priceRange.minVariantPrice;
  const lineId = `gid://shopify/CartLine/mock-${variantId}`;
  const total = (parseFloat(price.amount) * quantity).toFixed(2);

  return {
    id: lineId,
    quantity,
    merchandise: {
      id: variant.id,
      title: variant.title,
      product: {
        title: product.title,
        handle: product.handle,
      },
      image: product.images.edges[0]?.node || null,
      price,
    },
    cost: {
      totalAmount: { amount: total, currencyCode: price.currencyCode },
    },
  };
}

function computeTotals(lines) {
  let totalQuantity = 0;
  let subtotal = 0;
  let currencyCode = 'USD';

  for (const line of lines) {
    totalQuantity += line.quantity;
    subtotal += parseFloat(line.cost.totalAmount.amount);
    currencyCode = line.cost.totalAmount.currencyCode;
  }

  return {
    totalQuantity,
    subtotalAmount: { amount: subtotal.toFixed(2), currencyCode },
    totalAmount: { amount: subtotal.toFixed(2), currencyCode },
  };
}

export function createEmptyMockCart() {
  return {
    id: 'gid://shopify/Cart/mock',
    checkoutUrl: null,
    totalQuantity: 0,
    cost: {
      subtotalAmount: { amount: '0.00', currencyCode: 'USD' },
      totalAmount: { amount: '0.00', currencyCode: 'USD' },
    },
    lines: { edges: [] },
  };
}

export function parseMockCart(raw) {
  if (!raw) return createEmptyMockCart();
  try {
    return JSON.parse(raw);
  } catch {
    return createEmptyMockCart();
  }
}

export function serializeMockCart(cart) {
  return JSON.stringify(cart);
}

export function addToMockCart(cart, variantId, quantity) {
  const existing = cart.lines.edges.find(
    ({ node }) => node.merchandise.id === variantId
  );

  let lines;
  if (existing) {
    lines = cart.lines.edges.map(({ node }) => {
      if (node.merchandise.id === variantId) {
        const updated = buildLine(variantId, node.quantity + quantity);
        return { node: updated };
      }
      return { node };
    });
  } else {
    const newLine = buildLine(variantId, quantity);
    if (!newLine) {
      return { cart, error: 'Variant not found' };
    }
    lines = [...cart.lines.edges, { node: newLine }];
  }

  const totals = computeTotals(lines.map(({ node }) => node));
  return {
    cart: {
      ...cart,
      totalQuantity: totals.totalQuantity,
      cost: {
        subtotalAmount: totals.subtotalAmount,
        totalAmount: totals.totalAmount,
      },
      lines: { edges: lines },
    },
  };
}

export function updateMockCartLine(cart, lineId, quantity) {
  if (quantity <= 0) {
    return removeMockCartLine(cart, lineId);
  }

  const lines = cart.lines.edges.map(({ node }) => {
    if (node.id === lineId) {
      const updated = buildLine(node.merchandise.id, quantity);
      return { node: updated };
    }
    return { node };
  });

  const totals = computeTotals(lines.map(({ node }) => node));
  return {
    cart: {
      ...cart,
      totalQuantity: totals.totalQuantity,
      cost: {
        subtotalAmount: totals.subtotalAmount,
        totalAmount: totals.totalAmount,
      },
      lines: { edges: lines },
    },
  };
}

export function removeMockCartLine(cart, lineId) {
  const lines = cart.lines.edges.filter(({ node }) => node.id !== lineId);
  const totals = computeTotals(lines.map(({ node }) => node));

  return {
    cart: {
      ...cart,
      totalQuantity: totals.totalQuantity,
      cost: {
        subtotalAmount: totals.subtotalAmount,
        totalAmount: totals.totalAmount,
      },
      lines: { edges: lines },
    },
  };
}
