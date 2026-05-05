import { useCallback, useRef, useState } from 'react';
import AddToCartIconButton from '../../common/AddToCartIconButton/AddToCartIconButton.jsx';
import { useFavorites } from '../../../context/FavoritesContext.jsx';
import { resolveProductColorHex } from '../../../utils/productDisplay.js';
import styles from './ProductCardToolbar.module.css';

const HOVER_MS = 320;

function IconHeart({ filled }) {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      {filled ? (
        <path
          d="M12 21s-7-4.35-9.5-9.5C.5 7.5 3 4.5 7 4.5c2.1 0 3.9 1.2 5 3 1.1-1.8 2.9-3 5-3 4 0 6.5 3 4.5 7C19 16.65 12 21 12 21Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M12 21s-7-4.35-9.5-9.5C.5 7.5 3 4.5 7 4.5c2.1 0 3.9 1.2 5 3 1.1-1.8 2.9-3 5-3 4 0 6.5 3 4.5 7C19 16.65 12 21 12 21Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function IconInventory() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8h16v10H4V8Zm0-2h16v2H4V6Zm4 4h8v2H8v-2Zm0 4h5v2H8v-2Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path d="M4 6V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export default function ProductCardToolbar({ product, onAddToCart, className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(product.id);
  const colorHex = resolveProductColorHex(product.attributes || {});
  const stock = Number(product.stock ?? 0);

  const [invOpen, setInvOpen] = useState(false);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const openInv = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setInvOpen(true), HOVER_MS);
  }, [clearTimer]);

  const closeInv = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setInvOpen(false), 120);
  }, [clearTimer]);

  const keepInv = useCallback(() => {
    clearTimer();
    setInvOpen(true);
  }, [clearTimer]);

  return (
    <div className={`${styles.toolbar} ${className}`.trim()}>
      <div className={styles.actionCluster}>
        {colorHex ? (
          <span
            className={styles.colorDot}
            style={{ backgroundColor: colorHex }}
            title={`Color: ${colorHex}`}
            aria-label={`Color del producto ${colorHex}`}
          />
        ) : null}

        <div
          className={styles.popWrap}
          onMouseEnter={openInv}
          onMouseLeave={closeInv}
        >
          <button
            type="button"
            className={styles.roundBtn}
            aria-label="Ver inventario"
            title="Inventario"
          >
            <IconInventory />
          </button>
          {invOpen && (
            <div
              className={styles.popover}
              role="tooltip"
              onMouseEnter={keepInv}
              onMouseLeave={() => setInvOpen(false)}
            >
              Inventario disponible
              <strong>{stock}</strong>
              <span> unidades</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className={`${styles.roundBtn} ${fav ? styles.roundBtnActive : ''}`}
          onClick={() => toggleFavorite(product)}
          title={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={fav}
        >
          <IconHeart filled={fav} />
        </button>

        <AddToCartIconButton className={styles.cartBtn} onClick={() => onAddToCart(product)} />
      </div>
    </div>
  );
}
