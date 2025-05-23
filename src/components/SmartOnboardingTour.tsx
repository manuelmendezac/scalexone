import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, LayoutDashboard, Zap, Focus } from 'lucide-react';

const STEPS = [
  {
    icon: <User className="w-8 h-8 text-[#00FFE0]" />,
    title: 'Bienvenido a NeuroLink AI',
    description: 'Tu portal de inteligencia aumentada.'
  },
  {
    icon: <User className="w-8 h-8 text-[#00FFE0]" />,
    title: 'Crea o nombra tu clon',
    description: 'Personaliza tu clon para comenzar.'
  },
  {
    icon: <BookOpen className="w-8 h-8 text-[#00FFE0]" />,
    title: 'Carga conocimientos',
    description: 'Sube documentos, elige nichos o perfiles.'
  },
  {
    icon: <LayoutDashboard className="w-8 h-8 text-[#00FFE0]" />,
    title: 'Explora módulos clave',
    description: 'IA, Dashboard, Simulación, Entrenamiento.'
  },
  {
    icon: <Focus className="w-8 h-8 text-[#00FFE0]" />,
    title: 'Activa modo Focus o sincronización',
    description: 'Optimiza tu experiencia y productividad.'
  }
];

const ONBOARDING_KEY = 'neurolink_onboarding_completed';

const SmartOnboardingTour: React.FC = () => {
  const [showTour, setShowTour] = useState(false);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY) === 'true';
    setCompleted(done);
    setShowTour(!done);
  }, []);

  const handleStart = () => {
    setShowTour(true);
    setStep(0);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setCompleted(true);
      setShowTour(false);
    }
  };

  const handleRestart = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setCompleted(false);
    setShowTour(true);
    setStep(0);
  };

  if (completed && !showTour) {
    return (
      <div className="flex justify-center mt-4">
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-[#00FFE0] text-[#0F0F0F] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors font-orbitron border border-[#00FFE0]"
        >
          Reiniciar onboarding
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-6">
      {!completed && !showTour && (
        <button
          onClick={handleStart}
          className="px-6 py-3 bg-[#00FFE0] text-[#0F0F0F] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors font-orbitron border border-[#00FFE0]"
        >
          Comenzar recorrido
        </button>
      )}
      <AnimatePresence>
        {showTour && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg"
          >
            <div className="w-full max-w-md mx-auto p-8 bg-[#181A20] rounded-2xl shadow-2xl border-2 border-[#00FFE0] font-orbitron text-center relative">
              <div className="flex justify-center mb-4">{STEPS[step].icon}</div>
              <h2 className="text-2xl font-bold text-[#00FFE0] mb-2">{STEPS[step].title}</h2>
              <p className="text-[#9EFFC9] mb-6">{STEPS[step].description}</p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-1">
                  {STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={`w-3 h-3 rounded-full ${i <= step ? 'bg-[#00FFE0]' : 'bg-[#23272F]'}`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="ml-auto px-6 py-2 bg-[#00FFE0] text-[#0F0F0F] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors font-orbitron border border-[#00FFE0]"
                >
                  {step === STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartOnboardingTour; 