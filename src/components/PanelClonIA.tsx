import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Edit2, Zap, MessageSquare, BookOpen, Settings, ChevronRight } from 'lucide-react';
import useNeuroState from '../store/useNeuroState';

interface Habilidad {
  id: string;
  nombre: string;
  nivel: number;
  categoria: string;
}

interface EstadoClon {
  nombre: string;
  nivelEntrenamiento: number;
  nivelConfianza: number;
  energiaCognitiva: number;
  nicho: string;
  habilidades: Habilidad[];
  ultimaConversacion: string;
  mensajeMotivador: string;
}

const PanelClonIA = () => {
  const { user } = useNeuroState();
  const [isEditing, setIsEditing] = useState(false);
  const [estadoClon, setEstadoClon] = useState<EstadoClon>({
    nombre: 'NeuroLink Alpha',
    nivelEntrenamiento: 65,
    nivelConfianza: 78,
    energiaCognitiva: 85,
    nicho: 'Inteligencia Artificial',
    habilidades: [
      { id: '1', nombre: 'Machine Learning', nivel: 80, categoria: 'IA' },
      { id: '2', nombre: 'Análisis de Datos', nivel: 75, categoria: 'Datos' },
      { id: '3', nombre: 'Procesamiento de Lenguaje', nivel: 85, categoria: 'IA' },
      { id: '4', nombre: 'Visión por Computadora', nivel: 70, categoria: 'IA' }
    ],
    ultimaConversacion: 'Análisis de tendencias en IA generativa',
    mensajeMotivador: `¡Estoy listo para ayudarte hoy, ${user?.nombre || 'Usuario'}!`
  });

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEstadoClon(prev => ({ ...prev, nombre: e.target.value }));
  };

  const renderCircularProgress = (value: number, label: string, color: string) => (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${value}, 100`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-futuristic text-neurolink-coldWhite">{value}%</span>
        <span className="text-xs text-neurolink-coldWhite/60">{label}</span>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border-2 border-neurolink-cyberBlue/30">
        {/* Encabezado con Avatar y Nombre */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative w-16 h-16"
            >
              <div className="absolute inset-0 bg-neurolink-matrixGreen/20 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-8 h-8 text-neurolink-matrixGreen" />
              </div>
            </motion.div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={estadoClon.nombre}
                  onChange={handleNombreChange}
                  onBlur={() => setIsEditing(false)}
                  className="bg-black/20 border-2 border-neurolink-matrixGreen rounded-lg px-3 py-1
                    text-neurolink-coldWhite font-futuristic focus:outline-none"
                  autoFocus
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-futuristic text-neurolink-coldWhite">
                    {estadoClon.nombre}
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20
                      text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
              <p className="text-neurolink-coldWhite/60">
                Nicho: {estadoClon.nicho}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen/20
              text-neurolink-coldWhite hover:bg-neurolink-matrixGreen/30
              transition-all flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Entrenar más</span>
          </motion.button>
        </div>

        {/* Mensaje Motivador */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-lg bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/30"
        >
          <p className="text-neurolink-coldWhite/80 italic">
            "{estadoClon.mensajeMotivador}"
          </p>
        </motion.div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {renderCircularProgress(estadoClon.nivelEntrenamiento, 'Entrenamiento', '#00ff9d')}
          {renderCircularProgress(estadoClon.nivelConfianza, 'Confianza', '#00b4ff')}
          {renderCircularProgress(estadoClon.energiaCognitiva, 'Energía', '#ff00ff')}
        </div>

        {/* Habilidades */}
        <div className="mb-8">
          <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-neurolink-matrixGreen" />
            Habilidades Aprendidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estadoClon.habilidades.map((habilidad) => (
              <motion.div
                key={habilidad.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-lg bg-black/20 border border-neurolink-cyberBlue/30"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neurolink-coldWhite">{habilidad.nombre}</span>
                  <span className="text-neurolink-coldWhite/60 text-sm">{habilidad.nivel}%</span>
                </div>
                <div className="h-2 bg-neurolink-cyberBlue/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-neurolink-matrixGreen"
                    initial={{ width: 0 }}
                    animate={{ width: `${habilidad.nivel}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Última Conversación */}
        <div className="mb-8">
          <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-neurolink-matrixGreen" />
            Última Conversación
          </h3>
          <div className="p-4 rounded-lg bg-black/20 border border-neurolink-cyberBlue/30">
            <p className="text-neurolink-coldWhite/80">
              {estadoClon.ultimaConversacion}
            </p>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/30
              text-neurolink-coldWhite flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-neurolink-matrixGreen" />
              <span>Personalizar Clon</span>
            </div>
            <ChevronRight className="w-5 h-5 text-neurolink-coldWhite/60 group-hover:text-neurolink-coldWhite" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-lg bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/30
              text-neurolink-coldWhite flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-neurolink-matrixGreen" />
              <span>Historial de Interacciones</span>
            </div>
            <ChevronRight className="w-5 h-5 text-neurolink-coldWhite/60 group-hover:text-neurolink-coldWhite" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default PanelClonIA; 