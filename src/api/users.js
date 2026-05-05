import { staffApi } from './client.js';

export async function fetchUsers() {
  const { data } = await staffApi.get('/users');
  return data;
}

export async function updateUserRole(id, role) {
  const { data } = await staffApi.put(`/users/${id}/role`, { role });
  return data;
}
