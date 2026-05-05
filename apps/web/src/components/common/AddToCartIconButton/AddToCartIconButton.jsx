import styles from './AddToCartIconButton.module.css';

const TIP = 'Agregar al carrito';

function IconCart() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.3" fill="currentColor" />
      <circle cx="17" cy="20" r="1.3" fill="currentColor" />
    </svg>
  );
}

export default function AddToCartIconButton({
  onClick,
  className = '',
  disabled,
  title = TIP,
}) {
  return (
    <button
      type="button"
      className={`${styles.root} ${styles.primary} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      <IconCart />
    </button>
  );
}
