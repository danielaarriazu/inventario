import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ModalNuevoAuxiliar from '../components/ModalNuevoAuxiliar';
import { Users, PlusCircle, ArrowLeft, ShieldAlert, Terminal, UserCheck } from 'lucide-react';

interface Auxiliar {
  id_usuario: number;
  mr: number | string;
  nombre_apellido: string;
  rol: string;
}

export default function Auxiliares() {
  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAuxiliares = async () => {
    try {
      // Le pega al nuevo endpoint protegido que armamos en el backend
      const response = await api.get('/auth/companeros');
      setAuxiliares(response.data);
    } catch (error) {
      console.error("Error al obtener los auxiliares", error);
      // Si el token expira o falla, nos resguarda devolviéndonos al login
      navigate('/');
    }
  };

  useEffect(() => {
    fetchAuxiliares();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 w-full flex flex-col font-sans selection:bg-lime-500 selection:text-black">
      {/* Navbar de la Sub-Consola */}
      <nav className="bg-slate-900 border-b-2 border-cyan-500/30 p-4 shadow-[0_4px_20px_rgba(6,182,212,0.15)] flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-lime-400 uppercase">
              Personal Auxiliar
            </h1>
            <p className="text-[10px] text-cyan-400/60 font-mono tracking-widest uppercase">Secured Sub-Module</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 font-mono text-xs text-lime-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>ROLES: OPERADOR_BUNKER</span>
        </div>
      </nav>

      {/* Cuerpo Principal */}
      <main className="p-8 max-w-7xl mx-auto mt-4 flex-grow w-full">
        {/* Encabezado del Módulo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Users className="text-cyan-400 w-6 h-6" /> Gestión de Operadores y Ayudantes
            </h2>
            <p className="text-sm text-slate-400 mt-1">Asignación de operadores técnicos autorizados para el control de stock.</p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-black px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-all duration-200 cursor-pointer text-sm tracking-wide transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" /> Dar de Alta Auxiliar
          </button>
        </div>

        {/* Tabla Estilo Servidor / Terminal */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
          {auxiliares.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-mono text-sm font-semibold uppercase tracking-wider">
                No se detecta personal auxiliar registrado en su cargo aún.
              </p>
              <p className="text-xs text-slate-600 mt-1 font-sans">Use el comando de inicialización superior para registrar operadores.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-sm">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-cyan-400 text-xs tracking-wider uppercase">
                    <th className="p-4 font-bold">M.R. (Usuario)</th>
                    <th className="p-4 font-bold">Nombre y Apellido</th>
                    <th className="p-4 font-bold">Rol Operacional</th>
                    <th className="p-4 font-bold text-center">Estado de Red</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {auxiliares.map((aux) => (
                    <tr key={aux.id_usuario} className="hover:bg-slate-950/60 transition-colors group">
                      <td className="p-4 text-lime-400 font-bold group-hover:text-lime-300">
                        {aux.mr}
                      </td>
                      <td className="p-4 text-slate-200 font-sans font-medium">
                        {aux.nombre_apellido}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold border ${
                          aux.rol === 'AUDITOR' 
                            ? 'bg-purple-950/40 text-purple-400 border-purple-500/30' 
                            : 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30'
                        }`}>
                          {aux.rol}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs text-lime-400 bg-lime-950/30 px-2 py-0.5 rounded border border-lime-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
                          ONLINE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Conectado */}
      <ModalNuevoAuxiliar 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAuxiliarCreado={fetchAuxiliares} 
      />
    </div>
  );
}