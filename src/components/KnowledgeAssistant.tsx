import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Brain } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  from: 'user' | 'ai' | 'assistant';
  timestamp: Date;
}

const KnowledgeAssistant = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const exampleResponses = [
    "Este documento menciona lo que estás buscando en la sección 2.",
    "Aquí hay un párrafo relevante sobre tu pregunta...",
    "Tus notas contienen información que puede ayudarte con esto.",
    "Según tus documentos, la respuesta está relacionada con...",
    "He encontrado una referencia interesante en tus archivos..."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isProcessing) return;

    // Agregar pregunta del usuario
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      from: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsProcessing(true);

    // Simular procesamiento
    setTimeout(() => {
      const randomResponse = exampleResponses[Math.floor(Math.random() * exampleResponses.length)];
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        from: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-black/30 rounded-xl p-6 border-2 border-neurolink-matrixGreen">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-2"
          >
            <Brain className="w-8 h-8 text-neurolink-matrixGreen" />
            <h2 className="text-2xl font-futuristic text-neurolink-coldWhite">
              Asistente de Conocimiento Personalizado
            </h2>
          </motion.div>
          <p className="text-neurolink-coldWhite/60">
            Responde con base en tus documentos cargados
          </p>
        </div>

        {/* Historial de Mensajes */}
        <div className="h-[400px] overflow-y-auto mb-6 space-y-4 pr-4 custom-scrollbar">
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
                  <p className="text-xs text-neurolink-coldWhite/40 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-neurolink-matrixGreen/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-neurolink-matrixGreen" />
                  <p className="text-neurolink-coldWhite/60 text-sm">
                    Leyendo archivos relacionados...
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de Pregunta */}
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Escribe tu pregunta aquí..."
            className="flex-1 bg-black/20 border-2 border-neurolink-cyberBlue/30 rounded-lg px-4 py-3
              text-neurolink-coldWhite placeholder-neurolink-coldWhite/40 focus:outline-none
              focus:border-neurolink-matrixGreen transition-all"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isProcessing || !question.trim()}
            className="bg-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/80 text-neurolink-coldWhite
              px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center space-x-2"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>Preguntar</span>
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeAssistant; 