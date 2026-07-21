import Image from 'next/image';
import { getPexelsVideoById } from '@/lib/pexels';
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
  
  // Fetch specific videos for bento cells
  const [video1, video2, video3] = await Promise.all([
    getPexelsVideoById('19791644'),
    getPexelsVideoById('19791646'),
    getPexelsVideoById('19791640')
  ]);

  const getUrl = (v) => v?.video_files?.find(f => f.quality === 'hd')?.link || v?.video_files?.[0]?.link;

  const url1 = getUrl(video1);
  const url2 = getUrl(video2);
  const url3 = getUrl(video3);

  const VideoCell = ({ src, className }) =>
    src ? <video src={src} autoPlay loop muted playsInline className={className} /> : null;

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
      {/* ── Section 1: Amritsar           ── */}
      {/* ══════════════════════════════════ */}
      <section className={styles.heroBlock} style={{ marginBottom: 0 }}>
        <VideoCell src={url2} className={styles.heroVideo} />
        <div className={styles.storyOverlay} />
        <div className={styles.contentBottomRight}>
          <h2 className={`${styles.storyTitle} ${styles.titleSerif}`}>Heart of Amritsar</h2>
          <p className={`${styles.storyText} ${styles.textSans}`} style={{ maxWidth: '700px', margin: '0' }}>
            Born from the historic streets of Amritsar, our designs carry the legacy of generations. Wearing a traditional Punjabi suit isn't just fashion; it's a profound statement of cultural pride and an unbreakable connection to our roots.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════ */}
      {/* ── Section 2: Quote              ── */}
      {/* ══════════════════════════════════ */}
      <section className={styles.heroBlock} style={{ marginBottom: 0 }}>
        <VideoCell src={url3} className={styles.heroVideo} />
        <div className={styles.storyOverlay} />
        <div className={styles.contentBottomLeft}>
          <h2 className={`${styles.quoteText} ${styles.titleSerif}`} style={{ maxWidth: '900px', margin: '0', textTransform: 'none' }}>
            “It is no longer just ethnic wear. It is modern global fashion, a celebration of who we are and who we're becoming.”
            <span className={`${styles.quoteAuthor} ${styles.textSans}`}>— Mehnazz</span>
          </h2>
        </div>
      </section>
    </div>
  );
}
