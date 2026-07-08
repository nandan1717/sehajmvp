'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import styles from './CollectionFilters.module.css';

export default function CollectionFilters({ filters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const createQueryString = useCallback(
    (name, value, add = true) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (add) {
        params.append(name, value);
      } else {
        const values = params.getAll(name);
        params.delete(name);
        values.filter(v => v !== value).forEach(v => params.append(name, v));
      }
      
      return params.toString();
    },
    [searchParams]
  );

  const handlePriceChange = (e, minMax) => {
    e.preventDefault();
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (val) {
      params.set(minMax, val);
    } else {
      params.delete(minMax);
    }
    
    router.push(`?${params.toString()}`);
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
                  const inputJson = JSON.stringify(val.input);
                  const isActive = searchParams.getAll('filter').includes(inputJson);
                  
                  return (
                    <label key={val.id} className={styles.checkboxLabel}>
                      <input 
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => {
                          const queryString = createQueryString('filter', inputJson, e.target.checked);
                          router.push(`?${queryString}`);
                        }}
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
                <div className={styles.priceInput}>
                  <span className={styles.currency}>$</span>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    defaultValue={searchParams.get('minPrice') || ''}
                    onBlur={(e) => handlePriceChange(e, 'minPrice')}
                    className={styles.input}
                  />
                </div>
                <span className={styles.separator}>-</span>
                <div className={styles.priceInput}>
                  <span className={styles.currency}>$</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    defaultValue={searchParams.get('maxPrice') || ''}
                    onBlur={(e) => handlePriceChange(e, 'maxPrice')}
                    className={styles.input}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
