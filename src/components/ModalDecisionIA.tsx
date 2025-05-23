import React from 'react';

interface ModalDecisionIAProps {
  decision: string;
  resultado: string;
  sugerencia: string;
  loading: boolean;
  onApply: () => void;
  onClose: () => void;
}

export default function ModalDecisionIA({
  decision,
  resultado,
  sugerencia,
  loading,
  onApply,
  onClose
}: ModalDecisionIAProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181c2f]/90 backdrop-blur-sm animate-fadein">
      {/* Fondo animado tipo scan */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" className="absolute inset-0 animate-scan">
          <defs>
            <radialGradient id="scanGlow" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#ffe93c" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#23233a" stopOpacity="0.0" />
            </radialGradient>
            <linearGradient id="scanBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3ec6f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#b24bf3" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <circle cx="50%" cy="50%" r="40%" fill="url(#scanGlow)" />
          {/* Líneas y partículas animadas */}
          {[...Array(18)].map((_,i) => (
            <rect key={i} x={`${10 + i*5}%`} y="0" width="2" height="100%" fill="#ffe93c" opacity={0.03 + 0.02*(i%3)} rx={2} />
          ))}
          {/* Barra de scan animada */}
          {loading && (
            <rect x="0" y="0" width="100%" height="8" fill="url(#scanBar)" className="animate-scanbar" />
          )}
        </svg>
      </div>
      {/* Modal principal */}
      <div className="relative z-10 bg-[#23233a] rounded-2xl border-4 border-[#ffe93c]/20 shadow-2xl p-10 max-w-lg w-full flex flex-col gap-6 animate-glow-soft">
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-[#3ec6f7]/10 border-4 border-[#ffe93c]/30 flex items-center justify-center mb-2 animate-pulse">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" stroke="#ffe93c" strokeWidth="4" fill="none" opacity="0.08" />
              <circle cx="30" cy="30" r="22" stroke="#3ec6f7" strokeWidth="3" fill="none" opacity="0.18" />
              <circle cx="30" cy="30" r="18" stroke="#b24bf3" strokeWidth="2" fill="none" opacity="0.22" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-[#ffe93c] text-center mb-1 animate-glow-soft">Análisis de Decisión IA</div>
          <div className="text-[#3ec6f7] text-lg text-center mb-2">{decision}</div>
        </div>
        {/* Barra de progreso circular */}
        {loading && (
          <div className="flex flex-col items-center gap-2 mb-2">
            <svg width="90" height="90" viewBox="0 0 90 90" className="animate-spin-slow">
              <circle cx="45" cy="45" r="38" stroke="#ffe93c" strokeWidth="8" fill="none" opacity="0.06" />
              <circle cx="45" cy="45" r="38" stroke="#3ec6f7" strokeWidth="8" fill="none" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * 0.3} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px #3ec6f7)' }} />
            </svg>
            <div className="text-[#ffe93c] font-bold animate-pulse" style={{opacity:0.7}}>Analizando variables cognitivas...</div>
          </div>
        )}
        {/* Resultado IA */}
        {!loading && (
          <div className="flex flex-col items-center gap-4 animate-fadein">
            <div className="text-xl font-bold text-[#3ec6f7] text-center animate-glow-soft">{resultado}</div>
            <div className="text-[#b24bf3] text-base text-center animate-glow-soft">{sugerencia}</div>
            <div className="flex flex-row gap-4 mt-2">
              <button onClick={onApply} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#ffe93c] text-[#181c2c] font-bold text-lg shadow-lg border-2 border-[#3ec6f7] hover:scale-105 transition animate-glow-soft">Aplicar decisión</button>
              <button onClick={onClose} className="px-6 py-3 rounded-xl bg-[#23233a] border-2 border-[#ffe93c]/20 text-[#ffe93c] font-bold text-lg hover:scale-105 transition animate-glow-soft">Cerrar</button>
            </div>
          </div>
        )}
        {/* Pie motivacional */}
        <div className="mt-4 text-[#ffe93c] text-sm text-center animate-fadein" style={{opacity:0.7}}>
          Tu IA ha analizado las variables, pero la decisión final es tuya. <br />Confía en tu intuición aumentada.
        </div>
      </div>
      {/* Animaciones CSS */}
      <style>{`
      @keyframes scanbar {
        0% { transform: translateX(-100%); opacity: 0.08; }
        50% { transform: translateX(0); opacity: 0.18; }
        100% { transform: translateX(100%); opacity: 0.08; }
      }
      .animate-scanbar { animation: scanbar 2.2s linear infinite; }
      @keyframes scan {
        0% { opacity: 0.5; }
        50% { opacity: 0.7; }
        100% { opacity: 0.5; }
      }
      .animate-scan { animation: scan 2.5s infinite alternate; }
      @keyframes glow-soft {
        0% { box-shadow: 0 0 4px 1px #ffe93c22, 0 0 0 0 #3ec6f700; }
        50% { box-shadow: 0 0 12px 4px #ffe93c33, 0 0 0 0 #3ec6f744; }
        100% { box-shadow: 0 0 4px 1px #ffe93c22, 0 0 0 0 #3ec6f700; }
      }
      .animate-glow-soft { animation: glow-soft 1.5s infinite alternate; }
      @keyframes spin-slow {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .animate-spin-slow { animation: spin-slow 2.5s linear infinite; }
      @keyframes fadein {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fadein { animation: fadein 0.7s; }
      `}</style>
    </div>
  );
} 