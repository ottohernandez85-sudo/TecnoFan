import { Link } from 'react-router-dom';
import NavMenuIcon from '../../layout/Header/NavMenuIcon.jsx';
import styles from './CategoryTile.module.css';

export default function CategoryTile({ category }) {
  const to = `/catalog?category=${encodeURIComponent(category.slug)}`;

  return (
    <Link to={to} className={styles.card}>
      <div className={styles.iconBox} aria-hidden>
        <span className={styles.iconSvg}>
          <NavMenuIcon name={category.icon} size={28} />
        </span>
      </div>
      <span className={styles.label}>{category.name}</span>
      {category.description ? (
        <span className={styles.desc}>{category.description}</span>
      ) : null}
    </Link>
  );
}
