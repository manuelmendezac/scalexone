import { useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Target, 
  Menu,
  X,
  Moon,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useTheme } from '../context/themeContext';
import { FaChartBar, FaCog, FaBook, FaRocket, FaUsers, FaChalkboardTeacher, FaHome } from 'react-icons/fa';

const navItems: { path: string; label: string; icon: JSX.Element }[] = [
  // { path: '/centro-entrenamiento', label: 'Centro de Entrenamiento', icon: <LayoutDashboard className="w-5 h-5" /> },
  {
    label: 'Clasificación',
    icon: <FaChartBar />,
    path: '/clasificacion',
  },
  {
    label: 'Configuración',
    icon: <FaCog />,
    path: '/configuracion-admin',
  },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { mode, setMode } = useTheme();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-neurolink-background/80 backdrop-blur-lg border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para móvil */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        className={`fixed top-0 left-0 h-screen w-64 bg-neurolink-background/95 backdrop-blur-lg border-r border-neurolink-cyberBlue/30 z-40
          md:translate-x-0 md:relative`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-neurolink-cyberBlue/30">
            <h1 className="text-2xl font-orbitron text-neurolink-coldWhite">
              NeuroLink AI
            </h1>
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-neurolink-cyberBlue/20 text-neurolink-matrixGreen'
                      : 'text-neurolink-coldWhite/70 hover:text-neurolink-matrixGreen hover:bg-neurolink-cyberBlue/10'
                    }`
                }
              >
                {item.icon}
                <span className="font-orbitron">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Selector de modo rápido */}
          <div className="p-4 border-t border-neurolink-cyberBlue/30">
            <h2 className="text-sm font-orbitron text-neurolink-coldWhite/50 mb-3">
              Modo Actual
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => setMode('productivity')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                  ${mode === 'productivity'
                    ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                    : 'text-neurolink-coldWhite/70 hover:text-neurolink-matrixGreen hover:bg-neurolink-cyberBlue/10'
                  }`}
              >
                <Brain className="w-5 h-5" />
                <span className="font-orbitron">Productividad</span>
              </button>
              <button
                onClick={() => setMode('focus')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                  ${mode === 'focus'
                    ? 'bg-blue-400/20 text-blue-400'
                    : 'text-neurolink-coldWhite/70 hover:text-blue-400 hover:bg-neurolink-cyberBlue/10'
                  }`}
              >
                <Target className="w-5 h-5" />
                <span className="font-orbitron">Enfoque</span>
              </button>
              <button
                onClick={() => setMode('sleep')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                  ${mode === 'sleep'
                    ? 'bg-purple-400/20 text-purple-400'
                    : 'text-neurolink-coldWhite/70 hover:text-purple-400 hover:bg-neurolink-cyberBlue/10'
                  }`}
              >
                <Moon className="w-5 h-5" />
                <span className="font-orbitron">Sueño</span>
              </button>
            </div>
          </div>

          {/* Botón de cerrar sesión */}
          <div className="p-4 border-t border-neurolink-cyberBlue/30">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neurolink-coldWhite/70 
                hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-orbitron">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar; 