import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  Target,
  Calendar,
  FileText,
  Lightbulb,
  GitBranch,
  User,
  BookOpen,
  MessageSquare,
  Database,
  Sparkles,
  Network,
  Heart,
  LayoutDashboard,
  Upload,
  MessageCircle,
  BarChart,
  Menu,
  X,
  Search,
  Star,
  StarOff
} from 'lucide-react';

interface Modulo {
  id: string;
  nombre: string;
  icono: React.ReactNode;
  ruta: string;
  descripcion: string;
  favorito?: boolean;
}

const MODULOS: Modulo[] = [
  {
    id: 'perfil-cognitivo',
    nombre: 'Perfil Cognitivo',
    icono: <Brain className="w-5 h-5" />,
    ruta: '/perfil',
    descripcion: 'Tu perfil cognitivo personalizado'
  },
  {
    id: 'focus-mode',
    nombre: 'Focus Mode',
    icono: <Target className="w-5 h-5" />,
    ruta: '/focus',
    descripcion: 'Modo de concentración'
  },
  {
    id: 'entrenamiento',
    nombre: 'Entrenamiento Diario',
    icono: <Calendar className="w-5 h-5" />,
    ruta: '/entrenamiento',
    descripcion: 'Rutinas y ejercicios diarios'
  },
  {
    id: 'memory-core',
    nombre: 'Memory Core',
    icono: <FileText className="w-5 h-5" />,
    ruta: '/memory',
    descripcion: 'Núcleo de memoria y recuerdos'
  },
  {
    id: 'vision-planner',
    nombre: 'Vision Planner',
    icono: <Lightbulb className="w-5 h-5" />,
    ruta: '/vision',
    descripcion: 'Planificador de visión'
  },
  {
    id: 'project-timeline',
    nombre: 'Project Timeline',
    icono: <GitBranch className="w-5 h-5" />,
    ruta: '/timeline',
    descripcion: 'Línea de tiempo de proyectos'
  },
  {
    id: 'expert-mode',
    nombre: 'Expert Mode',
    icono: <User className="w-5 h-5" />,
    ruta: '/expert',
    descripcion: 'Modo experto'
  },
  {
    id: 'dynamic-profile',
    nombre: 'Dynamic Expert Profile',
    icono: <User className="w-5 h-5" />,
    ruta: '/expert/profile',
    descripcion: 'Perfil experto dinámico'
  },
  {
    id: 'mentor',
    nombre: 'NeuroLink Mentor',
    icono: <MessageSquare className="w-5 h-5" />,
    ruta: '/mentor',
    descripcion: 'Tu mentor IA personal'
  },
  {
    id: 'knowledge-vault',
    nombre: 'Knowledge Vault',
    icono: <BookOpen className="w-5 h-5" />,
    ruta: '/vault',
    descripcion: 'Bóveda de conocimiento'
  },
  {
    id: 'mind-sync',
    nombre: 'MindSync Lab',
    icono: <Sparkles className="w-5 h-5" />,
    ruta: '/lab',
    descripcion: 'Laboratorio de sincronización mental'
  },
  {
    id: 'cognitive-fusion',
    nombre: 'Cognitive Fusion Hub',
    icono: <Network className="w-5 h-5" />,
    ruta: '/fusion',
    descripcion: 'Centro de fusión cognitiva'
  },
  {
    id: 'emotion-tuner',
    nombre: 'Emotion Tuner',
    icono: <Heart className="w-5 h-5" />,
    ruta: '/emotions',
    descripcion: 'Sintonizador emocional'
  },
  {
    id: 'dashboard',
    nombre: 'Neuro Dashboard',
    icono: <LayoutDashboard className="w-5 h-5" />,
    ruta: '/dashboard',
    descripcion: 'Panel de control principal'
  },
  {
    id: 'data-connector',
    nombre: 'Data Connector',
    icono: <Upload className="w-5 h-5" />,
    ruta: '/data',
    descripcion: 'Conector de datos'
  },
  {
    id: 'realtime-sync',
    nombre: 'RealTime MindSync',
    icono: <MessageCircle className="w-5 h-5" />,
    ruta: '/sync',
    descripcion: 'Sincronización en tiempo real'
  },
  {
    id: 'insights',
    nombre: 'Neuro Insights',
    icono: <BarChart className="w-5 h-5" />,
    ruta: '/insights',
    descripcion: 'Motor de insights'
  }
];

