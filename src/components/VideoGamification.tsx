import React, { useEffect, useState } from 'react';
import { useGamification } from '../hooks/useGamification';
import '../styles/gamification.css';

interface VideoGamificationProps {
  videoId: string;
  moduloId: string;
  cursoId: string;
  tipoVideo: 'curso' | 'classroom';
  currentTime: number;
  duration: number;
}

export const VideoGamification: React.FC<VideoGamificationProps> = ({
  videoId,
  moduloId,
  cursoId,
  tipoVideo,
  currentTime,
  duration
}) => {
  const {
    xp,
    nivel,
    monedas,
    xpSiguienteNivel,
    ultimosLogros,
    loading,
    actualizarProgresoVideo,
    mostrarNotificacionLogro
  } = useGamification();

  const [lastUpdate, setLastUpdate] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');

  useEffect(() => {
    const updateProgress = async () => {
      if (!duration || currentTime === lastUpdate) return;

      const porcentajeCompletado = Math.floor((currentTime / duration) * 100);
      
      // Actualizar progreso cada 30 segundos o cuando se complete el 90%
      if (
        currentTime - lastUpdate >= 30 ||
        (porcentajeCompletado >= 90 && lastUpdate === 0)
      ) {
        try {
          const resultado = await actualizarProgresoVideo({
            videoId,
            moduloId,
            cursoId,
            tipoVideo,
            tiempoVisto: Math.floor(currentTime),
            porcentajeCompletado
          });

          setLastUpdate(currentTime);

          // Mostrar recompensa si se completó el video
          if (porcentajeCompletado >= 90 && !showReward) {
            setRewardMessage('¡Video completado! +25 XP, +1 Moneda');
            setShowReward(true);
            setTimeout(() => setShowReward(false), 3000);
          }
        } catch (error) {
          console.error('Error al actualizar progreso:', error);
        }
      }
    };

    updateProgress();
  }, [currentTime, duration, videoId, moduloId, cursoId, tipoVideo, lastUpdate]);

  if (loading) {
    return <div className="gamification-loading">Cargando progreso...</div>;
  }

  return (
    <div className="gamification-container">
      <div className="gamification-stats">
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <span className="stat-value">Nivel {nivel}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">✨</span>
          <span className="stat-value">{xp} XP</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💰</span>
          <span className="stat-value">{monedas} Monedas</span>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(xp / xpSiguienteNivel) * 100}%` }}
        />
        <span className="progress-text">
          {xp} / {xpSiguienteNivel} XP para nivel {nivel + 1}
        </span>
      </div>

      {showReward && (
        <div className="reward-popup">
          <span className="reward-icon">🎉</span>
          <span className="reward-text">{rewardMessage}</span>
        </div>
      )}

      {ultimosLogros.length > 0 && (
        <div className="recent-achievements">
          <h4>Últimos Logros:</h4>
          {ultimosLogros.map((logro: any) => (
            <div key={logro.id} className="achievement-item">
              <span className="achievement-icon">{logro.logros.icono || '🏆'}</span>
              <span className="achievement-title">{logro.logros.titulo}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 