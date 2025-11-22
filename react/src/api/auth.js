import instance from './axios';

export async function register({ username, password }) {
  const response = await instance.post('/api/auth/register/', {
    username,
    password,
  });
  return response.data;
}

export async function login({ username, password }) {
  const response = await instance.post('/api/auth/login/', {
    username,
    password,
  });
  return response.data;
}

export async function logout() {
  const response = await instance.post('/api/auth/logout/');
  return response.data;
}

export async function getCurrentUser() {
  const response = await instance.get('/api/auth/me/');
  return response.data;
}
