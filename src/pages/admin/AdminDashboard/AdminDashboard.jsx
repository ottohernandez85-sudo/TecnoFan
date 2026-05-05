import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../../../api/categories.js';
import { fetchProducts } from '../../../api/products.js';
import { fetchUsers } from '../../../api/users.js';
import { fetchCustomers } from '../../../api/customers.js';
import { fetchAllOrders } from '../../../api/orders.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    categories: 0,
    products: 0,
    users: 0,
    customers: 0,
    orders: 0,
  });

  useEffect(() => {
    if (!user) return undefined;

    let cancelled = false;

    async function run() {
      try {
        const [c, p, o] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
          fetchAllOrders(),
        ]);
        let usersCount = 0;
        let customersCount = 0;
        if (user.role === 'ADMIN') {
          try {
            const [u, cust] = await Promise.all([fetchUsers(), fetchCustomers()]);
            usersCount = u.length;
            customersCount = cust.length;
          } catch {
            usersCount = 0;
            customersCount = 0;
          }
        }
        if (!cancelled) {
          setCounts({
            categories: c.length,
            products: p.length,
            users: usersCount,
            customers: customersCount,
            orders: o.length,
          });
        }
      } catch {
        if (!cancelled) {
          setCounts({
            categories: 0,
            products: 0,
            users: 0,
            customers: 0,
            orders: 0,
          });
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div>
      <h1 className={styles.title}>Panel</h1>
      <p className={styles.lead}>Resumen rápido de la tienda.</p>
      <div className={styles.grid}>
        {isAdmin && (
          <Link to="/admin/categories" className={styles.card}>
            <span className={styles.num}>{counts.categories}</span>
            <span className={styles.label}>Categorías</span>
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin/products" className={styles.card}>
            <span className={styles.num}>{counts.products}</span>
            <span className={styles.label}>Productos</span>
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin/users" className={styles.card}>
            <span className={styles.num}>{counts.users}</span>
            <span className={styles.label}>Usuarios (personal)</span>
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin/customers" className={styles.card}>
            <span className={styles.num}>{counts.customers}</span>
            <span className={styles.label}>Clientes (tienda)</span>
          </Link>
        )}
        <Link to="/admin/orders" className={styles.card}>
          <span className={styles.num}>{counts.orders}</span>
          <span className={styles.label}>Órdenes</span>
        </Link>
        {isAdmin && (
          <Link to="/admin/theme" className={styles.card}>
            <span className={styles.label}>Tema y menú</span>
          </Link>
        )}
      </div>
    </div>
  );
}
