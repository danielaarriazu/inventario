import { useNavigate, useLocation } from 'react-router-dom';
import { X, Home, LayoutDashboard, Monitor, Users, Wrench, LogOut } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const ITEMS = [
  { path: '/menu', label: 'Menú Principal', icon: Home },
  { path: '/dashboard', label: 'Administrar (Destinos)', icon: LayoutDashboard },
  { path: '/dashboard/equipos', label: 'Equipos', icon: Monitor },
  { path: '/dashboard/auxiliares', label: 'Auxiliares', icon: Users },
  { path: '/movimientos', label: 'Movimientos', icon: Wrench },
];

// Drawer lateral con acceso directo a todas las secciones — se abre desde
// el botón de hamburguesa en la barra superior de cada pantalla principal
export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

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
          {ITEMS.map(item => {
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
    </>
  );
}