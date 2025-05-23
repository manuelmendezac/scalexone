import { useEffect, useState } from 'react';
import { useTheme } from '../context/themeContext';
import useNeuroState from '../store/useNeuroState';
import type { Message } from '../store/useNeuroState';

interface ModeEffects {
  isInputEnabled: boolean;
  showNotifications: boolean;
  showProductivityTips: boolean;
  showRelaxingMessages: boolean;
  currentMessage: string | null;
  modeClass: string;
  isFocusMode: boolean;
  isProductivityMode: boolean;
  isSleepMode: boolean;
  showFloatingMessage: boolean;
  floatingMessage: string;
  shouldShowAnimations: boolean;
  shouldShowLongResponses: boolean;
}

const FRASES_RELAJANTES = [
  "Respira. Mañana será brillante.",
  "Descansa tu mente. Todo está bien.",
  "Cierra los ojos y relájate.",
  "El silencio es tu aliado.",
  "Permítete descansar."
];

export function useModeEffects(): ModeEffects {
  const { mode } = useTheme();
  const { setMessages, setNotifications } = useNeuroState();
  const [floatingMessage, setFloatingMessage] = useState<string>('');
  const [showFloatingMessage, setShowFloatingMessage] = useState(false);

  // Efectos específicos por modo
  useEffect(() => {
    switch (mode) {
      case 'productivity':
        // Mostrar tareas sugeridas
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'ai',
            text: '🎯 Tareas Sugeridas para Máxima Productividad:\n\n1. Prioriza tus objetivos del día\n2. Toma descansos programados\n3. Mantén un registro de tu progreso',
            from: 'ai',
            timestamp: new Date()
          }
        ]);
        break;

      case 'focus':
        // Ocultar notificaciones no esenciales
        setNotifications(prev => 
          prev.filter(n => n.priority === 'high')
        );
        break;

      case 'sleep':
        // Mostrar mensaje relajante
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'ai',
            text: '🌙 Modo Descanso Activado\n\nLa IA está en modo de baja actividad para permitir tu descanso. Puedes volver a activar el modo normal cuando lo desees.',
            from: 'ai',
            timestamp: new Date()
          }
        ]);
        // Iniciar rotación de mensajes relajantes
        const interval = setInterval(() => {
          const randomMessage = FRASES_RELAJANTES[Math.floor(Math.random() * FRASES_RELAJANTES.length)];
          setFloatingMessage(randomMessage);
          setShowFloatingMessage(true);
          setTimeout(() => setShowFloatingMessage(false), 5000);
        }, 10000);
        return () => clearInterval(interval);
    }
  }, [mode, setMessages, setNotifications]);

  // Determinar estado actual basado en el modo
  const effects: ModeEffects = {
    isInputEnabled: mode !== 'sleep',
    showNotifications: mode !== 'focus',
    showProductivityTips: mode === 'productivity',
    showRelaxingMessages: mode === 'sleep',
    currentMessage: mode === 'sleep' 
      ? '🌙 Modo Descanso Activado'
      : mode === 'focus'
      ? '🎯 Modo Enfoque: Minimizando distracciones'
      : mode === 'productivity'
      ? '⚡ Modo Productividad: Maximizando eficiencia'
      : null,
    modeClass: `mode-${mode}`,
    isFocusMode: mode === 'focus',
    isProductivityMode: mode === 'productivity',
    isSleepMode: mode === 'sleep',
    showFloatingMessage,
    floatingMessage,
    shouldShowAnimations: mode !== 'focus',
    shouldShowLongResponses: mode !== 'focus'
  };

  return effects;
} 