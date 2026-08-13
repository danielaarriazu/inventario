import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ModalNuevoAuxiliar from '../components/ModalNuevoAuxiliar';
import ModalResetearPassword from '../components/ModalResetearPassword';
import Navbar from '../components/Navbar';
import { Users, PlusCircle, ShieldAlert, KeyRound, UserX } from 'lucide-react';

interface Auxiliar {
  id_usuario: number;
  mr: number | string;
  nombre_apellido: string;
  rol: string;
}

interface Perfil { rol: string; nombre_apellido: string; mr: string; }

const ETIQUETA_ROL: Record<string, string> = {
  RESPONSABLE: 'ENCARGADO',
  SUBORDINADO: 'AUXILIAR',
};

export default function Auxiliares() {
  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [resetObjetivo, setResetObjetivo] = useState<Auxiliar | null>(null);
  const navigate = useNavigate();

  const fetchAuxiliares = async () => {
    setCargando(true);
    try {
      const response = await api.get('/auth/companeros');
      setAuxiliares(response.data);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/');
      } else {
        console.error('Error al obtener los auxiliares', error);
      }
    } finally {
      setCargando(false);
    }
  };

  const fetchPerfil = async () => {
    try {
      const response = await api.get('/auth/me');
      setPerfil(response.data);
      // Un auxiliar no puede gestionar auxiliares — ni por URL directa
      if (response.data.rol !== 'RESPONSABLE') {
        navigate('/menu');
      }
    } catch (error) {
      console.error('Error al obtener el perfil', error);
    }
  };

  useEffect(() => {
    fetchAuxiliares();
    fetchPerfil();
  }, []);

  const esResponsable = perfil?.rol === 'RESPONSABLE';

  const handleBaja = async (aux: Auxiliar) => {
    const confirmar = window.confirm(
      `¿Dar de baja a ${aux.nombre_apellido} (MR ${aux.mr})?\n\nNo va a poder ingresar más al sistema. Su nombre sigue quedando en el historial de todo lo que ya hizo.`
    );
    if (!confirmar) return;

    try {
      await api.delete(`/auth/companeros/${aux.id_usuario}`);
      fetchAuxiliares();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al dar de baja al auxiliar');
    }
  };

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <Navbar titulo="Auxiliares de mi Cargo" />

      {/* Cuerpo Principal */}
      <main className="p-8 max-w-7xl mx-auto mt-4 flex-grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-superficie p-6 rounded-xl border border-borde shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-primario flex items-center gap-2">
              <Users className="text-acento w-6 h-6" /> Gestión de Auxiliares
            </h2>
            <p className="text-sm text-texto-sec mt-1">Personal autorizado para operar el control de inventario.</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primario hover:bg-primario-hover text-white font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Dar de Alta Auxiliar
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-superficie border border-borde rounded-xl shadow-sm overflow-hidden">
          {cargando ? (
            <div className="p-12 text-center text-texto-sec text-sm font-medium">
              Cargando auxiliares...
            </div>
          ) : auxiliares.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldAlert className="w-10 h-10 text-texto-sec/50 mx-auto mb-4" />
              <p className="text-texto-sec text-sm font-semibold">
                Todavía no hay auxiliares registrados en tu Cargo.
              </p>
              <p className="text-xs text-texto-sec/70 mt-1">Usá "Dar de Alta Auxiliar" para empezar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-fondo border-b border-borde text-texto-sec text-xs tracking-wide uppercase">
                    <th className="p-4 font-bold">M.R.</th>
                    <th className="p-4 font-bold">Nombre y Apellido</th>
                    <th className="p-4 font-bold">Rol</th>
                    {esResponsable && <th className="p-4"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {auxiliares.map((aux) => (
                    <tr key={aux.id_usuario} className="hover:bg-fondo transition-colors">
                      <td className="p-4 font-bold text-primario">
                        {aux.mr}
                      </td>
                      <td className="p-4 text-tinta font-medium">
                        {aux.nombre_apellido}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          aux.rol === 'RESPONSABLE'
                            ? 'bg-champagne/40 text-primario border-champagne'
                            : 'bg-acento/10 text-acento border-acento/30'
                        }`}>
                          {ETIQUETA_ROL[aux.rol] || aux.rol}
                        </span>
                      </td>
                      {esResponsable && (
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setResetObjetivo(aux)}
                              className="flex items-center gap-1.5 text-acento hover:underline text-xs font-bold cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" /> Resetear contraseña
                            </button>
                            <button
                              onClick={() => handleBaja(aux)}
                              className="flex items-center gap-1.5 text-baja hover:underline text-xs font-bold cursor-pointer"
                            >
                              <UserX className="w-3.5 h-3.5" /> Dar de baja
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <ModalNuevoAuxiliar
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAuxiliarCreado={fetchAuxiliares}
      />

      <ModalResetearPassword
        isOpen={!!resetObjetivo}
        onClose={() => setResetObjetivo(null)}
        idUsuario={resetObjetivo?.id_usuario ?? null}
        nombreUsuario={resetObjetivo?.nombre_apellido}
      />
    </div>
  );
}