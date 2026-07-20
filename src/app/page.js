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

  // Fetch a stunning ethnic wear video for the Heritage Block (matching the Brand Story page hero video)
  const pexelsVideos = await getPexelsVideos('phulkari embroidery punjabi suit women', 1);
  const heritageVideoUrl = pexelsVideos[0]?.video_files?.find(v => v.quality === 'hd')?.link || null;
  const pexelsPhotos = await getPexelsPhotos('phulkari embroidery punjabi suit women', 1);
  const fallbackImageUrl = pexelsPhotos[0]?.src?.large2x || null;

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
