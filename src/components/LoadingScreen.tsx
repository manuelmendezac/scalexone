import React from 'react';

interface LoadingScreenProps {
  message?: string;
  communityName?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, communityName }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="mb-6 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent h-16 w-16" />
      <span className="text-xl font-bold text-cyan-300 mt-4">
        {communityName
          ? `Cargando ${communityName}...`
          : message || 'Cargando comunidad...'}
      </span>
    </div>
  );
};

export default LoadingScreen; 