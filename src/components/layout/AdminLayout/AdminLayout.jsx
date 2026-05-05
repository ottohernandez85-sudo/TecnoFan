import { Outlet } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar.jsx';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  return (
    <div className={styles.wrap}>
      <AdminSidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
