import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Brain, 
  TrendingUp, 
  Home, 
  User, 
  GraduationCap,
  ArrowRight
} from 'lucide-react';

interface ExpertMode {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
  ruta: string;
}

const EXPERT_MODES: ExpertMode[] = [
  {
    id: 'visionario',
    nombre: 'Visionario de Startups',
    descripcion: 'Domina el arte de crear y escalar empresas disruptivas con visión de futuro',
    icono: <Rocket className="w-8 h-8" />,
    color: 'from-purple-500/20 to-blue-500/20',
    ruta: '/expert/visionario'
  },
  {
    id: 'consultor_ia',
    nombre: 'Consultor de IA',
    descripcion: 'Conviértete en un experto en implementación y estrategia de IA',
    icono: <Brain className="w-8 h-8" />,
    color: 'from-green-500/20 to-cyan-500/20',
    ruta: '/expert/consultor-ia'
  },
  {
    id: 'inversionista',
    nombre: 'Inversionista Inteligente',
    descripcion: 'Aprende a tomar decisiones de inversión basadas en datos y tendencias',
    icono: <TrendingUp className="w-8 h-8" />,
    color: 'from-yellow-500/20 to-orange-500/20',
    ruta: '/expert/inversionista'
  },
  {
    id: 'bienes_raices',
    nombre: 'Experto en Bienes Raíces',
    descripcion: 'Domina el mercado inmobiliario y maximiza el valor de tus inversiones',
    icono: <Home className="w-8 h-8" />,
    color: 'from-red-500/20 to-pink-500/20',
    ruta: '/expert/bienes-raices'
  },
  {
    id: 'marca_personal',
    nombre: 'Estratega de Marca Personal',
    descripcion: 'Construye una marca personal poderosa y auténtica en la era digital',
    icono: <User className="w-8 h-8" />,
    color: 'from-blue-500/20 to-indigo-500/20',
    ruta: '/expert/marca-personal'
  },
  {
    id: 'educador',
    nombre: 'Educador Digital',
    descripcion: 'Crea experiencias de aprendizaje transformadoras en el mundo digital',
    icono: <GraduationCap className="w-8 h-8" />,
    color: 'from-cyan-500/20 to-teal-500/20',
    ruta: '/expert/educador'
  }
];

const ExpertModeSelector = () => {
  const navigate = useNavigate();
  const [modoSeleccionado, setModoSeleccionado] = useState<string | null>(null);

  const handleSeleccion = (modo: ExpertMode) => {
    setModoSeleccionado(modo.id);
    setTimeout(() => {
      navigate(modo.ruta);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-8 bg-neurolink-blackGlass"
    >
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-orbitron text-neurolink-coldWhite mb-4 flex items-center justify-center gap-3">
            <Brain className="w-8 h-8" />
            Modo Experto
          </h1>
          <p className="text-neurolink-coldWhite/70">
            Selecciona una mentalidad y déjate entrenar por IA para convertirte en el mejor
          </p>
        </div>

        {/* Grid de Modos Expertos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPERT_MODES.map((modo) => (
            <motion.div
              key={modo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${modo.color} 
                border border-neurolink-matrixGreen/30 backdrop-blur-sm`}
            >
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-neurolink-background/30 text-neurolink-coldWhite">
                    {modo.icono}
                  </div>
                  <div>
                    <h3 className="text-xl font-orbitron text-neurolink-coldWhite mb-2">
                      {modo.nombre}
                    </h3>
                    <p className="text-neurolink-coldWhite/70 text-sm">
                      {modo.descripcion}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSeleccion(modo)}
                  className={`w-full py-3 px-4 rounded-lg bg-neurolink-matrixGreen/20 
                    text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/30 
                    transition-colors flex items-center justify-center gap-2 font-orbitron`}
                >
                  Entrar al Entrenamiento
                  <ArrowRight size={16} />
                </motion.button>
              </div>

              {/* Efecto de brillo al hover */}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neurolink-matrixGreen/10 to-transparent animate-shimmer" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mensaje de Selección */}
        <AnimatePresence>
          {modoSeleccionado && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 
                bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen 
                px-6 py-3 rounded-full font-orbitron flex items-center gap-2"
            >
              <Brain size={20} />
              Preparando tu entrenamiento personalizado...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ExpertModeSelector; 