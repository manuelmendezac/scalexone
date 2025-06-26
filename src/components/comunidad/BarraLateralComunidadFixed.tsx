import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import useNeuroState from '../../store/useNeuroState';
import { Loader2 } from 'lucide-react';

interface Community {
  id: string;
  nombre: string;
  descripcion: string;
  logo_url: string;
  banner_url: string;
  is_public: boolean;
  owner_id: string;
  slug?: string;
}

interface CommunityStats {
  totalMiembros: number;
  totalCursos: number;
  totalServicios: number;
}

interface Canal {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface TopUser {
  id: string;
  nombre: string;
  avatar_url: string;
  puntos: number;
}

const BarraLateralComunidad = () => {
  const { userInfo } = useNeuroState();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CommunityStats>({ totalMiembros: 0, totalCursos: 0, totalServicios: 0 });
  const [canales, setCanales] = useState<Canal[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [recentMembers, setRecentMembers] = useState<TopUser[]>([]);

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

  // Función para obtener estadísticas de la comunidad
  const fetchCommunityStats = async (communityId: string) => {
    try {
      // Contar miembros totales - usar slug 'scalexone' en lugar de UUID
      const { count: miembrosCount } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('community_id', 'scalexone');

      // Por ahora cursos y servicios son 0 hasta que los implementemos
      setStats({
        totalMiembros: miembrosCount || 0,
        totalCursos: 0, // TODO: Implementar cuando tengamos tabla de cursos
        totalServicios: 0 // TODO: Implementar cuando tengamos tabla de servicios
      });
    } catch (error) {
      console.error('Error fetching community stats:', error);
    }
  };

  // Función para obtener canales
  const fetchCanales = async (communityId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_canales_por_comunidad', {
        p_community_id: communityId
      });

      if (!error && data) {
        setCanales(data);
      }
    } catch (error) {
      console.error('Error fetching canales:', error);
    }
  };

  // Función para obtener top usuarios (ranking)
  const fetchTopUsers = async () => {
    try {
      // Obtener usuarios ordenados por XP o puntos
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre, avatar_url, nivel_usuario')
        .eq('community_id', 'scalexone')
        .order('nivel_usuario', { ascending: false })
        .limit(4);

      if (!error && data) {
        const usersWithPoints = data.map(user => ({
          ...user,
          puntos: user.nivel_usuario || 0
        }));
        setTopUsers(usersWithPoints);
      }
    } catch (error) {
      console.error('Error fetching top users:', error);
    }
  };

  // Función para obtener miembros recientes
  const fetchRecentMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre, avatar_url, nivel_usuario')
        .eq('community_id', 'scalexone')
        .order('created_at', { ascending: false })
        .limit(4);

      if (!error && data) {
        const usersWithPoints = data.map(user => ({
          ...user,
          puntos: user.nivel_usuario || 0
        }));
        setRecentMembers(usersWithPoints);
      }
    } catch (error) {
      console.error('Error fetching recent members:', error);
    }
  };

  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!userInfo.id) {
        setLoading(false);
        return;
      }

      try {
        let communityData = null;
        
        // 1. Primero intentar obtener ScaleXOne si el usuario tiene community_id = 'scalexone'
        if (userInfo.community_id === 'scalexone' || userInfo.community_id === 'default') {
          const { data: scalexoneData, error: scalexoneError } = await supabase
            .from('comunidades')
            .select('*')
            .eq('slug', 'scalexone')
            .single();
            
          if (!scalexoneError && scalexoneData) {
            communityData = scalexoneData;
          }
        }
        
        // 2. Si no encontró ScaleXOne, buscar comunidades donde el usuario sea owner
        if (!communityData) {
          const { data: ownedData, error: ownedError } = await supabase
            .from('comunidades')
            .select('*')
            .eq('owner_id', userInfo.id)
            .limit(1)
            .single();
            
          if (!ownedError && ownedData) {
            communityData = ownedData;
          }
        }
        
        // 3. Si aún no hay comunidad, buscar cualquier comunidad pública
        if (!communityData) {
          const { data: publicData, error: publicError } = await supabase
            .from('comunidades')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (!publicError && publicData) {
            communityData = publicData;
          }
        }

        if (communityData) {
          setCommunity(communityData);
          
          // Obtener datos adicionales
          await Promise.all([
            fetchCommunityStats(communityData.id),
            fetchCanales(communityData.id),
            fetchTopUsers(),
            fetchRecentMembers()
          ]);
        }
        
      } catch (error) {
        console.error('Error fetching community data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [userInfo.id, userInfo.community_id]);

  const getLogoFallback = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=e6a800&color=fff&size=96`;
  };

  const getChannelIcon = (channelName: string) => {
    const name = channelName.toLowerCase();
    if (name.includes('general')) return '🏠';
    if (name.includes('presentat') || name.includes('presentacion')) return '👋';
    if (name.includes('recurso')) return '📚';
    if (name.includes('networking') || name.includes('network')) return '🤝';
    if (name.includes('idea')) return '💡';
    if (name.includes('proyecto')) return '🚀';
    if (name.includes('chat')) return '💬';
    if (name.includes('anuncio')) return '📢';
    if (name.includes('soporte') || name.includes('ayuda')) return '🛠️';
    if (name.includes('vip') || name.includes('premium')) return '⭐';
    return '📁'; // Icono por defecto
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 bg-[#23232b] rounded-2xl">
        <Loader2 className="animate-spin h-8 w-8 text-yellow-400" />
      </div>
    );
  }

  const communityName = community?.nombre || 'ScaleXOne';
  const communityDescription = community?.descripcion || 'Plataforma de crecimiento empresarial y herramientas de IA';
  const communityBanner = community?.banner_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
  const communityLogo = community?.logo_url || getLogoFallback(communityName);
  const communityStatus = community?.is_public ? 'Comunidad pública' : 'Comunidad privada';
  
  // Verificar si el usuario puede editar (es owner o admin)
  const canEdit = community?.owner_id === userInfo.id || userInfo.rol === 'admin';

  return (
    <div className="flex flex-col gap-6">
      {/* Portada de la comunidad */}
      <div className="bg-[#23232b] rounded-2xl overflow-hidden shadow-lg mb-2">
        <div className="h-28 w-full bg-cover bg-center" style={{backgroundImage: `url(${communityBanner})`}} />
        <div className="flex flex-col items-center p-4">
          <img src={communityLogo} alt="Comunidad" className="w-20 h-20 rounded-full border-4 border-[#18181b] -mt-12 mb-2 bg-[#e6a800] object-cover" width="80" height="80" loading="lazy" />
          <h3 className="text-xl font-bold text-white mb-1">{communityName}</h3>
          <span className="text-[#e6a800] font-semibold text-sm mb-1">{communityStatus}</span>
          <span className="text-gray-400 text-xs text-center">{communityDescription}</span>
        </div>
      </div>
      
      {/* Miembros, cursos, servicios */}
      <div className="bg-[#23232b] rounded-2xl p-4 flex flex-col items-center gap-2">
        <div className="flex gap-4 mb-2">
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg">{stats.totalMiembros}</span>
            <span className="text-gray-400 text-xs">Miembros</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg">{stats.totalCursos}</span>
            <span className="text-gray-400 text-xs">Cursos</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg">{stats.totalServicios}</span>
            <span className="text-gray-400 text-xs">Servicios</span>
          </div>
        </div>
        
        {/* Avatares de miembros recientes */}
        <div className="flex -space-x-3 mb-2">
          {recentMembers.slice(0, 4).map((member, index) => (
            <img 
              key={member.id} 
              className="w-8 h-8 rounded-full border-2 border-[#18181b] object-cover" 
              src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.nombre)}&background=e6a800&color=fff&size=32`} 
              alt={member.nombre} 
              width="32" 
              height="32" 
              loading="lazy" 
            />
          ))}
          {stats.totalMiembros > 4 && (
            <span className="w-8 h-8 rounded-full bg-[#e6a800] text-white flex items-center justify-center text-xs font-bold border-2 border-[#18181b]">
              +{stats.totalMiembros - 4}
            </span>
          )}
        </div>
        
        {/* Botones según permisos */}
        <div className="w-full space-y-2">
          {canEdit && (
            <Link to="/configuracion-admin" className="w-full py-2 rounded-xl bg-[#e6a800] text-black font-bold text-base hover:bg-[#ffb300] transition text-center block">
              Configuración Admin
            </Link>
          )}
          
          <Link to="/comunidad" className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition text-center block">
            Ir al Feed
          </Link>
        </div>
      </div>
      
      {/* Leaderboard */}
      <div className="bg-[#23232b] rounded-2xl p-4">
        <h4 className="text-[#e6a800] font-bold mb-2 text-sm">Leaderboard</h4>
        {topUsers.length > 0 ? (
          <ol className="list-decimal list-inside text-white text-sm space-y-1">
            {topUsers.map((user, index) => (
              <li key={user.id}>
                {user.nombre} (+{user.puntos})
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-400 text-sm">No hay datos disponibles</p>
        )}
      </div>
      
      {/* Lista de canales/temas */}
      <div className="bg-[#23232b] rounded-2xl p-4">
        <h4 className="text-[#e6a800] font-bold mb-2 text-sm">Canales</h4>
        {canales.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {canales.filter(canal => canal.activo).map((canal) => (
              <li key={canal.id} className="text-white hover:text-[#e6a800] cursor-pointer">
                {getChannelIcon(canal.nombre)} {canal.nombre}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No hay canales disponibles</p>
        )}
      </div>
    </div>
  );
};

export default BarraLateralComunidad; 