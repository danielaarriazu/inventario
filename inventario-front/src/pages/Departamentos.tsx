import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import ModalNuevoDepartamento from '../components/ModalNuevoDepartamento';
import Sidebar from '../components/Sidebar';
import { Building2, PlusCircle, ArrowLeft, Search, Menu as MenuIcon } from 'lucide-react';

interface Departamento {
  id_departamento: number;
  nombre_departamento: string;
  abreviatura: string;
}
interface Perfil { nombre_apellido: string; mr: string; }

export default function Departamentos() {
  const { idDestino } = useParams();
  const location = useLocation();
  const nombreDestino = (location.state as { nombreDestino?: string })?.nombreDestino || 'Destino';

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me').then(res => setPerfil(res.data)).catch(() => {});
  }, []);

  const fetchDepartamentos = async () => {
    setCargando(true);
    try {
      const response = await api.get(`/departamentos?id_destino=${idDestino}`);
      setDepartamentos(response.data);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      } else {
        console.error('Error al obtener los departamentos', error);
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, [idDestino]);

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <nav className="bg-primario p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setSidebarOpen(true)} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer">
            <MenuIcon className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white tracking-wide">
            Sistema de Inventario
          </h1>
        </div>
        {perfil && (
          <div className="hidden sm:block bg-white/10 px-3 py-1.5 rounded-md text-xs text-white/90 font-semibold">
            {perfil.nombre_apellido} · MR {perfil.mr}
          </div>
        )}
      </nav>

      <main className="p-8 max-w-7xl mx-auto mt-4 flex-grow w-full">
        <div className="text-sm text-texto-sec mb-4">
          <span className="font-bold text-primario">{nombreDestino}</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-superficie p-6 rounded-xl border border-borde shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primario flex items-center gap-2">
              <Building2 className="text-acento w-6 h-6" /> Departamentos de {nombreDestino}
            </h2>
            <p className="text-sm text-texto-sec mt-1">Estructura interna del destino.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primario hover:bg-primario-hover text-white font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Nuevo Departamento
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 text-texto-sec absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar departamento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-borde rounded-lg text-sm bg-superficie focus:outline-none focus:ring-2 focus:ring-acento"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cargando ? (
            <div className="col-span-full bg-superficie p-10 rounded-xl border border-borde text-center text-texto-sec text-sm font-medium">
              Cargando departamentos...
            </div>
          ) : departamentos.filter(d => d.nombre_departamento.toLowerCase().includes(busqueda.toLowerCase())).length === 0 ? (
            <div className="col-span-full bg-superficie p-10 rounded-xl border-2 border-dashed border-borde text-center">
              <p className="text-texto-sec font-medium text-sm">
                {busqueda ? 'No hay departamentos que coincidan con la búsqueda.' : 'Todavía no hay departamentos cargados en este destino.'}
              </p>
              {!busqueda && <p className="text-xs text-texto-sec/70 mt-1">Usá "Nuevo Departamento" para empezar.</p>}
            </div>
          ) : (
            departamentos.filter(d => d.nombre_departamento.toLowerCase().includes(busqueda.toLowerCase())).map(depto => (
              <div
                key={depto.id_departamento}
                onClick={() => navigate(`/dashboard/departamentos/${depto.id_departamento}/divisiones`, {
                  state: { nombreDepartamento: depto.nombre_departamento }
                })}
                className="group bg-superficie p-6 rounded-xl border border-borde hover:border-acento/50 shadow-sm transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-primario group-hover:text-acento transition-colors">
                    {depto.nombre_departamento}
                  </h3>
                </div>
                <p className="text-xs text-texto-sec mt-2 bg-fondo p-2.5 rounded border border-borde">
                  Abreviatura: <span className="font-bold text-tinta">{depto.abreviatura}</span>
                </p>
                <div className="mt-5 pt-4 border-t border-borde flex justify-end items-center text-xs font-bold text-acento">
                  <span>Ver Divisiones</span>
                  <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <ModalNuevoDepartamento
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDepartamentoCreado={fetchDepartamentos}
        idDestino={Number(idDestino)}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}