import axios from 'axios';

const BASE = process.env.REACT_APP_API_HOST;

// Admin API — attaches admin token automatically
const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      ['token', 'role', 'business', 'businessName'].forEach(k => localStorage.removeItem(k));
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// User API — attaches end-user token (used in PlaceOrder flow)
export const userApi = axios.create({ baseURL: BASE });

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
