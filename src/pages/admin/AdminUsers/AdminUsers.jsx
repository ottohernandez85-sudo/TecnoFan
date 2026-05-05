import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Select from '../../../components/common/Select/Select.jsx';
import { fetchUsers, updateUserRole } from '../../../api/users.js';
import { useAuth } from '../../../context/AuthContext.jsx';
import { notifyError, notifySuccess } from '../../../utils/notify.js';
import styles from './AdminUsers.module.css';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [list, setList] = useState([]);

  const load = () => fetchUsers().then(setList).catch(() => setList([]));

  useEffect(() => {
    load();
  }, []);

  if (me?.role !== 'ADMIN') {
    return <Navigate to="/admin/orders" replace />;
  }

  const changeRole = async (id, role) => {
    try {
      await updateUserRole(id, role);
      load();
      notifySuccess('Rol actualizado');
    } catch (err) {
      notifyError('Error', err?.response?.data?.error || 'No se pudo cambiar el rol');
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Usuarios</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <Select
                  className={styles.roleSelect}
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  aria-label={`Rol de ${u.email}`}
                >
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </Select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.note}>Usuario actual: {me?.email}</p>
    </div>
  );
}
