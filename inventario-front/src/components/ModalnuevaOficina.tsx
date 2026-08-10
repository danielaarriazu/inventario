import { useState } from 'react';
import api from '../services/api';

interface ModalNuevaOficinaProps {
  isOpen: boolean;
  onClose: () => void;
  onOficinaCreada: () => void;
  idDivision: number;
}

export default function ModalNuevaOficina({ isOpen, onClose, onOficinaCreada, idDivision }: ModalNuevaOficinaProps) {
  const [numeroOficina, setNumeroOficina] = useState('');
  const [errorForm, setErrorForm] = useState('');

  if (!isOpen) return null;

  const handleCreateOficina = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');

    if (!numeroOficina) {
      setErrorForm('El número de oficina es obligatorio');
      return;
    }

    try {
      await api.post('/oficinas', {
        numero_oficina: numeroOficina,
        id_division: idDivision
      });

      setNumeroOficina('');
      onOficinaCreada();
      onClose();
    } catch (error: any) {
      setErrorForm(error.response?.data?.error || 'Error al crear la oficina');
    }
  };

  return (
    <div className="fixed inset-0 bg-primario/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-superficie rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-borde">
        <h3 className="text-xl font-bold text-primario mb-4 flex items-center gap-2">
          <span>🚪</span> Alta de Nueva Oficina
        </h3>

        <form onSubmit={handleCreateOficina} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-texto-sec mb-1">Número de Oficina</label>
            <input
              type="text"
              placeholder="Ej: 13-111"
              value={numeroOficina}
              onChange={(e) => setNumeroOficina(e.target.value)}
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
              Guardar Oficina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}