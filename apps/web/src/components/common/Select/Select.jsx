import styles from './Select.module.css';

export default function Select({ label, id, children, className = '', error, ...props }) {
  const sid = id || props.name;
  return (
    <label className={`${styles.wrap} ${className}`} htmlFor={sid}>
      {label && <span className={styles.label}>{label}</span>}
      <select id={sid} className={`${styles.select} ${error ? styles.selectError : ''}`} {...props}>
        {children}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
