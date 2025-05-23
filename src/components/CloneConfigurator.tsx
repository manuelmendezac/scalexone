import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Brain, Zap, Target, Star } from 'lucide-react';
import { useStore } from '../store/store';

const PERSONALIDADES = {
  optimista: {
    titulo: 'Optimista',
    descripcion: 'Enfocado en soluciones y oportunidades, manteniendo una actitud positiva.',
    icono: <Star className="w-6 h-6" />
  },
  estrategico: {
    titulo: 'Estratégico',
    descripcion: 'Analiza situaciones desde múltiples perspectivas para encontrar la mejor solución.',
    icono: <Target className="w-6 h-6" />
  },
  analitico: {
    titulo: 'Analítico',
    descripcion: 'Se centra en datos y lógica para tomar decisiones informadas.',
    icono: <Brain className="w-6 h-6" />
  },
  inspirador: {
    titulo: 'Inspirador',
    descripcion: 'Motiva y guía hacia el crecimiento personal y profesional.',
    icono: <Zap className="w-6 h-6" />
  }
};

export const CloneConfigurator: React.FC = () => {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const { configuracionClon, setConfiguracionClon } = useStore();

  const guardarConfiguracion = () => {
    // Guardar en localStorage
    localStorage.setItem('configuracionClon', JSON.stringify(configuracionClon));
    
    // Mostrar confirmación
    setMostrarConfirmacion(true);
    setTimeout(() => setMostrarConfirmacion(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neurolink-dark/80 backdrop-blur-sm rounded-xl border-2 border-neurolink-cyberBlue p-6"
      >
        <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-6">
          Configuración de tu Clon IA
        </h2>

        {/* Tono de respuesta */}
        <div className="mb-8">
          <h3 className="text-lg font-orbitron text-neurolink-cyberBlue mb-4">Tono de Respuesta</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['empatico', 'profesional', 'creativo', 'directo'].map((tono) => (
              <motion.button
                key={tono}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfiguracionClon({ tono: tono as any })}
                className={`p-4 rounded-lg border-2 ${
                  configuracionClon.tono === tono
                    ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                    : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue'
                }`}
              >
                <span className="font-orbitron text-neurolink-coldWhite capitalize">
                  {tono}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Nivel de formalidad */}
        <div className="mb-8">
          <h3 className="text-lg font-orbitron text-neurolink-cyberBlue mb-4">Nivel de Formalidad</h3>
          <div className="grid grid-cols-3 gap-4">
            {['casual', 'neutro', 'formal'].map((formalidad) => (
              <motion.button
                key={formalidad}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfiguracionClon({ formalidad: formalidad as any })}
                className={`p-4 rounded-lg border-2 ${
                  configuracionClon.formalidad === formalidad
                    ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                    : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue'
                }`}
              >
                <span className="font-orbitron text-neurolink-coldWhite capitalize">
                  {formalidad}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Personalidad */}
        <div className="mb-8">
          <h3 className="text-lg font-orbitron text-neurolink-cyberBlue mb-4">Personalidad</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(PERSONALIDADES).map(([key, { titulo, descripcion, icono }]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfiguracionClon({ personalidad: key as any })}
                className={`p-4 rounded-lg border-2 ${
                  configuracionClon.personalidad === key
                    ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                    : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-neurolink-cyberBlue">{icono}</div>
                  <div className="text-left">
                    <h4 className="font-orbitron text-neurolink-coldWhite">{titulo}</h4>
                    <p className="text-sm text-neurolink-coldWhite/70">{descripcion}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Objetivo principal */}
        <div className="mb-8">
          <h3 className="text-lg font-orbitron text-neurolink-cyberBlue mb-4">Objetivo Principal</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['acompanar', 'entrenar', 'motivar', 'resolver', 'recordar'].map((objetivo) => (
              <motion.button
                key={objetivo}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfiguracionClon({ objetivo: objetivo as any })}
                className={`p-4 rounded-lg border-2 ${
                  configuracionClon.objetivo === objetivo
                    ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                    : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue'
                }`}
              >
                <span className="font-orbitron text-neurolink-coldWhite capitalize">
                  {objetivo}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Prioridades */}
        <div className="mb-8">
          <h3 className="text-lg font-orbitron text-neurolink-cyberBlue mb-4">Prioridades</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(configuracionClon.prioridades).map(([key, value]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setConfiguracionClon({
                  prioridades: {
                    ...configuracionClon.prioridades,
                    [key]: !value
                  }
                })}
                className={`p-4 rounded-lg border-2 ${
                  value
                    ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                    : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue'
                }`}
              >
                <span className="font-orbitron text-neurolink-coldWhite capitalize">
                  {key}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={guardarConfiguracion}
            className="px-6 py-3 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron
              flex items-center space-x-2"
          >
            <span>Guardar Configuración</span>
            <Check className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Confirmación */}
        <AnimatePresence>
          {mostrarConfirmacion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 bg-neurolink-matrixGreen text-neurolink-dark
                px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span className="font-orbitron">Tu clon ha sido reconfigurado</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 