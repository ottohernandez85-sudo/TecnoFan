import { customerApi, setCustomerToken } from './client.js';

export async function register(data) {
  const { data: res } = await customerApi.post('/customer-auth/register', data);
  setCustomerToken(res.token);
  return res;
}

export async function login(data) {
  const { data: res } = await customerApi.post('/customer-auth/login', data);
  setCustomerToken(res.token);
  return res;
}

export function logout() {
  setCustomerToken(null);
}

export async function fetchMe() {
  const { data } = await customerApi.get('/customer-auth/me');
  return data;
}
