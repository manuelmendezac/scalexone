import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useNeuroState from '../store/useNeuroState';

interface TrainingConfig {
  personality: string;
  tone: string;
  language: string;
  enableTTS: boolean;
  selectedNiches: string[];
}

const defaultConfig: TrainingConfig = {
  personality: '',
  tone: 'inspirador',
  language: 'es',
  enableTTS: false,
  selectedNiches: []
};

const niches = [
  { id: 'realestate', name: 'Bienes Raíces', icon: '🏠' },
  { id: 'health', name: 'Salud', icon: '💊' },
  { id: 'ai', name: 'Inteligencia Artificial', icon: '🤖' },
  { id: 'personaldev', name: 'Desarrollo Personal', icon: '🧠' },
  { id: 'coaching', name: 'Coaching', icon: '🎯' },
  { id: 'sales', name: 'Ventas', icon: '💰' }
];

const tones = [
  { id: 'inspirador', name: 'Inspirador', icon: '✨' },
  { id: 'ejecutivo', name: 'Ejecutivo', icon: '👔' },
  { id: 'simpatico', name: 'Simpático', icon: '😊' },
  { id: 'visionario', name: 'Visionario', icon: '🔮' }
];

const languages = [
  { id: 'es', name: 'Español', icon: '🇪🇸' },
  { id: 'en', name: 'English', icon: '🇺🇸' },
  { id: 'pt', name: 'Português', icon: '🇧🇷' }
];

const AITrainerPanel = () => {
  const { userName } = useNeuroState();
  const [config, setConfig] = useState<TrainingConfig>(defaultConfig);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('personality');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simular progreso de carga
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleNicheToggle = (nicheId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedNiches: prev.selectedNiches.includes(nicheId)
        ? prev.selectedNiches.filter(id => id !== nicheId)
        : [...prev.selectedNiches, nicheId]
    }));
  };

  const handleSaveConfig = () => {
    // Aquí iría la lógica para guardar la configuración
    console.log('Configuración guardada:', config);
  };

  const tabs = [
    { id: 'personality', name: 'Personalidad', icon: '🎭' },
    { id: 'knowledge', name: 'Conocimiento', icon: '📚' },
    { id: 'niches', name: 'Nichos', icon: '🎯' },
    { id: 'preferences', name: 'Preferencias', icon: '⚙️' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-8">
        <h2 className="text-2xl font-futuristic text-neurolink-coldWhite mb-8">
          Entrenamiento del Clon IA
        </h2>

        {/* Tabs de Navegación */}
        <div className="flex space-x-4 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-neurolink-cyberBlue text-neurolink-coldWhite'
                  : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite/80 hover:bg-neurolink-cyberBlue/30'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Contenido de las Tabs */}
        <div className="space-y-8">
          {/* Personalidad */}
          <AnimatePresence mode="wait">
            {activeTab === 'personality' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-neurolink-coldWhite/80 mb-2">
                    ¿Cómo deseas que tu clon se exprese?
                  </label>
                  <textarea
                    value={config.personality}
                    onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                    className="w-full p-4 rounded-lg bg-black/30 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    rows={4}
                    placeholder="Describe la personalidad y el estilo de comunicación de tu clon..."
                  />
                </div>

                <div>
                  <label className="block text-neurolink-coldWhite/80 mb-2">
                    Tono de Comunicación
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {tones.map(tone => (
                      <button
                        key={tone.id}
                        onClick={() => setConfig({ ...config, tone: tone.id })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          config.tone === tone.id
                            ? 'border-neurolink-cyberBlue bg-neurolink-cyberBlue/10'
                            : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/60'
                        }`}
                      >
                        <div className="text-2xl mb-2">{tone.icon}</div>
                        <div className="text-neurolink-coldWhite">{tone.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Conocimiento */}
            {activeTab === 'knowledge' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="border-2 border-dashed border-neurolink-cyberBlue/30 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,.docx"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 rounded-lg bg-neurolink-cyberBlue/20 hover:bg-neurolink-cyberBlue/30 transition-colors text-neurolink-coldWhite"
                  >
                    Seleccionar Archivo
                  </button>
                  <p className="mt-2 text-neurolink-coldWhite/60">
                    Formatos soportados: PDF, TXT, DOCX
                  </p>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="h-2 bg-neurolink-cyberBlue/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-neurolink-cyberBlue"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-neurolink-coldWhite/60 text-center">
                      Entrenando al clon con el nuevo conocimiento...
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Nichos */}
            {activeTab === 'niches' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {niches.map(niche => (
                    <label
                      key={niche.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        config.selectedNiches.includes(niche.id)
                          ? 'border-neurolink-cyberBlue bg-neurolink-cyberBlue/10'
                          : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={config.selectedNiches.includes(niche.id)}
                        onChange={() => handleNicheToggle(niche.id)}
                        className="hidden"
                      />
                      <div className="text-2xl mb-2">{niche.icon}</div>
                      <div className="text-neurolink-coldWhite">{niche.name}</div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Preferencias */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-neurolink-coldWhite/80 mb-2">
                    Idioma Predeterminado
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {languages.map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => setConfig({ ...config, language: lang.id })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          config.language === lang.id
                            ? 'border-neurolink-cyberBlue bg-neurolink-cyberBlue/10'
                            : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/60'
                        }`}
                      >
                        <div className="text-2xl mb-2">{lang.icon}</div>
                        <div className="text-neurolink-coldWhite">{lang.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center space-x-2 text-neurolink-coldWhite/80">
                    <input
                      type="checkbox"
                      checked={config.enableTTS}
                      onChange={(e) => setConfig({ ...config, enableTTS: e.target.checked })}
                      className="form-checkbox text-neurolink-cyberBlue"
                    />
                    <span>Habilitar Text-to-Speech</span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botón de Guardar */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveConfig}
              className="px-6 py-2 rounded-lg bg-neurolink-matrixGreen/20 hover:bg-neurolink-matrixGreen/30 transition-colors text-neurolink-coldWhite"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITrainerPanel; 