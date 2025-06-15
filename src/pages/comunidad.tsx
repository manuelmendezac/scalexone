import React from 'react';
import FeedComunidad from '../components/comunidad/FeedComunidad';
import BarraLateralComunidad from '../components/comunidad/BarraLateralComunidad';

const ComunidadPage = () => {
  return (
    <div className="flex flex-row min-h-screen bg-neutral-950">
      <main className="flex-1 p-4">
        <FeedComunidad />
      </main>
      <aside className="w-[350px] p-4 bg-neutral-900 border-l border-cyan-900/30">
        <BarraLateralComunidad />
      </aside>
    </div>
  );
};

export default ComunidadPage; 