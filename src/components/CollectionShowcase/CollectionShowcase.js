import Image from 'next/image';
import Link from 'next/link';
import styles from './CollectionShowcase.module.css';

/**
 * Only the core Shopify tags that have built routes (matching SubNavStrip).
 */
const TAG_CATEGORIES = [
  {
    tag: 'new-arrivals',
    href: '/tags/new-arrivals',
    matchTags: ['new-arrivals', 'new arrivals', 'new arrival', 'newarrival'],
    title: 'New Arrivals',
    label: 'Just Dropped',
    titleSize: 'Large',
    maxImages: 4,
  },
  {
    tag: 'trending',
    href: '/tags/trending',
    matchTags: ['trending', 'trending now', 'trend'],
    title: 'Trending Now',
    label: 'Most Loved',
    titleSize: 'Medium',
    maxImages: 3,
  },
  {
    tag: 'bestsellers',
    href: '/tags/bestsellers',
    matchTags: ['bestsellers', 'bestseller', 'best-seller', 'best-sellers'],
    title: 'Bestsellers',
    label: 'Fan Favorites',
    titleSize: 'Medium',
    maxImages: 3,
  },
  {
    tag: 'shop-all',
    href: '/collections/all',
    matchTags: [],  // uses all products as fallback
    title: 'Shop All',
    label: 'Full Collection',
    titleSize: 'Small',
    maxImages: 4,
  },
];

/**
 * Groups products by core Shopify tags and picks images for each category.
 */
function groupProductsByTag(products) {
  const result = TAG_CATEGORIES.map((cat) => {
    const matchingProducts = products.filter(({ node }) => {
      const tags = (node.tags || []).map((t) => t.toLowerCase().trim());
      return cat.matchTags.some((mt) => tags.includes(mt));
    });

    const images = matchingProducts
      .map(({ node }) => {
        const img = node.featuredImage || node.images?.edges?.[0]?.node || node.images?.nodes?.[0];
        return img ? { url: img.url, alt: img.altText || node.title } : null;
      })
      .filter(Boolean)
      .slice(0, cat.maxImages);

    return {
      ...cat,
      images,
      count: matchingProducts.length,
    };
  });

  return result;
}

/**
 * Fallback: if tags don't have enough products, fill categories from the full product list.
 */
function ensureMinimumImages(categories, products) {
  const allImages = products
    .map(({ node }) => {
      const img = node.featuredImage || node.images?.edges?.[0]?.node || node.images?.nodes?.[0];
      return img ? { url: img.url, alt: img.altText || node.title } : null;
    })
    .filter(Boolean);

  let imgIndex = 0;

  return categories.map((cat) => {
    if (cat.images.length === 0 && allImages.length > 0) {
      const fill = [];
      for (let i = 0; i < cat.maxImages && imgIndex < allImages.length; i++) {
        fill.push(allImages[imgIndex % allImages.length]);
        imgIndex++;
      }
      return {
        ...cat,
        images: fill,
        count: cat.count || fill.length,
      };
    }
    return cat;
  });
}

export default function CollectionShowcase({ products = [] }) {
  let categories = groupProductsByTag(products);
  categories = ensureMinimumImages(categories, products);

  // Only show categories that have at least one image
  const visibleCategories = categories.filter((cat) => cat.images.length > 0).slice(0, 4);

  if (visibleCategories.length === 0) return null;

  return (
    <section className={styles.showcaseSection}>
      <div className={styles.bentoGrid}>
        {visibleCategories.map((cat) => (
          <Link
            key={cat.tag}
            href={cat.href}
            className={styles.bentoCell}
          >
            {/* Image Collage Background */}
            {cat.images.length > 0 ? (
              <div
                className={styles.imageCollage}
                data-count={Math.min(cat.images.length, 4)}
              >
                {cat.images.slice(0, 4).map((img, idx) => (
                  <div key={idx} className={styles.collageItem}>
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className={styles.collageImage}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyCollage}>
                <svg className={styles.emptyIcon} viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className={styles.cellOverlay} />

            {/* Product count badge */}
            <span className={styles.cornerAccent}>
              {cat.count}
            </span>

            {/* Content */}
            <div className={styles.cellContent}>
              <span className={styles.tagLabel}>{cat.label}</span>
              <h3
                className={`${styles.tagTitle} ${
                  cat.titleSize === 'Large'
                    ? styles.tagTitleLarge
                    : cat.titleSize === 'Medium'
                    ? styles.tagTitleMedium
                    : styles.tagTitleSmall
                }`}
              >
                {cat.title}
              </h3>
              <div className={styles.cellFooter}>
                <span className={styles.productCount}>
                  {cat.count} {cat.count === 1 ? 'piece' : 'pieces'}
                </span>
                <span className={styles.arrowIcon}>
                  <svg viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
