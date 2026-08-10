import React, { useState } from 'react';
import api from '../services/api';
import { X, Terminal, UserPlus } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuxiliarCreado: () => void;
}

export default function ModalNuevoAuxiliar({ isOpen, onClose, onAuxiliarCreado }: ModalProps) {
  const [mr, setMr] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('OPERADOR');
  const [errorForm, setErrorForm] = useState('');

  if (!isOpen) return null;

  const handleCreateAuxiliar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');
    try {
      // Envía los datos mapeados al endpoint correcto del backend
      await api.post('/auth/companeros', {
        mr,
        nombre, // El backend se encargará de guardarlo en nombre_apellido
        rol
      });

      // Limpiamos el formulario
      setMr('');
      setNombre('');
      setRol('OPERADOR');
      onAuxiliarCreado(); // Recarga la grilla de la pantalla
      onClose(); // Cierra el modal
    } catch (error: any) {
      setErrorForm(error.response?.data?.error || 'Error en los servidores de base de datos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Caja del Modal */}
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-xl max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden transform transition-all">
        
        {/* Encabezado del Modal */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
            <Terminal className="w-4 h-4" />
            <span>CMD: REGISTER_NEW_USER</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleCreateAuxiliar} className="p-6 space-y-4">
          <div className="text-center mb-2">
            <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-cyan-500/30">
              <UserPlus className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wide">Alta de Auxiliar</h3>
          </div>

          {errorForm && (
            <div className="bg-red-950/40 border border-red-500/40 text-red-400 p-2.5 rounded text-xs font-mono">
              ⚠️ ERROR_SYSTEM: {errorForm}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Matrícula de Revista (M.R.)</label>
            <input 
              type="text" required placeholder="Ej: 234567" value={mr}
              onChange={(e) => setMr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-sm text-lime-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Nombre Completo</label>
            <input 
              type="text" required placeholder="Ej: Juan Pérez" value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Rol Operacional en Sistema</label>
            <select 
              value={rol} onChange={(e) => setRol(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-sm text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="OPERADOR">OPERADOR (Carga de datos)</option>
              <option value="AUDITOR">AUDITOR (Solo Lectura/Informes)</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black p-3 rounded-lg shadow-lg shadow-cyan-500/20 transition-all duration-200 cursor-pointer uppercase tracking-wider text-sm"
          >
            Inyectar en Base de Datos
          </button>
        </form>
      </div>
    </div>
  );
}