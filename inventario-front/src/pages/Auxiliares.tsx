import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ModalNuevoAuxiliar from '../components/ModalNuevoAuxiliar';

interface Auxiliar {
  id_usuario: number;
  mr: string;
  nombre: string;
  rol: string;
}

export default function Auxiliares() {
  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAuxiliares = async () => {
    try {
      const response = await api.get('/auth/companeros');
      setAuxiliares(response.data);
    } catch (error) {
      console.error("Error al obtener los auxiliares", error);
      navigate('/');
    }
  };

  useEffect(() => {
    fetchAuxiliares();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 w-full flex flex-col">
      <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚓</span>
          <h1 className="text-xl font-bold tracking-wide">Personal Auxiliar de Informática</h1>
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-gray-700 hover:bg-gray-600 text-sm font-semibold px-4 py-2 rounded transition-colors cursor-pointer"
        >
          ← Volver al Dashboard
        </button>
      </nav>

      <main className="p-8 max-w-5xl mx-auto mt-4 flex-grow w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Auxiliares de la Jurisdicción</h2>
            <p className="text-sm text-gray-500 mt-1">Personal autorizado para colaborar con la carga y relevamiento.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded shadow transition-colors cursor-pointer"
          >
            + Agregar Auxiliar
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold text-sm">
                <th className="p-4">Matrícula (MR)</th>
                <th className="p-4">Nombre Completo</th>
                <th className="p-4">Rol Asignado</th>
                <th className="p-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {auxiliares.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 font-medium">
                    No hay personal auxiliar registrado en su cargo aún.
                  </td>
                </tr>
              ) : (
                auxiliares.map(aux => (
                  <tr key={aux.id_usuario} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-mono font-semibold text-gray-900">{aux.mr}</td>
                    <td className="p-4 font-medium">{aux.nombre}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        aux.rol === 'ENCARGADO' ? 'bg-purple-100 text-purple-700' :
                        aux.rol === 'AUDITOR' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {aux.rol}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Activo
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <ModalNuevoAuxiliar 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAuxiliarCreado={fetchAuxiliares} 
      />
    </div>
  );
}