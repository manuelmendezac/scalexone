import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Brain, Moon, Sun, Coffee } from 'lucide-react';
import { useModeEffects } from '../hooks/useModeEffects';

interface Habito {
  id: string;
  nombre: string;
  completado: boolean[];
  icono: string;
}

const HabitTracker = () => {
  const [habitos, setHabitos] = useState<Habito[]>([
    {
      id: '1',
      nombre: 'Meditar',
      completado: Array(7).fill(false),
      icono: 'Moon'
    },
    {
      id: '2',
      nombre: 'Aprender algo nuevo',
      completado: Array(7).fill(false),
      icono: 'Brain'
    },
    {
      id: '3',
      nombre: 'Hacer ejercicio',
      completado: Array(7).fill(false),
      icono: 'Sun'
    }
  ]);
  const [nuevoHabito, setNuevoHabito] = useState('');
  const { showProductivityTips, showRelaxingMessages } = useModeEffects();

  const agregarHabito = () => {
    if (!nuevoHabito.trim()) return;

    const habito: Habito = {
      id: Date.now().toString(),
      nombre: nuevoHabito,
      completado: Array(7).fill(false),
      icono: 'Coffee'
    };

    setHabitos(prev => [...prev, habito]);
    setNuevoHabito('');
  };

  const toggleHabito = (habitoId: string, diaIndex: number) => {
    setHabitos(prev =>
      prev.map(habito =>
        habito.id === habitoId
          ? {
              ...habito,
              completado: habito.completado.map((completado, index) =>
                index === diaIndex ? !completado : completado
              )
            }
          : habito
      )
    );
  };

  const sugerirHabitos = () => {
    const sugerencias: Habito[] = [
      {
        id: Date.now().toString(),
        nombre: 'Tomar agua',
        completado: Array(7).fill(false),
        icono: 'Coffee'
      },
      {
        id: (Date.now() + 1).toString(),
        nombre: 'Leer',
        completado: Array(7).fill(false),
        icono: 'Brain'
      },
      {
        id: (Date.now() + 2).toString(),
        nombre: 'Dormir temprano',
        completado: Array(7).fill(false),
        icono: 'Moon'
      }
    ];

    setHabitos(prev => [...prev, ...sugerencias]);
  };

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto bg-neurolink-background/50 backdrop-blur-lg rounded-lg border border-neurolink-matrixGreen/30 p-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-orbitron text-coldWhite flex items-center">
          <Brain className="w-6 h-6 mr-2 text-neurolink-matrixGreen" />
          HabitTracker
        </h2>
        {showProductivityTips && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sugerirHabitos}
            className="px-4 py-2 bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen rounded-lg hover:bg-opacity-30 transition-all"
          >
            Sugerir Hábitos
          </motion.button>
        )}
      </div>

      {showRelaxingMessages && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-neurolink-matrixGreen mb-4 font-orbitron"
        >
          🌙 Tiempo de descanso - Mantén tus hábitos saludables
        </motion.div>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={nuevoHabito}
            onChange={(e) => setNuevoHabito(e.target.value)}
            placeholder="Nuevo hábito..."
            className="flex-1 bg-neurolink-background/30 text-coldWhite border border-neurolink-matrixGreen/30 rounded-lg px-4 py-2 focus:outline-none focus:border-neurolink-matrixGreen"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={agregarHabito}
            className="p-2 bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen rounded-lg hover:bg-opacity-30 transition-all"
          >
            <Plus size={20} />
          </motion.button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-2 mb-2">
            <div className="text-coldWhite/60 font-orbitron">Hábito</div>
            {diasSemana.map((dia) => (
              <div key={dia} className="text-center text-coldWhite/60 font-orbitron">
                {dia}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {habitos.map((habito) => (
                <motion.div
                  key={habito.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-[200px_repeat(7,1fr)] gap-2 items-center"
                >
                  <div className="flex items-center space-x-2 text-coldWhite">
                    {habito.icono === 'Moon' && <Moon size={16} />}
                    {habito.icono === 'Brain' && <Brain size={16} />}
                    {habito.icono === 'Sun' && <Sun size={16} />}
                    {habito.icono === 'Coffee' && <Coffee size={16} />}
                    <span>{habito.nombre}</span>
                  </div>
                  {habito.completado.map((completado, index) => (
                    <button
                      key={index}
                      onClick={() => toggleHabito(habito.id, index)}
                      className={`w-8 h-8 mx-auto rounded-lg border ${
                        completado
                          ? 'bg-neurolink-matrixGreen/20 border-neurolink-matrixGreen'
                          : 'bg-neurolink-background/30 border-neurolink-matrixGreen/30'
                      } hover:bg-opacity-30 transition-all`}
                    />
                  ))}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HabitTracker; 