'use client';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer({ shopName = 'Rivaaz' }) {
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
        
        <div className={styles.bottom}>
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
      <div className={styles.devSubtext}>
        Developed by Nandan Goyal
      </div>
    </footer>
  );
}
