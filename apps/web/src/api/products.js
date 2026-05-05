import { api, staffApi } from './client.js';

export async function fetchProducts(params) {
  const { data } = await api.get('/products', { params });
  return data;
}

export async function fetchProductBySlug(slug) {
  const { data } = await api.get(`/products/slug/${slug}`);
  return data;
}

export async function createProduct(body) {
  const { data } = await staffApi.post('/products', body);
  return data;
}

export async function updateProduct(id, body) {
  const { data } = await staffApi.put(`/products/${id}`, body);
  return data;
}

export async function deleteProduct(id) {
  await staffApi.delete(`/products/${id}`);
}

export async function uploadProductImage(id, file) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await staffApi.post(`/products/${id}/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
