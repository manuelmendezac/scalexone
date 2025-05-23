import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Upload, Zap, HelpCircle } from 'lucide-react';

const STEPS = [
  {
    icon: <Settings className="w-8 h-8" />,
    title: 'Configura tu clon',
    description: 'Personaliza tu clon según tus necesidades.',
    action: 'Configurar'
  },
  {
    icon: <Upload className="w-8 h-8" />,
    title: 'Carga tu conocimiento',
    description: 'Sube documentos y datos para entrenar tu clon.',
    action: 'Subir Docs'
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Empieza a interactuar',
    description: 'Interactúa con tu clon y explora sus capacidades.',
    action: 'Ir al Panel IA'
  }
];

const WelcomeHero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
    if (hasSeenOnboarding) {
      setIsVisible(false);
    }
  }, []);

  const handleHide = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const handleShow = () => {
    setIsVisible(true);
  };

  const handleAction = (action: string) => {
    // Aquí puedes manejar las acciones de los botones
    console.log(`Acción: ${action}`);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl mx-auto p-6 bg-neurolink-background/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#00FFE0]"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#9EFFC9] font-orbitron">Bienvenido a NeuroLink AI 🧠⚡</h2>
              <button
                onClick={handleHide}
                className="text-[#9EFFC9] hover:text-[#00FFE0] transition-colors"
              >
                Cerrar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STEPS.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="p-4 bg-[#0F0F0F] rounded-lg shadow-md"
                >
                  <div className="flex items-center justify-center mb-2">{step.icon}</div>
                  <h3 className="text-lg font-bold text-[#9EFFC9] mb-2">{step.title}</h3>
                  <p className="text-[#00FFE0] mb-4">{step.description}</p>
                  <button
                    onClick={() => handleAction(step.action)}
                    className="w-full px-4 py-2 bg-[#00FFE0] text-[#0F0F0F] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors"
                  >
                    {step.action}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isVisible && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 w-12 h-12 bg-[#00FFE0] rounded-full flex items-center justify-center shadow-lg"
          onClick={handleShow}
        >
          <HelpCircle className="w-6 h-6 text-[#0F0F0F]" />
        </motion.button>
      )}
    </>
  );
};

export default WelcomeHero; 