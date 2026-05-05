import styles from './Support.module.css';

export default function Support() {
  return (
    <div className={styles.page}>
      <h1>Soporte Tecnofan</h1>
      <p>
        Centro de servicio, garantías y contacto técnico. Este es un contenido de demostración para el
        enlace del menú configurable.
      </p>
      <ul className={styles.list}>
        <li>WhatsApp: +502 3000-0000</li>
        <li>Correo: soporte@tecnofan.demo</li>
        <li>Horario: Lun–Vie 8:00–18:00</li>
      </ul>
    </div>
  );
}
