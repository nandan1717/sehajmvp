'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer({ 
  shopName = 'Store', 
  shopLogo = null,
  shippingPolicyUrl = '/policies/shipping-policy',
  refundPolicyUrl = '/policies/refund-policy',
  contactPolicyUrl = '/pages/contact',
  instagramUrl = '#',
  emailUrl = 'mailto:hello@store.com'
}) {
  const [clickCount, setClickCount] = useState(0);
  const [showDev, setShowDev] = useState(false);

  const handleSecretClick = () => {
    if (!showDev) {
      const nextCount = clickCount + 1;
      if (nextCount >= 5) {
        setShowDev(true);
      } else {
        setClickCount(nextCount);
      }
    }
  };

  return (
    <footer className="container">
      <div className={`glass-bento ${styles.footerBento}`}>
        <div className={styles.grid}>
          <div className={styles.brandColumn}>
            <Link href="/" className={styles.logoLink}>
              {shopLogo ? (
                <img src={shopLogo} alt={shopName} className={styles.bigLogo} />
              ) : (
                <h2 className={styles.bigStoreName}>{shopName}</h2>
              )}
            </Link>
          </div>

          <div className={styles.column}>
            <h4 className={styles.heading}>Store</h4>
            <ul className={styles.links}>
              <li><Link href="/collections/all">Shop All</Link></li>
              <li><Link href="/tags/new-arrivals">New Arrivals</Link></li>
              <li><Link href="/tags/bestsellers">Bestsellers</Link></li>
              <li><Link href="/tags/trending">Trending</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.heading}>The Brand</h4>
            <ul className={styles.links}>
              <li><Link href="/brand-story">Our Story</Link></li>
              <li><Link href="/lookbook">Lookbook</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.heading}>Customer Care</h4>
            <ul className={styles.links}>
              <li><Link href={contactPolicyUrl}>Contact Us</Link></li>
              <li><Link href="/policies/returns-and-exchanges">Returns &amp; Exchanges</Link></li>
              <li><Link href={shippingPolicyUrl}>Shipping</Link></li>
              <li><Link href="/pages/sizing-guide">Sizing Guide</Link></li>
              <li><Link href="/pages/faq">FAQ</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.heading}>Socials</h4>
            <div className={styles.socialLinks}>
              <a href={instagramUrl} className={styles.socialIcon} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href={emailUrl.includes('@') && !emailUrl.startsWith('mailto:') ? `mailto:${emailUrl}` : emailUrl} className={styles.socialIcon} aria-label="Email">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom} onClick={handleSecretClick}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} {shopName}. All rights reserved.
          </div>
          <div className={styles.footerLegal}>
            <Link href="/terms-of-service">Terms of Service</Link>
            <span className={styles.separator}>|</span>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </div>
        </div>
      </div>
      <div className={styles.devClickArea} onClick={handleSecretClick}>
        {showDev ? (
          <div className={styles.devSubtextVisible}>
            Developed by Nandan Goyal
          </div>
        ) : (
          <div className={styles.devSubtextHidden} />
        )}
      </div>
    </footer>
  );
}
