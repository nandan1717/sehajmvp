import ProductCard from '@/components/ProductCard/ProductCard';
import CollectionFilters from '@/components/CollectionFilters/CollectionFilters';
import { shopifyFetch, getShopName } from '@/lib/shopify/client';
import { getSearchWithFiltersQuery } from '@/lib/shopify/queries';
import styles from '../[handle]/page.module.css';
import Link from 'next/link';

export async function generateMetadata() {
  const shopName = await getShopName();
  return {
    title: `The Royal Wardrobe | ${shopName}`,
    description: 'Bespoke Indian silhouettes crafted for the woman who commands every room.',
  };
}

export default async function AllProductsPage(props) {
  const searchParams = await props.searchParams;

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

  const tags = [];
  const otherFilters = [];

  // Parse other filters from searchParams
  const filterParams = searchParams.filter;
  if (filterParams) {
    const filterArray = Array.isArray(filterParams) ? filterParams : [filterParams];
    for (const filterStr of filterArray) {
      try {
        let parsed = JSON.parse(filterStr);
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        if (parsed.tag) {
          tags.push(parsed.tag);
        } else {
          otherFilters.push(parsed);
        }
      } catch (e) {
        console.error('Failed to parse filter', filterStr);
      }
    }
  }

  const allFilters = [...graphqlFilters, ...otherFilters];

  // Fetch search results using empty wildcard to get all products and their filters
  let shopifyQuery = '*';
  
  if (tags.length > 0) {
    const tagQuery = tags.map(t => `tag:${t}`).join(' OR ');
    shopifyQuery = `(${shopifyQuery}) AND (${tagQuery})`;
  }

  const { body } = await shopifyFetch({ 
    query: getSearchWithFiltersQuery, 
    variables: { 
      query: shopifyQuery,
      filters: allFilters
    } 
  });
  
  const searchResults = body?.data?.search;
  const productEdges = searchResults?.edges || [];
  const availableFilters = searchResults?.productFilters || [];

  return (
    <div className={`container ${styles.collectionContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>The Royal Wardrobe</h1>
        <p className={styles.description}>
          Exquisite bespoke silhouettes curated for the woman who commands every room she enters.
        </p>
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
            <div className={styles.emptyState}>
              <p>No products found matching your filters.</p>
              <Link href="/collections/all" style={{ color: '#d4af37', textDecoration: 'underline', marginTop: '16px', display: 'inline-block' }}>
                Clear all filters
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
