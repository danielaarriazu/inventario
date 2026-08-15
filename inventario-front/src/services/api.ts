import axios from 'axios';

const api = axios.create({
  // En producción, front y back viven en el mismo servicio (mismo origen),
  // así que /api alcanza. Para desarrollo local con los dos por separado,
  // definí VITE_API_URL=http://localhost:3000/api en un .env del frontend.
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Este interceptor se ejecuta ANTES de cada petición al backend
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;