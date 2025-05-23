import React, { useState } from 'react';
import { FaBrain, FaPlay, FaPause, FaUserAstronaut } from 'react-icons/fa';
import useNeuroState from '../store/useNeuroState';

const tips = [
  'Explora tu Segundo Cerebro para registrar ideas y aprendizajes.',
  'Personaliza tu clon IA en el Centro de Entrenamiento.',
  'Activa el modo Focus para máxima concentración.',
  'Consulta el Dashboard para ver tu progreso diario.',
];

const audioUrl = '/audio/bienvenida.mp3'; // Simulado, puedes cambiarlo

const MentorMessage: React.FC = () => {
  const { userName, avatarUrl } = useNeuroState();
  const [playing, setPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const today = new Date();
  const dateStr = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(today);

  const handlePlay = () => {
    if (!playing) {
      audioRef.current?.play();
      setPlaying(true);
    } else {
      audioRef.current?.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-gradient-to-br from-cyan-900/80 to-gray-900/80 rounded-2xl p-6 shadow-lg border-l-4 border-cyan-400 mb-8 animate-fade-in">
      {/* Avatar y bienvenida */}
      <div className="flex flex-col items-center text-center md:text-left md:items-start flex-shrink-0 w-full md:w-auto">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/30 animate-pulse z-0" style={{ filter: 'blur(32px)' }} />
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-cyan-400 shadow-cyan-400/40 shadow-lg object-cover z-10 relative animate-avatar-float"
            />
          ) : (
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-cyan-700 to-purple-700 flex items-center justify-center border-4 border-cyan-400 shadow-cyan-400/40 shadow-lg z-10 relative animate-avatar-float">
              <FaUserAstronaut className="text-white text-5xl md:text-6xl" />
            </div>
          )}
        </div>
        <h2 className="text-2xl md:text-3xl font-orbitron text-cyan-300 mb-1">Bienvenido, <span className="text-white">{userName} AI</span></h2>
        <div className="text-cyan-200 text-lg font-light italic mb-1">"Hoy es un gran día para crear lo imposible 🚀"</div>
        <div className="text-cyan-400 text-base font-medium mb-2">{dateStr}</div>
      </div>
      {/* Mentor IA y onboarding */}
      <div className="flex-1 flex flex-col gap-3 w-full">
        <div className="flex items-center gap-2 mb-1">
          <FaBrain className="text-cyan-300 text-xl" />
          <span className="text-cyan-200 font-bold text-lg">Mentor IA</span>
        </div>
        <div className="text-white mb-2">¡Hola! Soy tu mentor IA. Te guiaré en tu experiencia con NeuroLink AI. ¿Listo para comenzar?</div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-400 text-white font-semibold shadow transition w-full md:w-max"
          onClick={handlePlay}
        >
          {playing ? <FaPause /> : <FaPlay />}<span>{playing ? 'Pausar audio' : 'Escuchar bienvenida'}</span>
        </button>
        <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
        <div className="mt-3">
          <div className="text-cyan-300 font-semibold mb-1">Primeros pasos sugeridos:</div>
          <ul className="list-disc list-inside text-cyan-100 space-y-1">
            {tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MentorMessage; 