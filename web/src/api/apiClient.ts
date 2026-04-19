import axios from 'axios';

// Resolve base URL and aggressively avoid double /api
let baseApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8080';
if (baseApiUrl.endsWith('/api/')) {
  baseApiUrl = baseApiUrl.slice(0, -5);
} else if (baseApiUrl.endsWith('/api')) {
  baseApiUrl = baseApiUrl.slice(0, -4);
}

const apiClient = axios.create({
  baseURL: baseApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404 && error.config?.url?.includes('/stats')) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const isLoginRequest = typeof error.config?.url === 'string' && error.config.url.includes('/api/auth/login');
      const isAlreadyOnLoginPage = window.location.pathname === '/login';
      if (!isLoginRequest && !isAlreadyOnLoginPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
