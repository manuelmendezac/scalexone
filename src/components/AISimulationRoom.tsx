import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useNeuroState from '../store/useNeuroState';
import type { Message } from '../store/useNeuroState';

const AISimulationRoom = () => {
  const { userName } = useNeuroState();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFormal, setIsFormal] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const aiResponses = [
    "Analizando tus pensamientos...",
    "Accediendo a tus patrones de enfoque...",
    "Tu versión optimizada sugiere esto hoy...",
    "Basado en tu perfil cognitivo...",
    "Según tu matriz de conocimiento...",
    "Considerando tus habilidades..."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      from: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simular respuesta de IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        from: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setIsTyping(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-8">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-futuristic text-neurolink-coldWhite">
            Conversación con tu Clon IA: NeuroLink Alpha
          </h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsFormal(!isFormal)}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 hover:bg-neurolink-cyberBlue/30 transition-colors text-neurolink-coldWhite"
            >
              {isFormal ? 'Tono Formal' : 'Tono Informal'}
            </button>
            <button
              onClick={resetConversation}
              className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen/20 hover:bg-neurolink-matrixGreen/30 transition-colors text-neurolink-coldWhite"
            >
              Reiniciar
            </button>
          </div>
        </div>

        {/* Área de Chat */}
        <div className="h-[60vh] overflow-y-auto mb-6 space-y-4 p-4 bg-black/30 rounded-lg">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.from === 'user'
                      ? 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                      : 'bg-neurolink-matrixGreen/20 text-neurolink-coldWhite'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs text-neurolink-coldWhite/60 mt-2 block">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-neurolink-matrixGreen/20 p-4 rounded-lg text-neurolink-coldWhite">
                <span className="typing-animation">Escribiendo</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensaje */}
        <div className="flex space-x-4">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 p-4 rounded-lg bg-black/30 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite resize-none"
            rows={3}
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-2 rounded-lg bg-neurolink-cyberBlue/20 hover:bg-neurolink-cyberBlue/30 transition-colors text-neurolink-coldWhite self-end"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISimulationRoom; 