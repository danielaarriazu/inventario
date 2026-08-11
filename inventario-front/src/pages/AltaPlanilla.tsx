import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CampoMultilinea from '../components/CampoMultilinea';
import { ArrowLeft } from 'lucide-react';

interface OpcionSimple { id: number; nombre: string; }

const inputClass = "w-full p-2.5 border border-borde rounded-lg text-sm bg-superficie focus:outline-none focus:ring-2 focus:ring-acento text-tinta";
const labelClass = "text-xs font-bold text-texto-sec uppercase tracking-wide block mb-1";

export default function AltaPlanilla() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [destinos, setDestinos] = useState<OpcionSimple[]>([]);
  const [departamentos, setDepartamentos] = useState<OpcionSimple[]>([]);
  const [divisiones, setDivisiones] = useState<OpcionSimple[]>([]);
  const [oficinas, setOficinas] = useState<OpcionSimple[]>([]);
  const [selDestino, setSelDestino] = useState('');
  const [selDepartamento, setSelDepartamento] = useState('');
  const [selDivision, setSelDivision] = useState('');
  const [selOficina, setSelOficina] = useState('');

  const [hardwareOtros, setHardwareOtros] = useState<string[]>(['']);
  const [perifericosOtros, setPerifericosOtros] = useState<string[]>(['']);

  const [form, setForm] = useState({
    numero_equipo: '',
    usuario_responsable: '',
    nombre_usuario_red: '',
    dominio_conexion: 'RINA',
    sistema_operativo: 'WINDOWS_11',
    arquitectura: 'BITS_64',
    procesador: '',
    tipo_ram: 'DDR4',
    ram_capacidad: '',
    disco: '',
    monitor_modelo: '',
    monitor_tamano: '',
    impresora_modelo: '',
    impresora_insumos: '',
    tiene_teclado: true,
    tiene_mouse: true,
  });

  const setCampo = (campo: string, valor: any) => setForm(prev => ({ ...prev, [campo]: valor }));

  useEffect(() => {
    api.get('/destinos').then(res => {
      setDestinos(res.data.map((d: any) => ({ id: d.id_destino, nombre: d.nombre_destino })));
    }).catch((err: any) => {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/');
    });
  }, [navigate]);

  useEffect(() => {
    setSelDepartamento(''); setDepartamentos([]);
    setSelDivision(''); setDivisiones([]);
    setSelOficina(''); setOficinas([]);
    if (!selDestino) return;
    api.get(`/departamentos?id_destino=${selDestino}`).then(res => {
      setDepartamentos(res.data.map((d: any) => ({ id: d.id_departamento, nombre: d.nombre_departamento })));
    });
  }, [selDestino]);

  useEffect(() => {
    setSelDivision(''); setDivisiones([]);
    setSelOficina(''); setOficinas([]);
    if (!selDepartamento) return;
    api.get(`/divisiones?id_departamento=${selDepartamento}`).then(res => {
      setDivisiones(res.data.map((d: any) => ({ id: d.id_division, nombre: d.nombre_division })));
    });
  }, [selDepartamento]);

  useEffect(() => {
    setSelOficina(''); setOficinas([]);
    if (!selDivision) return;
    api.get(`/oficinas?id_division=${selDivision}`).then(res => {
      setOficinas(res.data.map((o: any) => ({ id: o.id_oficina, nombre: o.numero_oficina })));
    });
  }, [selDivision]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selOficina) { setError('Elegí la oficina donde va a estar el equipo'); return; }
    if (!form.numero_equipo || !form.usuario_responsable || !form.nombre_usuario_red || !form.procesador || !form.ram_capacidad || !form.disco) {
      setError('Completá todos los campos obligatorios');
      return;
    }

    setGuardando(true);
    try {
      const response = await api.post('/equipos', {
        ...form,
        id_oficina: Number(selOficina),
        hardware_otros: hardwareOtros.filter(v => v.trim()).join('\n') || null,
        perifericos_otros: perifericosOtros.filter(v => v.trim()).join('\n') || null,
      });
      navigate(`/equipos/${response.data.id_planilla}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar el equipo');
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <nav className="bg-primario p-4 shadow-md flex items-center gap-3 w-full">
        <button onClick={() => navigate('/dashboard/equipos')} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white tracking-wide">Alta de Nueva Planilla</h1>
      </nav>

      <main className="p-6 max-w-3xl mx-auto w-full flex-grow">
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="bg-baja/10 text-baja border border-baja/30 rounded-lg p-3 text-sm font-semibold">{error}</div>
          )}

          <div className="bg-superficie border border-borde rounded-xl p-5">
            <h3 className="text-xs font-bold text-acento uppercase tracking-wide mb-3">Ubicación y responsable</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <select value={selDestino} onChange={e => setSelDestino(e.target.value)} className={inputClass}>
                <option value="">Destino...</option>
                {destinos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <select value={selDepartamento} onChange={e => setSelDepartamento(e.target.value)} disabled={!selDestino} className={`${inputClass} disabled:opacity-50`}>
                <option value="">Departamento...</option>
                {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <select value={selDivision} onChange={e => setSelDivision(e.target.value)} disabled={!selDepartamento} className={`${inputClass} disabled:opacity-50`}>
                <option value="">División...</option>
                {divisiones.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <select value={selOficina} onChange={e => setSelOficina(e.target.value)} disabled={!selDivision} className={`${inputClass} disabled:opacity-50`}>
                <option value="">Oficina...</option>
                {oficinas.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>N° de Equipo</label>
                <input value={form.numero_equipo} onChange={e => setCampo('numero_equipo', e.target.value)} placeholder="Ej: SGNAWI0001" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Usuario Responsable</label>
                <input value={form.usuario_responsable} onChange={e => setCampo('usuario_responsable', e.target.value)} placeholder="Ej: TF GOMEZ" className={inputClass} />
              </div>
            </div>
          </div>

          <div className="bg-superficie border border-borde rounded-xl p-5">
            <h3 className="text-xs font-bold text-acento uppercase tracking-wide mb-3">Software y red</h3>
            <div className="bg-champagne/40 border border-champagne rounded-lg p-2.5 mb-3 text-xs text-primario">
              El <b>nombre de PC</b> se genera solo, a partir de la oficina y el dominio elegidos (ej: <code>13-111.R5</code>) — no hace falta cargarlo a mano.
            </div>
            <div className="mb-3">
              <label className={labelClass}>Usuario de Red</label>
              <input value={form.nombre_usuario_red} onChange={e => setCampo('nombre_usuario_red', e.target.value)} placeholder="Ej: SGNA.INFORMATICA" className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Dominio</label>
                <select value={form.dominio_conexion} onChange={e => setCampo('dominio_conexion', e.target.value)} className={inputClass}>
                  <option value="RINA">RINA</option>
                  <option value="INTERNET_ARA">INTERNET_ARA</option>
                  <option value="INTERNET">INTERNET</option>
                  <option value="SIN_CONEXION">SIN_CONEXION</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Sistema Operativo</label>
                <select value={form.sistema_operativo} onChange={e => setCampo('sistema_operativo', e.target.value)} className={inputClass}>
                  <option value="WINDOWS_11">Windows 11</option>
                  <option value="WINDOWS_10">Windows 10</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Arquitectura</label>
                <select value={form.arquitectura} onChange={e => setCampo('arquitectura', e.target.value)} className={inputClass}>
                  <option value="BITS_64">64 bits</option>
                  <option value="BITS_32">32 bits</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-superficie border border-borde rounded-xl p-5">
            <h3 className="text-xs font-bold text-acento uppercase tracking-wide mb-3">Hardware</h3>
            <div className="mb-3">
              <label className={labelClass}>Procesador</label>
              <input value={form.procesador} onChange={e => setCampo('procesador', e.target.value)} placeholder="Ej: AMD Ryzen 7 5700" className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className={labelClass}>Capacidad RAM</label>
                <input value={form.ram_capacidad} onChange={e => setCampo('ram_capacidad', e.target.value)} placeholder="Ej: 8GB" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tipo de RAM</label>
                <select value={form.tipo_ram} onChange={e => setCampo('tipo_ram', e.target.value)} className={inputClass}>
                  <option value="DDR5">DDR5</option>
                  <option value="DDR4">DDR4</option>
                  <option value="DDR3">DDR3</option>
                  <option value="DDR2">DDR2</option>
                  <option value="DDR">DDR</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Disco</label>
                <input value={form.disco} onChange={e => setCampo('disco', e.target.value)} placeholder="Ej: 1TB HDD" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Otros (opcional)</label>
              <CampoMultilinea valores={hardwareOtros} onChange={setHardwareOtros} placeholder="Ej: placa de video agregada" />
            </div>
          </div>

          <div className="bg-superficie border border-borde rounded-xl p-5">
            <h3 className="text-xs font-bold text-acento uppercase tracking-wide mb-3">Periféricos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelClass}>Monitor (modelo)</label>
                <input value={form.monitor_modelo} onChange={e => setCampo('monitor_modelo', e.target.value)} placeholder="Ej: Philips 22&quot;" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Monitor (tamaño)</label>
                <input value={form.monitor_tamano} onChange={e => setCampo('monitor_tamano', e.target.value)} placeholder="Ej: 22 pulgadas" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Impresora (modelo)</label>
                <input value={form.impresora_modelo} onChange={e => setCampo('impresora_modelo', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Impresora (insumos)</label>
                <input value={form.impresora_insumos} onChange={e => setCampo('impresora_insumos', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-6 mb-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.tiene_teclado} onChange={e => setCampo('tiene_teclado', e.target.checked)} /> Tiene teclado
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.tiene_mouse} onChange={e => setCampo('tiene_mouse', e.target.checked)} /> Tiene mouse
              </label>
            </div>
            <div>
              <label className={labelClass}>Otros periféricos (opcional)</label>
              <CampoMultilinea valores={perifericosOtros} onChange={setPerifericosOtros} placeholder="Ej: parlantes externos" />
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-primario hover:bg-primario-hover text-white font-bold p-3.5 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar planilla'}
          </button>
        </form>
      </main>
    </div>
  );
}