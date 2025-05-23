import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, AlertCircle, Brain, Activity, Book, Heart } from 'lucide-react';
import { useStore } from '../store/store';

const CATEGORIAS = [
  { id: 'salud', nombre: 'Salud', icono: Activity },
  { id: 'productividad', nombre: 'Productividad', icono: Brain },
  { id: 'aprendizaje', nombre: 'Aprendizaje', icono: Book },
  { id: 'emocional', nombre: 'Emocional', icono: Heart }
];

const FRECUENCIAS = [
  { id: 'diario', nombre: 'Diario' },
  { id: 'semanal', nombre: 'Semanal' },
  { id: 'personalizado', nombre: 'Personalizado' }
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const HABITOS_SUGERIDOS = [
  {
    nombre: 'Meditación Matutina',
    descripcion: '5 minutos de meditación al despertar',
    categoria: 'salud' as const,
    frecuencia: 'diario' as const,
    sugeridoPorIA: true
  },
  {
    nombre: 'Lectura Técnica',
    descripcion: '30 minutos de lectura sobre tu campo',
    categoria: 'aprendizaje' as const,
    frecuencia: 'diario' as const,
    sugeridoPorIA: true
  },
  {
    nombre: 'Ejercicio Físico',
    descripcion: '20 minutos de actividad física',
    categoria: 'salud' as const,
    frecuencia: 'diario' as const,
    sugeridoPorIA: true
  }
];

export const NeuroHabitsTracker: React.FC = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoHabito, setNuevoHabito] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'salud' as const,
    frecuencia: 'diario' as const,
    diasPersonalizados: [] as string[],
    sugeridoPorIA: false
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const { habitos, agregarHabito, marcarHabitoCompletado } = useStore();

  useEffect(() => {
    // Agregar hábitos sugeridos si no hay hábitos
    if (habitos.length === 0) {
      HABITOS_SUGERIDOS.forEach(habito => {
        agregarHabito({
          ...habito,
          fechaInicio: new Date(),
          prioridad: 1
        });
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    agregarHabito({
      ...nuevoHabito,
      fechaInicio: new Date(),
      prioridad: 1
    });
    setMostrarFormulario(false);
    setNuevoHabito({
      nombre: '',
      descripcion: '',
      categoria: 'salud' as const,
      frecuencia: 'diario' as const,
      diasPersonalizados: [],
      sugeridoPorIA: false
    });
  };

  const handleCompletar = (habitoId: string) => {
    marcarHabitoCompletado(habitoId, new Date(), true);
    const habito = habitos.find(h => h.id === habitoId);
    if (habito) {
      setFeedback(`¡Excelente constancia en tu hábito de ${habito.nombre}!`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const calcularProgreso = (habito: any) => {
    const completados = habito.completado.filter((c: any) => c.completado).length;
    const total = habito.completado.length;
    return total > 0 ? (completados / total) * 100 : 0;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neurolink-dark/80 backdrop-blur-sm rounded-xl border-2 border-neurolink-matrixGreen p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
            Seguimiento de Hábitos
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMostrarFormulario(true)}
            className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron
              flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Hábito</span>
          </motion.button>
        </div>

        {/* Formulario de nuevo hábito */}
        <AnimatePresence>
          {mostrarFormulario && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-neurolink-coldWhite mb-2">Nombre del Hábito</label>
                  <input
                    type="text"
                    value={nuevoHabito.nombre}
                    onChange={(e) => setNuevoHabito({ ...nuevoHabito, nombre: e.target.value })}
                    className="w-full p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30
                      text-neurolink-coldWhite"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neurolink-coldWhite mb-2">Descripción</label>
                  <textarea
                    value={nuevoHabito.descripcion}
                    onChange={(e) => setNuevoHabito({ ...nuevoHabito, descripcion: e.target.value })}
                    className="w-full p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30
                      text-neurolink-coldWhite"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neurolink-coldWhite mb-2">Categoría</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {CATEGORIAS.map(cat => (
                      <motion.button
                        key={cat.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNuevoHabito({ ...nuevoHabito, categoria: cat.id as any })}
                        className={`p-2 rounded-lg flex items-center space-x-2
                          ${nuevoHabito.categoria === cat.id
                            ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                            : 'bg-neurolink-dark/50 text-neurolink-coldWhite border border-neurolink-matrixGreen/30'
                          }`}
                      >
                        <cat.icono className="w-5 h-5" />
                        <span>{cat.nombre}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-neurolink-coldWhite mb-2">Frecuencia</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FRECUENCIAS.map(freq => (
                      <motion.button
                        key={freq.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setNuevoHabito({ ...nuevoHabito, frecuencia: freq.id as any })}
                        className={`p-2 rounded-lg
                          ${nuevoHabito.frecuencia === freq.id
                            ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                            : 'bg-neurolink-dark/50 text-neurolink-coldWhite border border-neurolink-matrixGreen/30'
                          }`}
                      >
                        {freq.nombre}
                      </motion.button>
                    ))}
                  </div>
                </div>
                {nuevoHabito.frecuencia === 'personalizado' as const && (
                  <div>
                    <label className="block text-neurolink-coldWhite mb-2">Días Personalizados</label>
                    <div className="grid grid-cols-7 gap-2">
                      {DIAS_SEMANA.map((dia, index) => (
                        <motion.button
                          key={dia}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const dias = [...nuevoHabito.diasPersonalizados];
                            const diaIndex = dias.indexOf(dia);
                            if (diaIndex === -1) {
                              dias.push(dia);
                            } else {
                              dias.splice(diaIndex, 1);
                            }
                            setNuevoHabito({ ...nuevoHabito, diasPersonalizados: dias });
                          }}
                          className={`p-2 rounded-lg
                            ${nuevoHabito.diasPersonalizados.includes(dia)
                              ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                              : 'bg-neurolink-dark/50 text-neurolink-coldWhite border border-neurolink-matrixGreen/30'
                            }`}
                        >
                          {dia}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMostrarFormulario(false)}
                    className="px-4 py-2 rounded-lg bg-neurolink-dark/50 text-neurolink-coldWhite
                      border border-neurolink-matrixGreen/30"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark"
                  >
                    Crear Hábito
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lista de hábitos */}
        <div className="space-y-4">
          {habitos.map(habito => {
            const progreso = calcularProgreso(habito);
            const categoria = CATEGORIAS.find(c => c.id === habito.categoria);
            const Icono = categoria?.icono || Brain;

            return (
              <motion.div
                key={habito.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icono className="w-6 h-6 text-neurolink-matrixGreen mt-1" />
                    <div>
                      <h3 className="text-lg font-orbitron text-neurolink-coldWhite">
                        {habito.nombre}
                      </h3>
                      <p className="text-neurolink-coldWhite/80">
                        {habito.descripcion}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="h-2 w-32 bg-neurolink-dark/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progreso}%` }}
                            className="h-full bg-neurolink-matrixGreen"
                          />
                        </div>
                        <span className="text-sm text-neurolink-coldWhite/60">
                          {Math.round(progreso)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCompletar(habito.id)}
                    className="p-2 rounded-lg bg-neurolink-dark/50 text-neurolink-matrixGreen
                      hover:bg-neurolink-matrixGreen/10"
                  >
                    <Check className="w-6 h-6" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 p-4 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark
                shadow-lg"
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 