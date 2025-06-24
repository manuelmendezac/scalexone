import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useAuth } from '../hooks/useAuth';
import gamificationService from '../services/classroomGamificationService';
import RewardEffect from './RewardEffect';
import GlobalLoader from './GlobalLoader';

// VideoPlayerClassroom: Componente para reproducción de videos con sistema de gamificación integrado
// Maneja el progreso, recompensas y tracking de videos en el classroom

interface VideoPlayerClassroomProps {
  videoId: string;
  url: string;
  onProgress?: (progress: number) => void;
}

const VideoPlayerClassroom: React.FC<VideoPlayerClassroomProps> = ({
  videoId,
  url,
  onProgress
}) => {
  const { user } = useAuth();
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [reward, setReward] = useState<{
    xp: number;
    monedas: number;
    mensaje: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const handleProgress = async ({ played, playedSeconds }: { played: number; playedSeconds: number }) => {
    const progressPercent = Math.floor(played * 100);
    setProgress(progressPercent);
    onProgress?.(progressPercent);

    // Actualizar progreso en la base de datos
    if (user?.id && progressPercent > progress) {
      try {
        const result = await gamificationService.actualizarProgresoVideo(
          videoId,
          '', // moduloId no está disponible aquí, se debe pasar el valor correcto si se tiene
          user.id
        );

        // Si hay recompensas, mostrar el efecto
        if (result.xpGanado > 0 || result.monedasGanadas > 0) {
          setReward({
            xp: result.xpGanado,
            monedas: result.monedasGanadas,
            mensaje: result.mensaje
          });
        }
      } catch (error) {
        console.error('Error al actualizar progreso:', error);
      }
    }
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <GlobalLoader pageName="Video" />
        </div>
      )}
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        controls={true}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onReady={() => setLoading(false)}
        config={{
          youtube: {
            playerVars: { showinfo: 1 }
          }
        }}
      />
      
      {/* Barra de progreso personalizada */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Efecto de recompensa */}
      {reward && (
        <RewardEffect
          xp={reward.xp}
          monedas={reward.monedas}
          mensaje={reward.mensaje}
          onComplete={() => setReward(null)}
        />
      )}
    </div>
  );
};

export default VideoPlayerClassroom; 