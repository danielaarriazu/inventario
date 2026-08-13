import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Settings, Package } from 'lucide-react';

export default function Menu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <Navbar titulo="Menú Principal" />

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
      </div>
    </div>
  );
}