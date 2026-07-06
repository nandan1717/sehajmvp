import Image from 'next/image';
import { shopifyFetch } from '@/lib/shopify/client';
import { getProductQuery } from '@/lib/shopify/queries';
import ProductDetail from '@/components/Product/ProductDetail';
import styles from './page.module.css';

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const { body } = await shopifyFetch({ query: getProductQuery, variables: { handle } });
  const product = body?.data?.product;

  if (!product) {
    return { title: 'Product Not Found | Rivaaz' };
  }

  return {
    title: `${product.title} | Rivaaz`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { handle } = await params;
  const { body } = await shopifyFetch({ query: getProductQuery, variables: { handle } });
  const product = body?.data?.product;

  if (!product) {
    return (
      <div className="container" style={{ padding: '160px 24px', textAlign: 'center' }}>
        Product not found
      </div>
    );
  }

  const { title, images } = product;
  const allImages = images?.edges || [];
  const primaryImage = allImages[0]?.node;
  const secondaryImages = allImages.slice(1);

  return (
    <div className={`container ${styles.pdpBentoLayout}`}>
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

      <div className={`glass-bento ${styles.infoBentoWrapper}`}>
        <ProductDetail product={product} />
      </div>

      {secondaryImages.map(({ node }, i) => (
        <div key={node.url || i} className={`glass-bento ${styles.secondaryImageBento}`}>
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
