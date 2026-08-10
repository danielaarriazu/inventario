import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Search, PlusCircle, FileSpreadsheet } from 'lucide-react';

interface Equipo {
  id_planilla: number;
  numero_equipo: string;
  nombre_equipo: string;
  usuario_responsable: string;
  sistema_operativo: string;
  arquitectura: string;
  estado_equipo: 'ACTIVO' | 'REPARACION' | 'BAJA';
  oficina?: { numero_oficina: string };
}

const ESTADO_ESTILOS: Record<string, string> = {
  ACTIVO: 'bg-activo text-white',
  REPARACION: 'bg-reparacion text-white',
  BAJA: 'bg-baja text-white',
};
const ESTADO_ETIQUETAS: Record<string, string> = {
  ACTIVO: 'ACTIVO',
  REPARACION: 'EN REPARACIÓN',
  BAJA: 'BAJA',
};

export default function Equipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'REPARACION' | 'BAJA'>('TODOS');
  const [descargando, setDescargando] = useState(false);
  const navigate = useNavigate();

  const fetchEquipos = async () => {
    try {
      const response = await api.get('/equipos');
      setEquipos(response.data);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) navigate('/');
    }
  };

  useEffect(() => { fetchEquipos(); }, []);

  const handleDescargarExcel = async () => {
    setDescargando(true);
    try {
      const response = await api.get('/reportes/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Inventario_Equipos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el Excel', error);
    } finally {
      setDescargando(false);
    }
  };

  const equiposFiltrados = equipos.filter(eq => {
    const pasaEstado = filtroEstado === 'TODOS' || eq.estado_equipo === filtroEstado;
    const pasaBusqueda = busqueda.trim().length === 0 ||
      eq.numero_equipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      eq.nombre_equipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      eq.usuario_responsable?.toLowerCase().includes(busqueda.toLowerCase());
    return pasaEstado && pasaBusqueda;
  });

  const contar = (estado: string) => estado === 'TODOS' ? equipos.length : equipos.filter(e => e.estado_equipo === estado).length;

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <nav className="bg-primario p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white tracking-wide">Sistema de Inventario Patrimonial</h1>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto mt-4 flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-superficie p-6 rounded-xl border border-borde shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primario">Equipos</h2>
            <p className="text-sm text-texto-sec mt-1">Buscá, revisá o descargá el inventario completo.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleDescargarExcel}
              disabled={descargando}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-superficie hover:bg-fondo text-acento border border-acento/40 font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer text-sm disabled:opacity-60"
            >
              <FileSpreadsheet className="w-4 h-4" /> {descargando ? 'Generando...' : 'Descargar Excel'}
            </button>
            <button
              onClick={() => navigate('/dashboard/equipos/nuevo')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-primario hover:bg-primario-hover text-white font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
            >
              <PlusCircle className="w-4 h-4" /> Nuevo Equipo
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 text-texto-sec absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por N° de patrimonio, nombre de PC o responsable..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-borde rounded-lg text-sm bg-superficie focus:outline-none focus:ring-2 focus:ring-acento"
          />
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {(['TODOS', 'ACTIVO', 'REPARACION', 'BAJA'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltroEstado(f)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                filtroEstado === f ? 'bg-primario border-primario text-white' : 'bg-superficie border-borde text-texto-sec hover:border-primario/40'
              }`}
            >
              {f === 'TODOS' ? 'Todos' : ESTADO_ETIQUETAS[f]} ({contar(f)})
            </button>
          ))}
        </div>

        <div className="bg-superficie border border-borde rounded-xl shadow-sm overflow-hidden">
          {equiposFiltrados.length === 0 ? (
            <div className="p-12 text-center text-texto-sec text-sm font-medium">
              No se encontraron equipos con esos criterios.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-fondo border-b border-borde text-texto-sec text-xs tracking-wide uppercase">
                    <th className="p-4 font-bold">N° Equipo</th>
                    <th className="p-4 font-bold">Responsable</th>
                    <th className="p-4 font-bold">Ubicación</th>
                    <th className="p-4 font-bold">Sistema</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {equiposFiltrados.map(eq => (
                    <tr
                      key={eq.id_planilla}
                      onClick={() => navigate(`/equipos/${eq.id_planilla}`)}
                      className="hover:bg-fondo transition-colors cursor-pointer"
                    >
                      <td className="p-4 font-bold text-primario">{eq.numero_equipo}</td>
                      <td className="p-4">{eq.usuario_responsable}</td>
                      <td className="p-4 text-texto-sec">Ofic. {eq.oficina?.numero_oficina ?? '—'}</td>
                      <td className="p-4 text-texto-sec">{eq.sistema_operativo?.replace('WINDOWS_', 'W')} · {eq.arquitectura?.replace('BITS_', '')} bits</td>
                      <td className="p-4">
                        <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${ESTADO_ESTILOS[eq.estado_equipo]}`}>
                          {ESTADO_ETIQUETAS[eq.estado_equipo]}
                        </span>
                      </td>
                      <td className="p-4 text-acento font-bold text-xs">Ver →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}