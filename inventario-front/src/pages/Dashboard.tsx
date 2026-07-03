import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ModalNuevoDestino from '../components/ModalNuevoDestino'; // <-- Importamos el componente separado

interface Destino {
  id_destino: number;
  cod_destino: number;
  nombre_destino: string;
}

export default function Dashboard() {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDestinos = async () => {
    try {
      const response = await api.get('/destinos');
      setDestinos(response.data);
    } catch (error) {
      console.error("Error de autenticación", error);
      navigate('/'); 
    }
  };

  useEffect(() => {
    fetchDestinos();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full flex flex-col">
      {/* Navbar */}
      <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚓</span>
          <h1 className="text-xl font-bold tracking-wide">Sistema de Inventario Patrimonial</h1>
        </div>
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-sm font-semibold px-4 py-2 rounded transition-colors">
          Cerrar Sesión
        </button>
      </nav>

      {/* Contenido Principal */}
      <main className="p-8 max-w-7xl mx-auto mt-4 flex-grow w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Destinos de mi Jurisdicción</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded shadow transition-colors cursor-pointer"
          >
            + Nuevo Destino
          </button>
          <button 
            onClick={() => navigate('/dashboard/auxiliares')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded shadow transition-colors cursor-pointer mr-2"
          >
            👥 Ver Auxiliares
          </button>
        </div>

        {/* Grilla de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinos.length === 0 ? (
            <p className="text-gray-500 font-medium col-span-full bg-white p-6 rounded-lg border border-dashed border-gray-300 text-center">
              No hay destinos registrados en su cargo aún. Use el botón "+ Nuevo Destino" para comenzar.
            </p>
          ) : (
            destinos.map(destino => (
              <div key={destino.id_destino} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="text-lg font-bold text-blue-900">{destino.nombre_destino}</h3>
                <p className="text-sm text-gray-500 mt-2">Código Interno: <span className="font-semibold text-gray-700">{destino.cod_destino}</span></p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <span className="text-blue-600 text-sm font-semibold hover:underline">Ver Departamentos →</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Llamamos al Modal enviándole los controles externos */}
      <ModalNuevoDestino 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onDestinoCreado={fetchDestinos} 
      />
    </div>
  );
}