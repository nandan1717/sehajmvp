'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './TryOnShowcase.module.css';

export default function TryOnShowcase() {
  return (
    <section className={styles.tryOnSection}>
      <div className={styles.showcaseCard}>
        {/* Left: Text Content */}
        <div className={styles.contentArea}>
          <div className={styles.badge}>
            <svg className={styles.badgeIcon} viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            AI Powered
          </div>
          <h2 className={`${styles.title} serif`}>Experience Your Royal Fit Instantly.</h2>
          <p className={styles.description}>
            Don't just imagine how it looks. Our state-of-the-art AI Try-On technology lets you see the exact drape, fit, and flow of our garments on your unique body shape before you buy.
          </p>
          <Link href="/collections/all" className="btn-primary">
            Try It Now &rarr;
          </Link>
        </div>

        {/* Right: Visual Interactive Area */}
        <div className={styles.visualArea}>
          <div className={styles.glowingOrb} />
          
          <div className={styles.comparisonContainer}>
            {/* Base Image (Simulating the Model) */}
            <Image
              src="https://cdn.shopify.com/s/files/1/0887/0861/2379/files/try-on-model.jpg" // Placeholder for model
              alt="Model wearing the garment"
              fill
              className={styles.comparisonImage}
            />
            
            {/* The animated scanline */}
            <div className={styles.scanline} />

            <span className={styles.labelFlat}>Garment</span>
            <span className={styles.labelModel}>You</span>
          </div>
        </div>
      </div>
    </section>
  );
}
