import { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom'; // <-- Agregamos useNavigate aquí

export default function LoginForm() {
  const [mr, setMr] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // <-- Inicializamos el navegador interno

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { mr, password });
      
      // Guardamos el token en la memoria del navegador
      localStorage.setItem('token', response.data.token);
      
      // ¡Acá está la magia! Redirigimos directo al Dashboard
      navigate('/dashboard'); 
    } catch (error) {
      alert('Error: Matrícula o contraseña incorrecta');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <form onSubmit={handleLogin} className="space-y-4 p-8 bg-white rounded-xl shadow-lg w-96 border border-gray-200">
        <h2 className="text-2xl font-bold text-blue-900 text-center mb-6">Acceso al Sistema</h2>
        <input 
          type="text" placeholder="M.R." value={mr}
          onChange={(e) => setMr(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900 outline-none"
        />
        <input 
          type="password" placeholder="Contraseña" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900 outline-none"
        />
        <button type="submit" className="w-full bg-blue-900 text-white font-bold p-3 rounded hover:bg-blue-800 transition-colors">
          Ingresar
        </button>
      </form>
      
      {/* Botón para ir a crear el Cargo */}
      <div className="mt-6">
        <Link to="/registro" className="text-blue-900 hover:underline text-sm font-semibold">
          ¿No tenés sistema asignado? Registrar un Cargo
        </Link>
      </div>
    </div>
  );
}