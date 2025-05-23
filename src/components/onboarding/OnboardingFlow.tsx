import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: '¡Bienvenido a NeuroLink AI, [Nombre]!',
    content: 'Te damos la bienvenida a tu portal de inteligencia aumentada.'
  },
  {
    title: 'Propósito del Clon Digital',
    content: 'Tu clon digital te ayudará a potenciar tu productividad y creatividad.'
  },
  {
    title: 'Secciones Clave',
    content: 'Explora el Panel IA, Documentos, Simulación y más.'
  },
  {
    title: 'Iniciar y Cargar Conocimientos',
    content: 'Comienza cargando información relevante para tu clon.'
  },
  {
    title: 'Empieza Ahora',
    content: 'Construye tu clon digital avanzado y potencia tu potencial.'
  }
];

const OnboardingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboardingCompleted') === 'true';
    if (completed) {
      setOnboardingCompleted(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboardingCompleted', 'true');
      setOnboardingCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setOnboardingCompleted(true);
  };

  if (onboardingCompleted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-auto p-6 bg-neurolink-background/90 rounded-xl shadow-lg border-2 border-[#00FFE0]">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-[#9EFFC9] hover:text-[#00FFE0] transition-colors"
          >
            Saltar recorrido
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-[#9EFFC9] font-orbitron mb-4">{STEPS[currentStep].title}</h2>
            <p className="text-[#00FFE0] mb-8">{STEPS[currentStep].content}</p>
            <div className="flex justify-center space-x-4">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 bg-[#0F0F0F] text-[#9EFFC9] rounded-full font-bold hover:bg-[#00FFE0] transition-colors"
                >
                  Anterior
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[#00FFE0] text-[#0F0F0F] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors"
              >
                {currentStep === STEPS.length - 1 ? 'Iniciar Plataforma' : 'Siguiente'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingFlow; 