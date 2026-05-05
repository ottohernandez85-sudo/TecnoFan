import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext.jsx';

/** Rutas que requieren cuenta de cliente (tienda). */
export default function ProtectedRoute({ children }) {
  const { customer, loading } = useCustomerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Cargando…
      </div>
    );
  }

  if (!customer) {
    return <Navigate to="/acceso" state={{ from: location }} replace />;
  }

  return children;
}
