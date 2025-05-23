import React, { useState } from 'react';
import { Target, ListTodo, BarChart3, Trophy, XCircle, CheckCircle } from 'lucide-react';
import { usePlanificadorMetas } from '../store/usePlanificadorMetas';

interface MicroMeta {
  id: number;
  texto: string;
  prioridad: 'alta' | 'media' | 'baja';
  fecha?: string;
  categoria?: string;
  completada: boolean;
}

interface Props {
  imagen?: string;
}

const insigniasMock = [
  { nombre: 'Meta Cumplida', icono: <Trophy className="w-7 h-7 text-yellow-300" /> },
];

export default function ModuloCardPlanificadorMetas({ imagen }: Props) {
  // Store global
  const {
    metaPrincipal,
    setMetaPrincipal,
    progreso,
    setProgreso,
    xp,
    setXP,
    neurocoin,
    setNeurocoin,
    microMetas,
    setMicroMetas,
  } = usePlanificadorMetas();

  const [estado, setEstado] = useState<'pendiente' | 'en_curso' | 'completado'>(metaPrincipal ? 'en_curso' : 'pendiente');
  const [modal, setModal] = useState<'crear' | 'desglosar' | 'progreso' | null>(null);
  const [botonCompletado, setBotonCompletado] = useState<{[k:string]:boolean}>({});
  const [insignias, setInsignias] = useState<any[]>([]);
  const [inputMeta, setInputMeta] = useState('');
  const [errorMeta, setErrorMeta] = useState('');
  const [toast, setToast] = useState('');
  const [subtareas, setSubtareas] = useState<MicroMeta[]>(microMetas);
  const [loadingIA, setLoadingIA] = useState(false);
  const [errorDesglosar, setErrorDesglosar] = useState('');

  // Lógica para completar acciones y gamificación
  function handleCompletar(accion: 'crear' | 'desglosar' | 'progreso') {
    setBotonCompletado(prev => ({ ...prev, [accion]: true }));
    setXP(xp + 20);
    setNeurocoin(neurocoin + 2);
    if (accion === 'progreso' && !insignias.length) setInsignias(insigniasMock);
    // Actualiza progreso
    let completadas = Object.values({...botonCompletado, [accion]: true}).filter(Boolean).length;
    setProgreso(Math.min(100, completadas * 33));
    setEstado('en_curso');
    setModal(null);
  }

  // Crear meta principal
  function handleGuardarMeta() {
    if (inputMeta.trim().length < 5) {
      setErrorMeta('La meta debe tener al menos 5 caracteres.');
      return;
    }
    setMetaPrincipal(inputMeta.trim());
    setXP(xp + 10);
    setEstado('en_curso');
    setBotonCompletado(prev => ({ ...prev, crear: true }));
    setProgreso(Math.min(100, (Object.values({...botonCompletado, crear: true}).filter(Boolean).length) * 33));
    setModal(null);
    setInputMeta('');
    setErrorMeta('');
    setToast('✅ Meta creada correctamente');
    setTimeout(() => setToast(''), 2500);
  }

  // Simulación de llamada a IA
  async function handleGenerarSubtareas() {
    if (!metaPrincipal) {
      setErrorDesglosar('Primero debes crear tu meta principal.');
      return;
    }
    setLoadingIA(true);
    setErrorDesglosar('');
    // Simulación de respuesta IA
    setTimeout(() => {
      const mock = [
        { id: 1, texto: 'Investigar recursos y ejemplos de éxito', prioridad: 'alta' as const, completada: false },
        { id: 2, texto: 'Definir objetivos semanales', prioridad: 'media' as const, completada: false },
        { id: 3, texto: 'Crear un plan de acción detallado', prioridad: 'alta' as const, completada: false },
        { id: 4, texto: 'Revisar avances cada domingo', prioridad: 'baja' as const, completada: false },
      ];
      setSubtareas(mock);
      setMicroMetas(mock);
      setXP(xp + 10);
      setProgreso(Math.min(100, progreso + 33));
      setLoadingIA(false);
    }, 1200);
  }

  // Marcar subtarea como completada
  function handleToggleSubtarea(id: number) {
    const nuevas = subtareas.map(t => t.id === id ? { ...t, completada: !t.completada } : t);
    setSubtareas(nuevas);
    setMicroMetas(nuevas);
    // Sumar XP solo si se marca como completada
    if (!subtareas.find(t => t.id === id)?.completada) setXP(xp + 5);
    // Actualizar progreso
    const completadas = nuevas.filter(t => t.completada).length;
    setProgreso(Math.min(100, progreso + Math.round(33 / nuevas.length)));
  }

  // Editar texto de subtarea
  function handleEditSubtarea(id: number, texto: string) {
    const nuevas = subtareas.map(t => t.id === id ? { ...t, texto } : t);
    setSubtareas(nuevas);
    setMicroMetas(nuevas);
  }

  // Paso 3: Ver progreso
  function getProgresoActual() {
    const total = subtareas.length;
    const completadas = subtareas.filter(t => t.completada).length;
    const progreso = total > 0 ? Math.floor((completadas / total) * 100) : 0;
    return { total, completadas, progreso };
  }
  const { total, completadas, progreso: progresoActual } = getProgresoActual();
  const xpTotal = completadas * 10;
  const coinsTotal = Math.floor(completadas / 2);
  const estadoMeta = progresoActual === 0 ? 'Pendiente' : progresoActual === 100 ? 'Completada' : 'En Progreso';
  const badgeEspecial = progresoActual === 100;
  const feedbacks = [
    '¡Cada paso cuenta! Sigue avanzando hacia tu meta. 🚀',
    '¡Genial! Ya completaste el 50%, mantén el ritmo. 💡',
    '¡Increíble! Has logrado el 100%. Eres un verdadero Arquitecto de Metas. 🏆',
  ];
  let feedback = feedbacks[0];
  if (progresoActual === 100) feedback = feedbacks[2];
  else if (progresoActual >= 50) feedback = feedbacks[1];

  function handleToggleProgresoSubtarea(id: number) {
    handleToggleSubtarea(id);
  }

  return (
    <>
    <div className="w-full min-h-[420px] relative rounded-2xl border-4 border-[#00e6b0] shadow-2xl p-0 flex flex-col gap-0 mb-10 overflow-hidden bg-gradient-to-br from-[#0e2f2a] via-[#1ad1a5] to-[#0e2f2a]">
      {/* Cabecera: Imagen y Progreso */}
      <div className="flex flex-row items-center justify-center gap-12 w-full px-8 py-8">
        {/* Imagen circular representativa */}
        <div className="flex flex-col items-center">
          <div className="w-40 h-40 rounded-full bg-[#0e2f2a] border-4 border-[#00e6b0] shadow-[0_0_32px_0_rgba(0,230,176,0.5)] flex items-center justify-center overflow-hidden">
            <img src="/images/modulos/planificadordemetas.png" alt="Planificador de Metas" className="w-32 h-32 object-cover opacity-90" />
          </div>
        </div>
        {/* Progreso circular */}
        <div className="flex flex-col items-center min-w-[180px]">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="gaugeMeta" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00e6b0" />
                <stop offset="100%" stopColor="#00cfff" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="50" stroke="#1ad1a5" strokeWidth="12" fill="none" />
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="url(#gaugeMeta)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={2 * Math.PI * 50}
              strokeDashoffset={2 * Math.PI * 50 - (progreso / 100) * 2 * Math.PI * 50}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)' }}
            />
            <text x="50%" y="54%" textAnchor="middle" fill="#00e6b0" fontSize="1.8em" fontWeight="bold">{progreso}%</text>
          </svg>
        </div>
      </div>
      {/* Info principal */}
      <div className="flex flex-col items-center justify-center w-full mb-2">
        <div className="text-3xl font-extrabold font-orbitron text-[#00e6b0] drop-shadow-lg tracking-wide mb-1 text-center">Planificador de Metas</div>
        <div className="text-[#b6ffe6] text-lg mb-2 font-semibold max-w-2xl drop-shadow text-center">Define, desglosa y visualiza tus metas personales o profesionales de manera estructurada e impulsada por IA.</div>
        <div className="flex flex-row gap-3 items-center mb-2 justify-center">
          <span className="px-4 py-2 rounded-full bg-[#0e2f2a] border border-[#00e6b0]/40 shadow text-[#00e6b0] font-bold text-lg flex items-center gap-2">{xp} XP</span>
          <span className="px-4 py-2 rounded-full bg-[#0e2f2a] border border-[#00e6b0]/40 shadow text-[#00e6b0] font-bold text-lg flex items-center gap-2">{neurocoin} <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-6 h-6 inline-block ml-1" /></span>
          <span className={`px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2 ${estado === 'en_curso' ? 'bg-green-400/20 text-green-300' : 'bg-yellow-400/20 text-yellow-300'}`}>{estado === 'en_curso' ? 'En curso' : estado === 'pendiente' ? 'Pendiente' : 'Completado'}</span>
        </div>
      </div>
      {/* Acciones principales */}
      <div className="flex flex-row items-center justify-center gap-8 w-full px-8 pb-8">
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#00e6b0] to-[#00cfff] text-[#101c2c] font-bold text-lg shadow-lg border-2 border-[#00e6b0] hover:scale-105 transition ${botonCompletado['crear'] ? 'ring-4 ring-green-300/60' : ''}`}
          onClick={() => setModal('crear')}
        >
          <Target className="w-6 h-6" /> Crear meta
        </button>
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#00e6b0] to-[#00cfff] text-[#101c2c] font-bold text-lg shadow-lg border-2 border-[#00e6b0] hover:scale-105 transition ${botonCompletado['desglosar'] ? 'ring-4 ring-green-300/60' : ''} ${!metaPrincipal ? 'opacity-40 cursor-not-allowed' : ''}`}
          onClick={() => metaPrincipal && setModal('desglosar')}
          disabled={!metaPrincipal}
        >
          <ListTodo className="w-6 h-6" /> Desglosar con IA
        </button>
        <button
          className={`flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#00e6b0] to-[#00cfff] text-[#101c2c] font-bold text-lg shadow-lg border-2 border-[#00e6b0] hover:scale-105 transition ${botonCompletado['progreso'] ? 'ring-4 ring-green-300/60' : ''}`}
          onClick={() => setModal('progreso')}
        >
          <BarChart3 className="w-6 h-6" /> Ver progreso
        </button>
      </div>
      {/* Insignias */}
      {insignias.length > 0 && (
        <div className="flex flex-row items-center gap-4 justify-center mb-4 animate-fadein">
          {insignias.map((ins, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0e2f2a] border-2 border-[#00e6b0]/40 mb-1">
                {ins.icono}
              </div>
              <span className="text-xs text-[#b6ffe6] text-center font-bold">{ins.nombre}</span>
            </div>
          ))}
        </div>
      )}
      {/* Modales funcionales */}
      {modal === 'crear' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gradient-to-br from-[#0e2f2a] via-[#1ad1a5] to-[#0e2f2a] border-4 border-[#00e6b0] rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-4 relative animate-fadein">
            <button className="absolute top-4 right-4 text-[#00e6b0] text-3xl font-bold hover:text-[#00cfff] transition" onClick={() => setModal(null)}><XCircle className="w-7 h-7" /></button>
            <h3 className="text-2xl font-bold text-[#00e6b0] mb-2 flex items-center gap-2"><Target /> Crear Meta Principal</h3>
            <input
              className="w-full rounded-xl px-4 py-2 text-lg bg-[#0e2f2a] border border-[#00e6b0] text-[#b6ffe6] focus:outline-none focus:ring-2 focus:ring-[#00e6b0]/40 font-mono"
              placeholder="Ej: Lanzar mi startup de IA"
              value={inputMeta}
              onChange={e => setInputMeta(e.target.value)}
              maxLength={80}
            />
            {errorMeta && <div className="text-red-400 text-sm font-bold flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {errorMeta}</div>}
            <button className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-[#00e6b0] to-[#00cfff] text-[#101c2c] font-bold shadow-lg border-2 border-[#00e6b0] hover:scale-105 transition" onClick={handleGuardarMeta}>
              Guardar meta
            </button>
          </div>
        </div>
      )}
      {modal === 'desglosar' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gradient-to-br from-[#0e2f2a] via-[#1ad1a5] to-[#0e2f2a] border-4 border-[#00e6b0] rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-4 relative animate-fadein">
            <button className="absolute top-4 right-4 text-[#00e6b0] text-3xl font-bold hover:text-[#00cfff] transition" onClick={() => setModal(null)}><XCircle className="w-7 h-7" /></button>
            <h3 className="text-2xl font-bold text-[#00e6b0] mb-2 flex items-center gap-2"><ListTodo /> Desglosar con IA</h3>
            {!subtareas.length && (
              <>
                <div className="text-[#b6ffe6] mb-2">Genera subtareas automáticas para tu meta principal:</div>
                <button className="mt-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#00e6b0] to-[#00cfff] text-[#101c2c] font-bold shadow-lg border-2 border-[#00e6b0] hover:scale-105 transition flex items-center gap-2" onClick={handleGenerarSubtareas} disabled={loadingIA}>
                  {loadingIA ? 'Generando...' : 'Generar subtareas con IA'}
                </button>
                {errorDesglosar && <div className="text-red-400 text-sm font-bold flex items-center gap-2 mt-2"><CheckCircle className="w-4 h-4" /> {errorDesglosar}</div>}
              </>
            )}
            {subtareas.length > 0 && (
              <div className="flex flex-col gap-3 mt-2">
                <div className="text-[#b6ffe6] font-bold mb-2">Subtareas sugeridas:</div>
                {subtareas.map((t, i) => (
                  <div key={t.id} className="flex flex-row items-center gap-3 bg-[#0e2f2a]/80 border border-[#00e6b0]/20 rounded-xl px-4 py-2">
                    <input type="checkbox" checked={t.completada} onChange={() => handleToggleSubtarea(t.id)} className="w-5 h-5 accent-[#00e6b0]" />
                    <input
                      className="flex-1 bg-transparent text-[#b6ffe6] font-semibold px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#00e6b0]/40"
                      value={t.texto}
                      onChange={e => handleEditSubtarea(t.id, e.target.value)}
                      maxLength={60}
                    />
                    <span className="text-xs text-[#00e6b0] font-bold ml-2">+5 XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {modal === 'progreso' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gradient-to-br from-[#0e2f2a] via-[#1ad1a5] to-[#0e2f2a] border-4 border-[#00e6b0] rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-6 relative animate-fadein">
            <button className="absolute top-4 right-4 text-[#00e6b0] text-3xl font-bold hover:text-[#00cfff] transition" onClick={() => setModal(null)}><XCircle className="w-7 h-7" /></button>
            <h3 className="text-2xl font-bold text-[#00e6b0] mb-2 flex items-center gap-2"><BarChart3 /> Tu progreso actual</h3>
            {/* Barra circular sci-fi */}
            <div className="flex flex-row items-center justify-center gap-8">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <defs>
                  <linearGradient id="gaugeProgreso" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00e6b0" />
                    <stop offset="100%" stopColor="#00ffcc" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" stroke="#1ad1a5" strokeWidth="12" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#gaugeProgreso)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 - (progresoActual / 100) * 2 * Math.PI * 50}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)' }}
                />
                <text x="50%" y="54%" textAnchor="middle" fill="#00e6b0" fontSize="1.8em" fontWeight="bold">{progresoActual}%</text>
              </svg>
              <div className="flex flex-col gap-2 items-center justify-center">
                <span className="px-4 py-2 rounded-full bg-[#0e2f2a] border border-[#00e6b0]/40 shadow text-[#00e6b0] font-bold text-lg flex items-center gap-2">{xpTotal} XP</span>
                <span className="px-4 py-2 rounded-full bg-[#0e2f2a] border border-[#00e6b0]/40 shadow text-[#00e6b0] font-bold text-lg flex items-center gap-2">{coinsTotal} <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-6 h-6 inline-block ml-1" /></span>
                <span className={`px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2 ${estadoMeta === 'Completada' ? 'bg-green-400/20 text-green-300' : estadoMeta === 'En Progreso' ? 'bg-yellow-400/20 text-yellow-300' : 'bg-[#00e6b0]/20 text-[#00e6b0]'}`}>{estadoMeta}</span>
                {badgeEspecial && <span className="flex items-center gap-2 mt-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ffe93c] to-[#00e6b0] text-[#101c2c] font-bold shadow-lg border-2 border-[#00e6b0] animate-pulse"><Trophy className="w-6 h-6" /> Arquitecto de Metas</span>}
              </div>
            </div>
            {/* Lista de subtareas */}
            <div className="flex flex-col gap-2 mt-4">
              <div className="text-[#b6ffe6] font-bold mb-2">Subtareas:</div>
              {subtareas.length === 0 && <div className="text-[#b6ffe6]">No hay subtareas generadas aún.</div>}
              {subtareas.map((t, i) => (
                <div key={t.id} className="flex flex-row items-center gap-3 bg-[#0e2f2a]/80 border border-[#00e6b0]/20 rounded-xl px-4 py-2">
                  <input type="checkbox" checked={t.completada} onChange={() => handleToggleProgresoSubtarea(t.id)} className="w-5 h-5 accent-[#00e6b0]" />
                  <span className={`flex-1 text-lg font-semibold ${t.completada ? 'line-through text-green-300' : 'text-[#b6ffe6]'}`}>{t.texto}</span>
                  <span className="text-xs text-[#00e6b0] font-bold ml-2">{t.completada ? '+10 XP' : ''}</span>
                </div>
              ))}
            </div>
            {/* Feedback motivador */}
            <div className="mt-4 text-center text-[#00e6b0] font-bold text-lg bg-[#0e2f2a]/60 rounded-xl px-4 py-3 shadow animate-fadein">{feedback}</div>
          </div>
        </div>
      )}
      {/* Espacio para futuras integraciones: recordatorios, IA, recomendaciones */}
    </div>
    {/* Toast de éxito */}
    {toast && (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#00e6b0] text-[#101c2c] px-6 py-3 rounded-xl shadow-lg font-bold text-lg animate-fadein z-50 flex items-center gap-2">
        <CheckCircle className="w-5 h-5" /> {toast}
      </div>
    )}
    {/* Mostrar meta principal */}
    {metaPrincipal && (
      <div className="w-full flex flex-col items-center mt-2 mb-8 animate-fadein">
        <div className="bg-[#0e2f2a]/80 rounded-xl p-6 border-2 border-[#00e6b0]/20 shadow-lg max-w-xl">
          <div className="text-[#00e6b0] font-bold mb-2 flex items-center gap-2"><Target className="w-5 h-5" /> Meta principal registrada</div>
          <div className="text-[#b6ffe6] text-xl font-semibold">{metaPrincipal}</div>
        </div>
      </div>
    )}
    </>
  );
} 