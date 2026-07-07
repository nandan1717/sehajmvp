'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './SavedLookModal.module.css';
import { mockProducts } from '@/lib/shopify/mockData';

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

function formatPrice(amount, currencyCode = 'USD') {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
}

export default function SavedLookModal({ look, onClose, onDelete, onAddToBag }) {
  const [fullProduct, setFullProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    if (!look?.product?.handle) return;
    
    async function fetchFullProduct() {
      setLoadingProduct(true);
      try {
        const res = await fetch(`/api/product?handle=${encodeURIComponent(look.product.handle)}`);
        const data = await res.json();
        if (data.success && data.product) {
          setFullProduct(data.product);
        }
      } catch (err) {
        console.error('Failed to fetch full product specifications:', err);
      } finally {
        setLoadingProduct(false);
      }
    }

    fetchFullProduct();
  }, [look]);

  if (!look) return null;

  const cleanHandle = (look.product?.handle || '').toLowerCase().trim();
  const cleanTitle = (look.product?.title || '').toLowerCase().trim();

  const mockMatch = mockProducts.find(p => {
    const pHandle = (p.handle || '').toLowerCase().trim();
    const pTitle = (p.title || '').toLowerCase().trim();
    return (cleanHandle && pHandle === cleanHandle) ||
           (cleanTitle && pTitle === cleanTitle) ||
           (cleanTitle && pTitle.includes(cleanTitle)) ||
           (cleanTitle && cleanTitle.includes(pTitle));
  }) || mockProducts[0];
  
  const activeProduct = fullProduct || mockMatch;

  const vendor = activeProduct?.vendor || 'Rivaaz Luxury Studio';
  const productType = activeProduct?.productType || 'Couture';
  const title = activeProduct?.title || look.product?.title || 'Luxury Attire';
  
  const priceAmount = activeProduct?.priceRange?.minVariantPrice?.amount || activeProduct?.price || look.product?.price;
  const currency = activeProduct?.priceRange?.minVariantPrice?.currencyCode || activeProduct?.currencyCode || look.product?.currencyCode || 'USD';
  const compareAtAmount = activeProduct?.compareAtPriceRange?.minVariantPrice?.amount || activeProduct?.compareAtPrice;
  const hasDiscount = compareAtAmount && parseFloat(compareAtAmount) > parseFloat(priceAmount || 0);

  const descriptionHtml = activeProduct?.descriptionHtml;
  const description = activeProduct?.description || 'Exquisite Indian couture handcrafted with precision, luxurious fabrics, and timeless heritage embroidery.';
  
  const metafields = activeProduct?.metafields?.filter(m => m && m.value) || [];

  const savedProductImg = typeof look.product?.image === 'string'
    ? look.product.image
    : (look.product?.image?.url || look.product?.featuredImage?.url || look.product?.images?.nodes?.[0]?.url || look.product?.images?.edges?.[0]?.node?.url || look.productImage || look.product_image || null);

  const originalImageUrl = activeProduct?.images?.nodes?.[0]?.url 
    || activeProduct?.images?.edges?.[0]?.node?.url 
    || activeProduct?.featuredImage?.url 
    || savedProductImg 
    || look.photoUsedUrl 
    || mockProducts[0]?.images?.nodes?.[0]?.url;

  const displayImageUrl = showOriginal && originalImageUrl ? originalImageUrl : look.tryonImageUrl;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} title="Close Modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Left Column: Image Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={displayImageUrl} 
              alt={title} 
              className={styles.image} 
            />
          </div>
          {originalImageUrl && (
            <div className={styles.imageToggleRow}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${!showOriginal ? styles.toggleBtnActive : ''}`}
                onClick={() => setShowOriginal(false)}
              >
                AI Generated Look
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${showOriginal ? styles.toggleBtnActive : ''}`}
                onClick={() => setShowOriginal(true)}
              >
                Original Product
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Specifications Section */}
        <div className={styles.specsSection}>
          <div className={styles.metaHeader}>
            <span className={styles.vendor}>{vendor}</span>
            <span>•</span>
            <span>{productType}</span>
            {loadingProduct && <span style={{ color: '#888', fontSize: '0.65rem', marginLeft: 'auto' }}>Loading full specs...</span>}
          </div>

          <h2 className={`${styles.title} serif`}>{title}</h2>

          <div className={styles.priceRow}>
            <span className={`${styles.price} sans`}>{formatPrice(priceAmount, currency)}</span>
            {hasDiscount && (
              <span className={`${styles.comparePrice} sans`}>{formatPrice(compareAtAmount, currency)}</span>
            )}
          </div>

          {/* AI Stylist Notes Box */}
          {look.stylistNotes && (
            <div className={styles.stylistBox}>
              <div className={styles.stylistHeader}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                AI Stylist Analysis & Draping Notes
              </div>
              <p className={`${styles.stylistText} serif`}>&quot;{look.stylistNotes}&quot;</p>
            </div>
          )}

          {/* Selected Color / Swatches */}
          {look.product?.selectedColor && (
            <div className={styles.optionRow}>
              <span className={styles.optionLabel}>Selected Shade</span>
              <div>
                <div className={styles.colorSwatch}>
                  <span className={styles.colorCircle} style={{ backgroundColor: getColorHex(look.product.selectedColor) }} />
                  <span>{look.product.selectedColor}</span>
                 </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.addToBagBtn}
              onClick={() => {
                onAddToBag(look.product?.variantId);
                onClose();
              }}
            >
              Add Look to Bag
            </button>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => {
                onDelete(look.id);
                onClose();
              }}
            >
              Remove
            </button>
          </div>

          {/* Shipping Note */}
          <div className={styles.shippingNote}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
              <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/>
              <circle cx="7" cy="18" r="2"/>
              <circle cx="17" cy="18" r="2"/>
            </svg>
            <span>Free complimentary express shipping & 30-day hassle-free returns.</span>
          </div>

          {/* Description */}
          <div>
            <h3 className={styles.sectionTitle}>Description</h3>
            {descriptionHtml ? (
              <div 
                className={`${styles.descriptionHtml} sans`} 
                dangerouslySetInnerHTML={{ __html: descriptionHtml }} 
              />
            ) : (
              <p className={`${styles.descriptionHtml} sans`}>{description}</p>
            )}
          </div>

          {/* Metafields / Specifications */}
          {metafields.length > 0 && (
            <div>
              <h3 className={styles.sectionTitle}>Product Details & Care</h3>
              <div className={styles.metafieldsGrid}>
                {metafields.map((mf, i) => {
                  const label = mf.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <div key={mf.key || i} className={styles.metafieldCard}>
                      <span className={styles.metafieldKey}>{label}</span>
                      <span className={styles.metafieldVal}>{mf.value}</span>
                    </div>
                  );
                 })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
