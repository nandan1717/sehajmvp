'use client';

import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';

export default function CartShell() {
  const { isOpen, closeCart, cart, isUpdating, updateLine, removeLine } = useCart();

  return (
    <CartDrawer
      isOpen={isOpen}
      onClose={closeCart}
      cart={cart}
      isUpdating={isUpdating}
      onUpdateLine={updateLine}
      onRemoveLine={removeLine}
    />
  );
}
