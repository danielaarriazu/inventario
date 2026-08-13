import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import EncabezadoImpreso from '../components/EncabezadoImpreso';
import { Printer, ArrowLeft } from 'lucide-react';

const CONEXION_ETIQUETAS: Record<string, string> = {
  RINA: 'RINA',
  INTERNET_ARA: 'INTERNET ARA',
  INTERNET: 'INTERNET',
  SIN_CONEXION: 'SIN CONEXIÓN',
};

const ETIQUETAS_CAMPO: Record<string, string> = {
  numero_equipo: 'N° de Equipo',
  nombre_usuario_red: 'Nombre de Usuario',
  usuario_responsable: 'Usuario Responsable',
  procesador: 'Procesador',
  ram_capacidad: 'Capacidad RAM',
  tipo_ram: 'Tipo de RAM',
  disco: 'Disco',
  hardware_otros: 'Otros (Hardware)',
  monitor_modelo: 'Monitor',
  monitor_tamano: 'Tamaño de Monitor',
  impresora_modelo: 'Impresora',
  impresora_insumos: 'Insumos de Impresora',
  tiene_teclado: 'Teclado',
  tiene_mouse: 'Mouse',
  perifericos_otros: 'Otros Periféricos',
};

// Junta renglones de "otros" (guardados separados por salto de línea) con
// comas, para que entren en el único renglón "OTROS" de la planilla impresa
const aComas = (valor: string | null | undefined) => {
  if (!valor) return '—';
  return valor.split('\n').filter(v => v.trim()).join(', ');
};

// Convierte el JSON de detalle_cambios en una lista legible de "qué cambió"
const formatearCambios = (detalleCambiosStr: string): string[] => {
  try {
    const cambios = JSON.parse(detalleCambiosStr);
    return Object.entries(cambios).map(([campo, valores]: [string, any]) => {
      const etiqueta = ETIQUETAS_CAMPO[campo] || campo;
      const antes = valores?.antes ?? '—';
      const despues = valores?.despues ?? '—';
      return `${etiqueta}: ${antes} → ${despues}`;
    });
  } catch {
    return [];
  }
};

