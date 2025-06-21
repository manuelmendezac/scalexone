import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import LoadingScreen from './LoadingScreen';

interface TopCreator {
  nombre: string;
  email: string;
  pais: string;
  xp_total: number;
  nivel_academico: string;
  avatar: string;
  puesto?: number;
}

const RankingTopCreators = () => {
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const fetchTopCreators = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? '');
      }

      // RPC para obtener el ranking de creadores
      const { data: creators, error } = await supabase
        .rpc('get_top_creators')
        .limit(10);

      if (error) {
        console.error("Error fetching top creators:", error);
        throw error;
      }

      const formattedCreators = creators.map((creator: any, index: number) => ({
        nombre: creator.nombre,
        email: creator.email,
        pais: creator.pais || '🌎',
        xp_total: creator.xp_actual,
        nivel_academico: creator.nivel_nombre || 'Básico',
        avatar: creator.avatar_url || '/images/silueta-perfil.svg',
        puesto: index + 1,
      }));

      setTopCreators(formattedCreators);
    } catch (error) {
      console.error('Error al cargar top creators:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopCreators();
  }, []);

  if (loading) {
    return <LoadingScreen message="Cargando ranking de creadores..." />;
  }

  return (
    <section className="w-full max-w-4xl mx-auto mb-8">
       <div className="bg-black/40 border border-[#FFD700]/30 rounded-2xl p-6 shadow-xl">
        <div className="text-white/90 font-orbitron text-xl mb-4 flex items-center gap-2">
          🏆 TOP RANKING DE CREADORES
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-[#FFD700] text-sm">
                <th className="py-2 pr-4">Puesto</th>
                <th className="py-2 pr-4">Avatar</th>
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">País</th>
                <th className="py-2 pr-4">Nivel</th>
                <th className="py-2 pr-4">XP Total</th>
              </tr>
            </thead>
            <tbody>
              {topCreators.map((creator, i) => (
                <tr key={creator.email} className={`border-b border-[#FFD700]/10 ${userEmail === creator.email ? 'bg-[#FFD700]/10' : ''}`}>
                  <td className="py-2 pr-4 font-bold">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="py-2 pr-4">
                    <img 
                      src={creator.avatar} 
                      alt="avatar" 
                      className="w-10 h-10 rounded-full border-2 border-[#FFD700] shadow" 
                    />
                  </td>
                  <td className="py-2 pr-4 text-white">{creator.nombre}</td>
                  <td className="py-2 pr-4 text-2xl">{creator.pais}</td>
                  <td className="py-2 pr-4 text-white">{creator.nivel_academico}</td>
                  <td className="py-2 pr-4 text-[#FFD700] font-bold">{creator.xp_total.toLocaleString()} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RankingTopCreators; 