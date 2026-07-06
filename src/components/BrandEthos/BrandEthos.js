import Image from 'next/image';
import styles from './BrandEthos.module.css';

export default function BrandEthos() {
  return (
    <section className={styles.ethosGrid}>
      <div className={`glass-bento ${styles.imageBento}`}>
        <Image 
          src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200"
          alt="Tailoring process"
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      
      <div className={`glass-bento ${styles.textBento}`}>
        <div className={styles.textContent}>
          <div className={styles.watermark}>Atelier</div>
          <h2 className={`${styles.heading} serif`}>The Atelier</h2>
          <p className={styles.paragraph}>
            Every piece in our collection is a testament to uncompromised craftsmanship. We source the finest cashmere, merino, and silk, employing generations-old tailoring techniques to create silhouettes that transcend seasons.
          </p>
          <p className={styles.paragraph}>
            It is not merely about clothing. It is about an enduring legacy of elegance, designed for those who appreciate the quiet resonance of true luxury.
          </p>
          <div className={styles.emblemDivider}></div>
        </div>
      </div>
    </section>
  );
}
