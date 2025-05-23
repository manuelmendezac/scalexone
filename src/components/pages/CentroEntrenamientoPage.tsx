import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNeuroState from '../../store/useNeuroState';
import FondoEstrellasParallax from '../FondoEstrellasParallax';

// Distribución semicircular (180°) debajo del avatar
const semicircleRadius = 38; // Porcentaje del alto de la pantalla
const semicircleCenterX = 50; // Centro horizontal
const semicircleCenterY = 48; // Centro vertical (debajo del avatar)
const totalModulos = 6;

const zonas = [
  {
    nombre: 'Bóveda de Conocimiento',
    ruta: '/knowledge-vault',
    style: {
      left: `${semicircleCenterX + semicircleRadius * Math.cos(Math.PI)}%`,
      top: '12%',
    },
    imagen: '/images/centroentrenamiento/bobedadeconocimientos.png',
    key: 'boveda',
  },
  {
    nombre: 'Entrenamiento Diario',
    ruta: '/entrenamiento-diario',
    style: {
      left: `${semicircleCenterX + semicircleRadius * Math.cos(Math.PI * 5/6)}%`,
      top: '60%',
    },
    imagen: '/images/centroentrenamiento/entrenamientodiario.png',
    key: 'entrenamiento',
  },
  {
    nombre: 'Inteligencia de Hábitos',
    ruta: '/inteligencia-habitos',
    style: {
      left: `${semicircleCenterX + semicircleRadius * Math.cos(Math.PI * 4/6)}%`,
      top: '70%',
    },
    imagen: '/images/centroentrenamiento/inteligenciadehabitos.png',
    key: 'habitos',
  },
  {
    nombre: 'Perfil Cognitivo',
    ruta: '/perfil-cognitivo',
    style: {
      left: `${semicircleCenterX + semicircleRadius * Math.cos(Math.PI * 2/6)}%`,
      top: '70%',
    },
    imagen: '/images/centroentrenamiento/perfilcognitivo.png',
    key: 'cognitivo',
  },
  {
    nombre: 'Perfil Experto Dinámico',
    ruta: '/dynamic-expert-profile',
    style: {
      left: `${semicircleCenterX + semicircleRadius * Math.cos(Math.PI * 1/6)}%`,
      top: '60%',
    },
    imagen: '/images/centroentrenamiento/perfilexpertodinamico.png',
    key: 'experto',
  },
  {
    nombre: 'Perfil Aspiracional',
    ruta: '/perfil-aspiracional',
    style: {
      left: `${semicircleCenterX + semicircleRadius * Math.cos(0)}%`,
      top: '12%',
    },
    imagen: '/images/centroentrenamiento/perfilaspiracional.png',
    key: 'aspiracional',
  },
];

// Ranking mock (esto luego se puede conectar a backend)
const ranking = [
  { nombre: 'Neo', xp: 1200, coins: 50, avatarUrl: '/images/avatar-neo.png' },
  { nombre: 'Trinity', xp: 1100, coins: 45, avatarUrl: '/images/avatar-trinity.png' },
  { nombre: 'Morpheus', xp: 950, coins: 40, avatarUrl: '/images/avatar-morpheus.png' },
  { nombre: 'Oracle', xp: 900, coins: 38, avatarUrl: '/images/avatar-oracle.png' },
  { nombre: 'Smith', xp: 850, coins: 35, avatarUrl: '/images/avatar-smith.png' },
];

