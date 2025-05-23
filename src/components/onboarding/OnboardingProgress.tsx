import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  { id: 'profile', label: 'Completar perfil', icon: '👤' },
  { id: 'documents', label: 'Cargar documentos', icon: '📁' },
  { id: 'niche', label: 'Elegir nicho', icon: '🎯' },
  { id: 'train', label: 'Entrenar clon', icon: '🧠' },
  { id: 'activate', label: 'Activar asistente IA', icon: '🚀' }
];

const OnboardingProgress: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const savedSteps = localStorage.getItem('completedSteps');
    if (savedSteps) {
      setCompletedSteps(JSON.parse(savedSteps));
    }
    const name = localStorage.getItem('userName');
    if (name) {
      setUserName(name);
    }
  }, []);

  const handleStepComplete = (stepId: string) => {
    const newCompletedSteps = [...completedSteps, stepId];
    setCompletedSteps(newCompletedSteps);
    localStorage.setItem('completedSteps', JSON.stringify(newCompletedSteps));
  };

  const handleStartConfig = () => {
    // Redirigir al panel de perfil o configuración inicial
    window.location.href = '/profile';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-neurolink-background/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#00FFE0]">
      <h2 className="text-2xl font-bold text-[#9EFFC9] font-orbitron mb-4">
        ¡Bienvenido a NeuroLink AI, {userName || 'Usuario'}!
      </h2>
      <div className="space-y-4">
        {STEPS.map((step) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2"
          >
            <span className="text-2xl">{step.icon}</span>
            <span className="text-[#00FFE0]">{step.label}</span>
            {completedSteps.includes(step.id) ? (
              <span className="text-[#9EFFC9]">✅</span>
            ) : (
              <button
                onClick={() => handleStepComplete(step.id)}
                className="px-2 py-1 bg-[#0F0F0F] text-[#9EFFC9] rounded-full text-sm hover:bg-[#00FFE0] transition-colors"
              >
                Completar
              </button>
            )}
          </motion.div>
        ))}
      </div>
      <motion.button
        onClick={handleStartConfig}
        className="mt-6 px-6 py-3 bg-[#00FFE0] text-[#0F0F0F] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Comenzar configuración
      </motion.button>
    </div>
  );
};

export default OnboardingProgress; 