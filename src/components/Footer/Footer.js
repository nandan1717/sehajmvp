'use client';
import styles from './Footer.module.css';

export default function Footer() {
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
              <li><a href="#">The Atelier</a></li>
              <li><a href="#">Editorial / Journal</a></li>
              <li><a href="#">Stores</a></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h4 className={styles.heading}>Newsletter</h4>
            <p className={styles.newsletterText}>Join our inner circle for exclusive access.</p>
            <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email address" className={styles.input} required />
              <button type="submit" className={styles.submitBtn}>Subscribe</button>
            </form>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} Rivaaz. All rights reserved.
          </div>
          <div className={styles.emblem}>
            <span className={`${styles.wings} serif`}>Wings of Freedom</span>
          </div>
          <div className={styles.devStamp}>
            Developed by nandan goyal
          </div>
        </div>
      </div>
    </footer>
  );
}
