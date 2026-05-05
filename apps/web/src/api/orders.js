import { customerApi, staffApi } from './client.js';

export async function createOrder(body) {
  const { data } = await customerApi.post('/orders', body);
  return data;
}

export async function fetchMyOrders() {
  const { data } = await customerApi.get('/orders/mine');
  return data;
}

export async function fetchAllOrders() {
  const { data } = await staffApi.get('/orders');
  return data;
}

export async function fetchOrderById(id) {
  const { data } = await customerApi.get(`/orders/${id}`);
  return data;
}

export async function fetchOrderByIdStaff(id) {
  const { data } = await staffApi.get(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await staffApi.patch(`/orders/${id}`, { status });
  return data;
}

export async function cancelOrder(id) {
  const { data } = await staffApi.post(`/orders/${id}/cancel`);
  return data;
}

export async function downloadOrderReceipt(id, useStaff = false) {
  const client = useStaff ? staffApi : customerApi;
  const res = await client.get(`/orders/${id}/receipt`, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ticket-${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
