import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ModalNuevoDestino from '../components/ModalNuevoDestino';
import { Shield, PlusCircle, Users, LogOut, LayoutDashboard, Terminal } from 'lucide-react'; // Íconos con onda

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
    <div className="min-h-screen bg-slate-950 text-slate-100 w-full flex flex-col font-sans selection:bg-lime-500 selection:text-black">
      {/* Navbar con estética de Terminal Científica */}
      <nav className="bg-slate-900 border-b-2 border-cyan-500/30 p-4 shadow-[0_4px_20px_rgba(6,182,212,0.15)] flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-400/40">
            <Shield className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-lime-400 uppercase">
              Inventario Patrimonial
            </h1>
            <p className="text-[10px] text-cyan-400/60 font-mono tracking-widest uppercase">System Status: Active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800 font-mono text-xs text-lime-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>ID_CARGO: AUTENTICADO</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs font-bold px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.1)]"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </nav>

      {/* Cuerpo Principal */}
      <main className="p-8 max-w-7xl mx-auto mt-4 flex-grow w-full">
        {/* Encabezado y Botonera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <LayoutDashboard className="text-lime-400 w-6 h-6" /> Destinos de la Jurisdicción
            </h2>
            <p className="text-sm text-slate-400 mt-1">Consola de administración y despliegue de infraestructura.</p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/dashboard/auxiliares')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-cyan-500/40 font-bold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(6,182,212,0.1)] cursor-pointer text-sm"
            >
              <Users className="w-4 h-4" /> Ver Auxiliares
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 text-slate-950 font-black px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(132,204,22,0.4)] transition-all duration-200 cursor-pointer text-sm tracking-wide transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" /> Nuevo Destino
            </button>
          </div>
        </div>

        {/* Grilla de Tarjetas Tecnológicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinos.length === 0 ? (
            <div className="col-span-full bg-slate-900/50 p-10 rounded-xl border-2 border-dashed border-slate-800 text-center shadow-inner">
              <div className="w-12 h-12 bg-slate-950 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">🔬</div>
              <p className="text-slate-400 font-medium font-mono text-sm">
                NO SE DETECTAN REGISTROS EN ESTA JURISDICCIÓN.
              </p>
              <p className="text-xs text-slate-600 mt-1">Use el comando de inicialización "Nuevo Destino" para comenzar.</p>
            </div>
          ) : (
            destinos.map(destino => (
              <div 
                key={destino.id_destino} 
                className="group relative bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-cyan-500/50 shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)] cursor-pointer overflow-hidden"
              >
                {/* Línea de neón superior oculta que brilla al hacer hover */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-lime-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors duration-200 tracking-wide uppercase">
                    {destino.nombre_destino}
                  </h3>
                  <span className="bg-slate-950 border border-slate-800 text-[10px] font-mono px-2 py-0.5 rounded text-slate-400 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                    NODE_{destino.id_destino}
                  </span>
                </div>
                
                <p className="text-xs font-mono text-slate-400 mt-2 bg-slate-950 p-2.5 rounded border border-slate-800/60">
                  <span className="text-cyan-500/70">COD_INTERNO:</span> <span className="font-bold text-lime-400">{destino.cod_destino}</span>
                </p>
                
                <div className="mt-5 pt-4 border-t border-slate-800/60 flex justify-end items-center text-xs font-bold text-slate-400 group-hover:text-lime-400 transition-colors duration-200">
                  <span>ACCEDER MÓDULOS</span>
                  <span className="ml-1 transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <ModalNuevoDestino 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onDestinoCreado={fetchDestinos} 
      />
    </div>
  );
}