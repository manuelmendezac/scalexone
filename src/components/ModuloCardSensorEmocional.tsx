import React, { useState } from 'react';
import { Brain, Smile, Frown, Zap, Activity, Award, Star, CheckCircle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { differenceInCalendarDays } from 'date-fns';
import { supabase } from '../supabase';

// Colores únicos: gradiente magenta-cian-lima
const COLOR_PRINCIPAL = '#ff2df7';
const COLOR_SECUNDARIO = '#00ff9d';
const COLOR_FONDO = '#1a1a2f';
const COLOR_BARRA = '#00ff9d';
const COLOR_BARRA2 = '#ff2df7';
const COLOR_BARRA3 = '#ffe93c';

// SVGs sci-fi placeholders para emociones
const EMO_SVG = {
  Tranquilo: <svg width="48" height="48" viewBox="0 0 48 48" className="emotion-svg" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#00ff9d" strokeWidth="4" /><ellipse cx="24" cy="28" rx="10" ry="6" fill="none" stroke="#00ff9d" strokeWidth="2" /><circle cx="18" cy="22" r="2" fill="#00ff9d" /><circle cx="30" cy="22" r="2" fill="#00ff9d" /></svg>,
  Relajado: <svg width="48" height="48" viewBox="0 0 48 48" className="emotion-svg" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#00e6b0" strokeWidth="4" /><path d="M16 30 Q24 36 32 30" stroke="#00e6b0" strokeWidth="2" fill="none" /><ellipse cx="18" cy="22" rx="2" ry="2.5" fill="#00e6b0" /><ellipse cx="30" cy="22" rx="2" ry="2.5" fill="#00e6b0" /></svg>,
  Reflexivo: <svg width="48" height="48" viewBox="0 0 48 48" className="emotion-svg" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#ffe93c" strokeWidth="4" /><path d="M18 32 Q24 28 30 32" stroke="#ffe93c" strokeWidth="2" fill="none" /><ellipse cx="18" cy="22" rx="2" ry="2.5" fill="#ffe93c" /><ellipse cx="30" cy="22" rx="2" ry="2.5" fill="#ffe93c" /></svg>,
  Estresado: <svg width="48" height="48" viewBox="0 0 48 48" className="emotion-svg" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#ff2df7" strokeWidth="4" /><path d="M16 32 Q24 24 32 32" stroke="#ff2df7" strokeWidth="2" fill="none" /><ellipse cx="18" cy="22" rx="2" ry="2.5" fill="#ff2df7" /><ellipse cx="30" cy="22" rx="2" ry="2.5" fill="#ff2df7" /></svg>,
  Frustrado: <svg width="48" height="48" viewBox="0 0 48 48" className="emotion-svg" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#ff3c3c" strokeWidth="4" /><path d="M16 32 Q24 20 32 32" stroke="#ff3c3c" strokeWidth="2" fill="none" /><ellipse cx="18" cy="22" rx="2" ry="2.5" fill="#ff3c3c" /><ellipse cx="30" cy="22" rx="2" ry="2.5" fill="#ff3c3c" /></svg>,
  Cansado: <svg width="48" height="48" viewBox="0 0 48 48" className="emotion-svg" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#00cfff" strokeWidth="4" /><path d="M16 32 Q24 36 32 32" stroke="#00cfff" strokeWidth="2" fill="none" /><ellipse cx="18" cy="22" rx="2" ry="2.5" fill="#00cfff" /><ellipse cx="30" cy="22" rx="2" ry="2.5" fill="#00cfff" /></svg>,
  Apático: <svg width="48" height="48" viewBox="0 0 48 48" className="emotion-svg" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#b6ffe6" strokeWidth="4" /><rect x="16" y="30" width="16" height="2" fill="#b6ffe6" /><ellipse cx="18" cy="22" rx="2" ry="2.5" fill="#b6ffe6" /><ellipse cx="30" cy="22" rx="2" ry="2.5" fill="#b6ffe6" /></svg>,
  Motivado: <svg width="48" height="48" viewBox="0 0 48 48" className="emotion-svg" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#00ffcc" strokeWidth="4" /><path d="M16 30 Q24 40 32 30" stroke="#00ffcc" strokeWidth="2" fill="none" /><ellipse cx="18" cy="22" rx="2" ry="2.5" fill="#00ffcc" /><ellipse cx="30" cy="22" rx="2" ry="2.5" fill="#00ffcc" /></svg>,
  Entusiasta: <svg width="48" height="48" viewBox="0 0 48 48" className="emotion-svg" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#ffe93c" strokeWidth="4" /><path d="M16 30 Q24 38 32 30" stroke="#ffe93c" strokeWidth="2" fill="none" /><ellipse cx="18" cy="22" rx="2" ry="2.5" fill="#ffe93c" /><ellipse cx="30" cy="22" rx="2" ry="2.5" fill="#ffe93c" /></svg>,
  Creativo: <svg width="48" height="48" viewBox="0 0 48 48" className="emotion-svg" aria-hidden="true"><circle cx="24" cy="24" r="20" fill="none" stroke="#a259ff" strokeWidth="4" /><path d="M16 30 Q24 24 32 30" stroke="#a259ff" strokeWidth="2" fill="none" /><ellipse cx="18" cy="22" rx="2" ry="2.5" fill="#a259ff" /><ellipse cx="30" cy="22" rx="2" ry="2.5" fill="#a259ff" /></svg>,
};

// Reemplazar EMOCIONES para usar SVGs y tooltips
const EMOCIONES = [
  { nombre: 'Tranquilo', icono: EMO_SVG.Tranquilo },
  { nombre: 'Relajado', icono: EMO_SVG.Relajado },
  { nombre: 'Reflexivo', icono: EMO_SVG.Reflexivo },
  { nombre: 'Estresado', icono: EMO_SVG.Estresado },
  { nombre: 'Frustrado', icono: EMO_SVG.Frustrado },
  { nombre: 'Cansado', icono: EMO_SVG.Cansado },
  { nombre: 'Apático', icono: EMO_SVG.Apático },
  { nombre: 'Motivado', icono: EMO_SVG.Motivado },
  { nombre: 'Entusiasta', icono: EMO_SVG.Entusiasta },
  { nombre: 'Creativo', icono: EMO_SVG.Creativo },
];

export interface RegistroEmocional {
  id: string;
  emocion: string;
  intensidad: number;
  descripcion: string;
  fecha: string;
  rewarded: boolean;
}

const XP_REWARD = 5;
const COIN_REWARD = 1;
const MAX_REWARDS_PER_DAY = 3;
const MIN_HOURS_BETWEEN_REWARDS = 4;

interface Props {
  imagen?: string;
}

export default function ModuloCardSensorEmocional({ imagen }: Props) {
  const [emocion, setEmocion] = useState(EMOCIONES[0].nombre);
  const [intensidad, setIntensidad] = useState(5);
  const [descripcion, setDescripcion] = useState('');
  const [historial, setHistorial] = useState<RegistroEmocional[]>([]);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [insignias, setInsignias] = useState<string[]>([]);
  const [estado, setEstado] = useState<'pendiente' | 'en_curso' | 'completado'>('pendiente');
  const [toast, setToast] = useState('');
  const [showGuia, setShowGuia] = useState(false);

  // Sugerencias dinámicas del clon según la emoción
  const sugerencias: Record<string, string> = {
    'Tranquilo': 'Aprovecha tu calma para planificar o reflexionar. ¿Te gustaría meditar o escribir tus ideas?',
    'Relajado': '¡Perfecto para tareas creativas o de aprendizaje suave! Prueba leer o dibujar algo nuevo.',
    'Reflexivo': 'Es un gran momento para tomar notas, escribir un diario o analizar tus metas.',
    'Estresado': 'Haz una pausa de 5 minutos, respira profundo o activa el Modo Respiración. Tu bienestar es prioridad.',
    'Frustrado': 'No te exijas de más. Da un paseo corto o cambia de actividad para despejarte.',
    'Cansado': 'Considera un bloque corto o una siesta breve. Recargar energía es clave para el rendimiento.',
    'Apático': 'Haz una pequeña tarea sencilla para activar tu mente. ¡Un paso pequeño cuenta!',
    'Motivado': '¡Aprovecha este impulso! Realiza una tarea clave o avanza en tu meta principal.',
    'Entusiasta': 'Comparte tu energía con otros o inicia un proyecto que te apasione.',
    'Creativo': 'Es el momento ideal para idear, diseñar o resolver problemas de forma innovadora.',
  };

  // Registros del día y control de tiempo
  const now = new Date();
  const hoy = now.toDateString();
  const registrosHoy = historial.filter(r => new Date(r.fecha).toDateString() === hoy);
  const registrosConRecompensaHoy = registrosHoy.filter(r => r.rewarded);
  const ultimoRegistroReward = registrosConRecompensaHoy[0];
  let puedeRecompensar = registrosConRecompensaHoy.length < MAX_REWARDS_PER_DAY;
  let tiempoRestante = 0;
  if (ultimoRegistroReward) {
    const diffMs = now.getTime() - new Date(ultimoRegistroReward.fecha).getTime();
    const diffH = diffMs / (1000 * 60 * 60);
    if (diffH < MIN_HOURS_BETWEEN_REWARDS) {
      puedeRecompensar = false;
      tiempoRestante = Math.ceil((MIN_HOURS_BETWEEN_REWARDS - diffH) * 60); // en minutos
    }
  }

  // Función exportable para el clon IA
  function registrarEmocion(emocion: string, intensidad: number, descripcion: string, rewarded: boolean = false) {
    const registro: RegistroEmocional = {
      id: Date.now().toString(),
      emocion,
      intensidad,
      descripcion,
      fecha: new Date().toISOString(),
      rewarded,
    };
    setHistorial(prev => [registro, ...prev]);
    if (historial.length + 1 >= 5 && !insignias.includes('Autoconciente')) setInsignias([...insignias, 'Autoconciente']);
    if (historial.length + 1 >= 15 && !insignias.includes('Domina tus emociones')) setInsignias([...insignias, 'Domina tus emociones']);
    setEstado('en_curso');
    setToast(rewarded ? '¡Emoción registrada y recompensa obtenida!' : '¡Emoción registrada!');
    setTimeout(() => setToast(''), 2000);
  }

  // Handler UI
  async function handleRegistrar() {
    // Lógica de recompensa limitada
    let rewarded = false;
    if (puedeRecompensar) {
      rewarded = true;
      setXp(xp + XP_REWARD);
      setCoins(coins + COIN_REWARD);
    }
    registrarEmocion(emocion, intensidad, descripcion, rewarded);
    setDescripcion('');
    // Guardar en Supabase
    const user_id = (window as any).user?.email || 'anon';
    await supabase.from('EmotionalStateLog').insert([
      {
        user_id,
        emocion,
        intensidad,
        descripcion,
        fecha_hora: new Date().toISOString(),
        rewarded,
      },
    ]);
  }

  // Datos para gráfico
  const ultimos = historial.slice(0, 5);
  const data = {
    labels: ultimos.map(r => new Date(r.fecha).toLocaleTimeString()),
    datasets: [
      {
        label: 'Intensidad',
        data: ultimos.map(r => r.intensidad),
        backgroundColor: [COLOR_BARRA, COLOR_BARRA2, COLOR_BARRA3, COLOR_PRINCIPAL, COLOR_SECUNDARIO],
        borderRadius: 8,
      },
    ],
  };

  // Progreso: 5 registros = 100%
  const progreso = Math.min(100, Math.round((historial.length / 5) * 100));
  const radio = 50;
  const circ = 2 * Math.PI * radio;
  const dash = circ - (progreso / 100) * circ;

  // Gamificación avanzada
  // Calcular racha de días consecutivos
  const diasUnicos = Array.from(new Set(historial.map(r => new Date(r.fecha).toDateString())));
  let racha = 1;
  if (diasUnicos.length > 1) {
    racha = 1;
    for (let i = 1; i < diasUnicos.length; i++) {
      const prev = new Date(diasUnicos[i - 1]);
      const curr = new Date(diasUnicos[i]);
      if (differenceInCalendarDays(curr, prev) === 1) {
        racha++;
      } else {
        racha = 1;
      }
    }
  }
  // Estado emocional dominante
  const conteoEmociones = historial.reduce((acc, r) => {
    acc[r.emocion] = (acc[r.emocion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const dominante = Object.entries(conteoEmociones).sort((a, b) => b[1] - a[1])[0]?.[0];
  // Logros
  const logros: { nombre: string; cond: boolean; icono: React.ReactNode }[] = [
    { nombre: 'Maestro de la Calma', cond: conteoEmociones['Tranquilo'] >= 5, icono: <span className="text-2xl">🧘‍♂️</span> },
    { nombre: 'Domador del Estrés', cond: conteoEmociones['Estresado'] >= 5, icono: <span className="text-2xl">😰</span> },
    { nombre: 'Racha Emocional', cond: racha >= 3, icono: <span className="text-2xl">🔥</span> },
    { nombre: 'Creador Creativo', cond: conteoEmociones['Creativo'] >= 5, icono: <span className="text-2xl">🎨</span> },
    { nombre: 'Motivador', cond: conteoEmociones['Motivado'] >= 5, icono: <span className="text-2xl">🚀</span> },
  ];

  // Asistente de voz
  const textoGuia = `Bienvenido al Sensor Emocional. Aquí podrás registrar cómo te sientes, su intensidad y una observación si lo deseas. Esta información ayudará a tu clon a entenderte mejor y personalizar tu experiencia. Escoge tu emoción, ajusta la intensidad, y presiona el botón para registrar. ¡Tu autoconocimiento es poder!`;
  function reproducirGuia() {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(textoGuia);
      utter.lang = 'es-ES';
      utter.rate = 1;
      window.speechSynthesis.speak(utter);
    }
  }

  return (
    <div className="w-full min-h-[420px] relative rounded-2xl border-4" style={{ borderColor: COLOR_PRINCIPAL, background: `linear-gradient(135deg, ${COLOR_FONDO} 60%, ${COLOR_PRINCIPAL}22 100%)` }}>
      {/* Botón guía de usuario (arriba a la derecha) */}
      <button onClick={() => setShowGuia(v => !v)} className="absolute top-4 right-8 z-20 flex flex-row items-center gap-2 p-2 pr-4 rounded-full bg-[#ff2df7]/10 border border-[#ff2df7]/40 hover:bg-[#ff2df7]/30 transition focus:outline-none focus:ring-2 focus:ring-[#ff2df7] hover:scale-105" title="Guía de uso" tabIndex={0}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 9v6h4l5 5V4L7 9H3z" stroke="#ff2df7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.5 8.25a6 6 0 010 7.5" stroke="#ff2df7" strokeWidth="2" strokeLinecap="round"/><path d="M19 5a10 10 0 010 14" stroke="#ff2df7" strokeWidth="2" strokeLinecap="round"/></svg>
        <span className="text-[#ff2df7] font-bold text-base select-none">Activar audio de guía</span>
      </button>
      {/* Tarjeta guía de usuario */}
      {showGuia && (
        <div className="absolute top-20 right-8 z-30 bg-[#1a1a2f]/95 border-2 border-[#ff2df7]/40 rounded-xl shadow-lg p-6 max-w-xs w-[340px] animate-fadein backdrop-blur-sm">
          <div className="text-2xl font-bold text-[#ff2df7] flex items-center gap-2 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>🧠 ¿Cómo usar el Sensor Emocional?</div>
          <div className="flex flex-col gap-1 text-[#ffe93c] text-lg font-semibold">
            <span>1️⃣ Elige tu emoción actual y su intensidad.</span>
            <span>2️⃣ (Opcional) Añade una breve observación.</span>
            <span>3️⃣ Presiona <b>Registrar estado emocional</b>.</span>
            <span>4️⃣ Consulta tu historial y el gráfico para ver tu evolución.</span>
            <span className="mt-2 text-[#00ffcc]">🎯 <b>Consejo:</b> Registrar emociones varios días seguidos desbloquea logros y XP extra.</span>
          </div>
          <button onClick={reproducirGuia} className="mt-4 p-2 rounded-full bg-[#ff2df7]/10 border border-[#ff2df7]/40 hover:bg-[#ff2df7]/30 transition focus:outline-none focus:ring-2 focus:ring-[#ff2df7] w-full flex items-center justify-center gap-2" title="Escuchar guía de uso" tabIndex={0}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 9v6h4l5 5V4L7 9H3z" stroke="#ff2df7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.5 8.25a6 6 0 010 7.5" stroke="#ff2df7" strokeWidth="2" strokeLinecap="round"/><path d="M19 5a10 10 0 010 14" stroke="#ff2df7" strokeWidth="2" strokeLinecap="round"/></svg>
            <span className="text-[#ff2df7] font-bold">Escuchar guía</span>
          </button>
        </div>
      )}
      {/* Cabecera visual */}
      <div className="flex flex-row items-center justify-center gap-16 w-full px-8 py-10 relative">
        {/* Imagen central */}
        <div className="flex flex-col items-center justify-center min-w-[260px]">
          <div className="relative w-56 h-56 rounded-full overflow-hidden shadow-2xl border-4 border-[#ff2df7] bg-[#1a1a2f] flex items-center justify-center z-10 animate-pulse" style={{boxShadow: `0 0 48px 0 #ff2df755`}}>
            <img src="/images/modulos/sensoremocional.png" alt="Sensor Emocional" className="w-40 h-40 object-cover" />
          </div>
        </div>
        {/* Barra de progreso circular a la derecha */}
        <div className="flex flex-col items-center min-w-[220px]">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="gaugeEmoNeon" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff2df7" />
                <stop offset="50%" stopColor="#00ff9d" />
                <stop offset="100%" stopColor="#ffe93c" />
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r="80" stroke="#1a1a2f" strokeWidth="18" fill="none" />
            <circle
              cx="90"
              cy="90"
              r="80"
              stroke="url(#gaugeEmoNeon)"
              strokeWidth="18"
              fill="none"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={(2 * Math.PI * 80) - (progreso / 100) * (2 * Math.PI * 80)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)', filter: 'drop-shadow(0 0 32px #ff2df7)' }}
            />
            <text x="50%" y="54%" textAnchor="middle" fill="#ff2df7" fontSize="2.8em" fontWeight="bold" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 12px #ff2df7' }}>{progreso}%</text>
          </svg>
        </div>
      </div>
      {/* Título y subtítulo centrados */}
      <div className="flex flex-col items-center w-full -mt-8 mb-2 animate-fadein">
        <div className="text-4xl font-extrabold font-orbitron text-[#ff2df7] drop-shadow-lg tracking-wide mb-2 text-center">Sensor Emocional</div>
        <div className="text-[#ffe93c] text-xl mb-4 font-semibold max-w-2xl drop-shadow text-center">Gestiona tu energía emocional y potencia tu rendimiento con IA.</div>
        <div className="flex flex-row gap-4 items-center mb-2 justify-center">
          <span className="px-6 py-2 rounded-full bg-[#1a1a2f] border border-[#ff2df7]/40 shadow text-[#ff2df7] font-bold text-xl flex items-center gap-2 hover:scale-105 transition">{xp + (racha >= 3 ? 10 : 0)} XP</span>
          <span className="px-6 py-2 rounded-full bg-[#1a1a2f] border border-[#ff2df7]/40 shadow text-[#ff2df7] font-bold text-xl flex items-center gap-2 hover:scale-105 transition">{coins} <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-7 h-7 inline-block ml-1" /></span>
          <span className={`px-6 py-2 rounded-full font-bold text-xl flex items-center gap-2 ${estado === 'en_curso' ? 'bg-yellow-400/20 text-yellow-300' : estado === 'pendiente' ? 'bg-[#ff2df7]/20 text-[#ff2df7]' : 'bg-green-400/20 text-green-300'}`}>{estado === 'en_curso' ? 'En curso' : estado === 'pendiente' ? 'Pendiente' : 'Completado'}</span>
        </div>
        {/* Insignias y logros */}
        {(insignias.length > 0 || logros.some(l => l.cond)) && (
          <div className="flex flex-row items-center gap-4 justify-center mt-2 animate-fadein flex-wrap">
            {insignias.map((ins, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1a1a2f] border-2 border-[#ff2df7]/40 mb-1">
                  <Award className="w-7 h-7 text-[#ffe93c]" />
                </div>
                <span className="text-xs text-[#ffe93c] text-center font-bold">{ins}</span>
              </div>
            ))}
            {logros.filter(l => l.cond).map((l, i) => (
              <div key={l.nombre} className="flex flex-col items-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#1a1a2f] border-2 border-[#ff2df7]/40 mb-1">
                  {l.icono}
                </div>
                <span className="text-xs text-[#ffe93c] text-center font-bold">{l.nombre}</span>
              </div>
            ))}
          </div>
        )}
        {/* Estado emocional dominante */}
        {dominante && (
          <div className="mt-2 text-[#00ffcc] font-bold text-base animate-fadein">Estilo cognitivo predominante: <span className="text-[#ff2df7]">{dominante}</span></div>
        )}
      </div>
      {/* Panel de registro */}
      <div className="flex flex-col items-center w-full mb-4 animate-fadein">
        <div className="bg-[#1a1a2f]/80 rounded-xl p-6 border-2 border-[#ff2df7]/40 shadow-lg max-w-xl w-full flex flex-col gap-4">
          <div className="flex flex-row flex-wrap gap-4 items-center justify-center mb-2">
            {EMOCIONES.map((e, idx) => (
              <button
                key={e.nombre}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 emotion-btn ${emocion === e.nombre ? 'border-[#ff2df7] bg-[#ff2df7]/10 scale-110 ring-2 ring-[#ff2df7]/40' : 'border-[#ffe93c]/10 bg-transparent'} transition focus:outline-none focus:ring-2 focus:ring-[#ff2df7]`}
                onClick={() => setEmocion(e.nombre)}
                tabIndex={0}
                aria-label={e.nombre}
                title={e.nombre}
                onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') setEmocion(e.nombre); }}
              >
                <span className="block w-12 h-12 mx-auto emotion-icon group-hover:scale-110 transition-transform">{e.icono}</span>
                <span className="text-xs text-[#ffe93c] font-bold mt-1">{e.nombre}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-row items-center gap-4 mb-2">
            <span className="text-[#ffe93c] font-bold">Intensidad:</span>
            <input type="range" min={1} max={10} value={intensidad} onChange={e => setIntensidad(Number(e.target.value))} className="w-40 accent-[#ff2df7]" />
            <span className="text-[#ff2df7] font-bold text-lg">{intensidad}</span>
          </div>
          <input className="rounded-xl px-4 py-2 text-lg bg-[#1a1a2f] border border-[#ff2df7] text-[#ffe93c] focus:outline-none focus:ring-2 focus:ring-[#ff2df7]/40 font-mono w-full" placeholder="Observación (opcional)" value={descripcion} onChange={e => setDescripcion(e.target.value)} maxLength={60} />
          <button className="mt-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#ff2df7] to-[#00ff9d] text-[#101c2c] font-bold shadow-lg border-2 border-[#ff2df7] hover:scale-105 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleRegistrar} disabled={!puedeRecompensar && tiempoRestante > 0} tabIndex={0}>
            <CheckCircle className="w-5 h-5" /> Registrar estado emocional
          </button>
          {!puedeRecompensar && tiempoRestante > 0 && (
            <div className="mt-2 text-[#ff2df7] font-bold text-base animate-fadein flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#ff2df7" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#ff2df7" strokeWidth="2" strokeLinecap="round"/></svg>
              ⏳ Aún no puedes registrar un nuevo estado con recompensa. Prueba en: {Math.floor(tiempoRestante/60)}h {tiempoRestante%60}m
            </div>
          )}
        </div>
        {/* Sugerencia del clon */}
        <div className="mt-3 max-w-xl w-full text-center animate-fadein">
          <div className="bg-[#ff2df7]/10 border border-[#ff2df7]/30 rounded-xl px-6 py-4 shadow text-[#ff2df7] font-bold text-lg flex items-center gap-2 justify-center mx-auto" style={{maxWidth:'100%'}}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="mr-2"><circle cx="12" cy="12" r="10" stroke="#ff2df7" strokeWidth="2"/><path d="M8 15h8M9 9h.01M15 9h.01" stroke="#ff2df7" strokeWidth="2" strokeLinecap="round"/></svg>
            <span>{sugerencias[emocion]}</span>
          </div>
        </div>
      </div>
      {/* Visualización de datos */}
      <div className="flex flex-col items-center w-full mb-4 animate-fadein">
        <div className="bg-[#1a1a2f]/80 rounded-xl p-6 border-2 border-[#ff2df7]/40 shadow-lg max-w-xl w-full flex flex-col gap-4">
          <div className="text-[#ff2df7] font-bold mb-2 flex items-center gap-2"><Smile className="w-5 h-5" /> Historial reciente</div>
          {ultimos.length === 0 && <div className="text-[#ffe93c]">Aún no has registrado emociones.</div>}
          {ultimos.length > 0 && (
            <ul className="flex flex-col gap-2">
              {ultimos.map((h, i) => (
                <li key={i} className="flex flex-row items-center gap-3 bg-[#ff2df7]/10 border border-[#ff2df7]/20 rounded-xl px-4 py-2">
                  <span className="flex-1 text-[#ffe93c] font-semibold">{h.emocion}</span>
                  <span className="text-[#ff2df7] font-bold">{h.intensidad}/10</span>
                  <span className="text-xs text-[#ffe93c]">{new Date(h.fecha).toLocaleString()}</span>
                  {h.descripcion && <span className="text-xs text-[#00ff9d]">{h.descripcion}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Gráfico de emociones */}
      <div className="flex flex-col items-center w-full mb-6 animate-fadein">
        <div className="bg-[#1a1a2f]/80 rounded-xl p-6 border-2 border-[#ff2df7]/40 shadow-lg max-w-xl w-full flex flex-col gap-4">
          <div className="text-[#ff2df7] font-bold mb-2 flex items-center gap-2"><Activity className="w-5 h-5" /> Gráfico de intensidad emocional</div>
          <Bar data={data} options={{ plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 10 } } }} />
        </div>
      </div>
      {/* Barra de progreso de registros del día */}
      <div className="flex flex-col items-center w-full mb-2 animate-fadein">
        <div className="bg-[#1a1a2f]/80 rounded-xl p-3 border-2 border-[#ff2df7]/40 shadow-lg max-w-xs w-full flex flex-col gap-2">
          <div className="flex flex-row items-center justify-between">
            <span className="text-[#ff2df7] font-bold">Registros con recompensa hoy</span>
            <span className="text-[#ffe93c] font-bold">{registrosConRecompensaHoy.length} / {MAX_REWARDS_PER_DAY}</span>
          </div>
          <div className="h-3 rounded-full bg-[#ff2df7]/20 overflow-hidden mt-1">
            <div className="h-3 rounded-full bg-gradient-to-r from-[#ff2df7] to-[#00ffcc]" style={{ width: `${(registrosConRecompensaHoy.length / MAX_REWARDS_PER_DAY) * 100}%`, transition: 'width 0.6s cubic-bezier(.4,2,.6,1)' }} />
          </div>
        </div>
      </div>
      {/* Toast de éxito */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#ff2df7] text-[#101c2c] px-6 py-3 rounded-xl shadow-lg font-bold text-lg animate-fadein z-50 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> {toast}
        </div>
      )}
    </div>
  );
} 