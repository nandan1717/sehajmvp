'use client';

import { useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './SubNavStrip.module.css';

const DEFAULT_LINKS = [
  { label: 'Shop All', href: '/collections/all' },
  { label: 'New Arrivals', href: '/tags/new-arrivals' },
  { label: 'Bestsellers', href: '/tags/bestsellers' },
  { label: 'Trending Now', href: '/tags/trending' },
];

export default function SubNavStrip({ products = [] }) {
  const scrollRef = useRef(null);

  const allLinks = useMemo(() => {
    const dynamicTags = [];
    const seenTags = new Set([
      'shop', 'shop all', 'new-arrivals', 'new arrivals', 'bestsellers', 'bestseller',
      'trending', 'trending now', 'all'
    ]);

    (products || []).forEach(({ node }) => {
      if (node?.tags && Array.isArray(node.tags)) {
        node.tags.forEach((tagString) => {
          if (!tagString || typeof tagString !== 'string') return;
          const normalized = tagString.trim().toLowerCase();
          if (normalized && !seenTags.has(normalized)) {
            seenTags.add(normalized);
            const label = normalized
              .split(/[\s-]+/)
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            dynamicTags.push({
              label,
              href: `/tags/${encodeURIComponent(normalized)}`,
            });
          }
        });
      }
    });

    return [...DEFAULT_LINKS, ...dynamicTags];
  }, [products]);

  useEffect(() => {
    // Start right in the middle cycles so scrolling smoothly in either direction never hits an edge
    if (scrollRef.current) {
      const halfWidth = scrollRef.current.scrollWidth / 2;
      if (halfWidth > 0 && scrollRef.current.scrollLeft === 0) {
        scrollRef.current.scrollLeft = halfWidth / 2;
      }
    }
  }, [allLinks]);

  const handleScrollLeft = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });

    setTimeout(() => {
      if (!scrollRef.current) return;
      const halfWidth = scrollRef.current.scrollWidth / 2;
      if (scrollRef.current.scrollLeft <= 120 && halfWidth > 0) {
        scrollRef.current.scrollLeft += halfWidth;
      }
    }, 420);
  };

  const handleScrollRight = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });

    setTimeout(() => {
      if (!scrollRef.current) return;
      const halfWidth = scrollRef.current.scrollWidth / 2;
      if (scrollRef.current.scrollLeft >= halfWidth && halfWidth > 0) {
        scrollRef.current.scrollLeft -= halfWidth;
      }
    }, 420);
  };

  return (
    <section className={styles.container} aria-label="Collection & Tag Navigation">
      <button
        type="button"
        onClick={handleScrollLeft}
        className={`${styles.arrowBtn} ${styles.leftArrow}`}
        aria-label="Scroll left"
        title="Previous"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div ref={scrollRef} className={styles.scrollTrack}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((cycle) => (
          <div key={cycle} className={styles.linkGroup}>
            {allLinks.map((link, idx) => (
              <Link key={idx} href={link.href} className={styles.navItem}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleScrollRight}
        className={`${styles.arrowBtn} ${styles.rightArrow}`}
        aria-label="Scroll right"
        title="Next"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </section>
  );
}
