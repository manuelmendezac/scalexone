import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, FolderOpen, MessageSquare, BookOpen } from 'lucide-react';
import useNeuroState from '../store/useNeuroState';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const professions = [
  { id: 'coach', name: 'Coach', icon: '🎯' },
  { id: 'lawyer', name: 'Abogado', icon: '⚖️' },
  { id: 'doctor', name: 'Médico', icon: '👨‍⚕️' },
  { id: 'entrepreneur', name: 'Emprendedor', icon: '💼' },
  { id: 'developer', name: 'Desarrollador', icon: '👨‍💻' },
  { id: 'teacher', name: 'Profesor', icon: '👨‍🏫' }
];

const industries = [
  { id: 'tech', name: 'Tecnología', icon: '💻' },
  { id: 'health', name: 'Salud', icon: '🏥' },
  { id: 'education', name: 'Educación', icon: '📚' },
  { id: 'finance', name: 'Finanzas', icon: '💰' },
  { id: 'legal', name: 'Legal', icon: '⚖️' },
  { id: 'marketing', name: 'Marketing', icon: '📢' }
];

const PanelIA = () => {
  const { userName } = useNeuroState();
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const modules: Module[] = [
    {
      id: 'summaries',
      name: 'Resúmenes Inteligentes',
      description: 'Genera resúmenes concisos de documentos y conversaciones',
      icon: <Brain className="w-6 h-6" />,
      isActive: false
    },
    {
      id: 'organizer',
      name: 'Organizador Mental',
      description: 'Estructura y categoriza tu información de forma eficiente',
      icon: <FolderOpen className="w-6 h-6" />,
      isActive: false
    },
    {
      id: 'assistant',
      name: 'Asistente de Respuestas',
      description: 'Proporciona respuestas contextuales y precisas',
      icon: <MessageSquare className="w-6 h-6" />,
      isActive: false
    },
    {
      id: 'knowledge',
      name: 'Base de Conocimiento',
      description: 'Accede a tu información personalizada y documentos',
      icon: <BookOpen className="w-6 h-6" />,
      isActive: false
    }
  ];

  const handleActivate = () => {
    setIsActivated(true);
    setShowWelcome(true);
    setTimeout(() => setShowWelcome(false), 5000);
  };

  return (
    <div className="min-h-screen bg-neurolink-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel Izquierdo - Selección */}
          <div className="space-y-8">
            <div className="bg-black/30 rounded-xl p-6 border-2 border-neurolink-matrixGreen/20">
              <h2 className="text-2xl font-futuristic text-neurolink-coldWhite mb-6">
                Configura tu IA Personal
              </h2>

              {/* Selector de Profesión */}
              <div className="mb-6">
                <label className="block text-neurolink-coldWhite/80 mb-2">
                  Selecciona tu Profesión
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {professions.map((prof) => (
                    <button
                      key={prof.id}
                      onClick={() => setSelectedProfession(prof.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedProfession === prof.id
                          ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                          : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/60'
                      }`}
                    >
                      <div className="text-2xl mb-2">{prof.icon}</div>
                      <div className="text-neurolink-coldWhite">{prof.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Industria */}
              <div className="mb-6">
                <label className="block text-neurolink-coldWhite/80 mb-2">
                  Selecciona tu Industria
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {industries.map((ind) => (
                    <button
                      key={ind.id}
                      onClick={() => setSelectedIndustry(ind.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedIndustry === ind.id
                          ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                          : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/60'
                      }`}
                    >
                      <div className="text-2xl mb-2">{ind.icon}</div>
                      <div className="text-neurolink-coldWhite">{ind.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón de Activación */}
              <button
                onClick={handleActivate}
                disabled={!selectedProfession || !selectedIndustry}
                className={`w-full py-3 rounded-lg transition-all ${
                  !selectedProfession || !selectedIndustry
                    ? 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite/40 cursor-not-allowed'
                    : 'bg-neurolink-matrixGreen/20 hover:bg-neurolink-matrixGreen/30 text-neurolink-coldWhite'
                }`}
              >
                Activar IA Personalizada
              </button>
            </div>
          </div>

          {/* Panel Derecho - Módulos */}
          <div className="space-y-8">
            <div className="bg-black/30 rounded-xl p-6 border-2 border-neurolink-matrixGreen/20">
              <h2 className="text-2xl font-futuristic text-neurolink-coldWhite mb-6">
                Tu Segundo Cerebro IA
              </h2>

              {/* Mensaje de Bienvenida */}
              <AnimatePresence>
                {showWelcome && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6 p-4 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-coldWhite"
                  >
                    Hola {userName}, tu asistente cognitivo está listo.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Módulos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modules.map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isActivated
                        ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                        : 'border-neurolink-cyberBlue/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-neurolink-matrixGreen">
                        {module.icon}
                      </div>
                      <h3 className="text-neurolink-coldWhite font-futuristic">
                        {module.name}
                      </h3>
                    </div>
                    <p className="text-neurolink-coldWhite/60 text-sm">
                      {module.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelIA; 