import React, { useState } from 'react';
import { Lightbulb, Sparkles, Zap, Award, Loader2, CheckCircle, BarChart3, Info } from 'lucide-react';

// Colores y estilos base
const COLOR_PRINCIPAL = '#b24bf3'; // Púrpura neón
const COLOR_SECUNDARIO = '#ff6bff'; // Rosa neón
const COLOR_FONDO = '#181c2f';
const COLOR_GLOW = '#ff6bff';

// Ejemplos de ejercicios de ideación
const EJERCICIOS = {
  'Lluvia de Ideas': [
    {
      tema: '¿Cómo podríamos mejorar la educación del futuro?',
      tiempo: 300, // 5 minutos
      puntos: 50
    },
    {
      tema: 'Ideas para ciudades más sostenibles',
      tiempo: 300,
      puntos: 50
    }
  ],
  'Pensamiento Lateral': [
    {
      desafio: '¿Qué pasaría si los humanos pudieran volar naturalmente?',
      tiempo: 240, // 4 minutos
      puntos: 40
    },
    {
      desafio: '¿Cómo sería un día sin internet?',
      tiempo: 240,
      puntos: 40
    }
  ],
  'Innovación Disruptiva': [
    {
      reto: 'Rediseña el concepto de transporte personal',
      tiempo: 360, // 6 minutos
      puntos: 60
    },
    {
      reto: 'Crea un nuevo formato de entretenimiento',
      tiempo: 360,
      puntos: 60
    }
  ]
};

// Tipos para los ejercicios
type EjercicioLluvia = {
  tema: string;
  tiempo: number;
  puntos: number;
};

type EjercicioLateral = {
  desafio: string;
  tiempo: number;
  puntos: number;
};

type EjercicioInnovacion = {
  reto: string;
  tiempo: number;
  puntos: number;
};

type Ejercicio = EjercicioLluvia | EjercicioLateral | EjercicioInnovacion;

