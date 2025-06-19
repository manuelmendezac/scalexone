import React from 'react';
import NeonSpinner from './NeonSpinner';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Cargando...' }) => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <NeonSpinner size={64} />
      <p className="mt-4 text-cyan-400 text-lg font-light">{message}</p>
    </div>
  );
};

export default LoadingScreen; 