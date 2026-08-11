import { useState } from 'react';
import api from '../services/api';
import { X, KeyRound, Eye, EyeOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Cualquier usuario logueado puede cambiar su propia contraseña acá,
// siempre que sepa la actual
export default function ModalCambiarPassword({ isOpen, onClose }: Props) {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const cerrar = () => {
    setPasswordActual(''); setPasswordNueva(''); setConfirmar('');
    setError(''); setMensaje('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMensaje('');

    if (passwordNueva !== confirmar) {
      setError('La confirmación no coincide con la contraseña nueva');
      return;
    }

    setGuardando(true);
    try {
      await api.put('/auth/me/password', { password_actual: passwordActual, password_nueva: passwordNueva });
      setMensaje('Contraseña actualizada correctamente.');
      setPasswordActual(''); setPasswordNueva(''); setConfirmar('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-primario/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-superficie border border-borde rounded-xl max-w-sm w-full shadow-xl overflow-hidden">
        <div className="bg-fondo p-4 border-b border-borde flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-primario">
            <KeyRound className="w-4 h-4" /> Cambiar mi contraseña
          </div>
          <button onClick={cerrar} className="text-texto-sec hover:text-primario cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mensaje && <div className="bg-activo/10 border border-activo/30 text-activo p-2.5 rounded text-xs font-semibold">{mensaje}</div>}
          {error && <div className="bg-baja/10 border border-baja/30 text-baja p-2.5 rounded text-xs font-medium">{error}</div>}

          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Contraseña actual</label>
            <input
              type={mostrar ? 'text' : 'password'} required value={passwordActual}
              onChange={e => setPasswordActual(e.target.value)}
              className="w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Contraseña nueva</label>
            <input
              type={mostrar ? 'text' : 'password'} required value={passwordNueva}
              onChange={e => setPasswordNueva(e.target.value)}
              className="w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Confirmar contraseña nueva</label>
            <input
              type={mostrar ? 'text' : 'password'} required value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              className="w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-texto-sec cursor-pointer">
            <input type="checkbox" checked={mostrar} onChange={e => setMostrar(e.target.checked)} />
            {mostrar ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} Mostrar contraseñas
          </label>

          <button
            type="submit" disabled={guardando}
            className="w-full bg-primario hover:bg-primario-hover text-white font-bold p-3 rounded-lg transition-colors cursor-pointer text-sm disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}