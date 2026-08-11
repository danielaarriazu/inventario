import { useState } from 'react';
import api from '../services/api';

interface ModalNuevaDivisionProps {
  isOpen: boolean;
  onClose: () => void;
  onDivisionCreada: () => void;
  idDepartamento: number;
}

export default function ModalNuevaDivision({ isOpen, onClose, onDivisionCreada, idDepartamento }: ModalNuevaDivisionProps) {
  const [nombreDivision, setNombreDivision] = useState('');
  const [abreviatura, setAbreviatura] = useState('');
  const [errorForm, setErrorForm] = useState('');

  if (!isOpen) return null;

  const handleCreateDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');

    if (!nombreDivision || !abreviatura) {
      setErrorForm('Todos los campos son obligatorios');
      return;
    }

    try {
      await api.post('/divisiones', {
        nombre_division: nombreDivision,
        abreviatura,
        id_departamento: idDepartamento
      });

      setNombreDivision('');
      setAbreviatura('');
      onDivisionCreada();
      onClose();
    } catch (error: any) {
      setErrorForm(error.response?.data?.error || 'Error al crear la división');
    }
  };

  return (
    <div className="fixed inset-0 bg-primario/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-superficie rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-borde">
        <h3 className="text-xl font-bold text-primario mb-4 flex items-center gap-2">
          <span>📂</span> Alta de Nueva División
        </h3>

        <form onSubmit={handleCreateDivision} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-texto-sec mb-1">Nombre de la División</label>
            <input
              type="text"
              placeholder="Ej: Contaduria"
              value={nombreDivision}
              onChange={(e) => setNombreDivision(e.target.value)}
              className="w-full px-3 py-2 border border-borde rounded-lg focus:outline-none focus:ring-2 focus:ring-acento text-tinta"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-texto-sec mb-1">Abreviatura</label>
            <input
              type="text"
              placeholder="Ej: CO"
              value={abreviatura}
              onChange={(e) => setAbreviatura(e.target.value)}
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
              Guardar División
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}