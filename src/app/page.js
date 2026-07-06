import Link from 'next/link';
import Hero from '@/components/Hero/Hero';
import ProductCard from '@/components/ProductCard/ProductCard';
import { shopifyFetch } from '@/lib/shopify/client';
import { getProductsQuery } from '@/lib/shopify/queries';
import styles from './page.module.css';

export default async function Home() {
  const { body } = await shopifyFetch({ query: getProductsQuery });
  const products = body?.data?.products?.edges || [];

  return (
    <div className={`container ${styles.bentoPageLayout}`}>
      <Hero products={products} />

      <section className={`glass-bento ${styles.collectionBento}`}>
        <div className={styles.sectionHeader}>
          <h2 className={`${styles.sectionTitle} serif`}>Curated Edit</h2>
          <Link href="/collections/all" className={styles.viewAll}>View All</Link>
        </div>

        <div className={styles.productGrid}>
          {products.map(({ node }) => (
            <ProductCard key={node.id} product={node} />
          ))}
        </div>
      </section>
    </div>
  );
}
