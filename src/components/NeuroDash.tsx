import { useState, useEffect } from 'react';
import useNeuroState from '../store/useNeuroState';
import RoutineGenerator from './RoutineGenerator';
import AIConsole from './AIConsole';
import { motion, AnimatePresence } from 'framer-motion';

interface Idea {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  priority: 'alta' | 'media' | 'baja';
}

const NeuroDash = () => {
  const { 
    messages, 
    cognitiveProfile,
    weeklyRoutine,
    userProfile,
    addMessage 
  } = useNeuroState();

  const [activeTab, setActiveTab] = useState<'ideas' | 'planes' | 'tareas'>('ideas');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', content: '', priority: 'media' as const });

  // Simular estado emocional del clon
  const emotionalStates = [
    { emoji: '🤖', text: 'Analítico', color: 'text-blue-400' },
    { emoji: '🎯', text: 'Enfocado', color: 'text-green-400' },
    { emoji: '🧘', text: 'Relajado', color: 'text-purple-400' }
  ];
  const [currentEmotionalState] = useState(emotionalStates[0]);

  useEffect(() => {
    // Simular carga de ideas
    setIdeas([
      {
        id: '1',
        title: 'Optimizar rutina matutina',
        content: 'Implementar técnica Pomodoro con IA',
        timestamp: new Date(),
        priority: 'alta'
      },
      {
        id: '2',
        title: 'Investigación Web3',
        content: 'Profundizar en DeFi y NFTs',
        timestamp: new Date(),
        priority: 'media'
      }
    ]);
  }, []);

  const handleNewIdea = () => {
    if (newIdea.title && newIdea.content) {
      setIdeas([...ideas, {
        id: Date.now().toString(),
        ...newIdea,
        timestamp: new Date()
      }]);
      setShowNewIdeaModal(false);
      setNewIdea({ title: '', content: '', priority: 'media' });
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-neurolink-background' : 'bg-gray-100'} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna lateral izquierda */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full bg-neurolink-cyberBlue/20 flex items-center justify-center">
                  <span className="text-4xl">🤖</span>
                </div>
                <div className={`text-center ${currentEmotionalState.color}`}>
                  <span className="text-2xl">{currentEmotionalState.emoji}</span>
                  <p className="font-futuristic">{currentEmotionalState.text}</p>
                </div>
              </div>
            </div>

            <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-6">
              <h3 className="font-futuristic text-neurolink-coldWhite mb-4">Última Interacción</h3>
              <p className="text-neurolink-coldWhite/80">
                {messages[messages.length - 1]?.text || 'No hay interacciones recientes'}
              </p>
            </div>
          </div>

          {/* Panel central */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-futuristic text-neurolink-coldWhite">
                Panel de Mente Extendida
              </h1>
              <div className="flex space-x-4">
                {['ideas', 'planes', 'tareas'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 rounded-lg font-futuristic transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-neurolink-cyberBlue text-neurolink-coldWhite'
                        : 'text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'planes' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-6"
                >
                  <h2 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
                    📘 Plan Diario Inteligente
                  </h2>
                  <RoutineGenerator />
                </motion.div>
              )}

              {activeTab === 'ideas' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-6"
                >
                  <h2 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
                    🧠 Ideas en Proceso
                  </h2>
                  <div className="space-y-4">
                    {messages.slice(-5).map((msg, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30"
                      >
                        <p className="text-neurolink-coldWhite">{msg.text}</p>
                        <span className="text-xs text-neurolink-coldWhite/60">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'tareas' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-6"
                >
                  <h2 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
                    🧾 Metas a Corto Plazo
                  </h2>
                  <div className="space-y-4">
                    {ideas.map((idea) => (
                      <div
                        key={idea.id}
                        className="p-4 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-neurolink-coldWhite font-futuristic">
                            {idea.title}
                          </h3>
                          <span className={`text-sm ${
                            idea.priority === 'alta' ? 'text-red-400' :
                            idea.priority === 'media' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {idea.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-neurolink-coldWhite/80 mt-2">{idea.content}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Panel derecho */}
          <div className="lg:col-span-3 space-y-6">
            <button
              onClick={() => setShowNewIdeaModal(true)}
              className="w-full px-6 py-3 bg-neurolink-cyberBlue bg-opacity-10 text-neurolink-coldWhite font-futuristic border-2 border-neurolink-cyberBlue rounded-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105"
            >
              Nueva Idea
            </button>

            <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-6">
              <h3 className="font-futuristic text-neurolink-coldWhite mb-4">
                Inputs Recientes
              </h3>
              <div className="space-y-4">
                {messages.slice(-3).map((msg, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30"
                  >
                    <p className="text-neurolink-coldWhite text-sm">{msg.text}</p>
                    <span className="text-xs text-neurolink-coldWhite/60">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-6">
              <h3 className="font-futuristic text-neurolink-coldWhite mb-4">
                Reflexiones Guardadas
              </h3>
              <div className="space-y-4">
                {weeklyRoutine?.reflection && (
                  <div className="p-3 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30">
                    <p className="text-neurolink-coldWhite text-sm">
                      {weeklyRoutine.reflection}
                    </p>
                    <span className="text-xs text-neurolink-coldWhite/60">
                      {new Date(weeklyRoutine.startDate).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nueva Idea */}
      {showNewIdeaModal && (
        <div className="fixed inset-0 bg-neurolink-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-xl p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-futuristic text-neurolink-coldWhite mb-4">
              Nueva Idea
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="Título"
                className="w-full px-4 py-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
              />
              <textarea
                value={newIdea.content}
                onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
                placeholder="Descripción"
                className="w-full px-4 py-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
                rows={4}
              />
              <select
                value={newIdea.priority}
                onChange={(e) => setNewIdea({ ...newIdea, priority: e.target.value as any })}
                className="w-full px-4 py-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
              >
                <option value="alta">Alta Prioridad</option>
                <option value="media">Media Prioridad</option>
                <option value="baja">Baja Prioridad</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowNewIdeaModal(false)}
                className="px-4 py-2 text-neurolink-coldWhite hover:text-neurolink-cyberBlue transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleNewIdea}
                className="px-6 py-2 bg-neurolink-cyberBlue bg-opacity-10 text-neurolink-coldWhite font-futuristic border-2 border-neurolink-cyberBlue rounded-lg hover:bg-opacity-20 transition-all duration-300"
              >
                Guardar Idea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuroDash; 