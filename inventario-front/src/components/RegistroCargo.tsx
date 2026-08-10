import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function RegistroCargo() {
  const [formData, setFormData] = useState({
    nombre_cargo: '',
    jerarquia: '',
    nombre_apellido: '',
    mr: '',
    password: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    
    try {
      await api.post('/auth/registrar-cargo', formData);
      setMensaje('Cargo y Responsable creados exitosamente.');
      // Esperamos 2 segundos y lo mandamos a la pantalla de Login
      setTimeout(() => navigate('/'), 2000); 
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ocurrió un error al registrar el cargo');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="space-y-4 p-8 bg-white rounded-xl shadow-lg w-full border border-gray-200">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">Alta de Nuevo Cargo</h2>
          <p className="text-sm text-gray-500 mt-1">Configure el cargo y el responsable</p>
        </div>

        {mensaje && <div className="p-3 bg-green-100 text-green-800 rounded text-sm text-center font-semibold">{mensaje}</div>}
        {error && <div className="p-3 bg-red-100 text-red-800 rounded text-sm text-center font-semibold">{error}</div>}

        <input 
          type="text" name="nombre_cargo" placeholder="Nombre del Cargo (Ej: Informática Central)" 
          value={formData.nombre_cargo} onChange={handleChange} required
          className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900 outline-none"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" name="jerarquia" placeholder="Jerarquía" 
            value={formData.jerarquia} onChange={handleChange} required
            className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900 outline-none"
          />
          <input 
            type="text" name="mr" placeholder="M.R." 
            value={formData.mr} onChange={handleChange} required
            className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900 outline-none"
          />
        </div>

        <input 
          type="text" name="nombre_apellido" placeholder="Nombre y Apellido" 
          value={formData.nombre_apellido} onChange={handleChange} required
          className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900 outline-none"
        />

        <input 
          type="password" name="password" placeholder="Contraseña de acceso" 
          value={formData.password} onChange={handleChange} required
          className="w-full p-2.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900 outline-none"
        />

        <button type="submit" className="w-full bg-blue-900 text-white font-bold p-3 rounded hover:bg-blue-800 transition-colors">
          Registrar Cargo
        </button>
      </form>
      
      <div className="mt-4">
        <Link to="/" className="text-blue-900 hover:underline text-sm font-semibold">
          ← Volver al Inicio de Sesión
        </Link>
      </div>
    </div>
  );
}