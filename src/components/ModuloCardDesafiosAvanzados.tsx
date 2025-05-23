import React, { useState } from 'react';
import { BrainCircuit, Zap, Award, Loader2, CheckCircle, BarChart3, Sparkles, Info } from 'lucide-react';

// Colores y estilos base
const COLOR_PRINCIPAL = '#3ec6f7'; // Azul neón
const COLOR_SECUNDARIO = '#ffe93c'; // Dorado
const COLOR_FONDO = '#181c2f';
const COLOR_GLOW = '#00fff7';

// Ejemplos de retos por categoría
const RETOS = {
  'Simulador de Decisiones': [
    {
      pregunta: 'Tienes dos caminos: uno seguro pero lento, otro arriesgado pero rápido. ¿Cuál eliges?',
      opciones: ['Seguro y lento', 'Arriesgado y rápido'],
      correcta: 1,
      feedback: ['A veces la paciencia es clave.', '¡El riesgo puede traer grandes recompensas!']
    },
    {
      pregunta: 'Debes priorizar: ¿Innovar o perfeccionar lo existente?',
      opciones: ['Innovar', 'Perfeccionar'],
      correcta: 0,
      feedback: ['¡La innovación mueve el mundo!', 'La excelencia también es evolución.']
    }
  ],
  'Reto Lógico': [
    {
      pregunta: '¿Cuál es el siguiente número en la secuencia? 2, 4, 8, 16, ___',
      opciones: ['18', '24', '32', '20'],
      correcta: 2,
      feedback: ['No, revisa la multiplicación.', 'No, revisa la multiplicación.', '¡Correcto! Es el doble de 16.', 'No, revisa la multiplicación.']
    },
    {
      pregunta: '¿Cuál es el siguiente número primo después de 17?',
      opciones: ['19', '21', '23', '25'],
      correcta: 0,
      feedback: ['¡Correcto! 19 es primo.', 'No, 21 no es primo.', '23 es primo, pero después de 19.', 'No, 25 no es primo.']
    }
  ],
  'Pensamiento Creativo': [
    {
      pregunta: '¿Qué uso alternativo le darías a un clip de papel?',
      opciones: ['Herramienta para resetear dispositivos', 'Juguete para gatos', 'Soporte para móvil', 'Todas las anteriores'],
      correcta: 3,
      feedback: ['¡Creativo!', '¡Divertido!', '¡Práctico!', '¡La creatividad no tiene límites!']
    }
  ]
};

