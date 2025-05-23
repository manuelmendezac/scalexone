import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, Star, Clock, Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { useStore } from '../store/store';

const LOGROS_EJEMPLO = [
  {
    id: '1',
    titulo: 'Primer Paso',
    descripcion: 'Completa tu primera sesión de entrenamiento',
    icono: '🎯',
    nivel: 1,
    desbloqueado: false
  },
  {
    id: '2',
    titulo: 'Razonador Experto',
    descripcion: 'Obtén 100% en un ejercicio de razonamiento',
    icono: '🧠',
    nivel: 2,
    desbloqueado: false
  }
];

const BLOQUES_EJEMPLO = [
  {
    id: '1',
    tipo: 'resumen' as const,
    contenido: 'La neuroplasticidad es la capacidad del cerebro para formar y reorganizar conexiones sinápticas.',
    completado: false
  },
  {
    id: '2',
    tipo: 'razonamiento' as const,
    contenido: '¿Cuál es el factor más importante en el aprendizaje adaptativo?',
    opciones: [
      {
        id: 'a',
        texto: 'La velocidad de respuesta',
        esCorrecta: false,
        explicacion: 'La velocidad es importante, pero no es el factor principal.'
      },
      {
        id: 'b',
        texto: 'La retroalimentación continua',
        esCorrecta: true,
        explicacion: 'La retroalimentación permite ajustar y mejorar el proceso de aprendizaje.'
      },
      {
        id: 'c',
        texto: 'La cantidad de práctica',
        esCorrecta: false,
        explicacion: 'La práctica es necesaria, pero debe ser de calidad.'
      }
    ],
    completado: false
  }
];

