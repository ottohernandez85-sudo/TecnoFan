import { Outlet } from 'react-router-dom';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import FavoritesSidebar from '../../favorites/FavoritesSidebar.jsx';
import styles from './PublicLayout.module.css';

export default function PublicLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <FavoritesSidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
