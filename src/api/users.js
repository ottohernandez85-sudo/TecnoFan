import { staffApi } from './client.js';
import { asArray } from '../utils/apiNormalize.js';

export async function fetchUsers() {
  const { data } = await staffApi.get('/users');
  return asArray(data);
}

export async function updateUserRole(id, role) {
  const { data } = await staffApi.put(`/users/${id}/role`, { role });
  return data;
}