// Utilidad para obtener ejercicio aleatorio por categoría
function getEjercicioAleatorio(categoria: keyof typeof EJERCICIOS): Ejercicio {
  const arr = EJERCICIOS[categoria];
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ModuloCardLaboratorioIdeas() {
  // Estado general
  const [progreso, setProgreso] = useState(0);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [estado, setEstado] = useState<'pendiente'|'en_curso'|'completado'>('pendiente');
  const [showLluvia, setShowLluvia] = useState(false);
  const [showLateral, setShowLateral] = useState(false);
  const [showInnovacion, setShowInnovacion] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState<keyof typeof EJERCICIOS | ''>('');
  const [ejercicioActual, setEjercicioActual] = useState<Ejercicio | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [nuevaIdea, setNuevaIdea] = useState('');
  const [bonus, setBonus] = useState(false);
  const [showGuia, setShowGuia] = useState(false);

  // Barra de progreso circular
  const circ = 2 * Math.PI * 50;
  const dash = circ - (progreso / 100) * circ;

  // Iniciar ejercicio
  function iniciarEjercicio(categoria: keyof typeof EJERCICIOS) {
    setCategoriaActual(categoria);
    const ejercicio = getEjercicioAleatorio(categoria);
    setEjercicioActual(ejercicio);
    setIdeas([]);
    setNuevaIdea('');
    setEstado('en_curso');
    setShowLluvia(categoria === 'Lluvia de Ideas');
    setShowLateral(categoria === 'Pensamiento Lateral');
    setShowInnovacion(categoria === 'Innovación Disruptiva');
    setTiempoRestante(ejercicio.tiempo);
  }

  // Agregar idea
  function agregarIdea() {
    if (nuevaIdea.trim()) {
      setIdeas([...ideas, nuevaIdea.trim()]);
      setNuevaIdea('');
      setProgreso(p => Math.min(100, p + 10));
      setXp(x => x + 5);
      setCoins(c => c + 1);
      if (progreso + 10 >= 100) {
        setEstado('completado');
        setBonus(true);
      }
    }
  }

  // Finalizar ejercicio
  function finalizarEjercicio() {
    setShowLluvia(false);
    setShowLateral(false);
    setShowInnovacion(false);
    setEstado('completado');
    setBonus(true);
  }

  // Animación de fondo sci-fi
  const fondoAnimado = (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <svg width="100%" height="100%" className="absolute inset-0" style={{filter:'blur(2px)'}}>
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#b24bf3" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#23233a" stopOpacity="0.0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="60%" fill="url(#g1)" />
        <g>
          {[...Array(12)].map((_,i) => (
            <rect key={i} x={30+i*100} y={30+i*20} width={2} height={180} fill="#ff6bff" opacity={0.08 + 0.04*(i%3)} rx={2} />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 animate-pulse" style={{boxShadow:'0 0 80px 10px #b24bf355'}} />
    </div>
  );

  return (
    <div className="w-full min-h-[540px] relative rounded-2xl border-4 mb-10 overflow-hidden shadow-2xl p-0 flex flex-col gap-0 bg-gradient-to-br from-[#181c2f] via-[#b24bf3]/10 to-[#23233a] animate-fadein">
      {fondoAnimado}
      {/* Cabecera */}
      <div className="flex flex-row items-center justify-center gap-16 w-full px-8 py-10 relative z-10">
        {/* Imagen central */}
        <div className="flex flex-col items-center justify-center min-w-[260px]">
          <div className="relative w-56 h-56 rounded-full overflow-hidden shadow-2xl border-4 border-[#b24bf3] bg-[#23233a] flex items-center justify-center z-10 animate-pulse" style={{boxShadow: `0 0 48px 0 #b24bf355`}}>
            <Lightbulb className="w-40 h-40 text-[#b24bf3] drop-shadow-lg" />
            <div className="absolute inset-0 animate-glow" style={{boxShadow:'0 0 32px 8px #ff6bffaa'}} />
          </div>
        </div>
        {/* Barra de progreso circular a la derecha */}
        <div className="flex flex-col items-center min-w-[220px]">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="gaugeIdeas" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#b24bf3" />
                <stop offset="100%" stopColor="#ff6bff" />
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r="80" stroke="#23233a" strokeWidth="18" fill="none" />
            <circle
              cx="90"
              cy="90"
              r="80"
              stroke="url(#gaugeIdeas)"
              strokeWidth="18"
              fill="none"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={dash}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)', filter: 'drop-shadow(0 0 32px #b24bf3)' }}
            />
            <text x="50%" y="54%" textAnchor="middle" fill="#b24bf3" fontSize="2.8em" fontWeight="bold" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 12px #b24bf3' }}>{progreso}%</text>
          </svg>
        </div>
      </div>
      {/* Título y subtítulo centrados */}
      <div className="flex flex-col items-center w-full -mt-8 mb-2 animate-fadein z-10">
        <div className="text-4xl font-extrabold font-orbitron text-[#b24bf3] drop-shadow-lg tracking-wide mb-2 text-center animate-glow">Laboratorio de Ideas</div>
        <div className="text-[#ff6bff] text-xl mb-4 font-semibold max-w-2xl drop-shadow text-center">Desarrolla tu creatividad y genera ideas innovadoras con ejercicios guiados.</div>
        <div className="flex flex-row gap-4 items-center mb-2 justify-center">
          <span className="px-6 py-2 rounded-full bg-[#23233a] border border-[#b24bf3]/40 shadow text-[#b24bf3] font-bold text-xl flex items-center gap-2 hover:scale-105 transition animate-glow">{xp} XP</span>
          <span className="px-6 py-2 rounded-full bg-[#23233a] border border-[#b24bf3]/40 shadow text-[#ff6bff] font-bold text-xl flex items-center gap-2 hover:scale-105 transition animate-glow">{coins} <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-7 h-7 inline-block ml-1" /></span>
          <span className={`px-6 py-2 rounded-full font-bold text-xl flex items-center gap-2 ${estado === 'en_curso' ? 'bg-purple-400/20 text-purple-300' : estado === 'pendiente' ? 'bg-[#b24bf3]/20 text-[#b24bf3]' : 'bg-green-400/20 text-green-300'} animate-glow`}>{estado === 'en_curso' ? 'En curso' : estado === 'pendiente' ? 'Pendiente' : 'Completado'}</span>
        </div>
        {/* Bonus visual */}
        {bonus && (
          <div className="flex flex-row items-center gap-2 mt-2 animate-bounce">
            <span className="px-6 py-2 rounded-full bg-[#ff6bff]/20 border border-[#ff6bff]/40 text-[#ff6bff] font-bold text-lg flex items-center gap-2 animate-glow"><Award className="w-6 h-6" /> ¡Bonus Creativo desbloqueado!</span>
          </div>
        )}
      </div>
      {/* Botones principales */}
      <div className="flex flex-row items-center justify-center gap-8 mb-8 z-10">
        <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#b24bf3] to-[#ff6bff] text-[#181c2f] font-extrabold text-2xl shadow-lg border-4 border-[#b24bf3] hover:scale-105 transition animate-glow flex items-center gap-3" onClick={() => iniciarEjercicio('Lluvia de Ideas')}>
          <Sparkles className="w-7 h-7" /> Lluvia de Ideas
        </button>
        <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ff6bff] to-[#b24bf3] text-[#181c2f] font-extrabold text-2xl shadow-lg border-4 border-[#ff6bff] hover:scale-105 transition animate-glow flex items-center gap-3" onClick={() => iniciarEjercicio('Pensamiento Lateral')}>
          <Zap className="w-7 h-7" /> Pensamiento Lateral
        </button>
        <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#b24bf3] to-[#ff6bff] text-[#181c2f] font-extrabold text-2xl shadow-lg border-4 border-[#b24bf3] hover:scale-105 transition animate-glow flex items-center gap-3" onClick={() => iniciarEjercicio('Innovación Disruptiva')}>
          <BarChart3 className="w-7 h-7" /> Innovación Disruptiva
        </button>
        <button className="absolute top-4 right-8 z-20 flex flex-row items-center gap-2 p-2 pr-4 rounded-full bg-[#b24bf3]/10 border border-[#b24bf3]/40 hover:bg-[#b24bf3]/30 transition focus:outline-none focus:ring-2 focus:ring-[#b24bf3] hover:scale-105" onClick={() => setShowGuia(v => !v)}>
          <Info className="w-6 h-6 text-[#b24bf3]" />
          <span className="text-[#b24bf3] font-bold text-base select-none">¿Cómo funciona?</span>
        </button>
      </div>
      {/* Guía rápida emergente */}
      {showGuia && (
        <div className="absolute top-20 right-8 z-30 bg-[#23233a]/95 border-2 border-[#b24bf3]/40 rounded-xl shadow-lg p-6 max-w-xs w-[340px] animate-fadein backdrop-blur-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2"><span className="text-2xl">💡</span><span className="text-lg font-bold text-[#b24bf3]">Guía rápida</span></div>
          <div className="text-[#b24bf3] font-bold mb-1">🧠 ¿Cómo usar el Laboratorio de Ideas?</div>
          <ol className="list-decimal ml-5 text-[#ff6bff] text-base flex flex-col gap-1">
            <li>Elige un tipo de ejercicio creativo.</li>
            <li>Genera ideas durante el tiempo asignado.</li>
            <li>Gana XP y monedas por cada idea innovadora.</li>
          </ol>
          <div className="mt-2 text-[#ff6bff] text-sm">💬 <b>Tip:</b> ¡No hay ideas malas! Cuantas más ideas generes, más recompensas obtendrás.</div>
        </div>
      )}
      {/* Paneles de ejercicios */}
      {(showLluvia || showLateral || showInnovacion) && ejercicioActual && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#181c2f]/80 animate-fadein">
          <div className="bg-[#23233a] rounded-2xl border-4 border-[#b24bf3] shadow-2xl p-10 max-w-2xl w-full flex flex-col gap-6 relative animate-glow">
            <div className="text-2xl font-bold text-[#b24bf3] mb-2">
              {showLluvia ? '🌧️ Lluvia de Ideas' : showLateral ? '🔄 Pensamiento Lateral' : '💫 Innovación Disruptiva'}
            </div>
            <div className="text-[#ff6bff] text-lg mb-4">
              {showLluvia ? (ejercicioActual as EjercicioLluvia).tema : 
               showLateral ? (ejercicioActual as EjercicioLateral).desafio : 
               (ejercicioActual as EjercicioInnovacion).reto}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevaIdea}
                  onChange={(e) => setNuevaIdea(e.target.value)}
                  placeholder="Escribe tu idea aquí..."
                  className="flex-1 px-4 py-2 rounded-xl bg-[#23233a] border-2 border-[#b24bf3]/40 text-[#ff6bff] placeholder-[#b24bf3]/40 focus:outline-none focus:border-[#b24bf3]"
                />
                <button
                  onClick={agregarIdea}
                  className="px-6 py-2 rounded-xl bg-[#b24bf3] text-[#181c2f] font-bold hover:bg-[#ff6bff] transition"
                >
                  Agregar
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {ideas.map((idea, idx) => (
                  <div key={idx} className="p-3 mb-2 rounded-xl bg-[#23233a] border border-[#b24bf3]/40 text-[#ff6bff] animate-fadein">
                    {idea}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-[#b24bf3] font-bold">
                Tiempo restante: {Math.floor(tiempoRestante / 60)}:{(tiempoRestante % 60).toString().padStart(2, '0')}
              </div>
              <button
                onClick={finalizarEjercicio}
                className="px-6 py-2 rounded-xl bg-[#ff6bff] text-[#181c2f] font-bold hover:bg-[#b24bf3] transition"
              >
                Finalizar
              </button>
            </div>
            <button className="absolute top-4 right-4 text-[#b24bf3] font-bold" onClick={() => {
              setShowLluvia(false);
              setShowLateral(false);
              setShowInnovacion(false);
            }}>✖</button>
          </div>
        </div>
      )}
      {/* Animaciones CSS extra */}
      <style>{`
      @keyframes glow {
        0% { box-shadow: 0 0 8px 2px #b24bf388, 0 0 0 0 #ff6bff00; }
        50% { box-shadow: 0 0 32px 12px #b24bf3, 0 0 0 0 #ff6bff44; }
        100% { box-shadow: 0 0 8px 2px #b24bf388, 0 0 0 0 #ff6bff00; }
      }
      .animate-glow { animation: glow 1.5s infinite alternate; }
      @keyframes bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-8px); }
      }
      .animate-bounce { animation: bounce 1s infinite alternate; }
      `}</style>
    </div>
  );
} 