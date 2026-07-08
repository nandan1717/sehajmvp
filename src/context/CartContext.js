'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import {
  addToCart as addToCartAction,
  updateCartLine,
  removeFromCart,
} from '@/lib/shopify/cart-actions';
import { useAnalytics } from '@/hooks/useAnalytics';

const CartContext = createContext(null);

export function CartProvider({ children, initialCart }) {
  const [cart, setCart] = useState(initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { publish } = useAnalytics();

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addToCart = useCallback(async (variantId, quantity = 1) => {
    setIsUpdating(true);
    try {
      const result = await addToCartAction(variantId, quantity);
      if (result.success && result.cart) {
        setCart(result.cart);
        setIsOpen(true);
        
        // Find the added line item in the cart to fire analytics
        // Usually it's the first or last depending on Shopify return, we can search by variantId
        const addedLine = result.cart.lines?.edges?.find(edge => edge.node.merchandise.id === variantId)?.node;
        
        if (addedLine) {
          publish('product_added_to_cart', {
            cartLine: {
              id: addedLine.id,
              quantity: quantity,
              merchandise: {
                id: addedLine.merchandise.id,
                title: addedLine.merchandise.title,
                price: { 
                  amount: addedLine.merchandise.price.amount, 
                  currencyCode: addedLine.merchandise.price.currencyCode 
                },
                product: {
                  id: addedLine.merchandise.product.id,
                  title: addedLine.merchandise.product.title,
                  vendor: addedLine.merchandise.product.vendor,
                }
              }
            }
          });
        }
      }
      return result;
    } finally {
      setIsUpdating(false);
    }
  }, [publish]);

  const updateLine = useCallback(async (lineId, quantity) => {
    setIsUpdating(true);
    try {
      const result = await updateCartLine(lineId, quantity);
      if (result.success) {
        setCart(result.cart?.totalQuantity === 0 ? null : result.cart);
      }
      return result;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const removeLine = useCallback(async (lineId) => {
    setIsUpdating(true);
    try {
      const result = await removeFromCart(lineId);
      if (result.success) {
        setCart(result.cart?.totalQuantity === 0 ? null : result.cart);
      }
      return result;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isUpdating,
        openCart,
        closeCart,
        addToCart,
        updateLine,
        removeLine,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
