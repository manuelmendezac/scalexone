import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Upload,
  FileText,
  MessageSquare,
  Settings,
  Globe,
  Zap,
  Shield,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Edit2,
  Save,
  Lock,
  Unlock,
  BrainCircuit,
  Sparkles,
  Languages,
  User,
  MessageCircle,
  File,
  BookOpen,
  HelpCircle,
  Heart,
  Target,
  BarChart2,
  Mic,
  Volume2,
  VolumeX,
  MicOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Interfaces
interface TrainingFile {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

interface CloneIdentity {
  name: string;
  avatar: string | null;
  personality: string;
  defaultLanguage: string;
  communicationStyle: string;
  mission: string;
  vision: string;
  objectives: string[];
}

interface TrainingCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  files: TrainingFile[];
  prompts: string[];
}

interface MemoryEntry {
  id: string;
  timestamp: Date;
  type: 'interaction' | 'feedback' | 'training';
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface VoiceSettings {
  enabled: boolean;
  autoSpeak: boolean;
  voice: string;
  rate: number;
  pitch: number;
  language: string;
}

// Componente Principal
const NeuroCloneCore: React.FC = () => {
  // Estados
  const [activeTab, setActiveTab] = useState<'training' | 'identity' | 'continuous' | 'simulation' | 'security'>('training');
  const [showChat, setShowChat] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado del clon
  const [cloneIdentity, setCloneIdentity] = useState<CloneIdentity>({
    name: 'Mi Clon IA',
    avatar: null,
    personality: 'Profesional y empático',
    defaultLanguage: 'es',
    communicationStyle: 'profesional',
    mission: 'Ayudar a los usuarios a alcanzar sus objetivos',
    vision: 'Ser el asistente IA más efectivo y personalizado',
    objectives: [
      'Proporcionar respuestas precisas y contextualizadas',
      'Mantener un tono profesional pero cercano',
      'Aprender y mejorar constantemente'
    ]
  });

  // Categorías de entrenamiento
  const [categories, setCategories] = useState<TrainingCategory[]>([
    {
      id: 'biography',
      name: 'Biografía',
      description: 'Información personal y experiencia',
      icon: <User className="w-5 h-5" />,
      files: [],
      prompts: []
    },
    {
      id: 'style',
      name: 'Estilo',
      description: 'Tono y forma de comunicación',
      icon: <MessageCircle className="w-5 h-5" />,
      files: [],
      prompts: []
    },
    {
      id: 'knowledge',
      name: 'Conocimientos',
      description: 'Base de conocimientos y experticia',
      icon: <BookOpen className="w-5 h-5" />,
      files: [],
      prompts: []
    },
    {
      id: 'faq',
      name: 'FAQs',
      description: 'Preguntas frecuentes y respuestas',
      icon: <HelpCircle className="w-5 h-5" />,
      files: [],
      prompts: []
    },
    {
      id: 'emotional',
      name: 'Lenguaje Emocional',
      description: 'Patrones de respuesta emocional',
      icon: <Heart className="w-5 h-5" />,
      files: [],
      prompts: []
    }
  ]);

  // Memoria del clon
  const [memory, setMemory] = useState<MemoryEntry[]>([]);

  // Estados de voz
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    autoSpeak: false,
    voice: '',
    rate: 1,
    pitch: 1,
    language: 'es-ES'
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Inicializar reconocimiento de voz y síntesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Inicializar síntesis de voz
      synthesisRef.current = window.speechSynthesis;
      
      // Cargar voces disponibles
      const loadVoices = () => {
        const voices = synthesisRef.current?.getVoices() || [];
        setAvailableVoices(voices);
        
        // Seleccionar voz por defecto en español
        const defaultVoice = voices.find(voice => 
          voice.lang.includes('es') && voice.name.includes('Google')
        ) || voices[0];
        
        if (defaultVoice) {
          setVoiceSettings(prev => ({
            ...prev,
            voice: defaultVoice.name
          }));
        }
      };

      loadVoices();
      synthesisRef.current?.addEventListener('voiceschanged', loadVoices);

      // Inicializar reconocimiento de voz
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.lang = voiceSettings.language;

          recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            // Aquí puedes manejar el texto reconocido
            console.log('Texto reconocido:', transcript);
            setIsListening(false);
          };

