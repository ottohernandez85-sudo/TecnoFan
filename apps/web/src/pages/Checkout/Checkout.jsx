import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input/Input.jsx';
import Select from '../../components/common/Select/Select.jsx';
import Button from '../../components/common/Button/Button.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { createOrder } from '../../api/orders.js';
import { formatMoney } from '../../utils/format.js';
import { mediaUrl } from '../../utils/mediaUrl.js';
import styles from './Checkout.module.css';

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [payment, setPayment] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    deliveryName: '',
    deliveryPhone: '',
    deliveryAddress: '',
    deliveryCity: 'Guatemala',
    deliveryNit: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  if (!items.length) {
    return <Navigate to="/cart" replace />;
  }

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const paymentMethod =
        payment === 'card'
          ? 'Credit or Debit Card'
          : payment === 'visa'
            ? 'Visa en Cuotas'
            : 'Bank Transfer';

      const order = await createOrder({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryName: form.deliveryName,
        deliveryPhone: form.deliveryPhone,
        deliveryAddress: form.deliveryAddress,
        deliveryCity: form.deliveryCity,
        deliveryNit: form.deliveryNit || null,
        paymentMethod,
      });
      clear();
      navigate('/order-success', { replace: true, state: { orderId: order.id } });
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo completar la orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1>Finalizar tu pedido</h1>
      <p className={styles.sub}>Completa tu compra con pago local simulado (sin pasarela real).</p>

      <div className={styles.grid}>
        <form className={styles.forms} onSubmit={submit}>
          <section className={styles.card}>
            <h2>
              <span className={styles.icon}>🚚</span> Entrega
            </h2>
            <div className={styles.two}>
              <Input label="Nombre completo" name="deliveryName" required value={form.deliveryName} onChange={onChange} />
              <Input label="Teléfono" name="deliveryPhone" required value={form.deliveryPhone} onChange={onChange} />
            </div>
            <Input label="Dirección" name="deliveryAddress" required value={form.deliveryAddress} onChange={onChange} />
            <div className={styles.two}>
              <Select label="Ciudad / Departamento" name="deliveryCity" value={form.deliveryCity} onChange={onChange}>
                <option>Guatemala</option>
                <option>Quetzaltenango</option>
                <option>Escuintla</option>
                <option>Petén</option>
              </Select>
              <Input label="NIT (opcional)" name="deliveryNit" value={form.deliveryNit} onChange={onChange} />
            </div>
          </section>

          <section className={styles.card}>
            <h2>
              <span className={styles.icon}>💳</span> Método de pago
            </h2>
            <label className={styles.radio}>
              <input type="radio" name="pay" checked={payment === 'card'} onChange={() => setPayment('card')} />
              Tarjeta de crédito o débito
            </label>
            <label className={styles.radio}>
              <input type="radio" name="pay" checked={payment === 'visa'} onChange={() => setPayment('visa')} />
              Visa en cuotas
            </label>
            <label className={styles.radio}>
              <input type="radio" name="pay" checked={payment === 'transfer'} onChange={() => setPayment('transfer')} />
              Transferencia bancaria
            </label>

            {payment === 'card' && (
              <div className={styles.cardFields}>
                <Input label="Número de tarjeta" name="cardNumber" value={form.cardNumber} onChange={onChange} />
                <div className={styles.two}>
                  <Input label="Vencimiento (MM/AA)" name="cardExpiry" value={form.cardExpiry} onChange={onChange} />
                  <Input label="CVC" name="cardCvc" value={form.cardCvc} onChange={onChange} />
                </div>
              </div>
            )}
          </section>

          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Procesando…' : 'Confirmar compra'}
          </Button>
        </form>

        <aside className={styles.side}>
          <div className={styles.card}>
            <h2>Resumen del carrito</h2>
            <ul className={styles.lines}>
              {items.map((line) => (
                <li key={line.product.id} className={styles.line}>
                  <img src={mediaUrl(line.product.imageUrl)} alt="" className={styles.thumb} />
                  <div>
                    <div className={styles.pname}>{line.product.name}</div>
                    <div className={styles.pqty}>Cantidad: {line.quantity}</div>
                  </div>
                  <div className={styles.pprice}>
                    {formatMoney(Number(line.product.price) * line.quantity)}
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.sumRow}>
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className={styles.sumRow}>
              <span>Envío</span>
              <span className={styles.free}>GRATIS</span>
            </div>
            <div className={`${styles.sumRow} ${styles.total}`}>
              <span>Total</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <p className={styles.ssl}>🔒 Transacción simulada segura (SSL en producción)</p>
          </div>
          <div className={styles.help}>
            <strong>¿Necesitas ayuda?</strong>
            <p>WhatsApp: +502 3000-0000</p>
            <Link to="/support">Centro de soporte</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
