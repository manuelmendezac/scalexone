import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  Brain, 
  Send, 
  X, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  BookOpen,
  Target,
  User,
  Bot,
  Loader2
} from 'lucide-react';

interface Mensaje {
  id: string;
  texto: string;
  esIA: boolean;
  timestamp: Date;
  estado?: 'enviando' | 'procesando' | 'completado';
}

interface AccionRapida {
  id: string;
  titulo: string;
  icono: React.ReactNode;
  accion: () => void;
}

const FRASES_PROCESAMIENTO = [
  'Analizando tu perfil cognitivo...',
  'Evaluando estrategias óptimas...',
  'Procesando patrones de aprendizaje...',
  'Sintonizando con tu estilo de pensamiento...',
  'Optimizando recomendaciones...'
];

const NeuroLinkMentor = () => {
  const { modo } = useParams<{ modo: string }>();
  const [visible, setVisible] = useState(true);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [procesando, setProcesando] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Mensaje de bienvenida inicial
  useEffect(() => {
    const mensajeBienvenida: Mensaje = {
      id: Date.now().toString(),
      texto: `¡Hola! Soy tu mentor de IA especializado en ${obtenerTituloModo(modo)}. Estoy aquí para guiarte en tu camino hacia la excelencia. ¿En qué puedo ayudarte hoy?`,
      esIA: true,
      timestamp: new Date(),
      estado: 'completado' as const
    };
    setMensajes([mensajeBienvenida]);
  }, [modo]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  const obtenerTituloModo = (modo: string | undefined) => {
    const modos: Record<string, string> = {
      visionario: 'emprendimiento y startups',
      consultor_ia: 'consultoría en IA',
      inversionista: 'inversión inteligente',
      bienes_raices: 'bienes raíces',
      marca_personal: 'marca personal',
      educador: 'educación digital'
    };
    return modos[modo || ''] || 'este campo';
  };

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    const mensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      texto: nuevoMensaje,
      esIA: false,
      timestamp: new Date(),
      estado: 'completado'
    };

    setMensajes(prev => [...prev, mensajeUsuario]);
    setNuevoMensaje('');
    setProcesando(true);

    // Simular procesamiento de IA
    const mensajeProcesando: Mensaje = {
      id: (Date.now() + 1).toString(),
      texto: FRASES_PROCESAMIENTO[Math.floor(Math.random() * FRASES_PROCESAMIENTO.length)],
      esIA: true,
      timestamp: new Date(),
      estado: 'procesando'
    };

    setMensajes(prev => [...prev, mensajeProcesando]);

    // Simular respuesta de IA después de un delay
    setTimeout(() => {
      const respuestaIA: Mensaje = {
        id: (Date.now() + 2).toString(),
        texto: generarRespuestaIA(nuevoMensaje, modo),
        esIA: true,
        timestamp: new Date(),
        estado: 'completado'
      };

      setMensajes(prev => prev.filter(m => m.id !== mensajeProcesando.id).concat(respuestaIA));
      setProcesando(false);
    }, 2000);
  };

  const generarRespuestaIA = (mensaje: string, modo: string | undefined): string => {
    // Aquí iría la lógica real de IA
    const respuestas: Record<string, string[]> = {
      visionario: [
        'Como visionario, debes enfocarte en identificar oportunidades disruptivas. ¿Has considerado el impacto de la IA en tu modelo de negocio?',
        'La clave del éxito en startups está en la validación temprana. Te sugiero comenzar con un MVP y validar con usuarios reales.',
        'Recuerda que la escalabilidad es crucial. ¿Cómo planeas automatizar tus procesos con IA?'
      ],
      consultor_ia: [
        'Como consultor de IA, es crucial mantenerte actualizado con las últimas tendencias. ¿Qué frameworks estás explorando actualmente?',
        'La implementación exitosa de IA requiere un balance entre tecnología y estrategia de negocio.',
        'Considera el impacto ético de tus recomendaciones. ¿Cómo abordas la privacidad y el sesgo en tus proyectos?'
      ],
      // ... más respuestas para otros modos
    };

    const respuestasModo = respuestas[modo || ''] || [
      'Entiendo tu pregunta. Vamos a explorar esto juntos.',
      'Excelente punto. Permíteme guiarte en este aspecto.',
      'Basado en tu perfil, te sugiero enfocarte en...'
    ];

    return respuestasModo[Math.floor(Math.random() * respuestasModo.length)];
  };

  const accionesRapidas: AccionRapida[] = [
    {
      id: 'guia',
      titulo: 'Guía mi siguiente paso',
      icono: <Target className="w-5 h-5" />,
      accion: () => {
        setNuevoMensaje('¿Cuál debería ser mi siguiente paso en este módulo?');
        enviarMensaje();
      }
    },
    {
      id: 'resumen',
      titulo: 'Resumen de lo aprendido',
      icono: <BookOpen className="w-5 h-5" />,
      accion: () => {
        setNuevoMensaje('¿Podrías darme un resumen de los conceptos clave que he aprendido hasta ahora?');
        enviarMensaje();
      }
    },
    {
      id: 'tarea',
      titulo: 'Recomiéndame una tarea',
      icono: <Lightbulb className="w-5 h-5" />,
      accion: () => {
        setNuevoMensaje('¿Qué tarea práctica me recomiendas para reforzar lo aprendido?');
        enviarMensaje();
      }
    }
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed right-4 bottom-4 w-96 h-[600px] bg-neurolink-background/80 
            backdrop-blur-lg rounded-xl border border-neurolink-cyberBlue/30 
            shadow-lg shadow-neurolink-cyberBlue/20 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-neurolink-cyberBlue/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-neurolink-cyberBlue/20">
                <Brain className="w-5 h-5 text-neurolink-cyberBlue" />
              </div>
              <h3 className="font-orbitron text-neurolink-coldWhite">
                Mentor NeuroLink
              </h3>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20 
                text-neurolink-coldWhite/70 hover:text-neurolink-coldWhite"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat */}
          <div 
            ref={chatRef}
            className="h-[400px] overflow-y-auto p-4 space-y-4"
          >
            {mensajes.map((mensaje) => (
              <motion.div
                key={mensaje.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${mensaje.esIA ? 'justify-start' : 'justify-end'}`}
              >
                {mensaje.esIA && (
                  <div className="p-2 rounded-lg bg-neurolink-cyberBlue/20">
                    <Bot className="w-5 h-5 text-neurolink-cyberBlue" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-xl ${
                  mensaje.esIA 
                    ? 'bg-neurolink-background/50 text-neurolink-coldWhite' 
                    : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                }`}>
                  {mensaje.estado === 'procesando' ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">{mensaje.texto}</span>
                    </div>
                  ) : (
                    <p className="text-sm">{mensaje.texto}</p>
                  )}
                </div>
                {!mensaje.esIA && (
                  <div className="p-2 rounded-lg bg-neurolink-cyberBlue/20">
                    <User className="w-5 h-5 text-neurolink-cyberBlue" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Acciones Rápidas */}
          <div className="p-4 border-t border-neurolink-cyberBlue/30">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {accionesRapidas.map((accion) => (
                <motion.button
                  key={accion.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={accion.accion}
                  className="p-2 rounded-lg bg-neurolink-background/50 
                    text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/20 
                    transition-colors flex flex-col items-center gap-1"
                >
                  {accion.icono}
                  <span className="text-xs">{accion.titulo}</span>
                </motion.button>
              ))}
            </div>

            {/* Input de Mensaje */}
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 rounded-lg bg-neurolink-background/50 
                  border border-neurolink-cyberBlue/30 text-neurolink-coldWhite 
                  placeholder-neurolink-coldWhite/50 focus:outline-none 
                  focus:border-neurolink-cyberBlue"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={enviarMensaje}
                disabled={procesando}
                className="p-2 rounded-lg bg-neurolink-cyberBlue/20 
                  text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
                  transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Botón para mostrar el chat */}
      {!visible && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setVisible(true)}
          className="fixed right-4 bottom-4 p-3 rounded-full bg-neurolink-cyberBlue/20 
            text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
            transition-colors shadow-lg"
        >
          <Brain className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default NeuroLinkMentor; 