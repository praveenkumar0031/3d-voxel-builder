import axios from './axios';

export const register = async ({ username, email, password }) => {
  const response = await axios.post('/api/auth/register', { username, email, password });
  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await axios.post('/api/auth/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post('/api/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get('/api/auth/me');
  return response.data;
};

export const refresh = async () => {
  const response = await axios.post('/api/auth/refresh');
  return response.data;
};
