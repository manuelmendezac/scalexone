import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Brain, 
  CheckCircle2, 
  Circle, 
  Tag, 
  Flag,
  Clock
} from 'lucide-react';
import { useModeEffects } from '../hooks/useModeEffects';

interface Tarea {
  id: string;
  titulo: string;
  completada: boolean;
  prioridad: 'alta' | 'media' | 'baja';
  categoria: string;
  fechaLimite?: Date;
}

const TaskBrain = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevaPrioridad, setNuevaPrioridad] = useState<'alta' | 'media' | 'baja'>('media');
  const { showProductivityTips } = useModeEffects();

  const agregarTarea = () => {
    if (!nuevaTarea.trim()) return;

    const tarea: Tarea = {
      id: Date.now().toString(),
      titulo: nuevaTarea,
      completada: false,
      prioridad: nuevaPrioridad,
      categoria: nuevaCategoria || 'General',
      fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días por defecto
    };

    setTareas(prev => [...prev, tarea]);
    setNuevaTarea('');
    setNuevaCategoria('');
  };

  const toggleTarea = (id: string) => {
    setTareas(prev =>
      prev.map(tarea =>
        tarea.id === id
          ? { ...tarea, completada: !tarea.completada }
          : tarea
      )
    );
  };

  const sugerirTareas = () => {
    const sugerencias: Tarea[] = [
      {
        id: Date.now().toString(),
        titulo: 'Priorizar objetivos del día',
        completada: false,
        prioridad: 'alta',
        categoria: 'Productividad',
        fechaLimite: new Date()
      },
      {
        id: (Date.now() + 1).toString(),
        titulo: 'Tomar descansos programados',
        completada: false,
        prioridad: 'media',
        categoria: 'Bienestar',
        fechaLimite: new Date()
      },
      {
        id: (Date.now() + 2).toString(),
        titulo: 'Registrar progreso diario',
        completada: false,
        prioridad: 'baja',
        categoria: 'Seguimiento',
        fechaLimite: new Date()
      }
    ];

    setTareas(prev => [...prev, ...sugerencias]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto bg-neurolink-background/50 backdrop-blur-lg rounded-lg border border-neurolink-matrixGreen/30 p-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-orbitron text-coldWhite flex items-center">
          <Brain className="w-6 h-6 mr-2 text-neurolink-matrixGreen" />
          TaskBrain
        </h2>
        {showProductivityTips && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sugerirTareas}
            className="px-4 py-2 bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen rounded-lg hover:bg-opacity-30 transition-all"
          >
            Sugerir Tareas
          </motion.button>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevaTarea}
            onChange={(e) => setNuevaTarea(e.target.value)}
            placeholder="Nueva tarea..."
            className="flex-1 bg-neurolink-background/30 text-coldWhite border border-neurolink-matrixGreen/30 rounded-lg px-4 py-2 focus:outline-none focus:border-neurolink-matrixGreen"
          />
          <input
            type="text"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            placeholder="Categoría..."
            className="w-32 bg-neurolink-background/30 text-coldWhite border border-neurolink-matrixGreen/30 rounded-lg px-4 py-2 focus:outline-none focus:border-neurolink-matrixGreen"
          />
          <select
            value={nuevaPrioridad}
            onChange={(e) => setNuevaPrioridad(e.target.value as 'alta' | 'media' | 'baja')}
            className="bg-neurolink-background/30 text-coldWhite border border-neurolink-matrixGreen/30 rounded-lg px-4 py-2 focus:outline-none focus:border-neurolink-matrixGreen"
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={agregarTarea}
            className="p-2 bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen rounded-lg hover:bg-opacity-30 transition-all"
          >
            <Plus size={20} />
          </motion.button>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {tareas.map((tarea) => (
            <motion.div
              key={tarea.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-lg border ${
                tarea.completada
                  ? 'bg-neurolink-background/30 border-neurolink-matrixGreen/20'
                  : 'bg-neurolink-background/50 border-neurolink-matrixGreen/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleTarea(tarea.id)}
                    className={`p-1 rounded-full ${
                      tarea.completada
                        ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                        : 'bg-neurolink-background/30 text-coldWhite'
                    }`}
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <span className={`text-coldWhite ${tarea.completada ? 'line-through opacity-50' : ''}`}>
                    {tarea.titulo}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${
                    tarea.prioridad === 'alta'
                      ? 'text-red-400'
                      : tarea.prioridad === 'media'
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}>
                    {tarea.prioridad}
                  </span>
                  <span className="text-sm text-coldWhite/60">{tarea.categoria}</span>
                  {tarea.fechaLimite && (
                    <div className="flex items-center text-sm text-coldWhite/60">
                      <Clock size={16} className="mr-1" />
                      {tarea.fechaLimite.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskBrain; 