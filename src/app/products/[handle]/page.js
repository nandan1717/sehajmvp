import Image from 'next/image';
import { shopifyFetch } from '@/lib/shopify/client';
import { getProductQuery } from '@/lib/shopify/queries';
import styles from './page.module.css';

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const { body } = await shopifyFetch({ query: getProductQuery, variables: { handle } });
  const product = body?.data?.product;

  if (!product) {
    return <div className="container" style={{ padding: '160px 24px', textAlign: 'center' }}>Product not found</div>;
  }

  const { title, description, priceRange, images, variants } = product;
  const allImages = images?.edges || [];
  const primaryImage = allImages[0]?.node;
  const secondaryImages = allImages.slice(1);
  const price = priceRange?.minVariantPrice;

  return (
    <div className={`container ${styles.pdpBentoLayout}`}>
      {/* Primary Image Bento Box */}
      <div className={`glass-bento ${styles.primaryImageBento}`}>
        {primaryImage ? (
          <Image 
            src={primaryImage.url} 
            alt={primaryImage.altText || title} 
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className={styles.image}
            priority
          />
        ) : (
          <div className={styles.placeholderImage}>No Image</div>
        )}
      </div>

      {/* Info Bento Box */}
      <div className={`glass-bento ${styles.infoBento}`}>
        <h1 className={`${styles.title} serif`}>{title}</h1>
        <p className={`${styles.price} sans`}>
          {price 
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currencyCode || 'USD', minimumFractionDigits: 0 }).format(price.amount) 
            : 'Price not available'
          }
        </p>
        
        <div className={styles.description}>
          <p className="sans">{description}</p>
        </div>

        {variants?.edges?.length > 0 && (
          <div className={styles.variants}>
            <div className={styles.variantHeader}>
              <span className={`${styles.variantLabel} sans`}>Select Size</span>
              <button className={`${styles.sizeGuideBtn} sans`}>Size Guide</button>
            </div>
            <div className={styles.variantList}>
              {variants.edges.map(({ node }) => (
                <button key={node.id} className={`${styles.variantSquare} sans`} disabled={!node.availableForSale}>
                  {node.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className={`btn-primary ${styles.addToCartBtn}`}>Add to Cart</button>
      </div>

      {/* Secondary Images Bento Boxes */}
      {secondaryImages.map(({ node }, i) => (
        <div key={node.id || i} className={`glass-bento ${styles.secondaryImageBento}`}>
          <Image 
            src={node.url} 
            alt={node.altText || `${title} detail view`} 
            fill
            sizes="(max-width: 900px) 50vw, 25vw"
            className={styles.image}
          />
        </div>
      ))}
    </div>
  );
}