export default function CentroEntrenamientoPage() {
  const navigate = useNavigate();
  const { userName, avatarUrl, userXP, userCoins } = useNeuroState();

  // Hook para detectar si es móvil
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    // Forzar fondo del body a transparente
    const prevBg = document.body.style.background;
    document.body.style.background = 'transparent';
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.style.background = prevBg;
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden pt-44 md:pt-52" style={{background: 'transparent'}}>
      {/* Fondo animado de estrellas cubriendo todo el viewport */}
      <FondoEstrellasParallax />
      {/* Overlays de zonas */}
      {zonas.map((zona, i) => {
        const habitosActivos: any[] = JSON.parse(localStorage.getItem('habitos_activos') || '[]');
        const completadoHoy = habitosActivos.some((h: any) => h.diasCompletados && h.diasCompletados.includes(new Date().toISOString().slice(0,10)));
        const fechaPerfilCognitivo = localStorage.getItem('modulo_perfilcognitivo_completado_fecha');
        const perfilCognitivoCompletado = fechaPerfilCognitivo === new Date().toISOString().slice(0,10);
        return (
          <div
            key={zona.nombre}
            className="absolute flex flex-col items-center group z-10"
            style={{ ...zona.style, position: 'absolute', transform: 'translate(-50%, -50%)', minWidth: '140px', marginTop: '48px' }}
          >
            {/* Nombre zona arriba */}
            <span className="mb-2 px-3 py-1 rounded-xl bg-cyan-900/80 text-cyan-200 font-bold text-sm shadow-lg border border-cyan-400/40 group-hover:bg-cyan-700/90 transition-all animate-glow-sci-fi text-center whitespace-nowrap" style={{background: 'rgba(0, 40, 60, 0.7)', minWidth: '120px', zIndex: 2}}>
              {zona.nombre}
            </span>
            {/* Imagen edificio con efecto sci-fi, flotando */}
            <div className="relative">
              <img
                src={zona.imagen}
                alt={zona.nombre}
                className={`w-32 h-32 object-contain mx-auto rounded-full shadow-xl border-4 border-cyan-400/60 transition-all duration-300
                  ${zona.key === 'boveda' && localStorage.getItem('modulo1_usado') !== 'true' ? 'grayscale' : ''}
                  ${zona.key === 'entrenamiento' && localStorage.getItem('modulo2_usado') !== 'true' ? 'grayscale' : ''}
                  ${zona.key === 'habitos' && !completadoHoy ? 'grayscale' : ''}
                  ${zona.key === 'cognitivo' && !perfilCognitivoCompletado ? 'grayscale' : ''}
                  ${zona.key === 'experto' && localStorage.getItem('modulo_experto_completado_fecha') !== new Date().toISOString().slice(0,10) ? 'grayscale' : ''}
                `}
                style={{ background: 'rgba(0,0,0,0.2)' }}
              />
              {zona.key === 'boveda' && localStorage.getItem('modulo1_usado') === 'true' && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-glow-sci-fi z-10">Completado</div>
              )}
              {zona.key === 'entrenamiento' && localStorage.getItem('modulo2_usado') === 'true' && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-glow-sci-fi z-10">Completado</div>
              )}
              {zona.key === 'habitos' && completadoHoy && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-glow-sci-fi z-10">Completado</div>
              )}
              {zona.key === 'cognitivo' && perfilCognitivoCompletado && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-glow-sci-fi z-10">Completado</div>
              )}
              {zona.key === 'experto' && localStorage.getItem('modulo_experto_completado_fecha') === new Date().toISOString().slice(0,10) && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-glow-sci-fi z-10">Completado</div>
              )}
            </div>
            {/* XP y Neurocoin debajo de la imagen */}
            <div className="flex gap-2 items-center mb-2">
              <span className="bg-purple-900/90 px-2 py-1 rounded-full text-purple-200 text-xs font-bold border border-purple-400/40 shadow animate-glow-sci-fi">XP: 100</span>
              <span className="bg-yellow-900/90 px-2 py-1 rounded-full text-yellow-200 text-xs font-bold border border-yellow-400/40 shadow animate-glow-sci-fi">🪙 5</span>
            </div>
            {/* Botón de acción bien separado */}
            <button
              onClick={() => {
                if (zona.key === 'boveda') {
                  localStorage.setItem('modulo1_usado', 'true');
                }
                navigate(zona.ruta);
              }}
              className={`mt-1 px-5 py-2 rounded-full font-bold text-xs shadow-lg border-2 transition-all duration-300 bg-red-600/90 border-red-400 text-white animate-glow-sci-fi hover:scale-105`}
              style={{ minWidth: '100px', marginBottom: '2px' }}
            >
              ¡Entrar!
            </button>
          </div>
        );
      })}
      {/* Avatar central y UI flotante */}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 animate-fadein-sci-fi">
        <div className="relative">
          <img
            src={avatarUrl || '/images/avatar-default.png'}
            alt="Avatar Usuario"
            className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-cyan-400 shadow-2xl object-cover animate-glow-sci-fi"
            style={{background: 'rgba(0,0,0,0.2)'}}
          />
          {/* UI flotante */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-2 items-center">
            <span className="bg-cyan-800/80 px-3 py-1 rounded-full text-cyan-200 text-xs font-bold border border-cyan-400/40 shadow animate-glow-sci-fi">
              {userName}
            </span>
          </div>
          {/* XP y coin del avatar */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-2 items-center">
            <span className="bg-purple-800/80 px-2 py-1 rounded-full text-purple-200 text-xs font-bold border border-purple-400/40 shadow animate-glow-sci-fi">
              XP: {userXP}
            </span>
            <span className="bg-yellow-800/80 px-2 py-1 rounded-full text-yellow-200 text-xs font-bold border border-yellow-400/40 shadow animate-glow-sci-fi">
              🪙 {userCoins}
            </span>
          </div>
        </div>
        <div className="mt-20 text-cyan-100 text-lg font-orbitron text-center animate-glow-sci-fi">
          ¡Bienvenido a la Arena de Combate Digital!
        </div>
      </div>
      {/* Ranking central */}
      <div className="absolute left-1/2 top-[42%] -translate-x-1/2 w-full max-w-xs z-30 animate-fadein-sci-fi">
        <div className="bg-black/60 rounded-2xl border-2 border-cyan-400/40 shadow-xl px-4 py-4 flex flex-col items-center gap-2 backdrop-blur-md">
          <div className="text-cyan-200 font-bold text-base mb-4 font-orbitron tracking-wide flex items-center gap-2">🏆 Ranking Top 5</div>
          {ranking.map((user, idx) => (
            <div key={user.nombre} className="flex w-full justify-between items-center py-1 px-1 rounded-lg hover:bg-cyan-900/30 transition-all gap-4">
              <span className="font-bold text-cyan-100 flex items-center gap-2">
                <span className="text-cyan-400">#{idx+1}</span>
                <img src={user.avatarUrl} alt={user.nombre} className="w-7 h-7 rounded-full border-2 border-cyan-400 shadow object-cover bg-cyan-900" />
                {user.nombre}
              </span>
              <span className="flex gap-4 items-center">
                <span className="bg-purple-900/80 px-2 py-1 rounded-full text-purple-200 text-xs font-bold border border-purple-400/40 shadow">XP: {user.xp}</span>
                <span className="bg-yellow-900/80 px-2 py-1 rounded-full text-yellow-200 text-xs font-bold border border-yellow-400/40 shadow">🪙 {user.coins}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 