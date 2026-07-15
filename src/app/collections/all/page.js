import ProductCard from '@/components/ProductCard/ProductCard';
import { shopifyFetch, getShopName } from '@/lib/shopify/client';
import { getProductsQuery } from '@/lib/shopify/queries';
import styles from '../[handle]/page.module.css';

export async function generateMetadata() {
  const shopName = await getShopName();
  return {
    title: `The Royal Wardrobe | ${shopName}`,
    description: 'Bespoke Indian silhouettes crafted for the woman who commands every room.',
  };
}

export default async function AllProductsPage() {
  const { body } = await shopifyFetch({ query: getProductsQuery });
  const products = body?.data?.products?.edges || [];

  return (
    <div className={`container ${styles.collectionContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>The Royal Wardrobe</h1>
        <p className={styles.description}>
          Exquisite bespoke silhouettes curated for the woman who commands every room she enters.
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
