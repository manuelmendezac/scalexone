import React, { useState, useEffect } from 'react';
import NivelesClasificacionDashboard from '../components/NivelesClasificacionDashboard';
import ExperienciaUsuario from '../components/ExperienciaUsuario';
import RankingTopCreators from '../components/RankingTopCreators';
import TopCreatorsPodium from '../components/TopCreatorsPodium';
import { supabase } from '../supabase';

interface TopCreator {
  nombre: string;
  email: string;
  pais: string;
  xp_total: number;
  nivel_academico: string;
  avatar: string;
  puesto: number;
}

const Clasificacion: React.FC = () => {
  const [creators, setCreators] = useState<TopCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopCreators = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('progreso_usuario_xp')
          .select(`
            xp_actual,
            usuarios (
              id,
              full_name,
              country,
              avatar_url,
              email
            )
          `)
          .order('xp_actual', { ascending: false })
          .limit(100);

        if (error) {
          throw error;
        }

        if (data) {
          const formattedCreators = data
            .map((item: any, index: number) => {
              if (!item.usuarios) {
                return null; 
              }
              return {
                puesto: index + 1,
                nombre: item.usuarios.full_name || 'Usuario Anónimo',
                email: item.usuarios.email || '', 
                pais: item.usuarios.country || '🌍',
                xp_total: item.xp_actual,
                nivel_academico: 'N/A', // Este dato no está en la tabla, lo dejamos pendiente
                avatar: item.usuarios.avatar_url || '/images/silueta-perfil.svg',
              };
            })
            .filter((creator): creator is TopCreator => creator !== null);
          
          setCreators(formattedCreators);
        }
      } catch (err) {
        console.error("Error fetching top creators:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCreators();
  }, []);

  // Extraer los 3 mejores para el podio
  const topThree = creators.slice(0, 3);

  return (
    <div className="container mx-auto p-4 space-y-8">
      
      <TopCreatorsPodium topThree={topThree} loading={loading} />

      <div className="mt-8">
        <RankingTopCreators creators={creators} loading={loading} />
      </div>
      
      <div className="mt-12 pt-8 border-t border-yellow-500/20">
         <h2 className="text-2xl font-bold text-center text-white mb-8">Tu Progreso Personal</h2>
        <ExperienciaUsuario />
        <NivelesClasificacionDashboard />
      </div>

    </div>
  );
};

export default Clasificacion; 