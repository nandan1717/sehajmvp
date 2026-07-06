import ProductCard from '@/components/ProductCard/ProductCard';
import { shopifyFetch } from '@/lib/shopify/client';
import { getCollectionQuery } from '@/lib/shopify/queries';
import styles from './page.module.css';

export default async function CollectionPage({ params }) {
  const { handle } = await params;
  const { body } = await shopifyFetch({ query: getCollectionQuery, variables: { handle } });
  const collection = body?.data?.collection;

  if (!collection) {
    return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>Collection not found</div>;
  }

  const { title, description, products } = collection;
  const productEdges = products?.edges || [];

  return (
    <div className={`container ${styles.collectionContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      
      {productEdges.length > 0 ? (
        <div className={styles.productGrid}>
          {productEdges.map(({ node }) => (
            <ProductCard key={node.id} product={node} />
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>No products found in this collection.</p>
      )}
    </div>
  );
}
