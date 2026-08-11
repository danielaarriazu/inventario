import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ModalNuevoAuxiliar from '../components/ModalNuevoAuxiliar';
import ModalResetearPassword from '../components/ModalResetearPassword';
import Sidebar from '../components/Sidebar';
import { Users, PlusCircle, Menu as MenuIcon, ShieldAlert, KeyRound } from 'lucide-react';

interface Auxiliar {
  id_usuario: number;
  mr: number | string;
  nombre_apellido: string;
  rol: string;
}

interface Perfil { rol: string; }

export default function Auxiliares() {
  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetObjetivo, setResetObjetivo] = useState<Auxiliar | null>(null);
  const navigate = useNavigate();

  const fetchAuxiliares = async () => {
    try {
      const response = await api.get('/auth/companeros');
      setAuxiliares(response.data);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      } else {
        console.error('Error al obtener los auxiliares', error);
      }
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
    fetchAuxiliares();
    fetchPerfil();
  }, []);

  const esResponsable = perfil?.rol === 'RESPONSABLE';

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
          <h1 className="text-lg font-bold text-white tracking-wide">
            Auxiliares de mi Cargo
          </h1>
        </div>
      </nav>

      {/* Cuerpo Principal */}
      <main className="p-8 max-w-7xl mx-auto mt-4 flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-superficie p-6 rounded-xl border border-borde shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primario flex items-center gap-2">
              <Users className="text-acento w-6 h-6" /> Gestión de Auxiliares
            </h2>
            <p className="text-sm text-texto-sec mt-1">Personal autorizado para operar el control de inventario.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primario hover:bg-primario-hover text-white font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Dar de Alta Auxiliar
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-superficie border border-borde rounded-xl shadow-sm overflow-hidden">
          {auxiliares.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldAlert className="w-10 h-10 text-texto-sec/50 mx-auto mb-4" />
              <p className="text-texto-sec text-sm font-semibold">
                Todavía no hay auxiliares registrados en tu Cargo.
              </p>
              <p className="text-xs text-texto-sec/70 mt-1">Usá "Dar de Alta Auxiliar" para empezar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-fondo border-b border-borde text-texto-sec text-xs tracking-wide uppercase">
                    <th className="p-4 font-bold">M.R.</th>
                    <th className="p-4 font-bold">Nombre y Apellido</th>
                    <th className="p-4 font-bold">Rol</th>
                    {esResponsable && <th className="p-4"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {auxiliares.map((aux) => (
                    <tr key={aux.id_usuario} className="hover:bg-fondo transition-colors">
                      <td className="p-4 font-bold text-primario">
                        {aux.mr}
                      </td>
                      <td className="p-4 text-tinta font-medium">
                        {aux.nombre_apellido}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          aux.rol === 'RESPONSABLE'
                            ? 'bg-champagne/40 text-primario border-champagne'
                            : 'bg-acento/10 text-acento border-acento/30'
                        }`}>
                          {aux.rol}
                        </span>
                      </td>
                      {esResponsable && (
                        <td className="p-4">
                          <button
                            onClick={() => setResetObjetivo(aux)}
                            className="flex items-center gap-1.5 text-acento hover:underline text-xs font-bold cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5" /> Resetear contraseña
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ModalNuevoAuxiliar
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAuxiliarCreado={fetchAuxiliares}
      />

      <ModalResetearPassword
        isOpen={!!resetObjetivo}
        onClose={() => setResetObjetivo(null)}
        idUsuario={resetObjetivo?.id_usuario ?? null}
        nombreUsuario={resetObjetivo?.nombre_apellido}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}