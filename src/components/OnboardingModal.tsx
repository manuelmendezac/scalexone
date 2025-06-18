import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    icon: '👋',
    title: 'Bienvenido a NeuroLink AI, tu clon inteligente personalizado está listo para empezar.'
  },
  {
    icon: '💡',
    title: 'Conecta tu clon con un nicho y empieza a entrenarlo con documentos.'
  },
  {
    icon: '📁',
    title: 'Carga información relevante para construir tu memoria cognitiva.'
  },
  {
    icon: '🧠',
    title: 'Accede al Asistente IA y consulta como si fuera tu segundo cerebro.'
  },
  {
    icon: '📊',
    title: 'Explora el Dashboard para visualizar tu progreso.'
  },
  {
    icon: '🌐',
    title: 'Activa funciones avanzadas desde Configuración o Explora nuevos módulos.'
  }
];

interface OnboardingModalProps {
  open?: boolean;
  onClose?: () => void;
}

const ONBOARDING_KEY = 'neurolink_onboarding_completed';

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open = true, onClose }) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(open);
  const navigate = useNavigate();

  useEffect(() => {
    setVisible(open);
  }, [open]);

  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY) === 'true') {
      setVisible(false);
    }
  }, []);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setVisible(false);
      if (onClose) onClose();
      navigate('/clasificacion/console');
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto rounded-2xl shadow-2xl bg-neurolink-background border-2 border-cyan-400/60 p-8 flex flex-col items-center neon-glow"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          <div className="text-5xl mb-4 animate-pulse drop-shadow-lg">{STEPS[step].icon}</div>
          <div className="text-cyan-200 text-lg text-center mb-8 font-orbitron drop-shadow-lg">
            {STEPS[step].title}
          </div>
          <div className="flex gap-2 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-4 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-cyan-400 shadow-cyan-400/80 shadow-md' : 'bg-cyan-900'}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="mt-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-bold font-orbitron shadow-lg border-2 border-cyan-300 hover:scale-105 transition-transform neon-glow"
          >
            {step < STEPS.length - 1 ? 'Siguiente' : 'Empezar ahora'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingModal; 