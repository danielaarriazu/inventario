import { useState } from 'react';
import api from '../services/api';
import { X, KeyRound, Eye, EyeOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idUsuario: number | null;
  nombreUsuario?: string;
}

// Solo lo usa el Responsable, para cuando un auxiliar se olvida la contraseña
// y no hay forma de recuperarla sola (no hay mail configurado)
export default function ModalResetearPassword({ isOpen, onClose, idUsuario, nombreUsuario }: Props) {
  const [passwordNueva, setPasswordNueva] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  if (!isOpen || !idUsuario) return null;

  const cerrar = () => {
    setPasswordNueva(''); setError(''); setMensaje('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMensaje('');
    setGuardando(true);
    try {
      await api.put(`/auth/companeros/${idUsuario}/password`, { password_nueva: passwordNueva });
      setMensaje('Contraseña reseteada correctamente.');
      setPasswordNueva('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al resetear la contraseña');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-primario/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-superficie border border-borde rounded-xl max-w-sm w-full shadow-xl overflow-hidden">
        <div className="bg-fondo p-4 border-b border-borde flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-primario">
            <KeyRound className="w-4 h-4" /> Resetear contraseña{nombreUsuario ? ` — ${nombreUsuario}` : ''}
          </div>
          <button onClick={cerrar} className="text-texto-sec hover:text-primario cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mensaje && <div className="bg-activo/10 border border-activo/30 text-activo p-2.5 rounded text-xs font-semibold">{mensaje}</div>}
          {error && <div className="bg-baja/10 border border-baja/30 text-baja p-2.5 rounded text-xs font-medium">{error}</div>}

          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Nueva contraseña</label>
            <div className="relative">
              <input
                type={mostrar ? 'text' : 'password'} required value={passwordNueva}
                onChange={e => setPasswordNueva(e.target.value)}
                className="w-full border border-borde rounded p-2.5 pr-10 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
              />
              <button
                type="button" onClick={() => setMostrar(!mostrar)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-texto-sec hover:text-primario cursor-pointer"
              >
                {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-[11px] text-texto-sec">
            Se la vas a tener que pasar vos mismo al auxiliar — no se manda por mail ni notificación.
          </p>

          <button
            type="submit" disabled={guardando}
            className="w-full bg-primario hover:bg-primario-hover text-white font-bold p-3 rounded-lg transition-colors cursor-pointer text-sm disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Resetear contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}