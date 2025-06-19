import React from 'react';
import { motion } from 'framer-motion';
import useStreakStore from '../../store/useStreakStore';

interface DailyStreakProps {
  className?: string;
}

const DailyStreak: React.FC<DailyStreakProps> = ({ className = '' }) => {
  const { racha, rachaMaxima, diasActivos, loading, error } = useStreakStore(state => ({
    racha: state.racha,
    rachaMaxima: state.rachaMaxima,
    diasActivos: state.diasActivos,
    loading: state.loading,
    error: state.error
  }));

  // Mostrar un estado de carga elegante
  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-w-[180px] bg-black/40 border border-neurolink-cyberBlue/30 rounded-2xl p-6 shadow-xl ${className}`}>
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-12 bg-neurolink-cyberBlue/10 rounded-full w-12 mx-auto"></div>
          <div className="h-4 bg-neurolink-cyberBlue/10 rounded w-24 mx-auto"></div>
          <div className="h-3 bg-neurolink-cyberBlue/10 rounded w-20 mx-auto"></div>
          <div className="space-y-3 pt-4 border-t border-neurolink-cyberBlue/20">
            <div className="h-3 bg-neurolink-cyberBlue/10 rounded w-full"></div>
            <div className="h-3 bg-neurolink-cyberBlue/10 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error de forma elegante
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-w-[180px] bg-black/40 border border-red-500/30 rounded-2xl p-6 shadow-xl ${className}`}>
        <div className="text-red-400 text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm">No se pudo cargar la racha</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex flex-col items-center justify-center min-w-[180px] bg-black/40 border border-neurolink-cyberBlue/30 rounded-2xl p-6 shadow-xl ${className}`}
    >
      <div className="relative">
        {/* Círculo de fuego animado */}
        <div className="absolute inset-0 animate-spin-slow">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-6 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full"
              style={{
                transformOrigin: 'center 150%',
                transform: `rotate(${i * 45}deg)`,
                filter: 'blur(1px)',
                opacity: 0.7
              }}
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
        
        {/* Número de racha */}
        <div className="text-neurolink-matrixGreen text-4xl font-bold mb-2 relative z-10">
          🔥 {racha}
        </div>
      </div>

      <div className="text-neurolink-coldWhite/80 text-lg font-orbitron">
        Racha de uso
      </div>
      <div className="text-neurolink-coldWhite/50 text-sm">
        Días seguidos
      </div>

      {/* Estadísticas adicionales */}
      <div className="mt-4 pt-4 border-t border-neurolink-cyberBlue/20 w-full">
        <div className="flex justify-between text-sm">
          <div className="text-neurolink-coldWhite/60">
            Mejor racha
          </div>
          <div className="text-neurolink-matrixGreen font-bold">
            {rachaMaxima} días
          </div>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <div className="text-neurolink-coldWhite/60">
            Total activo
          </div>
          <div className="text-neurolink-matrixGreen font-bold">
            {diasActivos} días
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyStreak; 