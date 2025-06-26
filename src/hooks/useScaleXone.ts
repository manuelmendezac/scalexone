import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { ensureCommunityUUID } from '../utils/communityHelpers';
import useNeuroState from '../store/useNeuroState';

interface ScaleXoneData {
  communityUUID: string | null;
  totalMiembros: number;
  totalCanales: number;
  totalPosts: number;
  topUsers: Array<{
    id: string;
    nombre: string;
    avatar_url: string;
    puntos: number;
  }>;
  canalesActivos: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    activo: boolean;
  }>;
}

/**
 * Hook principal para ScaleXone como maqueta maestra
 * Maneja toda la lógica de datos para la marca blanca
 */
export const useScaleXone = () => {
  const { userInfo } = useNeuroState();
  const [data, setData] = useState<ScaleXoneData>({
    communityUUID: null,
    totalMiembros: 0,
    totalCanales: 0,
    totalPosts: 0,
    topUsers: [],
    canalesActivos: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScaleXoneData = async () => {
      if (!userInfo.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Obtener UUID de ScaleXone
        const communityUUID = await ensureCommunityUUID('scalexone');
        
        if (!communityUUID) {
          throw new Error('No se pudo encontrar la comunidad ScaleXone');
        }

        // 2. Obtener estadísticas en paralelo
        const [
          miembrosResult,
          canalesResult,
          postsResult,
          topUsersResult
        ] = await Promise.all([
          // Contar miembros (usando string community_id)
          supabase
            .from('usuarios')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', 'scalexone'),
          
          // Obtener canales activos (usando UUID)
          supabase.rpc('get_canales_por_comunidad', {
            p_community_id: communityUUID
          }),
          
          // Contar posts (usando UUID si existe la tabla)
          supabase
            .from('comunidad_posts')
            .select('*', { count: 'exact', head: true })
            .eq('community_id', communityUUID),
          
          // Top usuarios por nivel
          supabase
            .from('usuarios')
            .select('id, nombre, avatar_url, nivel_usuario')
            .eq('community_id', 'scalexone')
            .order('nivel_usuario', { ascending: false })
            .limit(4)
        ]);

        // 3. Procesar resultados
        const newData: ScaleXoneData = {
          communityUUID,
          totalMiembros: miembrosResult.count || 0,
          totalCanales: canalesResult.data?.length || 0,
          totalPosts: postsResult.count || 0,
          topUsers: (topUsersResult.data || []).map(user => ({
            ...user,
            puntos: user.nivel_usuario || 0
          })),
          canalesActivos: canalesResult.data?.filter((canal: any) => canal.activo) || []
        };

        setData(newData);

      } catch (err: any) {
        console.error('Error cargando datos de ScaleXone:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchScaleXoneData();
  }, [userInfo.id]);

  return {
    ...data,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      // El useEffect se disparará automáticamente
    }
  };
};

/**
 * Hook específico para obtener solo el UUID de ScaleXone
 * Útil para componentes que solo necesitan el UUID
 */
export const useScaleXoneUUID = () => {
  const [communityUUID, setCommunityUUID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUUID = async () => {
      const uuid = await ensureCommunityUUID('scalexone');
      setCommunityUUID(uuid);
      setLoading(false);
    };

    fetchUUID();
  }, []);

  return { communityUUID, loading };
}; 