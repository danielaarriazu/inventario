import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// Este interceptor se ejecuta ANTES de cada petición al backend
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // OJO ACÁ: Asegurate de que tu backend espere "Bearer <token>" 
      // o simplemente el token directo. Lo estándar es Bearer:
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;