import React, { useState } from 'react';

const REACCIONES = [
  { tipo: 'love', emoji: '❤️' },
  { tipo: 'like', emoji: '👍🏻' },
  { tipo: 'highfive', emoji: '🙌🏻' },
  { tipo: 'robot', emoji: '🦾' },
  { tipo: 'top', emoji: '🔝' },
  { tipo: '100', emoji: '💯' },
  { tipo: 'party', emoji: '🎉' },
  { tipo: 'fire', emoji: '🔥' },
];

interface Props {
  postId: string;
  usuarioId: string;
  reacciones: { tipo: string; count: number; usuarios: string[] }[];
  miReaccion: string | null;
  onReact: (tipo: string) => void;
}

const ReaccionesFacebook: React.FC<Props> = ({ postId, usuarioId, reacciones, miReaccion, onReact }) => {
  const [hover, setHover] = useState(false);
  const reaccionActual = REACCIONES.find(r => r.tipo === miReaccion) || REACCIONES[0];

  return (
    <div
      className="relative flex items-center gap-2 select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ minHeight: 40 }}
    >
      {/* Ícono de reacción actual */}
      <button
        className={`text-2xl transition-transform duration-150 px-1 scale-125 ring-2 ring-yellow-400 bg-black/30 rounded-full`}
        title="Reaccionar"
        style={{ background: 'none', border: 'none', outline: 'none', cursor: 'pointer' }}
      >
        {reaccionActual.emoji}
      </button>
      {/* Menú de reacciones al hacer hover */}
      {hover && (
        <div className="absolute -top-14 left-0 flex gap-2 bg-black/90 rounded-full px-4 py-2 shadow-lg z-20 animate-fade-in border border-[#e6a800]" style={{ minWidth: 260 }}>
          {REACCIONES.map(r => (
            <button
              key={r.tipo}
              className={`text-2xl transition-transform duration-150 px-1 ${miReaccion === r.tipo ? 'scale-125 ring-2 ring-yellow-400' : 'opacity-80 hover:scale-110'} bg-black/0 rounded-full`}
              title={r.emoji}
              onClick={() => onReact(r.tipo)}
              style={{ background: 'none', border: 'none', outline: 'none', cursor: 'pointer' }}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
      {/* Contadores de reacciones */}
      <div className="flex items-center gap-1 ml-2">
        {reacciones.filter(r => r.count > 0).map(r => (
          <span key={r.tipo} className="flex items-center text-base">
            {REACCIONES.find(x => x.tipo === r.tipo)?.emoji} <span className="ml-0.5 text-xs text-gray-400">{r.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default ReaccionesFacebook; 