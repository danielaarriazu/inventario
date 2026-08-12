import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import EncabezadoImpreso from '../components/EncabezadoImpreso';
import { Printer, ArrowLeft } from 'lucide-react';

export default function ImprimirOficina() {
  const { idOficina } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const numeroOficina = (location.state as { numeroOficina?: string })?.numeroOficina;

  const [equipos, setEquipos] = useState<any[]>([]);
  const [historiales, setHistoriales] = useState<Record<number, any[]>>({});
  const [encabezado, setEncabezado] = useState<{ encabezado_destino: string; encabezado_anio: string } | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [eqRes, encRes] = await Promise.all([
          api.get(`/equipos?id_oficina=${idOficina}`),
          api.get('/cargo/encabezado'),
        ]);
        setEquipos(eqRes.data);
        setEncabezado(encRes.data);

        const historiasPorEquipo: Record<number, any[]> = {};
        await Promise.all(eqRes.data.map(async (eq: any) => {
          const h = await api.get(`/auditoria/equipo/${eq.id_planilla}`);
          historiasPorEquipo[eq.id_planilla] = h.data.filter((x: any) => x.tipo_accion === 'REPARACION');
        }));
        setHistoriales(historiasPorEquipo);
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) navigate('/');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [idOficina, navigate]);

  if (cargando || !encabezado) {
    return <div className="min-h-screen flex items-center justify-center text-texto-sec">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-fondo text-tinta">
      <div className="print:hidden bg-primario p-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white text-sm font-bold cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-primario font-bold px-4 py-2 rounded-lg text-sm cursor-pointer">
          <Printer className="w-4 h-4" /> Imprimir ({equipos.length} planillas)
        </button>
      </div>

      {equipos.length === 0 ? (
        <p className="text-center text-texto-sec text-sm mt-10">No hay equipos cargados en esta oficina.</p>
      ) : (
        <div className="max-w-2xl mx-auto">
          {equipos.map((equipo, i) => (
            <div
              key={equipo.id_planilla}
              className={`bg-white p-8 print:p-0 my-6 print:my-0 shadow print:shadow-none text-sm ${i > 0 ? 'print:break-before-page' : ''}`}
            >
              <EncabezadoImpreso destino={encabezado.encabezado_destino} anio={encabezado.encabezado_anio} />

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-4">
                <div><b>N° Equipo:</b> {equipo.numero_equipo}</div>
                <div><b>Nombre de PC:</b> {equipo.nombre_equipo}</div>
                <div><b>Responsable:</b> {equipo.usuario_responsable}</div>
                <div><b>Oficina:</b> {equipo.oficina?.numero_oficina ?? numeroOficina}</div>
                <div><b>Usuario de Red:</b> {equipo.nombre_usuario_red}</div>
                <div><b>Dominio:</b> {equipo.dominio_conexion}</div>
                <div><b>Sistema Operativo:</b> {equipo.sistema_operativo}</div>
                <div><b>Arquitectura:</b> {equipo.arquitectura}</div>
              </div>

              <div className="border-t border-tinta pt-2 mb-1 font-bold text-xs uppercase">Hardware</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-4">
                <div><b>Procesador:</b> {equipo.procesador}</div>
                <div><b>RAM:</b> {equipo.ram_capacidad} ({equipo.tipo_ram})</div>
                <div><b>Disco:</b> {equipo.disco}</div>
              </div>

              <div className="border-t border-tinta pt-2 mb-1 font-bold text-xs uppercase">Periféricos</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-4">
                <div><b>Monitor:</b> {equipo.monitor_modelo} {equipo.monitor_tamano}</div>
                <div><b>Impresora:</b> {equipo.impresora_modelo || '—'}</div>
              </div>

              <div className="border-t border-tinta pt-2 mb-1 font-bold text-xs uppercase">Historial de Reparaciones</div>
              {(historiales[equipo.id_planilla]?.length ?? 0) === 0 ? (
                <p className="text-xs text-texto-sec">Sin reparaciones registradas.</p>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-tinta text-left">
                      <th className="py-1 pr-2">Fecha</th>
                      <th className="py-1 pr-2">Realizado por</th>
                      <th className="py-1">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historiales[equipo.id_planilla].map((r: any) => (
                      <tr key={r.id_historial} className="border-b border-borde">
                        <td className="py-1 pr-2 whitespace-nowrap">{new Date(r.fecha_modificacion).toLocaleDateString('es-AR')}</td>
                        <td className="py-1 pr-2 whitespace-nowrap">{r.usuario ? `${r.usuario.nombre_apellido} (MR ${r.usuario.mr})` : '—'}</td>
                        <td className="py-1">{r.observaciones || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="flex justify-between mt-16 text-xs">
                <div className="text-center w-2/5 border-t border-tinta pt-1">Firma del Responsable</div>
                <div className="text-center w-2/5 border-t border-tinta pt-1">Firma de Informática</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}