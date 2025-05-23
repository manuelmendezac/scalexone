import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, Clock, AlertCircle } from 'lucide-react';

interface Microtarea {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  completada: boolean;
}

const MICROTAREAS_INICIALES: Microtarea[] = [
  {
    id: '1',
    titulo: 'Meditación Matutina',
    descripcion: '5 minutos de respiración consciente para activar tu mente',
    prioridad: 'alta',
    completada: false
  },
  {
    id: '2',
    titulo: 'Lectura Rápida',
    descripcion: 'Lee un artículo sobre un tema que te interese',
    prioridad: 'media',
    completada: false
  },
  {
    id: '3',
    titulo: 'Ejercicio Cognitivo',
    descripcion: 'Resuelve un puzzle o acertijo para mantener tu mente ágil',
    prioridad: 'alta',
    completada: false
  },
  {
    id: '4',
    titulo: 'Reflexión Diaria',
    descripcion: 'Escribe 3 logros del día y 1 área de mejora',
    prioridad: 'baja',
    completada: false
  },
  {
    id: '5',
    titulo: 'Aprendizaje Activo',
    descripcion: 'Practica una nueva habilidad por 15 minutos',
    prioridad: 'media',
    completada: false
  }
];

const TrainingModule = () => {
  const [microtareas, setMicrotareas] = useState<Microtarea[]>([]);
  const [tareasCompletadas, setTareasCompletadas] = useState<Microtarea[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Simular carga de tareas
    setTimeout(() => {
      setMicrotareas(MICROTAREAS_INICIALES);
      setCargando(false);
    }, 2000);
  }, []);

  const getColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'media':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'baja':
        return 'text-green-400 border-green-400/30 bg-green-400/10';
      default:
        return 'text-neurolink-coldWhite border-neurolink-coldWhite/30 bg-neurolink-coldWhite/10';
    }
  };

  const completarTarea = (tarea: Microtarea) => {
    setMicrotareas(microtareas.filter(t => t.id !== tarea.id));
    setTareasCompletadas([...tareasCompletadas, { ...tarea, completada: true }]);
  };

  const tareasOrdenadas = [...microtareas].sort((a, b) => {
    const prioridadOrden = { alta: 0, media: 1, baja: 2 };
    return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-8 bg-neurolink-blackGlass"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-orbitron text-neurolink-coldWhite mb-8 flex items-center gap-3">
          <Brain className="w-8 h-8" />
          Entrenamiento Diario
        </h1>

        {/* Mensaje de Carga */}
        <AnimatePresence>
          {cargando && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 rounded-lg bg-neurolink-matrixGreen/10 border border-neurolink-matrixGreen/30"
            >
              <p className="text-neurolink-coldWhite/80 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Generando microtareas basadas en tu perfil cognitivo...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de Microtareas */}
        <div className="space-y-4">
          <AnimatePresence>
            {tareasOrdenadas.map((tarea) => (
              <motion.div
                key={tarea.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-orbitron text-neurolink-coldWhite">
                        {tarea.titulo}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-sm border ${getColorPrioridad(tarea.prioridad)}`}>
                        {tarea.prioridad}
                      </span>
                    </div>
                    <p className="text-neurolink-coldWhite/70 mb-4">
                      {tarea.descripcion}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => completarTarea(tarea)}
                    className="p-2 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen 
                      hover:bg-neurolink-matrixGreen/30 transition-colors"
                  >
                    <Check size={24} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sección de Tareas Completadas */}
        {tareasCompletadas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4 flex items-center gap-2">
              <Check className="w-6 h-6" />
              Tareas Completadas
            </h2>
            <div className="space-y-4">
              {tareasCompletadas.map((tarea) => (
                <motion.div
                  key={tarea.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-neurolink-matrixGreen/10 border border-neurolink-matrixGreen/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-neurolink-coldWhite/60 line-through">
                      {tarea.titulo}
                    </span>
                    <span className="text-neurolink-matrixGreen text-sm">
                      Completada
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mensaje cuando no hay tareas */}
        {!cargando && microtareas.length === 0 && tareasCompletadas.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8"
          >
            <AlertCircle className="w-12 h-12 text-neurolink-coldWhite/40 mx-auto mb-4" />
            <p className="text-neurolink-coldWhite/60">
              No hay tareas disponibles en este momento.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TrainingModule; 