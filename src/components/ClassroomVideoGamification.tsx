import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Gift, CheckCircle } from 'lucide-react';
import classroomGamificationService, { CLASSROOM_REWARDS } from '../services/classroomGamificationService';
import useNeuroState from '../store/useNeuroState';

interface ClassroomVideoGamificationProps {
  videoId: string;
  moduloId: string;
  usuarioId: string;
  currentTime: number;
  duration: number;
  onProgressUpdate?: (progress: number) => void;
  onVideoCompleted?: (videoId: string) => void;
}

interface RewardNotification {
  id: string;
  type: 'video' | 'module' | 'streak' | 'first_video_day';
  title: string;
  message: string;
  xp: number;
  coins: number;
  icon: React.ReactNode;
}

export const ClassroomVideoGamification: React.FC<ClassroomVideoGamificationProps> = ({
  videoId,
  moduloId,
  usuarioId,
  currentTime,
  duration,
  onProgressUpdate,
  onVideoCompleted
}) => {
  const neuro = useNeuroState();
  const [lastUpdate, setLastUpdate] = useState(0);
  const [showReward, setShowReward] = useState<RewardNotification | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastRewardRef = useRef<string>('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Resetea el estado 'completed' cuando cambia el video
    setCompleted(false);
  }, [videoId]);

  useEffect(() => {
    const updateProgress = async () => {
      if (!duration || loading || completed) return;

      const porcentajeCompletado = Math.floor((currentTime / duration) * 100);
      setProgress(porcentajeCompletado);
      
      if (onProgressUpdate) {
        onProgressUpdate(porcentajeCompletado);
      }

      // Si el video se ha completado, llama al servicio y a los callbacks
      if (porcentajeCompletado >= 100) {
        setCompleted(true); // Evita llamadas múltiples
        setLoading(true);

        try {
          const resultado = await classroomGamificationService.actualizarProgresoVideo(
            videoId,
            usuarioId,
            Math.floor(currentTime),
            porcentajeCompletado
          );

          // Mostrar recompensa si se ganó algo
          if (resultado.xpGanado > 0 || resultado.monedasGanadas > 0) {
            const rewardId = `${videoId}-${Date.now()}`;
            const notification: RewardNotification = {
              id: rewardId,
              type: 'video',
              title: '¡Video Completado!',
              message: resultado.mensaje,
              xp: resultado.xpGanado,
              coins: resultado.monedasGanadas,
              icon: <Trophy className="w-8 h-8 text-yellow-400" />
            };

            setShowReward(notification);
            setTimeout(() => setShowReward(null), 4000);
          }
          
          // Informar al componente padre que el video está completo
          if (onVideoCompleted) {
            onVideoCompleted(videoId);
          }

        } catch (error) {
          console.error('Error al actualizar progreso:', error);
          setCompleted(false); // Permite reintentar si hubo un error
        } finally {
          setLoading(false);
        }
      }
    };

    updateProgress();
  }, [currentTime, duration, videoId, usuarioId, onVideoCompleted, completed, loading]);

  // Mostrar progreso actual
  const renderProgress = () => (
    <div className="fixed top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
      <div className="flex items-center gap-2 text-cyan-400 text-sm">
        <div className="w-4 h-4 border-2 border-cyan-500 rounded-full flex items-center justify-center">
          <div 
            className="w-2 h-2 bg-cyan-400 rounded-full"
            style={{ 
              transform: `scale(${progress / 100})`,
              transition: 'transform 0.3s ease'
            }}
          />
        </div>
        <span>{progress}% completado</span>
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs">
        <span className="text-yellow-400">XP: {neuro.userXP}</span>
        <span className="text-yellow-400">Monedas: {neuro.userCoins}</span>
      </div>
    </div>
  );

  return (
    <>
      {renderProgress()}
      
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.2, 1] }}
              transition={{ duration: 0.5, times: [0, 0.7, 1] }}
              className="bg-gradient-to-br from-cyan-900/95 to-blue-900/95 backdrop-blur-md rounded-2xl p-6 border-2 border-cyan-400/50 shadow-2xl max-w-sm mx-4 pointer-events-auto"
            >
              <div className="text-center">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  className="mb-4"
                >
                  {showReward.icon}
                </motion.div>
                
                <h3 className="text-xl font-bold text-cyan-300 mb-2">
                  {showReward.title}
                </h3>
                
                <p className="text-cyan-200 text-sm mb-4">
                  {showReward.message}
                </p>
                
                <div className="flex justify-center gap-4">
                  {showReward.xp > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">+{showReward.xp} XP</span>
                    </div>
                  )}
                  
                  {showReward.coins > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                      <img 
                        src="/images/modulos/neurocoin.svg" 
                        alt="Coin" 
                        className="w-4 h-4" 
                      />
                      <span className="text-yellow-400 font-bold">+{showReward.coins}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de carga */}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-cyan-500/30">
          <div className="flex items-center gap-2 text-cyan-400 text-xs">
            <div className="w-3 h-3 border border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span>Guardando progreso...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ClassroomVideoGamification; 