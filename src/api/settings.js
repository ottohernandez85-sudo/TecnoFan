import { api, staffApi } from './client.js';
import { sanitizeSiteSettings } from '../utils/apiNormalize.js';

export async function fetchSettings() {
  const { data } = await api.get('/settings');
  return sanitizeSiteSettings(data);
}

export async function updateSettings(body) {
  const { data } = await staffApi.put('/settings', body);
  return sanitizeSiteSettings(data);
}

export async function uploadLogo(file) {
  const form = new FormData();
  form.append('logo', file);
  const { data } = await staffApi.post('/settings/logo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return sanitizeSiteSettings(data);
}

export async function uploadFooterLogo(file) {
  const form = new FormData();
  form.append('logo', file);
  const { data } = await staffApi.post('/settings/footer-logo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return sanitizeSiteSettings(data);
}

export async function uploadHeroSlide(index, file) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await staffApi.post(`/settings/hero-slide/${index}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return sanitizeSiteSettings(data);
}

export async function deleteHeroSlide(index) {
  const { data } = await staffApi.delete(`/settings/hero-slide/${index}`);
  return sanitizeSiteSettings(data);
}
