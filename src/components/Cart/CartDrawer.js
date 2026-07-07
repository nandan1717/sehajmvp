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
          <h2 className={styles.title}>Your Cart</h2>
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
                          width={80}
                          height={80}
                          className={styles.lineImageImg}
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
                        >
                          Remove
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
            <span>Subtotal</span>
            <span>
              {subtotal
                ? formatPrice(subtotal.amount, subtotal.currencyCode)
                : '$0.00'}
            </span>
          </div>
          <p className={styles.note}>Shipping and taxes calculated at checkout.</p>
          
          <div className={styles.indiaTrustBanner}>
            <div className={styles.trustItem}>
              <div className={styles.trustText}>
                <span className={`${styles.trustTitle} serif`}>UPI & Cash on Delivery</span>
                <p className="sans">Instant GPay, PhonePe, Paytm • 5% OFF Prepaid • COD Nationwide</p>
              </div>
            </div>
            <a 
              href="https://wa.me/919876543210?text=Hi%20Rivaaz,%20I%20need%20help%20with%20sizing%20and%20styling%20my%20order!" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.whatsappLink}
            >
              <span className="sans">Need Sizing or Styling Advice? Chat on WhatsApp</span>
            </a>
          </div>

          {!canCheckout && !isEmpty && (
            <p className={styles.demoNote}>
              Connect Shopify env vars to enable checkout and payments.
            </p>
          )}
          <button
            className="btn-primary"
            disabled={!canCheckout || isUpdating}
            style={{ width: '100%' }}
            onClick={handleCheckout}
          >
            {canCheckout ? 'Proceed to Checkout' : isEmpty ? 'Proceed to Checkout' : 'Checkout Unavailable'}
          </button>
        </div>
      </div>
    </>
  );
}
