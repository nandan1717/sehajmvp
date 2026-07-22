'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function SizingGuidePage() {
  const inchesData = [
    { size: 'XS', bust: '32', waist: '26', hip: '34', uk: '6', us: '2', eu: '34' },
    { size: 'S', bust: '34', waist: '28', hip: '36', uk: '8', us: '4', eu: '36' },
    { size: 'M', bust: '36', waist: '30', hip: '38', uk: '10', us: '6', eu: '38' },
    { size: 'L', bust: '38', waist: '32', hip: '40', uk: '12', us: '8', eu: '40' },
    { size: 'XL', bust: '40', waist: '34', hip: '42', uk: '14', us: '10', eu: '42' },
    { size: 'XXL', bust: '42', waist: '36', hip: '44', uk: '16', us: '12', eu: '44' },
    { size: '3XL', bust: '44', waist: '38', hip: '46', uk: '18', us: '14', eu: '46' },
    { size: '4XL', bust: '46', waist: '40', hip: '48', uk: '20', us: '16', eu: '48' },
    { size: '5XL', bust: '48', waist: '42', hip: '50', uk: '22', us: '18', eu: '50' },
  ];

  const cmData = [
    { size: 'XS', bust: '81', waist: '66', hip: '86' },
    { size: 'S', bust: '86', waist: '71', hip: '91' },
    { size: 'M', bust: '91', waist: '76', hip: '97' },
    { size: 'L', bust: '97', waist: '81', hip: '102' },
    { size: 'XL', bust: '102', waist: '86', hip: '107' },
    { size: 'XXL', bust: '107', waist: '91', hip: '112' },
    { size: '3XL', bust: '112', waist: '97', hip: '117' },
    { size: '4XL', bust: '117', waist: '102', hip: '122' },
    { size: '5XL', bust: '122', waist: '107', hip: '127' },
  ];

  return (
    <div className={styles.pageLayout}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={`${styles.title} serif`}>Women&apos;s Size Guide</h1>
          <p className={styles.subtitle}>Traditional Indian Wear</p>
          <p className={styles.note}>All measurements are body measurements, not garment measurements.</p>
        </div>

        <div className={styles.grid}>
          {/* Inches Table */}
          <div className={`glass-bento ${styles.card}`}>
            <h3 className={`${styles.cardTitle} serif`}>Size Chart (Inches)</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Bust (in)</th>
                    <th>Waist (in)</th>
                    <th>Hip (in)</th>
                    <th>UK</th>
                    <th>US</th>
                    <th>EU</th>
                  </tr>
                </thead>
                <tbody>
                  {inchesData.map((row) => (
                    <tr key={row.size}>
                      <td><strong>{row.size}</strong></td>
                      <td>{row.bust}</td>
                      <td>{row.waist}</td>
                      <td>{row.hip}</td>
                      <td>{row.uk}</td>
                      <td>{row.us}</td>
                      <td>{row.eu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.splitGrid}>
            {/* CM Table */}
            <div className={`glass-bento ${styles.card}`}>
              <h3 className={`${styles.cardTitle} serif`}>Size Chart (Centimeters)</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Bust (cm)</th>
                      <th>Waist (cm)</th>
                      <th>Hip (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cmData.map((row) => (
                      <tr key={row.size}>
                        <td><strong>{row.size}</strong></td>
                        <td>{row.bust}</td>
                        <td>{row.waist}</td>
                        <td>{row.hip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fit Tips */}
            <div className={`glass-bento ${styles.card} ${styles.tipsCard}`}>
              <h3 className={`${styles.cardTitle} serif`}>Fit Tips</h3>
              <ul className={styles.tipsList}>
                <li>If your measurements fall between two sizes, choose the larger size for a more comfortable fit.</li>
                <li>For heavily embroidered or non-stretch fabrics, consider sizing up.</li>
                <li>Due to handcrafted tailoring, slight measurement variations of 1–2 cm are normal.</li>
              </ul>
            </div>
          </div>

          {/* How to Measure */}
          <div className={`glass-bento ${styles.card}`}>
            <h3 className={`${styles.cardTitle} serif`}>How To Measure</h3>
            <div className={styles.measureGrid}>
              <div className={styles.measureItem}>
                <div className={styles.stepNumber}>1</div>
                <h4>Bust</h4>
                <p>Measure around the fullest part of your bust. Keep the measuring tape level and snug, but not tight.</p>
              </div>
              <div className={styles.measureItem}>
                <div className={styles.stepNumber}>2</div>
                <h4>Waist</h4>
                <p>Measure around the narrowest part of your natural waist.</p>
              </div>
              <div className={styles.measureItem}>
                <div className={styles.stepNumber}>3</div>
                <h4>Hip</h4>
                <p>Measure around the fullest part of your hips while standing with your feet together.</p>
              </div>
            </div>
          </div>

          {/* Type of Fit */}
          <div className={`glass-bento ${styles.card}`}>
            <h3 className={`${styles.cardTitle} serif`}>Type of Fit</h3>
            <div className={styles.measureGrid}>
              <div className={styles.measureItem}>
                <h4>Ready-to-Wear</h4>
                <p>Standard sizing as per chart above.</p>
              </div>
              <div className={styles.measureItem}>
                <h4>Semi-Stitched</h4>
                <p>Requires final stitching to your measurements.</p>
              </div>
              <div className={styles.measureItem}>
                <h4>Unstitched</h4>
                <p>Fabric only; tailor according to your body measurements.</p>
              </div>
            </div>
          </div>
          
          {/* Help Section */}
          <div className={`glass-bento ${styles.card} ${styles.helpCard}`}>
            <h3 className={`${styles.cardTitle} serif`}>Need Help Finding Your Size?</h3>
            <p>If you&apos;re unsure about your size, contact us and we&apos;ll be happy to help you choose the best fit.</p>
            <div className={styles.contactLinks}>
              <a href="tel:+12368807856">+1 (236) 880-7856</a>
              <span>|</span>
              <a href="mailto:hello@mehnazz.com">hello@mehnazz.com</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
