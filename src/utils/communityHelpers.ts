import { supabase } from '../supabase';
import React from 'react';

// Cache para evitar consultas repetidas
const communityUUIDCache = new Map<string, string>();

/**
 * SOLUCIÓN CONSERVADORA: Wrapper inteligente que mantiene compatibilidad
 * Esta función maneja automáticamente todos los casos sin romper funcionalidades
 */
export const getCommunityUUID = async (communitySlug: string): Promise<string | null> => {
  // Si ya es un UUID válido, devolverlo tal como está
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(communitySlug)) {
    return communitySlug;
  }

  // Verificar cache primero
  if (communityUUIDCache.has(communitySlug)) {
    const cachedValue = communityUUIDCache.get(communitySlug) || null;
    console.log(`🔍 UUID desde cache para ${communitySlug}:`, cachedValue);
    return cachedValue;
  }

  try {
    console.log(`🔍 Buscando UUID para comunidad: ${communitySlug}`);
    
    // ESTRATEGIA 1: Buscar por slug exacto
    const { data, error } = await supabase
      .from('comunidades')
      .select('id, nombre, slug')
      .eq('slug', communitySlug)
      .single();

    if (!error && data) {
      communityUUIDCache.set(communitySlug, data.id);
      console.log(`✅ UUID encontrado por slug para ${communitySlug}:`, data.id);
      return data.id;
    }

    // ESTRATEGIA 2: Buscar por nombre que contenga el término
    const { data: dataByName, error: errorByName } = await supabase
      .from('comunidades')
      .select('id, nombre, slug')
      .ilike('nombre', `%${communitySlug}%`)
      .single();

    if (!errorByName && dataByName) {
      communityUUIDCache.set(communitySlug, dataByName.id);
      console.log(`✅ UUID encontrado por nombre para ${communitySlug}:`, dataByName.id);
      return dataByName.id;
    }

    // ESTRATEGIA 3: Para 'default' o casos especiales, buscar ScaleXone
    if (communitySlug === 'default' || communitySlug === 'scalexone') {
      const { data: scalexoneData, error: scalexoneError } = await supabase
        .from('comunidades')
        .select('id, nombre, slug')
        .eq('slug', 'scalexone')
        .single();

      if (!scalexoneError && scalexoneData) {
        communityUUIDCache.set(communitySlug, scalexoneData.id);
        communityUUIDCache.set('scalexone', scalexoneData.id);
        communityUUIDCache.set('default', scalexoneData.id);
        console.log(`✅ UUID ScaleXone encontrado para ${communitySlug}:`, scalexoneData.id);
        return scalexoneData.id;
      }
    }

    console.warn(`⚠️ No se encontró comunidad para: ${communitySlug}`);
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo UUID de comunidad:', error);
    return null;
  }
};

/**
 * WRAPPER CONSERVADOR: Función que mantiene compatibilidad total
 * Maneja automáticamente conversiones sin romper código existente
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
 * HOOK CONSERVADOR: Mantiene funcionalidad existente
 * Solo mejora la lógica interna sin cambiar la API
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
 * FUNCIÓN UNIVERSAL: Obtiene UUID de comunidad para cualquier usuario
 * Mantiene toda la lógica existente funcionando
 */
export const getCommunityUUIDForUser = async (userInfo: any): Promise<string | null> => {
  try {
    // Si el usuario ya tiene un UUID válido, usarlo
    if (userInfo?.community_id && userInfo.community_id.length > 10) {
      const uuid = await ensureCommunityUUID(userInfo.community_id);
      if (uuid) return uuid;
    }

    // LÓGICA CONSERVADORA: Mantener el comportamiento actual
    // 1. Primero intentar ScaleXone si es 'scalexone' o 'default'
    if (userInfo?.community_id === 'scalexone' || userInfo?.community_id === 'default' || !userInfo?.community_id) {
      const scalexoneUUID = await getCommunityUUID('scalexone');
      if (scalexoneUUID) return scalexoneUUID;
    }

    // Fallback directo al UUID de ScaleXone si no se encuentra por slug
    if (!userInfo?.community_id || userInfo.community_id === 'scalexone' || userInfo.community_id === 'default') {
      return '8fb70d6e-3237-465e-8669-979461cf2bc1';
    }

    // 2. Si no encontró ScaleXone, buscar por owner_id (lógica existente)
    if (userInfo?.id) {
      const { data, error } = await supabase
        .from('comunidades')
        .select('id')
        .eq('owner_id', userInfo.id)
        .single();
        
      if (!error && data) {
        return data.id;
      }
    }

    // 3. Fallback: Buscar cualquier comunidad pública (mantener compatibilidad)
    const { data: publicData, error: publicError } = await supabase
      .from('comunidades')
      .select('id')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (!publicError && publicData) {
      return publicData.id;
    }

    return null;
  } catch (error) {
    console.error('Error en getCommunityUUIDForUser:', error);
    return null;
  }
};

/**
 * FUNCIÓN DE MIGRACIÓN SUAVE: Actualiza componentes gradualmente
 * Permite migrar un componente a la vez sin romper otros
 */
export const useCommunityUUIDMigration = (userInfo: any) => {
  const [communityUUID, setCommunityUUID] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUUID = async () => {
      try {
        setLoading(true);
        setError(null);
        const uuid = await getCommunityUUIDForUser(userInfo);
        setCommunityUUID(uuid);
        
        if (!uuid) {
          setError('No se pudo determinar la comunidad del usuario');
        }
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
        console.error('Error en useCommunityUUIDMigration:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.id) {
      fetchUUID();
    } else {
      setLoading(false);
    }
  }, [userInfo?.id, userInfo?.community_id]);

  return { communityUUID, loading, error };
};

/**
 * Limpia el cache (útil para testing o cuando se crean nuevas comunidades)
 */
export const clearCommunityCache = () => {
  communityUUIDCache.clear();
}; 