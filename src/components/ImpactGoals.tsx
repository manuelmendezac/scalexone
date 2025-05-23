import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  CheckCircle2, 
  Lightbulb,
  TrendingUp,
  Zap,
  BookOpen,
  Users,
  Video,
  Clock
} from 'lucide-react';

interface Objetivo {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'aprendizaje' | 'negocio' | 'productividad' | 'reflexion';
  completado: boolean;
  icono: string;
}

const ImpactGoals = () => {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de objetivos desde IA
    setTimeout(() => {
      const objetivosIniciales: Objetivo[] = [
        {
          id: '1',
          titulo: 'Finalizar módulo de aprendizaje en IA',
          descripcion: 'Completar el último capítulo sobre redes neuronales y realizar el proyecto práctico',
          tipo: 'aprendizaje',
          completado: false,
          icono: 'BookOpen'
        },
        {
          id: '2',
          titulo: 'Contactar a 2 prospectos clave',
          descripcion: 'Agendar llamadas con los leads más prometedores del pipeline',
          tipo: 'negocio',
          completado: false,
          icono: 'Users'
        },
        {
          id: '3',
          titulo: 'Grabar un video educativo',
          descripcion: 'Crear contenido sobre las últimas tendencias en IA para tu canal',
          tipo: 'productividad',
          completado: false,
          icono: 'Video'
        },
        {
          id: '4',
          titulo: 'Reflexionar sobre avances',
          descripcion: 'Dedicar 10 minutos a analizar el progreso semanal y ajustar objetivos',
          tipo: 'reflexion',
          completado: false,
          icono: 'Clock'
        }
      ];

      setObjetivos(objetivosIniciales);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleToggleObjetivo = (id: string) => {
    setObjetivos(prev =>
      prev.map(obj =>
        obj.id === id
          ? { ...obj, completado: !obj.completado }
          : obj
      )
    );
  };

  const getIcono = (nombre: string) => {
    switch (nombre) {
      case 'BookOpen': return <BookOpen className="w-6 h-6" />;
      case 'Users': return <Users className="w-6 h-6" />;
      case 'Video': return <Video className="w-6 h-6" />;
      case 'Clock': return <Clock className="w-6 h-6" />;
      case 'Lightbulb': return <Lightbulb className="w-6 h-6" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      default: return <Target className="w-6 h-6" />;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'aprendizaje': return 'text-blue-400';
      case 'negocio': return 'text-green-400';
      case 'productividad': return 'text-purple-400';
      case 'reflexion': return 'text-yellow-400';
      default: return 'text-neurolink-matrixGreen';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border-2 border-neurolink-cyberBlue/30">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-futuristic text-neurolink-coldWhite mb-2 flex items-center justify-center">
            <Brain className="w-7 h-7 mr-2 text-neurolink-matrixGreen" />
            Objetivos de Alto Impacto para Hoy
          </h2>
          <p className="text-neurolink-coldWhite/60">
            Analizando tus metas cognitivas y prioridades...
          </p>
        </div>

        {/* Lista de Objetivos */}
        <div className="space-y-4">
          <AnimatePresence>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-neurolink-coldWhite/60"
              >
                Cargando objetivos...
              </motion.div>
            ) : (
              objetivos.map((objetivo, index) => (
                <motion.div
                  key={objetivo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-black/20 border-2 border-neurolink-cyberBlue/30
                    hover:border-neurolink-matrixGreen/50 transition-all group
                    hover:shadow-lg hover:shadow-neurolink-matrixGreen/10"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${getColorTipo(objetivo.tipo)}`}>
                      {getIcono(objetivo.icono)}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-futuristic text-neurolink-coldWhite
                        ${objetivo.completado ? 'line-through opacity-50' : ''}`}>
                        {objetivo.titulo}
                      </h3>
                      <p className="text-neurolink-coldWhite/60 mt-1">
                        {objetivo.descripcion}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleObjetivo(objetivo.id)}
                      className={`p-2 rounded-lg transition-all
                        ${objetivo.completado
                          ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                          : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite'
                        }`}
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ImpactGoals; 