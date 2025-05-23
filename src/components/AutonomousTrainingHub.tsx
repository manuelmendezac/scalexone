import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, BookOpen, Target, Brain, BadgeCheck, Star, ArrowRight, CheckCircle, MessageCircle } from 'lucide-react';

const TEMAS_EJEMPLO = ['Productividad', 'Salud Mental', 'Creatividad', 'Comunicación'];
const AREAS = [
  { nombre: 'Productividad', progreso: 80 },
  { nombre: 'Salud Mental', progreso: 60 },
  { nombre: 'Creatividad', progreso: 40 },
  { nombre: 'Comunicación', progreso: 90 }
];
const OBJETIVOS = [
  { texto: 'Completa 3 sesiones de repaso', badge: true },
  { texto: 'Lee un nuevo documento sobre creatividad', badge: false },
  { texto: 'Participa en una simulación de conversación', badge: false }
];
const MICRORRETOS = [
  'Haz un resumen de tu día en 3 frases',
  'Aplica una técnica de respiración consciente',
  'Comparte una idea creativa con tu mentor IA'
];

export const AutonomousTrainingHub: React.FC = () => {
  const [inputUsuario, setInputUsuario] = useState('');
  const [historial, setHistorial] = useState<string[]>([]);
  const [patrones, setPatrones] = useState<string[]>(['Repetición: "procrastinación"', 'Mención frecuente: "falta de foco"']);
  const [temaActivo, setTemaActivo] = useState(TEMAS_EJEMPLO[0]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [progreso, setProgreso] = useState(AREAS);
  const [objetivos, setObjetivos] = useState(OBJETIVOS);
  const [retoActual, setRetoActual] = useState(MICRORRETOS[0]);
  const [utilFeedback, setUtilFeedback] = useState<'sí' | 'no' | null>(null);

  // Simulación de escucha pasiva y registro
  const handleInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUsuario.trim()) {
      setHistorial(prev => [...prev, inputUsuario]);
      setInputUsuario('');
      setFeedback('¡Input registrado y analizado!');
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  // Simulación de retroalimentación nocturna
  const handleFeedbackUtil = (valor: 'sí' | 'no') => {
    setUtilFeedback(valor);
    setFeedback(valor === 'sí' ? '¡Gracias por tu feedback!' : 'Seguiremos mejorando tus recomendaciones');
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 backdrop-blur-xl rounded-xl border-2 border-neurolink-matrixGreen p-6 shadow-xl"
      >
        <h2 className="text-3xl font-orbitron text-neurolink-matrixGreen mb-8 flex items-center gap-3">
          <Brain className="w-8 h-8 text-neurolink-cyberBlue" />
          Autonomous Training Hub
        </h2>
        {/* 1. Ciclo de Aprendizaje Autónomo */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h3 className="text-xl font-orbitron text-neurolink-coldWhite flex items-center gap-2 mb-2">
            <Mic className="w-6 h-6 text-neurolink-matrixGreen" /> Ciclo de Aprendizaje Autónomo
          </h3>
          <form onSubmit={handleInput} className="flex gap-2 mb-2">
            <input
              type="text"
              value={inputUsuario}
              onChange={e => setInputUsuario(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-black/60 border border-neon-green text-neurolink-coldWhite font-orbitron"
              placeholder="Escribe o simula un input..."
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron"
            >Registrar</motion.button>
          </form>
          <div className="flex flex-wrap gap-2 mb-2">
            {patrones.map((p, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue text-xs font-orbitron">{p}</span>
            ))}
          </div>
          <div className="text-neurolink-coldWhite/80 text-xs mb-2">Historial cognitivo:</div>
          <div className="flex flex-wrap gap-2">
            {historial.map((h, i) => (
              <span key={i} className="px-2 py-1 rounded bg-black/60 border border-neurolink-matrixGreen/30 text-neurolink-coldWhite/80 text-xs">{h}</span>
            ))}
          </div>
        </motion.section>

        {/* 2. Curador de Conocimiento */}
        <motion.section
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h3 className="text-xl font-orbitron text-neurolink-coldWhite flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6 text-neurolink-cyberBlue" /> Curador de Conocimiento
          </h3>
          <div className="flex gap-4 mb-2">
            {TEMAS_EJEMPLO.map(t => (
              <motion.button
                key={t}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTemaActivo(t)}
                className={`px-4 py-2 rounded-lg font-orbitron border border-neurolink-cyberBlue/30 text-sm ${temaActivo === t ? 'bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue' : 'text-neurolink-coldWhite bg-black/30'}`}
              >
                {t}
              </motion.button>
            ))}
          </div>
          <div className="mb-2 text-neurolink-coldWhite/80 text-sm">Documentos organizados por tema: <span className="font-bold text-neurolink-cyberBlue">{temaActivo}</span></div>
          <div className="flex gap-4 mb-2">
            <div className="flex-1">
              <div className="text-neurolink-coldWhite/60 text-xs mb-1">Recomendaciones futuras:</div>
              <ul className="list-disc ml-6 text-neurolink-coldWhite/80 text-xs">
                <li>Leer "Hábitos Atómicos"</li>
                <li>Repasar notas de la última sesión</li>
                <li>Explorar artículo sobre {temaActivo}</li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="text-neurolink-coldWhite/60 text-xs mb-1">Progreso por área:</div>
              <ul className="space-y-1">
                {progreso.map(a => (
                  <li key={a.nombre} className="flex items-center gap-2">
                    <span className="w-24 text-xs text-neurolink-coldWhite/70">{a.nombre}</span>
                    <div className="flex-1 h-2 bg-black/40 rounded">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${a.progreso}%` }}
                        className="h-2 rounded bg-neurolink-matrixGreen"
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <span className="text-xs text-neurolink-matrixGreen font-bold">{a.progreso}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 3. Modo Misión */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h3 className="text-xl font-orbitron text-neurolink-coldWhite flex items-center gap-2 mb-2">
            <Target className="w-6 h-6 text-neurolink-matrixGreen" /> Modo Misión
          </h3>
          <div className="mb-2 text-neurolink-coldWhite/80 text-sm">Objetivos semanales generados por IA:</div>
          <ul className="mb-2 space-y-1">
            {objetivos.map((o, i) => (
              <li key={i} className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-neurolink-cyberBlue" />
                <span>{o.texto}</span>
                {o.badge && <BadgeCheck className="w-4 h-4 text-neurolink-matrixGreen" />}
              </li>
            ))}
          </ul>
          <div className="mb-2 text-neurolink-coldWhite/80 text-sm">Micro-reto de la semana:</div>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-neurolink-cyberBlue animate-pulse" />
            <span className="font-orbitron text-neurolink-matrixGreen">{retoActual}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRetoActual(MICRORRETOS[Math.floor(Math.random() * MICRORRETOS.length)])}
              className="ml-2 px-3 py-1 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue text-xs font-orbitron"
            >Nuevo reto</motion.button>
          </div>
          <div className="mb-2 text-neurolink-coldWhite/80 text-sm">Sesiones sugeridas con IA mentor:</div>
          <ul className="list-disc ml-6 text-neurolink-coldWhite/70 text-xs">
            <li>Simulación de entrevista laboral</li>
            <li>Práctica de mindfulness guiada</li>
            <li>Feedback sobre tu última presentación</li>
          </ul>
        </motion.section>

        {/* 4. Entrenamiento Contextual */}
        <motion.section
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-orbitron text-neurolink-coldWhite flex items-center gap-2 mb-2">
            <MessageCircle className="w-6 h-6 text-neurolink-cyberBlue" /> Entrenamiento Contextual
          </h3>
          <div className="mb-2 text-neurolink-coldWhite/80 text-sm">Revisión nocturna de interacciones y refuerzo:</div>
          <div className="flex gap-2 mb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFeedback('¡Sesión de repaso nocturno iniciada!')}
              className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron"
            >Iniciar repaso</motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFeedback('¡Simulación de escenario iniciada!')}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue text-neurolink-dark font-orbitron"
            >Simular escenario</motion.button>
          </div>
          <div className="mb-2 text-neurolink-coldWhite/80 text-sm">¿Esto te resultó útil?</div>
          <div className="flex gap-2 mb-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFeedbackUtil('sí')}
              className={`px-4 py-2 rounded-lg font-orbitron ${utilFeedback === 'sí' ? 'bg-neurolink-matrixGreen text-neurolink-dark' : 'bg-black/50 text-neurolink-matrixGreen border border-neurolink-matrixGreen/30'}`}
            >Sí</motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFeedbackUtil('no')}
              className={`px-4 py-2 rounded-lg font-orbitron ${utilFeedback === 'no' ? 'bg-red-500 text-white' : 'bg-black/50 text-red-400 border border-red-400/30'}`}
            >No</motion.button>
          </div>
        </motion.section>

        {/* Feedback visual */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center space-x-2 bg-neurolink-matrixGreen text-neurolink-dark"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{feedback}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 