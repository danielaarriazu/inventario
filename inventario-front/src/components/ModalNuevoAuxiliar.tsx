import { useState } from 'react';
import api from '../services/api';

interface ModalNuevoAuxiliarProps {
  isOpen: boolean;
  onClose: () => void;
  onAuxiliarCreado: () => void;
}

export default function ModalNuevoAuxiliar({ isOpen, onClose, onAuxiliarCreado }: ModalNuevoAuxiliarProps) {
  const [mr, setMr] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('OPERADOR'); 
  const [errorForm, setErrorForm] = useState('');

  if (!isOpen) return null;

  const handleCreateAuxiliar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');

    if (!mr || !nombre) {
      setErrorForm('Todos los campos son obligatorios');
      return;
    }

    try {
      await api.post('/auth/companeros', {
        mr,
        nombre,
        rol
      });

      setMr('');
      setNombre('');
      setRol('OPERADOR');
      onAuxiliarCreado(); 
      onClose(); 
    } catch (error: any) {
      setErrorForm(error.response?.data?.error || 'Error al registrar al auxiliar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🎖️</span> Registrar Auxiliar de Equipo
        </h3>
        
        <form onSubmit={handleCreateAuxiliar} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Matrícula (MR)</label>
            <input 
              type="text"
              placeholder="Ej: 123456"
              value={mr}
              onChange={(e) => setMr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre y Apellido Completo</label>
            <input 
              type="text"
              placeholder="Ej: Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Rol en el Sistema</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OPERADOR">Operador (Solo Carga de Inventario)</option>
              <option value="AUDITOR">Auditor (Verificación y Reportes)</option>
              <option value="ENCARGADO">Encargado de Destino</option>
            </select>
          </div>

          {errorForm && (
            <p className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">{errorForm}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button"
              onClick={() => { onClose(); setErrorForm(''); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors shadow cursor-pointer"
            >
              Dar de Alta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}