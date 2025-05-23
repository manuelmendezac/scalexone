import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, BookOpen, Upload, Zap, Mic, MicOff, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    icon: <User className="w-7 h-7 text-[#00FFE0]" />, text: '¡Bienvenido a NeuroLink AI! Te ayudaré a configurar tu clon...', action: 'Crear perfil',
  },
  {
    icon: <BookOpen className="w-7 h-7 text-[#00FFE0]" />, text: 'Elige tu nicho o área de especialidad para tu clon.', action: 'Elegir nicho',
  },
  {
    icon: <Upload className="w-7 h-7 text-[#00FFE0]" />, text: 'Carga documentos o información relevante para entrenar tu clon.', action: 'Cargar documentos',
  },
  {
    icon: <Zap className="w-7 h-7 text-[#00FFE0]" />, text: '¡Listo! Ahora puedes probar la simulación IA.', action: 'Probar simulación IA',
  },
];

const OnboardingAssistant: React.FC = () => {
  const [step, setStep] = useState(0);
  const [audioOn, setAudioOn] = useState(true);
  const [listening, setListening] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  // TTS: Hablar el texto del paso actual
  const speak = (text: string) => {
    if (!audioOn || !window.speechSynthesis) return;
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // Hablar al cambiar de paso
  useEffect(() => {
    if (audioOn) speak(STEPS[step].text);
    // eslint-disable-next-line
  }, [step, audioOn]);

  // Botón de audio on/off
  const toggleAudio = () => {
    setAudioOn((on) => {
      if (on) window.speechSynthesis.cancel();
      return !on;
    });
  };

  // Reconocimiento de voz (Web Speech API)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      if (transcript.includes('siguiente')) nextStep();
      if (transcript.includes('repetir')) speak(STEPS[step].text);
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
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  // Barra de progreso
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative rounded-2xl bg-[#181A20]/80 border-2 border-[#00FFE0] shadow-xl p-6 font-orbitron backdrop-blur-md"
      >
        {/* Barra de progreso */}
        <div className="flex items-center mb-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className={`rounded-full border-2 ${i <= step ? 'border-[#00FFE0] bg-[#00FFE0]' : 'border-[#23272F] bg-[#23272F]'} w-7 h-7 flex items-center justify-center text-white`}>{i < step ? <CheckCircle className="w-5 h-5 text-[#181A20]" /> : s.icon}</div>
              {i < STEPS.length - 1 && <div className="h-1 w-full bg-[#23272F]" />}
            </div>
          ))}
        </div>
        {/* Burbuja asistente */}
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-full bg-[#00FFE0] p-2 shadow-lg">
              {STEPS[step].icon}
            </div>
            <span className="text-lg text-[#00FFE0] font-bold">Asistente IA</span>
          </div>
          <div className="bg-[#23272F]/80 rounded-xl px-6 py-4 text-[#9EFFC9] text-center mb-4 shadow-md">
            {STEPS[step].text}
          </div>
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-[#00FFE0] text-[#181A20] rounded-full font-bold hover:bg-[#9EFFC9] transition-colors mb-2"
            disabled={step === STEPS.length - 1}
          >
            {STEPS[step].action}
          </button>
          <div className="flex gap-2 mt-2">
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-full border-2 ${audioOn ? 'border-[#00FFE0]' : 'border-[#23272F]'} bg-[#181A20] text-[#00FFE0]`}
              title={audioOn ? 'Desactivar audio' : 'Activar audio'}
            >
              {audioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            {'webkitSpeechRecognition' in window && (
              <button
                onClick={listening ? stopListening : startListening}
                className={`p-2 rounded-full border-2 ${listening ? 'border-[#9EFFC9]' : 'border-[#23272F]'} bg-[#181A20] text-[#00FFE0]`}
                title={listening ? 'Detener voz' : 'Activar voz'}
              >
                <Zap className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OnboardingAssistant; 