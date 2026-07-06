import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={`glass-bento ${styles.heroBento}`}>
      {/* Heavily blurred background image */}
      <div className={styles.bgImageWrapper}>
        <Image 
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Blurred background"
          fill
          priority
          className={styles.bgImage}
        />
        <div className={styles.bgOverlay}></div>
      </div>
      
      {/* Content Layout */}
      <div className={styles.heroContentGrid}>
        
        {/* Left: Text Content */}
        <div className={styles.textContentWrapper}>
          <div className={`glass-bento ${styles.textContent}`}>
            <h1 className={`${styles.title} serif`}>Sartorial<br/>Precision</h1>
            <p className={styles.subtitle}>A modern perspective on enduring menswear.</p>
            <Link href="/collections/all" className="btn-primary">
              Explore Collection
            </Link>
          </div>
        </div>

        {/* Right: Custom Gallery Container */}
        <div className={styles.galleryWrapper}>
           <div className={`glass-bento ${styles.galleryContainer}`}>
             <Image 
               src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
               alt="Hero Gallery"
               fill
               className={styles.galleryImage}
             />
           </div>
        </div>

      </div>
    </section>
  );
}
