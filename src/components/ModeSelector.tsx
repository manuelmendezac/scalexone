import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Moon, Zap, Focus, Coffee, X } from 'lucide-react';
import { useTheme } from '../context/themeContext';

const ModeSelector = () => {
  const { mode, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const modes = [
    { 
      id: 'default', 
      icon: Brain, 
      label: 'Normal', 
      color: 'text-neurolink-cyberBlue',
      description: 'Modo estándar de NeuroLink AI'
    },
    { 
      id: 'focus', 
      icon: Focus, 
      label: 'Enfoque', 
      color: 'text-blue-400',
      description: 'Minimalista y sin distracciones'
    },
    { 
      id: 'sleep', 
      icon: Moon, 
      label: 'Descanso', 
      color: 'text-purple-400',
      description: 'Relajante y tranquilo'
    },
    { 
      id: 'productivity', 
      icon: Zap, 
      label: 'Productividad', 
      color: 'text-neurolink-matrixGreen',
      description: 'Energético y enfocado en tareas'
    },
  ];

  return (
    <>
      {/* Botón Flotante */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full
          bg-black/80 backdrop-blur-md border-2 border-neurolink-cyberBlue/30
          text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/20
          transition-all duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Coffee className="w-6 h-6 text-neurolink-matrixGreen" />
      </motion.button>

      {/* Menú Lateral */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Panel Lateral */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed right-0 top-0 h-full w-80 bg-black/90 backdrop-blur-md
                border-l-2 border-neurolink-cyberBlue/30 z-50
                overflow-y-auto"
            >
              {/* Encabezado */}
              <div className="p-4 border-b border-neurolink-cyberBlue/30">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-futuristic text-neurolink-coldWhite">
                    Modos Inteligentes
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-neurolink-cyberBlue/20
                      transition-colors duration-300"
                  >
                    <X className="w-5 h-5 text-neurolink-coldWhite" />
                  </button>
                </div>
                <p className="text-sm text-neurolink-coldWhite/60 mt-1">
                  Personaliza tu experiencia
                </p>
              </div>

              {/* Lista de Modos */}
              <div className="p-4 space-y-2">
                {modes.map(({ id, icon: Icon, label, color, description }) => (
                  <motion.button
                    key={id}
                    onClick={() => {
                      setMode(id as any);
                      setIsOpen(false);
                    }}
                    className={`w-full p-4 rounded-lg text-left
                      ${mode === id 
                        ? 'bg-neurolink-cyberBlue/20 border-2 border-neurolink-cyberBlue/50' 
                        : 'bg-neurolink-cyberBlue/5 border border-neurolink-cyberBlue/20 hover:bg-neurolink-cyberBlue/10'
                      }
                      transition-all duration-300`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${color} bg-black/20`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-futuristic text-neurolink-coldWhite">
                          {label}
                        </h3>
                        <p className="text-sm text-neurolink-coldWhite/60">
                          {description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Comandos de Voz */}
              <div className="p-4 border-t border-neurolink-cyberBlue/30">
                <h3 className="text-sm font-futuristic text-neurolink-coldWhite mb-2">
                  Comandos de Voz
                </h3>
                <div className="space-y-1">
                  <p className="text-xs text-neurolink-coldWhite/60">
                    "Activa modo enfoque"
                  </p>
                  <p className="text-xs text-neurolink-coldWhite/60">
                    "Cambia a modo descanso"
                  </p>
                  <p className="text-xs text-neurolink-coldWhite/60">
                    "Modo productividad"
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ModeSelector; 