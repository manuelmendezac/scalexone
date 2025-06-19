import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import LoadingScreen from './LoadingScreen';

interface TopSeller {
  nombre: string;
  email: string;
  pais: string;
  ventas_totales: number;
  nivel_ventas: string;
  avatar: string;
  puesto?: number;
}

const RankingTopSellers = () => {
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [userRank, setUserRank] = useState<TopSeller | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTopSellers = async () => {
    try {
      setLoading(true);
      
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      // Obtener top 10 vendedores
      const { data: sellers, error } = await supabase
        .from('usuarios')
        .select(`
          nombre,
          email,
          pais,
          avatar_url as avatar,
          progreso_ventas_usuario (
            ventas_acumuladas,
            nivel_actual
          ),
          niveles_ventas (
            nombre
          )
        `)
        .order('ventas_acumuladas', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Formatear datos
      const formattedSellers = sellers.map((seller, index) => ({
        nombre: seller.nombre,
        email: seller.email,
        pais: seller.pais || '🌎',
        ventas_totales: seller.progreso_ventas_usuario?.ventas_acumuladas || 0,
        nivel_ventas: seller.niveles_ventas?.nombre || 'Starter',
        avatar: seller.avatar || '/images/silueta-perfil.svg',
        puesto: index + 1
      }));

      setTopSellers(formattedSellers);

      // Si el usuario actual no está en el top 10, obtener su posición
      if (user && !formattedSellers.find(s => s.email === user.email)) {
        const { data: userPosition } = await supabase
          .rpc('get_seller_rank', { user_email: user.email });
        
        if (userPosition) {
          const { data: userData } = await supabase
            .from('usuarios')
            .select(`
              nombre,
              email,
              pais,
              avatar_url as avatar,
              progreso_ventas_usuario (
                ventas_acumuladas,
                nivel_actual
              ),
              niveles_ventas (
                nombre
              )
            `)
            .eq('email', user.email)
            .single();

          if (userData) {
            setUserRank({
              nombre: userData.nombre,
              email: userData.email,
              pais: userData.pais || '🌎',
              ventas_totales: userData.progreso_ventas_usuario?.ventas_acumuladas || 0,
              nivel_ventas: userData.niveles_ventas?.nombre || 'Starter',
              avatar: userData.avatar_url || '/images/silueta-perfil.svg',
              puesto: userPosition
            });
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar top sellers:', error);
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
      </div>
    </section>
  );
};

export default RankingTopSellers; 