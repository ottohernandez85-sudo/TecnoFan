import { useEffect, useState } from 'react';
import Button from '../../../components/common/Button/Button.jsx';
import Select from '../../../components/common/Select/Select.jsx';
import {
  fetchAllOrders,
  updateOrderStatus,
  cancelOrder,
  downloadOrderReceipt,
} from '../../../api/orders.js';
import { formatMoney } from '../../../utils/format.js';
import { ORDER_STATUS_LABELS } from '../../../utils/orderStatus.js';
import { confirmAction, notifyError, notifySuccess } from '../../../utils/notify.js';
import styles from './AdminOrders.module.css';

const STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function canCancel(status) {
  return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(status);
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const load = () =>
    fetchAllOrders()
      .then(setOrders)
      .catch(() => setOrders([]));

  useEffect(() => {
    load();
  }, []);

  const onStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      await load();
      notifySuccess('Estado actualizado');
    } catch (e) {
      notifyError('Error al actualizar', e?.response?.data?.error || '');
    }
  };

  const onCancel = async (id) => {
    const ok = await confirmAction({
      title: '¿Cancelar esta orden?',
      text: 'Se restaurará el stock de los productos.',
      icon: 'warning',
      confirmButtonText: 'Sí, cancelar',
    });
    if (!ok) return;
    try {
      await cancelOrder(id);
      await load();
      notifySuccess('Orden cancelada');
    } catch (e) {
      notifyError('Error al cancelar', e?.response?.data?.error || '');
    }
  };

  const onPdf = async (id) => {
    try {
      await downloadOrderReceipt(id, true);
      notifySuccess('PDF descargado');
    } catch (e) {
      notifyError('Error al generar PDF', e?.response?.data?.error || '');
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Órdenes</h1>
      <p className={styles.lead}>Listado, cambio de estado y cancelación (restaura stock).</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>
                  <div className={styles.user}>{o.customer?.name}</div>
                  <div className={styles.email}>{o.customer?.email}</div>
                </td>
                <td className={styles.date}>{new Date(o.createdAt).toLocaleString('es-GT')}</td>
                <td className={styles.total}>{formatMoney(o.total)}</td>
                <td>
                  <Select
                    className={styles.statusSelect}
                    value={o.status}
                    onChange={(e) => onStatus(o.id, e.target.value)}
                    aria-label={`Estado orden ${o.id}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABELS[s] || s}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className={styles.actions}>
                  <Button type="button" variant="secondary" onClick={() => onPdf(o.id)}>
                    PDF
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    disabled={!canCancel(o.status)}
                    onClick={() => onCancel(o.id)}
                  >
                    Cancelar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <p className={styles.empty}>No hay órdenes aún.</p>}
      </div>
    </div>
  );
}
