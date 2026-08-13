import { useEffect, useState } from 'react';
import api from '../services/api';
import { X, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Solo el Responsable la usa — acá se configuran las 5 líneas del
// encabezado de la planilla, tal como salen impresas
export default function ModalEncabezado({ isOpen, onClose }: Props) {
  const [linea1, setLinea1] = useState('');
  const [destino, setDestino] = useState('');
  const [linea3, setLinea3] = useState('');
  const [titulo, setTitulo] = useState('');
  const [anio, setAnio] = useState('');
  const [original, setOriginal] = useState({ linea1: '', destino: '', linea3: '', titulo: '', anio: '' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(''); setMensaje('');
    api.get('/cargo/encabezado').then(res => {
      setLinea1(res.data.encabezado_linea1);
      setDestino(res.data.encabezado_destino);
      setLinea3(res.data.encabezado_linea3);
      setTitulo(res.data.encabezado_titulo);
      setAnio(res.data.encabezado_anio);
      setOriginal({
        linea1: res.data.encabezado_linea1,
        destino: res.data.encabezado_destino,
        linea3: res.data.encabezado_linea3,
        titulo: res.data.encabezado_titulo,
        anio: res.data.encabezado_anio,
      });
    }).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const sinCambios =
    linea1 === original.linea1 &&
    destino === original.destino &&
    linea3 === original.linea3 &&
    titulo === original.titulo &&
    anio === original.anio;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sinCambios) return; // sin diferencias, no hay nada que guardar
    setError(''); setMensaje('');
    setGuardando(true);
    try {
      await api.put('/cargo/encabezado', {
        encabezado_linea1: linea1,
        encabezado_destino: destino,
        encabezado_linea3: linea3,
        encabezado_titulo: titulo,
        encabezado_anio: anio,
      });
      setMensaje('Encabezado actualizado correctamente.');
      setOriginal({ linea1, destino, linea3, titulo, anio });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar el encabezado');
    } finally {
      setGuardando(false);
    }
  };

  const inputClass = "w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento";
  const labelClass = "text-xs font-bold text-texto-sec uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-[60] bg-primario/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-superficie border border-borde rounded-xl max-w-sm w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-fondo p-4 border-b border-borde flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2 text-sm font-bold text-primario">
            <FileText className="w-4 h-4" /> Encabezado de la planilla
          </div>
          <button onClick={onClose} className="text-texto-sec hover:text-primario cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3 overflow-y-auto">
          {mensaje && <div className="bg-activo/10 border border-activo/30 text-activo p-2.5 rounded text-xs font-semibold">{mensaje}</div>}
          {error && <div className="bg-baja/10 border border-baja/30 text-baja p-2.5 rounded text-xs font-medium">{error}</div>}

          <div className="bg-fondo border border-borde rounded-lg p-3 text-center text-[10px] text-texto-sec leading-relaxed">
            {linea1 || '...'}<br />
            <b className="text-tinta">{destino || '...'}</b><br />
            {linea3 || '...'}<br />
            {titulo || '...'}<br />
            AÑO {anio || '...'}
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Division <span className="text-baja">*</span></label>
            <input required value={linea1} onChange={e => setLinea1(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Destino <span className="text-baja">*</span></label>
            <input required value={destino} onChange={e => setDestino(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Cargo <span className="text-baja">*</span></label>
            <input required value={linea3} onChange={e => setLinea3(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Título de la planilla <span className="text-baja">*</span></label>
            <input required value={titulo} onChange={e => setTitulo(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Año <span className="text-baja">*</span></label>
            <input required value={anio} onChange={e => setAnio(e.target.value)} className={inputClass} />
          </div>

          <button
            type="submit" disabled={guardando || sinCambios}
            className="w-full bg-primario hover:bg-primario-hover text-white font-bold p-3 rounded-lg transition-colors cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {guardando ? 'Guardando...' : sinCambios ? 'Sin cambios' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}