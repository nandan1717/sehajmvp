import ProductCard from '@/components/ProductCard/ProductCard';
import CollectionFilters from '@/components/CollectionFilters/CollectionFilters';
import { shopifyFetch } from '@/lib/shopify/client';
import { getCollectionWithFiltersQuery } from '@/lib/shopify/queries';
import styles from './page.module.css';

export default async function CollectionPage(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { handle } = params;

  // Build the filters array for Shopify GraphQL
  const graphqlFilters = [];

  // Parse price filters
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : null;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : null;
  
  if (minPrice !== null || maxPrice !== null) {
    const priceFilter = {};
    if (minPrice !== null) priceFilter.min = minPrice;
    if (maxPrice !== null) priceFilter.max = maxPrice;
    graphqlFilters.push({ price: priceFilter });
  }

  // Parse other filters from searchParams
  // We expect "filter" params to be JSON strings of the input object
  const filterParams = searchParams.filter;
  if (filterParams) {
    const filterArray = Array.isArray(filterParams) ? filterParams : [filterParams];
    for (const filterStr of filterArray) {
      try {
        let parsed = JSON.parse(filterStr);
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        graphqlFilters.push(parsed);
      } catch (e) {
        console.error('Failed to parse filter', filterStr);
      }
    }
  }

  const { body } = await shopifyFetch({ 
    query: getCollectionWithFiltersQuery, 
    variables: { 
      handle,
      filters: graphqlFilters
    } 
  });
  
  const collection = body?.data?.collection;

  if (!collection) {
    return <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>Collection not found</div>;
  }

  const { title, description, products } = collection;
  const productEdges = products?.edges || [];
  const availableFilters = products?.filters || [];

  return (
    <div className={`container ${styles.collectionContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      
      <div className={styles.layout}>
        {availableFilters.length > 0 && (
          <aside className={styles.sidebar}>
            <CollectionFilters filters={availableFilters} />
          </aside>
        )}
        
        <main className={styles.mainContent}>
          {productEdges.length > 0 ? (
            <div className={styles.productGrid}>
              {productEdges.map(({ node }) => (
                <ProductCard key={node.id} product={node} />
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No products found matching your filters.</p>
          )}
        </main>
      </div>
    </div>
  );
}
