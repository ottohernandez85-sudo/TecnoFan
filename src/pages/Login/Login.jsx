import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/common/Input/Input.jsx';
import Button from '../../components/common/Button/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './Login.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
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

  return (
    <div className={styles.wrap}>
      <h1>Ingresar</h1>
      <form className={styles.form} onSubmit={onSubmit}>
        <Input label="Correo" type="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
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
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
      <p className={styles.footer}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
      <p className={styles.hint}>
        Admin demo: <code>admin@lula.dev</code> / <code>admin123</code>
      </p>
    </div>
  );
}
