import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Input from '../../../components/common/Input/Input.jsx';
import Button from '../../../components/common/Button/Button.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { fetchCustomers, createCustomer, deleteCustomer } from '../../../api/customers.js';
import { confirmAction, notifyError, notifySuccess } from '../../../utils/notify.js';
import styles from './AdminCustomers.module.css';

const emptyForm = {
  email: '',
  password: '',
  name: '',
  phone: '',
};

export default function AdminCustomers() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => fetchCustomers().then(setList).catch(() => setList([]));

  useEffect(() => {
    load();
  }, []);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/admin/orders" replace />;
  }

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCustomer({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone || null,
      });
      setForm(emptyForm);
      await load();
      notifySuccess('Cliente creado');
    } catch (err) {
      notifyError('Error', err?.response?.data?.error || 'No se pudo crear');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    const ok = await confirmAction({
      title: '¿Eliminar cliente?',
      text: 'Solo si no necesitas conservar el historial asociado.',
      icon: 'warning',
      confirmButtonText: 'Sí, eliminar',
    });
    if (!ok) return;
    try {
      await deleteCustomer(id);
      await load();
      notifySuccess('Cliente eliminado');
    } catch (err) {
      notifyError('Error', err?.response?.data?.error || 'No se pudo eliminar');
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Clientes (tienda)</h1>
      <p className={styles.lead}>
        Cuentas que compran en el sitio. El cliente también puede registrarse desde «Acceso cliente».
      </p>

      <section className={styles.card}>
        <h2 className={styles.h2}>Nuevo cliente</h2>
        <form className={styles.form} onSubmit={onCreate}>
          <div className={styles.row}>
            <Input label="Nombre" name="name" required value={form.name} onChange={onChange} />
            <Input label="Correo" name="email" type="email" required value={form.email} onChange={onChange} />
          </div>
          <div className={styles.row}>
            <Input
              label="Contraseña inicial"
              name="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={onChange}
            />
            <Input label="Teléfono (opcional)" name="phone" value={form.phone} onChange={onChange} />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Crear cliente'}
          </Button>
        </form>
      </section>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Pedidos</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone || '—'}</td>
              <td>{c._count?.orders ?? 0}</td>
              <td>
                <Button type="button" variant="danger" onClick={() => onDelete(c.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && <p className={styles.empty}>No hay clientes registrados.</p>}
    </div>
  );
}
