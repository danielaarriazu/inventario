import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EscanerQR from '../components/EscanerQR';
import { ArrowLeft, Search, X, CheckCircle2, QrCode } from 'lucide-react';

interface Equipo {
  id_planilla: number;
  numero_equipo: string;
  nombre_equipo: string;
  usuario_responsable: string;
  oficina?: { numero_oficina: string };
}
interface Perfil { nombre_apellido: string; mr: string; }
interface OpcionSimple { id: number; nombre: string; }

const TIPOS_ACCION = [
  { valor: 'TRASPASO', etiqueta: 'Traspaso' },
  { valor: 'MANTENIMIENTO_PREVENTIVO', etiqueta: 'Mant. Preventivo' },
  { valor: 'REPARACION', etiqueta: 'Reparación' },
  { valor: 'BAJA_DEFINITIVA', etiqueta: 'Baja' },
];

export default function Movimientos() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  // Búsqueda de equipo
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Equipo | null>(null);
  const [escaneando, setEscaneando] = useState(false);

  // Tipo de acción
  const [tipoAccion, setTipoAccion] = useState('');

  // Ubicación en cascada (solo para TRASPASO)
  const [destinos, setDestinos] = useState<OpcionSimple[]>([]);
  const [departamentos, setDepartamentos] = useState<OpcionSimple[]>([]);
  const [divisiones, setDivisiones] = useState<OpcionSimple[]>([]);
  const [oficinasDestino, setOficinasDestino] = useState<OpcionSimple[]>([]);
  const [selDestino, setSelDestino] = useState('');
  const [selDepartamento, setSelDepartamento] = useState('');
  const [selDivision, setSelDivision] = useState('');
  const [selOficina, setSelOficina] = useState('');

  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const [perfilRes, equiposRes, destinosRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/equipos'),
          api.get('/destinos'),
        ]);
        setPerfil(perfilRes.data);
        setEquipos(equiposRes.data);
        setDestinos(destinosRes.data.map((d: any) => ({ id: d.id_destino, nombre: d.nombre_destino })));
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) navigate('/');
      }
    };
    cargarInicial();
  }, [navigate]);

  // Cascada: destino -> departamentos
  useEffect(() => {
    setSelDepartamento(''); setDepartamentos([]);
    setSelDivision(''); setDivisiones([]);
    setSelOficina(''); setOficinasDestino([]);
    if (!selDestino) return;
    api.get(`/departamentos?id_destino=${selDestino}`).then(res => {
      setDepartamentos(res.data.map((d: any) => ({ id: d.id_departamento, nombre: d.nombre_departamento })));
    });
  }, [selDestino]);

  // Cascada: departamento -> divisiones
  useEffect(() => {
    setSelDivision(''); setDivisiones([]);
    setSelOficina(''); setOficinasDestino([]);
    if (!selDepartamento) return;
    api.get(`/divisiones?id_departamento=${selDepartamento}`).then(res => {
      setDivisiones(res.data.map((d: any) => ({ id: d.id_division, nombre: d.nombre_division })));
    });
  }, [selDepartamento]);

  // Cascada: división -> oficinas
  useEffect(() => {
    setSelOficina(''); setOficinasDestino([]);
    if (!selDivision) return;
    api.get(`/oficinas?id_division=${selDivision}`).then(res => {
      setOficinasDestino(res.data.map((o: any) => ({ id: o.id_oficina, nombre: o.numero_oficina })));
    });
  }, [selDivision]);

  const resultadosBusqueda = busqueda.trim().length > 0
    ? equipos.filter(eq =>
        eq.numero_equipo.toLowerCase().includes(busqueda.toLowerCase()) ||
        eq.nombre_equipo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        eq.usuario_responsable?.toLowerCase().includes(busqueda.toLowerCase())
      ).slice(0, 6)
    : [];

  const resetForm = () => {
    setEquipoSeleccionado(null);
    setBusqueda('');
    setTipoAccion('');
    setObservaciones('');
    setSelDestino(''); setSelDepartamento(''); setSelDivision(''); setSelOficina('');
  };

  const handleQRDetectado = (textoLeido: string) => {
    setEscaneando(false);
    if (!textoLeido) {
      setError('No se pudo acceder a la cámara o no se detectó ningún QR.');
      return;
    }
    // El QR trae una URL tipo https://.../equipos/123 — nos quedamos con el ID del final
    const match = textoLeido.match(/\/equipos\/(\d+)/);
    const id = match ? Number(match[1]) : null;
    if (!id) {
      setError('El código escaneado no corresponde a un equipo de este sistema.');
      return;
    }
    const encontrado = equipos.find(eq => eq.id_planilla === id);
    if (!encontrado) {
      setError('El equipo escaneado no se encontró en tu listado.');
      return;
    }
    setError('');
    setEquipoSeleccionado(encontrado);
    setBusqueda('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMensaje('');

    if (!equipoSeleccionado) { setError('Elegí un equipo'); return; }
    if (!tipoAccion) { setError('Elegí el tipo de acción'); return; }
    if (tipoAccion === 'TRASPASO' && !selOficina) { setError('Elegí la oficina destino'); return; }

    setEnviando(true);
    try {
      await api.post(`/equipos/${equipoSeleccionado.id_planilla}/movimiento`, {
        tipo_accion: tipoAccion,
        id_oficina_destino: tipoAccion === 'TRASPASO' ? Number(selOficina) : undefined,
        observaciones: observaciones || undefined,
      });
      setMensaje('Movimiento guardado correctamente.');
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar el movimiento');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-fondo text-tinta w-full flex flex-col">
      <nav className="bg-primario p-4 shadow-md flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/menu')} className="bg-white/10 p-2 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Movimientos</h1>
        </div>
        {perfil && (
          <div className="bg-white/10 px-3 py-1.5 rounded-md text-xs text-white/90 font-semibold">
            {perfil.nombre_apellido} · MR {perfil.mr}
          </div>
        )}
      </nav>

      <main className="p-5 max-w-lg w-full mx-auto flex-grow">
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">

          {mensaje && (
            <div className="flex items-center gap-2 bg-activo/10 text-activo border border-activo/30 rounded-lg p-3 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {mensaje}
            </div>
          )}
          {error && (
            <div className="bg-baja/10 text-baja border border-baja/30 rounded-lg p-3 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* 1. Equipo */}
          <div>
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Equipo</label>

            {equipoSeleccionado ? (
              <div className="mt-1 flex items-center justify-between bg-superficie border border-acento/40 rounded-lg p-3">
                <div>
                  <div className="font-bold text-sm text-primario">{equipoSeleccionado.numero_equipo}</div>
                  <div className="text-xs text-texto-sec">
                    {equipoSeleccionado.usuario_responsable} · Oficina {equipoSeleccionado.oficina?.numero_oficina}
                  </div>
                </div>
                <button type="button" onClick={() => setEquipoSeleccionado(null)} className="text-texto-sec hover:text-baja cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mt-1 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-texto-sec absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="N° de patrimonio, nombre de PC o responsable"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-borde rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-acento"
                  />
                  {resultadosBusqueda.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-superficie border border-borde rounded-lg shadow-lg overflow-hidden">
                      {resultadosBusqueda.map(eq => (
                        <button
                          type="button"
                          key={eq.id_planilla}
                          onClick={() => { setEquipoSeleccionado(eq); setBusqueda(''); }}
                          className="w-full text-left px-3 py-2.5 hover:bg-fondo transition-colors border-b border-borde last:border-0 cursor-pointer"
                        >
                          <div className="font-bold text-sm text-primario">{eq.numero_equipo}</div>
                          <div className="text-xs text-texto-sec">{eq.usuario_responsable} · Oficina {eq.oficina?.numero_oficina}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setEscaneando(true)}
                  className="w-full flex items-center justify-center gap-2 bg-champagne hover:brightness-95 text-primario font-bold text-sm py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" /> Escanear QR del equipo
                </button>
              </div>
            )}
          </div>

          {/* 2. Tipo de acción */}
          <div>
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Tipo de acción</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {TIPOS_ACCION.map(t => (
                <button
                  type="button"
                  key={t.valor}
                  onClick={() => setTipoAccion(t.valor)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    tipoAccion === t.valor
                      ? 'bg-acento border-acento text-white'
                      : 'bg-superficie border-borde text-texto-sec hover:border-acento/50'
                  }`}
                >
                  {t.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Nueva ubicación (solo si Traspaso) */}
          {tipoAccion === 'TRASPASO' && (
            <div className="bg-champagne/40 border border-champagne rounded-lg p-3 space-y-2">
              <div className="text-xs font-bold text-primario uppercase tracking-wide">Nueva ubicación</div>
              <select value={selDestino} onChange={e => setSelDestino(e.target.value)} className="w-full p-2 border border-borde rounded text-sm bg-superficie">
                <option value="">Destino...</option>
                {destinos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <select value={selDepartamento} onChange={e => setSelDepartamento(e.target.value)} disabled={!selDestino} className="w-full p-2 border border-borde rounded text-sm bg-superficie disabled:opacity-50">
                <option value="">Departamento...</option>
                {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <select value={selDivision} onChange={e => setSelDivision(e.target.value)} disabled={!selDepartamento} className="w-full p-2 border border-borde rounded text-sm bg-superficie disabled:opacity-50">
                <option value="">División...</option>
                {divisiones.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
              </select>
              <select value={selOficina} onChange={e => setSelOficina(e.target.value)} disabled={!selDivision} className="w-full p-2 border border-borde rounded text-sm bg-superficie disabled:opacity-50">
                <option value="">Oficina...</option>
                {oficinasDestino.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}
              </select>
            </div>
          )}

          {/* 4. Observaciones */}
          <div>
            <label className="text-xs font-bold text-texto-sec uppercase tracking-wide">Observaciones</label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              placeholder="Ej: se cambió la fuente de alimentación"
              className="w-full mt-1 p-2.5 border border-borde rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-acento"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-acento hover:brightness-95 text-white font-bold p-3.5 rounded-lg transition-all cursor-pointer disabled:opacity-60"
          >
            {enviando ? 'Guardando...' : 'Guardar movimiento'}
          </button>
        </form>
      </main>

      {escaneando && (
        <EscanerQR onDetectado={handleQRDetectado} onClose={() => setEscaneando(false)} />
      )}
    </div>
  );
}