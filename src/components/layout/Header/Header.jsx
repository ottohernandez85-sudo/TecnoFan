import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useCustomerAuth } from '../../../context/CustomerAuthContext.jsx';
import { useCart } from '../../../context/CartContext.jsx';
import { useFavorites } from '../../../context/FavoritesContext.jsx';
import { mediaUrl } from '../../../utils/mediaUrl.js';
import NavMenuIcon from './NavMenuIcon.jsx';
import styles from './Header.module.css';

function IconCart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function IconHeartNav() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-7-4.35-9.5-9.5C.5 7.5 3 4.5 7 4.5c2.1 0 3.9 1.2 5 3 1.1-1.8 2.9-3 5-3 4 0 6.5 3 4.5 7C19 16.65 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Header() {
  const { settings } = useTheme();
  const { user: staff, logout: logoutStaff } = useAuth();
  const { customer, logout: logoutCustomer } = useCustomerAuth();
  const { count } = useCart();
  const { favorites, toggleSidebar } = useFavorites();
  const brand = settings?.brandName || 'Tecnofan';
  const menu = settings?.menuItems || [];
  const canPanel = staff && (staff.role === 'ADMIN' || staff.role === 'STAFF');

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          {settings?.logoUrl ? (
            <img src={mediaUrl(settings.logoUrl)} alt={brand} className={styles.logoImg} />
          ) : (
            <span className={styles.logoText}>{brand}</span>
          )}
        </Link>
        <nav className={styles.nav} aria-label="Principal">
          {menu.map((item) => (
            <NavLink
              key={item.path + item.label}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span className={styles.navIcon} aria-hidden>
                <NavMenuIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <button type="button" className={styles.iconBtn} aria-label="Favoritos" onClick={toggleSidebar}>
            <IconHeartNav />
            {favorites.length > 0 && <span className={styles.badgeCount}>{favorites.length}</span>}
          </button>
          <Link to="/cart" className={styles.iconBtn} aria-label="Carrito">
            <IconCart />
            {count > 0 && <span className={styles.badgeCount}>{count}</span>}
          </Link>
          {customer || staff ? (
            <div className={styles.userMenu}>
              <span className={styles.userName} aria-hidden>
                <IconUser />
              </span>
              <div className={styles.dropdown}>
                {customer && (
                  <div className={styles.dropdownBlock}>
                    <span className={styles.dropdownLabel}>Cliente</span>
                    <span className={styles.dropdownEmail}>{customer.name}</span>
                    <button type="button" className={styles.dropdownBtn} onClick={logoutCustomer}>
                      Salir (tienda)
                    </button>
                  </div>
                )}
                {staff && (
                  <div className={styles.dropdownBlock}>
                    <span className={styles.dropdownLabel}>Personal</span>
                    <span className={styles.dropdownEmail}>{staff.name}</span>
                    {canPanel && (
                      <Link to="/admin" className={styles.dropdownLink}>
                        Panel administración
                      </Link>
                    )}
                    <button type="button" className={styles.dropdownBtn} onClick={logoutStaff}>
                      Salir (personal)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/acceso" className={styles.iconBtn} aria-label="Acceso cliente">
              <IconUser />
            </Link>
          )}
          {!staff && (
            <Link to="/staff/login" className={styles.staffLink}>
              Personal
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
