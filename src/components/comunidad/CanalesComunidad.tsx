import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import useNeuroState from "../../store/useNeuroState";

interface Canal {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  activo: boolean;
  orden: number;
  membresia_requerida: string | null;
}

interface CanalesComunidadProps {
  onCanalChange: (canalId: string, nombreCanal: string) => void;
  canalActivo: string;
}

export default function CanalesComunidad({ onCanalChange, canalActivo }: CanalesComunidadProps) {
  const [canales, setCanales] = useState<Canal[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [communityUUID, setCommunityUUID] = useState<string | null>(null);
  
  const { userInfo } = useNeuroState();
  const community_id = userInfo?.community_id || 'scalexone';

  // Obtener UUID de comunidad
  const getCommunityUUID = async (communitySlug: string): Promise<string | null> => {
    try {
      const { data: comunidad, error } = await supabase
        .from("comunidades")
        .select("id")
        .eq("slug", communitySlug)
        .single();
      
      if (comunidad && !error) {
        return comunidad.id;
      }
      
      const { data: comunidadByName, error: errorByName } = await supabase
        .from("comunidades")
        .select("id")
        .ilike("nombre", `%${communitySlug}%`)
        .single();
      
      return comunidadByName?.id || null;
    } catch (error) {
      console.error("Error al obtener UUID de comunidad:", error);
      return null;
    }
  };

  // Cargar UUID y luego canales
  useEffect(() => {
    const initializeData = async () => {
      if (community_id) {
        const uuid = await getCommunityUUID(community_id);
        if (uuid) {
          setCommunityUUID(uuid);
        }
      }
    };
    
    initializeData();
  }, [community_id]);

  useEffect(() => {
    if (communityUUID) {
      fetchCanales();
    }
  }, [communityUUID]);

  const fetchCanales = async () => {
    if (!communityUUID) return;
    
    try {
      const { data, error } = await supabase
        .from("canales_comunidad")
        .select("*")
        .eq("community_id", communityUUID)
        .eq("activo", true)
        .order("orden", { ascending: true });
      
      if (error) throw error;
      
      setCanales(data || []);
      
      // Seleccionar primer canal por defecto si no hay uno activo
      if (!canalActivo && data && data.length > 0) {
        onCanalChange(data[0].id, data[0].nombre);
      }
    } catch (error) {
      console.error("Error cargando canales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCanalClick = (canal: Canal) => {
    onCanalChange(canal.id, canal.nombre);
  };

  const toggleMostrarTodos = () => {
    setMostrarTodos(!mostrarTodos);
  };

  if (loading) {
    return (
      <div className="w-full flex items-center gap-2 px-2 py-2 bg-neutral-900 rounded-xl mb-4 border border-cyan-900/30">
        <div className="flex-1 bg-neutral-800 rounded-xl px-3 py-2 animate-pulse h-8"></div>
        <div className="flex-1 bg-neutral-800 rounded-xl px-3 py-2 animate-pulse h-8"></div>
        <div className="flex-1 bg-neutral-800 rounded-xl px-3 py-2 animate-pulse h-8"></div>
      </div>
    );
  }

  if (canales.length === 0) {
    return (
      <div className="w-full flex items-center justify-center px-4 py-3 bg-neutral-900 rounded-xl mb-4 border border-cyan-900/30">
        <span className="text-gray-400 text-sm">No hay canales disponibles</span>
      </div>
    );
  }

  // Lógica para mostrar canales
  const LIMITE_INICIAL = 3;
  const canalesAMostrar = mostrarTodos ? canales : canales.slice(0, LIMITE_INICIAL);
  const hayMasCanales = canales.length > LIMITE_INICIAL;

  return (
    <div className="w-full px-2 py-2 bg-neutral-900 rounded-xl mb-4 border border-cyan-900/30 shadow-md">
      {/* Fila de canales */}
      <div className="flex items-center gap-2 flex-wrap">
        {canalesAMostrar.map((canal) => (
          <button
            key={canal.id}
            onClick={() => handleCanalClick(canal)}
            className={`
              flex-shrink-0 px-3 py-2 rounded-xl font-bold text-sm transition-all duration-200
              ${canalActivo === canal.id 
                ? 'bg-[#e6a800] text-black shadow-md' 
                : 'bg-[#23232b] text-white hover:bg-[#e6a800] hover:text-black'
              }
              ${canal.tipo === 'private' ? 'border border-yellow-400/50' : ''}
            `}
            title={canal.descripcion}
          >
            <span className="flex items-center gap-1">
              {canal.tipo === 'private' && <span className="text-xs">🔒</span>}
              #{canal.nombre}
              {canal.membresia_requerida && <span className="text-xs">⭐</span>}
            </span>
          </button>
        ))}
        
        {/* Botón Más/Menos */}
        {hayMasCanales && (
          <button
            onClick={toggleMostrarTodos}
            className="flex-shrink-0 px-3 py-2 rounded-xl font-bold text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            {mostrarTodos ? `Menos... (${canales.length - LIMITE_INICIAL})` : `Más... (+${canales.length - LIMITE_INICIAL})`}
          </button>
        )}
      </div>
      
      {/* Información del canal activo */}
      {canalActivo && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          {(() => {
            const canal = canales.find(c => c.id === canalActivo);
            return canal ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-medium text-[#e6a800]">#{canal.nombre}</span>
                <span>•</span>
                <span>{canal.descripcion}</span>
                {canal.membresia_requerida && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-400">Requiere membresía</span>
                  </>
                )}
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
} 