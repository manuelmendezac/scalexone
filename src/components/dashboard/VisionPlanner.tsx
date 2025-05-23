import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, X, Download, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface Tarea {
  id: string;
  titulo: string;
  prioridad: 'alto' | 'medio' | 'bajo';
  categoria: 'productividad' | 'bienestar' | 'relaciones' | 'aprendizaje' | 'proposito';
}

interface DiaSemana {
  fecha: Date;
  tareas: Tarea[];
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const CATEGORIAS = [
  { id: 'productividad', label: 'Productividad', color: 'text-blue-400' },
  { id: 'bienestar', label: 'Bienestar', color: 'text-green-400' },
  { id: 'relaciones', label: 'Relaciones', color: 'text-purple-400' },
  { id: 'aprendizaje', label: 'Aprendizaje', color: 'text-yellow-400' },
  { id: 'proposito', label: 'Propósito', color: 'text-red-400' }
];

const TAREAS_SUGERIDAS = {
  productividad: [
    'Revisión de objetivos semanales',
    'Planificación de sprints',
    'Optimización de procesos',
    'Análisis de métricas',
    'Reunión estratégica'
  ],
  bienestar: [
    'Meditación matutina',
    'Ejercicio físico',
    'Rutina de sueño',
    'Alimentación consciente',
    'Tiempo de descanso'
  ],
  relaciones: [
    'Networking profesional',
    'Conexión familiar',
    'Mentoría',
    'Colaboración',
    'Feedback'
  ],
  aprendizaje: [
    'Lectura técnica',
    'Curso online',
    'Investigación',
    'Práctica de habilidades',
    'Documentación'
  ],
  proposito: [
    'Reflexión personal',
    'Definición de metas',
    'Alineación de valores',
    'Impacto social',
    'Legado'
  ]
};

const VisionPlanner = () => {
  const [semana, setSemana] = useState<DiaSemana[]>([]);
  const [diaActual, setDiaActual] = useState(0);
  const [mostrarNuevaTarea, setMostrarNuevaTarea] = useState<string | null>(null);
  const [nuevaTarea, setNuevaTarea] = useState<Partial<Tarea>>({
    titulo: '',
    prioridad: 'medio',
    categoria: 'productividad'
  });

  useEffect(() => {
    inicializarSemana();
  }, []);

  const inicializarSemana = () => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes

    const nuevaSemana = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date(inicioSemana);
      fecha.setDate(inicioSemana.getDate() + i);
      return {
        fecha,
        tareas: []
      };
    });

    setSemana(nuevaSemana);
  };

  const sugerirSemanaInteligente = () => {
    const semanaActualizada = semana.map(dia => ({
      ...dia,
      tareas: Array.from({ length: 3 }, () => {
        const categoria = Object.keys(TAREAS_SUGERIDAS)[
          Math.floor(Math.random() * Object.keys(TAREAS_SUGERIDAS).length)
        ] as keyof typeof TAREAS_SUGERIDAS;
        const tareasCategoria = TAREAS_SUGERIDAS[categoria];
        return {
          id: Date.now().toString() + Math.random(),
          titulo: tareasCategoria[Math.floor(Math.random() * tareasCategoria.length)],
          prioridad: ['alto', 'medio', 'bajo'][Math.floor(Math.random() * 3)] as Tarea['prioridad'],
          categoria: categoria as Tarea['categoria']
        };
      })
    }));

    setSemana(semanaActualizada);
  };

  const agregarTarea = (diaIndex: number) => {
    if (nuevaTarea.titulo) {
      const tarea: Tarea = {
        id: Date.now().toString(),
        titulo: nuevaTarea.titulo,
        prioridad: nuevaTarea.prioridad as Tarea['prioridad'],
        categoria: nuevaTarea.categoria as Tarea['categoria']
      };

      const semanaActualizada = [...semana];
      semanaActualizada[diaIndex].tareas.push(tarea);
      setSemana(semanaActualizada);
      setNuevaTarea({ titulo: '', prioridad: 'medio', categoria: 'productividad' });
      setMostrarNuevaTarea(null);
    }
  };

  const eliminarTarea = (diaIndex: number, tareaId: string) => {
    const semanaActualizada = [...semana];
    semanaActualizada[diaIndex].tareas = semanaActualizada[diaIndex].tareas.filter(
      t => t.id !== tareaId
    );
    setSemana(semanaActualizada);
  };

  const getColorPrioridad = (prioridad: string) => {
    switch (prioridad) {
      case 'alto':
        return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'medio':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'bajo':
        return 'text-green-400 border-green-400/30 bg-green-400/10';
      default:
        return 'text-neurolink-coldWhite border-neurolink-coldWhite/30 bg-neurolink-coldWhite/10';
    }
  };

  const exportarVision = () => {
    const contenido = semana.map((dia, index) => {
      const fecha = dia.fecha.toLocaleDateString();
      const tareas = dia.tareas.map(t => `- ${t.titulo} (${t.prioridad})`).join('\n');
      return `${DIAS_SEMANA[index]} ${fecha}:\n${tareas}`;
    }).join('\n\n');

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vision-semanal.txt';
    a.click();
    URL.revokeObjectURL(url);
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
            Planeador de Alto Impacto
          </h1>
          <p className="text-neurolink-coldWhite/70">
            Organiza tu semana con visión estratégica y apoyo cognitivo de NeuroLink AI
          </p>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sugerirSemanaInteligente}
            className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen 
              hover:bg-neurolink-matrixGreen/30 transition-colors flex items-center gap-2"
          >
            <Sparkles size={20} />
            Sugerir Semana Inteligente
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportarVision}
            className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue 
              hover:bg-neurolink-cyberBlue/30 transition-colors flex items-center gap-2"
          >
            <Download size={20} />
            Exportar Visión
          </motion.button>
        </div>

        {/* Vista Móvil - Carrusel */}
        <div className="lg:hidden relative">
          <button
            onClick={() => setDiaActual(prev => (prev > 0 ? prev - 1 : 6))}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-neurolink-background/50 
              text-neurolink-coldWhite hover:bg-neurolink-background/80"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setDiaActual(prev => (prev < 6 ? prev + 1 : 0))}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-neurolink-background/50 
              text-neurolink-coldWhite hover:bg-neurolink-background/80"
          >
            <ChevronRight size={24} />
          </button>
          <div className="px-12">
            {renderizarDia(diaActual)}
          </div>
        </div>

        {/* Vista Desktop - Grid */}
        <div className="hidden lg:grid grid-cols-7 gap-4">
          {semana.map((dia, index) => renderizarDia(index))}
        </div>
      </div>
    </motion.div>
  );

  function renderizarDia(index: number) {
    const dia = semana[index];
    if (!dia) return null;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30"
      >
        <div className="mb-4">
          <h3 className="text-lg font-orbitron text-neurolink-coldWhite">
            {DIAS_SEMANA[index]}
          </h3>
          <p className="text-sm text-neurolink-coldWhite/50">
            {dia.fecha.toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-3">
          {dia.tareas.map(tarea => (
            <motion.div
              key={tarea.id}
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
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${getColorPrioridad(tarea.prioridad)}`}>
                      {tarea.prioridad}
                    </span>
                    <span className={`text-xs ${CATEGORIAS.find(c => c.id === tarea.categoria)?.color}`}>
                      {CATEGORIAS.find(c => c.id === tarea.categoria)?.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => eliminarTarea(index, tarea.id)}
                  className="p-1 rounded-lg text-red-400 hover:bg-red-400/10"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          ))}

          {mostrarNuevaTarea === index.toString() ? (
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
                  text-neurolink-coldWhite placeholder-neurolink-coldWhite/50 focus:outline-none focus:border-neurolink-matrixGreen text-sm"
              />
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={nuevaTarea.prioridad}
                  onChange={(e) => setNuevaTarea({ ...nuevaTarea, prioridad: e.target.value as Tarea['prioridad'] })}
                  className="px-2 py-1 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                    text-neurolink-coldWhite text-sm focus:outline-none focus:border-neurolink-matrixGreen"
                >
                  <option value="alto">Alto</option>
                  <option value="medio">Medio</option>
                  <option value="bajo">Bajo</option>
                </select>
                <select
                  value={nuevaTarea.categoria}
                  onChange={(e) => setNuevaTarea({ ...nuevaTarea, categoria: e.target.value as Tarea['categoria'] })}
                  className="px-2 py-1 rounded-lg bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
                    text-neurolink-coldWhite text-sm focus:outline-none focus:border-neurolink-matrixGreen"
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => agregarTarea(index)}
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
              onClick={() => setMostrarNuevaTarea(index.toString())}
              className="w-full p-2 rounded-lg border border-dashed border-neurolink-matrixGreen/30 
                text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/10 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Agregar Tarea
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }
};

export default VisionPlanner; 