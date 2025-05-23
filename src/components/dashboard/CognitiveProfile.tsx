import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, Zap, Edit2, Save, Plus, X } from 'lucide-react';

interface ValorFundamental {
  id: string;
  texto: string;
}

const ESTILOS_APRENDIZAJE = [
  { id: 'visual', label: 'Visual', icon: '👁️' },
  { id: 'auditivo', label: 'Auditivo', icon: '👂' },
  { id: 'kinestesico', label: 'Kinestésico', icon: '🤲' }
];

const CognitiveProfile = () => {
  const [objetivo, setObjetivo] = useState('Maximizar productividad y bienestar mental');
  const [editandoObjetivo, setEditandoObjetivo] = useState(false);
  const [valoresFundamentales, setValoresFundamentales] = useState<ValorFundamental[]>([
    { id: '1', texto: 'Disciplina' },
    { id: '2', texto: 'Creatividad' },
    { id: '3', texto: 'Resiliencia' }
  ]);
  const [nuevoValor, setNuevoValor] = useState('');
  const [estiloAprendizaje, setEstiloAprendizaje] = useState('visual');
  const [nivelEnergia, setNivelEnergia] = useState(75);
  const [nivelEnfoque, setNivelEnfoque] = useState(80);
  const [procesando, setProcesando] = useState(false);

  const agregarValor = () => {
    if (nuevoValor.trim()) {
      setValoresFundamentales([
        ...valoresFundamentales,
        { id: Date.now().toString(), texto: nuevoValor.trim() }
      ]);
      setNuevoValor('');
    }
  };

  const eliminarValor = (id: string) => {
    setValoresFundamentales(valoresFundamentales.filter(v => v.id !== id));
  };

  const actualizarPerfil = () => {
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
    }, 2000);
  };

  const getColorNivel = (nivel: number) => {
    if (nivel >= 80) return 'text-green-400';
    if (nivel >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-8 bg-neurolink-background"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-orbitron text-neurolink-coldWhite mb-8 flex items-center gap-3">
          <Brain className="w-8 h-8" />
          Perfil Cognitivo
        </h1>

        {/* Panel Principal */}
        <div className="space-y-6">
          {/* Objetivo Principal */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="p-6 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-orbitron text-neurolink-coldWhite flex items-center gap-2">
                <Target className="w-5 h-5" />
                Objetivo Principal
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditandoObjetivo(!editandoObjetivo)}
                className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30"
              >
                <Edit2 size={20} />
              </motion.button>
            </div>
            {editandoObjetivo ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30 
                    text-neurolink-coldWhite focus:outline-none focus:border-neurolink-cyberBlue"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditandoObjetivo(false)}
                  className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30"
                >
                  <Save size={20} />
                </motion.button>
              </div>
            ) : (
              <p className="text-neurolink-coldWhite/80">{objetivo}</p>
            )}
          </motion.div>

          {/* Valores Fundamentales */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30"
          >
            <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
              Valores Fundamentales
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {valoresFundamentales.map((valor) => (
                <motion.div
                  key={valor.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-neurolink-cyberBlue/20 text-neurolink-coldWhite"
                >
                  <span>{valor.texto}</span>
                  <button
                    onClick={() => eliminarValor(valor.id)}
                    className="text-neurolink-coldWhite/50 hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoValor}
                onChange={(e) => setNuevoValor(e.target.value)}
                placeholder="Añadir valor..."
                className="flex-1 px-4 py-2 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30 
                  text-neurolink-coldWhite placeholder-neurolink-coldWhite/50 focus:outline-none focus:border-neurolink-cyberBlue"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={agregarValor}
                className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30"
              >
                <Plus size={20} />
              </motion.button>
            </div>
          </motion.div>

          {/* Estilo de Aprendizaje */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30"
          >
            <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
              Estilo de Aprendizaje
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {ESTILOS_APRENDIZAJE.map((estilo) => (
                <motion.button
                  key={estilo.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEstiloAprendizaje(estilo.id)}
                  className={`p-4 rounded-lg border text-center ${
                    estiloAprendizaje === estilo.id
                      ? 'bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue border-neurolink-cyberBlue'
                      : 'bg-neurolink-background/50 text-neurolink-coldWhite/70 border-neurolink-cyberBlue/30'
                  }`}
                >
                  <div className="text-2xl mb-2">{estilo.icon}</div>
                  <div className="font-orbitron">{estilo.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Niveles de Energía y Enfoque */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-lg bg-neurolink-background/50 border border-neurolink-cyberBlue/30"
          >
            <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Niveles Actuales
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-neurolink-coldWhite/80">Energía</span>
                  <span className={getColorNivel(nivelEnergia)}>{nivelEnergia}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={nivelEnergia}
                  onChange={(e) => setNivelEnergia(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-neurolink-background/50 appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neurolink-cyberBlue"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-neurolink-coldWhite/80">Enfoque</span>
                  <span className={getColorNivel(nivelEnfoque)}>{nivelEnfoque}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={nivelEnfoque}
                  onChange={(e) => setNivelEnfoque(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-neurolink-background/50 appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neurolink-cyberBlue"
                />
              </div>
            </div>
          </motion.div>

          {/* Botón de Actualización */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={actualizarPerfil}
              disabled={procesando}
              className="px-8 py-3 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue 
                hover:bg-neurolink-cyberBlue/30 transition-colors disabled:opacity-50"
            >
              {procesando ? 'Procesando...' : 'Actualizar Perfil'}
            </motion.button>
          </motion.div>

          {/* Mensaje de Procesamiento */}
          <AnimatePresence>
            {procesando && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center text-neurolink-coldWhite/60"
              >
                <p>Procesando patrón cognitivo...</p>
                <p className="text-sm">Recomendaciones personalizadas en curso...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CognitiveProfile; 