import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import { Menu as MenuIcon, Search, History } from 'lucide-react';

const TIPOS_ACCION = ['TODOS', 'TRASPASO', 'MANTENIMIENTO_PREVENTIVO', 'REPARACION', 'BAJA_DEFINITIVA'] as const;
const TIPOS_ACCION_ETIQUETA: Record<string, string> = {
  TRASPASO: 'Traspaso',
  MANTENIMIENTO_PREVENTIVO: 'Mant. Preventivo',
  REPARACION: 'Reparación',
  BAJA_DEFINITIVA: 'Baja',
};
const TIPO_ACCION_COLOR: Record<string, string> = {
  TRASPASO: 'bg-acento',
  MANTENIMIENTO_PREVENTIVO: 'bg-verde-sheen',
  REPARACION: 'bg-reparacion',
  BAJA_DEFINITIVA: 'bg-baja',
};

const ETIQUETAS_CAMPO: Record<string, string> = {
  numero_equipo: 'N° de Equipo',
  nombre_equipo: 'Nombre de PC',
  nombre_usuario_red: 'Nombre de Usuario',
  usuario_responsable: 'Usuario Responsable',
  estado_equipo: 'Estado',
  procesador: 'Procesador',
  ram_capacidad: 'Capacidad RAM',
  tipo_ram: 'Tipo de RAM',
  disco: 'Disco',
  hardware_otros: 'Otros (Hardware)',
  monitor_modelo: 'Monitor',
  monitor_tamano: 'Tamaño de Monitor',
  impresora_modelo: 'Impresora',
  impresora_insumos: 'Insumos de Impresora',
  tiene_teclado: 'Teclado',
  tiene_mouse: 'Mouse',
  perifericos_otros: 'Otros Periféricos',
};

// Arma la lista de "qué cambió" para un registro del historial — usa el
// nombre real de la oficina si es un traspaso, y el resto de detalle_cambios
const formatearCambios = (h: any): string[] => {
  const lineas: string[] = [];
  if (h.oficina_destino) {
    lineas.push(`Nueva oficina: ${h.oficina_destino.numero_oficina}`);
  }
  try {
    const cambios = JSON.parse(h.detalle_cambios || '{}');
    Object.entries(cambios).forEach(([campo, valores]: [string, any]) => {
      if (campo === 'id_oficina') return; // ya se muestra arriba con el nombre real
      const etiqueta = ETIQUETAS_CAMPO[campo] || campo;
      lineas.push(`${etiqueta}: ${valores?.antes ?? '—'} → ${valores?.despues ?? '—'}`);
    });
  } catch {
    // detalle_cambios vacío o no parseable, no pasa nada
  }
  return lineas;
};

export default function HistorialMovimientos() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<typeof TIPOS_ACCION[number]>('TODOS');
  const [cargando, setCargando] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [perfil, setPerfil] = useState<{ nombre_apellido: string; mr: string; rol: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setPerfil(res.data);
      // Un auxiliar no ve el historial general — ni por URL directa
      if (res.data.rol !== 'RESPONSABLE') {
        navigate('/menu');
      }
    }).catch(() => {});
  }, [navigate]);

  useEffect(() => {
    const fetchHistorial = async () => {
      setCargando(true);
      try {
        const response = await api.get('/auditoria');
        setHistorial(response.data);
      } catch (error: any) {
        if (error.response?.status === 401) navigate('/');
        else if (error.response?.status === 403) navigate('/menu');
      } finally {
        setCargando(false);
      }
    };
    fetchHistorial();
  }, [navigate]);

  const filtrado = historial.filter(h => {
    const pasaTipo = filtroTipo === 'TODOS' || h.tipo_accion === filtroTipo;
    const pasaBusqueda = busqueda.trim().length === 0 ||
      h.planilla?.numero_equipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.planilla?.nombre_equipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.planilla?.usuario_responsable?.toLowerCase().includes(busqueda.toLowerCase());
    return pasaTipo && pasaBusqueda;
  });

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <nav className="bg-primario p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer">
            <MenuIcon className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white tracking-wide">Historial de Movimientos</h1>
        </div>
        {perfil && (
          <div className="hidden sm:block bg-white/10 px-3 py-1.5 rounded-md text-xs text-white/90 font-semibold">
            {perfil.nombre_apellido} · MR {perfil.mr}
          </div>
        )}
      </nav>

      <main className="p-8 max-w-5xl mx-auto mt-4 flex-grow w-full">
        <div className="bg-superficie p-6 rounded-xl border border-borde shadow-sm mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-primario flex items-center gap-2">
            <History className="text-acento w-6 h-6" /> Historial de Movimientos
          </h2>
          <p className="text-sm text-texto-sec mt-1">Todos los movimientos registrados — buscá por equipo para ver su historial completo.</p>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 text-texto-sec absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por N° de equipo, nombre de PC o responsable..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-borde rounded-lg text-sm bg-superficie focus:outline-none focus:ring-2 focus:ring-acento"
          />
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {TIPOS_ACCION.map(t => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                filtroTipo === t ? 'bg-primario border-primario text-white' : 'bg-superficie border-borde text-texto-sec hover:border-primario/40'
              }`}
            >
              {t === 'TODOS' ? 'Todos' : TIPOS_ACCION_ETIQUETA[t]}
            </button>
          ))}
        </div>

        <div className="bg-superficie border border-borde rounded-xl shadow-sm overflow-hidden">
          {cargando ? (
            <div className="p-12 text-center text-texto-sec text-sm font-medium">Cargando historial...</div>
          ) : filtrado.length === 0 ? (
            <div className="p-12 text-center text-texto-sec text-sm font-medium">No se encontraron movimientos con esos criterios.</div>
          ) : (
            <div className="divide-y divide-borde">
              {filtrado.map(h => {
                const cambios = formatearCambios(h);
                return (
                  <div
                    key={h.id_historial}
                    onClick={() => h.id_planilla && navigate(`/equipos/${h.id_planilla}`)}
                    className="p-4 hover:bg-fondo transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-3 mb-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${h.tipo_accion ? TIPO_ACCION_COLOR[h.tipo_accion] : 'bg-texto-sec'}`} />
                        <span className="font-bold text-sm text-primario">{h.planilla?.numero_equipo ?? '—'}</span>
                        <span className="text-xs text-texto-sec">{h.motivo_cambio}</span>
                      </div>
                      <span className="text-xs text-texto-sec whitespace-nowrap">
                        {new Date(h.fecha_modificacion).toLocaleDateString('es-AR')} {new Date(h.fecha_modificacion).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs text-texto-sec mb-1">
                      {h.planilla?.usuario_responsable} · Hecho por: {h.usuario ? `${h.usuario.nombre_apellido} (MR ${h.usuario.mr})` : 'Desconocido'}
                    </div>
                    {cambios.length > 0 && (
                      <div className="text-xs text-tinta">
                        {cambios.map((c, i) => <div key={i}>{c}</div>)}
                      </div>
                    )}
                    {h.observaciones && (
                      <div className="text-xs mt-1 inline-block bg-champagne text-primario px-2 py-0.5 rounded">{h.observaciones}</div>
                    )}
                    {cambios.length === 0 && !h.observaciones && (
                      <div className="text-xs mt-1 text-texto-sec italic">Sin detalle registrado para este movimiento.</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}