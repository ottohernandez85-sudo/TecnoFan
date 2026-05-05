import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled,
  onClick,
  ...rest
}) {
  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
