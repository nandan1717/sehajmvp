'use client';

import { useState } from 'react';
import styles from './CartDrawer.module.css';

export default function CartDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.drawer} glass-panel animate-fade-in`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className={styles.body}>
          <div className={styles.emptyState}>
            <p>Your cart is currently empty.</p>
            <button className="btn-outline" onClick={onClose} style={{ marginTop: '24px' }}>
              Continue Shopping
            </button>
          </div>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.subtotal}>
            <span>Subtotal</span>
            <span>$0.00</span>
          </div>
          <p className={styles.note}>Shipping and taxes calculated at checkout.</p>
          <button className="btn-primary" disabled style={{ width: '100%' }}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
}
