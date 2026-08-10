import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Pencil, X, Download, QrCode } from 'lucide-react';

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

const inputClass = "w-full p-2 border border-borde rounded text-sm bg-superficie focus:outline-none focus:ring-2 focus:ring-acento text-tinta";
const labelClass = "text-[10.5px] font-bold text-texto-sec uppercase tracking-wide block mb-1";

export default function Ficha() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [qrImage, setQrImage] = useState('');
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargarTodo = async () => {
    try {
      const [eqRes, histRes, qrRes] = await Promise.all([
        api.get(`/equipos/${id}`),
        api.get(`/auditoria/equipo/${id}`),
        api.get(`/equipos/${id}/qr`),
      ]);
      setEquipo(eqRes.data);
      setForm(eqRes.data);
      setHistorial(histRes.data);
      setQrImage(qrRes.data.qr_image);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/');
      else if (err.response?.status === 404) setError('Equipo no encontrado');
    }
  };

  useEffect(() => { cargarTodo(); }, [id]);

  const setCampo = (campo: string, valor: any) => setForm((prev: any) => ({ ...prev, [campo]: valor }));

  const handleGuardar = async () => {
    setGuardando(true);
    setError('');
    try {
      const { id_planilla, oficina, estado_equipo, ...data } = form;
      await api.put(`/equipos/${id}`, data);
      setEditando(false);
      cargarTodo();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  const handleDescargarQR = async () => {
    if (!qrImage || !equipo) return;
    const img = new Image();
    img.src = qrImage;
    await new Promise((resolve) => { img.onload = resolve; });

    const qrSize = 280;
    const gap = 24;
    const padding = 20;
    const labelHeight = 26;
    const canvas = document.createElement('canvas');
    canvas.width = qrSize * 2 + gap + padding * 2;
    canvas.height = qrSize + labelHeight + padding * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0F2438';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';

    // Copia 1 — CPU
    ctx.drawImage(img, padding, padding, qrSize, qrSize);
    ctx.fillText(`${equipo.numero_equipo} — CPU`, padding + qrSize / 2, padding + qrSize + 20);

    // Copia 2 — MONITOR
    const x2 = padding + qrSize + gap;
    ctx.drawImage(img, x2, padding, qrSize, qrSize);
    ctx.fillText(`${equipo.numero_equipo} — MONITOR`, x2 + qrSize / 2, padding + qrSize + 20);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${equipo.numero_equipo}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  };

  if (error && !equipo) {
    return (
      <div className="min-h-screen bg-fondo flex items-center justify-center">
        <div className="text-center">
          <p className="text-baja font-bold mb-3">{error}</p>
          <button onClick={() => navigate('/dashboard/equipos')} className="text-acento font-semibold cursor-pointer">← Volver a Equipos</button>
        </div>
      </div>
    );
  }

  if (!equipo || !form) {
    return <div className="min-h-screen bg-fondo flex items-center justify-center text-texto-sec">Cargando...</div>;
  }

  const ubicacion = equipo.oficina
    ? `${equipo.oficina.division?.departamento?.destino?.nombre_destino ?? ''} / ${equipo.oficina.division?.departamento?.nombre_departamento ?? ''} / ${equipo.oficina.division?.nombre_division ?? ''} / Ofic. ${equipo.oficina.numero_oficina}`
    : '—';

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <nav className="bg-primario p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard/equipos')} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white tracking-wide">Ficha de Equipo</h1>
        </div>
        {!editando ? (
          <button onClick={() => { setForm(equipo); setEditando(true); }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer">
            <Pencil className="w-4 h-4" /> Editar
          </button>
        ) : (
          <button onClick={() => { setForm(equipo); setEditando(false); setError(''); }} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" /> Cancelar
          </button>
        )}
      </nav>

      <main className="p-6 max-w-5xl mx-auto w-full flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 bg-superficie border border-borde rounded-xl p-5 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-primario">{equipo.numero_equipo}</h2>
              <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${ESTADO_ESTILOS[equipo.estado_equipo]}`}>{equipo.estado_equipo}</span>
            </div>
            <p className="text-sm text-texto-sec mt-1">{ubicacion} · Responsable: {equipo.usuario_responsable}</p>
          </div>
        </div>

        {error && <div className="bg-baja/10 text-baja border border-baja/30 rounded-lg p-3 text-sm font-semibold mb-5">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Datos del equipo */}
          <div className="lg:col-span-2 space-y-5">
            {[
              { titulo: 'Software y red', campos: [
                ['nombre_equipo', 'Nombre de PC'], ['nombre_usuario_red', 'Usuario de Red'],
                ['dominio_conexion', 'Dominio'], ['sistema_operativo', 'Sistema Operativo'], ['arquitectura', 'Arquitectura']
              ]},
              { titulo: 'Hardware', campos: [
                ['procesador', 'Procesador'], ['ram_capacidad', 'RAM'], ['tipo_ram', 'Tipo de RAM'],
                ['disco', 'Disco'], ['hardware_otros', 'Otros']
              ]},
              { titulo: 'Periféricos', campos: [
                ['monitor_modelo', 'Monitor (modelo)'], ['monitor_tamano', 'Monitor (tamaño)'],
                ['impresora_modelo', 'Impresora (modelo)'], ['impresora_insumos', 'Impresora (insumos)'],
                ['perifericos_otros', 'Otros periféricos']
              ]},
            ].map(bloque => (
              <div key={bloque.titulo} className="bg-superficie border border-borde rounded-xl p-5">
                <h3 className="text-xs font-bold text-acento uppercase tracking-wide mb-3">{bloque.titulo}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {bloque.campos.map(([campo, etiqueta]) => (
                    <div key={campo}>
                      <label className={labelClass}>{etiqueta}</label>
                      {editando ? (
                        <input value={form[campo] ?? ''} onChange={e => setCampo(campo, e.target.value)} className={inputClass} />
                      ) : (
                        <div className="text-sm font-semibold">{(equipo as any)[campo] || '—'}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-superficie border border-borde rounded-xl p-5">
              <h3 className="text-xs font-bold text-acento uppercase tracking-wide mb-3">Historial de movimientos</h3>
              {historial.length === 0 ? (
                <p className="text-sm text-texto-sec">Todavía no hay movimientos registrados para este equipo.</p>
              ) : (
                <div className="space-y-0">
                  {historial.map((h, i) => (
                    <div key={h.id_historial} className={`flex gap-3 py-3 ${i > 0 ? 'border-t border-borde' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${h.tipo_accion ? TIPO_ACCION_COLOR[h.tipo_accion] : 'bg-texto-sec'}`} />
                      <div>
                        <div className="text-sm font-bold">
                          {h.tipo_accion ? TIPO_ACCION_ETIQUETA[h.tipo_accion] : h.motivo_cambio}
                          <span className="text-xs font-normal text-texto-sec"> · {new Date(h.fecha_modificacion).toLocaleDateString('es-AR')}</span>
                        </div>
                        <div className="text-xs text-texto-sec mt-0.5">
                          {h.usuario ? `${h.usuario.nombre_apellido} (MR ${h.usuario.mr})` : 'Usuario desconocido'}
                          {h.oficina_destino ? ` — hacia Oficina ${h.oficina_destino.numero_oficina}` : ''}
                        </div>
                        {h.observaciones && (
                          <div className="text-xs mt-1 inline-block bg-champagne text-primario px-2 py-0.5 rounded">{h.observaciones}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QR y acciones */}
          <div className="space-y-5">
            {editando && (
              <button
                onClick={handleGuardar}
                disabled={guardando}
                className="w-full bg-primario hover:bg-primario-hover text-white font-bold p-3 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            )}

            <div className="bg-superficie border border-borde rounded-xl p-5 text-center">
              <h3 className="text-xs font-bold text-acento uppercase tracking-wide mb-3 flex items-center justify-center gap-1.5">
                <QrCode className="w-4 h-4" /> Código QR
              </h3>
              {qrImage && <img src={qrImage} alt="QR del equipo" className="mx-auto rounded-lg border border-borde" />}
              <p className="text-[11px] text-texto-sec mt-3">
                Al escanearlo desde el celu, abre esta misma ficha.
              </p>
              <button
                onClick={handleDescargarQR}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-champagne hover:brightness-95 text-primario font-bold text-sm py-2.5 rounded-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Descargar QR (x2 — CPU y Monitor)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}