import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Input from '../../../components/common/Input/Input.jsx';
import Textarea from '../../../components/common/Textarea/Textarea.jsx';
import Select from '../../../components/common/Select/Select.jsx';
import Button from '../../../components/common/Button/Button.jsx';
import NavMenuIcon from '../../../components/layout/Header/NavMenuIcon.jsx';
import Modal from '../../../components/common/Modal/Modal.jsx';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../../api/categories.js';
import { fetchSettings, updateSettings } from '../../../api/settings.js';
import { confirmAction, notifyError, notifySuccess } from '../../../utils/notify.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useTheme } from '../../../context/ThemeContext.jsx';
import styles from './AdminCategories.module.css';

const ICON_OPTIONS = [
  { value: 'fan', label: 'Ventilador / smart' },
  { value: 'wind', label: 'Aire / techo' },
  { value: 'building', label: 'Industrial' },
  { value: 'package', label: 'Accesorios' },
  { value: 'droplet', label: 'Humedad / extractor' },
  { value: 'headset', label: 'Soporte' },
  { value: 'home', label: 'Inicio' },
  { value: 'cart', label: 'Carrito' },
  { value: 'circle', label: 'Genérico' },
];

const emptyForm = { name: '', description: '', icon: 'fan' };

function catalogMenuPath(slug) {
  return `/catalog?category=${encodeURIComponent(slug)}`;
}

function normalizeMenuFromSettings(menuItems) {
  if (!Array.isArray(menuItems) || !menuItems.length) return [];
  return menuItems.map((row) => ({
    label: row.label,
    path: row.path,
    icon: row.icon || 'circle',
  }));
}

function insertCategoryInMenu(menuItems, { name, slug, icon }) {
  const path = catalogMenuPath(slug);
  if (menuItems.some((m) => m.path === path)) return menuItems;
  const item = { label: name, path, icon: icon || 'circle' };
  const supportIdx = menuItems.findIndex(
    (m) => m.path === '/support' || (typeof m.path === 'string' && m.path.startsWith('/support')),
  );
  if (supportIdx >= 0) {
    const next = [...menuItems];
    next.splice(supportIdx, 0, item);
    return next;
  }
  return [...menuItems, item];
}

export default function AdminCategories() {
  const { user } = useAuth();
  const { reloadSettings } = useTheme();
  const [list, setList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [addToMainMenu, setAddToMainMenu] = useState(true);

  const load = () => fetchCategories().then(setList).catch(() => setList([]));

  useEffect(() => {
    load();
  }, []);

  if (user?.role === 'STAFF') {
    return <Navigate to="/admin/orders" replace />;
  }

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setAddToMainMenu(true);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setAddToMainMenu(false);
    setEditingId(c.id);
    setForm({
      name: c.name,
      description: c.description ?? '',
      icon: c.icon || 'circle',
    });
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: form.name,
          description: form.description || '',
          icon: form.icon || null,
        });
        notifySuccess('Categoría actualizada');
      } else {
        const created = await createCategory({
          name: form.name,
          description: form.description || '',
          icon: form.icon || null,
        });
        if (addToMainMenu) {
          try {
            const s = await fetchSettings();
            const current = normalizeMenuFromSettings(s.menuItems);
            const nextMenu = insertCategoryInMenu(current, {
              name: created.name,
              slug: created.slug,
              icon: created.icon || form.icon,
            });
            await updateSettings({ menuItems: nextMenu });
            await reloadSettings();
          } catch (menuErr) {
            notifyError(
              'Categoría creada',
              menuErr?.response?.data?.error ||
                'No se pudo añadir al menú. Puedes hacerlo en Tema y marca.',
            );
            closeModal();
            load();
            return;
          }
        }
        notifySuccess('Categoría creada');
      }
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
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      confirmButtonText: 'Sí, eliminar',
    });
    if (!ok) return;
    try {
      await deleteCategory(id);
      notifySuccess('Categoría eliminada');
      load();
    } catch (err) {
      notifyError('Error', err?.response?.data?.error || 'No se pudo eliminar');
    }
  };

  const preview = (text, max = 90) => {
    const t = (text || '').trim();
    if (t.length <= max) return t || '—';
    return `${t.slice(0, max)}…`;
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Categorías</h1>
        <Button type="button" onClick={openCreate}>
          Nueva categoría
        </Button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Icono</th>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Descripción</th>
              <th>Productos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td className={styles.iconCell}>
                  <span className={styles.iconPreview} title={c.icon || 'circle'}>
                    <NavMenuIcon name={c.icon} size={22} />
                  </span>
                </td>
                <td>{c.name}</td>
                <td>
                  <code className={styles.slug}>{c.slug}</code>
                </td>
                <td className={styles.descPreview}>{preview(c.description)}</td>
                <td className={styles.productsCol}>
                  <span className={styles.productCount}>{c._count?.products ?? 0}</span>
                  <Link className={styles.productsLink} to={`/admin/products?category=${c.id}`}>
                    Ver / asignar
                  </Link>
                  <Link className={styles.publicLink} to={catalogMenuPath(c.slug)} target="_blank" rel="noreferrer">
                    Ver tienda ↗
                  </Link>
                </td>
                <td className={styles.actions}>
                  <Button type="button" variant="secondary" onClick={() => openEdit(c)}>
                    Editar
                  </Button>
                  <Button variant="danger" type="button" onClick={() => onDelete(c.id)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? `Editar categoría #${editingId}` : 'Nueva categoría'}
        onClose={closeModal}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
              Cerrar
            </Button>
            <Button type="submit" form="category-form" disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear'}
            </Button>
          </>
        }
      >
        <form id="category-form" className={styles.modalForm} onSubmit={onSubmit}>
          <Input
            label="Nombre"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            placeholder="Texto visible en la tienda (home y fichas)."
          />
          <Select
            label="Icono (home y catálogo)"
            name="icon"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
          >
            {ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          {!editingId && (
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={addToMainMenu}
                onChange={(e) => setAddToMainMenu(e.target.checked)}
              />
              <span>
                Incluir en el menú principal (misma página de catálogo que el resto:{' '}
                <code className={styles.inlineCode}>/catalog?category=…</code>)
              </span>
            </label>
          )}
        </form>
      </Modal>
    </div>
  );
}
