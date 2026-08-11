import { Plus, X } from 'lucide-react';

interface CampoMultilineaProps {
  valores: string[];
  onChange: (valores: string[]) => void;
  placeholder?: string;
}

// Campo de texto con botón "+" para agregar renglones extra (usado en
// Hardware > Otros y Periféricos > Otros, en el Alta, la Ficha y Movimientos)
export default function CampoMultilinea({ valores, onChange, placeholder }: CampoMultilineaProps) {
  const lista = valores.length > 0 ? valores : [''];

  const actualizar = (i: number, valor: string) => {
    const nuevos = [...lista];
    nuevos[i] = valor;
    onChange(nuevos);
  };

  const agregar = () => onChange([...lista, '']);

  const quitar = (i: number) => {
    const nuevos = lista.filter((_, idx) => idx !== i);
    onChange(nuevos.length > 0 ? nuevos : ['']);
  };

  return (
    <div className="space-y-1.5">
      {lista.map((valor, i) => (
        <div key={i} className="flex gap-1.5">
          <input
            value={valor}
            onChange={(e) => actualizar(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 p-2 border border-borde rounded text-sm bg-superficie focus:outline-none focus:ring-2 focus:ring-acento text-tinta"
          />
          {lista.length > 1 && (
            <button
              type="button"
              onClick={() => quitar(i)}
              className="text-texto-sec hover:text-baja px-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={agregar}
        className="flex items-center gap-1 text-acento text-xs font-bold cursor-pointer hover:underline"
      >
        <Plus className="w-3.5 h-3.5" /> Agregar otro
      </button>
    </div>
  );
}