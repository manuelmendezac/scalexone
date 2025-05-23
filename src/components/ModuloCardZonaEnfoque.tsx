import React from 'react';

interface Props {
  sesiones: number;
  progreso: number;
  estado: 'pendiente' | 'en_curso' | 'completado';
  onIniciarSesion: () => void;
  onReflexion: () => void;
}

const estados = {
  pendiente: { texto: 'Pendiente', color: 'bg-yellow-400', icon: '⏳' },
  en_curso: { texto: 'En curso', color: 'bg-green-400', icon: '🟢' },
  completado: { texto: 'Completado', color: 'bg-cyan-400', icon: '🏆' },
};

export default function ModuloCardZonaEnfoque({
  sesiones,
  progreso,
  estado,
  onIniciarSesion,
  onReflexion,
}: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto relative rounded-2xl border border-[#aef1ff] shadow-2xl p-0 flex flex-col gap-0 mb-10 overflow-hidden bg-gradient-to-br from-[#1a1a2f] via-[#1a2a3f] to-[#0a1a2f]">
      {/* Fondo animado de partículas */}
      <div className="absolute inset-0 z-0 pointer-events-none animate-pulse" style={{background: 'radial-gradient(circle at 60% 40%, #aef1ff 0%, transparent 60%)'}} />
      {/* Línea superior */}
      <div className="relative z-10 flex flex-row items-center w-full gap-8 px-8 py-6">
        {/* Temporizador Pomodoro animado */}
        <div className="flex flex-col items-center w-44 min-w-[140px]">
          <div className="w-32 h-32 rounded-full bg-[#0a1623] border-4 border-[#aef1ff] flex items-center justify-center mb-2 animate-pulse shadow-lg">
            <span className="text-4xl font-bold text-[#aef1ff]">25:00</span>
          </div>
          {/* Barra de progreso */}
          <div className="w-28 h-3 bg-[#1a2a3f] rounded-full relative mt-1 overflow-hidden">
            <div className="h-3 rounded-full bg-gradient-to-r from-[#aef1ff] via-[#3ec6f7] to-[#aef1ff] animate-pulse" style={{ width: `${progreso}%` }} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[#aef1ff] font-bold">{progreso}%</span>
          </div>
        </div>
        {/* Centro: info y sesiones */}
        <div className="flex-1 flex flex-col items-start justify-center gap-2">
          <div className="font-extrabold text-3xl text-[#aef1ff] font-orbitron mb-1 drop-shadow-lg tracking-wide">Zona de Enfoque</div>
          <div className="text-[#b6eaff] text-base mb-1 font-semibold max-w-xl drop-shadow">Activa sesiones de trabajo profundo, bloquea distracciones y mejora tu productividad con IA.</div>
          <div className="flex flex-row gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-[#aef1ff]/20 text-[#aef1ff] font-bold text-xs shadow">{sesiones} sesiones</span>
          </div>
        </div>
        {/* Derecha: estado y botón */}
        <div className="flex flex-col items-end gap-3 min-w-[160px]">
          <div className="flex flex-row gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full font-bold text-sm shadow ${estados[estado].color}`}>{estados[estado].icon} {estados[estado].texto}</span>
          </div>
          <button
            className="px-7 py-2 rounded-xl font-bold text-lg bg-gradient-to-r from-[#aef1ff] to-[#3ec6f7] text-[#101c2c] hover:from-[#b6eaff] hover:to-[#aef1ff] shadow-lg font-orbitron mb-1 transition-all animate-bounce"
            onClick={onIniciarSesion}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
      {/* Línea inferior: reflexión post-sesión */}
      <div className="relative z-10 flex flex-row items-center gap-6 px-10 py-6 bg-[#162232]/80 border-t border-[#aef1ff]/30 justify-between">
        <button
          className="flex flex-col items-center gap-2 bg-[#aef1ff]/10 rounded-2xl p-6 hover:bg-[#aef1ff]/30 transition group border-2 border-[#aef1ff]/30 shadow-xl animate-pulse"
          onClick={onReflexion}
        >
          <img src="https://www.svgrepo.com/show/499962/brain.svg" alt="Reflexión" className="w-10 h-10 mb-1 group-hover:scale-110 transition" />
          <span className="text-[#aef1ff] font-bold text-base text-center">Reflexión post-sesión</span>
        </button>
      </div>
    </div>
  );
} 