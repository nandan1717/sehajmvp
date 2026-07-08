'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './SearchModal.module.css';

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], collections: [] });
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], collections: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timerId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.results);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timerId);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.searchModal} ref={searchRef}>
        <div className={styles.header}>
          <div className={styles.inputWrapper}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search products, collections..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  onClose();
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }
              }}
              className={styles.input}
              autoFocus
            />
            {query && (
              <button className={styles.clearButton} onClick={() => setQuery('')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close search">
            Cancel
          </button>
        </div>

        <div className={styles.resultsContainer}>
          {loading ? (
            <div className={styles.loading}>Searching...</div>
          ) : query && results.products.length === 0 && results.collections.length === 0 ? (
            <div className={styles.noResults}>No results found for "{query}"</div>
          ) : (
            <>
              {results.collections.length > 0 && (
                <div className={styles.resultGroup}>
                  <h3 className={styles.groupTitle}>Collections</h3>
                  <div className={styles.collectionList}>
                    {results.collections.map(collection => (
                      <Link 
                        key={collection.id} 
                        href={`/collections/${collection.handle}`}
                        className={styles.collectionItem}
                        onClick={onClose}
                      >
                        {collection.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length > 0 && (
                <div className={styles.resultGroup}>
                  <h3 className={styles.groupTitle}>Products</h3>
                  <div className={styles.productList}>
                    {results.products.map(product => (
                      <Link 
                        key={product.id} 
                        href={`/products/${product.handle}`}
                        className={styles.productItem}
                        onClick={onClose}
                      >
                        <div className={styles.productImageWrapper}>
                          {product.featuredImage ? (
                            <Image 
                              src={product.featuredImage.url} 
                              alt={product.title} 
                              fill 
                              className={styles.productImage} 
                            />
                          ) : (
                            <div className={styles.productImagePlaceholder} />
                          )}
                        </div>
                        <div className={styles.productInfo}>
                          <p className={styles.productTitle}>{product.title}</p>
                          <p className={styles.productPrice}>
                            {product.priceRange.minVariantPrice.currencyCode} ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <Link 
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={onClose}
                  style={{ color: '#d4af37', textDecoration: 'underline', fontWeight: '500' }}
                >
                  View all results and filters for "{query}"
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
