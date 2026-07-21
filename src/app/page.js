import Link from 'next/link';
import Hero from '@/components/Hero/Hero';
import CollectionShowcase from '@/components/CollectionShowcase/CollectionShowcase';
import ProductCard from '@/components/ProductCard/ProductCard';
import SubNavStrip from '@/components/SubNavStrip/SubNavStrip';
import HeritageBlock from '@/components/HeritageBlock/HeritageBlock';
import LookbookBlock from '@/components/LookbookBlock/LookbookBlock';
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

  const pexelsData = await getPexelsPhotos('punjabi suit models females muneeb malhotra', 15, 'landscape');
  let lookbookImages = pexelsData.map(photo => photo?.src?.original || photo?.src?.large2x).filter(Boolean);
  
  if (lookbookImages.length === 0) {
    // Fallback to product images if Pexels API fails or returns no results
    lookbookImages = products
      .flatMap(({ node }) => node.images?.edges?.map((e) => e.node?.url) || [])
      .filter(Boolean);
  }

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
            <div key={node.id} className={styles.gridItem}>
              <ProductCard product={node} />
            </div>
          ))}
        </div>
        
        <div className={styles.exploreMoreContainer}>
          <Link href="/collections/all" className={styles.viewAll}>
            Explore All &rarr;
          </Link>
        </div>
      </section>

      {/* Lookbook section */}
      <LookbookBlock images={lookbookImages} fallbackImageUrl="/media/hero-image.jpg" />
    </div>
  );
}
