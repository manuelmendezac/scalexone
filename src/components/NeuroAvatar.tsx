import { useEffect, useState } from 'react';
import useNeuroState from '../store/useNeuroState';

interface NeuroAvatarProps {
  speaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showMic?: boolean;
  onMicToggle?: () => void;
}

const NeuroAvatar = ({
  speaking = false,
  size = 'md',
  showMic = false,
  onMicToggle
}: NeuroAvatarProps) => {
  const { messages } = useNeuroState();
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tamaños del avatar
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  // Detectar nuevos mensajes
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.from === 'ai') {
      setIsNewMessage(true);
      setIsProcessing(true);
      
      // Resetear estados después de las animaciones
      setTimeout(() => {
        setIsNewMessage(false);
        setTimeout(() => {
          setIsProcessing(false);
        }, 1000);
      }, 2000);
    }
  }, [messages]);

  return (
    <div className="relative">
      {/* Avatar Principal */}
      <div
        className={`${sizeClasses[size]} relative rounded-full overflow-hidden transition-all duration-500 ease-in-out ${
          isNewMessage ? 'animate-pulse' : ''
        }`}
      >
        {/* Fondo con efecto de energía */}
        <div className="absolute inset-0 bg-neurolink-cyberBlue bg-opacity-20 animate-energy-pulse" />
        
        {/* Avatar Holográfico */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0, 194, 255, 0.5))'
            }}
          >
            {/* Silueta abstracta */}
            <path
              d="M50 20 C70 20, 80 40, 80 60 C80 80, 60 80, 50 80 C40 80, 20 80, 20 60 C20 40, 30 20, 50 20"
              fill="none"
              stroke="rgba(0, 194, 255, 0.8)"
              strokeWidth="2"
              className="animate-float"
            />
            {/* Detalles del holograma */}
            <circle
              cx="50"
              cy="45"
              r="15"
              fill="none"
              stroke="rgba(0, 194, 255, 0.6)"
              strokeWidth="1"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Efecto de procesamiento */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full border-2 border-neurolink-cyberBlue animate-processing-pulse" />
            <div className="absolute w-3/4 h-3/4 rounded-full border-2 border-neurolink-cyberBlue animate-processing-pulse delay-150" />
            <div className="absolute w-1/2 h-1/2 rounded-full border-2 border-neurolink-cyberBlue animate-processing-pulse delay-300" />
          </div>
        )}

        {/* Efecto de habla */}
        {speaking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-1/2 rounded-full bg-neurolink-cyberBlue bg-opacity-20 animate-speak-pulse" />
          </div>
        )}
      </div>

      {/* Botón de micrófono */}
      {showMic && (
        <button
          onClick={onMicToggle}
          className="absolute -bottom-2 -right-2 p-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-full hover:bg-neurolink-cyberBlue hover:bg-opacity-20 transition-all duration-300"
        >
          <svg
            className="w-4 h-4 text-neurolink-coldWhite"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default NeuroAvatar; 