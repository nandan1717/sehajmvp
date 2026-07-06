import Image from 'next/image';
import Link from 'next/link';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { handle, title, priceRange, images } = product;
  const price = priceRange?.minVariantPrice?.amount;
  const currencyCode = priceRange?.minVariantPrice?.currencyCode;
  
  const primaryImage = images?.edges[0]?.node;

  return (
    <Link href={`/products/${handle}`} className={`glass-bento ${styles.card}`}>
      <div className={styles.imageContainer}>
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText || title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}></div>
        )}
      </div>
      
      <div className={styles.infoOverlay}>
        <div className={styles.infoGlass}>
          <h3 className={`${styles.title} serif`}>{title}</h3>
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
  );
}
