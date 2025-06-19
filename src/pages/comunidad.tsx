import React, { useState, useEffect } from 'react';
import FeedComunidad from '../components/comunidad/FeedComunidad';
import BarraLateralComunidad from '../components/comunidad/BarraLateralComunidad';
import LoadingScreen from '../components/LoadingScreen';
import { useHydration } from '../store/useNeuroState';

const ComunidadPage = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Detectar si es móvil
  const esMovil = typeof window !== 'undefined' && window.innerWidth < 768;
  const [loading, setLoading] = useState(true);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      setLoading(false);
    }
  }, [isHydrated]);

  if (!isHydrated || loading) {
    return <LoadingScreen message="Cargando comunidad..." />;
  }

  return (
    <div className="flex flex-row min-h-screen bg-neutral-950 justify-center">
      <main className="flex-1 p-2 max-w-7xl xl:max-w-[1600px] mx-auto">
        {/* Barra de canales siempre arriba del feed, en todas las resoluciones */}
        <div className="w-full flex items-center gap-2 px-2 py-2 bg-neutral-900 rounded-xl mb-4 border border-cyan-900/30 shadow-md">
          {/* Botón menú solo en móvil */}
          {esMovil && (
            <button
              className="bg-[#e6a800] text-black rounded-full p-2 shadow focus:outline-none"
              aria-label="Abrir menú comunidad"
              style={{ minWidth: 40, minHeight: 40 }}
              onClick={() => setMenuAbierto(true)}
            >
              <span style={{ fontSize: 22 }}>☰</span>
            </button>
          )}
          <button className="flex-1 bg-[#23232b] text-white rounded-xl px-3 py-2 font-bold text-sm hover:bg-[#e6a800] hover:text-black transition">Chat General</button>
          <button className="flex-1 bg-[#23232b] text-white rounded-xl px-3 py-2 font-bold text-sm hover:bg-[#e6a800] hover:text-black transition">Preséntate</button>
        </div>
        {/* Menú lateral muestra info de la comunidad en móvil */}
        {esMovil && menuAbierto && (
          <div className="fixed inset-0 bg-black/60 z-40 flex justify-end" onClick={() => setMenuAbierto(false)}>
            <aside
              className="w-72 max-w-full h-full bg-neutral-900 p-4 border-l border-cyan-900/30 shadow-xl animate-slide-in-right relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-2xl text-[#e6a800] font-bold z-50"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
              >
                ×
              </button>
              {/* Info de la comunidad */}
              <div className="overflow-y-auto h-full pt-10">
                <BarraLateralComunidad />
              </div>
            </aside>
          </div>
        )}
        <FeedComunidad />
      </main>
      {/* Barra lateral solo en desktop */}
      <aside className="w-[300px] p-2 bg-neutral-900 border-l border-cyan-900/30 hidden md:block">
        <BarraLateralComunidad />
      </aside>
    </div>
  );
};

export default ComunidadPage; 