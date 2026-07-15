import ProductCard from '@/components/ProductCard/ProductCard';
import CollectionFilters from '@/components/CollectionFilters/CollectionFilters';
import { shopifyFetch, getShopName } from '@/lib/shopify/client';
import { getSearchWithFiltersQuery } from '@/lib/shopify/queries';
import styles from '@/app/collections/[handle]/page.module.css';
import Link from 'next/link';

export async function generateMetadata({ searchParams }) {
  const query = (await searchParams).q || '';
  const shopName = await getShopName();
  return {
    title: `Search results for "${query}" | ${shopName}`,
  };
}

export default async function SearchPage(props) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';

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

  // Fetch search results
  let searchResults = null;
  if (query || allFilters.length > 0 || tags.length > 0) {
    // Add wildcard for partial matching to match predictiveSearch behavior
    let shopifyQuery = query ? (query.trim().includes('*') ? query.trim() : `${query.trim()}*`) : '';
    
    // Group tags with OR logic inside the query string
    if (tags.length > 0) {
      const tagQuery = tags.map(t => `tag:${t}`).join(' OR ');
      shopifyQuery = shopifyQuery ? `(${shopifyQuery}) AND (${tagQuery})` : `(${tagQuery})`;
    }

    const { body } = await shopifyFetch({ 
      query: getSearchWithFiltersQuery, 
      variables: { 
        query: shopifyQuery || '*',
        filters: allFilters
      } 
    });
    searchResults = body?.data?.search;
  }

  const productEdges = searchResults?.edges || [];
  const availableFilters = searchResults?.productFilters || [];

  return (
    <div className={`container ${styles.collectionContainer}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>
        {query && <p className={styles.description}>{productEdges.length} results found</p>}
      </div>
      
      {!query && allFilters.length === 0 && tags.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p>Please enter a search term or select a filter.</p>
        </div>
      ) : (
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
                <Link href={`/search?q=${encodeURIComponent(query)}`} style={{ color: '#d4af37', textDecoration: 'underline', marginTop: '16px', display: 'inline-block' }}>
                  Clear all filters
                </Link>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
