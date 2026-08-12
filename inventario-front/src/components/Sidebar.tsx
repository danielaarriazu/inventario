import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { X, Home, LayoutDashboard, Monitor, Users, Wrench, LogOut, KeyRound, FileText } from 'lucide-react';
import ModalCambiarPassword from './ModalCambiarPassword';
import ModalEncabezado from './ModalEncabezado';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const ITEMS_BASE = [
  { path: '/menu', label: 'Menú Principal', icon: Home },
  { path: '/dashboard', label: 'Administrar (Destinos)', icon: LayoutDashboard },
  { path: '/dashboard/equipos', label: 'Equipos', icon: Monitor },
  { path: '/movimientos', label: 'Movimientos', icon: Wrench },
];
const ITEM_AUXILIARES = { path: '/dashboard/auxiliares', label: 'Auxiliares', icon: Users };

// Drawer lateral con acceso directo a todas las secciones — se abre desde
// el botón de hamburguesa en la barra superior de cada pantalla principal
export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [encabezadoModalOpen, setEncabezadoModalOpen] = useState(false);
  const [esResponsable, setEsResponsable] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(res => setEsResponsable(res.data.rol === 'RESPONSABLE')).catch(() => {});
  }, []);

  const items = esResponsable
    ? [...ITEMS_BASE.slice(0, 3), ITEM_AUXILIARES, ITEMS_BASE[3]]
    : ITEMS_BASE;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const ir = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-primario/40 backdrop-blur-sm z-40 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-superficie z-50 shadow-xl transform transition-transform duration-200 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="bg-primario p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <span className="text-lg">⚓</span> Sistema de Inventario
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-grow overflow-y-auto">
          {items.map(item => {
            const activo = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => ir(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activo ? 'bg-primario text-white' : 'text-tinta hover:bg-fondo'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-borde">
            <button
              onClick={() => setPasswordModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-tinta hover:bg-fondo transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              Cambiar mi contraseña
            </button>

            {esResponsable && (
              <button
                onClick={() => setEncabezadoModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-tinta hover:bg-fondo transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                Encabezado de planillas
              </button>
            )}
          </div>
        </nav>

        <div className="p-3 border-t border-borde flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-baja hover:bg-baja/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <ModalCambiarPassword isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
      <ModalEncabezado isOpen={encabezadoModalOpen} onClose={() => setEncabezadoModalOpen(false)} />
    </>
  );
}