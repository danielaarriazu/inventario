import { useState } from 'react';
import api from '../services/api';
import { X, UserPlus, Eye, EyeOff } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuxiliarCreado: () => void;
}

export default function ModalNuevoAuxiliar({ isOpen, onClose, onAuxiliarCreado }: ModalProps) {
  const [mr, setMr] = useState('');
  const [nombre, setNombre] = useState('');
  const [jerarquia, setJerarquia] = useState('');
  const [rol, setRol] = useState('SUBORDINADO');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  if (!isOpen) return null;

  const handleCreateAuxiliar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');
    try {
      await api.post('/auth/companeros', { mr, nombre, jerarquia, rol, password });

      setMr('');
      setNombre('');
      setJerarquia('');
      setRol('SUBORDINADO');
      setPassword('');
      onAuxiliarCreado();
      onClose();
    } catch (error: any) {
      setErrorForm(error.response?.data?.error || 'Error al registrar el auxiliar');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-primario/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-superficie border border-borde rounded-xl max-w-md w-full shadow-xl overflow-hidden">

        <div className="bg-fondo p-4 border-b border-borde flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-primario">
            <UserPlus className="w-4 h-4" />
            Alta de Auxiliar
          </div>
          <button onClick={onClose} className="text-texto-sec hover:text-primario transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreateAuxiliar} className="p-6 space-y-4">
          {errorForm && (
            <div className="bg-baja/10 border border-baja/30 text-baja p-2.5 rounded text-xs font-medium">
              {errorForm}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Matrícula (M.R.)</label>
            <input
              type="text" required placeholder="Ej: 4226546" value={mr}
              onChange={(e) => setMr(e.target.value)}
              className="w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Nombre Completo</label>
            <input
              type="text" required placeholder="Ej: SOSA, Juan" value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Jerarquía</label>
            <input
              type="text" required placeholder="Ej: CPIN" value={jerarquia}
              onChange={(e) => setJerarquia(e.target.value)}
              className="w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Contraseña de acceso</label>
            <div className="relative">
              <input
                type={mostrarPassword ? 'text' : 'password'} required placeholder="Definí una contraseña" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-borde rounded p-2.5 pr-10 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-texto-sec hover:text-primario cursor-pointer"
              >
                {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Rol</label>
            <select
              value={rol} onChange={(e) => setRol(e.target.value)}
              className="w-full border border-borde rounded p-2.5 text-sm text-tinta focus:outline-none focus:ring-2 focus:ring-acento cursor-pointer"
            >
              <option value="SUBORDINADO">SUBORDINADO (Auxiliar)</option>
              <option value="RESPONSABLE">RESPONSABLE (Encargado)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-primario hover:bg-primario-hover text-white font-bold p-3 rounded-lg transition-colors cursor-pointer text-sm"
          >
            Registrar Auxiliar
          </button>
        </form>
      </div>
    </div>
  );
}