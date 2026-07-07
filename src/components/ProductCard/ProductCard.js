'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TryOnModal from '@/components/TryOn/TryOnModal';
import styles from './ProductCard.module.css';

const COLOR_MAP = {
  'emerald green': '#046307',
  'royal gold': '#D4AF37',
  'gold': '#D4AF37',
  'maroon': '#800000',
  'royal blue': '#002366',
  'blue': '#1e3a8a',
  'navy': '#000080',
  'red': '#dc2626',
  'black': '#171717',
  'white': '#ffffff',
  'ivory': '#fffff0',
  'beige': '#f5f5dc',
  'pink': '#ec4899',
  'rose': '#f43f5e',
  'purple': '#7e22ce',
  'yellow': '#eab308',
  'green': '#16a34a',
  'orange': '#f97316',
  'grey': '#6b7280',
  'gray': '#6b7280',
  'silver': '#c0c0c0',
  'brown': '#854d0e',
  'peach': '#ffdab9',
  'magenta': '#ff00ff',
  'turquoise': '#40e0d0',
  'coral': '#ff7f50',
};

function getColorHex(val) {
  if (!val) return '#d4af37';
  const clean = val.toLowerCase().trim();
  return COLOR_MAP[clean] || '#d4af37';
}

export default function ProductCard({ product }) {
  const { handle, title, priceRange, images, options = [], variants } = product || {};
  const price = priceRange?.minVariantPrice?.amount;
  const currencyCode = priceRange?.minVariantPrice?.currencyCode;

  const primaryImage = images?.nodes?.[0] || images?.edges?.[0]?.node || product?.featuredImage || null;
  
  const [activeImage, setActiveImage] = useState(primaryImage);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  const colorOption = options?.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour');
  const variantNodes = variants?.nodes || variants?.edges?.map(e => e.node) || [];

  function handleColorSelect(val) {
    setSelectedColor(val);
    const match = variantNodes.find(v => {
      return v.selectedOptions?.some(opt => 
        (opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour') && 
        opt.value.toLowerCase() === val.toLowerCase()
      );
    });
    if (match && match.image) {
      setActiveImage(match.image);
    }
  }

  return (
    <div className={styles.cardWrapper}>
      <Link href={`/products/${handle}`} className={styles.card}>
        <div className={styles.imageContainer}>
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText || title || 'Product image'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder}></div>
          )}
          <button
            type="button"
            className={styles.tryOnBadge}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsTryOnOpen(true);
            }}
            title="Try On"
          >
            <span style={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Try On</span>
          </button>
        </div>

      {colorOption && colorOption.values?.length > 0 && (
        <div className={styles.swatchContainer}>
          <div className={styles.swatchRow}>
            {colorOption.values.slice(0, 6).map((val) => {
              const isSelected = selectedColor === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleColorSelect(val);
                  }}
                  onMouseEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleColorSelect(val);
                  }}
                  className={`${styles.colorDot} ${isSelected ? styles.colorDotSelected : ''}`}
                  style={{ backgroundColor: getColorHex(val) }}
                  title={val}
                />
              );
            })}
            {colorOption.values.length > 6 && (
              <span className={styles.moreColors}>+{colorOption.values.length - 6}</span>
            )}
          </div>
          <span className={styles.colorLabel}>
            {selectedColor || `${colorOption.values.length} ${colorOption.values.length === 1 ? 'Color' : 'Colors'}`}
          </span>
        </div>
      )}

      <div className={styles.pricingGrid}>
        <div className={styles.titleBox}>
          <h3 className={`${styles.title} serif`}>{title}</h3>
        </div>
        <div className={styles.priceBox}>
          <p className={`${styles.price} sans`}>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currencyCode || 'USD',
              minimumFractionDigits: 0
            }).format(price || 0)}
          </p>
        </div>
      </div>
      </Link>

      <TryOnModal
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
        product={product}
      />
    </div>
  );
}
