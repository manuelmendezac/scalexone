import React from 'react';

interface GlobalLoaderProps {
  pageName: string;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ pageName }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-black/90 z-50">
    <div className="mb-6 animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 border-solid"></div>
    <span className="text-yellow-400 text-2xl font-bold font-orbitron tracking-wide mt-2">
      Cargando {pageName}...
    </span>
  </div>
);

export default GlobalLoader; 