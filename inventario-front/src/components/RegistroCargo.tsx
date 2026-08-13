import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function RegistroCargo() {
  const [formData, setFormData] = useState({
    nombre_cargo: '',
    jerarquia: '',
    nombre_apellido: '',
    mr: '',
    password: ''
  });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [despertando, setDespertando] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/status').catch(() => {}).finally(() => setDespertando(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      await api.post('/auth/registrar-cargo', formData);
      setMensaje('Cargo y Encargado creados exitosamente.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ocurrió un error al registrar el cargo');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="space-y-4 p-8 bg-superficie rounded-xl shadow-lg w-full border border-borde">

        <div className="text-center mb-6">
          <div className={`text-2xl mb-1 inline-block ${despertando ? 'animate-spin' : ''}`}>⚓</div>
          <h2 className="text-xl font-bold text-primario">Alta de Nuevo Cargo</h2>
          <p className="text-sm text-texto-sec mt-1">Configure el cargo y el encargado</p>
        </div>

        {mensaje && <div className="p-3 bg-activo/10 text-activo border border-activo/30 rounded text-sm text-center font-semibold">{mensaje}</div>}
        {error && <div className="p-3 bg-baja/10 text-baja border border-baja/30 rounded text-sm text-center font-semibold">{error}</div>}

        <input
          type="text" name="nombre_cargo" placeholder="Nombre del Cargo (Ej: Informática)"
          value={formData.nombre_cargo} onChange={handleChange} required
          className="w-full p-2.5 border border-borde rounded focus:ring-2 focus:ring-acento outline-none text-tinta"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text" name="jerarquia" placeholder="Jerarquía"
            value={formData.jerarquia} onChange={handleChange} required
            className="w-full p-2.5 border border-borde rounded focus:ring-2 focus:ring-acento outline-none text-tinta"
          />
          <input
            type="text" name="mr" placeholder="M.R."
            value={formData.mr} onChange={handleChange} required
            className="w-full p-2.5 border border-borde rounded focus:ring-2 focus:ring-acento outline-none text-tinta"
          />
        </div>

        <input
          type="text" name="nombre_apellido" placeholder="Nombre y Apellido"
          value={formData.nombre_apellido} onChange={handleChange} required
          className="w-full p-2.5 border border-borde rounded focus:ring-2 focus:ring-acento outline-none text-tinta"
        />

        <div className="relative">
          <input
            type={mostrarPassword ? 'text' : 'password'} name="password" placeholder="Contraseña de acceso"
            value={formData.password} onChange={handleChange} required
            className="w-full p-2.5 pr-10 border border-borde rounded focus:ring-2 focus:ring-acento outline-none text-tinta"
          />
          <button
            type="button"
            onClick={() => setMostrarPassword(!mostrarPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-texto-sec hover:text-primario cursor-pointer"
          >
            {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <button type="submit" className="w-full bg-primario text-white font-bold p-3 rounded hover:bg-primario-hover transition-colors cursor-pointer">
          Registrar Cargo
        </button>
      </form>

      <div className="mt-4">
        <Link to="/" className="text-acento hover:underline text-sm font-semibold">
          ← Volver al Inicio de Sesión
        </Link>
      </div>
    </div>
  );
}