export const NeuroTrainerPro: React.FC = () => {
  const [sesionActual, setSesionActual] = useState<string | null>(null);
  const [bloqueActual, setBloqueActual] = useState(0);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [tiempoInicio, setTiempoInicio] = useState<Date | null>(null);
  const synth = useRef<SpeechSynthesis | null>(null);

  const {
    progresoEntrenamiento,
    sesionesEntrenamientoPro,
    agregarSesionEntrenamientoPro,
    actualizarSesionEntrenamientoPro,
    ganarExperiencia,
    desbloquearLogro
  } = useStore();

  useEffect(() => {
    synth.current = window.speechSynthesis;
  }, []);

  const iniciarSesion = () => {
    const nuevaSesion = {
      id: Date.now().toString(),
      titulo: `Sesión de Entrenamiento Nivel ${progresoEntrenamiento.nivel}`,
      nivel: progresoEntrenamiento.nivel,
      estado: 'en_progreso' as const,
      progreso: 0,
      bloques: BLOQUES_EJEMPLO,
      fechaInicio: new Date(),
      puntuacionTotal: 0
    };

    agregarSesionEntrenamientoPro(nuevaSesion);
    setSesionActual(nuevaSesion.id);
    setTiempoInicio(new Date());
  };

  const completarBloque = (puntuacion: number) => {
    if (!sesionActual) return;

    const sesion = sesionesEntrenamientoPro.find(s => s.id === sesionActual);
    if (!sesion) return;

    const nuevosBloques = [...sesion.bloques];
    nuevosBloques[bloqueActual] = {
      ...nuevosBloques[bloqueActual],
      completado: true,
      puntuacion
    };

    const progreso = (nuevosBloques.filter(b => b.completado).length / nuevosBloques.length) * 100;
    const puntuacionTotal = nuevosBloques.reduce((acc, b) => acc + (b.puntuacion || 0), 0);

    actualizarSesionEntrenamientoPro(sesionActual, {
      bloques: nuevosBloques,
      progreso,
      puntuacionTotal
    });

    ganarExperiencia(puntuacion * 10);
    setMostrarFeedback(true);

    // Feedback por voz
    if (synth.current) {
      const feedback = `Excelente trabajo. Has ganado ${puntuacion} puntos. Tu progreso actual es del ${Math.round(progreso)}%.`;
      const utterance = new SpeechSynthesisUtterance(feedback);
      utterance.lang = 'es-ES';
      synth.current.speak(utterance);
    }

    setTimeout(() => {
      setMostrarFeedback(false);
      if (bloqueActual < nuevosBloques.length - 1) {
        setBloqueActual(prev => prev + 1);
      } else {
        completarSesion();
      }
    }, 3000);
  };

  const completarSesion = () => {
    if (!sesionActual || !tiempoInicio) return;

    const tiempoCompletado = new Date().getTime() - tiempoInicio.getTime();
    actualizarSesionEntrenamientoPro(sesionActual, {
      estado: 'completada',
      fechaCompletado: new Date(),
      tiempoCompletado
    });

    desbloquearLogro('1'); // Desbloquear logro de primera sesión
    setSesionActual(null);
    setBloqueActual(0);
    setTiempoInicio(null);
  };

  const renderBloque = () => {
    if (!sesionActual) return null;

    const sesion = sesionesEntrenamientoPro.find(s => s.id === sesionActual);
    if (!sesion) return null;

    const bloque = sesion.bloques[bloqueActual];
    if (!bloque) return null;

    switch (bloque.tipo) {
      case 'resumen':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-neurolink-dark/50 rounded-lg border border-neurolink-matrixGreen"
          >
            <h3 className="font-orbitron text-neurolink-matrixGreen mb-4">Resumen</h3>
            <p className="text-neurolink-coldWhite/70">{bloque.contenido}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => completarBloque(100)}
              className="mt-4 px-4 py-2 bg-neurolink-matrixGreen text-neurolink-dark 
                rounded-lg font-orbitron hover:bg-neurolink-matrixGreen/80"
            >
              Continuar
            </motion.button>
          </motion.div>
        );

      case 'razonamiento':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-neurolink-dark/50 rounded-lg border border-neurolink-matrixGreen"
          >
            <h3 className="font-orbitron text-neurolink-matrixGreen mb-4">Razonamiento</h3>
            <p className="text-neurolink-coldWhite/70 mb-6">{bloque.contenido}</p>
            <div className="space-y-3">
              {bloque.opciones?.map(opcion => (
                <motion.button
                  key={opcion.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRespuestaSeleccionada(opcion.id);
                    completarBloque(opcion.esCorrecta ? 100 : 50);
                  }}
                  className={`w-full p-3 text-left rounded-lg transition-colors
                    ${respuestaSeleccionada === opcion.id
                      ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                      : 'bg-neurolink-dark/30 text-neurolink-coldWhite/70 hover:bg-neurolink-dark/50'
                    }`}
                >
                  {opcion.texto}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full relative bg-neurolink-dark/50 backdrop-blur-sm rounded-lg 
      border border-neurolink-neonBlue overflow-hidden p-6">
      
      {/* Barra de progreso superior */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-neurolink-matrixGreen" />
            <span className="font-orbitron text-neurolink-matrixGreen">
              Nivel {progresoEntrenamiento.nivel}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-neurolink-matrixGreen" />
            <span className="font-orbitron text-neurolink-matrixGreen">
              {progresoEntrenamiento.experiencia} / {progresoEntrenamiento.experienciaNecesaria} XP
            </span>
          </div>
        </div>
        <div className="h-2 bg-neurolink-dark/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(progresoEntrenamiento.experiencia / progresoEntrenamiento.experienciaNecesaria) * 100}%`
            }}
            className="h-full bg-neurolink-matrixGreen"
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative h-[calc(100%-4rem)]">
        {!sesionActual ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex flex-col items-center justify-center"
          >
            <h2 className="font-orbitron text-2xl text-neurolink-matrixGreen mb-6">
              Entrenamiento Neurocognitivo
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={iniciarSesion}
              className="px-6 py-3 bg-neurolink-matrixGreen text-neurolink-dark 
                rounded-lg font-orbitron hover:bg-neurolink-matrixGreen/80"
            >
              Iniciar Sesión
            </motion.button>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Controles de navegación */}
            <div className="flex justify-between items-center mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBloqueActual(prev => Math.max(0, prev - 1))}
                disabled={bloqueActual === 0}
                className="p-2 bg-neurolink-dark/50 text-neurolink-neonBlue rounded-lg 
                  hover:bg-neurolink-neonBlue/10 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <span className="font-orbitron text-neurolink-matrixGreen">
                Bloque {bloqueActual + 1} de {sesionesEntrenamientoPro.find(s => s.id === sesionActual)?.bloques.length}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBloqueActual(prev => prev + 1)}
                disabled={bloqueActual === (sesionesEntrenamientoPro.find(s => s.id === sesionActual)?.bloques.length || 0) - 1}
                className="p-2 bg-neurolink-dark/50 text-neurolink-neonBlue rounded-lg 
                  hover:bg-neurolink-neonBlue/10 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Bloque actual */}
            <div className="flex-1 overflow-y-auto">
              {renderBloque()}
            </div>
          </div>
        )}

        {/* Feedback overlay */}
        <AnimatePresence>
          {mostrarFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 flex items-center justify-center bg-neurolink-dark/90"
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <Zap className="w-16 h-16 text-neurolink-matrixGreen mx-auto mb-4" />
                </motion.div>
                <h3 className="font-orbitron text-2xl text-neurolink-matrixGreen mb-2">
                  ¡Excelente!
                </h3>
                <p className="text-neurolink-coldWhite/70">
                  Has completado este bloque con éxito
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 