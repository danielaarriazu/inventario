import { useState } from 'react';
import api from '../services/api';

interface ModalNuevoDepartamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onDepartamentoCreado: () => void;
  idDestino: number;
}

export default function ModalNuevoDepartamento({ isOpen, onClose, onDepartamentoCreado, idDestino }: ModalNuevoDepartamentoProps) {
  const [nombreDepartamento, setNombreDepartamento] = useState('');
  const [abreviatura, setAbreviatura] = useState('');
  const [errorForm, setErrorForm] = useState('');

  if (!isOpen) return null;

  const handleCreateDepartamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm('');

    if (!nombreDepartamento || !abreviatura) {
      setErrorForm('Todos los campos son obligatorios');
      return;
    }

    try {
      await api.post('/departamentos', {
        nombre_departamento: nombreDepartamento,
        abreviatura,
        id_destino: idDestino
      });

      setNombreDepartamento('');
      setAbreviatura('');
      onDepartamentoCreado();
      onClose();
    } catch (error: any) {
      setErrorForm(error.response?.data?.error || 'Error al crear el departamento');
    }
  };

  return (
    <div className="fixed inset-0 bg-primario/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-superficie rounded-xl shadow-xl w-full max-w-md p-6 m-4 border border-borde">
        <h3 className="text-xl font-bold text-primario mb-4 flex items-center gap-2">
          <span>🏢</span> Alta de Nuevo Departamento
        </h3>

        <form onSubmit={handleCreateDepartamento} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-texto-sec mb-1">Nombre del Departamento</label>
            <input
              type="text"
              placeholder="Ej: Informática"
              value={nombreDepartamento}
              onChange={(e) => setNombreDepartamento(e.target.value)}
              className="w-full px-3 py-2 border border-borde rounded-lg focus:outline-none focus:ring-2 focus:ring-acento text-tinta"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-texto-sec mb-1">Abreviatura</label>
            <input
              type="text"
              placeholder="Ej: IN"
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
              Guardar Departamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
