import { useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/common/Input/Input.jsx';
import Button from '../../components/common/Button/Button.jsx';
import Modal from '../../components/common/Modal/Modal.jsx';
import { useCustomerAuth } from '../../context/CustomerAuthContext.jsx';
import styles from './ClientAccess.module.css';

export default function ClientAccess() {
  const { login, register, customer, loading: authLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState(null);
  const [regLoading, setRegLoading] = useState(false);

  if (authLoading) {
    return (
      <div className={styles.wrap}>
        <p>Cargando…</p>
      </div>
    );
  }

  if (customer) {
    return <Navigate to={from} replace />;
  }

  const onLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const openRegister = () => {
    setRegError(null);
    setRegEmail(email);
    setModalOpen(true);
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegLoading(true);
    try {
      await register({
        email: regEmail,
        password: regPassword,
        name: regName,
        phone: regPhone || null,
      });
      setModalOpen(false);
      navigate(from, { replace: true });
    } catch (err) {
      setRegError(err?.response?.data?.error || 'No se pudo crear la cuenta');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <h1>Acceso cliente</h1>
      <p className={styles.lead}>
        Inicia sesión para finalizar compras y ver tus pedidos. Si aún no tienes cuenta, créala en un paso.
      </p>

      <form className={styles.form} onSubmit={onLogin}>
        <Input
          label="Correo"
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className={styles.error}>{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar a la tienda'}
        </Button>
      </form>

      <p className={styles.footer}>
        ¿No tienes cuenta?{' '}
        <button type="button" className={styles.linkBtn} onClick={openRegister}>
          Crear cuenta de cliente
        </button>
      </p>

      <p className={styles.staff}>
        ¿Eres del personal (backoffice)?{' '}
        <Link to="/staff/login">Ingreso personal</Link>
      </p>

      <p className={styles.hint}>
        Demo tienda: <code>cliente@lula.dev</code> / <code>cliente123</code>
      </p>

      <Modal open={modalOpen} title="Crear cuenta de cliente" onClose={() => setModalOpen(false)}>
        <form className={styles.form} onSubmit={onRegister}>
          <Input label="Nombre completo" required value={regName} onChange={(e) => setRegName(e.target.value)} />
          <Input
            label="Correo"
            type="email"
            required
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
          />
          <Input
            label="Contraseña (mín. 6 caracteres)"
            type="password"
            required
            minLength={6}
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
          />
          <Input label="Teléfono (opcional)" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
          {regError && <p className={styles.error}>{regError}</p>}
          <div className={styles.modalActions}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={regLoading}>
              {regLoading ? 'Creando…' : 'Crear cuenta'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
