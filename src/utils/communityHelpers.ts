import { supabase } from '../supabase';

// Cache para evitar consultas repetidas
const communityUUIDCache = new Map<string, string>();

/**
 * Convierte un community_id (string) a UUID de comunidad
 * Maneja el mapeo entre 'scalexone' -> UUID real de ScaleXone
 */
export const getCommunityUUID = async (communitySlug: string): Promise<string | null> => {
  // Verificar cache primero
  if (communityUUIDCache.has(communitySlug)) {
    const cachedValue = communityUUIDCache.get(communitySlug) || null;
    console.log(`🔍 UUID desde cache para ${communitySlug}:`, cachedValue);
    return cachedValue;
  }

  try {
    console.log(`🔍 Buscando UUID para comunidad: ${communitySlug}`);
    
    const { data, error } = await supabase
      .from('comunidades')
      .select('id, nombre, slug')
      .eq('slug', communitySlug)
      .single();

    console.log('📊 Resultado búsqueda por slug:', { data, error });

    if (!error && data) {
      // Guardar en cache
      communityUUIDCache.set(communitySlug, data.id);
      console.log(`✅ UUID encontrado para ${communitySlug}:`, data.id);
      return data.id;
    }

    // Si no encuentra por slug, intentar por nombre
    console.log(`🔍 Buscando por nombre que contenga: ${communitySlug}`);
    const { data: dataByName, error: errorByName } = await supabase
      .from('comunidades')
      .select('id, nombre, slug')
      .ilike('nombre', `%${communitySlug}%`)
      .single();

    console.log('📊 Resultado búsqueda por nombre:', { dataByName, errorByName });

    if (!errorByName && dataByName) {
      communityUUIDCache.set(communitySlug, dataByName.id);
      console.log(`✅ UUID encontrado por nombre para ${communitySlug}:`, dataByName.id);
      return dataByName.id;
    }

    console.warn(`⚠️ No se encontró comunidad para: ${communitySlug}`);
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo UUID de comunidad:', error);
    return null;
  }
};

/**
 * Hook personalizado para ScaleXone que maneja automáticamente la conversión
 */
export const useScaleXoneCommunity = () => {
  const [communityUUID, setCommunityUUID] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUUID = async () => {
      setLoading(true);
      const uuid = await getCommunityUUID('scalexone');
      setCommunityUUID(uuid);
      setLoading(false);
    };

    fetchUUID();
  }, []);

  return { communityUUID, loading };
};

/**
 * Función helper para consultas que necesitan UUID
 * Uso: const uuid = await ensureCommunityUUID(userInfo.community_id);
 */
export const ensureCommunityUUID = async (communityId: string): Promise<string | null> => {
  // Si ya es un UUID (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(communityId)) {
    return communityId;
  }

  // Si es un slug, convertir a UUID
  return await getCommunityUUID(communityId);
};

/**
 * Limpia el cache (útil para testing o cuando se crean nuevas comunidades)
 */
export const clearCommunityCache = () => {
  communityUUIDCache.clear();
};

// Importar React para el hook
import React from 'react'; 