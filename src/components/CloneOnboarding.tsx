import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, FileText, Calendar, Globe, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Tipos
interface OnboardingState {
  step: number;
  purpose: string;
  name: string;
  personality: string;
  connections: {
    documents: boolean;
    notes: boolean;
    calendar: boolean;
    browsing: boolean;
  };
  isTraining: boolean;
}

const initialState: OnboardingState = {
  step: 1,
  purpose: '',
  name: '',
  personality: '',
  connections: {
    documents: false,
    notes: false,
    calendar: false,
    browsing: false
  },
  isTraining: false
};

const CloneOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem('onboardingState');
    return saved ? JSON.parse(saved) : initialState;
  });

  // Guardar estado en localStorage
  useEffect(() => {
    localStorage.setItem('onboardingState', JSON.stringify(state));
  }, [state]);

  // Opciones de propósito
  const purposes = [
    { id: 'business', label: 'Negocios', icon: '💼' },
    { id: 'study', label: 'Estudio', icon: '📚' },
    { id: 'productivity', label: 'Productividad', icon: '⚡' },
    { id: 'personal', label: 'Marca personal', icon: '🌟' },
    { id: 'other', label: 'Otra', icon: '🎯' }
  ];

  // Opciones de personalidad
  const personalities = [
    { id: 'formal', label: 'Formal', icon: '👔' },
    { id: 'inspiring', label: 'Inspirador', icon: '✨' },
    { id: 'visionary', label: 'Visionario', icon: '🔮' },
    { id: 'technical', label: 'Técnico', icon: '⚙️' },
    { id: 'coach', label: 'Coach', icon: '🎯' },
    { id: 'friendly', label: 'Amigable', icon: '😊' }
  ];

  // Manejadores de eventos
  const handlePurposeSelect = (purpose: string) => {
    setState(prev => ({ ...prev, purpose, step: 2 }));
  };

  const handleNameChange = (name: string) => {
    setState(prev => ({ ...prev, name }));
  };

  const handleNameSubmit = () => {
    if (state.name.trim()) {
      setState(prev => ({ ...prev, step: 3 }));
    }
  };

  const handlePersonalitySelect = (personality: string) => {
    setState(prev => ({ ...prev, personality, step: 4 }));
  };

  const handleConnectionToggle = (key: keyof OnboardingState['connections']) => {
    setState(prev => ({
      ...prev,
      connections: {
        ...prev.connections,
        [key]: !prev.connections[key]
      }
    }));
  };

  const handleConnectionsSubmit = () => {
    setState(prev => ({ ...prev, step: 5, isTraining: true }));
    // Simular entrenamiento
    setTimeout(() => {
      setState(prev => ({ ...prev, step: 6, isTraining: false }));
    }, 3000);
  };

  const handleActivate = () => {
    localStorage.removeItem('onboardingState');
    navigate('/dashboard/console');
  };

  // Componente de barra de progreso
  const ProgressBar = () => (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800">
      <motion.div
        className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
        initial={{ width: '0%' }}
        animate={{ width: `${(state.step / 6) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );

  // Renderizado condicional de pasos
  const renderStep = () => {
    switch (state.step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl mb-4"
              >
                🧠
              </motion.div>
              <h2 className="text-2xl font-orbitron text-cyan-300 mb-4">
                Bienvenido al nacimiento de tu clon cognitivo
              </h2>
              <p className="text-violet-200/80">
                ¿Cuál será su propósito principal?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purposes.map(purpose => (
                <motion.button
                  key={purpose.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePurposeSelect(purpose.id)}
                  className="p-4 rounded-lg bg-gradient-to-r from-cyan-900/50 to-violet-900/50 
                    border border-cyan-500/30 hover:border-cyan-500/50 
                    backdrop-blur-sm text-left"
                >
                  <span className="text-2xl mr-2">{purpose.icon}</span>
                  <span className="text-cyan-100">{purpose.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-orbitron text-cyan-300 mb-4">
                Nombra a tu clon
              </h2>
            </div>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                value={state.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Escribe el nombre de tu clon..."
                className="w-full p-4 rounded-lg bg-cyan-900/30 border border-cyan-500/30 
                  text-cyan-100 placeholder-cyan-300/50 focus:outline-none focus:border-cyan-500"
              />
              {state.name && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 rounded-lg bg-violet-900/30 border border-violet-500/30"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">🤖</div>
                    <p className="text-violet-200">{state.name}</p>
                  </div>
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNameSubmit}
                disabled={!state.name.trim()}
                className="w-full mt-4 p-4 rounded-lg bg-gradient-to-r from-cyan-600 to-violet-600 
                  text-white font-orbitron disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
              </motion.button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-orbitron text-cyan-300 mb-4">
                ¿Cómo quieres que interactúe tu clon?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personalities.map(personality => (
                <motion.button
                  key={personality.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePersonalitySelect(personality.id)}
                  className="p-4 rounded-lg bg-gradient-to-r from-cyan-900/50 to-violet-900/50 
                    border border-cyan-500/30 hover:border-cyan-500/50 
                    backdrop-blur-sm text-left"
                >
                  <span className="text-2xl mr-2">{personality.icon}</span>
                  <span className="text-cyan-100">{personality.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-orbitron text-cyan-300 mb-4">
                Conexiones iniciales
              </h2>
              <p className="text-violet-200/80 mb-6">
                Tu clon aprenderá de esto para responder mejor
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              {[
                { key: 'documents', icon: <FileText />, label: 'Documentos' },
                { key: 'notes', icon: <Brain />, label: 'Notas personales' },
                { key: 'calendar', icon: <Calendar />, label: 'Calendario' },
                { key: 'browsing', icon: <Globe />, label: 'Datos de navegación' }
              ].map(({ key, icon, label }) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center p-4 rounded-lg bg-gradient-to-r from-cyan-900/50 to-violet-900/50 
                    border border-cyan-500/30 cursor-pointer"
                  onClick={() => handleConnectionToggle(key as keyof OnboardingState['connections'])}
                >
                  <div className="w-8 h-8 flex items-center justify-center text-cyan-300">
                    {icon}
                  </div>
                  <span className="ml-4 text-cyan-100">{label}</span>
                  <div className="ml-auto">
                    <div className={`w-6 h-6 rounded-full border-2 
                      ${state.connections[key as keyof OnboardingState['connections']]
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'border-cyan-500/50'
                      }`}
                    />
                  </div>
                </motion.div>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConnectionsSubmit}
                className="w-full mt-6 p-4 rounded-lg bg-gradient-to-r from-cyan-600 to-violet-600 
                  text-white font-orbitron"
              >
                Iniciar entrenamiento
              </motion.button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-4"
            >
              🧬
            </motion.div>
            <h2 className="text-2xl font-orbitron text-cyan-300">
              Sincronizando tu conocimiento...
            </h2>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-6xl mb-4"
              >
                ✅
              </motion.div>
              <h2 className="text-2xl font-orbitron text-cyan-300 mb-4">
                Tu clon está listo
              </h2>
            </div>
            <div className="max-w-md mx-auto p-6 rounded-lg bg-gradient-to-r from-cyan-900/50 to-violet-900/50 
              border border-cyan-500/30 space-y-4"
            >
              <div className="flex items-center">
                <span className="text-cyan-300 w-24">Nombre:</span>
                <span className="text-cyan-100">{state.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-cyan-300 w-24">Personalidad:</span>
                <span className="text-cyan-100">
                  {personalities.find(p => p.id === state.personality)?.label}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-cyan-300 w-24">Conexiones:</span>
                <span className="text-cyan-100">
                  {Object.entries(state.connections)
                    .filter(([_, value]) => value)
                    .map(([key]) => {
                      const connection = {
                        documents: 'Documentos',
                        notes: 'Notas',
                        calendar: 'Calendario',
                        browsing: 'Navegación'
                      }[key];
                      return connection;
                    })
                    .join(', ')}
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleActivate}
              className="w-full max-w-md mx-auto p-4 rounded-lg bg-gradient-to-r from-cyan-600 to-violet-600 
                text-white font-orbitron flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Activar clon
            </motion.button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4 md:p-8">
      <ProgressBar />
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CloneOnboarding; 