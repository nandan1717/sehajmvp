'use client';

import styles from './LookbookGrid.module.css';

export default function LookbookGrid({ posts = [], isMock = false }) {
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

  return (
    <div className={styles.container}>
      {isMock && (
        <div className={styles.mockNotice}>
          Displaying mock data. To view live Instagram posts and stories, add your <code>INSTAGRAM_ACCESS_TOKEN</code> to <code>.env.local</code>.
        </div>
      )}
      <div className={styles.grid}>
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.gridItem}
          >
            {post.media_type === 'VIDEO' && post.media_url ? (
              <video
                src={post.media_url}
                autoPlay
                loop
                muted
                playsInline
                className={styles.image}
              />
            ) : (
              <img
                src={post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url}
                alt={post.caption || 'Instagram Post'}
                loading="lazy"
                className={styles.image}
              />
            )}
            
            <div className={styles.content}>
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
