import { useState } from 'react';
import api from '../services/api';

interface ModalNuevoDestinoProps {
  isOpen: boolean;
  onClose: () => void;
  onDestinoCreado: () => void;
}

export default function ModalNuevoDestino({ isOpen, onClose, onDestinoCreado }: ModalNuevoDestinoProps) {
  const [nombreDestino, setNombreDestino] = useState('');
  const [codDestino, setCodDestino] = useState('');
  const [errorForm, setErrorForm] = useState('');

  if (!isOpen) return null;

  const handleCreateDestino = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');

    if (!nombreDestino || !codDestino) {
      setErrorForm('Todos los campos son obligatorios');
      return;
    }

    try {
      await api.post('/destinos', {
        nombre_destino: nombreDestino,
        cod_destino: parseInt(codDestino)
      });

      setNombreDestino('');
      setCodDestino('');
      onDestinoCreado(); // Avisa al Dashboard que recargue la lista
      onClose(); // Cierra el modal
    } catch (error: any) {
      setErrorForm(error.response?.data?.error || 'Error al crear el destino');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>🏢</span> Alta de Nuevo Destino
        </h3>
        
        <form onSubmit={handleCreateDestino} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Destino</label>
            <input 
              type="text"
              placeholder="Ej: Dirección de Informática"
              value={nombreDestino}
              onChange={(e) => setNombreDestino(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Código de Destino (Número)</label>
            <input 
              type="number"
              placeholder="Ej: 1042"
              value={codDestino}
              onChange={(e) => setCodDestino(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              Guardar Destino
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}