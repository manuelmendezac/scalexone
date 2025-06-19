import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardEffectProps {
  xp: number;
  monedas: number;
  mensaje: string;
  onComplete?: () => void;
}

const RewardEffect: React.FC<RewardEffectProps> = ({ xp, monedas, mensaje, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Mostrar el efecto por 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed bottom-10 right-10 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6 rounded-xl shadow-xl z-50"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-3"
          >
            {xp > 0 && (
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="flex items-center gap-2"
              >
                <img src="/public/images/modulos/xp.svg" alt="XP" className="w-6 h-6" />
                <span className="text-xl font-bold">+{xp} XP</span>
              </motion.div>
            )}
            {monedas > 0 && (
              <motion.div
                initial={{ x: 20 }}
                animate={{ x: 0 }}
                className="flex items-center gap-2"
              >
                <img src="/public/images/modulos/neurocoin.svg" alt="Monedas" className="w-6 h-6" />
                <span className="text-xl font-bold">+{monedas} Monedas</span>
              </motion.div>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-center mt-2"
            >
              {mensaje}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RewardEffect; 