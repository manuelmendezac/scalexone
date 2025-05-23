import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  '¿Quieres ayuda para configurar tu clon?',
  '¿Te muestro cómo conectar tu API de conocimiento?',
  '¿Deseas importar una plantilla de entrenamiento ya hecha?'
];

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showAssistant, setShowAssistant] = useState(true);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenGuide') === 'true';
    if (hasSeenGuide) {
      setShowAssistant(false);
    }
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenGuide', 'true');
    setShowAssistant(false);
  };

  const handleNextMessage = () => {
    if (currentMessage < MESSAGES.length - 1) {
      setCurrentMessage(currentMessage + 1);
    } else {
      handleClose();
    }
  };

  if (!showAssistant) return null;

  return (
    <>
      <motion.button
        className="fixed bottom-4 right-4 w-12 h-12 bg-[#00FFE0] rounded-full flex items-center justify-center text-2xl shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleOpen}
      >
        🧑‍🚀
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full max-w-md p-6 bg-neurolink-background/90 rounded-xl shadow-lg border-2 border-[#00FFE0]"
            >
              <h2 className="text-xl font-bold text-[#9EFFC9] font-orbitron mb-4">Asistente IA</h2>
              <p className="text-[#00FFE0] mb-4">{MESSAGES[currentMessage]}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-[#0F0F0F] text-[#9EFFC9] rounded-full font-bold hover:bg-[#00FFE0] transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleNextMessage}
                  className="px-4 py-2 bg-[#00FFE0] text-[#0F0F0F] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant; 