'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './LookbookGrid.module.css';

export default function LookbookGrid({ posts = [], isMock = false }) {
  const [spans, setSpans] = useState({});

  if (!posts || posts.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.subtitle}>No posts available at the moment.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleMediaLoad = (id, width, height) => {
    const ratio = width / height;
    let spanClass = styles.span1; // Square-ish default (1:1 container)

    // With perfectly square grid cells, span2 is exactly 2:1 and spanRow2 is exactly 1:2.
    // We adjust thresholds to prevent aggressive cropping.
    if (ratio > 1.45) {
      spanClass = styles.span2; // Landscape (Wide) - best for 16:9 or 3:2
    } else if (ratio < 0.65) {
      spanClass = styles.spanRow2; // Portrait (Tall) - best for 9:16 Reels/TikToks
    }

    setSpans((prev) => {
      // Avoid unnecessary state updates
      if (prev[id] === spanClass) return prev;
      return { ...prev, [id]: spanClass };
    });
  };

  const getSpanClass = (post, index) => {
    if (spans[post.id]) return spans[post.id];
    
    // Initial guess based on index to prevent complete layout jump if possible
    const pattern = index % 6;
    if (pattern === 0 || pattern === 4) return styles.spanRow2;
    if (pattern === 3) return styles.span2x2;
    return styles.span1;
  };

  return (
    <div className={styles.container}>
      {isMock && (
        <div className={styles.mockNotice}>
          Displaying mock data. To view live Instagram posts and stories, add your <code>INSTAGRAM_ACCESS_TOKEN</code> to <code>.env.local</code>.
        </div>
      )}

      <div className={styles.grid}>
        {posts.map((post, index) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.gridItem} ${getSpanClass(post, index)}`}
          >
            {post.media_type === 'VIDEO' && post.media_url ? (
              <video
                src={post.media_url}
                autoPlay
                loop
                muted
                playsInline
                className={styles.image}
                onLoadedMetadata={(e) => handleMediaLoad(post.id, e.target.videoWidth, e.target.videoHeight)}
              />
            ) : (
              <Image
                src={post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url}
                alt={post.caption || 'Instagram Post'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.image}
                onLoad={(e) => handleMediaLoad(post.id, e.target.naturalWidth, e.target.naturalHeight)}
              />
            )}
            
            <div className={styles.overlay}>
              {post.caption && (
                <p className={styles.caption}>{post.caption}</p>
              )}
              {post.timestamp && (
                <span className={styles.date}>{formatDate(post.timestamp)}</span>
              )}
            </div>

            <div className={styles.icon}>
              {post.media_type === 'VIDEO' ? (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <polygon points="5 3 19 12 5 21 5 3"></polygon>
                 </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
