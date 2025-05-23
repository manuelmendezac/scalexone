import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { useStore } from '../store/store';
import ReactMarkdown from 'react-markdown';
import emoji from 'emoji-toolkit';
import type { Message } from '../store/useNeuroState';

interface Mensaje {
  id: string;
  tipo: 'usuario' | 'asistente' | 'sistema';
  contenido: string;
  timestamp: Date;
}

const RESPUESTAS_CONTEXTUALES = [
  "🧠 Procesando tus patrones mentales...",
  "🔍 Analizando tu perfil cognitivo...",
  "⚡ Conectando con tu rutina diaria...",
  "🎯 Sincronizando con tu visión...",
  "📊 Evaluando tu progreso actual...",
  "⚙️ Optimizando tu flujo de trabajo...",
  "💡 Integrando nuevos insights...",
  "🎮 Calibrando tu enfoque mental...",
  "🌊 Mapeando tu flujo de conciencia...",
  "🔮 Explorando nuevas posibilidades...",
  "🎨 Reorganizando tus ideas creativas...",
  "🚀 Preparando tu próximo nivel..."
];

const COMANDOS = {
  '/help': 'Muestra la lista de comandos disponibles',
  '/clear': 'Limpia la conversación actual',
  '/profile': 'Muestra información del perfil actual',
  '/status': 'Muestra el estado del sistema',
  '/voice': 'Activa/desactiva la síntesis de voz',
  '/emoji': 'Muestra la lista de emojis disponibles'
};

