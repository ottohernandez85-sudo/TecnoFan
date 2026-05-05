import { Link } from 'react-router-dom';
import CartItem from '../../components/cart/CartItem/CartItem.jsx';
import Button from '../../components/common/Button/Button.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { formatMoney } from '../../utils/format.js';
import styles from './Cart.module.css';

export default function Cart() {
  const { items, subtotal, setQuantity, removeItem, addItem } = useCart();

  return (
    <div className={styles.page}>
      <h1>Carrito</h1>
      {!items.length ? (
        <p className={styles.empty}>
          Tu carrito está vacío.{' '}
          <Link to="/catalog">Ver catálogo</Link>
        </p>
      ) : (
        <div className={styles.layout}>
          <div className={styles.list}>
            {items.map((line) => (
              <CartItem
                key={line.product.id}
                line={line}
                onInc={(id) => {
                  const l = items.find((i) => i.product.id === id);
                  if (l) addItem(l.product, 1);
                }}
                onDec={(id) => {
                  const l = items.find((i) => i.product.id === id);
                  if (l) setQuantity(id, l.quantity - 1);
                }}
                onRemove={removeItem}
              />
            ))}
          </div>
          <aside className={styles.summary}>
            <h2>Resumen</h2>
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className={styles.row}>
              <span>Envío (Guatemala)</span>
              <span className={styles.free}>GRATIS</span>
            </div>
            <div className={`${styles.row} ${styles.total}`}>
              <span>Total</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <p className={styles.iva}>IVA incluido</p>
            <Link to="/checkout">
              <Button className={styles.checkout}>Finalizar compra →</Button>
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
