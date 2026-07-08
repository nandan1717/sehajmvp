'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useCart } from '@/context/CartContext';
import TryOnModal from '@/components/TryOn/TryOnModal';
import styles from './ProductDetail.module.css';

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

export default function ProductDetail({ product, onImageSelect }) {
  const { addToCart, isUpdating } = useCart();
  
  const { 
    title, 
    description, 
    descriptionHtml, 
    vendor, 
    productType, 
    tags, 
    priceRange, 
    compareAtPriceRange, 
    variants, 
    options = [],
    collections,
    metafields = []
  } = product || {};

  const variantNodes = variants?.nodes || variants?.edges?.map(({ node }) => node) || [];
  
  const canPurchase = (v) => v?.availableForSale || v?.inventoryPolicy === 'CONTINUE';

  const defaultVariant = variantNodes.find(canPurchase) || variantNodes[0] || null;

  // Build initial selectedOptionsMap from defaultVariant
  const initialMap = {};
  if (defaultVariant?.selectedOptions) {
    defaultVariant.selectedOptions.forEach(opt => {
      initialMap[opt.name.toLowerCase()] = opt.value;
    });
  }

  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [selectedOptionsMap, setSelectedOptionsMap] = useState(initialMap);
  const [feedback, setFeedback] = useState(null);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  
  const { publish } = useAnalytics();

  useEffect(() => {
    if (selectedVariant && product) {
      publish('product_viewed', {
        productVariant: {
          id: selectedVariant.id,
          title: selectedVariant.title,
          price: selectedVariant.price?.amount || priceRange?.minVariantPrice?.amount,
          product: { 
            id: product.id, 
            title: product.title,
            vendor: product.vendor,
          }
        }
      });
    }
  }, [selectedVariant, product, publish, priceRange]);

  // When selectedVariant changes or options map updates, ensure image synchronizes if available
  function handleOptionChange(optionName, value) {
    const nextMap = {
      ...selectedOptionsMap,
      [optionName.toLowerCase()]: value
    };
    setSelectedOptionsMap(nextMap);

    // Try finding exact combination
    const exactMatch = variantNodes.find(v => {
      return v.selectedOptions?.every(opt => {
        return nextMap[opt.name.toLowerCase()] === opt.value;
      });
    });

    if (exactMatch) {
      setSelectedVariant(exactMatch);
      if (exactMatch.image && onImageSelect) {
        onImageSelect(exactMatch.image);
      }
    } else {
      // If exact combo doesn't exist, find any variant that has the newly clicked option value
      const partialMatch = variantNodes.find(v => {
        return v.selectedOptions?.some(opt => opt.name.toLowerCase() === optionName.toLowerCase() && opt.value === value);
      });
      if (partialMatch) {
        setSelectedVariant(partialMatch);
        const syncedMap = {};
        partialMatch.selectedOptions?.forEach(opt => {
          syncedMap[opt.name.toLowerCase()] = opt.value;
        });
        setSelectedOptionsMap(syncedMap);
        if (partialMatch.image && onImageSelect) {
          onImageSelect(partialMatch.image);
        }
      }
    }
  }

  function isOptionValueAvailable(optionName, value) {
    return variantNodes.some(v => {
      const hasValue = v.selectedOptions?.some(opt => opt.name.toLowerCase() === optionName.toLowerCase() && opt.value === value);
      if (!hasValue) return false;
      return canPurchase(v);
    });
  }

  const displayPrice = selectedVariant?.price || priceRange?.minVariantPrice;
  const displayCompareAtPrice = selectedVariant?.compareAtPrice || compareAtPriceRange?.minVariantPrice;
  
  const hasDiscount = displayCompareAtPrice && parseFloat(displayCompareAtPrice.amount) > parseFloat(displayPrice?.amount || 0);
  const discountPercent = hasDiscount 
    ? Math.round(((parseFloat(displayCompareAtPrice.amount) - parseFloat(displayPrice.amount)) / parseFloat(displayCompareAtPrice.amount)) * 100)
    : 0;

  const collectionNodes = collections?.nodes || collections?.edges?.map(e => e.node) || [];
  const validMetafields = metafields?.filter(m => m && m.value) || [];

  async function handleAddToCart() {
    if (!selectedVariant) {
      setFeedback({ type: 'error', message: 'Please select an option' });
      return;
    }
    if (!canPurchase(selectedVariant)) {
      setFeedback({ type: 'error', message: 'This item is currently sold out' });
      return;
    }

    setFeedback(null);
    const result = await addToCart(selectedVariant.id, 1);

    if (result.success) {
      setFeedback({ type: 'success', message: 'Added to bag successfully.' });
    } else {
      setFeedback({ type: 'error', message: result.error || 'Could not add to cart' });
    }
  }

  // Hide empty fields logic
  const fieldsToShow = {
    vendor: vendor || null,
    productType: productType || null,
    tags: tags?.length > 0 ? tags : null,
    sku: selectedVariant?.sku || null,
    barcode: selectedVariant?.barcode || null,
    weight: selectedVariant?.weight ? `${selectedVariant.weight} ${selectedVariant.weightUnit || 'kg'}`.toLowerCase() : null,
    collections: collectionNodes.length > 0 ? collectionNodes : null,
    stock: selectedVariant?.quantityAvailable !== undefined && selectedVariant?.quantityAvailable !== null ? selectedVariant.quantityAvailable : null
  };

  return (
    <div className={styles.infoBento}>
      {/* Vendor & Product Type Header */}
      {(fieldsToShow.vendor || fieldsToShow.productType) && (
        <div className={styles.metaHeader}>
          {fieldsToShow.vendor && <span className={styles.vendor}>{fieldsToShow.vendor}</span>}
          {fieldsToShow.vendor && fieldsToShow.productType && <span className={styles.metaDot}>•</span>}
          {fieldsToShow.productType && <span className={styles.productType}>{fieldsToShow.productType}</span>}
        </div>
      )}

      {/* Title */}
      <h1 className={`${styles.title} serif`}>{title}</h1>

      {/* Price + Compare At Price + Sale Badge */}
      <div className={styles.priceRow}>
        <span className={`${styles.price} sans`}>
          {displayPrice
            ? formatPrice(displayPrice.amount, displayPrice.currencyCode)
            : 'Price not available'}
        </span>
        {hasDiscount && (
          <>
            <span className={styles.comparePrice}>
              {formatPrice(displayCompareAtPrice.amount, displayCompareAtPrice.currencyCode)}
            </span>
            <span className={styles.saleBadge}>
              {discountPercent}% OFF
            </span>
          </>
        )}
      </div>

      <div className={styles.stockRow}>
        {!canPurchase(selectedVariant) ? (
          <span className={styles.stockSoldOut}>Out of Stock</span>
        ) : fieldsToShow.stock !== null && fieldsToShow.stock <= 10 && fieldsToShow.stock > 0 ? (
          <span className={styles.stockLow}>Only {fieldsToShow.stock} left in stock — order soon</span>
        ) : fieldsToShow.stock !== null && fieldsToShow.stock > 10 ? (
          <span className={styles.stockInStock}>In Stock & Ready to Ship</span>
        ) : null}
      </div>

      {/* Options (Size Selector & Color Swatches) */}
      <div className={styles.optionsContainer}>
        {options.map(option => {
          if (option.name === 'Title' && option.values?.[0] === 'Default Title') return null;
          
          const isColor = option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour';
          const selectedVal = selectedOptionsMap[option.name.toLowerCase()];

          return (
            <div key={option.id || option.name} className={styles.optionGroup}>
              <div className={styles.optionHeader}>
                <span className={`${styles.optionLabel} sans`}>{option.name}</span>
                <span className={styles.optionSelectedValue}>{selectedVal}</span>
              </div>

              <div className={isColor ? styles.colorList : styles.variantList}>
                {option.values.map(val => {
                  const isSelected = selectedVal === val;
                  const isAvailable = isOptionValueAvailable(option.name, val);

                  if (isColor) {
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleOptionChange(option.name, val)}
                        className={`${styles.colorSwatch} ${isSelected ? styles.colorSwatchSelected : ''} ${!isAvailable ? styles.swatchDisabled : ''}`}
                        title={`${val}${!isAvailable ? ' (Sold Out)' : ''}`}
                      >
                        <span 
                          className={styles.colorCircle} 
                          style={{ backgroundColor: getColorHex(val) }} 
                        />
                        <span className={styles.colorName}>{val}</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleOptionChange(option.name, val)}
                      className={`${styles.variantSquare} sans ${isSelected ? styles.variantSelected : ''} ${!isAvailable ? styles.variantDisabled : ''}`}
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

      {/* Add to Cart Button & Feedback */}
      {feedback && (
        <p className={`${styles.feedback} ${feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess}`}>
          {feedback.message}
        </p>
      )}

      <div className={styles.actionButtonsRow}>
        <button
          className={`btn-primary ${styles.addToCartBtn}`}
          onClick={handleAddToCart}
          disabled={isUpdating || !canPurchase(selectedVariant)}
        >
          {isUpdating
            ? 'Adding to Bag...'
            : !canPurchase(selectedVariant)
              ? 'Sold Out'
              : 'Add to Bag'}
        </button>

        <button
          type="button"
          className={styles.tryOnBtn}
          onClick={() => setIsTryOnOpen(true)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            Try On
          </span>
        </button>
      </div>

      <TryOnModal
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
        product={product}
        initialVariant={selectedVariant}
      />

      {/* Weight & Shipping Info */}
      <div className={styles.shippingNote}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
          <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/>
          <circle cx="7" cy="18" r="2"/>
          <circle cx="17" cy="18" r="2"/>
        </svg>
        <span>Free complimentary express shipping & 30-day hassle-free returns.</span>
      </div>

      {/* Description (HTML) */}
      <div className={styles.descriptionSection}>
        <h3 className={styles.sectionTitle}>Description</h3>
        {descriptionHtml ? (
          <div 
            className={`${styles.descriptionHtml} sans`} 
            dangerouslySetInnerHTML={{ __html: descriptionHtml }} 
          />
        ) : (
          <p className={`${styles.descriptionText} sans`}>{description}</p>
        )}
      </div>

      {/* Metafields Accordion / Cards */}
      {validMetafields.length > 0 && (
        <div className={styles.metafieldsSection}>
          <h3 className={styles.sectionTitle}>Product Details & Care</h3>
          <div className={styles.metafieldsGrid}>
            {validMetafields.map((mf, i) => {
              const label = mf.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return (
                <div key={mf.key || i} className={styles.metafieldCard}>
                  <span className={styles.metafieldKey}>{label}</span>
                  <p className={styles.metafieldValue}>{mf.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SKU, Barcode, Weight, Collections & Tags Metadata */}
      <div className={styles.extraMetadata}>
        {fieldsToShow.sku && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>SKU:</span>
            <span className={styles.metaVal}>{fieldsToShow.sku}</span>
          </div>
        )}
        {fieldsToShow.barcode && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Barcode:</span>
            <span className={styles.metaVal}>{fieldsToShow.barcode}</span>
          </div>
        )}
        {fieldsToShow.weight && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Weight:</span>
            <span className={styles.metaVal}>{fieldsToShow.weight}</span>
          </div>
        )}
        {fieldsToShow.collections && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Collections:</span>
            <div className={styles.metaLinks}>
              {fieldsToShow.collections.map(col => (
                <Link key={col.id || col.handle} href={`/collections/${col.handle}`} className={styles.collectionLink}>
                  {col.title}
                </Link>
              ))}
            </div>
          </div>
        )}
        {fieldsToShow.tags && (
          <div className={styles.tagsSection}>
            <span className={styles.metaLabel}>Tags:</span>
            <div className={styles.tagsList}>
              {fieldsToShow.tags.map(tag => (
                <span key={tag} className={styles.tagBadge}>#{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
