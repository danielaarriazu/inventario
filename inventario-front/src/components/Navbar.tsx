import { useEffect, useState } from 'react';
import { Menu as MenuIcon, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import Sidebar from './Sidebar';

interface Perfil { nombre_apellido: string; mr: string; }

interface NavbarProps {
  titulo: string;
  onBack?: () => void; // si se pasa, muestra la flecha de volver antes del menú
  rightContent?: React.ReactNode; // reemplaza el chip de usuario por defecto (ej: Imprimir/Editar en la Ficha)
}

// Navbar único para toda la app — mismo alto, mismo estilo, mismo menú
// lateral en todos lados. Por defecto muestra el nombre/MR del usuario
// logueado a la derecha; se puede reemplazar con rightContent para
// pantallas que necesitan otras acciones ahí (como la Ficha de equipo).
export default function Navbar({ titulo, onBack, rightContent }: NavbarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  useEffect(() => {
    api.get('/auth/me').then(res => setPerfil(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <nav className="bg-primario p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white tracking-wide">{titulo}</h1>
        </div>

        <div className="flex items-center gap-2">
          {rightContent ?? (
            perfil && (
              <div className="hidden sm:block bg-white/10 px-3 py-1.5 rounded-md text-xs text-white/90 font-semibold">
                {perfil.nombre_apellido} · MR {perfil.mr}
              </div>
            )
          )}
        </div>
      </nav>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}