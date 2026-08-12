import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import ModalNuevaOficina from '../components/ModalnuevaOficina';
import { DoorOpen, PlusCircle, ArrowLeft, Printer } from 'lucide-react';

interface Oficina {
  id_oficina: number;
  numero_oficina: string;
}

export default function Oficinas() {
  const { idDivision } = useParams();
  const location = useLocation();
  const nombreDivision = (location.state as { nombreDivision?: string })?.nombreDivision || 'División';

  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchOficinas = async () => {
    try {
      const response = await api.get(`/oficinas?id_division=${idDivision}`);
      setOficinas(response.data);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      } else {
        console.error('Error al obtener las oficinas', error);
      }
    }
  };

  useEffect(() => {
    fetchOficinas();
  }, [idDivision]);

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <nav className="bg-primario p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white tracking-wide">
            Sistema de Inventario
          </h1>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto mt-4 flex-grow w-full">
        <div className="text-sm text-texto-sec mb-4">
          <span className="font-bold text-primario">{nombreDivision}</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-superficie p-6 rounded-xl border border-borde shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primario flex items-center gap-2">
              <DoorOpen className="text-acento w-6 h-6" /> Oficinas de {nombreDivision}
            </h2>
            <p className="text-sm text-texto-sec mt-1">Último nivel de la estructura — acá se ubican los equipos.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primario hover:bg-primario-hover text-white font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Nueva Oficina
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {oficinas.length === 0 ? (
            <div className="col-span-full bg-superficie p-10 rounded-xl border-2 border-dashed border-borde text-center">
              <p className="text-texto-sec font-medium text-sm">
                Todavía no hay oficinas cargadas en esta división.
              </p>
              <p className="text-xs text-texto-sec/70 mt-1">Usá "Nueva Oficina" para empezar.</p>
            </div>
          ) : (
            oficinas.map(of => (
              <div
                key={of.id_oficina}
                onClick={() => navigate(`/dashboard/equipos?id_oficina=${of.id_oficina}`, {
                  state: { numeroOficina: of.numero_oficina }
                })}
                className="group bg-superficie p-6 rounded-xl border border-borde hover:border-acento/50 shadow-sm transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-primario flex items-center gap-2 group-hover:text-acento transition-colors">
                    <DoorOpen className="w-4 h-4 text-acento" /> Oficina {of.numero_oficina}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/oficinas/${of.id_oficina}/imprimir`, {
                        state: { numeroOficina: of.numero_oficina }
                      });
                    }}
                    title="Imprimir todas las planillas de esta oficina"
                    className="text-texto-sec hover:text-acento cursor-pointer flex-shrink-0"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-4 pt-3 border-t border-borde flex justify-end items-center text-xs font-bold text-acento">
                  <span>Ver Equipos</span>
                  <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <ModalNuevaOficina
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOficinaCreada={fetchOficinas}
        idDivision={Number(idDivision)}
      />
    </div>
  );
}