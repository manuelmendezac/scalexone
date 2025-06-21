import React, { useState, useEffect } from 'react';
import RankingTopCreators from '../components/RankingTopCreators';
import TopCreatorsPodium from '../components/TopCreatorsPodium';
import RankingTopSellers from '../components/RankingTopSellers';
import TopSellersPodium from '../components/TopSellersPodium';
import { supabase } from '../supabase';

// Interfaz para los datos del ranking de Creadores
interface TopCreator {
  nombre: string;
  avatar: string;
  puesto: number;
  xp_total: number;
  email: string;
  pais: string;
  nivel_academico: string;
}

// Interfaz para los datos del ranking de Vendedores
interface TopSeller {
  nombre: string;
  avatar: string;
  puesto: number;
  ventas_totales: number;
  email: string;
  pais: string;
  nivel_ventas: string;
}

const Clasificacion: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'educacion' | 'ventas'>('educacion');
  const [creators, setCreators] = useState<TopCreator[]>([]);
  const [sellers, setSellers] = useState<TopSeller[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [loadingSellers, setLoadingSellers] = useState(true);

  useEffect(() => {
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
            setCreators([]);
            return;
        }

        const userIds = progressData.map(p => p.usuario_id).filter(Boolean);
        if (userIds.length === 0) {
            setCreators([]);
            return;
        }

        const { data: usersData, error: usersError } = await supabase
            .from('usuarios')
            .select('id, full_name, country, avatar_url, email')
            .in('id', userIds);

        if (usersError) throw usersError;
        if (!usersData) {
            setCreators([]);
            return;
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

    const fetchTopSellers = async () => {
        setLoadingSellers(true);
        try {
            const { data: progressData, error: progressError } = await supabase
                .from('progreso_ventas_usuario')
                .select('usuario_id, ventas_acumuladas')
                .order('ventas_acumuladas', { ascending: false, nullsFirst: false })
                .limit(100);
            
            if (progressError) throw progressError;
            if (!progressData || progressData.length === 0) {
                setSellers([]);
                return;
            }
    
            const userIds = progressData.map(p => p.usuario_id).filter(Boolean);
            if (userIds.length === 0) {
                setSellers([]);
                return;
            }
    
            const { data: usersData, error: usersError } = await supabase
                .from('usuarios')
                .select('id, full_name, country, avatar_url, email')
                .in('id', userIds);
    
            if (usersError) throw usersError;
            if (!usersData) {
                setSellers([]);
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
                        pais: user.country || '🌍',
                        ventas_totales: progress.ventas_acumuladas || 0,
                        nivel_ventas: 'N/A',
                        avatar: user.avatar_url || '/images/silueta-perfil.svg',
                    };
                })
                .filter((s): s is TopSeller => s !== null);
            
            setSellers(formattedSellers);
        } catch (err) {
            console.error("Error fetching top sellers:", err);
            setSellers([]);
        } finally {
            setLoadingSellers(false);
        }
    };

    if (activeTab === 'educacion') {
      fetchTopCreators();
    } else {
      fetchTopSellers();
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto p-4 space-y-8">
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

      {activeTab === 'educacion' ? (
        <>
          <TopCreatorsPodium topThree={creators.slice(0, 3)} loading={loadingCreators} />
          <div className="mt-8">
            <RankingTopCreators creators={creators} loading={loadingCreators} />
          </div>
        </>
      ) : (
        <>
          <TopSellersPodium topThree={sellers.slice(0, 3)} loading={loadingSellers} />
          <div className="mt-8">
            <RankingTopSellers /> 
          </div>
        </>
      )}
    </div>
  );
};

export default Clasificacion; 