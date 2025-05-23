import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Search, Building2, ShoppingCart, Megaphone, Wallet, Cpu, GraduationCap, Rocket, Sparkles } from 'lucide-react';

interface Nicho {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactNode;
  categoria: string;
  conocimientos: string[];
}

const nichos: Nicho[] = [
  {
    id: 'bienes-raices',
    nombre: 'Bienes Raíces',
    descripcion: 'Inversiones inmobiliarias y gestión de propiedades',
    icono: <Building2 className="w-6 h-6" />,
    categoria: 'inversiones',
    conocimientos: [
      'Análisis de mercado inmobiliario',
      'Estrategias de inversión',
      'Gestión de propiedades',
      'Negociación inmobiliaria'
    ]
  },
  {
    id: 'ecommerce',
    nombre: 'E-commerce',
    descripcion: 'Comercio electrónico y ventas online',
    icono: <ShoppingCart className="w-6 h-6" />,
    categoria: 'ventas',
    conocimientos: [
      'Plataformas de e-commerce',
      'Marketing digital',
      'Logística y envíos',
      'Gestión de inventario'
    ]
  },
  {
    id: 'marketing-digital',
    nombre: 'Marketing Digital',
    descripcion: 'Estrategias digitales y crecimiento online',
    icono: <Megaphone className="w-6 h-6" />,
    categoria: 'marketing',
    conocimientos: [
      'SEO y SEM',
      'Redes sociales',
      'Contenido digital',
      'Analítica web'
    ]
  },
  {
    id: 'finanzas',
    nombre: 'Finanzas Personales',
    descripcion: 'Gestión financiera y planificación',
    icono: <Wallet className="w-6 h-6" />,
    categoria: 'finanzas',
    conocimientos: [
      'Inversiones',
      'Presupuesto personal',
      'Gestión de deudas',
      'Planificación financiera'
    ]
  },
  {
    id: 'ia',
    nombre: 'Inteligencia Artificial',
    descripcion: 'Desarrollo y aplicación de IA',
    icono: <Cpu className="w-6 h-6" />,
    categoria: 'tecnologia',
    conocimientos: [
      'Machine Learning',
      'Deep Learning',
      'Procesamiento de lenguaje',
      'Visión por computadora'
    ]
  },
  {
    id: 'coaching',
    nombre: 'Coaching/Mentoría',
    descripcion: 'Desarrollo personal y profesional',
    icono: <Sparkles className="w-6 h-6" />,
    categoria: 'desarrollo',
    conocimientos: [
      'Liderazgo',
      'Comunicación efectiva',
      'Gestión de equipos',
      'Desarrollo personal'
    ]
  },
  {
    id: 'educacion',
    nombre: 'Educación Online',
    descripcion: 'Aprendizaje y enseñanza digital',
    icono: <GraduationCap className="w-6 h-6" />,
    categoria: 'educacion',
    conocimientos: [
      'Diseño instruccional',
      'Plataformas educativas',
      'Gamificación',
      'Evaluación online'
    ]
  },
  {
    id: 'startups',
    nombre: 'Startups Tecnológicas',
    descripcion: 'Emprendimiento e innovación',
    icono: <Rocket className="w-6 h-6" />,
    categoria: 'tecnologia',
    conocimientos: [
      'Lean Startup',
      'Venture Capital',
      'Producto digital',
      'Escalabilidad'
    ]
  }
];

const categorias = Array.from(new Set(nichos.map(nicho => nicho.categoria)));

const SelectorNicho = () => {
  const [selectedNicho, setSelectedNicho] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  const filteredNichos = nichos.filter(nicho => {
    const matchesSearch = nicho.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nicho.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || nicho.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  const handleNichoSelect = (nichoId: string) => {
    setSelectedNicho(nichoId);
  };

  const handleTrain = async (nichoId: string) => {
    setIsTraining(true);
    // Simular entrenamiento
    setTimeout(() => {
      setIsTraining(false);
    }, 2000);
  };

  return (
    <div className="w-full">
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border-2 border-neurolink-cyberBlue/30">
        <h2 className="text-xl font-futuristic text-neurolink-coldWhite mb-6 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-neurolink-matrixGreen" />
          Selecciona tu Nicho
        </h2>

        {/* Búsqueda y Filtros */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neurolink-coldWhite/60" />
            <input
              type="text"
              placeholder="Buscar nicho..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/20 border-2 border-neurolink-cyberBlue/30
                rounded-lg text-neurolink-coldWhite placeholder-neurolink-coldWhite/40
                focus:outline-none focus:border-neurolink-matrixGreen transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categorias.map(categoria => (
              <motion.button
                key={categoria}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategoria(selectedCategoria === categoria ? null : categoria)}
                className={`px-3 py-1 rounded-lg text-sm transition-all
                  ${selectedCategoria === categoria
                    ? 'bg-neurolink-matrixGreen/20 text-neurolink-coldWhite border-2 border-neurolink-matrixGreen'
                    : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite'
                  }
                `}
              >
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Grid de Nichos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNichos.map((nicho) => (
            <motion.div
              key={nicho.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNichoSelect(nicho.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                ${selectedNicho === nicho.id
                  ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                  : 'border-neurolink-cyberBlue/30 bg-black/20 hover:border-neurolink-cyberBlue/60'
                }
              `}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-matrixGreen">
                  {nicho.icono}
                </div>
                <div>
                  <h3 className="font-futuristic text-neurolink-coldWhite">
                    {nicho.nombre}
                  </h3>
                  <p className="text-sm text-neurolink-coldWhite/60">
                    {nicho.descripcion}
                  </p>
                </div>
              </div>

              {/* Conocimientos Iniciales */}
              <AnimatePresence>
                {selectedNicho === nicho.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3"
                  >
                    <p className="text-sm text-neurolink-coldWhite/80">
                      Conocimientos iniciales cargados:
                    </p>
                    <ul className="space-y-2">
                      {nicho.conocimientos.map((conocimiento, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-2 text-sm text-neurolink-coldWhite/60"
                        >
                          <div className="w-1 h-1 rounded-full bg-neurolink-matrixGreen" />
                          <span>{conocimiento}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrain(nicho.id);
                      }}
                      disabled={isTraining}
                      className="w-full mt-4 py-2 rounded-lg bg-neurolink-matrixGreen/20
                        text-neurolink-coldWhite hover:bg-neurolink-matrixGreen/30
                        transition-all disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center space-x-2"
                    >
                      {isTraining ? (
                        <>
                          <Brain className="w-4 h-4 animate-spin" />
                          <span>Entrenando...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4" />
                          <span>Entrenar clon IA en este nicho</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectorNicho; 