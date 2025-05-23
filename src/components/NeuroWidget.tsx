import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Send, Mic, MicOff, Settings, X, MessageSquare } from 'lucide-react';
import { useStore } from '../store/store';

const RESPUESTAS_CONTEXTUALES = [
  'Analizando tu perfil cognitivo...',
  'Procesando tu consulta con IA avanzada...',
  'Generando respuesta personalizada...',
  'Adaptando la respuesta a tu estilo de aprendizaje...'
];

export const NeuroWidget: React.FC = () => {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [vozActiva, setVozActiva] = useState(false);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const synth = useRef<SpeechSynthesis | null>(null);
  // @ts-ignore
  const recognition = useRef<SpeechRecognition | null>(null);

  const {
    widgetConfig,
    mensajesWidget,
    agregarMensajeWidget,
    actualizarMensajeWidget,
    setWidgetConfig
  } = useStore();

  useEffect(() => {
    synth.current = window.speechSynthesis;
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.lang = 'es-ES';
      // @ts-ignore
      recognition.current.onresult = (event: any) => {
        const texto = event.results[0][0].transcript;
        setMensaje(texto);
        enviarMensaje(texto);
      };
      // @ts-ignore
      recognition.current.onerror = (event: any) => {
        // ... lógica existente ...
      };
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajesWidget]);

  const enviarMensaje = async (texto: string) => {
    if (!texto.trim()) return;

    // Agregar mensaje del usuario
    agregarMensajeWidget({
      contenido: texto,
      tipo: 'usuario',
      estado: 'enviado'
    });

    setMensaje('');
    setEscribiendo(true);

    // Simular respuesta de IA
    setTimeout(() => {
      const respuesta = RESPUESTAS_CONTEXTUALES[Math.floor(Math.random() * RESPUESTAS_CONTEXTUALES.length)];
      agregarMensajeWidget({
        contenido: respuesta,
        tipo: 'ia',
        estado: 'enviado'
      });

      // Reproducir respuesta por voz si está activa
      if (vozActiva && synth.current) {
        const utterance = new SpeechSynthesisUtterance(respuesta);
        utterance.lang = 'es-ES';
        synth.current.speak(utterance);
      }

      setEscribiendo(false);
    }, 1500);
  };

  const toggleVoz = () => {
    if (!recognition.current) return;

    if (vozActiva) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
    setVozActiva(!vozActiva);
  };

  const getPosicionClase = () => {
    switch (widgetConfig.posicion) {
      case 'inferior-derecha':
        return 'bottom-4 right-4';
      case 'inferior-izquierda':
        return 'bottom-4 left-4';
      case 'superior-derecha':
        return 'top-4 right-4';
      case 'superior-izquierda':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPosicionClase()} z-50`}>
      {/* Botón flotante */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setAbierto(!abierto)}
        className={`p-4 rounded-full shadow-lg ${
          widgetConfig.modo === 'oscuro' ? 'bg-neurolink-dark' : 'bg-white'
        }`}
        style={{ border: `2px solid ${widgetConfig.color}` }}
      >
        <Zap className="w-6 h-6" style={{ color: widgetConfig.color }} />
      </motion.button>

      {/* Widget de chat */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`absolute ${widgetConfig.posicion.includes('derecha') ? 'right-0' : 'left-0'} 
              bottom-16 w-80 rounded-lg shadow-xl overflow-hidden
              ${widgetConfig.modo === 'oscuro' ? 'bg-neurolink-dark/90' : 'bg-white/90'} 
              backdrop-blur-sm border border-neurolink-neonBlue`}
          >
            {/* Encabezado */}
            <div className="p-4 border-b border-neurolink-neonBlue/30 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" style={{ color: widgetConfig.color }} />
                <span className="font-orbitron" style={{ color: widgetConfig.color }}>
                  {widgetConfig.nombreClon}
                </span>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMostrarConfig(!mostrarConfig)}
                  className="p-1 rounded-lg hover:bg-neurolink-neonBlue/10"
                >
                  <Settings className="w-4 h-4 text-neurolink-neonBlue" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setAbierto(false)}
                  className="p-1 rounded-lg hover:bg-neurolink-neonBlue/10"
                >
                  <X className="w-4 h-4 text-neurolink-neonBlue" />
                </motion.button>
              </div>
            </div>

            {/* Configuración */}
            <AnimatePresence>
              {mostrarConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 border-b border-neurolink-neonBlue/30"
                >
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-neurolink-coldWhite/70">Color</label>
                      <input
                        type="color"
                        value={widgetConfig.color}
                        onChange={(e) => setWidgetConfig({ color: e.target.value })}
                        className="w-full h-8 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-neurolink-coldWhite/70">Mensaje de bienvenida</label>
                      <input
                        type="text"
                        value={widgetConfig.mensajeBienvenida}
                        onChange={(e) => setWidgetConfig({ mensajeBienvenida: e.target.value })}
                        className="w-full p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-neonBlue/30"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-neurolink-coldWhite/70">Modo</label>
                      <select
                        value={widgetConfig.modo}
                        onChange={(e) => setWidgetConfig({ modo: e.target.value as 'claro' | 'oscuro' })}
                        className="w-full p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-neonBlue/30"
                      >
                        <option value="claro">Claro</option>
                        <option value="oscuro">Oscuro</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat */}
            <div
              ref={chatRef}
              className="h-80 overflow-y-auto p-4 space-y-4"
            >
              {mensajesWidget.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.tipo === 'usuario'
                        ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                        : 'bg-neurolink-dark/50 text-neurolink-coldWhite'
                    }`}
                  >
                    {msg.contenido}
                  </div>
                </motion.div>
              ))}
              {escribiendo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-neurolink-dark/50 text-neurolink-coldWhite p-3 rounded-lg">
                    Escribiendo...
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neurolink-neonBlue/30">
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleVoz}
                  className={`p-2 rounded-lg ${
                    vozActiva
                      ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                      : 'bg-neurolink-dark/50 text-neurolink-neonBlue'
                  }`}
                >
                  {vozActiva ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </motion.button>
                <input
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensaje(mensaje)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-neonBlue/30
                    text-neurolink-coldWhite placeholder-neurolink-coldWhite/50"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => enviarMensaje(mensaje)}
                  className="p-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 