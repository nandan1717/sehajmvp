'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './ProductDetail.module.css';

function formatPrice(amount, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(parseFloat(amount));
}

export default function ProductDetail({ product }) {
  const { addToCart, isUpdating } = useCart();
  const { title, description, priceRange, variants } = product;

  const variantNodes = variants?.edges?.map(({ node }) => node) || [];
  const defaultVariant =
    variantNodes.find((v) => v.availableForSale) || variantNodes[0] || null;

  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [feedback, setFeedback] = useState(null);

  const displayPrice = selectedVariant?.price || priceRange?.minVariantPrice;

  async function handleAddToCart() {
    if (!selectedVariant) {
      setFeedback({ type: 'error', message: 'Please select a size' });
      return;
    }
    if (!selectedVariant.availableForSale) {
      setFeedback({ type: 'error', message: 'This variant is sold out' });
      return;
    }

    setFeedback(null);
    const result = await addToCart(selectedVariant.id, 1);

    if (result.success) {
      setFeedback({ type: 'success', message: 'Added to cart' });
    } else {
      setFeedback({ type: 'error', message: result.error || 'Could not add to cart' });
    }
  }

  return (
    <div className={styles.infoBento}>
      <h1 className={`${styles.title} serif`}>{title}</h1>
      <p className={`${styles.price} sans`}>
        {displayPrice
          ? formatPrice(displayPrice.amount, displayPrice.currencyCode)
          : 'Price not available'}
      </p>

      <div className={styles.description}>
        <p className="sans">{description}</p>
      </div>

      {variantNodes.length > 0 && (
        <div className={styles.variants}>
          <div className={styles.variantHeader}>
            <span className={`${styles.variantLabel} sans`}>Select Size</span>
          </div>
          <div className={styles.variantList}>
            {variantNodes.map((variant) => (
              <button
                key={variant.id}
                type="button"
                className={`${styles.variantSquare} sans ${
                  selectedVariant?.id === variant.id ? styles.variantSelected : ''
                }`}
                disabled={!variant.availableForSale}
                onClick={() => setSelectedVariant(variant)}
              >
                {variant.title}
              </button>
            ))}
          </div>
        </div>
      )}

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
        className={`btn-primary ${styles.addToCartBtn}`}
        onClick={handleAddToCart}
        disabled={isUpdating || !selectedVariant?.availableForSale}
      >
        {isUpdating
          ? 'Adding...'
          : selectedVariant?.availableForSale === false
            ? 'Sold Out'
            : 'Add to Cart'}
      </button>
    </div>
  );
}
