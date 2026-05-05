import { Link } from 'react-router-dom';
import Button from '../../common/Button/Button.jsx';
import { formatMoney } from '../../../utils/format.js';
import { mediaUrl } from '../../../utils/mediaUrl.js';
import styles from './CartItem.module.css';

export default function CartItem({ line, onInc, onDec, onRemove }) {
  const { product, quantity } = line;
  const price = Number(product.price);
  return (
    <div className={styles.row}>
      <Link to={`/product/${product.slug}`} className={styles.thumb}>
        <img src={mediaUrl(product.imageUrl)} alt="" />
      </Link>
      <div className={styles.info}>
        <Link to={`/product/${product.slug}`} className={styles.name}>
          {product.name}
        </Link>
        <p className={styles.desc}>{product.description}</p>
        <div className={styles.controls}>
          <button type="button" className={styles.qtyBtn} onClick={() => onDec(product.id)}>
            −
          </button>
          <span className={styles.qty}>{quantity}</span>
          <button type="button" className={styles.qtyBtn} onClick={() => onInc(product.id)}>
            +
          </button>
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.price}>{formatMoney(price * quantity)}</span>
        <Button variant="ghost" type="button" className={styles.remove} onClick={() => onRemove(product.id)}>
          Quitar
        </Button>
      </div>
    </div>
  );
}
