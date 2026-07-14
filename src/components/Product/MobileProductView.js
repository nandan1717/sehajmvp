'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import TryOnModal from '@/components/TryOn/TryOnModal';
import styles from './MobileProductView.module.css';

function formatPrice(amount, currencyCode = 'USD') {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
}

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

export default function MobileProductView({ product }) {
  const { cart, addToCart, openCart, isUpdating } = useCart();
  const { user } = useAuth();

  const {
    title,
    description,
    descriptionHtml,
    vendor,
    productType,
    priceRange,
    compareAtPriceRange,
    variants,
    options = [],
    metafields = [],
  } = product || {};

  const variantNodes = variants?.nodes || variants?.edges?.map(({ node }) => node) || [];
  const defaultVariant = variantNodes.find((v) => v.availableForSale) || variantNodes[0] || null;

  const rawImages = product?.images?.nodes || product?.images?.edges?.map((e) => e.node) || [];
  const allImages = rawImages.length > 0 ? rawImages : product?.featuredImage ? [product.featuredImage] : [];

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const activeImage = allImages[activeImgIndex] || null;

  const initialMap = {};
  if (defaultVariant?.selectedOptions) {
    defaultVariant.selectedOptions.forEach((opt) => {
      initialMap[opt.name.toLowerCase()] = opt.value;
    });
  }

  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [selectedOptionsMap, setSelectedOptionsMap] = useState(initialMap);
  const [feedback, setFeedback] = useState(null);
  const searchParams = useSearchParams();
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  useEffect(() => {
    if (searchParams && searchParams.get('tryon') === 'true') {
      setIsTryOnOpen(true);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('tryon');
        window.history.replaceState(null, '', url.pathname + url.search);
      }
    }
  }, [searchParams]);

  function handleOptionChange(optionName, value) {
    const nextMap = {
      ...selectedOptionsMap,
      [optionName.toLowerCase()]: value,
    };
    setSelectedOptionsMap(nextMap);

    const exactMatch = variantNodes.find((v) => {
      return v.selectedOptions?.every((opt) => {
        return nextMap[opt.name.toLowerCase()] === opt.value;
      });
    });

    if (exactMatch) {
      setSelectedVariant(exactMatch);
      if (exactMatch.image) {
        const imgIdx = allImages.findIndex((img) => img.url === exactMatch.image.url);
        if (imgIdx !== -1) setActiveImgIndex(imgIdx);
      }
    } else {
      const partialMatch = variantNodes.find((v) => {
        return v.selectedOptions?.some(
          (opt) => opt.name.toLowerCase() === optionName.toLowerCase() && opt.value === value
        );
      });
      if (partialMatch) {
        setSelectedVariant(partialMatch);
        const syncedMap = {};
        partialMatch.selectedOptions?.forEach((opt) => {
          syncedMap[opt.name.toLowerCase()] = opt.value;
        });
        setSelectedOptionsMap(syncedMap);
        if (partialMatch.image) {
          const imgIdx = allImages.findIndex((img) => img.url === partialMatch.image.url);
          if (imgIdx !== -1) setActiveImgIndex(imgIdx);
        }
      }
    }
  }

  function isOptionValueAvailable(optionName, value) {
    return variantNodes.some((v) => {
      const hasValue = v.selectedOptions?.some(
        (opt) => opt.name.toLowerCase() === optionName.toLowerCase() && opt.value === value
      );
      if (!hasValue) return false;
      return v.availableForSale;
    });
  }

  const displayPrice = selectedVariant?.price || priceRange?.minVariantPrice;
  const displayCompareAtPrice = selectedVariant?.compareAtPrice || compareAtPriceRange?.minVariantPrice;

  const hasDiscount =
    displayCompareAtPrice && parseFloat(displayCompareAtPrice.amount) > parseFloat(displayPrice?.amount || 0);
  const discountPercent = hasDiscount
    ? Math.round(
        ((parseFloat(displayCompareAtPrice.amount) - parseFloat(displayPrice.amount)) /
          parseFloat(displayCompareAtPrice.amount)) *
          100
      )
    : 0;

  const validMetafields = metafields?.filter((m) => m && m.value) || [];
  const itemCount = cart?.totalQuantity || 0;

  async function handleAddToCart() {
    if (!selectedVariant) {
      setFeedback({ type: 'error', message: 'Please select an option' });
      return;
    }
    if (!selectedVariant.availableForSale) {
      setFeedback({ type: 'error', message: 'This item is currently sold out' });
      return;
    }

    setFeedback(null);
    const result = await addToCart(selectedVariant.id, 1);

    if (result.success) {
      setFeedback({ type: 'success', message: 'Added to bag successfully.' });
      openCart();
    } else {
      setFeedback({ type: 'error', message: result.error || 'Could not add to cart' });
    }
  }

  return (
    <div className={styles.mobileContainer}>
      {/* 1. Hero Section (70vh Editorial Image) */}
      <section className={styles.heroSection}>
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.altText || title || 'Product image'}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.heroImage}
            priority
          />
        ) : (
          <div className={styles.placeholderImage}>No Image Available</div>
        )}

        {/* Image Counter Badge / Sparse Corner Text */}
        {allImages.length > 1 && (
          <div className={styles.imageCounter}>
            <span className={styles.counterText}>
              {String(activeImgIndex + 1).padStart(2, '0')} / {String(allImages.length).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Thumbnail Selector Dots / Strips */}
        {allImages.length > 1 && (
          <div className={styles.imageStrips}>
            {allImages.map((img, idx) => (
              <button
                key={img.url || idx}
                type="button"
                onClick={() => setActiveImgIndex(idx)}
                className={`${styles.strip} ${idx === activeImgIndex ? styles.stripActive : ''}`}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Product Details (Below the Fold) */}
      <section className={styles.detailsSection}>
        {(vendor || productType) && (
          <div className={styles.metaHeader}>
            {vendor && <span className={styles.vendor}>{vendor}</span>}
            {vendor && productType && <span className={styles.metaDot}>•</span>}
            {productType && <span className={styles.productType}>{productType}</span>}
          </div>
        )}

        <h1 className={`${styles.title} serif`}>{title}</h1>

        <div className={styles.priceRow}>
          <span className={`${styles.price} sans`}>
            {displayPrice ? formatPrice(displayPrice.amount, displayPrice.currencyCode) : 'Price not available'}
          </span>
          {hasDiscount && (
            <>
              <span className={styles.comparePrice}>
                {formatPrice(displayCompareAtPrice.amount, displayCompareAtPrice.currencyCode)}
              </span>
              <span className={styles.saleBadge}>{discountPercent}% OFF</span>
            </>
          )}
        </div>

        {/* Options (Size Selector & Color Swatches) */}
        <div className={styles.optionsContainer}>
          {options.map((option) => {
            if (option.name === 'Title' && option.values?.[0] === 'Default Title') return null;

            const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';
            const selectedVal = selectedOptionsMap[option.name.toLowerCase()];

            return (
              <div key={option.id || option.name} className={styles.optionGroup}>
                <div className={styles.optionHeader}>
                  <span className={styles.optionLabel}>{option.name}</span>
                  <span className={styles.optionSelectedValue}>{selectedVal}</span>
                </div>

                <div className={isColor ? styles.colorList : styles.variantList}>
                  {option.values.map((val) => {
                    const isSelected = selectedVal === val;
                    const isAvailable = isOptionValueAvailable(option.name, val);

                    if (isColor) {
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleOptionChange(option.name, val)}
                          className={`${styles.colorSwatch} ${isSelected ? styles.colorSwatchSelected : ''} ${
                            !isAvailable ? styles.swatchDisabled : ''
                          }`}
                          title={`${val}${!isAvailable ? ' (Sold Out)' : ''}`}
                        >
                          <span className={styles.colorCircle} style={{ backgroundColor: getColorHex(val) }} />
                          <span className={styles.colorName}>{val}</span>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleOptionChange(option.name, val)}
                        className={`${styles.variantSquare} sans ${isSelected ? styles.variantSelected : ''} ${
                          !isAvailable ? styles.variantDisabled : ''
                        }`}
                        disabled={!isAvailable}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Virtual Try-On Button */}
        <button type="button" className={styles.tryOnBtn} onClick={() => setIsTryOnOpen(true)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Try On Virtual Stylist
          </span>
        </button>

        <TryOnModal
          isOpen={isTryOnOpen}
          onClose={() => setIsTryOnOpen(false)}
          product={product}
          initialVariant={selectedVariant}
        />

        {/* Shipping Note */}
        <div className={styles.shippingNote}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
            <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
            <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
          </svg>
          <span>Free complimentary express shipping & 30-day hassle-free returns.</span>
        </div>

        {/* 4. Collapsible Accordion Menu (Description & Composition) */}
        <div className={styles.accordionContainer}>
          <details className={styles.accordion} open>
            <summary className={styles.accordionSummary}>
              <span className="serif">Description & Composition</span>
              <svg className={styles.accordionIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </summary>
            <div className={styles.accordionContent}>
              {descriptionHtml ? (
                <div className={styles.descriptionHtml} dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              ) : (
                <p className={styles.descriptionText}>{description}</p>
              )}
            </div>
          </details>

          {validMetafields.length > 0 && (
            <details className={styles.accordion}>
              <summary className={styles.accordionSummary}>
                <span className="serif">Product Details & Care</span>
                <svg className={styles.accordionIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </summary>
              <div className={styles.accordionContent}>
                <div className={styles.metafieldsGrid}>
                  {validMetafields.map((mf, i) => {
                    const label = mf.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                    return (
                      <div key={mf.key || i} className={styles.metafieldItem}>
                        <span className={styles.metafieldKey}>{label}: </span>
                        <span className={styles.metafieldValue}>{mf.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>
          )}
        </div>

        {/* 5. Call to Action (CTA) - Zero Border Radius Stark Button */}
        {feedback && (
          <p
            className={`${styles.feedback} ${
              feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess
            }`}
          >
            {feedback.message}
          </p>
        )}

        <button
          type="button"
          className={styles.starkCtaBtn}
          onClick={handleAddToCart}
          disabled={isUpdating || !selectedVariant?.availableForSale}
        >
          {isUpdating
            ? 'Adding to Bag...'
            : selectedVariant?.availableForSale === false
            ? 'Sold Out'
            : 'Add To Bag'}
        </button>
      </section>
    </div>
  );
}
