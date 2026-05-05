import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge/Badge.jsx';
import ProductCardToolbar from '../../components/product/ProductCardToolbar/ProductCardToolbar.jsx';
import { fetchProductBySlug } from '../../api/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { formatMoney } from '../../utils/format.js';
import { mediaUrl } from '../../utils/mediaUrl.js';
import { badgeTone } from '../../components/product/ProductCard/badgeTone.js';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [err, setErr] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    setErr(null);
    fetchProductBySlug(slug)
      .then(setProduct)
      .catch(() => setErr('No se pudo cargar el producto'));
  }, [slug]);

  if (err) {
    return <p className={styles.center}>{err}</p>;
  }
  if (!product) {
    return <p className={styles.center}>Cargando…</p>;
  }

  const attrs = product.attributes || {};
  const listPrice = Number(product.price) * 1.12;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <Link to="/catalog">Catálogo</Link>
        <span>/</span>
        <Link to={`/catalog?category=${product.category?.slug}`}>{product.category?.name}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className={styles.grid}>
        <div className={styles.media}>
          <div className={styles.mainImg}>
            <span className={styles.tag360}>Vista 360° activa</span>
            <img src={mediaUrl(product.imageUrl)} alt="" />
          </div>
          <div className={styles.thumbs}>
            {[1, 2, 3, 4].map((i) => (
              <button key={i} type="button" className={styles.thumbBtn}>
                <img src={mediaUrl(product.imageUrl)} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className={styles.info}>
          {product.badge && (
            <div className={styles.badgeRow}>
              <Badge tone={badgeTone(product.badge)}>{product.badge}</Badge>
            </div>
          )}
          <h1>{product.name}</h1>
          <p className={styles.lead}>{product.description}</p>

          <div className={styles.cct}>
            <span className={styles.cctLabel}>Tono de iluminación (CCT)</span>
            <div className={styles.cctBar} />
          </div>

          <div className={styles.audio}>
            <button type="button" className={styles.play}>
              ▶
            </button>
            <span>Escucha el silencio</span>
          </div>

          <div className={styles.prices}>
            <span className={styles.price}>{formatMoney(product.price)}</span>
            <span className={styles.old}>{formatMoney(listPrice)}</span>
          </div>
          <div className={styles.install}>
            Hasta 12 Visacuotas — consulta en checkout.
          </div>

          <div className={styles.actions}>
            <ProductCardToolbar
              className={styles.detailToolbar}
              product={product}
              onAddToCart={() => addItem(product, 1)}
            />
          </div>
          <button type="button" className={styles.pdf}>
            Descargar ficha técnica (PDF)
          </button>

          <div className={styles.specs}>
            <div>
              <span className={styles.specK}>Airflow</span>
              <span className={styles.specV}>{attrs.airflow || '—'}</span>
            </div>
            <div>
              <span className={styles.specK}>Ruido</span>
              <span className={styles.specV}>{attrs.noise || '—'}</span>
            </div>
            <div>
              <span className={styles.specK}>Garantía</span>
              <span className={styles.specV}>{attrs.warranty || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
