import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, AlertCircle } from 'lucide-react';

interface Habito {
  id: string;
  nombre: string;
  completado: boolean;
  dias: {
    [key: string]: 'completado' | 'fallado' | 'pendiente';
  };
}

const HABITOS_INICIALES: Habito[] = [
  {
    id: '1',
    nombre: 'Leer 10 min',
    completado: false,
    dias: {
      'Lunes': 'pendiente',
      'Martes': 'pendiente',
      'Miércoles': 'pendiente',
      'Jueves': 'pendiente',
      'Viernes': 'pendiente',
      'Sábado': 'pendiente',
      'Domingo': 'pendiente'
    }
  },
  {
    id: '2',
    nombre: 'Ejercicio 20 min',
    completado: false,
    dias: {
      'Lunes': 'pendiente',
      'Martes': 'pendiente',
      'Miércoles': 'pendiente',
      'Jueves': 'pendiente',
      'Viernes': 'pendiente',
      'Sábado': 'pendiente',
      'Domingo': 'pendiente'
    }
  },
  {
    id: '3',
    nombre: 'Meditar 5 min',
    completado: false,
    dias: {
      'Lunes': 'pendiente',
      'Martes': 'pendiente',
      'Miércoles': 'pendiente',
      'Jueves': 'pendiente',
      'Viernes': 'pendiente',
      'Sábado': 'pendiente',
      'Domingo': 'pendiente'
    }
  }
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const HabitIntelligence = () => {
  const [habitos, setHabitos] = useState<Habito[]>(HABITOS_INICIALES);
  const [nuevoHabito, setNuevoHabito] = useState('');
  const [mostrarMensajeIA, setMostrarMensajeIA] = useState(false);

  const agregarHabito = () => {
    if (nuevoHabito.trim()) {
      const nuevo: Habito = {
        id: Date.now().toString(),
        nombre: nuevoHabito.trim(),
        completado: false,
        dias: DIAS_SEMANA.reduce((acc, dia) => ({ ...acc, [dia]: 'pendiente' }), {})
      };
      setHabitos([...habitos, nuevo]);
      setNuevoHabito('');
    }
  };

  const toggleHabito = (id: string) => {
    setHabitos(habitos.map(habito => 
      habito.id === id 
        ? { ...habito, completado: !habito.completado }
        : habito
    ));
  };

  const actualizarEstadoDia = (habitoId: string, dia: string, estado: 'completado' | 'fallado' | 'pendiente') => {
    setHabitos(habitos.map(habito => 
      habito.id === habitoId
        ? { ...habito, dias: { ...habito.dias, [dia]: estado } }
        : habito
    ));
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'fallado':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-8 bg-neurolink-background"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-orbitron text-neurolink-coldWhite mb-8">
          Inteligencia de Hábitos
        </h1>

        {/* Mensaje de IA */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-lg bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/30"
        >
          <p className="text-neurolink-coldWhite/80">
            <AlertCircle className="inline-block mr-2" size={20} />
            Próximamente: La IA analizará tu desempeño y sugerirá hábitos personalizados según tu perfil cognitivo.
          </p>
        </motion.div>

        {/* Formulario para nuevo hábito */}
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={nuevoHabito}
            onChange={(e) => setNuevoHabito(e.target.value)}
            placeholder="Añadir nuevo hábito..."
            className="flex-1 px-4 py-2 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30 
              text-neurolink-coldWhite placeholder-neurolink-coldWhite/50 focus:outline-none focus:border-neurolink-cyberBlue"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={agregarHabito}
            className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue 
              hover:bg-neurolink-cyberBlue/30 transition-colors"
          >
            <Plus size={24} />
          </motion.button>
        </div>

        {/* Lista de hábitos */}
        <div className="space-y-6">
          {habitos.map((habito) => (
            <motion.div
              key={habito.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-orbitron text-neurolink-coldWhite">
                  {habito.nombre}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleHabito(habito.id)}
                  className={`p-2 rounded-lg ${
                    habito.completado
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue'
                  }`}
                >
                  {habito.completado ? <Check size={20} /> : <X size={20} />}
                </motion.button>
              </div>

              {/* Progreso semanal */}
              <div className="grid grid-cols-7 gap-2">
                {DIAS_SEMANA.map((dia) => (
                  <motion.button
                    key={dia}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const estados: ('completado' | 'fallado' | 'pendiente')[] = ['completado', 'fallado', 'pendiente'];
                      const estadoActual = habito.dias[dia];
                      const siguienteEstado = estados[(estados.indexOf(estadoActual) + 1) % 3];
                      actualizarEstadoDia(habito.id, dia, siguienteEstado);
                    }}
                    className={`p-2 rounded-lg border text-center text-sm ${getEstadoColor(habito.dias[dia])}`}
                  >
                    {dia.slice(0, 3)}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HabitIntelligence; 