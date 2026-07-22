'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

export default function BrandStoryHero({ images = [], storeName = 'INDIAN WEAR STUDIO' }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    
    // Cycle through images like flashcards
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 600); // 600ms per image for a quick flashcard effect

    return () => clearInterval(interval);
  }, [images]);

  const currentImage = images?.length > 0 ? images[activeIndex] : "/media/hero-image.jpg";

  return (
    <section className={styles.heroBlock}>
      {images.length > 0 && (
        <Image 
          src={currentImage} 
          alt="Brand Story Slider"
          fill
          sizes="100vw"
          priority
          className={styles.heroVideo} // Reusing heroVideo for the background fill class
          style={{ objectFit: 'cover' }}
        />
      )}
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <h1 className={`${styles.heroStoreName} ${styles.titleSerif}`}>{storeName}</h1>
        <p className={`${styles.heroTagline} ${styles.textSans}`}>Rooted in tradition. Styled for today.</p>
        
        <div className={styles.scrollDownIndicator}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </section>
  );
}
