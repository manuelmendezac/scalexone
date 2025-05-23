import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    icon: '👋',
    title: 'Bienvenido a tu portal de inteligencia aumentada',
    subtitle: 'Vamos a configurar tu clon en menos de 2 minutos',
    action: 'Empezar'
  },
  {
    icon: '👤',
    title: 'Nombre y Correo',
    subtitle: 'Ingresa tu nombre y correo electrónico',
    action: 'Siguiente'
  },
  {
    icon: '🎯',
    title: 'Selección de Nicho',
    subtitle: 'Elige tu área de experticia (puedes seleccionar más de una)',
    action: 'Siguiente'
  },
  {
    icon: '📁',
    title: 'Carga de Documentos',
    subtitle: 'Carga documentos, libros o enlaces de referencia (opcional)',
    action: 'Siguiente'
  },
  {
    icon: '✅',
    title: 'Confirmación',
    subtitle: 'Resumen: nombre, estilo, intereses, archivo cargado',
    action: 'Confirmar'
  },
  {
    icon: '🚀',
    title: 'Finalización',
    subtitle: '¡Tu clon está listo para activarse!',
    action: 'Activar mi clon ahora'
  }
];

const OnboardingStepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const progress = ((currentStep + 1) / STEPS.length) * 100;

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
      // Aquí puedes redirigir al Dashboard
    }
  };

  if (onboardingCompleted) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-neurolink-background rounded-xl shadow-lg border-2 border-[#00FFE0]">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#9EFFC9] font-orbitron">Onboarding</h2>
        <div className="h-2 w-full bg-[#0F0F0F] rounded-full mt-4">
          <motion.div
            className="h-full bg-[#00FFE0] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-5xl mb-4 animate-pulse">{STEPS[currentStep].icon}</div>
          <h3 className="text-xl font-bold text-[#9EFFC9] mb-2">{STEPS[currentStep].title}</h3>
          <p className="text-[#00FFE0] mb-4">{STEPS[currentStep].subtitle}</p>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-[#00FFE0] text-[#0F0F0F] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors"
          >
            {STEPS[currentStep].action}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingStepper; 