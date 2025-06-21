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
        const { data, error } = await supabase
          .from('progreso_usuario_xp')
          .select(`
            xp_actual,
            users (id, full_name, country, avatar_url, email)
          `)
          .order('xp_actual', { ascending: false })
          .limit(100);

        if (error) throw error;
        if (data) {
          const formatted: TopCreator[] = data
            .map((item: any, index: number) => item.users ? {
              puesto: index + 1,
              nombre: item.users.full_name || 'Usuario Anónimo',
              email: item.users.email || '',
              pais: item.users.country || '🌍',
              xp_total: item.xp_actual,
              nivel_academico: 'N/A',
              avatar: item.users.avatar_url || '/images/silueta-perfil.svg',
            } : null)
            .filter((c): c is TopCreator => c !== null);
          setCreators(formatted);
        }
      } catch (err) {
        console.error("Error fetching top creators:", err);
      } finally {
        setLoadingCreators(false);
      }
    };

    const fetchTopSellers = async () => {
        setLoadingSellers(true);
        try {
            const { data, error } = await supabase
                .from('progreso_ventas_usuario')
                .select(`
                    ventas_acumuladas,
                    users (id, full_name, country, avatar_url, email)
                `)
                .order('ventas_acumuladas', { ascending: false, nullsFirst: false })
                .limit(100);

            if (error) throw error;
            if (data) {
                const formatted: TopSeller[] = data
                    .map((item: any, index: number) => item.users ? {
                        puesto: index + 1,
                        nombre: item.users.full_name || 'Vendedor Anónimo',
                        email: item.users.email || '',
                        pais: item.users.country || '🌍',
                        ventas_totales: item.ventas_acumuladas,
                        nivel_ventas: 'N/A',
                        avatar: item.users.avatar_url || '/images/silueta-perfil.svg',
                    } : null)
                    .filter((s): s is TopSeller => s !== null);
                setSellers(formatted);
            }
        } catch (err) {
            console.error("Error fetching top sellers:", err);
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