const NeuroConsole = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => {
    const saved = localStorage.getItem('neurolink-conversacion');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputMensaje, setInputMensaje] = useState('');
  const [estaEscribiendo, setEstaEscribiendo] = useState(false);
  const [vozActiva, setVozActiva] = useState(true);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { userName, activeProfile } = useStore();

  // Configurar síntesis de voz
  const synth = window.speechSynthesis;
  const voz = synth.getVoices().find(voice => voice.lang === 'es-ES') || 
              synth.getVoices().find(voice => voice.lang.includes('es'));

  // Cargar voces disponibles
  useEffect(() => {
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        // Las voces están cargadas
      };
    }
  }, []);

  // Guardar mensajes en localStorage
  useEffect(() => {
    localStorage.setItem('neurolink-conversacion', JSON.stringify(mensajes));
  }, [mensajes]);

  // Scroll automático
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes, estaEscribiendo]);

  const hablar = (texto: string) => {
    if (!vozActiva || !voz) return;

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.voice = voz;
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    utterance.pitch = 1;
    synth.speak(utterance);
  };

  const procesarComando = (comando: string): string | null => {
    switch (comando) {
      case '/help':
        return `Comandos disponibles:\n${Object.entries(COMANDOS)
          .map(([cmd, desc]) => `- ${cmd}: ${desc}`)
          .join('\n')}`;
      case '/clear':
        limpiarConversacion();
        return null;
      case '/profile':
        return `Perfil actual: ${activeProfile}\nUsuario: ${userName}`;
      case '/status':
        return `Estado del sistema:\n- Voz: ${vozActiva ? 'Activa' : 'Inactiva'}\n- Mensajes: ${mensajes.length}`;
      case '/voice':
        toggleVoz();
        return `Voz ${vozActiva ? 'activada' : 'desactivada'}`;
      case '/emoji':
        return 'Emojis disponibles: 🧠 🔍 ⚡ 🎯 📊 ⚙️ 💡 🎮 🌊 🔮 🎨 🚀';
      default:
        return null;
    }
  };

  const enviarMensaje = async () => {
    if (!inputMensaje.trim()) return;

    const mensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: inputMensaje,
      timestamp: new Date()
    };

    setMensajes(prev => [...prev, mensajeUsuario]);
    setInputMensaje('');
    setEstaEscribiendo(true);

    // Procesar comandos
    const comando = inputMensaje.trim().toLowerCase();
    const respuestaComando = procesarComando(comando);

    if (respuestaComando) {
      const mensajeSistema: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'sistema',
        contenido: respuestaComando,
        timestamp: new Date()
      };
      setMensajes(prev => [...prev, mensajeSistema]);
      setEstaEscribiendo(false);
      return;
    }

    // Simular respuesta del asistente
    setTimeout(() => {
      const respuestaAleatoria = RESPUESTAS_CONTEXTUALES[
        Math.floor(Math.random() * RESPUESTAS_CONTEXTUALES.length)
      ];

      const mensajeAsistente: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'asistente',
        contenido: `${respuestaAleatoria}\n\nHola ${userName}, ¿cómo puedo ayudarte hoy con tu perfil ${activeProfile}?`,
        timestamp: new Date()
      };

      setMensajes(prev => [...prev, mensajeAsistente]);
      setEstaEscribiendo(false);
      hablar(mensajeAsistente.contenido);
    }, 1500);
  };

  const limpiarConversacion = () => {
    setMensajes([]);
    localStorage.removeItem('neurolink-conversacion');
  };

  const toggleVoz = () => {
    setVozActiva(!vozActiva);
    if (vozActiva) {
      synth.cancel();
    }
  };

  const toggleAyuda = () => {
    setMostrarAyuda(!mostrarAyuda);
  };

  return (
    <div 
      className="flex flex-col h-full bg-neurolink-background border border-neurolink-matrixGreen/30 rounded-lg overflow-hidden"
      role="region"
      aria-label="NeuroConsole - Interfaz de chat"
    >
      {/* Header */}
      <div className="p-4 border-b border-neurolink-matrixGreen/30 flex justify-between items-center">
        <h2 className="font-orbitron text-neurolink-coldWhite">NeuroConsole</h2>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleAyuda}
            className="p-2 rounded-lg bg-neurolink-background/50 text-neurolink-coldWhite/50 
              hover:bg-neurolink-matrixGreen/20 hover:text-neurolink-matrixGreen transition-colors"
            aria-label="Mostrar ayuda"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVoz}
            className={`p-2 rounded-lg transition-colors
              ${vozActiva 
                ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen' 
                : 'bg-neurolink-background/50 text-neurolink-coldWhite/50'
              }`}
            aria-label={vozActiva ? "Desactivar voz" : "Activar voz"}
          >
            {vozActiva ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={limpiarConversacion}
            className="p-2 rounded-lg bg-neurolink-background/50 text-neurolink-coldWhite/50 
              hover:bg-red-500/20 hover:text-red-400 transition-colors"
            aria-label="Limpiar conversación"
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Ayuda */}
      <AnimatePresence>
        {mostrarAyuda && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-neurolink-matrixGreen/30"
          >
            <div className="p-4 bg-neurolink-background/50">
              <h3 className="font-orbitron text-neurolink-coldWhite mb-2">Comandos disponibles:</h3>
              <div className="space-y-1 text-sm text-neurolink-coldWhite/70">
                {Object.entries(COMANDOS).map(([cmd, desc]) => (
                  <div key={cmd} className="flex items-center">
                    <span className="font-mono text-neurolink-matrixGreen">{cmd}</span>
                    <span className="ml-2">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat */}
      <div 
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Historial de mensajes"
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
                className={`max-w-[80%] p-3 rounded-lg
                  ${mensaje.tipo === 'usuario'
                    ? 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                    : mensaje.tipo === 'sistema'
                    ? 'bg-neurolink-background/50 text-neurolink-coldWhite/70'
                    : 'bg-neurolink-matrixGreen/20 text-neurolink-coldWhite'
                  }`}
                role="article"
                aria-label={`Mensaje de ${mensaje.tipo}`}
              >
                <div className="font-orbitron text-sm whitespace-pre-wrap">
                  <ReactMarkdown>
                    {emoji.shortnameToUnicode(mensaje.contenido)}
                  </ReactMarkdown>
                </div>
                <div className="text-xs text-neurolink-coldWhite/50 mt-1">
                  {new Date(mensaje.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Indicador de escritura */}
        {estaEscribiendo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div 
              className="bg-neurolink-matrixGreen/20 p-3 rounded-lg"
              role="status"
              aria-label="El asistente está escribiendo"
            >
              <div className="flex space-x-1">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="w-2 h-2 bg-neurolink-matrixGreen rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2 h-2 bg-neurolink-matrixGreen rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2 h-2 bg-neurolink-matrixGreen rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-neurolink-matrixGreen/30">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={inputMensaje}
            onChange={(e) => setInputMensaje(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarMensaje();
              }
            }}
            placeholder="Escribe tu mensaje... (Usa /help para ver comandos)"
            className="flex-1 bg-neurolink-background/50 border border-neurolink-matrixGreen/30 
              rounded-lg p-3 text-neurolink-coldWhite placeholder-neurolink-coldWhite/50
              focus:outline-none focus:border-neurolink-matrixGreen font-orbitron text-sm
              resize-none min-h-[60px] max-h-[120px]"
            aria-label="Campo de entrada de mensaje"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={enviarMensaje}
            disabled={!inputMensaje.trim()}
            className={`p-3 rounded-lg transition-colors
              ${inputMensaje.trim()
                ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/30'
                : 'bg-neurolink-background/50 text-neurolink-coldWhite/30 cursor-not-allowed'
              }`}
            aria-label="Enviar mensaje"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default NeuroConsole; 