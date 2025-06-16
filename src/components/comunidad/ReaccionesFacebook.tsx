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
  { tipo: 'clap', emoji: '👏' },
  { tipo: 'smile', emoji: '😁' },
  { tipo: 'whale', emoji: '🐳' },
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
  // Solo mostrar las reacciones usadas en el post
  const usadas = reacciones.filter(r => r.count > 0);
  // Si no hay ninguna, mostrar solo el corazón
  const mostrar = usadas.length > 0 ? usadas : [{ tipo: 'love', count: 0, usuarios: [] }];

  // Para resaltar la reacción del usuario
  const esMia = (tipo: string) => miReaccion === tipo;

  return (
    <div
      className="flex items-center gap-1 select-none"
      style={{ minHeight: 28 }}
    >
      {/* Mostrar solo las reacciones usadas o el corazón */}
      {mostrar.map(r => (
        <button
          key={r.tipo}
          type="button"
          className={`text-xl md:text-2xl px-0.5 transition-transform duration-150 ${esMia(r.tipo) ? 'scale-125' : 'opacity-80 hover:scale-105'} bg-transparent rounded-full`}
          title={REACCIONES.find(x => x.tipo === r.tipo)?.emoji || '❤️'}
          style={{ background: 'none', border: 'none', outline: 'none', cursor: 'pointer', minWidth: 28, boxShadow: 'none' }}
          onClick={() => onReact(r.tipo)}
        >
          {REACCIONES.find(x => x.tipo === r.tipo)?.emoji || '❤️'}
          {r.count > 0 && <span className="ml-0.5 text-xs text-gray-400 font-bold align-middle">{r.count}</span>}
        </button>
      ))}
      {/* Menú de reacciones al hacer hover o clic */}
      {hover && (
        <div className="absolute -top-12 left-0 flex gap-1 bg-black/90 rounded-full px-2 py-1 shadow-lg z-20 animate-fade-in border border-[#e6a800]" style={{ minWidth: 180 }}>
          {REACCIONES.map(r => (
            <button
              key={r.tipo}
              type="button"
              className={`text-xl md:text-2xl px-0.5 transition-transform duration-150 ${miReaccion === r.tipo ? 'scale-125 ring-2 ring-yellow-400' : 'opacity-80 hover:scale-110'} bg-transparent rounded-full`}
              title={r.emoji}
              onClick={() => { onReact(r.tipo); setHover(false); }}
              style={{ background: 'none', border: 'none', outline: 'none', cursor: 'pointer', minWidth: 28, boxShadow: 'none' }}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReaccionesFacebook; 