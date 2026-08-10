import { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [mr, setMr] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { mr, password });
      localStorage.setItem('token', response.data.token);
      navigate('/menu');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Matrícula o contraseña incorrecta');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <form onSubmit={handleLogin} className="space-y-4 p-8 bg-superficie rounded-xl shadow-lg w-96 border border-borde">
        <div className="text-center mb-6">
          <div className="text-2xl mb-1">⚓</div>
          <h2 className="text-xl font-bold text-primario">Sistema de Inventario Patrimonial</h2>
        </div>

        {error && (
          <div className="p-3 bg-baja/10 text-baja border border-baja/30 rounded text-sm text-center font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">M.R.</label>
          <input
            type="text" placeholder="4021" value={mr}
            onChange={(e) => setMr(e.target.value)}
            className="w-full mt-1 p-2.5 border border-borde rounded focus:ring-2 focus:ring-acento outline-none text-tinta"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Contraseña</label>
          <div className="relative mt-1">
            <input
              type={mostrarPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>
        <button type="submit" className="w-full bg-primario text-white font-bold p-3 rounded hover:bg-primario-hover transition-colors cursor-pointer">
          Ingresar
        </button>
      </form>

      <div className="mt-6">
        <Link to="/registro" className="text-acento hover:underline text-sm font-semibold">
          ¿No tenés sistema asignado? Registrar un Cargo
        </Link>
      </div>
    </div>
  );
}