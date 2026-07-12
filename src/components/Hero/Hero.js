'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero({ products = [] }) {
  // Extract top products with images
  const galleryItems = products.slice(0, 5).map(({ node }) => ({
    id: node.id,
    title: node.title,
    handle: node.handle,
    price: node.priceRange?.minVariantPrice?.amount,
    currencyCode: node.priceRange?.minVariantPrice?.currencyCode,
    image: node.images?.edges[0]?.node?.url,
    alt: node.images?.edges[0]?.node?.altText || node.title
  })).filter(item => item.image);

  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  // Auto-cycle through gallery images smoothly every 4.5 seconds
  useEffect(() => {
    if (galleryItems.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % galleryItems.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [galleryItems.length]);

  const activeProduct = galleryItems[activeIndex] || null;

  // Touch swipe handlers for seamless mobile navigation without carousel dots
  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || galleryItems.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swipe left -> Next slide
        setActiveIndex((prev) => (prev + 1) % galleryItems.length);
      } else {
        // Swipe right -> Previous slide
        setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
      }
    }
    setTouchStartX(null);
  };

  return (
    <section className={`glass-bento ${styles.heroBento}`}>
      {/* Heavily blurred background image using active product image */}
      <div className={styles.bgImageWrapper}>
        {activeProduct ? (
          <Image
            key={activeProduct.id}
            src={activeProduct.image}
            alt="Blurred background"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            loading="eager"
            className={styles.bgImage}
          />
        ) : (
          <div className={styles.bgFallback} />
        )}
        <div className={styles.bgOverlay}></div>
      </div>

      {/* Content Layout */}
      <div className={styles.heroContentGrid}>

        {/* Left: Text Content */}
        <div className={styles.textContentWrapper}>
          <div className={`glass-bento ${styles.textContent}`}>
            <h1 className={`${styles.title} serif`}>You Are The<br />Masterpiece.</h1>
            <p className={styles.subtitle}>Every thread and drape is handcrafted for one purpose: to honor the commanding presence, dignity, and royal grace that is inherently yours.</p>
            {activeProduct ? (
              <div className={styles.featuredInfo}>
                <span className={styles.featuredBadge}>Featured Piece</span>
                <h3 className={`${styles.featuredTitle} serif`}>{activeProduct.title}</h3>
                <Link href={`/products/${activeProduct.handle}`} className="btn-primary" style={{ marginTop: '8px' }}>
                  Shop This Look &rarr;
                </Link>
              </div>
            ) : (
              <Link href="/collections/all" className="btn-primary">
                Explore Collection
              </Link>
            )}
          </div>
        </div>

        {/* Right: Dynamic Gallery Container with Pre-rendered Slides & Touch Swiping */}
        <div className={styles.galleryWrapper}>
          <div
            className={`glass-bento ${styles.galleryContainer}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {galleryItems.length > 0 ? (
              <>
                {/* Pre-render all slides inside slidesStage so crossfades happen instantly without stacking on desktop */}
                <div className={styles.slidesStage}>
                  {galleryItems.map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.handle}`}
                      className={styles.imageLink}
                      style={{
                        opacity: index === activeIndex ? 1 : 0,
                        transition: 'opacity 0.8s ease-in-out',
                        zIndex: index === activeIndex ? 2 : 1,
                        pointerEvents: index === activeIndex ? 'auto' : 'none'
                      }}
                    >
                      <Image
                        src={item.image}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 35vw"
                        className={styles.galleryImage}
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </Link>
                  ))}
                </div>

                {/* Thumbnails Overlay (Visible on desktop, hidden via CSS on mobile) */}
                {galleryItems.length > 1 && (
                  <div className={styles.thumbnailsContainer}>
                    {galleryItems.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveIndex(index)}
                        className={`${styles.thumbnailBtn} ${index === activeIndex ? styles.activeThumbnail : ''}`}
                        title={item.title}
                      >
                        <Image
                          src={item.image}
                          alt={item.alt}
                          fill
                          sizes="50px"
                          className={styles.thumbnailImg}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.galleryPlaceholder}>
                <p className="serif">Curating Collection...</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
