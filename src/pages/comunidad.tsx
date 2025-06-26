import React, { useState, useEffect } from 'react';
import FeedComunidad from '../components/comunidad/FeedComunidad';
import BarraLateralComunidad from '../components/comunidad/BarraLateralComunidadFixed';
import CanalesComunidad from '../components/comunidad/CanalesComunidad';
import LoadingScreen from '../components/LoadingScreen';
import useNeuroState, { useHydration } from '../store/useNeuroState';
import { supabase } from '../supabase';
import GlobalLoader from '../components/GlobalLoader';

const ComunidadPage = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [canalActivo, setCanalActivo] = useState<string>('');
  const [nombreCanalActivo, setNombreCanalActivo] = useState<string>('');
  
  // Force deploy - Sistema de canales restaurado
  
  // Detectar si es móvil
  const esMovil = typeof window !== 'undefined' && window.innerWidth < 768;
  const [loading, setLoading] = useState(true);
  const isHydrated = useHydration();
  const { userInfo } = useNeuroState();
  const [communityName, setCommunityName] = useState<string | undefined>();

  useEffect(() => {
    const fetchCommunityName = async () => {
      if (!userInfo.id) {
        setLoading(false);
        return;
      }
      try {
        let communityData = null;
        
        // Primero intentar obtener ScaleXOne si es community_id default o scalexone
        if (userInfo.community_id === 'scalexone' || userInfo.community_id === 'default') {
          const { data: scalexoneData, error: scalexoneError } = await supabase
            .from('comunidades')
            .select('nombre')
            .eq('slug', 'scalexone')
            .single();
            
          if (!scalexoneError && scalexoneData) {
            communityData = scalexoneData;
          }
        }
        
        // Si no encontró ScaleXOne, buscar por owner_id
        if (!communityData) {
          const { data, error } = await supabase
            .from('comunidades')
            .select('nombre')
            .eq('owner_id', userInfo.id)
            .single();
            
          if (!error) {
            communityData = data;
          }
        }
        
        if (communityData) {
          setCommunityName(communityData.nombre);
        } else {
          setCommunityName('ScaleXOne'); // Fallback
        }
      } catch (err) {
        console.error("Error fetching community name for loader:", err);
        setCommunityName('ScaleXOne'); // Fallback
      } finally {
        setLoading(false);
      }
    };

    if (isHydrated) {
      fetchCommunityName();
    }
  }, [isHydrated, userInfo.id, userInfo.community_id]);

  const handleCanalChange = (canalId: string, nombreCanal: string) => {
    setCanalActivo(canalId);
    setNombreCanalActivo(nombreCanal);
  };

  if (!isHydrated || loading) {
    return <GlobalLoader pageName="Comunidad" />;
  }

  return (
    <div className="flex flex-row min-h-screen bg-neutral-950 justify-center">
      <main className="flex-1 p-2 max-w-7xl xl:max-w-[1600px] mx-auto">
        {/* Barra de canales dinámicos */}
        <div className="flex items-center gap-2 mb-4">
          {/* Botón menú solo en móvil */}
          {esMovil && (
            <button
              className="bg-[#e6a800] text-black rounded-full p-2 shadow focus:outline-none flex-shrink-0"
              aria-label="Abrir menú comunidad"
              style={{ minWidth: 40, minHeight: 40 }}
              onClick={() => setMenuAbierto(true)}
            >
              <span style={{ fontSize: 22 }}>☰</span>
            </button>
          )}
          
          {/* Componente de canales dinámicos */}
          <div className="flex-1">
            <CanalesComunidad 
              onCanalChange={handleCanalChange}
              canalActivo={canalActivo}
            />
          </div>
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
        
        {/* Feed con canal activo */}
        <FeedComunidad 
          canalActivo={canalActivo}
          nombreCanalActivo={nombreCanalActivo}
        />
      </main>
      
      {/* Barra lateral solo en desktop */}
      <aside className="w-[300px] p-2 bg-neutral-900 border-l border-cyan-900/30 hidden md:block">
        <BarraLateralComunidad />
      </aside>
    </div>
  );
};

export default ComunidadPage; 