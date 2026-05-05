import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { formatMoney } from '../../utils/format.js';
import { mediaUrl } from '../../utils/mediaUrl.js';
import styles from './FavoritesSidebar.module.css';

export default function FavoritesSidebar() {
  const { favorites, sidebarOpen, setSidebarOpen, removeFavorite } = useFavorites();
  const list = Array.isArray(favorites) ? favorites : [];

  if (!sidebarOpen) return null;

  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Cerrar favoritos"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={styles.panel} aria-label="Favoritos">
        <div className={styles.head}>
          <h2 className={styles.title}>Favoritos</h2>
          <button type="button" className={styles.close} onClick={() => setSidebarOpen(false)} aria-label="Cerrar">
            ×
          </button>
        </div>
        <p className={styles.hint}>Se guardan mientras tengas esta pestaña abierta.</p>
        <ul className={styles.list}>
          {list.map((p) => (
            <li key={p.id} className={styles.row}>
              <Link to={`/product/${p.slug}`} className={styles.thumb} onClick={() => setSidebarOpen(false)}>
                {p.imageUrl ? <img src={mediaUrl(p.imageUrl)} alt="" /> : <span className={styles.noImg}>—</span>}
              </Link>
              <div className={styles.meta}>
                <Link to={`/product/${p.slug}`} className={styles.name} onClick={() => setSidebarOpen(false)}>
                  {p.name}
                </Link>
                <span className={styles.price}>{formatMoney(p.price)}</span>
              </div>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Quitar ${p.name} de favoritos`}
                onClick={() => removeFavorite(p.id)}
              >
                ♥
              </button>
            </li>
          ))}
        </ul>
        {!list.length && <p className={styles.empty}>Aún no tienes favoritos. Usa el corazón en un producto.</p>}
      </aside>
    </>
  );
}
