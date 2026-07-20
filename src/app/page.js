import Link from 'next/link';
import Hero from '@/components/Hero/Hero';
import CollectionShowcase from '@/components/CollectionShowcase/CollectionShowcase';
import ProductCard from '@/components/ProductCard/ProductCard';
import SubNavStrip from '@/components/SubNavStrip/SubNavStrip';
import HeritageBlock from '@/components/HeritageBlock/HeritageBlock';
import { shopifyFetch } from '@/lib/shopify/client';
import { getProductsQuery, getShopQuery } from '@/lib/shopify/queries';
import { getPexelsPhotos, getPexelsVideos } from '@/lib/pexels';
import styles from './page.module.css';

export default async function Home() {
  const { body } = await shopifyFetch({ query: getProductsQuery });
  const products = body?.data?.products?.edges || [];

  const { body: shopBody } = await shopifyFetch({ query: getShopQuery });
  const storeName = shopBody?.data?.shop?.name || 'INDIAN WEAR STUDIO';

  // Use local media for the Heritage Block (Our Story)
  const heritageVideoUrl = '/media/hero-video.mp4';
  const fallbackImageUrl = '/media/hero-image.jpg';

  return (
    <div className={`container ${styles.bentoPageLayout}`}>
      <Hero products={products} />

      {/* Dynamic continuous forward-moving subtext strip */}
      <SubNavStrip products={products} />

      {/* Bento grid collection showcase by core Shopify tags */}
      <CollectionShowcase products={products} />

      {/* Our Story section */}
      <HeritageBlock videoUrl={heritageVideoUrl} fallbackImageUrl={fallbackImageUrl} storeName={storeName} />

      <section className={`glass-bento ${styles.collectionBento}`}>
        <div className={styles.sectionHeader}>
          <h2 className={`${styles.sectionTitle} serif`}>The Royal Edit</h2>
          <Link href="/collections/all" className={styles.viewAll}>Explore All &rarr;</Link>
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
