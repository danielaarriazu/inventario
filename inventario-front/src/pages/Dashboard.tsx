import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ModalNuevoDestino from '../components/ModalNuevoDestino';
import { Shield, PlusCircle, Users, LogOut, LayoutDashboard, Menu as MenuIcon, Monitor } from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface Destino {
  id_destino: number;
  cod_destino: number;
  nombre_destino: string;
}

interface Perfil {
  nombre_apellido: string;
  mr: string;
  rol: string;
}

export default function Dashboard() {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDestinos = async () => {
    setCargando(true);
    try {
      const response = await api.get('/destinos');
      setDestinos(response.data);
    } catch (error: any) {
      // Solo te saca al login si la sesión realmente venció o es inválida
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      } else {
        console.error('Error al obtener los destinos', error);
      }
    } finally {
      setCargando(false);
    }
  };

  const fetchPerfil = async () => {
    try {
      const response = await api.get('/auth/me');
      setPerfil(response.data);
    } catch (error) {
      console.error('Error al obtener el perfil', error);
    }
  };

  useEffect(() => {
    fetchDestinos();
    fetchPerfil();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      {/* Navbar */}
      <nav className="bg-primario p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
         
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">
              Sistema de Inventario
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {perfil && (
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md text-xs text-white/90 font-semibold">
              {perfil.nombre_apellido} · MR {perfil.mr}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-baja/20 hover:bg-baja/30 text-white border border-baja/40 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </nav>

      {/* Cuerpo Principal */}
      <main className="p-8 max-w-7xl mx-auto mt-4 flex-grow w-full">
        {/* Encabezado y Botonera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-superficie p-6 rounded-xl border border-borde shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primario flex items-center gap-2">
              <LayoutDashboard className="text-acento w-6 h-6" /> Destinos de mi Cargo
            </h2>
            <p className="text-sm text-texto-sec mt-1">Administración de la estructura del inventario.</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/dashboard/equipos')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-superficie hover:bg-fondo text-acento border border-acento/40 font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
            >
              <Monitor className="w-4 h-4" /> Ver Equipos
            </button>
            {perfil?.rol === 'RESPONSABLE' && (
              <button
                onClick={() => navigate('/dashboard/auxiliares')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-superficie hover:bg-fondo text-acento border border-acento/40 font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
              >
                <Users className="w-4 h-4" /> Ver Auxiliares
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-primario hover:bg-primario-hover text-white font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
            >
              <PlusCircle className="w-4 h-4" /> Nuevo Destino
            </button>
          </div>
        </div>

        {/* Grilla de Destinos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cargando ? (
            <div className="col-span-full bg-superficie p-10 rounded-xl border border-borde text-center text-texto-sec text-sm font-medium">
              Cargando destinos...
            </div>
          ) : destinos.length === 0 ? (
            <div className="col-span-full bg-superficie p-10 rounded-xl border-2 border-dashed border-borde text-center">
              <div className="w-12 h-12 bg-fondo text-texto-sec rounded-full flex items-center justify-center mx-auto mb-4 border border-borde">⚓</div>
              <p className="text-texto-sec font-medium text-sm">
                Todavía no hay destinos cargados en este Cargo.
              </p>
              <p className="text-xs text-texto-sec/70 mt-1">Usá "Nuevo Destino" para empezar.</p>
            </div>
          ) : (
            destinos.map(destino => (
              <div
                key={destino.id_destino}
                onClick={() => navigate(`/dashboard/destinos/${destino.id_destino}/departamentos`, {
                  state: { nombreDestino: destino.nombre_destino }
                })}
                className="group bg-superficie p-6 rounded-xl border border-borde hover:border-acento/50 shadow-sm transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-primario group-hover:text-acento transition-colors">
                    {destino.nombre_destino}
                  </h3>
                </div>

                <p className="text-xs text-texto-sec mt-2 bg-fondo p-2.5 rounded border border-borde">
                  Código interno: <span className="font-bold text-tinta">{destino.cod_destino}</span>
                </p>

                <div className="mt-5 pt-4 border-t border-borde flex justify-end items-center text-xs font-bold text-acento">
                  <span>Ver Departamentos</span>
                  <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <ModalNuevoDestino
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDestinoCreado={fetchDestinos}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}