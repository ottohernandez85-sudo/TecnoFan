import { Link } from 'react-router-dom';
import Badge from '../../../common/Badge/Badge.jsx';
import ProductCardToolbar from '../../ProductCardToolbar/ProductCardToolbar.jsx';
import { formatMoney } from '../../../../utils/format.js';
import { mediaUrl } from '../../../../utils/mediaUrl.js';
import { badgeTone } from '../badgeTone.js';
import styles from './DetailedCard.module.css';

export default function DetailedCard({ product, onAddToCart }) {
  const attrs = product.attributes || {};
  const catName = product.category?.name;
  return (
    <article className={styles.card}>
      <Link to={`/product/${product.slug}`} className={styles.imageWrap}>
        {product.badge && (
          <div className={styles.badgeWrap}>
            <Badge tone={badgeTone(product.badge)}>{product.badge}</Badge>
          </div>
        )}
        <img src={mediaUrl(product.imageUrl)} alt="" className={styles.img} />
      </Link>
      <div className={styles.body}>
        <div className={styles.meta}>
          {catName && <span className={styles.chip}>{catName}</span>}
        </div>
        <div className={styles.rowTitle}>
          <Link to={`/product/${product.slug}`} className={styles.name}>
            {product.name}
          </Link>
          <span className={styles.price}>{formatMoney(product.price)}</span>
        </div>
        <p className={styles.desc}>{product.description}</p>
        <div className={styles.specs}>
          <div>
            <span className={styles.specLabel}>Airflow</span>
            <span className={styles.specVal}>{attrs.airflow || '—'}</span>
          </div>
          <div>
            <span className={styles.specLabel}>Noise</span>
            <span className={styles.specVal}>{attrs.noise || '—'}</span>
          </div>
          <div>
            <span className={styles.specLabel}>Warranty</span>
            <span className={styles.specVal}>{attrs.warranty || '—'}</span>
          </div>
        </div>
        <ProductCardToolbar className={styles.cta} product={product} onAddToCart={onAddToCart} />
      </div>
    </article>
  );
}
