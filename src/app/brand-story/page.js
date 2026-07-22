import Image from 'next/image';
import { getPexelsVideoById, getPexelsPhotoById } from '@/lib/pexels';
import { shopifyFetch } from '@/lib/shopify/client';
import { getShopQuery } from '@/lib/shopify/queries';
import styles from './page.module.css';
import BrandStoryHero from './BrandStoryHero';

const VideoCell = ({ src, className }) =>
  src ? <video src={src} autoPlay loop muted playsInline className={className} /> : null;

export const metadata = {
  title: 'Our Story | The Modern Punjabi Muse',
  description: 'Rooted in tradition, styled for today. Explore the evolution of modern Punjabi fashion from the heart of Amritsar.',
};

export default async function BrandStoryPage() {
  const { body: shopBody } = await shopifyFetch({ query: getShopQuery });
  const storeName = shopBody?.data?.shop?.name || 'INDIAN WEAR STUDIO';

  // Fetch specific photos for the hero slider
  const [photo1, photo2, photo3, photo4] = await Promise.all([
    getPexelsPhotoById('20420598'),
    getPexelsPhotoById('19556887'),
    getPexelsPhotoById('20420553'),
    getPexelsPhotoById('36325840')
  ]);

  const heroImages = [photo1, photo2, photo3, photo4]
    .filter(Boolean)
    .map(photo => photo?.src?.original || photo?.src?.large2x);

  // Fetch specific videos for sections
  const [video2, video3] = await Promise.all([
    getPexelsVideoById('26617157'), // Heart of Amritsar
    getPexelsVideoById('19791640')  // Quote section
  ]);

  const getUrl = (v) => v?.video_files?.find(f => f.quality === 'hd')?.link || v?.video_files?.[0]?.link;

  const url2 = getUrl(video2);
  const url3 = getUrl(video3);

  return (
    <div className={styles.brandStoryLayout}>

      {/* ══════════════════════════════════ */}
      {/* ── Hero Block                   ── */}
      {/* ══════════════════════════════════ */}
      <BrandStoryHero images={heroImages} storeName={storeName} />

      {/* ══════════════════════════════════ */}
      {/* ── Section 1: Amritsar           ── */}
      {/* ══════════════════════════════════ */}
      <section className={styles.heroBlock}>
        <VideoCell src={url2} className={styles.heroVideo} />
        <div className={styles.storyOverlay} />
        <div className={styles.contentBottomRight}>
          <h2 className={`${styles.storyTitle} ${styles.titleSerif}`}>Heart of Amritsar</h2>
          <p className={`${styles.storyText} ${styles.textSans}`} style={{ maxWidth: '700px', margin: '0' }}>
            Born from the historic streets of Amritsar, our designs carry the legacy of generations. Wearing a traditional Punjabi suit isn&apos;t just fashion; it&apos;s a profound statement of cultural pride and an unbreakable connection to our roots.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════ */}
      {/* ── Section 2: Quote              ── */}
      {/* ══════════════════════════════════ */}
      <section className={styles.heroBlock}>
        <VideoCell src={url3} className={styles.heroVideo} />
        <div className={styles.quoteOverlay} />
        <div className={styles.contentBottomLeft}>
          <h2 className={`${styles.quoteText} ${styles.titleSerif}`} style={{ maxWidth: '900px', margin: '0', textTransform: 'none' }}>
            “It is no longer just ethnic wear. It is modern global fashion, a celebration of who we are and who we&apos;re becoming.”
            <span className={`${styles.quoteAuthor} ${styles.textSans}`}>— Mehnazz</span>
          </h2>
        </div>
      </section>
    </div>
  );
}
