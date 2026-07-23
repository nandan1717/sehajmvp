'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './HeritageBlock.module.css';

export default function HeritageBlock({ videoUrl, fallbackImageUrl, storeName }) {
  return (
    <Link href="/brand-story" style={{ textDecoration: 'none', display: 'block' }}>
      <section className={`glass-bento ${styles.heritageSection}`}>
        <div className={styles.heroVisual}>
          {videoUrl ? (
            <video 
              src={videoUrl} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className={styles.heroVideo}
            />
          ) : (
            <Image 
              src={fallbackImageUrl || "https://cdn.shopify.com/s/files/1/0887/0861/2379/files/heritage-bg.jpg"} 
              alt="Modern Punjabi Fashion"
              fill
              className={styles.heroImage}
            />
          )}
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <img src="/pagelogo.png" alt="Store Logo" className={styles.heritageLogo} />
          <h3 className={`${styles.heroSubtitle} ${styles.desktopOnly} serif`} style={{ fontSize: '2rem', color: '#D4AF37', marginBottom: '24px' }}>Rooted in Tradition, Styled for Today.</h3>
          <p className={`${styles.heroSubtitle} ${styles.desktopOnly}`}>
            The modern Punjabi woman honors her heritage without being bound by it. She demands elegance, versatility, and uncompromising craftsmanship.
          </p>
          <p className={`${styles.mobileOnly} serif`} style={{ fontSize: '1.5rem', color: '#D4AF37', margin: 0 }}>
            Our Story
          </p>
        </div>
      </section>
    </Link>
  );
}
