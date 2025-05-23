import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RefreshCw, Brain, Target, Star } from 'lucide-react';
import { useStore } from '../store/store';

const TEMAS_EJEMPLO = [
  'productividad',
  'creatividad',
  'bienestar',
  'aprendizaje',
  'tecnología',
  'desarrollo personal'
];

const CONSEJOS_EJEMPLO = [
  'Recuerda que cada pequeño paso cuenta en tu desarrollo personal.',
  'La consistencia es más importante que la intensidad.',
  'Tómate un momento para celebrar tus pequeños logros.',
  'El descanso es parte fundamental del progreso.'
];

const MICRORETOS_EJEMPLO = [
  'Dedica 5 minutos a meditar antes de comenzar tu día.',
  'Escribe tres cosas por las que estés agradecido hoy.',
  'Intenta una nueva técnica de organización.',
  'Comparte algo que hayas aprendido con alguien más.'
];

const RECORDATORIOS_EJEMPLO = [
  'Tu bienestar mental es tan importante como tu productividad.',
  'No olvides tomar descansos regulares durante tu trabajo.',
  'Mantén el balance entre tus objetivos y tu salud.',
  'Celebra tus progresos, por pequeños que sean.'
];

export const ReflectionMode: React.FC = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [reflexionActual, setReflexionActual] = useState<any>(null);
  const { reflexionesDiarias, agregarReflexionDiaria, obtenerReflexionPorFecha } = useStore();

  const generarReflexion = () => {
    const temasConversados = TEMAS_EJEMPLO.sort(() => 0.5 - Math.random()).slice(0, 3);
    const temasRepetitivos = TEMAS_EJEMPLO.sort(() => 0.5 - Math.random()).slice(0, 2);
    const enfoqueEnergia = TEMAS_EJEMPLO[Math.floor(Math.random() * TEMAS_EJEMPLO.length)];

    const nuevaReflexion = {
      fecha: fechaActual,
      recapitulacion: {
        temasConversados,
        temasRepetitivos,
        enfoqueEnergia
      },
      insights: {
        consejo: CONSEJOS_EJEMPLO[Math.floor(Math.random() * CONSEJOS_EJEMPLO.length)],
        microreto: MICRORETOS_EJEMPLO[Math.floor(Math.random() * MICRORETOS_EJEMPLO.length)],
        recordatorio: RECORDATORIOS_EJEMPLO[Math.floor(Math.random() * RECORDATORIOS_EJEMPLO.length)]
      }
    };

    agregarReflexionDiaria(nuevaReflexion);
    setReflexionActual(nuevaReflexion);
  };

  useEffect(() => {
    const reflexion = obtenerReflexionPorFecha(fechaActual);
    if (reflexion) {
      setReflexionActual(reflexion);
    } else {
      generarReflexion();
    }
  }, [fechaActual]);

  const cambiarFecha = (dias: number) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    setFechaActual(nuevaFecha);
  };

  if (!reflexionActual) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neurolink-dark/80 backdrop-blur-sm rounded-xl border-2 border-neurolink-matrixGreen p-6"
      >
        {/* Navegación */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => cambiarFecha(-1)}
            className="p-2 rounded-lg bg-neurolink-dark/50 text-neurolink-matrixGreen
              hover:bg-neurolink-matrixGreen/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
            Reflexión del {fechaActual.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => cambiarFecha(1)}
            className="p-2 rounded-lg bg-neurolink-dark/50 text-neurolink-matrixGreen
              hover:bg-neurolink-matrixGreen/10"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Recapitulación */}
        <div className="mb-8">
          <h3 className="text-lg font-orbitron text-neurolink-matrixGreen mb-4">
            Recapitulación del Día
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30">
              <p className="text-neurolink-coldWhite">
                Hoy conversamos sobre{' '}
                <span className="text-neurolink-matrixGreen">
                  {reflexionActual.recapitulacion.temasConversados.join(', ')}
                </span>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30">
              <p className="text-neurolink-coldWhite">
                Detecté que mencionaste frecuentemente{' '}
                <span className="text-neurolink-matrixGreen">
                  {reflexionActual.recapitulacion.temasRepetitivos.join(' y ')}
                </span>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30">
              <p className="text-neurolink-coldWhite">
                Tu energía estuvo más enfocada en{' '}
                <span className="text-neurolink-matrixGreen">
                  {reflexionActual.recapitulacion.enfoqueEnergia}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mb-8">
          <h3 className="text-lg font-orbitron text-neurolink-matrixGreen mb-4">
            Insights Personalizados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-5 h-5 text-neurolink-matrixGreen" />
                <h4 className="font-orbitron text-neurolink-coldWhite">Consejo del Día</h4>
              </div>
              <p className="text-neurolink-coldWhite/80">
                {reflexionActual.insights.consejo}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-neurolink-matrixGreen" />
                <h4 className="font-orbitron text-neurolink-coldWhite">Microreto</h4>
              </div>
              <p className="text-neurolink-coldWhite/80">
                {reflexionActual.insights.microreto}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-neurolink-matrixGreen" />
                <h4 className="font-orbitron text-neurolink-coldWhite">Recordatorio</h4>
              </div>
              <p className="text-neurolink-coldWhite/80">
                {reflexionActual.insights.recordatorio}
              </p>
            </div>
          </div>
        </div>

        {/* Botón de regenerar */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generarReflexion}
            className="px-6 py-3 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron
              flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Regenerar Reflexión</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}; 