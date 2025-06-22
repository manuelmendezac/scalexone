import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Frown, Meh, Star, Zap, CheckCircle, AlertTriangle, MessageCircle, TrendingUp } from 'lucide-react';

const EMOCIONES = [
  { id: 'feliz', icon: <Smile className="w-7 h-7 text-neurolink-matrixGreen" />, label: 'Feliz', color: 'from-green-400 to-neurolink-matrixGreen' },
  { id: 'neutral', icon: <Meh className="w-7 h-7 text-neurolink-cyberBlue" />, label: 'Neutral', color: 'from-blue-400 to-neurolink-cyberBlue' },
  { id: 'triste', icon: <Frown className="w-7 h-7 text-red-400" />, label: 'Triste', color: 'from-red-400 to-pink-500' }
];

const SUGERENCIAS = [
  'Haz la respuesta más breve',
  'Agrega ejemplos',
  'Usa un tono más motivador',
  'Sé más directo',
  'Incluye recursos visuales'
];

const APRENDIZAJE_EJEMPLO = [
  { fecha: '2024-05-12 10:00', tipo: 'Emocional', detalle: 'El usuario se sintió feliz tras la respuesta.' },
  { fecha: '2024-05-12 09:45', tipo: 'Experiencia', detalle: 'Se sugirió agregar ejemplos en respuestas futuras.' },
  { fecha: '2024-05-12 09:30', tipo: 'Reverso', detalle: 'El clon ajustó su tono a motivador.' }
];

const NeuroFeedbackEngine: React.FC = () => {
  const [emocion, setEmocion] = useState<string>('feliz');
  const [intensidad, setIntensidad] = useState(7);
  const [comentario, setComentario] = useState('');
  const [satisfaccion, setSatisfaccion] = useState<number>(5);
  const [sugerencia, setSugerencia] = useState('');
  const [alerta, setAlerta] = useState<string | null>(null);
  const [aprendizaje, setAprendizaje] = useState(APRENDIZAJE_EJEMPLO);
  const [feedbackReciente, setFeedbackReciente] = useState<string | null>(null);

  // Simulación de análisis de tono y alerta
  const analizarFeedback = () => {
    if (emocion === 'triste' || satisfaccion <= 3) {
      setAlerta('¡Detectamos que la experiencia no fue óptima! El clon ajustará su tono.');
      setAprendizaje(prev => [
        { fecha: new Date().toLocaleString(), tipo: 'Reverso', detalle: 'El clon ajustó su tono a empático.' },
        ...prev
      ]);
    } else {
      setAlerta(null);
    }
    setFeedbackReciente('¡Feedback registrado y usado para mejorar el clon!');
    setTimeout(() => setFeedbackReciente(null), 2500);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl shadow-2xl p-6 relative bg-gradient-to-br ${EMOCIONES.find(e => e.id === emocion)?.color} via-black/80 to-black/90 border-2 border-neurolink-cyberBlue`}
      >
        <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-6 flex items-center gap-3">
          <Zap className="w-7 h-7 text-neurolink-matrixGreen animate-pulse" />
          NeuroFeedback Engine
        </h2>
        {/* 1. Feedback Emocional */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-2 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-neurolink-cyberBlue" /> Feedback Emocional
          </h3>
          <div className="flex gap-4 mb-2">
            {EMOCIONES.map(e => (
              <motion.button
                key={e.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEmocion(e.id)}
                className={`rounded-full p-3 border-2 font-orbitron transition-all ${emocion === e.id ? 'border-neurolink-matrixGreen bg-black/60' : 'border-transparent bg-black/30'}`}
                style={{ boxShadow: emocion === e.id ? '0 0 16px #00ff9d88' : undefined }}
              >
                {e.icon}
                <div className="text-xs mt-1 text-neurolink-coldWhite/80">{e.label}</div>
              </motion.button>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-neurolink-coldWhite/60 text-xs">Intensidad:</span>
            <input
              type="range"
              min={1}
              max={10}
              value={intensidad}
              onChange={e => setIntensidad(Number(e.target.value))}
              className="w-40 accent-neurolink-matrixGreen"
            />
            <span className="text-neurolink-matrixGreen font-bold">{intensidad}</span>
          </div>
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            className="w-full p-2 rounded-lg bg-black/60 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite mb-2"
            placeholder="¿Quieres agregar algo más sobre cómo te sentiste?"
          />
        </motion.section>

        {/* 2. Feedback de Experiencia */}
        <motion.section
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-neurolink-matrixGreen" /> Feedback de Experiencia
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-neurolink-coldWhite/60 text-xs">¿Cómo fue esta respuesta?</span>
            <input
              type="range"
              min={1}
              max={10}
              value={satisfaccion}
              onChange={e => setSatisfaccion(Number(e.target.value))}
              className="w-40 accent-neurolink-cyberBlue"
            />
            <span className="text-neurolink-cyberBlue font-bold">{satisfaccion}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {SUGERENCIAS.map(s => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSugerencia(s)}
                className={`px-3 py-1 rounded-full text-xs font-orbitron border border-neurolink-cyberBlue/30 ${sugerencia === s ? 'bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue' : 'bg-black/30 text-neurolink-coldWhite'}`}
              >
                {s}
              </motion.button>
            ))}
          </div>
          {alerta && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 mb-2"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>{alerta}</span>
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={analizarFeedback}
            className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Enviar Feedback
          </motion.button>
        </motion.section>

        {/* 3. Entrenamiento Reverso */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neurolink-cyberBlue" /> Entrenamiento Reverso
          </h3>
          <div className="mb-2 text-neurolink-coldWhite/80 text-sm">Aprendizaje reciente del clon:</div>
          <ul className="space-y-1 mb-2">
            {aprendizaje.slice(0, 5).map((a, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-neurolink-coldWhite/80">
                <span className="font-orbitron text-neurolink-cyberBlue">{a.fecha}</span>
                <span className="font-orbitron text-neurolink-matrixGreen">[{a.tipo}]</span>
                <span>{a.detalle}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Feedback visual */}
        <AnimatePresence>
          {feedbackReciente && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-2 bg-neurolink-cyberBlue text-neurolink-dark"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{feedbackReciente}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default NeuroFeedbackEngine; 