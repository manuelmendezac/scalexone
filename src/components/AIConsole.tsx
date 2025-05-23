import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Loader2, Brain, Target, Moon } from 'lucide-react';
import useNeuroState from '../store/useNeuroState';
import { useModeEffects } from '../hooks/useModeEffects';
import type { Message } from '../store/useNeuroState';

const RESPUESTAS_POR_MODO = {
  productivity: [
    "Detectando tus prioridades del día...",
    "Agenda optimizada. Te recomiendo empezar con el informe financiero.",
    "Analizando tu productividad. Sugerencias personalizadas en camino.",
    "Modo productividad activado. ¿Qué tarea quieres priorizar?"
  ],
  focus: [
    "Activando entorno sin distracciones...",
    "No hay notificaciones. Puedes concentrarte en una sola tarea.",
    "Modo enfoque: Minimizando elementos visuales.",
    "Entorno optimizado para máxima concentración."
  ],
  sleep: [
    "Entrando en modo descanso...",
    "IA pausada. Me reactivaré cuando tú lo digas.",
    "Descansando. Vuelve cuando estés listo.",
    "Modo sueño activado. Buenas noches."
  ]
};

const AIConsole = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage } = useNeuroState();
  const { 
    isInputEnabled, 
    currentMessage, 
    isFocusMode,
    isSleepMode,
    isProductivityMode,
    shouldShowAnimations,
    shouldShowLongResponses,
    showFloatingMessage,
    floatingMessage
  } = useModeEffects();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getRandomResponse = (mode: string) => {
    const responses = RESPUESTAS_POR_MODO[mode as keyof typeof RESPUESTAS_POR_MODO];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isInputEnabled) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    // Simular respuesta de IA con longitud adaptada al modo
    setTimeout(() => {
      let response: string;
      
      if (isSleepMode) {
        response = getRandomResponse('sleep');
      } else if (isFocusMode) {
        response = getRandomResponse('focus');
      } else if (isProductivityMode) {
        response = getRandomResponse('productivity');
      } else {
        response = shouldShowLongResponses
          ? `He procesado tu mensaje: "${userMessage}"\n\nPuedo ayudarte con más detalles si lo necesitas.`
          : `Procesado: "${userMessage}"`;
      }
      
      addMessage({
        text: response,
        from: 'ai'
      });
      setIsProcessing(false);
    }, 1000);
  };

  const toggleVoiceInput = () => {
    if (!isInputEnabled) return;
    setIsListening(!isListening);
    // Aquí iría la lógica de reconocimiento de voz
  };

  const getModeIcon = () => {
    if (isProductivityMode) return <Brain className="w-5 h-5" />;
    if (isFocusMode) return <Target className="w-5 h-5" />;
    if (isSleepMode) return <Moon className="w-5 h-5" />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-4xl mx-auto bg-neurolink-background/50 backdrop-blur-lg rounded-lg border p-4 relative
        ${isFocusMode 
          ? 'border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
          : isProductivityMode
          ? 'border-neurolink-matrixGreen/50 shadow-[0_0_15px_rgba(0,255,0,0.2)]'
          : isSleepMode
          ? 'border-purple-400/50 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
          : 'border-neurolink-matrixGreen/30'
        }
        ${isSleepMode ? 'opacity-70' : ''}`}
    >
      {isSleepMode && (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20 pointer-events-none" />
      )}

      <div className="h-[400px] overflow-y-auto mb-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={shouldShowAnimations ? { opacity: 0, y: 10 } : undefined}
              animate={shouldShowAnimations ? { opacity: 1, y: 0 } : undefined}
              exit={shouldShowAnimations ? { opacity: 0, y: -10 } : undefined}
              className={`flex ${message.text === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.text === 'user'
                    ? 'bg-neurolink-matrixGreen/20 text-coldWhite'
                    : `bg-neurolink-background/80 text-coldWhite border ${
                        isFocusMode
                          ? 'border-blue-400/30'
                          : isProductivityMode
                          ? 'border-neurolink-matrixGreen/30'
                          : isSleepMode
                          ? 'border-purple-400/30'
                          : 'border-neurolink-matrixGreen/30'
                      }`
                }`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {currentMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-4 font-orbitron flex items-center justify-center gap-2"
        >
          {getModeIcon()}
          <span className={
            isFocusMode
              ? 'text-blue-400'
              : isProductivityMode
              ? 'text-neurolink-matrixGreen'
              : isSleepMode
              ? 'text-purple-400'
              : 'text-neurolink-matrixGreen'
          }>
            {currentMessage}
          </span>
        </motion.div>
      )}

      {showFloatingMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
            bg-purple-900/30 backdrop-blur-md px-6 py-3 rounded-lg text-purple-200 
            font-orbitron text-lg shadow-lg"
        >
          {floatingMessage}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!isInputEnabled || isProcessing}
          placeholder={
            isSleepMode
              ? "Modo descanso activado"
              : isFocusMode
              ? "Escribe tu tarea principal..."
              : isProductivityMode
              ? "¿Qué quieres optimizar hoy?"
              : "Escribe tu mensaje..."
          }
          className={`flex-1 bg-neurolink-background/30 text-coldWhite border rounded-lg px-4 py-2 focus:outline-none
            ${isFocusMode
              ? 'border-blue-400/30 focus:border-blue-400'
              : isProductivityMode
              ? 'border-neurolink-matrixGreen/30 focus:border-neurolink-matrixGreen'
              : isSleepMode
              ? 'border-purple-400/30 focus:border-purple-400'
              : 'border-neurolink-matrixGreen/30 focus:border-neurolink-matrixGreen'
            }
            disabled:opacity-50`}
        />
        <button
          type="button"
          onClick={toggleVoiceInput}
          disabled={!isInputEnabled}
          className={`p-2 rounded-lg ${
            isListening
              ? 'bg-red-500/20 text-red-400'
              : isFocusMode
              ? 'bg-blue-400/20 text-blue-400'
              : isProductivityMode
              ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
              : isSleepMode
              ? 'bg-purple-400/20 text-purple-400'
              : 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
          } hover:bg-opacity-30 transition-all disabled:opacity-50`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button
          type="submit"
          disabled={!input.trim() || !isInputEnabled || isProcessing}
          className={`p-2 rounded-lg ${
            isFocusMode
              ? 'bg-blue-400/20 text-blue-400'
              : isProductivityMode
              ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
              : isSleepMode
              ? 'bg-purple-400/20 text-purple-400'
              : 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
          } hover:bg-opacity-30 transition-all disabled:opacity-50`}
        >
          {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </motion.div>
  );
};

export default AIConsole; 