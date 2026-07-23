'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import SearchModal from '../Search/SearchModal';
import styles from './Navbar.module.css';

export default function Navbar({ shopName = 'Store', shopLogo = null }) {
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, openCart } = useCart();
  const { user } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const itemCount = cart?.totalQuantity || 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className={styles.navbarWrapper}>
        <header className={`glass-bento ${styles.navbar} ${scrolled ? styles.scrolled : ''} ${(!isHomePage && isMobileMenuOpen) ? styles.headerMobileOpen : ''}`}>
          <div className={styles.navContainer}>
            {/* Hamburger – mobile only */}
            <button
              className={styles.hamburger}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`} />
              <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`} />
              <span className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.open : ''}`} />
            </button>

            {/* Desktop nav links */}
            <nav className={styles.navLinks}>
              <Link href="/collections/all" className={styles.navShopLink}>Shop</Link>
              <Link href="/tags/new-arrivals">New Arrivals</Link>
              <Link href="/tags/bestsellers">Bestsellers</Link>
              <Link href="/tags/trending">Trending</Link>
            </nav>

            <Link
              href="/"
              className={`${styles.logo} serif`}
              onClick={() => {
                if (typeof window !== 'undefined' && window.location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              title="Return to Homepage"
            >
              <img
                src="/pagelogo.png"
                alt="Store Logo"
                className={styles.logoImage}
              />
            </Link>

            <div className={styles.actions}>
              <Link href="/profile?tab=tryon" className={`${styles.actionBtn} ${styles.tryOnNavBtn}`} aria-label="Try-On Gallery">
                <span className={styles.desktopNavTooltip}>Try-On Gallery</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                  <path d="M20 3v4"></path>
                  <path d="M22 5h-4"></path>
                  <path d="M4 17v2"></path>
                  <path d="M5 18H3"></path>
                </svg>
              </Link>

              <button className={styles.actionBtn} onClick={() => setIsSearchOpen(true)} aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>

              <Link href="/profile" className={styles.actionBtn} aria-label="Account">
                <div className={styles.profileIconWrapper}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {user && <span className={styles.activeDot} />}
                </div>
              </Link>

              <button className={styles.actionBtn} onClick={openCart} aria-label="Cart">
                <div className={styles.cartIconWrapper}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  {itemCount > 0 && (
                    <span className={styles.cartBadge}>{itemCount > 9 ? '9+' : itemCount}</span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile drawer */}
          <nav className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.mobileDrawerOpen : ''} ${(!isHomePage && isMobileMenuOpen) ? styles.mobileDrawerTranslucent : ''}`}>
            <Link href="/collections/all" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
            <Link href="/tags/new-arrivals" onClick={() => setIsMobileMenuOpen(false)}>New Arrivals</Link>
            <Link href="/tags/bestsellers" onClick={() => setIsMobileMenuOpen(false)}>Bestsellers</Link>
            <Link href="/tags/trending" onClick={() => setIsMobileMenuOpen(false)}>Trending</Link>
            <Link href="/profile?tab=tryon" onClick={() => setIsMobileMenuOpen(false)}>
              Try-On Gallery
            </Link>
          </nav>
        </header>
      </div>

      {/* Backdrop overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Floating Glassmorphic Try-On Gallery Container (Bottom Right) */}
      <div className={styles.mobileFloatingTryOnContainer}>
        <span className={styles.bubbleTooltip}>Try-On Gallery</span>
        <Link href="/profile?tab=tryon" className={styles.mobileFloatingTryOnBubble} aria-label="Try-On Gallery">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
            <path d="M20 3v4"></path>
            <path d="M22 5h-4"></path>
            <path d="M4 17v2"></path>
            <path d="M5 18H3"></path>
          </svg>
        </Link>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

