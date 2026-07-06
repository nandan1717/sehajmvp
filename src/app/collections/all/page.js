import ProductCard from '@/components/ProductCard/ProductCard';
import { shopifyFetch } from '@/lib/shopify/client';
import { getProductsQuery } from '@/lib/shopify/queries';
import styles from '../[handle]/page.module.css';

export const metadata = {
  title: 'All Products | Rivaaz',
  description: 'Browse our complete collection of Indian suits and shawls.',
};

export default async function AllProductsPage() {
  const { body } = await shopifyFetch({ query: getProductsQuery });
  const products = body?.data?.products?.edges || [];

  return (
    <div className={`container ${styles.collectionContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Products</h1>
        <p className={styles.description}>
          Browse our complete collection of bespoke Indian wear.
        </p>
      </div>

      {products.length > 0 ? (
        <div className={styles.productGrid}>
          {products.map(({ node }) => (
            <ProductCard key={node.id} product={node} />
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>No products found.</p>
      )}
    </div>
  );
}
