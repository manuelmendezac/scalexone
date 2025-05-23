import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Target,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Settings,
  Bell,
  User
} from 'lucide-react';
import EmotionTuner from '../components/emotions/EmotionTuner';
import MindSyncLab from '../components/labs/MindSyncLab';
import ProjectTimeline from '../components/dashboard/ProjectTimeline';
import FocusMode from '../components/focus/FocusMode';
import NeuroLinkMentor from '../components/mentor/NeuroLinkMentor';

interface Widget {
  id: string;
  titulo: string;
  icono: React.ReactNode;
  componente: React.ReactNode;
  colapsado: boolean;
}

const NeuroDashboard = () => {
  const [nombreUsuario, setNombreUsuario] = useState('Usuario');
  const [saludo, setSaludo] = useState('');
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'emociones',
      titulo: 'Estado Emocional',
      icono: <Brain className="w-5 h-5" />,
      componente: <EmotionTuner />,
      colapsado: false
    },
    {
      id: 'sugerencias',
      titulo: 'Sugerencias Cognitivas',
      icono: <Sparkles className="w-5 h-5" />,
      componente: <MindSyncLab />,
      colapsado: false
    },
    {
      id: 'proyectos',
      titulo: 'Proyectos Activos',
      icono: <Target className="w-5 h-5" />,
      componente: <ProjectTimeline />,
      colapsado: false
    },
    {
      id: 'focus',
      titulo: 'Focus del Día',
      icono: <Clock className="w-5 h-5" />,
      componente: <FocusMode />,
      colapsado: false
    },
    {
      id: 'mentor',
      titulo: 'Mentor IA',
      icono: <User className="w-5 h-5" />,
      componente: <NeuroLinkMentor />,
      colapsado: false
    }
  ]);

  // Generar saludo según la hora del día
  useEffect(() => {
    const hora = new Date().getHours();
    let nuevoSaludo = '';
    
    if (hora >= 5 && hora < 12) {
      nuevoSaludo = 'Buenos días';
    } else if (hora >= 12 && hora < 18) {
      nuevoSaludo = 'Buenas tardes';
    } else {
      nuevoSaludo = 'Buenas noches';
    }

    setSaludo(nuevoSaludo);
  }, []);

  const toggleWidget = (id: string) => {
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === id ? { ...widget, colapsado: !widget.colapsado } : widget
      )
    );
  };

  return (
    <div className="w-full min-h-screen bg-transparent">
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron text-neurolink-coldWhite">
              {saludo}, {nombreUsuario}
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Bienvenido a tu centro de comando
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-neurolink-cyberBlue/20 
                text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
                transition-colors"
            >
              <Bell className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-neurolink-cyberBlue/20 
                text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
                transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Grid de Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgets.map(widget => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/30 rounded-xl border border-neurolink-cyberBlue/30 
                overflow-hidden"
            >
              {/* Header del Widget */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleWidget(widget.id)}
                className="w-full p-4 flex items-center justify-between 
                  bg-neurolink-cyberBlue/10 hover:bg-neurolink-cyberBlue/20 
                  transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-neurolink-cyberBlue/20 
                    text-neurolink-cyberBlue">
                    {widget.icono}
                  </div>
                  <h2 className="font-orbitron text-neurolink-coldWhite">
                    {widget.titulo}
                  </h2>
                </div>
                {widget.colapsado ? (
                  <ChevronDown className="w-5 h-5 text-neurolink-coldWhite/70" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-neurolink-coldWhite/70" />
                )}
              </motion.button>

              {/* Contenido del Widget */}
              <AnimatePresence>
                {!widget.colapsado && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4">
                      {widget.componente}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Footer con Resumen */}
        <div className="bg-black/30 rounded-xl border border-neurolink-cyberBlue/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neurolink-cyberBlue" />
              <span className="text-neurolink-coldWhite">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 
                text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
                transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Ver Resumen Completo</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeuroDashboard; 