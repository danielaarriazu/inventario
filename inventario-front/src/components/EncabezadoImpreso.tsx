interface Props {
  linea1: string;
  destino: string;
  linea3: string;
  titulo: string;
  anio: string;
}

// El encabezado de la planilla — las 5 líneas, todas configurables por el Responsable
export default function EncabezadoImpreso({ linea1, destino, linea3, titulo, anio }: Props) {
  return (
    <div className="text-center mb-4 pb-3 border-b-2 border-tinta text-tinta">
      <div className="text-xs">{linea1}</div>
      <div className="text-base font-bold underline mt-1">{destino}</div>
      <div className="text-sm font-bold underline mt-1">{linea3}</div>
      <div className="text-sm font-bold underline mt-1 leading-tight">{titulo}</div>
      <div className="text-xs mt-1">AÑO {anio}</div>
    </div>
  );
}