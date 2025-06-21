import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

import TopCreatorsPodium from '../components/TopCreatorsPodium';
import RankingTopCreators from '../components/RankingTopCreators';
import RankingTopSellers from '../components/RankingTopSellers';

// Interfaces de datos para mantener el código limpio
interface TopCreator {
  nombre: string;
  avatar: string;
  puesto: number;
  xp_total: number;
  email: string;
  pais: string;
  nivel_academico: string;
}

const ClasificacionPage: React.FC = () => {
  const [creators, setCreators] = useState<TopCreator[]>([]);
  const [loading, setLoading] = useState(true);

  // Forzando un nuevo deploy para refrescar la caché
  useEffect(() => {
    const fetchTopCreators = async () => {
      setLoading(true);
      try {
        const { data: progressData, error: progressError } = await supabase
          .from('progreso_usuario_xp')
          .select('usuario_id, xp_actual')
          .order('xp_actual', { ascending: false })
          .limit(100);

        if (progressError) throw progressError;

        if (!progressData || progressData.length === 0) {
            setCreators([]);
            setLoading(false);
            return;
        }

        const userIds = progressData.map(p => p.usuario_id).filter(Boolean);
        if (userIds.length === 0) {
            setCreators([]);
            setLoading(false);
            return;
        }

        const { data: usersData, error: usersError } = await supabase
            .from('usuarios')
            .select('id, full_name, email, country, avatar_url')
            .in('id', userIds);

        if (usersError) throw usersError;

        const usersById = usersData ? new Map(usersData.map(u => [u.id, u])) : new Map();
        
        const formattedCreators: TopCreator[] = progressData
            .map((progress, index) => {
                const user = usersById.get(progress.usuario_id);
                if (!user) return null;
                return {
                    puesto: index + 1,
                    nombre: user.full_name || 'Usuario Anónimo',
                    email: user.email || '',
                    pais: user.country || '🌍',
                    xp_total: progress.xp_actual,
                    nivel_academico: 'N/A',
                    avatar: user.avatar_url || '/images/silueta-perfil.svg',
                };
            })
            .filter((c): c is TopCreator => c !== null);

        setCreators(formattedCreators);
      } catch (err) {
        console.error("Error fetching top creators:", err);
        setCreators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCreators();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-12">
      <h1 className="text-white text-3xl font-bold text-center">Página de Rankings v3</h1>
      {/* Se descomenta el ranking de vendedores una vez corregido */}
      <RankingTopSellers />

      {/* --- Ranking de Creadores (Educación por XP) --- */}
      <div>
        <TopCreatorsPodium topThree={creators.slice(0, 3)} loading={loading} />
        <div className="mt-8">
          <RankingTopCreators creators={creators} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default ClasificacionPage; 