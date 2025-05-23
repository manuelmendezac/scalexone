import React from 'react';

interface PodEntrenamientoProps {
  nombre: string;
  icono: React.ReactNode;
  color: string; // tailwind color o hex
  descripcion: string;
  onClick?: () => void;
}

const colores: Record<string, string> = {
  azul: 'from-cyan-500 to-blue-800',
  verde: 'from-green-400 to-teal-700',
  morado: 'from-purple-500 to-indigo-800',
  amarillo: 'from-yellow-400 to-yellow-700',
  naranja: 'from-orange-400 to-pink-600',
  cian: 'from-cyan-400 to-blue-600',
  rosa: 'from-pink-400 to-purple-700',
};

export default function PodEntrenamiento({ nombre, icono, color, descripcion, onClick }: PodEntrenamientoProps) {
  return (
    <button
      className={`group relative flex flex-col items-center justify-center w-56 h-56 m-4 rounded-3xl shadow-2xl border-4 border-cyan-300 bg-gradient-to-br ${colores[color] || colores.azul} hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-400/40 animate-fadein-sci-fi`}
      onClick={onClick}
      tabIndex={0}
    >
      <div className="text-5xl mb-2 drop-shadow-glow-sci-fi animate-pulse-sci-fi">{icono}</div>
      <div className="text-xl font-bold text-cyan-100 drop-shadow-lg text-center mb-1 font-orbitron animate-glow-sci-fi">{nombre}</div>
      <div className="text-cyan-200 text-sm text-center px-2 animate-fadein-sci-fi">{descripcion}</div>
      <div className="absolute -inset-1 rounded-3xl border-2 border-cyan-400/30 pointer-events-none animate-glow-sci-fi" />
    </button>
  );
} 