          recognitionRef.current.onerror = (event: any) => {
            console.error('Error en reconocimiento de voz:', event.error);
            setIsListening(false);
            toast.error('Error al reconocer la voz');
          };

          recognitionRef.current.onend = () => {
            setIsListening(false);
          };
        }
      }

      return () => {
        synthesisRef.current?.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // Handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`El archivo ${file.name} excede el límite de 100MB`);
        return;
      }

      const newFile: TrainingFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        category: categories[0].id,
        status: 'pending',
        progress: 0
      };

      setCategories(prev => prev.map(cat => 
        cat.id === categories[0].id
          ? { ...cat, files: [...cat.files, newFile] }
          : cat
      ));

      // Simular procesamiento
      setTimeout(() => {
        setCategories(prev => prev.map(cat => ({
          ...cat,
          files: cat.files.map(f => 
            f.id === newFile.id
              ? { ...f, status: 'completed', progress: 100 }
              : f
          )
        })));
        toast.success(`Archivo ${file.name} procesado correctamente`);
      }, 2000);
    });
  };

  const handleAddPrompt = (categoryId: string) => {
    const newPrompt = prompt('Ingresa un nuevo prompt para entrenamiento:');
    if (!newPrompt) return;

    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, prompts: [...cat.prompts, newPrompt] }
        : cat
    ));
  };

  const handleDeleteFile = (categoryId: string, fileId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, files: cat.files.filter(f => f.id !== fileId) }
        : cat
    ));
  };

  const handleDeletePrompt = (categoryId: string, promptIndex: number) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, prompts: cat.prompts.filter((_, i) => i !== promptIndex) }
        : cat
    ));
  };

  const handleUpdateIdentity = (field: keyof CloneIdentity, value: any) => {
    setCloneIdentity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddObjective = () => {
    const newObjective = prompt('Ingresa un nuevo objetivo:');
    if (!newObjective) return;

    setCloneIdentity(prev => ({
      ...prev,
      objectives: [...prev.objectives, newObjective]
    }));
  };

  const handleDeleteObjective = (index: number) => {
    setCloneIdentity(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const handleResetPersonality = () => {
    if (confirm('¿Estás seguro de que deseas reiniciar la personalidad del clon?')) {
      setCloneIdentity(prev => ({
        ...prev,
        personality: 'Profesional y empático',
        communicationStyle: 'profesional'
      }));
      toast.success('Personalidad reiniciada correctamente');
    }
  };

  const handleExportClone = () => {
    if (!isLocked) {
      toast.success('Clon exportado correctamente');
    } else {
      toast.error('Desbloquea el clon para exportarlo');
    }
  };

  // Handlers de voz
  const handleSpeak = (text: string) => {
    if (!synthesisRef.current || !voiceSettings.enabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = availableVoices.find(v => v.name === voiceSettings.voice);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.lang = voiceSettings.language;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error('Error al reproducir el audio');
    };

    synthesisRef.current.speak(utterance);
  };

  const handleStartListening = () => {
    if (!recognitionRef.current || !voiceSettings.enabled) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error al iniciar el reconocimiento:', error);
      toast.error('Error al iniciar el reconocimiento de voz');
    }
  };

  const handleStopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error al detener el reconocimiento:', error);
    }
  };

  const handleVoiceSettingsChange = (field: keyof VoiceSettings, value: any) => {
    setVoiceSettings(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'language' && recognitionRef.current) {
      recognitionRef.current.lang = value;
    }
  };

  return (
    <div className="min-h-screen bg-neurolink-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-orbitron text-neurolink-coldWhite mb-2">
              NeuroClone Core
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Centro de entrenamiento y personalización de clones IA
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLocked(!isLocked)}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              {isLocked ? (
                <>
                  <Lock className="w-5 h-5" />
                  Bloqueado
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  Desbloqueado
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMemory(true)}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <BrainCircuit className="w-5 h-5" />
              Memoria
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-neurolink-cyberBlue/30">
          <button
            onClick={() => setActiveTab('training')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'training'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Entrenamiento
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'identity'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Identidad
          </button>
          <button
            onClick={() => setActiveTab('continuous')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'continuous'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Continuo
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'simulation'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Simulación
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'security'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Seguridad
          </button>
        </div>

        {/* Contenido Principal */}
        <AnimatePresence mode="wait">
          {activeTab === 'training' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Categorías de Entrenamiento */}
              <div className="col-span-12 grid grid-cols-5 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {category.icon}
                      <h2 className="text-xl font-orbitron text-neurolink-coldWhite">
                        {category.name}
                      </h2>
                    </div>
                    <p className="text-neurolink-coldWhite/70 mb-4">
                      {category.description}
                    </p>

                    {/* Archivos */}
                    <div className="space-y-4 mb-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-neurolink-coldWhite font-orbitron">
                          Archivos
                        </h3>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {category.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/40"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-neurolink-matrixGreen" />
                              <span className="text-neurolink-coldWhite text-sm">
                                {file.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {file.status === 'processing' && (
                                <div className="w-4 h-4 border-2 border-neurolink-matrixGreen border-t-transparent rounded-full animate-spin" />
                              )}
                              {file.status === 'completed' && (
                                <CheckCircle className="w-4 h-4 text-neurolink-matrixGreen" />
                              )}
                              {file.status === 'error' && (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                              )}
                              <button
                                onClick={() => handleDeleteFile(category.id, file.id)}
                                className="p-1 rounded-lg text-neurolink-coldWhite/70 hover:text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prompts */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-neurolink-coldWhite font-orbitron">
                          Prompts
                        </h3>
                        <button
                          onClick={() => handleAddPrompt(category.id)}
                          className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {category.prompts.map((prompt, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg bg-black/40"
                          >
                            <span className="text-neurolink-coldWhite text-sm">
                              {prompt}
                            </span>
                            <button
                              onClick={() => handleDeletePrompt(category.id, index)}
                              className="p-1 rounded-lg text-neurolink-coldWhite/70 hover:text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'identity' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Información Básica */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-6">
                  Información Básica
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-neurolink-coldWhite/70 mb-2 block">
                      Nombre del Clon
                    </label>
                    <input
                      type="text"
                      value={cloneIdentity.name}
                      onChange={(e) => handleUpdateIdentity('name', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    />
                  </div>
                  <div>
                    <label className="text-neurolink-coldWhite/70 mb-2 block">
                      Personalidad
                    </label>
                    <textarea
                      value={cloneIdentity.personality}
                      onChange={(e) => handleUpdateIdentity('personality', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-neurolink-coldWhite/70 mb-2 block">
                      Idioma por Defecto
                    </label>
                    <select
                      value={cloneIdentity.defaultLanguage}
                      onChange={(e) => handleUpdateIdentity('defaultLanguage', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neurolink-coldWhite/70 mb-2 block">
                      Estilo de Comunicación
                    </label>
                    <select
                      value={cloneIdentity.communicationStyle}
                      onChange={(e) => handleUpdateIdentity('communicationStyle', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    >
                      <option value="professional">Profesional</option>
                      <option value="emotional">Emocional</option>
                      <option value="technical">Técnico</option>
                      <option value="casual">Coloquial</option>
                      <option value="motivational">Motivador</option>
                      <option value="sales">Vendedor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Misión y Visión */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-6">
                  Misión y Visión
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-neurolink-coldWhite/70 mb-2 block">
                      Misión
                    </label>
                    <textarea
                      value={cloneIdentity.mission}
                      onChange={(e) => handleUpdateIdentity('mission', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-neurolink-coldWhite/70 mb-2 block">
                      Visión
                    </label>
                    <textarea
                      value={cloneIdentity.vision}
                      onChange={(e) => handleUpdateIdentity('vision', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                      rows={3}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-neurolink-coldWhite/70">
                        Objetivos
                      </label>
                      <button
                        onClick={handleAddObjective}
                        className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {cloneIdentity.objectives.map((objective, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/40"
                        >
                          <span className="text-neurolink-coldWhite">
                            {objective}
                          </span>
                          <button
                            onClick={() => handleDeleteObjective(index)}
                            className="p-1 rounded-lg text-neurolink-coldWhite/70 hover:text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'continuous' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                Entrenamiento Continuo
              </h2>
              <p className="text-neurolink-coldWhite/70">
                El clon aprende automáticamente de tus interacciones
              </p>
            </motion.div>
          )}

          {activeTab === 'simulation' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Controles */}
              <div className="col-span-12 flex justify-end gap-4">
                <button
                  onClick={handleResetPersonality}
                  className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reiniciar Personalidad
                </button>
                <button
                  onClick={handleExportClone}
                  className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exportar Clon
                </button>
              </div>

              {/* Chat de Simulación */}
              <div className="col-span-12 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-orbitron text-neurolink-coldWhite">
                    Simulación de Chat
                  </h2>
                  <button
                    onClick={() => setShowChat(true)}
                    className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Iniciar Chat
                  </button>
                </div>
                <div className="h-[400px] bg-black/40 rounded-lg border border-neurolink-cyberBlue/30 p-6 flex flex-col">
                  <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-neurolink-matrixGreen/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-neurolink-matrixGreen" />
                      </div>
                      <div className="flex-1">
                        <p className="text-neurolink-coldWhite">
                          ¡Hola! Soy {cloneIdentity.name}. ¿En qué puedo ayudarte hoy?
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Escribe tu mensaje..."
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite pr-12"
                      />
                      <button
                        onClick={isListening ? handleStopListening : handleStartListening}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                          isListening
                            ? 'bg-red-400/20 text-red-400 animate-pulse'
                            : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30'
                        }`}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron">
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Configuración de Seguridad */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-6">
                  Configuración de Seguridad
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-black/40">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-neurolink-matrixGreen" />
                      <div>
                        <h3 className="text-neurolink-coldWhite font-orbitron">
                          Protección de Datos
                        </h3>
                        <p className="text-neurolink-coldWhite/70">
                          Encriptación de datos sensibles
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-neurolink-matrixGreen/20 p-1">
                      <div className="w-4 h-4 rounded-full bg-neurolink-matrixGreen" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-black/40">
                    <div className="flex items-center gap-3">
                      <BrainCircuit className="w-5 h-5 text-neurolink-matrixGreen" />
                      <div>
                        <h3 className="text-neurolink-coldWhite font-orbitron">
                          Registro de Interacciones
                        </h3>
                        <p className="text-neurolink-coldWhite/70">
                          Historial completo en MemoryCore
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-neurolink-matrixGreen/20 p-1">
                      <div className="w-4 h-4 rounded-full bg-neurolink-matrixGreen" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-black/40">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-neurolink-matrixGreen" />
                      <div>
                        <h3 className="text-neurolink-coldWhite font-orbitron">
                          Acceso Exclusivo
                        </h3>
                        <p className="text-neurolink-coldWhite/70">
                          Solo el propietario puede acceder
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-neurolink-matrixGreen/20 p-1">
                      <div className="w-4 h-4 rounded-full bg-neurolink-matrixGreen" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas de Uso */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-6">
                  Estadísticas de Uso
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-black/40">
                      <h3 className="text-neurolink-coldWhite/70 text-sm mb-2">
                        Interacciones Totales
                      </h3>
                      <p className="text-2xl font-orbitron text-neurolink-coldWhite">
                        1,234
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40">
                      <h3 className="text-neurolink-coldWhite/70 text-sm mb-2">
                        Tasa de Aprendizaje
                      </h3>
                      <p className="text-2xl font-orbitron text-neurolink-coldWhite">
                        98%
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40">
                      <h3 className="text-neurolink-coldWhite/70 text-sm mb-2">
                        Precisión
                      </h3>
                      <p className="text-2xl font-orbitron text-neurolink-coldWhite">
                        95%
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-black/40">
                      <h3 className="text-neurolink-coldWhite/70 text-sm mb-2">
                        Tiempo de Respuesta
                      </h3>
                      <p className="text-2xl font-orbitron text-neurolink-coldWhite">
                        0.5s
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuración de Voz */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-6">
                  Configuración de Voz
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-black/40">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-neurolink-matrixGreen" />
                      <div>
                        <h3 className="text-neurolink-coldWhite font-orbitron">
                          Habilitar Voz
                        </h3>
                        <p className="text-neurolink-coldWhite/70">
                          Activar entrada y salida por voz
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-neurolink-matrixGreen/20 p-1">
                      <div
                        className={`w-4 h-4 rounded-full bg-neurolink-matrixGreen transition-transform ${
                          voiceSettings.enabled ? 'translate-x-6' : ''
                        }`}
                        onClick={() => handleVoiceSettingsChange('enabled', !voiceSettings.enabled)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-black/40">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-neurolink-matrixGreen" />
                      <div>
                        <h3 className="text-neurolink-coldWhite font-orbitron">
                          Reproducción Automática
                        </h3>
                        <p className="text-neurolink-coldWhite/70">
                          Leer respuestas automáticamente
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-neurolink-matrixGreen/20 p-1">
                      <div
                        className={`w-4 h-4 rounded-full bg-neurolink-matrixGreen transition-transform ${
                          voiceSettings.autoSpeak ? 'translate-x-6' : ''
                        }`}
                        onClick={() => handleVoiceSettingsChange('autoSpeak', !voiceSettings.autoSpeak)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-neurolink-coldWhite/70 mb-2 block">
                        Voz
                      </label>
                      <select
                        value={voiceSettings.voice}
                        onChange={(e) => handleVoiceSettingsChange('voice', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                      >
                        {availableVoices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-neurolink-coldWhite/70 mb-2 block">
                        Velocidad
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={voiceSettings.rate}
                        onChange={(e) => handleVoiceSettingsChange('rate', parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-neurolink-coldWhite/70 text-sm">
                        {voiceSettings.rate}x
                      </span>
                    </div>

                    <div>
                      <label className="text-neurolink-coldWhite/70 mb-2 block">
                        Tono
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={voiceSettings.pitch}
                        onChange={(e) => handleVoiceSettingsChange('pitch', parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-neurolink-coldWhite/70 text-sm">
                        {voiceSettings.pitch}x
                      </span>
                    </div>

                    <div>
                      <label className="text-neurolink-coldWhite/70 mb-2 block">
                        Idioma
                      </label>
                      <select
                        value={voiceSettings.language}
                        onChange={(e) => handleVoiceSettingsChange('language', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                      >
                        <option value="es-ES">Español (España)</option>
                        <option value="es-MX">Español (México)</option>
                        <option value="en-US">English (US)</option>
                        <option value="pt-BR">Português (Brasil)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input de Archivos Oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Modal de Chat */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 p-6 w-full max-w-4xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
                  Chat con {cloneIdentity.name}
                </h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat */}
              <div className="h-[600px] bg-black/40 rounded-lg border border-neurolink-cyberBlue/30 p-6 flex flex-col">
                {/* Mensajes */}
                <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-neurolink-matrixGreen/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-neurolink-matrixGreen" />
                    </div>
                    <div className="flex-1">
                      <p className="text-neurolink-coldWhite">
                        ¡Hola! Soy {cloneIdentity.name}. ¿En qué puedo ayudarte hoy?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Escribe tu mensaje..."
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite pr-12"
                    />
                    <button
                      onClick={isListening ? handleStopListening : handleStartListening}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
                        isListening
                          ? 'bg-red-400/20 text-red-400 animate-pulse'
                          : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30'
                      }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron">
                    Enviar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Memoria */}
      <AnimatePresence>
        {showMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 p-6 w-full max-w-4xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
                  MemoryCore
                </h2>
                <button
                  onClick={() => setShowMemory(false)}
                  className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista de Entradas */}
              <div className="h-[600px] bg-black/40 rounded-lg border border-neurolink-cyberBlue/30 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {memory.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {entry.type === 'interaction' && <MessageSquare className="w-4 h-4 text-neurolink-matrixGreen" />}
                          {entry.type === 'feedback' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
                          {entry.type === 'training' && <Brain className="w-4 h-4 text-blue-400" />}
                          <span className="text-neurolink-coldWhite/70 text-sm">
                            {entry.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          entry.sentiment === 'positive'
                            ? 'bg-green-400/20 text-green-400'
                            : entry.sentiment === 'negative'
                            ? 'bg-red-400/20 text-red-400'
                            : 'bg-blue-400/20 text-blue-400'
                        }`}>
                          {entry.sentiment}
                        </div>
                      </div>
                      <p className="text-neurolink-coldWhite">
                        {entry.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NeuroCloneCore; 