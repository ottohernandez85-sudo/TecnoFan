import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/common/Button/Button.jsx';
import { fetchOrderById, downloadOrderReceipt } from '../../api/orders.js';
import { formatMoney } from '../../utils/format.js';
import { orderStatusLabel } from '../../utils/orderStatus.js';
import styles from './OrderSuccess.module.css';

export default function OrderSuccess() {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    fetchOrderById(orderId)
      .then(setOrder)
      .catch(() => setErr('No se pudo cargar la orden'));
  }, [orderId]);

  const onPdf = async () => {
    if (!orderId) return;
    try {
      await downloadOrderReceipt(orderId);
    } catch {
      setErr('No se pudo descargar el PDF');
    }
  };

  return (
    <div className={styles.wrap}>
      <h1>¡Pedido confirmado!</h1>
      <p>Gracias por tu compra. Puedes descargar tu comprobante en PDF.</p>

      {order && (
        <div className={styles.summary}>
          <div>
            <strong>Orden #{order.id}</strong>
          </div>
          <div>Total: {formatMoney(order.total)}</div>
          <div>Estado: {orderStatusLabel(order.status)}</div>
        </div>
      )}

      {err && <p className={styles.err}>{err}</p>}

      <div className={styles.actions}>
        {orderId && (
          <Button type="button" onClick={onPdf}>
            Descargar ticket PDF
          </Button>
        )}
        <Link to="/catalog">
          <Button variant="secondary">Seguir comprando</Button>
        </Link>
        <Link to="/">
          <Button variant="secondary">Inicio</Button>
        </Link>
      </div>

      {!orderId && (
        <p className={styles.hint}>
          Si llegaste aquí sin completar un pedido, visita el{' '}
          <Link to="/catalog">catálogo</Link>.
        </p>
      )}
    </div>
  );
}
