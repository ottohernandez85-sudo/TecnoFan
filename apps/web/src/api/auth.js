import { staffApi, setStaffToken } from './client.js';

export async function login(data) {
  const { data: res } = await staffApi.post('/auth/login', data);
  setStaffToken(res.token);
  return res;
}

export function logout() {
  setStaffToken(null);
}

export async function fetchMe() {
  const { data } = await staffApi.get('/auth/me');
  return data;
}
