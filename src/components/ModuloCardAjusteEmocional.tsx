import React from 'react';

interface Props {
  progreso: number;
  estado: 'pendiente' | 'en_curso' | 'completado';
  emocionesHoy: number;
  onRegistrarEmocion: () => void;
  onEjercicio: () => void;
}

const estados = {
  pendiente: { texto: 'Pendiente', color: 'bg-yellow-400', icon: '😊' },
  en_curso: { texto: 'En curso', color: 'bg-green-400', icon: '😌' },
  completado: { texto: 'Completado', color: 'bg-cyan-400', icon: '😃' },
};

const emojis = ['😃', '😐', '😢', '😡', '😱', '😴'];

export default function ModuloCardAjusteEmocional({
  progreso,
  estado,
  emocionesHoy,
  onRegistrarEmocion,
  onEjercicio,
}: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto relative rounded-2xl border border-[#ffb6b6] shadow-2xl p-0 flex flex-col gap-0 mb-10 overflow-hidden bg-gradient-to-br from-[#2f1a2f] via-[#3f2a3f] to-[#1a1a2f]">
      {/* Fondo animado de ondas */}
      <div className="absolute inset-0 z-0 pointer-events-none animate-pulse" style={{background: 'radial-gradient(circle at 40% 60%, #ffb6b6 0%, transparent 60%)'}} />
      {/* Línea superior */}
      <div className="relative z-10 flex flex-row items-center w-full gap-8 px-8 py-6">
        {/* Selector de emociones animado */}
        <div className="flex flex-col items-center w-44 min-w-[140px]">
          <div className="flex flex-row gap-2 mb-2 animate-bounce">
            {emojis.map((e, i) => (
              <span key={i} className="text-3xl cursor-pointer hover:scale-125 transition-all drop-shadow-lg" title="Seleccionar emoción">{e}</span>
            ))}
          </div>
          {/* Barra de progreso emocional */}
          <div className="w-28 h-3 bg-[#3f2a3f] rounded-full relative mt-1 overflow-hidden">
            <div className="h-3 rounded-full bg-gradient-to-r from-[#ffb6b6] via-[#fff7ae] to-[#ffb6b6] animate-pulse" style={{ width: `${progreso}%` }} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[#fff7ae] font-bold">{progreso}%</span>
          </div>
        </div>
        {/* Centro: info y emociones */}
        <div className="flex-1 flex flex-col items-start justify-center gap-2">
          <div className="font-extrabold text-3xl text-[#ffb6b6] font-orbitron mb-1 drop-shadow-lg tracking-wide">Ajuste Emocional</div>
          <div className="text-[#ffeeb6] text-base mb-1 font-semibold max-w-xl drop-shadow">Registra tu estado emocional, realiza ejercicios guiados y observa tu evolución con IA.</div>
          <div className="flex flex-row gap-2 mt-2">
            <span className="px-3 py-1 rounded-full bg-[#ffb6b6]/20 text-[#ffb6b6] font-bold text-xs shadow">{emocionesHoy} emociones hoy</span>
          </div>
        </div>
        {/* Derecha: estado y botón */}
        <div className="flex flex-col items-end gap-3 min-w-[160px]">
          <div className="flex flex-row gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full font-bold text-sm shadow ${estados[estado].color}`}>{estados[estado].icon} {estados[estado].texto}</span>
          </div>
          <button
            className="px-7 py-2 rounded-xl font-bold text-lg bg-gradient-to-r from-[#ffb6b6] to-[#fff7ae] text-[#101c2c] hover:from-[#ffeeb6] hover:to-[#ffb6b6] shadow-lg font-orbitron mb-1 transition-all animate-bounce"
            onClick={onRegistrarEmocion}
          >
            Registrar emoción
          </button>
        </div>
      </div>
      {/* Línea inferior: ejercicio guiado y gráfica */}
      <div className="relative z-10 flex flex-row items-center gap-6 px-10 py-6 bg-[#2f1a2f]/80 border-t border-[#ffb6b6]/30 justify-between">
        <button
          className="flex flex-col items-center gap-2 bg-[#ffb6b6]/10 rounded-2xl p-6 hover:bg-[#ffb6b6]/30 transition group border-2 border-[#ffb6b6]/30 shadow-xl animate-pulse"
          onClick={onEjercicio}
        >
          <img src="https://www.svgrepo.com/show/499962/brain.svg" alt="Ejercicio guiado" className="w-10 h-10 mb-1 group-hover:scale-110 transition" />
          <span className="text-[#ffb6b6] font-bold text-base text-center">Ejercicio guiado</span>
        </button>
        {/* Gráfica de evolución emocional (placeholder visual) */}
        <div className="flex flex-col items-center">
          <span className="text-[#ffeeb6] font-bold mb-1">Evolución emocional</span>
          <div className="w-32 h-16 bg-gradient-to-t from-[#ffb6b6]/30 to-[#fff7ae]/10 rounded-lg shadow-inner flex items-end">
            <div className="w-4 h-8 bg-[#ffb6b6] rounded-t-lg mx-1 animate-pulse" />
            <div className="w-4 h-12 bg-[#ffeeb6] rounded-t-lg mx-1 animate-pulse" />
            <div className="w-4 h-6 bg-[#ffb6b6] rounded-t-lg mx-1 animate-pulse" />
            <div className="w-4 h-10 bg-[#ffeeb6] rounded-t-lg mx-1 animate-pulse" />
            <div className="w-4 h-14 bg-[#ffb6b6] rounded-t-lg mx-1 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
} 