import React, { useState } from 'react';
import { supabase } from '../../supabase';

const REACCIONES = [
  { tipo: 'like', emoji: '👍', label: 'Me gusta' },
  { tipo: 'love', emoji: '❤️', label: 'Me encanta' },
  { tipo: 'haha', emoji: '😂', label: 'Me divierte' },
  { tipo: 'wow', emoji: '😮', label: 'Me asombra' },
  { tipo: 'sad', emoji: '😢', label: 'Me entristece' },
  { tipo: 'angry', emoji: '😡', label: 'Me enoja' },
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
    <div
      className="relative flex items-center gap-2 select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Botón principal (reacción actual o like) */}
      <button
        className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold border border-gray-700 bg-black/30 hover:bg-black/50 transition ${miReaccion ? 'text-blue-500' : 'text-gray-300'}`}
        style={{ minWidth: 60 }}
      >
        {miReaccion
          ? REACCIONES.find(r => r.tipo === miReaccion)?.emoji || '👍'
          : '👍'}
        <span className="ml-1">{miReaccion ? REACCIONES.find(r => r.tipo === miReaccion)?.label : 'Me gusta'}</span>
      </button>
      {/* Menú de reacciones al hacer hover */}
      {hover && (
        <div className="absolute -top-12 left-0 flex gap-2 bg-black/90 rounded-full px-3 py-2 shadow-lg z-20 animate-fade-in">
          {REACCIONES.map(r => (
            <button
              key={r.tipo}
              className="text-2xl hover:scale-125 transition-transform duration-150"
              title={r.label}
              onClick={() => onReact(r.tipo)}
              style={{
                filter: miReaccion === r.tipo ? 'drop-shadow(0 0 6px #3b82f6)' : 'none',
                transform: miReaccion === r.tipo ? 'scale(1.2)' : 'scale(1)',
              }}
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