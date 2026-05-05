import { Link } from 'react-router-dom';
import Badge from '../../../common/Badge/Badge.jsx';
import ProductCardToolbar from '../../ProductCardToolbar/ProductCardToolbar.jsx';
import { formatMoney } from '../../../../utils/format.js';
import { mediaUrl } from '../../../../utils/mediaUrl.js';
import { badgeTone } from '../badgeTone.js';
import styles from './CompactCard.module.css';

export default function CompactCard({ product, onAddToCart }) {
  return (
    <article className={styles.card}>
      <Link to={`/product/${product.slug}`} className={styles.thumb}>
        {product.badge && (
          <span className={styles.badge}>
            <Badge tone={badgeTone(product.badge)}>{product.badge}</Badge>
          </span>
        )}
        <img src={mediaUrl(product.imageUrl)} alt="" className={styles.img} />
      </Link>
      <div className={styles.body}>
        <Link to={`/product/${product.slug}`} className={styles.name}>
          {product.name}
        </Link>
        <p className={styles.price}>{formatMoney(product.price)}</p>
        <ProductCardToolbar className={styles.toolbar} product={product} onAddToCart={onAddToCart} />
      </div>
    </article>
  );
}
