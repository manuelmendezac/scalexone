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

  useEffect(() => {
    const fetchTopCreators = async () => {
      setLoading(true);
      try {
        // La corrección clave está aquí: volvemos a 'usuarios' y simplificamos la consulta
        const { data, error } = await supabase
          .from('usuarios')
          .select(`
            full_name,
            email,
            country,
            avatar_url,
            progreso_usuario_xp (
              xp_actual
            )
          `)
          .order('xp_actual', { referencedTable: 'progreso_usuario_xp', ascending: false })
          .limit(100);

        if (error) throw error;
        
        if (data) {
          const formattedCreators: TopCreator[] = data
            .filter(user => user.progreso_usuario_xp && user.progreso_usuario_xp.length > 0)
            .map((user, index) => ({
              puesto: index + 1,
              nombre: user.full_name || 'Usuario Anónimo',
              email: user.email || '',
              pais: user.country || '🌍',
              xp_total: user.progreso_usuario_xp[0].xp_actual,
              nivel_academico: 'N/A',
              avatar: user.avatar_url || '/images/silueta-perfil.svg',
            }));
          setCreators(formattedCreators);
        }

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