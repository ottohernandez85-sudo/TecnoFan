import { staffApi } from './client.js';
import { asArray } from '../utils/apiNormalize.js';

export async function fetchCustomers() {
  const { data } = await staffApi.get('/customers');
  return asArray(data);
}

export async function createCustomer(body) {
  const { data } = await staffApi.post('/customers', body);
  return data;
}

export async function updateCustomer(id, body) {
  const { data } = await staffApi.put(`/customers/${id}`, body);
  return data;
}

export async function deleteCustomer(id) {
  await staffApi.delete(`/customers/${id}`);
}
