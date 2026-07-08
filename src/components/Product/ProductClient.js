'use client';

import { useState } from 'react';
import Image from 'next/image';
import ProductDetail from './ProductDetail';
import ProductCard from '@/components/ProductCard/ProductCard';
import styles from '@/app/products/[handle]/page.module.css';

export default function ProductClient({ product, recommendations = [] }) {
  const rawImages = product?.images?.nodes || product?.images?.edges?.map(e => e.node) || [];
  const allImages = rawImages.length > 0 ? rawImages : product?.featuredImage ? [product.featuredImage] : [];
  
  const [activeImage, setActiveImage] = useState(allImages[0] || null);

  function handleImageSelect(img) {
    if (img && img.url) {
      setActiveImage(img);
    }
  }

  return (
    <>
    <div className={`container ${styles.pdpContainer}`}>
      <div className={styles.gallerySection}>
        <div className={`glass-bento ${styles.primaryImageWrapper}`}>
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText || product?.title || 'Product image'}
              fill
              sizes="(max-width: 900px) 100vw, 60vw"
              className={styles.image}
              priority
              loading="eager"
            />
          ) : (
            <div className={styles.placeholderImage}>No Image Available</div>
          )}
        </div>

        {allImages.length > 1 && (
          <div className={styles.secondaryGrid}>
            {allImages.map((img, i) => {
              const isSelected = activeImage?.url === img.url;
              return (
                <button
                  key={img.url || i}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`glass-bento ${styles.secondaryImageWrapper}`}
                  style={{
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #D4AF37' : '1px solid var(--glass-border)',
                    boxShadow: isSelected ? '0 0 16px rgba(212, 175, 55, 0.35)' : 'none',
                    transition: 'all 0.3s ease',
                    padding: 0,
                    outline: 'none',
                    aspectRatio: '4 / 5'
                  }}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `${product?.title || 'Product'} thumbnail ${i + 1}`}
                    fill
                    sizes="(max-width: 900px) 25vw, 15vw"
                    className={styles.image}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.infoSection}>
        <div className={`glass-bento ${styles.stickyInfoBox}`}>
          <ProductDetail product={product} onImageSelect={handleImageSelect} />
        </div>
      </div>
    </div>
    {recommendations && recommendations.length > 0 && (
      <div className={`container ${styles.recommendationsSection}`}>
        <h2 className={`serif ${styles.recommendationsTitle}`}>You May Also Like</h2>
        <div className={styles.recommendationsGrid}>
          {recommendations.map(rec => (
            <ProductCard key={rec.id} product={rec} />
          ))}
        </div>
      </div>
    )}
    </>
  );
}
