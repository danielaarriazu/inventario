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
      onDestinoCreado();
      onClose();
    } catch (error: any) {
      setErrorForm(error.response?.data?.error || 'Error al crear el destino');
    }
  };

  return (
    <div className="fixed inset-0 bg-primario/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-superficie rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-borde">
        <h3 className="text-xl font-bold text-primario mb-4 flex items-center gap-2">
          <span>⚓</span> Alta de Nuevo Destino
        </h3>

        <form onSubmit={handleCreateDestino} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-texto-sec mb-1">Nombre del Destino</label>
            <input
              type="text"
              placeholder="Ej: Dirección de Prsonal"
              value={nombreDestino}
              onChange={(e) => setNombreDestino(e.target.value)}
              className="w-full px-3 py-2 border border-borde rounded-lg focus:outline-none focus:ring-2 focus:ring-acento text-tinta"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-texto-sec mb-1">Código de Destino (Número)</label>
            <input
              type="number"
              placeholder="Ej: 142"
              value={codDestino}
              onChange={(e) => setCodDestino(e.target.value)}
              className="w-full px-3 py-2 border border-borde rounded-lg focus:outline-none focus:ring-2 focus:ring-acento text-tinta"
            />
          </div>

          {errorForm && (
            <p className="text-baja text-sm font-medium bg-baja/10 p-2 rounded">{errorForm}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { onClose(); setErrorForm(''); }}
              className="px-4 py-2 border border-borde rounded-lg text-texto-sec font-medium hover:bg-fondo transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primario text-white font-medium rounded-lg hover:bg-primario-hover transition-colors cursor-pointer"
            >
              Guardar Destino
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
