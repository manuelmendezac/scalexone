import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import LoadingScreen from './LoadingScreen';

// Helper para convertir país a bandera
const getFlagEmoji = (countryName: string | null): string => {
  if (!countryName) return '🌎';
  const countryMap: { [key: string]: string } = {
    'Perú': '🇵🇪',
    'México': '🇲🇽',
    'Colombia': '🇨🇴',
    'Argentina': '🇦🇷',
    'España': '🇪🇸',
    // Añade más países según sea necesario
  };
  return countryMap[countryName] || '🌎';
};

interface TopSeller {
  nombre: string;
  email: string;
  pais: string;
  ventas_totales: number;
  nivel_ventas: string;
  avatar: string;
  puesto: number;
}

const RankingTopSellers = () => {
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopSellers = async () => {
    setLoading(true);
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('progreso_ventas_usuario')
        .select('usuario_id, ventas_acumuladas')
        .order('ventas_acumuladas', { ascending: false, nullsFirst: false })
        .limit(10);

      if (progressError) throw progressError;

      if (!progressData || progressData.length === 0) {
        setTopSellers([]);
        setLoading(false);
        return;
      }
      
      const userIds = progressData.map(p => p.usuario_id).filter(Boolean);
      if (userIds.length === 0) {
        setTopSellers([]);
        setLoading(false);
        return;
      }

      const { data: usersData, error: usersError } = await supabase
        .from('usuarios')
        .select('id, name, email, pais, avatar_url')
        .in('id', userIds);

      if (usersError) throw usersError;

      const usersById = usersData ? new Map(usersData.map(u => [u.id, u])) : new Map();

      const formattedSellers: TopSeller[] = progressData
        .map((progress, index) => {
            const user = usersById.get(progress.usuario_id);
            if (!user) return null;
            return {
                puesto: index + 1,
                nombre: user.name || 'Vendedor Anónimo',
                email: user.email || '',
                pais: getFlagEmoji(user.pais),
                ventas_totales: progress.ventas_acumuladas || 0,
                nivel_ventas: 'Starter',
                avatar: user.avatar_url || '/images/silueta-perfil.svg',
            };
        })
        .filter((s): s is TopSeller => s !== null);

      setTopSellers(formattedSellers);

    } catch (err) {
      console.error('Error al cargar top sellers:', err);
      setTopSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSellers();
  }, []);

  if (loading) {
    return <LoadingScreen message="Cargando ranking de ventas..." />;
  }

  return (
    <section className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-black/40 border border-[#FFD700]/30 rounded-2xl p-6 shadow-xl">
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
                <tr key={seller.email} className={`border-b border-[#FFD700]/10`}>
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
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default RankingTopSellers; 