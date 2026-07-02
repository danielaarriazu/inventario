import axios from 'axios';

// Creamos la conexión base apuntando a tu backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// "El Patovica del Frontend": Antes de enviar cualquier petición, 
// busca el token que guardaste al hacer Login y lo adjunta.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;