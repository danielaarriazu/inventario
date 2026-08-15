import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Printer, ArrowLeft } from 'lucide-react';

interface Equipo {
  id_planilla: number;
  numero_equipo: string;
}


export default function ImprimirQRsOficina() {
  const { idOficina } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const numeroOficina = (location.state as { numeroOficina?: string })?.numeroOficina;

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [qrImages, setQrImages] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const eqRes = await api.get(`/equipos?id_oficina=${idOficina}`);
        setEquipos(eqRes.data);

        const qrsPorEquipo: Record<number, string> = {};
        await Promise.all(eqRes.data.map(async (eq: Equipo) => {
          const qr = await api.get(`/equipos/${eq.id_planilla}/qr`);
          qrsPorEquipo[eq.id_planilla] = qr.data.qr_image;
        }));
        setQrImages(qrsPorEquipo);
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) navigate('/');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [idOficina, navigate]);

  if (cargando) {
    return <div className="min-h-screen flex items-center justify-center text-texto-sec">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-fondo text-tinta">
      <div className="print:hidden bg-primario p-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white text-sm font-bold cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-primario font-bold px-4 py-2 rounded-lg text-sm cursor-pointer">
          <Printer className="w-4 h-4" /> Imprimir ({equipos.length} QR)
        </button>
      </div>

      <div className="print:hidden text-center text-sm text-texto-sec py-3">
        QRs de Oficina {numeroOficina ?? idOficina}
      </div>

      {equipos.length === 0 ? (
        <p className="text-center text-texto-sec text-sm mt-10">No hay equipos cargados en esta oficina.</p>
      ) : (
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-4 p-6 print:p-4 bg-white">
          {equipos.map(eq => (
            <div key={eq.id_planilla} className="text-center border border-borde print:border-tinta rounded p-2 break-inside-avoid">
              {qrImages[eq.id_planilla] && (
                <img src={qrImages[eq.id_planilla]} alt={`QR de ${eq.numero_equipo}`} className="w-full" />
              )}
              <div className="text-xs font-bold mt-1">{eq.numero_equipo}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}