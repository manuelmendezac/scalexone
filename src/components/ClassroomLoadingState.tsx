import React from 'react';

const ClassroomLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header Skeleton */}
      <div className="w-full flex justify-end items-center mb-8">
        <div className="w-32 h-10 bg-neutral-800 rounded-full animate-pulse"></div>
      </div>

      {/* Grid de módulos skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-neutral-800 rounded-xl p-4 animate-pulse">
            {/* Imagen skeleton */}
            <div className="w-full h-48 bg-neutral-700 rounded-lg mb-4"></div>
            
            {/* Título skeleton */}
            <div className="w-3/4 h-6 bg-neutral-700 rounded mb-2"></div>
            
            {/* Descripción skeleton */}
            <div className="w-full h-4 bg-neutral-700 rounded mb-2"></div>
            <div className="w-2/3 h-4 bg-neutral-700 rounded"></div>

            {/* Barra de progreso skeleton */}
            <div className="w-full h-3 bg-neutral-700 rounded-full mt-4"></div>
          </div>
        ))}
      </div>

      {/* Paginación skeleton */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-8 h-8 bg-neutral-800 rounded-full animate-pulse"></div>
        ))}
      </div>
    </div>
  );
};

export default ClassroomLoadingState; 