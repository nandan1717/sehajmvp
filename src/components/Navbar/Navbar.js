'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { cart, openCart } = useCart();
  const itemCount = cart?.totalQuantity || 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.navbarWrapper}>
      <header className={`glass-bento ${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navContainer}>
          <nav className={styles.navLinks}>
            <Link href="/collections/bestsellers">Bestsellers</Link>
            <Link href="/collections/shawls">Shawls</Link>
            <Link href="/collections/suits">Suits</Link>
          </nav>

          <Link href="/" className={`${styles.logo} serif`}>
            Rivaaz
          </Link>

          <div className={styles.actions}>
            <Link href="/collections/all" className={styles.actionBtn} aria-label="Shop">
              Shop
            </Link>
            <button className={styles.actionBtn} onClick={openCart} aria-label="Cart">
              <div className={styles.cartIconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                {itemCount > 0 && (
                  <span className={styles.cartBadge}>{itemCount > 9 ? '9+' : itemCount}</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