export default function ImprimirFicha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipo, setEquipo] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [encabezado, setEncabezado] = useState<any>(null);
  const [qrImage, setQrImage] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/equipos/${id}`),
      api.get(`/auditoria/equipo/${id}`),
      api.get('/cargo/encabezado'),
      api.get(`/equipos/${id}/qr`),
    ]).then(([eq, hist, enc, qr]) => {
      setEquipo(eq.data);
      setHistorial(hist.data);
      setEncabezado(enc.data);
      setQrImage(qr.data.qr_image);
    }).catch((err: any) => {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/');
    });
  }, [id, navigate]);

  if (!equipo || !encabezado) {
    return <div className="min-h-screen flex items-center justify-center text-texto-sec">Cargando...</div>;
  }

  const reparaciones = historial.filter((h: any) => h.tipo_accion === 'REPARACION');
  const props = {
    linea1: encabezado.encabezado_linea1,
    destino: encabezado.encabezado_destino,
    linea3: encabezado.encabezado_linea3,
    titulo: encabezado.encabezado_titulo,
    anio: encabezado.encabezado_anio,
  };

  const filaSeccion = 'border border-tinta p-1.5 font-bold text-[10.5px] uppercase align-middle';
  const filaValor = 'border border-tinta p-1.5 text-[10.5px] align-middle';
  const celdaVertical = 'border border-tinta text-center align-middle font-bold text-[10px] w-6 leading-tight';

  return (
    <div className="min-h-screen bg-fondo text-tinta">
      <div className="print:hidden bg-primario p-4 flex justify-between items-center">
        <button onClick={() => navigate(`/equipos/${id}`)} className="flex items-center gap-2 text-white text-sm font-bold cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-primario font-bold px-4 py-2 rounded-lg text-sm cursor-pointer">
          <Printer className="w-4 h-4" /> Imprimir
        </button>
      </div>

      {/* Hoja 1 — datos del equipo */}
      <div className="max-w-2xl mx-auto bg-white p-8 print:p-0 my-6 print:my-0 shadow print:shadow-none">
        <EncabezadoImpreso {...props} />

        <div className="relative">
          {qrImage && (
            <div className="absolute top-20 right-0 text-center z-10">
              <img src={qrImage} alt="QR del equipo" className="w-16 h-16" />
              <div className="text-[8px] text-texto-sec">{equipo.numero_equipo}</div>
            </div>
          )}
          <table className="w-full border-collapse">
          <tbody>
            {/* INFO */}
            <tr>
              <td rowSpan={5} className={celdaVertical}>I<br />N<br />F<br />O</td>
              <td className={filaSeccion}>N° DE EQUIPO</td>
              <td className={filaValor}>{equipo.nombre_equipo}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>OFICINA</td>
              <td className={filaValor}>{equipo.oficina?.numero_oficina}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>USUARIO RESPONSABLE</td>
              <td className={filaValor}>{equipo.usuario_responsable}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>NOMBRE DE EQUIPO</td>
              <td className={filaValor}>{equipo.numero_equipo}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>NOMBRE DE USUARIO</td>
              <td className={filaValor}>{equipo.nombre_usuario_red}</td>
            </tr>

            <tr><td colSpan={3} className="bg-gray-400 border border-tinta h-2"></td></tr>

            {/* SOFT */}
            <tr>
              <td rowSpan={3} className={celdaVertical}>S<br />O<br />F<br />T</td>
              <td className={filaSeccion}>TRABAJA CON CONEXIÓN A</td>
              <td className={filaValor}>{CONEXION_ETIQUETAS[equipo.dominio_conexion] ?? equipo.dominio_conexion}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>SISTEMA OPERATIVO</td>
              <td className={filaValor}>{equipo.sistema_operativo?.replace('WINDOWS_', 'Windows ')}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>ARQUITECTURA</td>
              <td className={filaValor}>{equipo.arquitectura?.replace('BITS_', '')} bits</td>
            </tr>

            <tr><td colSpan={3} className="bg-gray-400 border border-tinta h-2"></td></tr>

            {/* HARDWARE + PERIFÉRICOS */}
            <tr>
              <td rowSpan={12} className={celdaVertical}>H<br />A<br />R<br />D<br />W<br />A<br />R<br />E</td>
              <td className={filaSeccion}>PROCESADOR</td>
              <td className={filaValor}>{equipo.procesador}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>RAM</td>
              <td className={filaValor}>{equipo.ram_capacidad} ({equipo.tipo_ram})</td>
            </tr>
            <tr>
              <td className={filaSeccion}>DISCO</td>
              <td className={filaValor}>{equipo.disco}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>OTROS</td>
              <td className={filaValor}>{aComas(equipo.hardware_otros)}</td>
            </tr>

            <tr>
              <td colSpan={2} className="bg-gray-400 border border-tinta text-center text-[9.5px] font-bold py-0.5 uppercase">
                Elementos Periféricos
              </td>
            </tr>

            <tr>
              <td className={filaSeccion}>MONITOR</td>
              <td className={filaValor}>{equipo.monitor_modelo}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>TAMAÑO</td>
              <td className={filaValor}>{equipo.monitor_tamano}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>IMPRESORA</td>
              <td className={filaValor}>{equipo.impresora_modelo || '—'}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>INSUMOS</td>
              <td className={filaValor}>{equipo.impresora_insumos || '—'}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>TECLADO</td>
              <td className={filaValor}>{equipo.tiene_teclado ? 'Sí' : 'No'}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>MOUSE</td>
              <td className={filaValor}>{equipo.tiene_mouse ? 'Sí' : 'No'}</td>
            </tr>
            <tr>
              <td className={filaSeccion}>OTROS</td>
              <td className={filaValor}>{aComas(equipo.perifericos_otros)}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      {/* Hoja 2 — historial de reparaciones, para imprimir a doble faz */}
      <div className="max-w-2xl mx-auto bg-white p-8 print:p-0 my-6 print:my-0 shadow print:shadow-none print:break-before-page">
        <EncabezadoImpreso {...props} />

        <div className="text-xs font-bold uppercase mb-2 border-b border-tinta pb-1">
          Historial de Reparaciones — {equipo.numero_equipo}
        </div>

        {reparaciones.length === 0 ? (
          <p className="text-xs text-texto-sec">Sin reparaciones registradas.</p>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-tinta text-left">
                <th className="py-1 pr-2 w-20">Fecha</th>
                <th className="py-1 pr-2">Qué cambió</th>
                <th className="py-1">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {reparaciones.map((r: any) => {
                const cambios = formatearCambios(r.detalle_cambios);
                return (
                  <tr key={r.id_historial} className="border-b border-borde align-top">
                    <td className="py-1.5 pr-2 whitespace-nowrap">{new Date(r.fecha_modificacion).toLocaleDateString('es-AR')}</td>
                    <td className="py-1.5 pr-2">
                      {cambios.length === 0 ? '—' : cambios.map((c, i) => <div key={i}>{c}</div>)}
                    </td>
                    <td className="py-1.5">{r.observaciones || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}