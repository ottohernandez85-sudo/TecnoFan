import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx';
import styles from './AdminSidebar.module.css';

function IconDashboard() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 13h7V4H4v9Zm9 0h7V4h-7v9ZM4 22h7v-7H4v7Zm9 0h7v-7h-7v7Z" fill="currentColor" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8l8-4 8 4v12l-8 4-8-4V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTag() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7l9 9-7 7-9-9V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm11 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShopping() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l-1 12H6L5 9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconReceipt() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h12v16l-2-1-2 1-2-1-2 1-2-1-2 1V4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 9h6M10 13h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a9 9 0 1 0 9 9c0-1.5-1-2-2-2h-2a2 2 0 0 1-2-2V6c0-1-1.5-2-3-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
      <circle cx="10.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

const allLinks = [
  { to: '/admin', label: 'Resumen', end: true, Icon: IconDashboard, adminOnly: false },
  { to: '/admin/orders', label: 'Órdenes', Icon: IconReceipt, adminOnly: false },
  { to: '/admin/products', label: 'Productos', Icon: IconBox, adminOnly: true },
  { to: '/admin/categories', label: 'Categorías', Icon: IconTag, adminOnly: true },
  { to: '/admin/users', label: 'Usuarios', Icon: IconUsers, adminOnly: true },
  { to: '/admin/customers', label: 'Clientes', Icon: IconShopping, adminOnly: true },
  { to: '/admin/theme', label: 'Tema y menú', Icon: IconPalette, adminOnly: true },
];

export default function AdminSidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const links = allLinks.filter((l) => !l.adminOnly || isAdmin);

  return (
    <aside className={styles.aside}>
      <div className={styles.title}>Admin</div>
      <nav className={styles.nav}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <l.Icon />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink to="/" className={styles.back}>
        ← Volver a la tienda
      </NavLink>
    </aside>
  );
}
