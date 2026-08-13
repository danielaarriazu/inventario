import { useEffect, useState } from 'react';
import { X, Pencil } from 'lucide-react';

interface Campo { key: string; label: string; valor: string; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  camposIniciales: Campo[];
  onGuardar: (valores: Record<string, string>) => Promise<void>;
}

// Modal genérico de "renombrar" — sirve para Departamento y División
// (nombre + abreviatura) y para Oficina (solo número), pasando los
// campos que corresponda desde afuera. Solo lo usa el Encargado.
export default function ModalRenombrar({ isOpen, onClose, titulo, camposIniciales, onGuardar }: Props) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const iniciales: Record<string, string> = {};
    camposIniciales.forEach(c => { iniciales[c.key] = c.valor; });
    setValores(iniciales);
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await onGuardar(valores);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar los cambios');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-primario/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-superficie border border-borde rounded-xl max-w-sm w-full shadow-xl overflow-hidden">
        <div className="bg-fondo p-4 border-b border-borde flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-primario">
            <Pencil className="w-4 h-4" /> {titulo}
          </div>
          <button onClick={onClose} className="text-texto-sec hover:text-primario cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-baja/10 border border-baja/30 text-baja p-2.5 rounded text-xs font-medium">{error}</div>}

          {camposIniciales.map(c => (
            <div key={c.key} className="space-y-1">
              <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">{c.label}</label>
              <input
                required
                value={valores[c.key] ?? ''}
                onChange={e => setValores(prev => ({ ...prev, [c.key]: e.target.value }))}
                className="w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
              />
            </div>
          ))}

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