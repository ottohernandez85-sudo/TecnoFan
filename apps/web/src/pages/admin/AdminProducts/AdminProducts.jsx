import { useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import Input from '../../../components/common/Input/Input.jsx';
import Textarea from '../../../components/common/Textarea/Textarea.jsx';
import Select from '../../../components/common/Select/Select.jsx';
import Button from '../../../components/common/Button/Button.jsx';
import Modal from '../../../components/common/Modal/Modal.jsx';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../../../api/products.js';
import { fetchCategories } from '../../../api/categories.js';
import { confirmAction, notifyError, notifySuccess } from '../../../utils/notify.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { mediaUrl } from '../../../utils/mediaUrl.js';
import styles from './AdminProducts.module.css';

function IconEdit() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 21h4l11.5-11.5a2.12 2.12 0 0 0-3-3L5 18v3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="m14.5 5.5 4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className={styles.iconSvg} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M10 11v7M14 11v7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9 7l1 12a1 1 0 0 0 1 .92h2a1 1 0 0 0 1-.92L15 7" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  categoryId: '',
  badge: '',
  imageUrl: '',
};

export default function AdminProducts() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [filterCategoryId, setFilterCategoryId] = useState('');

  const filteredProducts = useMemo(() => {
    if (!filterCategoryId) return products;
    const id = Number(filterCategoryId);
    return products.filter((p) => p.categoryId === id);
  }, [products, filterCategoryId]);

  const load = async () => {
    try {
      const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(p);
      setCategories(c);
      setForm((f) => ({
        ...f,
        categoryId: f.categoryId || (c[0] ? String(c[0].id) : ''),
      }));
    } catch {
      setProducts([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const q = searchParams.get('category');
    if (q != null && q !== '') {
      setFilterCategoryId(q);
    }
  }, [searchParams]);

  useEffect(
    () => () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    },
    [imagePreviewUrl],
  );

  const clearPickedImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setImageFile(null);
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageFile(file);
  };

  if (user?.role === 'STAFF') {
    return <Navigate to="/admin/orders" replace />;
  }

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const closeModal = () => {
    clearPickedImage();
    setModalOpen(false);
    setEditingId(null);
    setForm({
      ...emptyForm,
      categoryId: categories[0] ? String(categories[0].id) : '',
    });
  };

  const openNew = () => {
    clearPickedImage();
    setEditingId(null);
    setForm({
      ...emptyForm,
      categoryId: categories[0] ? String(categories[0].id) : '',
    });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    clearPickedImage();
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      categoryId: String(p.categoryId),
      badge: p.badge || '',
      imageUrl: p.imageUrl || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock || 0),
      categoryId: Number(form.categoryId),
      badge: form.badge || null,
      imageUrl: form.imageUrl || null,
    };
    try {
      let productId = editingId;
      if (editingId) {
        await updateProduct(editingId, body);
      } else {
        const created = await createProduct(body);
        productId = created.id;
      }
      if (imageFile && productId) {
        await uploadProductImage(productId, imageFile);
      }
      notifySuccess(editingId ? 'Producto actualizado' : 'Producto creado');
      closeModal();
      load();
    } catch (err) {
      notifyError('No se pudo guardar', err?.response?.data?.error || '');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    const ok = await confirmAction({
      title: '¿Eliminar producto?',
      text: 'Se eliminará del catálogo.',
      icon: 'warning',
      confirmButtonText: 'Sí, eliminar',
    });
    if (!ok) return;
    try {
      await deleteProduct(id);
      notifySuccess('Producto eliminado');
      if (editingId === id) closeModal();
      load();
    } catch (err) {
      notifyError('Error', err?.response?.data?.error || 'No se pudo eliminar');
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Productos</h1>
        <Button type="button" onClick={openNew}>
          Nuevo producto
        </Button>
      </div>

      <div className={styles.filterBar}>
        <Select
          label="Filtrar por categoría"
          name="adminProductCategoryFilter"
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
          className={styles.categoryFilter}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  No hay productos en esta categoría.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>{p.stock}</td>
                  <td className={styles.cellActions}>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                      onClick={() => openEdit(p)}
                      aria-label="Editar producto"
                      title="Editar"
                    >
                      <IconEdit />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      onClick={() => onDelete(p.id)}
                      aria-label="Eliminar producto"
                      title="Eliminar"
                    >
                      <IconTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? `Editar producto #${editingId}` : 'Nuevo producto'}
        onClose={closeModal}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
              Cerrar
            </Button>
            <Button type="submit" form="product-form" disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear'}
            </Button>
          </>
        }
      >
        <form id="product-form" className={styles.modalForm} onSubmit={onSubmit}>
          <div className={styles.row2}>
            <Input label="Nombre" name="name" value={form.name} onChange={onChange} required />
            <Input label="Precio" name="price" type="number" step="0.01" value={form.price} onChange={onChange} required />
          </div>
          <Textarea
            label="Descripción"
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
            required
          />
          <div className={styles.row2}>
            <Input label="Stock" name="stock" type="number" value={form.stock} onChange={onChange} />
            <Select label="Categoría" name="categoryId" value={form.categoryId} onChange={onChange} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className={styles.row2}>
            <Input label="Badge (opcional)" name="badge" value={form.badge} onChange={onChange} placeholder="NEW ARRIVAL" />
            <Input
              label="URL de imagen (opcional)"
              name="imageUrl"
              value={form.imageUrl}
              onChange={onChange}
              placeholder="https://…"
            />
          </div>
          <div className={styles.imageBlock}>
            <span className={styles.imageLabel}>Fotografía del producto</span>
            <p className={styles.imageHint}>
              Elige un archivo desde tu equipo; en el servidor se convierte automáticamente a WebP.
            </p>
            <label className={styles.filePick}>
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={onPickImage} />
              <span>Seleccionar imagen…</span>
            </label>
            {(imagePreviewUrl || form.imageUrl) && (
              <div className={styles.imagePreview}>
                <img
                  src={imagePreviewUrl || mediaUrl(form.imageUrl)}
                  alt=""
                  className={styles.previewImg}
                />
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
