import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, User, MessageCircle, BookOpen, Brain, ArrowRight } from 'lucide-react';
import useSmartOnboardingStore from '../store/useSmartOnboardingStore';

const steps = [
  'intro',
  'name',
  'style',
  'knowledge',
  'role',
  'summary',
];

const communicationStyles = [
  { id: 'formal', label: 'Formal', icon: '👔' },
  { id: 'amigable', label: 'Amigable', icon: '😊' },
  { id: 'visionario', label: 'Visionario', icon: '🔮' },
  { id: 'coach', label: 'Coach', icon: '🎯' },
  { id: 'tecnico', label: 'Técnico', icon: '⚙️' },
];

const roles = [
  { id: 'mentor', label: 'Mentor', icon: '🧑‍🏫' },
  { id: 'gestor', label: 'Gestor de tareas', icon: '📋' },
  { id: 'terapeuta', label: 'Terapeuta', icon: '🧘' },
  { id: 'asistente', label: 'Asistente personal', icon: '🤖' },
  { id: 'otro', label: 'Otro', icon: '✨' },
];

const knowledgeAreas = [
  { id: 'negocios', label: 'Negocios', icon: '💼' },
  { id: 'tecnologia', label: 'Tecnología', icon: '💻' },
  { id: 'salud', label: 'Salud', icon: '🧬' },
  { id: 'creatividad', label: 'Creatividad', icon: '🎨' },
  { id: 'otro', label: 'Otro', icon: '📚' },
];

const SmartOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const store = useSmartOnboardingStore();

  // Manejo de respuestas y avance
  const handleNext = (value: any) => {
    switch (steps[step]) {
      case 'name':
        store.setName(value);
        break;
      case 'style':
        store.setStyle(value);
        break;
      case 'knowledge':
        store.setKnowledge(value);
        break;
      case 'role':
        store.setRole(value);
        break;
      default:
        break;
    }
    setInput('');
    setStep((prev) => prev + 1);
  };

  // Subida de documentos (simulado)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      store.setKnowledgeDoc(e.target.files[0].name);
      setShowUpload(false);
      setTimeout(() => setStep((prev) => prev + 1), 800);
    }
  };

  // Redirección al finalizar
  React.useEffect(() => {
    if (step === steps.length - 1) {
      setTimeout(() => navigate('/clasificacion'), 1500);
    }
  }, [step, navigate]);

  // Renderizado de mensajes tipo chat
  const renderChat = () => {
    switch (steps[step]) {
      case 'intro':
        return (
          <ChatBubble
            icon={<Sparkles className="text-neurolink-cyan" />}>
            Hola, te ayudaré a crear tu clon inteligente personalizado en minutos 🚀
          </ChatBubble>
        );
      case 'name':
        return (
          <>
            <ChatBubble icon={<User className="text-neurolink-cyan" />}>
              ¿Cómo quieres llamar a tu clon?
            </ChatBubble>
            <UserInput
              placeholder="Ej: Neo, Athena, Mentor..."
              value={input}
              onChange={setInput}
              onSend={() => input.trim() && handleNext(input)}
            />
          </>
        );
      case 'style':
        return (
          <>
            <ChatBubble icon={<MessageCircle className="text-neonPink" />}>
              ¿Qué estilo de comunicación prefieres?
            </ChatBubble>
            <QuickButtons options={communicationStyles} onSelect={handleNext} />
          </>
        );
      case 'knowledge':
        return (
          <>
            <ChatBubble icon={<BookOpen className="text-neurolink-cyan" />}>
              ¿En qué áreas deseas que tu clon sea experto?
            </ChatBubble>
            <QuickButtons options={knowledgeAreas} onSelect={(val) => {
              if (val === 'otro') setShowUpload(true);
              else handleNext(val);
            }} />
            {showUpload && (
              <div className="mt-4 flex flex-col items-center">
                <input type="file" onChange={handleFileUpload} className="mb-2" />
                <button onClick={() => setShowUpload(false)} className="text-sm text-neurolink-cyan underline">Cancelar</button>
              </div>
            )}
          </>
        );
      case 'role':
        return (
          <>
            <ChatBubble icon={<Brain className="text-neurolink-cyan" />}>
              ¿Qué rol esperas que cumpla tu clon?
            </ChatBubble>
            <QuickButtons options={roles} onSelect={handleNext} />
          </>
        );
      case 'summary':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <ChatBubble icon={<ArrowRight className="text-neurolink-cyan" />}>
              ¡Listo! Tu clon se llamará <b className="text-neurolink-cyan">{store.name}</b>, tendrá un estilo <b className="text-neurolink-cyan">{store.style}</b>, será experto en <b className="text-neurolink-cyan">{store.knowledge}</b> y actuará como <b className="text-neurolink-cyan">{store.role}</b>.
            </ChatBubble>
            <div className="text-center text-neurolink-cyan font-orbitron animate-pulse">Redirigiendo a tu espacio personal...</div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-neurolink-background to-neurolink-violet p-4">
      <ProgressBar step={step} total={steps.length - 1} />
      <div className="w-full max-w-md mx-auto rounded-xl shadow-2xl bg-black/60 backdrop-blur-lg border border-neurolink-cyan/30 p-6 mt-8">
        <AnimatePresence mode="wait">{renderChat()}</AnimatePresence>
      </div>
    </div>
  );
};

// Componentes auxiliares
const ChatBubble: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="flex items-start gap-3 mb-4"
  >
    {icon && <div className="w-8 h-8 flex items-center justify-center text-neurolink-cyan text-2xl">{icon}</div>}
    <div className="bg-gradient-to-r from-neurolink-cyan/20 to-neurolink-violet/20 rounded-2xl px-4 py-3 text-neurolink-coldWhite font-orbitron shadow-lg border border-neurolink-cyan/10">
      {children}
    </div>
  </motion.div>
);

const UserInput: React.FC<{ placeholder: string; value: string; onChange: (v: string) => void; onSend: () => void }> = ({ placeholder, value, onChange, onSend }) => (
  <div className="flex items-center gap-2 mt-4">
    <input
      className="flex-1 p-3 rounded-lg bg-black/40 border border-neurolink-cyan/30 text-neurolink-coldWhite font-orbitron focus:outline-none focus:border-neurolink-cyan"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onSend()}
      autoFocus
    />
    <button
      onClick={onSend}
      className="p-3 rounded-full bg-neurolink-cyan hover:bg-neurolink-violet transition-colors text-black font-bold shadow-lg"
    >
      <ArrowRight />
    </button>
  </div>
);

const QuickButtons: React.FC<{ options: { id: string; label: string; icon: string }[]; onSelect: (id: string) => void }> = ({ options, onSelect }) => (
  <div className="flex flex-wrap gap-3 mt-4">
    {options.map(opt => (
      <button
        key={opt.id}
        onClick={() => onSelect(opt.label)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neurolink-cyan/30 to-neurolink-violet/30 text-neurolink-coldWhite font-orbitron border border-neurolink-cyan/20 hover:scale-105 transition-transform shadow"
      >
        <span className="text-xl">{opt.icon}</span> {opt.label}
      </button>
    ))}
  </div>
);

const ProgressBar: React.FC<{ step: number; total: number }> = ({ step, total }) => (
  <div className="w-full max-w-md mx-auto h-2 bg-neurolink-background rounded-full overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-neurolink-cyan to-neurolink-violet"
      initial={{ width: 0 }}
      animate={{ width: `${(step / total) * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

export default SmartOnboarding; 