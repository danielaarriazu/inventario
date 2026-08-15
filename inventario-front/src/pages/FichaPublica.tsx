import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Printer, Anchor } from 'lucide-react';

interface Equipo {
  id_planilla: number;
  numero_equipo: string;
  usuario_responsable: string;
  nombre_equipo: string;
  nombre_usuario_red: string;
  dominio_conexion: string;
  sistema_operativo: string;
  arquitectura: string;
  procesador: string;
  tipo_ram: string;
  ram_capacidad: string;
  disco: string;
  hardware_otros: string | null;
  monitor_modelo: string | null;
  monitor_tamano: string | null;
  impresora_modelo: string | null;
  impresora_insumos: string | null;
  tiene_teclado: boolean;
  tiene_mouse: boolean;
  perifericos_otros: string | null;
  estado_equipo: 'ACTIVO' | 'REPARACION' | 'BAJA';
  oficina?: { numero_oficina: string; division?: { nombre_division: string; departamento?: { nombre_departamento: string; destino?: { nombre_destino: string } } } };
}

interface HistorialItem {
  id_historial: number;
  tipo_accion: string | null;
  motivo_cambio: string;
  detalle_cambios: string;
  observaciones: string | null;
  fecha_modificacion: string;
  usuario: { nombre_apellido: string; mr: string } | null;
  oficina_destino: { numero_oficina: string } | null;
}

const ESTADO_ESTILOS: Record<string, string> = {
  ACTIVO: 'bg-activo text-white',
  REPARACION: 'bg-reparacion text-white',
  BAJA: 'bg-baja text-white',
};

