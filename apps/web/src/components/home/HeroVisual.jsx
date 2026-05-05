import { useEffect, useMemo, useState } from 'react';
import { mediaUrl } from '../../utils/mediaUrl.js';
import styles from './HeroVisual.module.css';

export default function HeroVisual({ slides }) {
  const urls = useMemo(
    () => (Array.isArray(slides) ? slides.filter((u) => typeof u === 'string' && u.trim()) : []),
    [slides],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [urls.join('|')]);

  useEffect(() => {
    if (urls.length <= 1) return undefined;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % urls.length);
    }, 5000);
    return () => clearInterval(t);
  }, [urls.length]);

  if (!urls.length) {
    return <div className={styles.placeholder} aria-hidden />;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.frame}>
        {urls.map((url, i) => (
          <img
            key={`${url}-${i}`}
            src={mediaUrl(url)}
            alt=""
            className={`${styles.img} ${i === index ? styles.imgActive : ''}`}
          />
        ))}
      </div>
      {urls.length > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Carrusel del banner">
          {urls.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
              aria-label={`Imagen ${i + 1}`}
              aria-selected={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
