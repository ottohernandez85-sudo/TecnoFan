import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button/Button.jsx';
import CategoryTile from '../../components/product/CategoryTile/CategoryTile.jsx';
import HeroVisual from '../../components/home/HeroVisual.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { fetchCategories } from '../../api/categories.js';
import styles from './Home.module.css';

const rooms = [
  { id: 'bath', label: 'Baño', range: '3 - 8 m²' },
  { id: 'bed', label: 'Dormitorio', range: '9 - 20 m²', selected: true },
  { id: 'living', label: 'Sala grande', range: '21 - 40 m²' },
  { id: 'warehouse', label: 'Bodega', range: '40+ m²' },
];

export default function Home() {
  const { settings } = useTheme();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]));
  }, []);

  const heroBadge = settings?.heroBadge ?? 'Nueva colección 2024';
  const heroTitle = settings?.heroTitle ?? 'Equilibrio ideal: entre aire y diseño';
  const heroSubtitle =
    settings?.heroSubtitle ??
    'Tonos claros, velocidades suaves y silencio de ingeniería para tu espacio.';

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <span className={styles.badge}>{heroBadge}</span>
            <h1 className={styles.heroTitle}>{heroTitle}</h1>
            <p className={styles.heroSub}>{heroSubtitle}</p>
            <div className={styles.heroActions}>
              <Link to="/catalog">
                <Button>Comprar ahora</Button>
              </Link>
              <Link to="/catalog">
                <Button variant="secondary">Ver catálogo</Button>
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <HeroVisual slides={settings?.heroSlides} />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>Explora por categoría</h2>
          <p>Encuentra el flujo perfecto para cada ambiente.</p>
        </div>
        <div className={styles.catGrid}>
          {categories.map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>
      </section>

      <section className={styles.wizard}>
        <div className={styles.wizardInner}>
          <h2>Cómo elegir tu ventilador</h2>
          <p>Selecciona el tipo de espacio para orientar tu compra.</p>
          <div className={styles.roomGrid}>
            {rooms.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`${styles.roomCard} ${r.selected ? styles.roomSelected : ''}`}
              >
                <span className={styles.roomIcon}>⌂</span>
                <span className={styles.roomLabel}>{r.label}</span>
                <span className={styles.roomRange}>{r.range}</span>
              </button>
            ))}
          </div>
          <Link to="/catalog" className={styles.wizardLink}>
            Ver recomendaciones personalizadas →
          </Link>
        </div>
      </section>

      <section className={styles.tech}>
        <div className={styles.techInner}>
          <div className={styles.techGrid}>
            {[
              { t: 'Motor DC', d: 'Mayor eficiencia y control fino de velocidad.' },
              { t: 'Silencioso', d: 'Ingeniería acústica para dormir sin ruido.' },
              { t: 'Smart', d: 'Integración Wi-Fi y escenas domóticas.' },
              { t: 'Diseño', d: 'Acabados premium y proporciones limpias.' },
            ].map((x) => (
              <div key={x.t} className={styles.techCard}>
                <span className={styles.techIcon}>✦</span>
                <h3>{x.t}</h3>
                <p>{x.d}</p>
              </div>
            ))}
          </div>
          <div className={styles.techCopy}>
            <h2>Ingeniería que respira contigo.</h2>
            <ul>
              <li>Motor DC vs AC: eficiencia y confort en cada revolución.</li>
              <li>Smart Home: control desde app y asistentes de voz.</li>
            </ul>
            <Link to="/catalog">
              <Button variant="secondary">Explorar tecnología DC</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
