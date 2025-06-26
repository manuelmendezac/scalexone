import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import useNeuroState from '../../store/useNeuroState';

interface Canal {
  id: string;
  nombre: string;
  descripcion: string;
  puede_publicar: boolean;
}

interface SelectorCanalesProps {
  canalSeleccionado?: string;
  onCanalChange: (canalId: string, nombreCanal: string) => void;
  disabled?: boolean;
}

const SelectorCanales: React.FC<SelectorCanalesProps> = ({
  canalSeleccionado,
  onCanalChange,
  disabled = false
}) => {
  const [canales, setCanales] = useState<Canal[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const { userInfo } = useNeuroState();

  // Función para obtener UUID de la comunidad
  const getCommunityUUID = async (): Promise<string | null> => {
    try {
      if (!userInfo.id) return null;

      // Intentar obtener ScaleXOne primero
      if (userInfo.community_id === 'scalexone' || userInfo.community_id === 'default') {
        const { data: scalexoneData, error: scalexoneError } = await supabase
          .from('comunidades')
          .select('id')
          .eq('slug', 'scalexone')
          .single();
          
        if (!scalexoneError && scalexoneData) {
          return scalexoneData.id;
        }
      }
      
      // Si no encontró ScaleXOne, buscar por owner_id
      const { data, error } = await supabase
        .from('comunidades')
        .select('id')
        .eq('owner_id', userInfo.id)
        .single();
        
      if (!error && data) {
        return data.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo UUID de comunidad:', error);
      return null;
    }
  };

  const cargarCanales = async () => {
    try {
      setLoading(true);
      const communityUUID = await getCommunityUUID();
      
      if (!communityUUID || !userInfo.id) {
        setCanales([]);
        return;
      }

      const { data, error } = await supabase.rpc('get_canales_publicar_usuario', {
        p_usuario_id: userInfo.id,
        p_community_id: communityUUID
      });

      if (error) {
        console.error('Error cargando canales:', error);
        setCanales([]);
        return;
      }

      setCanales(data || []);
    } catch (error) {
      console.error('Error en cargarCanales:', error);
      setCanales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo.id) {
      cargarCanales();
    }
  }, [userInfo.id]);

  const canalActual = canales.find(c => c.id === canalSeleccionado);

  const handleSeleccionCanal = (canal: Canal) => {
    if (canal.puede_publicar) {
      onCanalChange(canal.id, canal.nombre);
      setMostrarModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span>🔄</span>
        <span>Cargando canales...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón selector */}
      <button
        onClick={() => setMostrarModal(true)}
        disabled={disabled || canales.length === 0}
        className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-sm transition ${
          disabled 
            ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
            : 'bg-[#18181b] text-[#e6a800] border-[#e6a800] hover:bg-[#e6a800] hover:text-black'
        }`}
      >
        <span>#</span>
        <span>{canalActual?.nombre || 'Seleccionar canal'}</span>
        <span className="text-xs">▼</span>
      </button>

      {/* Modal de selección */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setMostrarModal(false)}>
          <div className="bg-[#23232b] rounded-2xl p-6 max-w-md w-full mx-4 border border-cyan-900/30" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#e6a800] font-bold text-lg">Seleccionar Canal</h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {canales.map((canal) => (
                <button
                  key={canal.id}
                  onClick={() => handleSeleccionCanal(canal)}
                  disabled={!canal.puede_publicar}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    canal.puede_publicar
                      ? canalSeleccionado === canal.id
                        ? 'bg-[#e6a800] text-black border-[#e6a800]'
                        : 'bg-[#18181b] text-white border-gray-600 hover:border-[#e6a800] hover:bg-[#2a2a35]'
                      : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">#</span>
                    <div className="flex-1">
                      <div className="font-semibold">{canal.nombre}</div>
                      {canal.descripcion && (
                        <div className="text-xs opacity-75">{canal.descripcion}</div>
                      )}
                    </div>
                    {!canal.puede_publicar && (
                      <span className="text-red-400 text-sm">🔒</span>
                    )}
                  </div>
                  {!canal.puede_publicar && (
                    <div className="text-xs text-red-400 mt-1">
                      Requiere membresía premium
                    </div>
                  )}
                </button>
              ))}
            </div>

            {canales.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                No hay canales disponibles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectorCanales; 