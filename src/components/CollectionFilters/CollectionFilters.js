'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import styles from './CollectionFilters.module.css';

export default function CollectionFilters({ filters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Local draft state
  const [draftTags, setDraftTags] = useState([]);
  const [draftMin, setDraftMin] = useState(0);
  const [draftMax, setDraftMax] = useState(10000);

  // Initialize draft state from URL when component mounts or URL changes
  useEffect(() => {
    const activeFilters = searchParams.getAll('filter');
    setDraftTags(activeFilters);
    
    const minP = searchParams.get('minPrice');
    const maxP = searchParams.get('maxPrice');
    setDraftMin(minP ? parseInt(minP) : 0);
    setDraftMax(maxP ? parseInt(maxP) : 10000);
  }, [searchParams]);

  const handleTagToggle = (inputJson) => {
    setDraftTags(prev => {
      if (prev.includes(inputJson)) {
        return prev.filter(t => t !== inputJson);
      } else {
        return [...prev, inputJson];
      }
    });
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    
    draftTags.forEach(tag => params.append('filter', tag));
    
    if (draftMin > 0) params.set('minPrice', draftMin);
    if (draftMax < 10000) params.set('maxPrice', draftMax);

    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const activeCount = Array.from(searchParams.keys()).length;

  return (
    <div className={styles.filtersWrapper}>
      <div className={styles.mobileHeader}>
        <button className={styles.toggleButton} onClick={() => setIsOpen(!isOpen)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
      </div>

      <div className={`${styles.filtersContainer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Filters</h2>
          {activeCount > 0 && (
            <button className={styles.clearAll} onClick={() => router.push('?')}>
              Clear All
            </button>
          )}
        </div>

        {filters.map((filter) => (
          <div key={filter.id} className={styles.filterGroup}>
            <h3 className={styles.filterLabel}>{filter.label}</h3>

            {filter.type === 'LIST' && (
              <div className={styles.filterList}>
                {filter.values.map((val) => {
                  const inputJson = typeof val.input === 'string' ? val.input : JSON.stringify(val.input);
                  const isChecked = draftTags.includes(inputJson);

                  return (
                    <label key={val.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTagToggle(inputJson)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>{val.label} ({val.count})</span>
                    </label>
                  );
                })}
              </div>
            )}

            {filter.type === 'PRICE_RANGE' && (
              <div className={styles.priceRange}>
                <div className={styles.priceDisplays}>
                  <span className={styles.priceValue}>CA${draftMin}</span>
                  <span className={styles.priceValue}>CA${draftMax}</span>
                </div>
                
                <div className={styles.sliderContainer}>
                  <div 
                    className={styles.sliderTrack} 
                    style={{
                      left: `${(draftMin / 10000) * 100}%`,
                      right: `${100 - (draftMax / 10000) * 100}%`
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={draftMin}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), draftMax - 100);
                      setDraftMin(val);
                    }}
                    onMouseUp={handleApply}
                    onTouchEnd={handleApply}
                    className={styles.rangeInput}
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={draftMax}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), draftMin + 100);
                      setDraftMax(val);
                    }}
                    onMouseUp={handleApply}
                    onTouchEnd={handleApply}
                    className={styles.rangeInput}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className={styles.applyContainer}>
          <button className={styles.applyButton} onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
