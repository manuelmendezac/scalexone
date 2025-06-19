import React from 'react';

const CursosLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Skeleton */}
      <div className="w-full flex justify-end items-center mb-8 px-2 max-w-7xl mx-auto">
        <div className="flex gap-2">
          <div className="w-24 h-10 rounded-full bg-neutral-800 animate-pulse"></div>
          <div className="w-10 h-10 rounded-full bg-neutral-800 animate-pulse"></div>
          <div className="w-10 h-10 rounded-full bg-neutral-800 animate-pulse"></div>
        </div>
      </div>

      {/* Título Skeleton */}
      <div className="w-96 h-10 bg-neutral-800 rounded mx-auto mb-8 animate-pulse"></div>

      {/* Botones de cursos Skeleton */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-44 h-14 bg-neutral-800 rounded-lg animate-pulse"></div>
        ))}
      </div>

      {/* Área principal Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl mb-10 mx-auto">
        <div className="w-64 h-64 bg-neutral-800 rounded-xl animate-pulse"></div>
        <div className="flex-1 flex flex-col items-center md:items-center">
          <div className="w-48 h-8 bg-neutral-800 rounded mb-2 animate-pulse"></div>
          <div className="w-full h-20 bg-neutral-800 rounded mb-6 animate-pulse"></div>
          <div className="w-32 h-12 bg-neutral-800 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Botones secundarios Skeleton */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-64 h-10 bg-neutral-800 rounded-full animate-pulse"></div>
        <div className="w-32 h-10 bg-neutral-800 rounded-full animate-pulse"></div>
      </div>

      {/* Footer Skeleton */}
      <div className="w-full text-center">
        <div className="w-32 h-6 bg-neutral-800 rounded mx-auto animate-pulse"></div>
      </div>
    </div>
  );
};

export default CursosLoadingState; 