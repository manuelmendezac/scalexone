import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

const FRASES_MOTIVACIONALES = [
  "Cada minuto cuenta en tu camino al éxito.",
  "La concentración es tu superpoder.",
  "Estás más cerca de tu objetivo.",
  "La excelencia es un hábito, no un acto.",
  "Tu futuro se construye en este momento.",
  "La disciplina supera al talento.",
  "Cada sesión te hace más fuerte.",
  "El progreso es inevitable.",
];

const TIEMPO_POMODORO = 25 * 60; // 25 minutos en segundos

const FocusMode = () => {
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_POMODORO);
  const [isActive, setIsActive] = useState(false);
  const [fraseActual, setFraseActual] = useState('');
  const [progreso, setProgreso] = useState(0);

  const formatearTiempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const obtenerFraseAleatoria = useCallback(() => {
    const frase = FRASES_MOTIVACIONALES[Math.floor(Math.random() * FRASES_MOTIVACIONALES.length)];
    setFraseActual(frase);
  }, []);

  useEffect(() => {
    let intervalo: number | undefined;

    if (isActive && tiempoRestante > 0) {
      intervalo = window.setInterval(() => {
        setTiempoRestante((prev) => {
          const nuevoTiempo = prev - 1;
          setProgreso(((TIEMPO_POMODORO - nuevoTiempo) / TIEMPO_POMODORO) * 100);
          return nuevoTiempo;
        });
      }, 1000);
    } else if (tiempoRestante === 0) {
      setIsActive(false);
      // Aquí podrías agregar una notificación o sonido
    }

    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [isActive, tiempoRestante]);

  useEffect(() => {
    if (isActive) {
      obtenerFraseAleatoria();
      const intervaloFrase = setInterval(obtenerFraseAleatoria, 5 * 60 * 1000);
      return () => clearInterval(intervaloFrase);
    }
  }, [isActive, obtenerFraseAleatoria]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTiempoRestante(TIEMPO_POMODORO);
    setProgreso(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen p-8 transition-colors duration-500 ${
        isActive ? 'bg-neurolink-background/95' : 'bg-neurolink-background'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-orbitron text-neurolink-coldWhite mb-8 text-center">
          Modo Enfoque
        </h1>

        {/* Temporizador */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Círculo de fondo */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(0, 255, 255, 0.1)"
              strokeWidth="5"
            />
            {/* Círculo de progreso */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(0, 255, 255, 0.5)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progreso) / 100}
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * progreso) / 100 }}
              transition={{ duration: 1, ease: "linear" }}
              className="filter blur-[1px]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-orbitron text-neurolink-coldWhite">
              {formatearTiempo(tiempoRestante)}
            </span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex justify-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={`p-4 rounded-full ${
              isActive
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30'
            } transition-colors`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="p-4 rounded-full bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 transition-colors"
          >
            <RotateCcw size={24} />
          </motion.button>
        </div>

        {/* Frase motivacional */}
        <AnimatePresence mode="wait">
          {isActive && fraseActual && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <p className="text-xl font-orbitron text-neurolink-coldWhite/80 mb-2">
                {fraseActual}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instrucciones */}
        {!isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-neurolink-coldWhite/60 mt-8"
          >
            <p className="mb-2">Presiona el botón de inicio para comenzar tu sesión de enfoque.</p>
            <p className="text-sm">Duración: 25 minutos</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FocusMode; 