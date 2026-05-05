import styles from './Textarea.module.css';

export default function Textarea({ label, id, className = '', error, rows = 3, ...props }) {
  const tid = id || props.name;
  return (
    <label className={`${styles.wrap} ${className}`} htmlFor={tid}>
      {label && <span className={styles.label}>{label}</span>}
      <textarea
        id={tid}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        rows={rows}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}
