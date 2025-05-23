import React, { useState } from 'react';
import { FaRobot, FaPlay, FaPause } from 'react-icons/fa';

const tips = [
  'Explora tu Segundo Cerebro para registrar ideas y aprendizajes.',
  'Personaliza tu clon IA en el Centro de Entrenamiento.',
  'Activa el modo Focus para máxima concentración.',
  'Consulta el Dashboard para ver tu progreso diario.',
];

const audioUrl = '/audio/bienvenida.mp3'; // Simulado, puedes cambiarlo

const OnboardingLateral: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

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
    <aside className="bg-gradient-to-br from-cyan-900/80 to-gray-900/80 rounded-2xl p-6 shadow-lg border-l-4 border-cyan-400 flex flex-col gap-4 max-w-md w-full animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <FaRobot className="text-cyan-300 text-2xl" />
        <span className="text-cyan-200 font-bold text-lg">Mentor IA</span>
      </div>
      <div className="text-white mb-2">¡Hola! Soy tu mentor IA. Te guiaré en tu experiencia con NeuroLink AI. ¿Listo para comenzar?</div>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-400 text-white font-semibold shadow transition w-max"
        onClick={handlePlay}
      >
        {playing ? <FaPause /> : <FaPlay />}<span>{playing ? 'Pausar audio' : 'Escuchar bienvenida'}</span>
      </button>
      <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
      <div className="mt-4">
        <div className="text-cyan-300 font-semibold mb-1">Primeros pasos:</div>
        <ul className="list-disc list-inside text-cyan-100 space-y-1">
          {tips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default OnboardingLateral; 