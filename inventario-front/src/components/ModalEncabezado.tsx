import { useEffect, useState } from 'react';
import api from '../services/api';
import { X, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Solo el Responsable la usa, para configurar Destino y Año — el resto
// del encabezado de la planilla queda fijo
export default function ModalEncabezado({ isOpen, onClose }: Props) {
  const [destino, setDestino] = useState('');
  const [anio, setAnio] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(''); setMensaje('');
    api.get('/cargo/encabezado').then(res => {
      setDestino(res.data.encabezado_destino);
      setAnio(res.data.encabezado_anio);
    }).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMensaje('');
    setGuardando(true);
    try {
      await api.put('/cargo/encabezado', { encabezado_destino: destino, encabezado_anio: anio });
      setMensaje('Encabezado actualizado correctamente.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar el encabezado');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-primario/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-superficie border border-borde rounded-xl max-w-sm w-full shadow-xl overflow-hidden">
        <div className="bg-fondo p-4 border-b border-borde flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-primario">
            <FileText className="w-4 h-4" /> Encabezado de la planilla
          </div>
          <button onClick={onClose} className="text-texto-sec hover:text-primario cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mensaje && <div className="bg-activo/10 border border-activo/30 text-activo p-2.5 rounded text-xs font-semibold">{mensaje}</div>}
          {error && <div className="bg-baja/10 border border-baja/30 text-baja p-2.5 rounded text-xs font-medium">{error}</div>}

          <div className="bg-fondo border border-borde rounded-lg p-3 text-center text-[10.5px] text-texto-sec leading-relaxed">
            DIVISION INFORMATICA<br />
            <b className="text-tinta">{destino || '...'}</b><br />
            CARGO DE INFORMATICA<br />
            PLANILLA DE CONSIGNACION INTERNA DE EQUIPOS INFORMATICOS<br />
            AÑO {anio || '...'}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Destino</label>
            <input
              required value={destino} onChange={e => setDestino(e.target.value)}
              className="w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Año</label>
            <input
              required value={anio} onChange={e => setAnio(e.target.value)}
              className="w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>

          <button
            type="submit" disabled={guardando}
            className="w-full bg-primario hover:bg-primario-hover text-white font-bold p-3 rounded-lg transition-colors cursor-pointer text-sm disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}