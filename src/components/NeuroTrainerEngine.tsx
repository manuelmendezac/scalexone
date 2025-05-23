import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Play, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useStore } from '../store/store';

const FRASES_CARGA = [
  "Analizando tu perfil cognitivo...",
  "Preparando ejercicios personalizados...",
  "Sincronizando con tu base de conocimiento...",
  "Optimizando la experiencia de aprendizaje...",
  "Calibrando el nivel de dificultad..."
];

const BLOQUES_EJEMPLO = {
  reflexion: [
    "¿Cómo aplicarías los conceptos de neurociencia en tu vida diaria?",
    "¿Qué patrones de pensamiento identificas en tus decisiones?",
    "¿Cómo podrías mejorar tu proceso de aprendizaje?"
  ],
  simulacion: [
    "Simula una situación donde debas aplicar los conceptos aprendidos",
    "Crea un plan de acción basado en los principios estudiados",
    "Resuelve un problema utilizando las técnicas aprendidas"
  ],
  analisis: [
    "Analiza tu desempeño en la sesión",
    "Identifica áreas de mejora",
    "Establece objetivos para la próxima sesión"
  ]
};

export const NeuroTrainerEngine: React.FC = () => {
  const [sesionActiva, setSesionActiva] = useState<string | null>(null);
  const [fraseActual, setFraseActual] = useState('');
  const [cargando, setCargando] = useState(false);
  const [bloqueActual, setBloqueActual] = useState(0);

  const {
    knowledgeBase,
    sesionesEntrenamiento,
    agregarSesionEntrenamiento,
    actualizarSesionEntrenamiento
  } = useStore();

  // Generar sesiones basadas en la base de conocimiento
  useEffect(() => {
    if (knowledgeBase.length > 0 && sesionesEntrenamiento.length === 0) {
      knowledgeBase.forEach(doc => {
        if (doc.estado === 'completado') {
          const nuevaSesion = {
            id: Math.random().toString(36).substr(2, 9),
            titulo: `Entrenamiento: ${doc.temas[0]}`,
            nivel: 'Inicial' as const,
            estado: 'pendiente' as const,
            progreso: 0,
            bloques: [
              {
                id: '1',
                tipo: 'reflexion' as const,
                contenido: BLOQUES_EJEMPLO.reflexion[0],
                completado: false
              },
              {
                id: '2',
                tipo: 'simulacion' as const,
                contenido: BLOQUES_EJEMPLO.simulacion[0],
                completado: false
              },
              {
                id: '3',
                tipo: 'analisis' as const,
                contenido: BLOQUES_EJEMPLO.analisis[0],
                completado: false
              }
            ]
          };
          agregarSesionEntrenamiento(nuevaSesion);
        }
      });
    }
  }, [knowledgeBase, sesionesEntrenamiento.length]);

  const iniciarSesion = async (sesionId: string) => {
    setCargando(true);
    setSesionActiva(sesionId);
    setBloqueActual(0);

    // Simulación de carga
    for (const frase of FRASES_CARGA) {
      setFraseActual(frase);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    actualizarSesionEntrenamiento(sesionId, {
      estado: 'en_progreso',
      fechaInicio: new Date()
    });

    setCargando(false);
  };

  const completarBloque = (sesionId: string, bloqueId: string) => {
    const sesion = sesionesEntrenamiento.find(s => s.id === sesionId);
    if (!sesion) return;

    const bloquesActualizados = sesion.bloques.map(bloque =>
      bloque.id === bloqueId ? { ...bloque, completado: true } : bloque
    );

    const progreso = (bloquesActualizados.filter(b => b.completado).length / bloquesActualizados.length) * 100;

    actualizarSesionEntrenamiento(sesionId, {
      bloques: bloquesActualizados,
      progreso
    });

    if (progreso === 100) {
      actualizarSesionEntrenamiento(sesionId, {
        estado: 'completada',
        fechaCompletado: new Date()
      });
    } else {
      setBloqueActual(prev => prev + 1);
    }
  };

  return (
    <div className="w-full h-full p-4 bg-neurolink-dark/50 backdrop-blur-sm rounded-lg border border-neurolink-neonBlue">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-orbitron text-neurolink-neonBlue">NeuroTrainer</h2>
        <Brain className="w-6 h-6 text-neurolink-matrixGreen" />
      </div>

      {cargando ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 text-center"
        >
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-12 h-12 text-neurolink-matrixGreen" />
            </motion.div>
          </div>
          <p className="font-orbitron text-neurolink-matrixGreen">{fraseActual}</p>
        </motion.div>
      ) : sesionActiva ? (
        <div className="space-y-6">
          {sesionesEntrenamiento
            .find(s => s.id === sesionActiva)
            ?.bloques.map((bloque, index) => (
              <motion.div
                key={bloque.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`p-4 rounded-lg border ${
                  index === bloqueActual
                    ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                    : 'border-neurolink-neonBlue/30'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-orbitron text-neurolink-neonBlue">
                    Bloque {index + 1}: {bloque.tipo.charAt(0).toUpperCase() + bloque.tipo.slice(1)}
                  </h3>
                  {bloque.completado && (
                    <CheckCircle className="w-5 h-5 text-neurolink-matrixGreen" />
                  )}
                </div>
                <p className="text-neurolink-coldWhite mb-4">{bloque.contenido}</p>
                {index === bloqueActual && !bloque.completado && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => completarBloque(sesionActiva, bloque.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-neurolink-matrixGreen/20 
                      text-neurolink-matrixGreen rounded-lg hover:bg-neurolink-matrixGreen/30 
                      transition-colors"
                  >
                    <span>Completar Bloque</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sesionesEntrenamiento.map(sesion => (
            <motion.div
              key={sesion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-neurolink-dark/50 border border-neurolink-neonBlue rounded-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-orbitron text-neurolink-neonBlue">{sesion.titulo}</h3>
                  <p className="text-sm text-neurolink-neonBlue/70">Nivel: {sesion.nivel}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => iniciarSesion(sesion.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-neurolink-matrixGreen/20 
                    text-neurolink-matrixGreen rounded-lg hover:bg-neurolink-matrixGreen/30 
                    transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Iniciar Entrenamiento</span>
                </motion.button>
              </div>
              {sesion.estado !== 'pendiente' && (
                <div className="mt-2">
                  <div className="h-2 bg-neurolink-neonBlue/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sesion.progreso}%` }}
                      className="h-full bg-neurolink-matrixGreen"
                    />
                  </div>
                  <p className="text-sm text-neurolink-neonBlue/70 mt-1">
                    Progreso: {sesion.progreso}%
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}; 