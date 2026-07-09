'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './CartDrawer.module.css';

function formatPrice(amount, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  isUpdating,
  onUpdateLine,
  onRemoveLine,
}) {
  if (!isOpen) return null;

  const lines = cart?.lines?.edges || [];
  const isEmpty = lines.length === 0;
  const subtotal = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;
  const canCheckout = Boolean(checkoutUrl) && !isEmpty;

  async function handleCheckout() {
    if (canCheckout) {
      try {
        const { getAuthenticatedCheckoutUrl } = await import('@/lib/shopify/customer-account-oauth');
        const authCheckoutUrl = await getAuthenticatedCheckoutUrl(checkoutUrl);
        window.location.href = authCheckoutUrl;
      } catch (err) {
        console.error('Error connecting auth to checkout:', err);
        window.location.href = checkoutUrl;
      }
    }
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.drawer} glass-panel animate-fade-in`}>
        <div className={styles.header}>
          <h2 className={`${styles.title} serif`}>Your Cart</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {isEmpty ? (
            <div className={styles.emptyState}>
              <p>Your cart is currently empty.</p>
              <button className="btn-outline" onClick={onClose} style={{ marginTop: '24px' }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className={styles.lineList}>
              {lines.map(({ node: line }) => {
                const { merchandise } = line;
                const image = merchandise?.image;

                return (
                  <li key={line.id} className={styles.lineItem}>
                    <Link
                      href={`/products/${merchandise.product.handle}`}
                      className={styles.lineImage}
                      onClick={onClose}
                    >
                      {image?.url ? (
                        <Image
                          src={image.url}
                          alt={image.altText || merchandise.product.title}
                          width={90}
                          height={120}
                          className={styles.lineImageImg}
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <div className={styles.lineImagePlaceholder} />
                      )}
                    </Link>

                    <div className={styles.lineDetails}>
                      <Link
                        href={`/products/${merchandise.product.handle}`}
                        className={styles.lineTitle}
                        onClick={onClose}
                      >
                        {merchandise.product.title}
                      </Link>
                      {merchandise.title !== 'Default Title' && (
                        <p className={styles.lineVariant}>{merchandise.title}</p>
                      )}
                      <p className={styles.linePrice}>
                        {formatPrice(
                          line.cost.totalAmount.amount,
                          line.cost.totalAmount.currencyCode
                        )}
                      </p>

                      <div className={styles.lineActions}>
                        <div className={styles.quantityControl}>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            disabled={isUpdating}
                            onClick={() => onUpdateLine(line.id, line.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className={styles.qtyValue}>{line.quantity}</span>
                          <button
                            type="button"
                            className={styles.qtyBtn}
                            disabled={isUpdating}
                            onClick={() => onUpdateLine(line.id, line.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          disabled={isUpdating}
                          onClick={() => onRemoveLine(line.id)}
                          title="Remove item"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.subtotal}>
            <span className="serif">Subtotal</span>
            <span className="serif">
              {subtotal
                ? formatPrice(subtotal.amount, subtotal.currencyCode)
                : '$0.00'}
            </span>
          </div>
          <p className={`${styles.note} sans`}>Shipping and taxes calculated at checkout.</p>
          
          <a 
            href="https://wa.me/919876543210?text=Hi%20Rivaaz,%20I%20need%20help%20with%20sizing%20and%20styling%20my%20order!" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.whatsappTextLink}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <span className="sans">Need Sizing or Styling Advice? Chat on WhatsApp</span>
          </a>

          {!canCheckout && !isEmpty && (
            <p className={`${styles.demoNote} sans`}>
              Connect Shopify env vars to enable checkout and payments.
            </p>
          )}
          <button
            className={styles.proceedCheckoutBtn}
            disabled={!canCheckout || isUpdating}
            onClick={handleCheckout}
          >
            <span className="sans">{canCheckout ? 'Proceed to Checkout' : isEmpty ? 'Proceed to Checkout' : 'Checkout Unavailable'}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
