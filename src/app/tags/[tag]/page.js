import ProductCard from '@/components/ProductCard/ProductCard';
import { shopifyFetch } from '@/lib/shopify/client';
import { getProductsByTagQuery } from '@/lib/shopify/queries';
import styles from '@/app/collections/[handle]/page.module.css';

// Helper function to format tag to title
function formatTitle(tag) {
  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  return {
    title: `${formatTitle(tag)} | Rivaaz`,
  };
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  
  // Format the tag for Shopify query
  // Shopify tag queries look like: tag:"new-arrival" OR tag:"new-arrivals"
  // For safety, we can query just the exact tag.
  const shopifyQuery = `tag:"${tag}" OR tag:"#${tag}"`;

  const { body } = await shopifyFetch({ 
    query: getProductsByTagQuery, 
    variables: { 
      query: shopifyQuery
    } 
  });
  
  const products = body?.data?.products;
  const productEdges = products?.edges || [];
  
  const title = formatTitle(tag);

  return (
    <div className={`container ${styles.collectionContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
      </div>
      
      <div className={styles.layout}>
        <main className={styles.mainContent} style={{ width: '100%' }}>
          {productEdges.length > 0 ? (
            <div className={styles.productGrid}>
              {productEdges.map(({ node }) => (
                <ProductCard key={node.id} product={node} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>We couldn't find any products matching "{title}".</p>
              <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>
                Products will appear here automatically once you tag them with <strong>{tag}</strong> or <strong>#{tag}</strong> in your Shopify admin.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
