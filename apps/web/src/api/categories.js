import { api, staffApi } from './client.js';
import { asArray } from '../utils/apiNormalize.js';

export async function fetchCategories() {
  const { data } = await api.get('/categories');
  return asArray(data);
}

export async function createCategory(body) {
  const { data } = await staffApi.post('/categories', body);
  return data;
}

export async function updateCategory(id, body) {
  const { data } = await staffApi.put(`/categories/${id}`, body);
  return data;
}

export async function deleteCategory(id) {
  await staffApi.delete(`/categories/${id}`);
}
