'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './LookbookBlock.module.css';

export default function LookbookBlock({ videoUrl, fallbackImageUrl, images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    
    // Cycle through images like flashcards
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 600); // 600ms per image for a quick flashcard effect

    return () => clearInterval(interval);
  }, [images]);
  
  const currentImage = images?.length > 0 ? images[activeIndex] : fallbackImageUrl;

  return (
    <Link href="/lookbook" style={{ textDecoration: 'none', display: 'block' }}>
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
              src={currentImage || "https://cdn.shopify.com/s/files/1/0887/0861/2379/files/heritage-bg.jpg"} 
              alt="Lookbook"
              fill
              className={styles.heroImage}
            />
          )}
          <div className={styles.heroOverlay} />
        </div>
        <div className={styles.heroContent}>
          <h2 className={`${styles.heroTitle} serif`} style={{ marginBottom: '8px' }}>Lookbook</h2>
          <h3 className={`${styles.heroSubtitle} serif`} style={{ fontSize: '2rem', color: '#D4AF37', marginBottom: '24px' }}>Discover the Collection</h3>
          <p className={`${styles.heroSubtitle} ${styles.desktopOnly}`}>
            Explore our curated edits and find your next statement piece. From festive grandeur to contemporary elegance.
          </p>
        </div>
      </section>
    </Link>
  );
}
