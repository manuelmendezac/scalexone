import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, User, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_KEY = 'neurolink_portal_onboarding';

const CARDS = [
  {
    icon: <Zap className="w-8 h-8 text-[#00FFE0]" />, 
    title: '¿Qué es NeuroLink AI?',
    desc: 'Una plataforma para crear, entrenar y potenciar tu clon cognitivo personalizado.'
  },
  {
    icon: <User className="w-8 h-8 text-[#00FFE0]" />,
    title: '¿Cómo funciona tu clon personal?',
    desc: 'Tu clon aprende de tus datos, documentos y preferencias para asistirte de forma inteligente.'
  },
  {
    icon: <Brain className="w-8 h-8 text-[#00FFE0]" />,
    title: '¿Qué puedes hacer desde hoy?',
    desc: 'Automatiza tareas, consulta a tu IA, entrena habilidades y explora módulos avanzados.'
  }
];

const WelcomePortalOnboarding: React.FC = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = sessionStorage.getItem(ONBOARDING_KEY) === 'true';
    if (!seen) setShow(true);
  }, []);

  const handleStart = () => {
    sessionStorage.setItem(ONBOARDING_KEY, 'true');
    setShow(false);
    navigate('/clasificacion/console');
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-3xl mx-auto mt-8 mb-8 p-8 rounded-2xl bg-neurolink-background/80 backdrop-blur-lg border-2 border-[#00FFE0] shadow-2xl flex flex-col items-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-orbitron font-bold text-[#00FFE0] mb-8 text-center"
        >
          Bienvenido a tu portal de inteligencia personalizada
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
          {CARDS.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="bg-[#181A20]/80 rounded-xl border-2 border-[#00FFE0] p-6 flex flex-col items-center shadow-lg"
            >
              <div className="mb-3">{card.icon}</div>
              <h3 className="text-lg font-bold text-[#00FFE0] font-orbitron mb-2 text-center">{card.title}</h3>
              <p className="text-[#9EFFC9] text-center">{card.desc}</p>
            </motion.div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          className="mt-4 px-8 py-3 bg-[#00FFE0] text-[#181A20] font-orbitron font-bold rounded-full border-2 border-[#00FFE0] shadow-lg hover:bg-[#9EFFC9] transition-colors"
        >
          Comenzar ahora
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomePortalOnboarding; 