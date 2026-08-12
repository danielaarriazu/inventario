interface Props {
  destino: string;
  anio: string;
}

// El encabezado estándar de la planilla — fijo salvo Destino y Año,
// que configura el Responsable desde el Sidebar
export default function EncabezadoImpreso({ destino, anio }: Props) {
  return (
    <div className="text-center mb-6 pb-4 border-b-2 border-tinta text-tinta">
      <div className="text-xs">DIVISION INFORMATICA</div>
      <div className="text-base font-bold underline mt-1">{destino}</div>
      <div className="text-sm font-bold underline mt-1">CARGO DE INFORMATICA</div>
      <div className="text-sm font-bold underline mt-1 leading-tight">
        PLANILLA DE CONSIGNACION INTERNA DE<br />EQUIPOS INFORMATICOS
      </div>
      <div className="text-xs mt-1">AÑO {anio}</div>
    </div>
  );
}