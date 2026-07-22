'use client';

import styles from './page.module.css';

export default function ContactPage() {
  return (
    <div className={styles.pageLayout}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={`${styles.title} serif`}>Contact Us</h1>
          <p className={styles.subtitle}>We&apos;re Here to Help</p>
          <p className={styles.note}>Reach out to us via email, phone, or direct message on Instagram.</p>
        </div>

        <div className={styles.bentoGrid}>
          {/* Email */}
          <a href="mailto:hello@mehnazz.com" className={`glass-bento ${styles.bentoCard}`}>
            <div className={styles.iconWrapper}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h3 className={`${styles.cardTitle} serif`}>Email Us</h3>
            <p className={styles.cardValue}>hello@mehnazz.com</p>
            <p className={styles.cardSub}>Expect a response within 24 hours.</p>
          </a>

          {/* Phone */}
          <a href="tel:+12368807856" className={`glass-bento ${styles.bentoCard}`}>
            <div className={styles.iconWrapper}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <h3 className={`${styles.cardTitle} serif`}>Call Us</h3>
            <p className={styles.cardValue}>+1 (236) 880-7856</p>
            <p className={styles.cardSub}>Available Mon-Fri, 9AM to 6PM.</p>
          </a>

          {/* Instagram */}
          <a href="https://www.instagram.com/mehnazzlegacy?igsh=eGhpZjVhem84aTBz" target="_blank" rel="noopener noreferrer" className={`glass-bento ${styles.bentoCard}`}>
            <div className={styles.iconWrapper}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <h3 className={`${styles.cardTitle} serif`}>Instagram</h3>
            <p className={styles.cardValue}>@mehnazzlegacy</p>
            <p className={styles.cardSub}>Send us a DM for quick styling advice.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
