import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, User, LayoutDashboard, Brain, Zap, BookOpen, CheckCircle } from 'lucide-react';

const ONBOARDING_KEY = 'neurolink_welcome_onboarding';

const STEPS = [
  {
    icon: <User className="w-7 h-7 text-[#00FFE0]" />,
    text: (name: string) => `¡Bienvenido a NeuroLink AI, ${name || 'usuario'}! Soy tu asistente y te guiaré en tu primer recorrido.`,
    input: false
  },
  {
    icon: <LayoutDashboard className="w-7 h-7 text-[#00FFE0]" />,
    text: () => 'En NeuroLink AI tienes acceso a módulos como IA, Nicho, Dashboard y Perfil Cognitivo.',
    input: false
  },
  {
    icon: <BookOpen className="w-7 h-7 text-[#00FFE0]" />,
    text: () => '¿Cuál es tu nicho o área de interés principal? (Puedes decirlo o escribirlo)',
    input: true
  },
  {
    icon: <Brain className="w-7 h-7 text-[#00FFE0]" />,
    text: (name: string, niche: string) => `¡Perfecto! ${name ? name + ',' : ''} tu clon se especializará en ${niche}. ¿Listo para explorar el Dashboard y personalizar tu perfil?`,
    input: false
  },
  {
    icon: <CheckCircle className="w-7 h-7 text-[#00FFE0]" />,
    text: () => '¡Onboarding completado! Puedes repetirlo desde Configuración cuando quieras.',
    input: false
  }
];

const WelcomeOnboarding: React.FC<{ userName?: string }> = ({ userName }) => {
  const [step, setStep] = useState(0);
  const [niche, setNiche] = useState('');
  const [input, setInput] = useState('');
  const [audioOn, setAudioOn] = useState(true);
  const [listening, setListening] = useState(false);
  const [completed, setCompleted] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Persistencia
  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY) === 'true';
    setCompleted(done);
  }, []);

  // TTS
  const speak = (text: string) => {
    if (!audioOn || !window.speechSynthesis) return;
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // Hablar al cambiar de paso
  useEffect(() => {
    if (audioOn && !completed) {
      const t = STEPS[step].text(userName || '', niche);
      speak(t);
    }
    // eslint-disable-next-line
  }, [step, audioOn, completed]);

  // Reconocimiento de voz
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (step === 2) {
        setNiche(transcript);
        setInput(transcript);
        setTimeout(() => setStep(step + 1), 800);
      }
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
    recognitionRef.current = recognition;
  };
  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  };

  // Avanzar paso
  const nextStep = () => {
    if (step === 2 && input) {
      setNiche(input);
      setInput('');
      setTimeout(() => setStep(step + 1), 400);
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setCompleted(true);
    }
  };

  // Saltar
  const skip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setCompleted(true);
  };

  if (completed) return null;

  const currentText = STEPS[step].text(userName || '', niche);

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative rounded-2xl bg-[#181A20]/80 border-2 border-[#00FFE0] shadow-xl p-6 font-orbitron backdrop-blur-md"
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {STEPS[step].icon}
            <span className="text-lg text-[#00FFE0] font-bold">Asistente IA</span>
          </div>
          <button
            onClick={skip}
            className="text-[#9EFFC9] hover:text-[#00FFE0] text-sm border border-[#00FFE0] rounded px-3 py-1"
          >
            Saltar guía
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div className="bg-[#23272F]/80 rounded-xl px-6 py-4 text-[#9EFFC9] text-center mb-4 shadow-md w-full">
            {currentText}
          </div>
          {STEPS[step].input && (
            <div className="flex flex-col sm:flex-row gap-2 w-full justify-center mb-2">
              <input
                className="flex-1 px-4 py-2 rounded-lg border-2 border-[#00FFE0] bg-[#181A20] text-[#00FFE0] font-orbitron focus:outline-none"
                placeholder="Escribe tu nicho o interés..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && nextStep()}
                autoFocus
              />
              {'webkitSpeechRecognition' in window && (
                <button
                  onClick={listening ? stopListening : startListening}
                  className={`px-4 py-2 rounded-lg border-2 ${listening ? 'border-[#9EFFC9]' : 'border-[#00FFE0]'} bg-[#181A20] text-[#00FFE0] font-orbitron`}
                  title={listening ? 'Detener voz' : 'Hablar'}
                >
                  {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
            </div>
          )}
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-[#00FFE0] text-[#181A20] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors mt-2"
          >
            {step === STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
        {/* Barra de progreso */}
        <div className="flex items-center mt-6">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className={`rounded-full border-2 ${i <= step ? 'border-[#00FFE0] bg-[#00FFE0]' : 'border-[#23272F] bg-[#23272F]'} w-7 h-7 flex items-center justify-center text-white`}>{i < step ? <CheckCircle className="w-5 h-5 text-[#181A20]" /> : null}</div>
              {i < STEPS.length - 1 && <div className="h-1 w-full bg-[#23272F]" />}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeOnboarding; 