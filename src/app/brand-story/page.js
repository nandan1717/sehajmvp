import Image from 'next/image';
import { getPexelsVideos, getPexelsPhotos } from '@/lib/pexels';
import { shopifyFetch } from '@/lib/shopify/client';
import { getShopQuery } from '@/lib/shopify/queries';
import styles from './page.module.css';

export const metadata = {
  title: 'Our Story | The Modern Punjabi Muse',
  description: 'Rooted in tradition, styled for today. Explore the evolution of modern Punjabi fashion from the heart of Amritsar.',
};

export default async function BrandStoryPage() {
  const { body: shopBody } = await shopifyFetch({ query: getShopQuery });
  const storeName = shopBody?.data?.shop?.name || 'INDIAN WEAR STUDIO';

  // Use local video instead of fetching from Pexels
  const heroVideo = '/media/hero-video.mp4';
  
  const VideoCell = ({ src, className }) =>
    src ? <video src={src} autoPlay loop muted playsInline className={className} /> : null;

  const ImageCell = ({ src, alt, className }) =>
    src ? <Image src={src} alt={alt} fill className={className} /> : null;

  return (
    <div className={styles.brandStoryLayout}>
      
      {/* ══════════════════════════════════ */}
      {/* ── Hero Block                   ── */}
      {/* ══════════════════════════════════ */}
      <section className={styles.heroBlock}>
        <VideoCell src={heroVideo} className={styles.heroVideo} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroStoreName} ${styles.titleSerif}`}>{storeName}</h1>
          <p className={`${styles.heroTagline} ${styles.textSans}`}>Rooted in tradition. Styled for today.</p>
          
          <div className={styles.scrollDownIndicator}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ */}
      {/* ── Bento Grid                   ── */}
      {/* ══════════════════════════════════ */}
      <div className={styles.container}>
        <div className={styles.bentoGrid}>

          {/* Large Media Cell - Vaisakhi */}
          <div className={`${styles.bentoCell} ${styles.mainCell}`}>
            <div className={styles.cellOverlay} />
            <div className={styles.cellContentOverlay}>
              <h2 className={`${styles.cellTitle} ${styles.titleSerif}`}>The Spirit of Vaisakhi</h2>
              <p className={`${styles.cellText} ${styles.textSans}`}>
                Our story is woven in the vibrant fields of Punjab. During Vaisakhi, women wear bright yellow and orange suits, mirroring the mustard fields. The voluminous Patiala salwar allows freedom for the joyous Giddha dance, celebrating the spirit and pride of our heritage.
              </p>
            </div>
          </div>

          {/* Text/Video Cell - Phulkari */}
          <div className={`${styles.bentoCell} ${styles.sideTextCell}`}>
            <div className={styles.cellOverlay} />
            <div className={styles.cellContentOverlay}>
              <h2 className={`${styles.cellTitle} ${styles.titleSerif}`}>Heart of Amritsar & The Phulkari</h2>
              <p className={`${styles.cellText} ${styles.textSans}`}>
                Born from the historic streets of Amritsar, our designs carry the legacy of generations. Wearing a traditional Punjabi suit isn't just fashion; it's a profound statement of cultural pride and an unbreakable connection to our roots. More than a textile, Phulkari—flower work—is an expression of a woman's creativity and patience. 
              </p>
            </div>
          </div>

          {/* Quote Cell - Full Width */}
          <div className={`${styles.bentoCell} ${styles.quoteCell}`}>
            <div className={styles.cellOverlay} />
            <h2 className={`${styles.quoteText} ${styles.titleSerif}`}>
              “It is no longer just ethnic wear. It is modern global fashion, a celebration of who we are and who we're becoming.”
              <span className={`${styles.quoteAuthor} ${styles.textSans}`}>— Mehnazz</span>
            </h2>
          </div>

        </div>
      </div>
    </div>
  );
}
