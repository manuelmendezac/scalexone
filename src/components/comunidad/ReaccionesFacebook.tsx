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

  return (
    <div className="relative flex items-center gap-2 select-none">
      {/* Íconos de reacciones */}
      {REACCIONES.map(r => (
        <button
          key={r.tipo}
          className={`text-2xl transition-transform duration-150 px-1 ${miReaccion === r.tipo ? 'scale-125 ring-2 ring-yellow-400' : 'opacity-80 hover:scale-110'}`}
          title={r.emoji}
          onClick={() => onReact(r.tipo)}
          style={{ background: 'none', border: 'none', outline: 'none' }}
        >
          {r.emoji}
        </button>
      ))}
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