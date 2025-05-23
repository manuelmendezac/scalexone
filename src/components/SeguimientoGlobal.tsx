import React from 'react';

// Colores representativos de cada módulo (ajusta según tus módulos)
const MODULOS = [
  { nombre: 'Sincronizador Mental', color: '#3ec6f7' },
  { nombre: 'Biblioteca de Conocimiento', color: '#ffe93c' },
  { nombre: 'Consejero Inteligente', color: '#ff6bff' },
  { nombre: 'Planificador de Metas', color: '#baff99' },
  { nombre: 'Cámara de Enfoque', color: '#ffb347' },
  { nombre: 'Sensor Emocional', color: '#ff4b6b' },
  { nombre: 'Guía de Decisiones IA', color: '#ffe93c' },
  { nombre: 'Desafíos Avanzados', color: '#3ec6f7' },
  { nombre: 'Laboratorio de Ideas', color: '#b24bf3' },
];

// Mensaje motivacional según progreso
function getMensajeMotivacional(porcentaje: number) {
  if (porcentaje < 30) return 'Tu clon está en fase de entrenamiento. ¡Sigue avanzando!';
  if (porcentaje < 70) return '¡Buen trabajo! Tu clon evoluciona y aprende contigo.';
  if (porcentaje < 100) return '¡Increíble! Tu clon está casi listo para ayudarte a niveles más altos.';
  return '¡Felicidades! Has completado la configuración de tu Segundo Cerebro.';
}

interface SeguimientoGlobalProps {
  porcentaje: number;
  xp: number;
  coins: number;
}

const RADIUS = 110;
const STROKE = 18;
const GAP = 6;
const CIRC = 2 * Math.PI * RADIUS;

export default function SeguimientoGlobal({ porcentaje, xp, coins }: SeguimientoGlobalProps) {
  // Cálculo de segmentos para cada módulo
  const segmentos = MODULOS.map((mod, idx) => {
    const total = MODULOS.length;
    const start = (CIRC / total) * idx;
    const end = (CIRC / total) * (idx + 1);
    const dash = end - start;
    return {
      color: mod.color,
      dasharray: `${dash} ${CIRC - dash}`,
      offset: start,
    };
  });

  // Progreso principal (anillo interior)
  const dashOffset = CIRC - (porcentaje / 100) * CIRC;

  return (
    <section className="w-full flex flex-col items-center justify-center py-20 relative bg-gradient-to-b from-[#181c2f] via-[#23233a] to-[#181c2f] border-t-2 border-[#3ec6f7]/20 mt-16 animate-fadein">
      <div className="max-w-3xl w-full flex flex-col items-center gap-8 p-8 rounded-3xl border-2 border-[#b24bf3]/30 shadow-2xl bg-[#181c2f]/80 relative">
        <div className="text-4xl font-extrabold font-orbitron text-[#b24bf3] drop-shadow-lg tracking-wide mb-2 text-center animate-glow">📊 Seguimiento Global</div>
        <div className="text-[#ffe93c] text-lg mb-6 font-semibold max-w-2xl drop-shadow text-center">
          Cada módulo suma puntos de progreso, XP y NeuroCoins. El objetivo es construir un clon cada vez más potente y personalizado, basado en tu enfoque, tus emociones, tus decisiones, tus metas y tus aprendizajes.
        </div>
        {/* Círculo de progreso multianillo */}
        <div className="relative flex items-center justify-center mb-4">
          <svg width={320} height={320} viewBox="0 0 320 320" className="drop-shadow-2xl">
            {/* Anillos exteriores por módulo */}
            {segmentos.map((seg, idx) => (
              <circle
                key={idx}
                cx="160"
                cy="160"
                r={RADIUS + (idx - 2) * (STROKE + GAP)}
                stroke={seg.color}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={seg.dasharray}
                strokeDashoffset={-seg.offset}
                style={{ filter: `drop-shadow(0 0 16px ${seg.color}88)` }}
                opacity={0.7}
              />
            ))}
            {/* Anillo principal de progreso */}
            <circle
              cx="160"
              cy="160"
              r={RADIUS}
              stroke="#fff"
              strokeWidth={STROKE}
              fill="none"
              opacity={0.08}
            />
            <circle
              cx="160"
              cy="160"
              r={RADIUS}
              stroke="url(#gradProgreso)"
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 32px #b24bf3)' }}
            />
            <defs>
              <linearGradient id="gradProgreso" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3ec6f7" />
                <stop offset="30%" stopColor="#ffe93c" />
                <stop offset="60%" stopColor="#ff6bff" />
                <stop offset="100%" stopColor="#b24bf3" />
              </linearGradient>
            </defs>
            {/* Porcentaje central */}
            <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="3.2em" fontWeight="bold" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 18px #b24bf3' }}>{porcentaje}%</text>
          </svg>
        </div>
        <div className="text-[#baff99] text-xl font-bold mb-2">Progreso total del Segundo Cerebro</div>
        {/* Valores globales */}
        <div className="flex flex-row gap-8 items-center justify-center mb-4">
          <span className="px-6 py-2 rounded-full bg-[#23233a] border border-[#b24bf3]/40 shadow text-[#3ec6f7] font-bold text-xl flex items-center gap-2 animate-glow">{porcentaje}% Configuración</span>
          <span className="px-6 py-2 rounded-full bg-[#23233a] border border-[#b24bf3]/40 shadow text-[#ffe93c] font-bold text-xl flex items-center gap-2 animate-glow">{xp} XP</span>
          <span className="px-6 py-2 rounded-full bg-[#23233a] border border-[#b24bf3]/40 shadow text-[#ff6bff] font-bold text-xl flex items-center gap-2 animate-glow">{coins} <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-7 h-7 inline-block ml-1" /></span>
        </div>
        {/* Mensaje motivacional */}
        <div className="text-[#ff6bff] text-lg font-semibold text-center mt-2 animate-fadein">
          {getMensajeMotivacional(porcentaje)}
        </div>
      </div>
      {/* Animaciones extra */}
      <style>{`
      @keyframes glow {
        0% { box-shadow: 0 0 8px 2px #b24bf388, 0 0 0 0 #ff6bff00; }
        50% { box-shadow: 0 0 32px 12px #b24bf3, 0 0 0 0 #ff6bff44; }
        100% { box-shadow: 0 0 8px 2px #b24bf388, 0 0 0 0 #ff6bff00; }
      }
      .animate-glow { animation: glow 1.5s infinite alternate; }
      `}</style>
    </section>
  );
} 