const TIPO_ACCION_COLOR: Record<string, string> = {
  TRASPASO: 'bg-acento',
  MANTENIMIENTO_PREVENTIVO: 'bg-verde-sheen',
  REPARACION: 'bg-reparacion',
  BAJA_DEFINITIVA: 'bg-baja',
};
const TIPO_ACCION_ETIQUETA: Record<string, string> = {
  TRASPASO: 'Traspaso',
  MANTENIMIENTO_PREVENTIVO: 'Mantenimiento preventivo',
  REPARACION: 'Reparación',
  BAJA_DEFINITIVA: 'Baja definitiva',
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

const formatearCambios = (h: HistorialItem): string[] => {
  const lineas: string[] = [];
  if (h.oficina_destino) {
    lineas.push(`Nueva oficina: ${h.oficina_destino.numero_oficina}`);
  }
  try {
    const cambios = JSON.parse(h.detalle_cambios || '{}');
    Object.entries(cambios).forEach(([campo, valores]: [string, any]) => {
      if (campo === 'id_oficina') return;
      const etiqueta = ETIQUETAS_CAMPO[campo] || campo;
      lineas.push(`${etiqueta}: ${valores?.antes ?? '—'} → ${valores?.despues ?? '—'}`);
    });
  } catch {
    // detalle_cambios vacío o no parseable
  }
  return lineas;
};

const labelClass = "text-[10.5px] font-bold text-texto-sec uppercase tracking-wide block mb-1";

// Vista pública, sin login — a la que llega alguien que escaneó el QR
// pegado en el equipo. Solo ver e imprimir, ninguna acción posible.
export default function FichaPublica() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get(`/publico/equipos/${id}`).then(res => {
      setEquipo(res.data.equipo);
      setHistorial(res.data.historial);
    }).catch((err: any) => {
      setError(err.response?.data?.error || 'No se pudo cargar la ficha');
    }).finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center text-texto-sec">Cargando...</div>;
  }

  if (error || !equipo) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <p className="text-baja font-bold mb-1">No se pudo cargar la ficha</p>
          <p className="text-sm text-texto-sec">{error}</p>
        </div>
      </div>
    );
  }

  const ubicacion = [
    equipo.oficina?.division?.departamento?.destino?.nombre_destino,
    equipo.oficina?.division?.departamento?.nombre_departamento,
    equipo.oficina?.division?.nombre_division,
    equipo.oficina?.numero_oficina ? `Oficina ${equipo.oficina.numero_oficina}` : null,
  ].filter(Boolean).join(' / ');

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <nav className="bg-primario p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-2 text-white font-bold">
          <Anchor className="w-5 h-5" /> Ficha de Equipo
        </div>
        <button
          onClick={() => navigate(`/publico/equipos/${id}/imprimir`)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Imprimir
        </button>
      </nav>

      <div className="bg-champagne/40 border-b border-champagne px-4 py-2 text-center text-[11px] text-primario font-semibold">
        Acá podes ver la ficha de tu equipo y su historial de movimientos.
      </div>

      <main className="p-6 max-w-5xl mx-auto w-full flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-superficie border border-borde rounded-xl p-5 mb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-primario">{equipo.numero_equipo}</h2>
              <span className="text-xs text-texto-sec font-semibold">({equipo.nombre_equipo})</span>
              <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${ESTADO_ESTILOS[equipo.estado_equipo]}`}>{equipo.estado_equipo}</span>
            </div>
            <p className="text-sm text-texto-sec mt-1">{ubicacion} · Responsable: {equipo.usuario_responsable}</p>
          </div>
        </div>

        <div className="space-y-5">
          {[
            { titulo: 'Software y red', campos: [
              ['nombre_usuario_red', 'Usuario de Red'],
              ['dominio_conexion', 'Dominio'], ['sistema_operativo', 'Sistema Operativo'], ['arquitectura', 'Arquitectura']
            ]},
            { titulo: 'Hardware', campos: [
              ['procesador', 'Procesador'], ['ram_capacidad', 'RAM'], ['tipo_ram', 'Tipo de RAM'],
              ['disco', 'Disco']
            ]},
            { titulo: 'Periféricos', campos: [
              ['monitor_modelo', 'Monitor (modelo)'], ['monitor_tamano', 'Monitor (tamaño)'],
              ['impresora_modelo', 'Impresora (modelo)'], ['impresora_insumos', 'Impresora (insumos)']
            ]},
          ].map(bloque => (
            <div key={bloque.titulo} className="bg-superficie border border-borde rounded-xl p-5">
              <h3 className="text-xs font-bold text-acento uppercase tracking-wide mb-3">{bloque.titulo}</h3>

              {bloque.titulo === 'Software y red' && (
                <div className="mb-3">
                  <label className={labelClass}>Nombre de PC</label>
                  <div className="text-sm font-semibold">{equipo.nombre_equipo}</div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bloque.campos.map(([campo, etiqueta]) => (
                  <div key={campo}>
                    <label className={labelClass}>{etiqueta}</label>
                    <div className="text-sm font-semibold">{(equipo as any)[campo] || '—'}</div>
                  </div>
                ))}
              </div>

              {bloque.titulo === 'Hardware' && (
                <div className="mt-3">
                  <label className={labelClass}>Otros</label>
                  <div className="text-sm font-semibold whitespace-pre-line">{equipo.hardware_otros || '—'}</div>
                </div>
              )}

              {bloque.titulo === 'Periféricos' && (
                <>
                  <div className="flex gap-6 mt-3 mb-1 text-sm">
                    <span>Teclado: <b>{equipo.tiene_teclado ? 'Sí' : 'No'}</b></span>
                    <span>Mouse: <b>{equipo.tiene_mouse ? 'Sí' : 'No'}</b></span>
                  </div>
                  <div className="mt-2">
                    <label className={labelClass}>Otros periféricos</label>
                    <div className="text-sm font-semibold whitespace-pre-line">{equipo.perifericos_otros || '—'}</div>
                  </div>
                </>
              )}
            </div>
          ))}

          <div className="bg-superficie border border-borde rounded-xl p-5">
            <h3 className="text-xs font-bold text-acento uppercase tracking-wide mb-3">Historial de movimientos</h3>
            {historial.length === 0 ? (
              <p className="text-sm text-texto-sec">Todavía no hay movimientos registrados para este equipo.</p>
            ) : (
              <div className="space-y-0">
                {historial.map((h, i) => {
                  const cambios = formatearCambios(h);
                  return (
                    <div key={h.id_historial} className={`flex gap-3 py-3 ${i > 0 ? 'border-t border-borde' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${h.tipo_accion ? TIPO_ACCION_COLOR[h.tipo_accion] : 'bg-texto-sec'}`} />
                      <div>
                        <div className="text-sm font-bold">
                          {h.tipo_accion ? TIPO_ACCION_ETIQUETA[h.tipo_accion] : h.motivo_cambio}
                          <span className="text-xs font-normal text-texto-sec"> · {new Date(h.fecha_modificacion).toLocaleDateString('es-AR')}</span>
                        </div>
                        <div className="text-xs text-texto-sec mt-0.5">
                          {h.usuario ? `${h.usuario.nombre_apellido} (MR ${h.usuario.mr})` : 'Usuario desconocido'}
                        </div>
                        {cambios.length > 0 && (
                          <div className="text-xs text-tinta mt-1">
                            {cambios.map((c, idx) => <div key={idx}>{c}</div>)}
                          </div>
                        )}
                        {h.observaciones && (
                          <div className="text-xs mt-1 inline-block bg-champagne text-primario px-2 py-0.5 rounded">{h.observaciones}</div>
                        )}
                        {cambios.length === 0 && !h.observaciones && (
                          <div className="text-xs mt-1 text-texto-sec italic">Sin detalle registrado para este movimiento.</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}