import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import LoadingScreen from './LoadingScreen';
import TopCreatorsPodium from './TopCreatorsPodium';
import RankingTopCreators from './RankingTopCreators';

// Interfaces de datos
interface TopSeller {
  nombre: string;
  email: string;
  pais: string;
  ventas_totales: number;
  nivel_ventas: string;
  avatar: string;
  puesto: number;
}
interface TopCreator {
    nombre: string;
    avatar: string;
    puesto: number;
    xp_total: number;
    email: string;
    pais: string;
    nivel_academico: string;
}

const RankingManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'educacion' | 'ventas'>('educacion');
  
  // Estado para Vendedores
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [userRank, setUserRank] = useState<TopSeller | null>(null);
  const [loadingSellers, setLoadingSellers] = useState(true);

  // Estado para Creadores
  const [creators, setCreators] = useState<TopCreator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);

  // Lógica para Vendedores (la original de este componente)
  const fetchTopSellers = async () => {
    setLoadingSellers(true);
    try {
        const { data: progressData, error: progressError } = await supabase
            .from('progreso_ventas_usuario')
            .select('usuario_id, ventas_acumuladas')
            .order('ventas_acumuladas', { ascending: false, nullsFirst: false })
            .limit(10); // Límite para el top 10

        if (progressError) throw progressError;
        if (!progressData || progressData.length === 0) {
            setTopSellers([]);
            return;
        }

        const userIds = progressData.map(p => p.usuario_id).filter(Boolean);
        if (userIds.length === 0) {
            setTopSellers([]);
            return;
        }

        const { data: usersData, error: usersError } = await supabase
            .from('usuarios')
            .select('id, full_name, email, country, avatar_url')
            .in('id', userIds);
        
        if (usersError) throw usersError;
        if (!usersData) {
            setTopSellers([]);
            return;
        }

        const usersById = new Map(usersData.map(u => [u.id, u]));

        const formattedSellers: TopSeller[] = progressData
            .map((progress, index) => {
                const user = usersById.get(progress.usuario_id);
                if (!user) return null;
                return {
                    puesto: index + 1,
                    nombre: user.full_name || 'Vendedor Anónimo',
                    email: user.email || '',
                    pais: user.country || '🌎',
                    ventas_totales: progress.ventas_acumuladas || 0,
                    nivel_ventas: 'Starter', // Simplificado, se puede mejorar después
                    avatar: user.avatar_url || '/images/silueta-perfil.svg',
                };
            })
            .filter((s): s is TopSeller => s !== null);

        setTopSellers(formattedSellers);

        // La lógica para 'userRank' (el rango del usuario actual) se puede re-implementar aquí si es necesario
        // Por simplicidad, la omitimos de momento para asegurar que el ranking principal funcione.
        setUserRank(null);

    } catch (error) {
      console.error('Error al cargar top sellers:', error);
      setTopSellers([]);
    } finally {
      setLoadingSellers(false);
    }
  };

  // Lógica para Creadores (la que construimos)
  const fetchTopCreators = async () => {
    setLoadingCreators(true);
    try {
        const { data: progressData, error: progressError } = await supabase
          .from('progreso_usuario_xp')
          .select('usuario_id, xp_actual')
          .order('xp_actual', { ascending: false })
          .limit(100);

        if (progressError) throw progressError;
        if (!progressData || progressData.length === 0) {
            setCreators([]); return;
        }

        const userIds = progressData.map(p => p.usuario_id).filter(Boolean);
        if (userIds.length === 0) {
            setCreators([]); return;
        }

        const { data: usersData, error: usersError } = await supabase
            .from('usuarios')
            .select('id, full_name, country, avatar_url, email')
            .in('id', userIds);

        if (usersError) throw usersError;
        if (!usersData) {
            setCreators([]); return;
        }

        const usersById = new Map(usersData.map(u => [u.id, u]));
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
        setLoadingCreators(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ventas') {
      fetchTopSellers();
    } else {
      fetchTopCreators();
    }
  }, [activeTab]);

  return (
    <section className="w-full max-w-4xl mx-auto mb-8">
      {/* Selector de Pestañas */}
       <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8">
        <button
          onClick={() => setActiveTab('educacion')}
          className={`px-6 py-4 rounded-xl font-bold text-lg transition-all ${
            activeTab === 'educacion'
              ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20'
              : 'bg-black/40 text-[#FFD700] border border-[#FFD700]/30'
          }`}
        >
          Ranking por Educación
        </button>
        <button
          onClick={() => setActiveTab('ventas')}
          className={`px-6 py-4 rounded-xl font-bold text-lg transition-all ${
            activeTab === 'ventas'
              ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20'
              : 'bg-black/40 text-[#FFD700] border border-[#FFD700]/30'
          }`}
        >
          Ranking por Ventas
        </button>
      </div>

      {activeTab === 'educacion' && (
        <>
          <TopCreatorsPodium topThree={creators.slice(0, 3)} loading={loadingCreators} />
          <div className="mt-8">
            <RankingTopCreators creators={creators} loading={loadingCreators} />
          </div>
        </>
      )}

      {activeTab === 'ventas' && (
        <div className="bg-black/40 border border-[#FFD700]/30 rounded-2xl p-6 shadow-xl">
            { loadingSellers ? <LoadingScreen message="Cargando ranking de ventas..." /> :
            <>
                <div className="text-white/90 font-orbitron text-xl mb-4 flex items-center gap-2">
                    🏆 Ranking Top 10 Sellers
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
                            <th className="py-2 pr-4">Ventas Totales</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topSellers.map((seller, i) => (
                            <tr key={seller.email} className={`border-b border-[#FFD700]/10 ${userRank?.email === seller.email ? 'bg-[#FFD700]/10' : ''}`}>
                              <td className="py-2 pr-4 font-bold">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                              </td>
                              <td className="py-2 pr-4">
                                <img 
                                  src={seller.avatar} 
                                  alt="avatar" 
                                  className="w-10 h-10 rounded-full border-2 border-[#FFD700] shadow" 
                                />
                              </td>
                              <td className="py-2 pr-4 text-white">{seller.nombre}</td>
                              <td className="py-2 pr-4 text-2xl">{seller.pais}</td>
                              <td className="py-2 pr-4 text-white">{seller.nivel_ventas}</td>
                              <td className="py-2 pr-4 text-[#FFD700] font-bold">${seller.ventas_totales.toLocaleString()}</td>
                            </tr>
                          ))}
                          {userRank && !topSellers.find(s => s.email === userRank.email) && (
                            <tr className="bg-[#FFD700]/10">
                              <td className="py-2 pr-4 font-bold">{userRank.puesto}</td>
                              <td className="py-2 pr-4">
                                <img 
                                  src={userRank.avatar} 
                                  alt="avatar" 
                                  className="w-10 h-10 rounded-full border-2 border-[#FFD700] shadow" 
                                />
                              </td>
                              <td className="py-2 pr-4 text-white">{userRank.nombre} (Tú)</td>
                              <td className="py-2 pr-4 text-2xl">{userRank.pais}</td>
                              <td className="py-2 pr-4 text-white">{userRank.nivel_ventas}</td>
                              <td className="py-2 pr-4 text-[#FFD700] font-bold">${userRank.ventas_totales.toLocaleString()}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                </div>
            </>
            }
        </div>
      )}
    </section>
  );
};

export default RankingManager; 