// Utilidad para obtener reto aleatorio por categoría
function getRetoAleatorio(categoria) {
  const arr = RETOS[categoria];
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function ModuloCardDesafiosAvanzados() {
  // Estado general
  const [progreso, setProgreso] = useState(0);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [estado, setEstado] = useState<'pendiente'|'en_curso'|'completado'>('pendiente');
  const [showSimulador, setShowSimulador] = useState(false);
  const [showLogico, setShowLogico] = useState(false);
  const [showCognitivo, setShowCognitivo] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState('');
  const [retoActual, setRetoActual] = useState(null);
  const [respuesta, setRespuesta] = useState<number|null>(null);
  const [feedback, setFeedback] = useState('');
  const [bloqueado, setBloqueado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [bonus, setBonus] = useState(false);
  const [showGuia, setShowGuia] = useState(false);

  // Barra de progreso circular
  const circ = 2 * Math.PI * 50;
  const dash = circ - (progreso / 100) * circ;

  // Lógica de bloqueo (1 reto cada 8h, bonus si 3 en 24h)
  // Aquí puedes conectar con Supabase o el store global para persistencia real
  // Por ahora, simulado en local

  // Iniciar reto
  function iniciarReto(categoria) {
    setCategoriaActual(categoria);
    setRetoActual(getRetoAleatorio(categoria));
    setRespuesta(null);
    setFeedback('');
    setEstado('en_curso');
    setShowSimulador(categoria === 'Simulador de Decisiones');
    setShowLogico(categoria === 'Reto Lógico');
    setShowCognitivo(false);
  }

  // Responder reto
  function responderReto(idx) {
    setRespuesta(idx);
    if (retoActual) {
      setFeedback(retoActual.feedback[idx]);
      if (idx === retoActual.correcta) {
        setProgreso(p => Math.min(100, p + 33));
        setXp(x => x + 15);
        setCoins(c => c + 2);
        if (progreso + 33 >= 100) {
          setEstado('completado');
          setBonus(true);
        }
      }
      setTimeout(() => {
        setShowSimulador(false);
        setShowLogico(false);
        setFeedback('');
        setRespuesta(null);
        setRetoActual(null);
      }, 2200);
    }
  }

  // Simulación de feedback cognitivo
  function verProgresoCognitivo() {
    setShowCognitivo(true);
    setShowSimulador(false);
    setShowLogico(false);
  }

  // Animación de fondo sci-fi
  const fondoAnimado = (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <svg width="100%" height="100%" className="absolute inset-0" style={{filter:'blur(2px)'}}>
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor="#3ec6f7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#23233a" stopOpacity="0.0" />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="60%" fill="url(#g1)" />
        <g>
          {[...Array(12)].map((_,i) => (
            <rect key={i} x={30+i*100} y={30+i*20} width={2} height={180} fill="#00fff7" opacity={0.08 + 0.04*(i%3)} rx={2} />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 animate-pulse" style={{boxShadow:'0 0 80px 10px #3ec6f755'}} />
    </div>
  );

  return (
    <div className="w-full min-h-[540px] relative rounded-2xl border-4 mb-10 overflow-hidden shadow-2xl p-0 flex flex-col gap-0 bg-gradient-to-br from-[#181c2f] via-[#3ec6f7]/10 to-[#23233a] animate-fadein">
      {fondoAnimado}
      {/* Cabecera */}
      <div className="flex flex-row items-center justify-center gap-16 w-full px-8 py-10 relative z-10">
        {/* Imagen central */}
        <div className="flex flex-col items-center justify-center min-w-[260px]">
          <div className="relative w-56 h-56 rounded-full overflow-hidden shadow-2xl border-4 border-[#3ec6f7] bg-[#23233a] flex items-center justify-center z-10 animate-pulse" style={{boxShadow: `0 0 48px 0 #3ec6f755`}}>
            <BrainCircuit className="w-40 h-40 text-[#3ec6f7] drop-shadow-lg" />
            <div className="absolute inset-0 animate-glow" style={{boxShadow:'0 0 32px 8px #00fff7aa'}} />
          </div>
        </div>
        {/* Barra de progreso circular a la derecha */}
        <div className="flex flex-col items-center min-w-[220px]">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="gaugeDesafio" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3ec6f7" />
                <stop offset="100%" stopColor="#ffe93c" />
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r="80" stroke="#23233a" strokeWidth="18" fill="none" />
            <circle
              cx="90"
              cy="90"
              r="80"
              stroke="url(#gaugeDesafio)"
              strokeWidth="18"
              fill="none"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={dash}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)', filter: 'drop-shadow(0 0 32px #3ec6f7)' }}
            />
            <text x="50%" y="54%" textAnchor="middle" fill="#3ec6f7" fontSize="2.8em" fontWeight="bold" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 12px #3ec6f7' }}>{progreso}%</text>
          </svg>
        </div>
      </div>
      {/* Título y subtítulo centrados */}
      <div className="flex flex-col items-center w-full -mt-8 mb-2 animate-fadein z-10">
        <div className="text-4xl font-extrabold font-orbitron text-[#3ec6f7] drop-shadow-lg tracking-wide mb-2 text-center animate-glow">Desafíos Avanzados</div>
        <div className="text-[#ffe93c] text-xl mb-4 font-semibold max-w-2xl drop-shadow text-center">Prueba tus límites cognitivos y entrena tu clon con retos intensivos.</div>
        <div className="flex flex-row gap-4 items-center mb-2 justify-center">
          <span className="px-6 py-2 rounded-full bg-[#23233a] border border-[#3ec6f7]/40 shadow text-[#3ec6f7] font-bold text-xl flex items-center gap-2 hover:scale-105 transition animate-glow">{xp} XP</span>
          <span className="px-6 py-2 rounded-full bg-[#23233a] border border-[#3ec6f7]/40 shadow text-[#ffe93c] font-bold text-xl flex items-center gap-2 hover:scale-105 transition animate-glow">{coins} <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-7 h-7 inline-block ml-1" /></span>
          <span className={`px-6 py-2 rounded-full font-bold text-xl flex items-center gap-2 ${estado === 'en_curso' ? 'bg-blue-400/20 text-blue-300' : estado === 'pendiente' ? 'bg-[#3ec6f7]/20 text-[#3ec6f7]' : 'bg-green-400/20 text-green-300'} animate-glow`}>{estado === 'en_curso' ? 'En curso' : estado === 'pendiente' ? 'Pendiente' : 'Completado'}</span>
        </div>
        {/* Bonus visual */}
        {bonus && (
          <div className="flex flex-row items-center gap-2 mt-2 animate-bounce">
            <span className="px-6 py-2 rounded-full bg-[#ffe93c]/20 border border-[#ffe93c]/40 text-[#ffe93c] font-bold text-lg flex items-center gap-2 animate-glow"><Award className="w-6 h-6" /> ¡Bonus Elite desbloqueado!</span>
          </div>
        )}
      </div>
      {/* Botón principal */}
      <div className="flex flex-row items-center justify-center gap-8 mb-8 z-10">
        <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#3ec6f7] to-[#ffe93c] text-[#181c2f] font-extrabold text-2xl shadow-lg border-4 border-[#3ec6f7] hover:scale-105 transition animate-glow flex items-center gap-3" onClick={() => setShowSimulador(true)} disabled={bloqueado}>
          <Zap className="w-7 h-7" /> Iniciar Entrenamiento
        </button>
        <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#ffe93c] to-[#3ec6f7] text-[#181c2f] font-extrabold text-2xl shadow-lg border-4 border-[#ffe93c] hover:scale-105 transition animate-glow flex items-center gap-3" onClick={() => iniciarReto('Reto Lógico')} disabled={bloqueado}>
          <BarChart3 className="w-7 h-7" /> Reto Lógico
        </button>
        <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#3ec6f7] to-[#ffe93c] text-[#181c2f] font-extrabold text-2xl shadow-lg border-4 border-[#3ec6f7] hover:scale-105 transition animate-glow flex items-center gap-3" onClick={verProgresoCognitivo}>
          <Sparkles className="w-7 h-7" /> Ver Progreso Cognitivo
        </button>
        <button className="absolute top-4 right-8 z-20 flex flex-row items-center gap-2 p-2 pr-4 rounded-full bg-[#3ec6f7]/10 border border-[#3ec6f7]/40 hover:bg-[#3ec6f7]/30 transition focus:outline-none focus:ring-2 focus:ring-[#3ec6f7] hover:scale-105" onClick={() => setShowGuia(v => !v)}>
          <Info className="w-6 h-6 text-[#3ec6f7]" />
          <span className="text-[#3ec6f7] font-bold text-base select-none">¿Cómo funciona?</span>
        </button>
      </div>
      {/* Guía rápida emergente */}
      {showGuia && (
        <div className="absolute top-20 right-8 z-30 bg-[#23233a]/95 border-2 border-[#3ec6f7]/40 rounded-xl shadow-lg p-6 max-w-xs w-[340px] animate-fadein backdrop-blur-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2"><span className="text-2xl">💡</span><span className="text-lg font-bold text-[#3ec6f7]">Guía rápida</span></div>
          <div className="text-[#3ec6f7] font-bold mb-1">🧠 ¿Cómo usar Desafíos Avanzados?</div>
          <ol className="list-decimal ml-5 text-[#ffe93c] text-base flex flex-col gap-1">
            <li>Elige un reto: Simulador, Lógico o Creativo.</li>
            <li>Responde el desafío y recibe feedback inmediato.</li>
            <li>Completa 3 retos en 24h para desbloquear el bonus elite.</li>
          </ol>
          <div className="mt-2 text-[#ffe93c] text-sm">💬 <b>Tip:</b> Solo puedes hacer 1 reto cada 8h. ¡Entrena como un verdadero elite!</div>
        </div>
      )}
      {/* Paneles de retos */}
      {showSimulador && retoActual && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#181c2f]/80 animate-fadein">
          <div className="bg-[#23233a] rounded-2xl border-4 border-[#3ec6f7] shadow-2xl p-10 max-w-lg w-full flex flex-col gap-6 relative animate-glow">
            <div className="text-2xl font-bold text-[#3ec6f7] mb-2">🧠 Simulador de Decisiones</div>
            <div className="text-[#ffe93c] text-lg mb-4">{retoActual.pregunta}</div>
            <div className="flex flex-col gap-3">
              {retoActual.opciones.map((op, idx) => (
                <button key={idx} className={`px-6 py-3 rounded-xl font-bold text-lg border-2 transition-all ${respuesta === idx ? (idx === retoActual.correcta ? 'bg-green-400/30 border-green-400 text-green-300 animate-bounce' : 'bg-red-400/30 border-red-400 text-red-300 animate-shake') : 'bg-[#23233a] border-[#3ec6f7]/40 text-[#ffe93c] hover:scale-105'}`} onClick={() => responderReto(idx)} disabled={respuesta !== null}>
                  {op}
                </button>
              ))}
            </div>
            {feedback && <div className="mt-4 text-xl font-bold text-[#baff99] animate-fadein">{feedback}</div>}
            <button className="absolute top-4 right-4 text-[#3ec6f7] font-bold" onClick={() => setShowSimulador(false)}>✖</button>
          </div>
        </div>
      )}
      {showLogico && retoActual && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#181c2f]/80 animate-fadein">
          <div className="bg-[#23233a] rounded-2xl border-4 border-[#ffe93c] shadow-2xl p-10 max-w-lg w-full flex flex-col gap-6 relative animate-glow">
            <div className="text-2xl font-bold text-[#ffe93c] mb-2">🧮 Reto Lógico</div>
            <div className="text-[#3ec6f7] text-lg mb-4">{retoActual.pregunta}</div>
            <div className="flex flex-col gap-3">
              {retoActual.opciones.map((op, idx) => (
                <button key={idx} className={`px-6 py-3 rounded-xl font-bold text-lg border-2 transition-all ${respuesta === idx ? (idx === retoActual.correcta ? 'bg-green-400/30 border-green-400 text-green-300 animate-bounce' : 'bg-red-400/30 border-red-400 text-red-300 animate-shake') : 'bg-[#23233a] border-[#ffe93c]/40 text-[#3ec6f7] hover:scale-105'}`} onClick={() => responderReto(idx)} disabled={respuesta !== null}>
                  {op}
                </button>
              ))}
            </div>
            {feedback && <div className="mt-4 text-xl font-bold text-[#baff99] animate-fadein">{feedback}</div>}
            <button className="absolute top-4 right-4 text-[#ffe93c] font-bold" onClick={() => setShowLogico(false)}>✖</button>
          </div>
        </div>
      )}
      {showCognitivo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#181c2f]/80 animate-fadein">
          <div className="bg-[#23233a] rounded-2xl border-4 border-[#3ec6f7] shadow-2xl p-10 max-w-lg w-full flex flex-col gap-6 relative animate-glow">
            <div className="text-2xl font-bold text-[#3ec6f7] mb-2">📊 Progreso Cognitivo del Clon</div>
            <div className="flex flex-col items-center gap-4">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" stroke="#3ec6f7" strokeWidth="14" fill="none" />
                <circle cx="70" cy="70" r="60" stroke="#ffe93c" strokeWidth="14" fill="none" strokeDasharray={2 * Math.PI * 60} strokeDashoffset={(2 * Math.PI * 60) - (progreso / 100) * (2 * Math.PI * 60)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)', filter: 'drop-shadow(0 0 16px #ffe93c)' }} />
                <text x="50%" y="54%" textAnchor="middle" fill="#3ec6f7" fontSize="2em" fontWeight="bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>{progreso}%</text>
              </svg>
              <div className="text-xl font-bold text-[#ffe93c]">Rendimiento actual: {progreso}%</div>
              {bonus && <div className="text-lg text-[#baff99] font-bold animate-bounce">¡Bonus Elite desbloqueado!</div>}
            </div>
            <button className="absolute top-4 right-4 text-[#3ec6f7] font-bold" onClick={() => setShowCognitivo(false)}>✖</button>
          </div>
        </div>
      )}
      {/* Animaciones CSS extra */}
      <style>{`
      @keyframes glow {
        0% { box-shadow: 0 0 8px 2px #3ec6f788, 0 0 0 0 #ffe93c00; }
        50% { box-shadow: 0 0 32px 12px #3ec6f7, 0 0 0 0 #ffe93c44; }
        100% { box-shadow: 0 0 8px 2px #3ec6f788, 0 0 0 0 #ffe93c00; }
      }
      .animate-glow { animation: glow 1.5s infinite alternate; }
      @keyframes bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-8px); }
      }
      .animate-bounce { animation: bounce 1s infinite alternate; }
      @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        50% { transform: translateX(8px); }
        75% { transform: translateX(-8px); }
        100% { transform: translateX(0); }
      }
      .animate-shake { animation: shake 0.5s; }
      `}</style>
      {/*
        // Comentarios para futuras integraciones:
        // - Puedes conectar los retos y progreso a Supabase para persistencia real.
        // - Puedes usar ElevenLabs o Web Speech API para activar modo voz al iniciar entrenamiento.
        // - Puedes escalar la lista RETOS con más categorías y retos dinámicos.
        // - Puedes conectar el progreso a la IA del clon para personalizar los desafíos.
      */}
    </div>
  );
} 