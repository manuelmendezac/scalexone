import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

const HABILIDADES = [
  'Comunicación',
  'Creatividad',
  'Resolución de problemas',
  'Liderazgo',
  'Pensamiento crítico',
  'Trabajo en equipo',
  'Adaptabilidad',
  'Organización',
  'Empatía',
  'Aprendizaje rápido',
  'Gestión del tiempo',
  'Negociación',
  'Análisis de datos',
  'Innovación',
  'Mentoría',
  'Pensamiento estratégico',
  'Gestión de proyectos',
  'Inteligencia emocional',
  'Toma de decisiones',
  'Comunicación asertiva',
];

const FRASES_MOTIVACION = [
  '¡Tu kit de habilidades te convierte en un verdadero explorador galáctico!',
  'Sigue entrenando tus habilidades para alcanzar el máximo nivel.',
  'Cada habilidad es una estrella en tu universo personal.',
  '¡Eres un talento multidimensional, sigue brillando!',
  'Tu constelación de habilidades es única y poderosa.',
  'Cada nivel que alcanzas te acerca más a tu propósito.',
  '¡Eres un maestro de múltiples dimensiones!',
  'Tu potencial es infinito, como el universo mismo.',
  'Cada habilidad que dominas es un nuevo poder en tu arsenal.',
  '¡Tu brillo interior se refleja en cada habilidad que desarrollas!',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

const starVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  hover: { 
    scale: 1.2,
    rotate: 360,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

interface HabilidadNivel {
  nombre: string;
  nivel: number;
}

export default function HabilidadesGame() {
  const [seleccionadas, setSeleccionadas] = useState<HabilidadNivel[]>([]);
  const [fase, setFase] = useState<'seleccion' | 'nivelacion' | 'resultado'>('seleccion');
  const [xp, setXp] = useState(0);
  const [monedas, setMonedas] = useState(0);
  const [actual, setActual] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Inicializar AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generar sonidos sintetizados
  const playSound = (type: 'select' | 'level' | 'complete') => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (type) {
      case 'select':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
        break;

      case 'level':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
        break;

      case 'complete':
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
        break;
    }
  };

  // Selección de habilidades
  const handleSeleccion = (nombre: string) => {
    if (seleccionadas.find(h => h.nombre === nombre) || seleccionadas.length >= 5) return;
    setSeleccionadas([...seleccionadas, { nombre, nivel: 1 }]);
    setXp(xp + 10);
    setMonedas(monedas + 5);
    playSound('select');
  };
  const handleDeseleccion = (nombre: string) => {
    setSeleccionadas(seleccionadas.filter(h => h.nombre !== nombre));
  };

  // Nivelación
  const handleNivel = (nivel: number) => {
    const nuevas = [...seleccionadas];
    nuevas[actual].nivel = nivel;
    setSeleccionadas(nuevas);
    setXp(xp + nivel * 5);
    setMonedas(monedas + nivel * 2);
    playSound('level');
    
    if (actual < seleccionadas.length - 1) {
      setTimeout(() => setActual(actual + 1), 350);
    } else {
      setTimeout(() => {
        setFase('resultado');
        playSound('complete');
      }, 400);
    }
  };

  // Reiniciar
  const reiniciar = () => {
    setSeleccionadas([]);
    setFase('seleccion');
    setActual(0);
    setXp(0);
    setMonedas(0);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 text-white p-8">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex justify-between items-center mb-8 w-full max-w-2xl">
          <div className="flex gap-4">
            <div className="bg-green-500/20 px-4 py-2 rounded-lg">XP: {xp}</div>
            <div className="bg-yellow-500/20 px-4 py-2 rounded-lg">Monedas: {monedas}</div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors"
          >
            Volver al mapa
          </button>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8 font-orbitron">
          Habilidades: Selecciona y sube de nivel tus fortalezas
        </h1>

        {fase === 'seleccion' && (
          <motion.div 
            className="flex flex-col items-center gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="text-lg text-green-200 mb-2 font-orbitron"
              variants={itemVariants}
            >
              Selecciona hasta 5 habilidades que consideres tus fortalezas:
            </motion.div>
            <motion.div 
              className="flex flex-wrap gap-4 justify-center"
              variants={containerVariants}
            >
              {HABILIDADES.map(hab => (
                <motion.button
                  key={hab}
                  variants={itemVariants}
                  whileHover={{ scale: 1.08, boxShadow: "0 0 15px rgba(34, 197, 94, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSeleccion(hab)}
                  disabled={!!seleccionadas.find(h => h.nombre === hab) || seleccionadas.length >= 5}
                  className={`px-6 py-3 rounded-xl font-bold text-lg border-2 transition-all
                    ${seleccionadas.find(h => h.nombre === hab) 
                      ? 'bg-green-500/40 border-green-300/40 text-white' 
                      : 'bg-green-500/20 border-green-300/10 text-green-100 hover:bg-green-500/30'}`}
                >
                  {hab}
                  {seleccionadas.find(h => h.nombre === hab) && (
                    <motion.span 
                      className="ml-2 text-green-200"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </motion.div>

            <motion.div 
              className="flex flex-wrap gap-3 mt-6 justify-center"
              variants={containerVariants}
            >
              {seleccionadas.map(hab => (
                <motion.span 
                  key={hab.nombre}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)" }}
                  className="bg-green-500/40 px-4 py-2 rounded-full font-bold text-base border-2 border-green-300/40 animate-glow-sci-fi cursor-pointer"
                  onClick={() => handleDeseleccion(hab.nombre)}
                  title="Quitar habilidad"
                >
                  {hab.nombre} ✕
                </motion.span>
              ))}
            </motion.div>

            {seleccionadas.length > 0 && (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFase('nivelacion')}
                className="mt-6 px-8 py-3 bg-green-600 hover:bg-green-400 text-white rounded-full font-bold shadow text-lg"
              >
                Siguiente: Nivelar habilidades
              </motion.button>
            )}
          </motion.div>
        )}

        {fase === 'nivelacion' && (
          <AnimatePresence mode="wait">
            <motion.div
              key={actual}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-8"
            >
              <motion.div 
                className="text-lg text-green-200 mb-2 font-orbitron"
                variants={itemVariants}
              >
                ¿Qué nivel tienes en <span className="font-bold text-green-100">{seleccionadas[actual].nombre}</span>?
              </motion.div>
              <div className="flex gap-6">
                {[1, 2, 3].map(nivel => (
                  <motion.button
                    key={nivel}
                    variants={itemVariants}
                    whileHover={{ scale: 1.15, boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNivel(nivel)}
                    className={`flex flex-col items-center px-6 py-4 rounded-2xl font-bold text-xl shadow-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-green-300 bg-green-500/30 hover:bg-green-500/50 transition-all ${seleccionadas[actual].nivel === nivel ? 'ring-4 ring-green-300' : ''}`}
                  >
                    <div className="flex gap-1 mb-2">
                      {[...Array(nivel)].map((_, i) => (
                        <motion.div
                          key={i}
                          variants={starVariants}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                          transition={{ delay: i * 0.1 }}
                        >
                          <StarIcon className="w-7 h-7 text-yellow-300 drop-shadow" />
                        </motion.div>
                      ))}
                    </div>
                    Nivel {nivel}
                  </motion.button>
                ))}
              </div>
              <motion.div 
                className="text-sm text-green-100 mt-4"
                variants={itemVariants}
              >
                {actual + 1} de {seleccionadas.length}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {fase === 'resultado' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 p-6 rounded-xl text-center"
          >
            <motion.h3 
              className="text-xl font-semibold mb-2 font-orbitron"
              variants={itemVariants}
            >
              ¡Este es tu Kit de Habilidades!
            </motion.h3>
            <motion.div 
              className="flex flex-wrap gap-4 justify-center mb-4 mt-2"
              variants={containerVariants}
            >
              {seleccionadas.map((h, i) => (
                <motion.span 
                  key={h.nombre}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)" }}
                  className="bg-green-500/40 px-6 py-2 rounded-full font-bold text-lg border-2 border-green-300/40 animate-glow-sci-fi flex items-center gap-2"
                >
                  {h.nombre}
                  <span className="flex gap-1 ml-2">
                    {[...Array(h.nivel)].map((_, j) => (
                      <motion.div
                        key={j}
                        variants={starVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        transition={{ delay: j * 0.1 }}
                      >
                        <StarIcon className="w-5 h-5 text-yellow-300 drop-shadow" />
                      </motion.div>
                    ))}
                  </span>
                </motion.span>
              ))}
            </motion.div>
            <motion.div 
              className="text-green-100 text-lg mb-2 font-orbitron"
              variants={itemVariants}
            >
              {FRASES_MOTIVACION[Math.floor(Math.random() * FRASES_MOTIVACION.length)]}
            </motion.div>
            <div className="flex justify-center gap-4">
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={reiniciar}
                className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-400 text-white rounded-full font-bold shadow"
              >
                Volver a jugar
              </motion.button>
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-400 text-white rounded-full font-bold shadow"
              >
                Volver al mapa
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 