import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, X, Sparkles, ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'pendiente' | 'en_progreso' | 'completado';
  fase: string;
}

interface Fase {
  id: string;
  nombre: string;
  tareas: Tarea[];
}

const FASES_SUGERIDAS = {
  'lanzar_curso': [
    { nombre: 'Planificación', duracion: 7 },
    { nombre: 'Producción', duracion: 14 },
    { nombre: 'Edición', duracion: 7 },
    { nombre: 'Marketing', duracion: 14 },
    { nombre: 'Lanzamiento', duracion: 7 }
  ],
  'desarrollo_app': [
    { nombre: 'Diseño', duracion: 10 },
    { nombre: 'Desarrollo Frontend', duracion: 15 },
    { nombre: 'Desarrollo Backend', duracion: 15 },
    { nombre: 'Testing', duracion: 7 },
    { nombre: 'Despliegue', duracion: 5 }
  ],
  'evento': [
    { nombre: 'Conceptualización', duracion: 5 },
    { nombre: 'Logística', duracion: 10 },
    { nombre: 'Promoción', duracion: 15 },
    { nombre: 'Preparación', duracion: 7 },
    { nombre: 'Ejecución', duracion: 3 }
  ]
};

const ProjectTimeline = () => {
  const [fases, setFases] = useState<Fase[]>([]);
  const [mostrarNuevaTarea, setMostrarNuevaTarea] = useState<string | null>(null);
  const [nuevaTarea, setNuevaTarea] = useState<Partial<Tarea>>({
    titulo: '',
    descripcion: '',
    estado: 'pendiente',
    fase: ''
  });
  const [objetivoGeneral, setObjetivoGeneral] = useState('');
  const [vistaCompacta, setVistaCompacta] = useState(false);

  const agregarFase = (nombre: string) => {
    const nuevaFase: Fase = {
      id: Date.now().toString(),
      nombre,
      tareas: []
    };
    setFases([...fases, nuevaFase]);
  };

  const sugerirFases = () => {
    const objetivo = objetivoGeneral.toLowerCase();
    let fasesSugeridas = [];

    if (objetivo.includes('curso')) {
      fasesSugeridas = FASES_SUGERIDAS.lanzar_curso;
    } else if (objetivo.includes('app') || objetivo.includes('aplicación')) {
      fasesSugeridas = FASES_SUGERIDAS.desarrollo_app;
    } else if (objetivo.includes('evento')) {
      fasesSugeridas = FASES_SUGERIDAS.evento;
    }

    if (fasesSugeridas.length > 0) {
      const hoy = new Date();
      let fechaActual = new Date(hoy);

      const nuevasFases = fasesSugeridas.map((fase, index) => {
        const fechaInicio = new Date(fechaActual);
        fechaActual.setDate(fechaActual.getDate() + fase.duracion);
        const fechaFin = new Date(fechaActual);

        return {
          id: Date.now().toString() + index,
          nombre: fase.nombre,
          tareas: [{
            id: Date.now().toString() + index,
            titulo: `Tarea principal de ${fase.nombre}`,
            descripcion: `Descripción de la fase de ${fase.nombre}`,
            fechaInicio,
            fechaFin,
            estado: 'pendiente',
            fase: fase.nombre
          }]
        };
      });

      setFases(nuevasFases);
    }
  };

  const agregarTarea = (faseId: string) => {
    if (nuevaTarea.titulo) {
      const tarea: Tarea = {
        id: Date.now().toString(),
        titulo: nuevaTarea.titulo,
        descripcion: nuevaTarea.descripcion || '',
        fechaInicio: nuevaTarea.fechaInicio || new Date(),
        fechaFin: nuevaTarea.fechaFin || new Date(),
        estado: nuevaTarea.estado as Tarea['estado'],
        fase: nuevaTarea.fase || ''
      };

      const fasesActualizadas = fases.map(fase => {
        if (fase.id === faseId) {
          return {
            ...fase,
            tareas: [...fase.tareas, tarea]
          };
        }
        return fase;
      });

      setFases(fasesActualizadas);
      setNuevaTarea({ titulo: '', descripcion: '', estado: 'pendiente', fase: '' });
      setMostrarNuevaTarea(null);
    }
  };

  const eliminarTarea = (faseId: string, tareaId: string) => {
    const fasesActualizadas = fases.map(fase => {
      if (fase.id === faseId) {
        return {
          ...fase,
          tareas: fase.tareas.filter(t => t.id !== tareaId)
        };
      }
      return fase;
    });
    setFases(fasesActualizadas);
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const fasesActualizadas = [...fases];
    const [tareaMovida] = fasesActualizadas[source.droppableId].tareas.splice(source.index, 1);
    fasesActualizadas[destination.droppableId].tareas.splice(destination.index, 0, tareaMovida);

    setFases(fasesActualizadas);
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'en_progreso':
        return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'completado':
        return 'text-green-400 border-green-400/30 bg-green-400/10';
      default:
        return 'text-neurolink-coldWhite border-neurolink-coldWhite/30 bg-neurolink-coldWhite/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-8 bg-neurolink-blackGlass"
    >
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-orbitron text-neurolink-coldWhite mb-4 flex items-center justify-center gap-3">
            <Brain className="w-8 h-8" />
            Gestor de Proyectos Inteligente
          </h1>
          <p className="text-neurolink-coldWhite/70">
            Visualiza, organiza y acelera tus objetivos con IA predictiva
          </p>
        </div>

        {/* Input de Objetivo General */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              value={objetivoGeneral}
              onChange={(e) => setObjetivoGeneral(e.target.value)}
              placeholder="Describe tu objetivo general..."
              className="w-full px-4 py-2 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                text-neurolink-coldWhite placeholder-neurolink-coldWhite/50 focus:outline-none focus:border-neurolink-matrixGreen"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sugerirFases}
            className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen 
              hover:bg-neurolink-matrixGreen/30 transition-colors flex items-center gap-2"
          >
            <Sparkles size={20} />
            Sugerir Fases
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVistaCompacta(!vistaCompacta)}
            className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue 
              hover:bg-neurolink-cyberBlue/30 transition-colors flex items-center gap-2"
          >
            {vistaCompacta ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            {vistaCompacta ? 'Vista Expandida' : 'Vista Compacta'}
          </motion.button>
        </div>

        {/* Timeline */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={`grid ${vistaCompacta ? 'grid-cols-1' : 'grid-cols-5'} gap-4`}>
            {fases.map((fase, index) => (
              <motion.div
                key={fase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-orbitron text-neurolink-coldWhite">
                    {fase.nombre}
                  </h3>
                </div>

                <Droppable droppableId={index.toString()}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3"
                    >
                      {fase.tareas.map((tarea, tareaIndex) => (
                        <Draggable
                          key={tarea.id}
                          draggableId={tarea.id}
                          index={tareaIndex}
                        >
                          {(provided) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="p-3 rounded-lg bg-neurolink-background/30 border border-neurolink-matrixGreen/20"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-neurolink-coldWhite text-sm mb-1">
                                    {tarea.titulo}
                                  </p>
                                  <p className="text-neurolink-coldWhite/50 text-xs mb-2">
                                    {tarea.descripcion}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getColorEstado(tarea.estado)}`}>
                                      {tarea.estado.replace('_', ' ')}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-neurolink-coldWhite/50">
                                      <Calendar size={12} />
                                      {tarea.fechaInicio.toLocaleDateString()} - {tarea.fechaFin.toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => eliminarTarea(fase.id, tarea.id)}
                                  className="p-1 rounded-lg text-red-400 hover:bg-red-400/10"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {mostrarNuevaTarea === fase.id ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 rounded-lg bg-neurolink-background/30 border border-neurolink-matrixGreen/20"
                        >
                          <input
                            type="text"
                            value={nuevaTarea.titulo}
                            onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
                            placeholder="Nueva tarea..."
                            className="w-full px-3 py-2 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                              text-neurolink-coldWhite placeholder-neurolink-coldWhite/50 focus:outline-none focus:border-neurolink-matrixGreen text-sm mb-2"
                          />
                          <textarea
                            value={nuevaTarea.descripcion}
                            onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
                            placeholder="Descripción..."
                            className="w-full px-3 py-2 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                              text-neurolink-coldWhite placeholder-neurolink-coldWhite/50 focus:outline-none focus:border-neurolink-matrixGreen text-sm mb-2"
                          />
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="date"
                              value={nuevaTarea.fechaInicio?.toISOString().split('T')[0] || ''}
                              onChange={(e) => setNuevaTarea({ ...nuevaTarea, fechaInicio: new Date(e.target.value) })}
                              className="px-2 py-1 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                                text-neurolink-coldWhite text-sm focus:outline-none focus:border-neurolink-matrixGreen"
                            />
                            <input
                              type="date"
                              value={nuevaTarea.fechaFin?.toISOString().split('T')[0] || ''}
                              onChange={(e) => setNuevaTarea({ ...nuevaTarea, fechaFin: new Date(e.target.value) })}
                              className="px-2 py-1 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                                text-neurolink-coldWhite text-sm focus:outline-none focus:border-neurolink-matrixGreen"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={nuevaTarea.estado}
                              onChange={(e) => setNuevaTarea({ ...nuevaTarea, estado: e.target.value as Tarea['estado'] })}
                              className="px-2 py-1 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                                text-neurolink-coldWhite text-sm focus:outline-none focus:border-neurolink-matrixGreen"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en_progreso">En Progreso</option>
                              <option value="completado">Completado</option>
                            </select>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => agregarTarea(fase.id)}
                              className="px-3 py-1 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen 
                                hover:bg-neurolink-matrixGreen/30 transition-colors text-sm"
                            >
                              Agregar
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setMostrarNuevaTarea(fase.id)}
                          className="w-full p-2 rounded-lg border border-dashed border-neurolink-matrixGreen/30 
                            text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          Agregar Tarea
                        </motion.button>
                      )}
                    </div>
                  )}
                </Droppable>
              </motion.div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </motion.div>
  );
};

export default ProjectTimeline; 