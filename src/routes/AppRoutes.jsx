import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout/PublicLayout.jsx';
import AdminLayout from '../components/layout/AdminLayout/AdminLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import AdminRoute from './AdminRoute.jsx';

import Home from '../pages/Home/Home.jsx';
import Catalog from '../pages/Catalog/Catalog.jsx';
import ProductDetail from '../pages/ProductDetail/ProductDetail.jsx';
import Cart from '../pages/Cart/Cart.jsx';
import Checkout from '../pages/Checkout/Checkout.jsx';
import Support from '../pages/Support/Support.jsx';
import OrderSuccess from '../pages/OrderSuccess/OrderSuccess.jsx';
import ClientAccess from '../pages/ClientAccess/ClientAccess.jsx';
import StaffLogin from '../pages/StaffLogin/StaffLogin.jsx';

import AdminDashboard from '../pages/admin/AdminDashboard/AdminDashboard.jsx';
import AdminProducts from '../pages/admin/AdminProducts/AdminProducts.jsx';
import AdminCategories from '../pages/admin/AdminCategories/AdminCategories.jsx';
import AdminUsers from '../pages/admin/AdminUsers/AdminUsers.jsx';
import AdminTheme from '../pages/admin/AdminTheme/AdminTheme.jsx';
import AdminOrders from '../pages/admin/AdminOrders/AdminOrders.jsx';
import AdminCustomers from '../pages/admin/AdminCustomers/AdminCustomers.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/support" element={<Support />} />
        <Route path="/acceso" element={<ClientAccess />} />
        <Route path="/login" element={<Navigate to="/acceso" replace />} />
        <Route path="/register" element={<Navigate to="/acceso" replace />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/staff/login" element={<StaffLogin />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="theme" element={<AdminTheme />} />
      </Route>
    </Routes>
  );
}
