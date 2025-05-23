import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  Bot,
  User,
  Loader2,
  Sparkles,
  Brain,
  Target,
  Calendar
} from 'lucide-react';

interface Mensaje {
  id: string;
  tipo: 'usuario' | 'ia';
  contenido: string;
  timestamp: Date;
  estado?: 'escribiendo' | 'completado';
}

const COMANDOS = {
  '/resumen': {
    respuesta: 'Generando resumen de tu actividad reciente...',
    accion: () => 'Aquí está tu resumen de hoy:\n- 3 tareas completadas\n- 2 nuevos insights\n- 1 proyecto actualizado'
  },
  '/plan': {
    respuesta: 'Analizando tus objetivos y creando un plan...',
    accion: () => 'Plan sugerido para hoy:\n1. Revisar tareas pendientes\n2. Continuar con el proyecto X\n3. Actualizar documentación'
  },
  '/estado': {
    respuesta: 'Consultando tu estado actual...',
    accion: () => 'Estado actual:\n- Energía: 85%\n- Productividad: 90%\n- Tareas pendientes: 5'
  }
};

const RealTimeMindSync = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState('');
  const [estaEscribiendo, setEstaEscribiendo] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Enfoque automático al input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const procesarComando = (texto: string) => {
    const comando = Object.keys(COMANDOS).find(cmd => texto.startsWith(cmd));
    if (comando) {
      return {
        respuesta: COMANDOS[comando as keyof typeof COMANDOS].respuesta,
        accion: COMANDOS[comando as keyof typeof COMANDOS].accion
      };
    }
    return null;
  };

  const enviarMensaje = async () => {
    if (!input.trim()) return;

    const mensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: input,
      timestamp: new Date()
    };

    setMensajes(prev => [...prev, mensajeUsuario]);
    setInput('');
    setEstaEscribiendo(true);

    // Simular respuesta de la IA
    const comando = procesarComando(input);
    if (comando) {
      // Mensaje de "escribiendo..."
      const mensajeEscribiendo: Mensaje = {
        id: 'escribiendo',
        tipo: 'ia',
        contenido: comando.respuesta,
        timestamp: new Date(),
        estado: 'escribiendo'
      };
      setMensajes(prev => [...prev, mensajeEscribiendo]);

      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reemplazar mensaje de "escribiendo" con respuesta final
      setMensajes(prev => prev.filter(m => m.id !== 'escribiendo'));
      const mensajeIA: Mensaje = {
        id: Date.now().toString(),
        tipo: 'ia',
        contenido: comando.accion(),
        timestamp: new Date(),
        estado: 'completado'
      };
      setMensajes(prev => [...prev, mensajeIA]);
    } else {
      // Respuesta genérica
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mensajeIA: Mensaje = {
        id: Date.now().toString(),
        tipo: 'ia',
        contenido: 'Entiendo tu mensaje. ¿En qué más puedo ayudarte?',
        timestamp: new Date(),
        estado: 'completado'
      };
      setMensajes(prev => [...prev, mensajeIA]);
    }

    setEstaEscribiendo(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <div className="flex flex-col h-full bg-neurolink-background">
      {/* Header */}
      <div className="p-4 border-b border-neurolink-cyberBlue/30">
        <h2 className="text-xl font-orbitron text-neurolink-coldWhite">
          MindSync en Tiempo Real
        </h2>
        <p className="text-sm text-neurolink-coldWhite/70">
          Conectado y sincronizado con tu IA personal
        </p>
      </div>

      {/* Chat */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <AnimatePresence>
          {mensajes.map(mensaje => (
            <motion.div
              key={mensaje.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${mensaje.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  mensaje.tipo === 'usuario'
                    ? 'bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue'
                    : 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {mensaje.tipo === 'usuario' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span className="text-xs opacity-70">
                    {mensaje.tipo === 'usuario' ? 'Tú' : 'IA'}
                  </span>
                </div>
                <div className="whitespace-pre-wrap">
                  {mensaje.contenido}
                </div>
                {mensaje.estado === 'escribiendo' && (
                  <div className="flex items-center gap-1 mt-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-xs">escribiendo...</span>
                  </div>
                )}
                <div className="text-xs opacity-50 mt-2">
                  {new Date(mensaje.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neurolink-cyberBlue/30">
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-neurolink-cyberBlue/20 
              text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
              transition-colors"
          >
            <Mic className="w-5 h-5" />
          </motion.button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje o usa comandos como /resumen, /plan..."
            className="flex-1 px-4 py-2 rounded-lg bg-neurolink-background/50 
              border border-neurolink-cyberBlue/30 text-neurolink-coldWhite 
              placeholder-neurolink-coldWhite/50 focus:outline-none 
              focus:border-neurolink-cyberBlue"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={enviarMensaje}
            disabled={!input.trim() || estaEscribiendo}
            className={`p-2 rounded-lg transition-colors ${
              !input.trim() || estaEscribiendo
                ? 'bg-neurolink-cyberBlue/10 text-neurolink-cyberBlue/50'
                : 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/30'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-neurolink-coldWhite/50">
          <Sparkles className="w-3 h-3" />
          <span>Comandos disponibles: /resumen, /plan, /estado</span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMindSync; 