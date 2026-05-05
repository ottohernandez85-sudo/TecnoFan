import { Link } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext.jsx';
import { mediaUrl } from '../../../utils/mediaUrl.js';
import styles from './Footer.module.css';

export default function Footer() {
  const { settings } = useTheme();
  const brand = settings?.brandName || 'Tecnofan';
  const footerOnly = settings?.footerLogoUrl;

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <div className={styles.brandRow}>
            {footerOnly ? (
              <div className={styles.logoFoot}>
                <img src={mediaUrl(footerOnly)} alt={brand} className={styles.logo} />
              </div>
            ) : (
              <span className={styles.brand}>{brand}</span>
            )}
          </div>
          <p className={styles.blurb}>
            Ingeniería en climatización y ventilación para hogar y negocio. Guatemala.
          </p>
        </div>
        <div>
          <h4 className={styles.colTitle}>Soporte</h4>
          <ul className={styles.links}>
            <li>
              <Link to="/support">Centro de servicio</Link>
            </li>
            <li>
              <Link to="/support">Garantía</Link>
            </li>
            <li>
              <Link to="/support">WhatsApp</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className={styles.colTitle}>Recursos</h4>
          <ul className={styles.links}>
            <li>
              <Link to="/catalog">Catálogo</Link>
            </li>
            <li>
              <Link to="/support">Política de privacidad</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className={styles.colTitle}>Newsletter</h4>
          <p className={styles.newsHint}>Recibe novedades técnicas y promociones.</p>
          <form
            className={styles.newsForm}
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input type="email" placeholder="tu@correo.com" className={styles.newsInput} />
            <button type="submit" className={styles.newsBtn} aria-label="Enviar">
              →
            </button>
          </form>
        </div>
      </div>
      <p className={styles.copy}>© {new Date().getFullYear()} {brand}. Innovación en climatización.</p>
    </footer>
  );
}
