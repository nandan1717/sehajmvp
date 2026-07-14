'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer({ shopName = 'Rivaaz' }) {
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
          <div className={styles.column}>
            <h4 className={styles.heading}>Customer Care</h4>
            <ul className={styles.links}>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Shipping & Returns</a></li>
              <li><a href="#">Sizing Guide</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h4 className={styles.heading}>The Brand</h4>
            <ul className={styles.links}>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Stores</a></li>
            </ul>
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
