import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard/ProductCard.jsx';
import CatalogFilters from '../../components/product/CatalogFilters/CatalogFilters.jsx';
import Input from '../../components/common/Input/Input.jsx';
import { fetchCategories } from '../../api/categories.js';
import { fetchProducts } from '../../api/products.js';
import { useCart } from '../../context/CartContext.jsx';
import styles from './Catalog.module.css';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sizes, setSizes] = useState([]);
  const [motor, setMotor] = useState('DC');
  const [lightTech, setLightTech] = useState('CCT Selectable');
  const [controls, setControls] = useState([]);
  const { addItem } = useCart();

  const categoryId = useMemo(() => {
    const c = categories.find((x) => x.slug === categorySlug);
    return c?.id;
  }, [categories, categorySlug]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const params = {};
    if (categoryId) params.categoryId = categoryId;
    if (search.trim()) params.search = search.trim();
    fetchProducts(params).then(setProducts).catch(() => setProducts([]));
  }, [categoryId, search]);

  const activeCategory = useMemo(
    () => (categorySlug ? categories.find((x) => x.slug === categorySlug) : null),
    [categories, categorySlug],
  );

  const title = useMemo(() => activeCategory?.name || 'Catálogo', [activeCategory]);

  const leadText = useMemo(() => {
    const fromDb = activeCategory?.description?.trim();
    if (fromDb) return fromDb;
    if (activeCategory) {
      return 'Explora los productos de esta categoría.';
    }
    return 'Tecnología DC, control inteligente y diseño limpio para cada espacio de tu hogar o negocio.';
  }, [activeCategory]);

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1>{title}</h1>
        <p>{leadText}</p>
        <div className={styles.searchRow}>
          <Input
            label="Buscar"
            placeholder="Nombre o descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.layout}>
        <CatalogFilters
          sizes={sizes}
          motor={motor}
          onSizesChange={setSizes}
          onMotorChange={setMotor}
          lightTech={lightTech}
          onLightTechChange={setLightTech}
          controls={controls}
          onControlsChange={setControls}
        />
        <div className={styles.grid}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={(prod) => addItem(prod, 1)} />
          ))}
          {!products.length && <p className={styles.empty}>No hay productos con estos filtros.</p>}
        </div>
      </div>
    </div>
  );
}
