import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Settings, Package, LogOut } from 'lucide-react';

interface Perfil {
  nombre_apellido: string;
  mr: string;
}

export default function Menu() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await api.get('/auth/me');
        setPerfil(response.data);
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/');
        }
      }
    };
    fetchPerfil();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <div className="bg-primario p-6 text-white">
        <div className="text-xs opacity-75">Hola,</div>
        <div className="text-lg font-bold mt-0.5">
          {perfil ? `${perfil.nombre_apellido} · MR ${perfil.mr}` : '...'}
        </div>
      </div>

      <div className="flex-grow flex flex-col gap-4 p-6 max-w-md w-full mx-auto justify-center">
        <button
          onClick={() => navigate('/movimientos')}
          className="bg-acento hover:brightness-95 text-white rounded-2xl p-8 flex flex-col items-center gap-2 text-center transition-all cursor-pointer shadow-sm"
        >
          <Package className="w-9 h-9" />
          <div className="font-bold text-lg">Movimientos</div>
          <div className="text-xs text-white/85">Trabajo diario — trasladar, reparar o dar de baja un equipo</div>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="bg-superficie border border-borde hover:border-acento/50 rounded-2xl p-8 flex flex-col items-center gap-2 text-center transition-colors cursor-pointer shadow-sm"
        >
          <Settings className="w-9 h-9 text-primario" />
          <div className="font-bold text-lg text-primario">Administrar</div>
          <div className="text-xs text-texto-sec">Historiales, métricas y estructura del inventario</div>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 text-texto-sec text-sm font-semibold mt-4 cursor-pointer hover:text-baja transition-colors"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}