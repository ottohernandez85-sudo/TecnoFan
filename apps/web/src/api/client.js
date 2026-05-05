import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

/** Evita que HTML (404 de proxy / URL mal) llegue como "JSON" y rompa .map en el UI. */
function guardHtmlAsJson(response) {
  const d = response.data;
  if (typeof d === 'string' && d.trimStart().startsWith('<')) {
    console.warn('[api] respuesta HTML en lugar de JSON', response.config?.method, response.config?.url);
    response.data = null;
  }
  return response;
}

function attachGuards(instance) {
  instance.interceptors.response.use(guardHtmlAsJson);
}

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});
attachGuards(api);

export const staffApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});
attachGuards(staffApi);

export const customerApi = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});
attachGuards(customerApi);

export function setStaffToken(token) {
  if (token) {
    staffApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('lula_staff_token', token);
  } else {
    delete staffApi.defaults.headers.common.Authorization;
    localStorage.removeItem('lula_staff_token');
  }
}

export function setCustomerToken(token) {
  if (token) {
    customerApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('lula_customer_token', token);
  } else {
    delete customerApi.defaults.headers.common.Authorization;
    localStorage.removeItem('lula_customer_token');
  }
}

const staffStored = localStorage.getItem('lula_staff_token');
if (staffStored) {
  staffApi.defaults.headers.common.Authorization = `Bearer ${staffStored}`;
}
const customerStored = localStorage.getItem('lula_customer_token');
if (customerStored) {
  customerApi.defaults.headers.common.Authorization = `Bearer ${customerStored}`;
}

const legacy = localStorage.getItem('lula_token');
if (legacy && !staffStored) {
  setStaffToken(legacy);
  localStorage.removeItem('lula_token');
}