const NeuroNavigator = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [modulos, setModulos] = useState<Modulo[]>(() => {
    const saved = localStorage.getItem('neurolink-modulos');
    return saved ? JSON.parse(saved) : MODULOS;
  });
  const [favoritos, setFavoritos] = useState<string[]>(() => {
    const saved = localStorage.getItem('neurolink-favoritos');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem('neurolink-modulos', JSON.stringify(modulos));
  }, [modulos]);

  useEffect(() => {
    localStorage.setItem('neurolink-favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleFavorito = (id: string) => {
    setFavoritos(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const modulosFiltrados = modulos.filter(modulo =>
    modulo.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modulosOrdenados = [...modulosFiltrados].sort((a, b) => {
    const aFav = favoritos.includes(a.id);
    const bFav = favoritos.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <>
      {/* Botón de toggle para móvil */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-neurolink-cyberBlue/20 
          text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
          transition-colors md:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 h-full bg-neurolink-background 
              border-r border-neurolink-cyberBlue/30 z-40
              ${isMobile ? 'w-64' : 'w-20'} 
              transition-all duration-300 ease-in-out`}
          >
            {/* Logo y título */}
            <div className="p-4 border-b border-neurolink-cyberBlue/30">
              <div className="flex items-center justify-center">
                <Brain className="w-8 h-8 text-neurolink-cyberBlue" />
                {!isMobile && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-2 font-orbitron text-neurolink-coldWhite"
                  >
                    NeuroLink
                  </motion.span>
                )}
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="p-4 border-b border-neurolink-cyberBlue/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neurolink-coldWhite/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isMobile ? "Buscar módulo..." : "..."}
                  className="w-full bg-neurolink-background/50 border border-neurolink-cyberBlue/30 
                    rounded-lg pl-9 pr-3 py-2 text-neurolink-coldWhite placeholder-neurolink-coldWhite/50
                    focus:outline-none focus:border-neurolink-cyberBlue font-orbitron text-sm"
                />
              </div>
            </div>

            {/* Lista de módulos */}
            <div className="py-4 space-y-2 overflow-y-auto h-[calc(100%-8rem)]">
              <Reorder.Group axis="y" values={modulosOrdenados} onReorder={setModulos}>
                {modulosOrdenados.map(modulo => (
                  <Reorder.Item
                    key={modulo.id}
                    value={modulo}
                    whileDrag={{ scale: 1.02, boxShadow: "0 0 10px rgba(0, 149, 255, 0.3)" }}
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`relative group cursor-pointer
                        ${location.pathname === modulo.ruta
                          ? 'bg-neurolink-cyberBlue/20'
                          : 'hover:bg-neurolink-cyberBlue/10'
                        }`}
                      onClick={() => navigate(modulo.ruta)}
                    >
                      <div className="flex items-center p-3">
                        <div className={`p-2 rounded-lg
                          ${location.pathname === modulo.ruta
                            ? 'bg-neurolink-cyberBlue/30 text-neurolink-cyberBlue'
                            : 'bg-neurolink-background/50 text-neurolink-coldWhite/70 group-hover:text-neurolink-coldWhite'
                          }`}
                        >
                          {modulo.icono}
                        </div>
                        {!isMobile && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="ml-3 flex-1"
                          >
                            <span className="font-orbitron text-sm text-neurolink-coldWhite">
                              {modulo.nombre}
                            </span>
                          </motion.div>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorito(modulo.id);
                          }}
                          className={`p-1 rounded-full
                            ${favoritos.includes(modulo.id)
                              ? 'text-yellow-400'
                              : 'text-neurolink-coldWhite/30 hover:text-yellow-400'
                            }`}
                        >
                          {favoritos.includes(modulo.id) ? (
                            <Star className="w-4 h-4" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>

                      {/* Tooltip para móvil */}
                      {isMobile && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 
                          bg-neurolink-background/90 border border-neurolink-cyberBlue/30 
                          rounded-lg p-2 opacity-0 group-hover:opacity-100 
                          transition-opacity pointer-events-none z-50"
                        >
                          <div className="font-orbitron text-sm text-neurolink-coldWhite">
                            {modulo.nombre}
                          </div>
                          <div className="text-xs text-neurolink-coldWhite/70">
                            {modulo.descripcion}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para móvil */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default NeuroNavigator; 