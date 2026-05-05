import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchMe,
  login as apiCustomerLogin,
  register as apiCustomerRegister,
  logout as apiCustomerLogout,
} from '../api/customer-auth.js';
import { setCustomerToken } from '../api/client.js';

const CustomerAuthContext = createContext(null);

/** Cliente de tienda (checkout, pedidos). */
export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('lula_customer_token');
    if (!token) {
      setCustomer(null);
      setLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      setCustomer(me);
    } catch {
      setCustomerToken(null);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (credentials) => {
    const res = await apiCustomerLogin(credentials);
    setCustomer(res.customer);
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await apiCustomerRegister(data);
    setCustomer(res.customer);
    return res;
  }, []);

  const logout = useCallback(() => {
    apiCustomerLogout();
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({
      customer,
      loading,
      login,
      register,
      logout,
      refresh,
    }),
    [customer, loading, login, register, logout, refresh],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth debe usarse dentro de CustomerAuthProvider');
  return ctx;
}
