import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PLANETAS = [
  { nombre: 'Misión Personal', icono: '🌍', color: 'from-blue-500 to-cyan-400', ruta: '/meta-galaxy/mision-personal', descripcion: 'Define tu propósito central.' },
  { nombre: 'Pasiones', icono: '💥', color: 'from-pink-500 to-red-400', ruta: '/meta-galaxy/pasiones', descripcion: 'Descubre lo que te mueve.' },
  { nombre: 'Habilidades', icono: '🧠', color: 'from-green-500 to-lime-400', ruta: '/meta-galaxy/habilidades', descripcion: 'Reconoce tus talentos clave.' },
  { nombre: 'Impacto', icono: '🌐', color: 'from-purple-500 to-indigo-400', ruta: '/meta-galaxy/impacto', descripcion: 'Visualiza tu huella en el mundo.' },
  { nombre: 'Sueño Máximo', icono: '🛸', color: 'from-yellow-400 to-orange-500', ruta: '/meta-galaxy/sueno-maximo', descripcion: 'Proyecta tu meta más ambiciosa.' },
];

export default function MetaGalaxyMap() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [hovered, setHovered] = useState<number|null>(null);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-blue-900 to-purple-900 overflow-hidden relative">
      {/* Fondo de estrellas animado a pantalla completa */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%">
          {[...Array(120)].map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * window.innerWidth}
              cy={Math.random() * window.innerHeight}
              r={Math.random() * 1.5 + 0.5}
              fill="#fff"
              opacity={Math.random() * 0.7 + 0.2}
            />
          ))}
        </svg>
      </div>

      {/* Botón de ayuda */}
      <button
        className="absolute top-6 right-8 z-30 bg-white/10 hover:bg-white/20 text-cyan-200 px-4 py-2 rounded-full font-bold shadow-lg border border-cyan-400/30 backdrop-blur"
        onClick={() => setShowHelp(true)}
      >
        ¿Qué es esto?
      </button>

      {/* Mensaje de bienvenida */}
      {showWelcome && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-br from-cyan-900/90 to-blue-900/90 border border-cyan-400/30 rounded-2xl shadow-2xl p-6 max-w-lg w-full text-center animate-fadein-sci-fi">
          <h2 className="text-2xl font-bold text-cyan-200 mb-2 font-orbitron">¡Bienvenido a tu galaxia aspiracional!</h2>
          <p className="text-cyan-100 mb-4">Explora los planetas para descubrir y construir tu propósito. <br/>Empieza por <span className="font-bold text-blue-300">Misión Personal</span>.</p>
          <button onClick={() => setShowWelcome(false)} className="mt-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-400 text-white rounded-full font-bold shadow">Entendido</button>
        </div>
      )}

      {/* Panel de ayuda */}
      {showHelp && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-br from-purple-900/95 to-blue-900/95 border border-cyan-400/30 rounded-2xl shadow-2xl p-8 max-w-xl w-full text-center animate-fadein-sci-fi">
          <h2 className="text-xl font-bold text-cyan-200 mb-2 font-orbitron">¿Cómo funciona?</h2>
          <ul className="text-cyan-100 text-left mb-4 list-disc list-inside">
            <li>Haz clic en cada planeta para completar minijuegos de autodescubrimiento.</li>
            <li>Empieza por <b>Misión Personal</b> (el planeta azul).</li>
            <li>Cada planeta representa una parte de tu propósito: misión, pasiones, habilidades, impacto y sueño máximo.</li>
            <li>Al completar planetas, tu clon evoluciona y desbloqueas recompensas.</li>
          </ul>
          <button onClick={() => setShowHelp(false)} className="mt-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-400 text-white rounded-full font-bold shadow">Cerrar</button>
        </div>
      )}

      {/* Planetas */}
      <div className="relative z-10 flex gap-8 items-end justify-center w-full max-w-4xl">
        {PLANETAS.map((planeta, index) => (
          <div key={planeta.nombre} className="flex flex-col items-center">
            <button
              onClick={() => planeta.ruta !== '#' && navigate(planeta.ruta)}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative bg-gradient-to-br ${planeta.color} p-8 rounded-full transition-all duration-300
                ${index === 0 ? 'ring-4 ring-cyan-300 animate-pulse-slow shadow-xl' : 'shadow-lg'}
                hover:scale-110 focus:scale-110`}
              style={{ minWidth: 90, minHeight: 90 }}
            >
              <span className="text-4xl">{planeta.icono}</span>
            </button>
            <span className="mt-3 text-cyan-100 font-bold text-base font-orbitron drop-shadow animate-glow-sci-fi text-center">
              {planeta.nombre}
            </span>
            {/* Descripción corta al hacer hover */}
            {hovered === index && (
              <div className="mt-2 px-4 py-2 bg-black/80 text-cyan-200 rounded-xl shadow-lg text-xs max-w-[120px] animate-fadein-sci-fi">
                {planeta.descripcion}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Animaciones Tailwind personalizadas sugeridas:
// .animate-bounce-slow, .animate-float-slow, .animate-pulse-slow, .animate-glow-sci-fi, .animate-fadein-sci-fi
// Puedes definirlas en tu tailwind.config.js para mayor efecto visual. 