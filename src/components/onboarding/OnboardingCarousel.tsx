import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SCREENS = [
  {
    title: 'Bienvenido a tu clon inteligente: esto es lo que puedes hacer…',
    content: 'Descubre las principales funciones de tu clon y la plataforma.'
  },
  {
    title: 'Carga tu conocimiento, entrena tu clon.',
    content: 'Sube información relevante para potenciar tu clon.'
  },
  {
    title: 'Interactúa, afina y monetiza tu IA personal.',
    content: 'Aprende a interactuar y monetizar tu clon.'
  },
  {
    title: 'Conéctalo con herramientas y expande sus capacidades.',
    content: 'Integra tu clon con otras herramientas para maximizar su potencial.'
  }
];

const OnboardingCarousel: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigate('/clasificacion/console');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-neurolink-background/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#00FFE0]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-[#9EFFC9] font-orbitron mb-4">{SCREENS[currentScreen].title}</h2>
          <p className="text-[#00FFE0] mb-8">{SCREENS[currentScreen].content}</p>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-[#00FFE0] text-[#0F0F0F] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors"
          >
            {currentScreen === SCREENS.length - 1 ? 'Comenzar' : 'Siguiente'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingCarousel; 