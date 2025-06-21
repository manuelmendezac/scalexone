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
  puesto: number;
}

const RankingTopSellers = () => {
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopSellers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          full_name,
          email,
          country,
          avatar_url,
          progreso_ventas_usuario (
            ventas_acumuladas
          )
        `)
        .order('ventas_acumuladas', { referencedTable: 'progreso_ventas_usuario', ascending: false, nullsFirst: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedSellers = data
          .filter(user => user.progreso_ventas_usuario && user.progreso_ventas_usuario.length > 0 && user.progreso_ventas_usuario[0].ventas_acumuladas !== null)
          .map((user, index) => ({
            puesto: index + 1,
            nombre: user.full_name,
            email: user.email,
            pais: user.country || '🌎',
            ventas_totales: user.progreso_ventas_usuario[0].ventas_acumuladas,
            nivel_ventas: 'Starter',
            avatar: user.avatar_url || '/images/silueta-perfil.svg',
          }));
        setTopSellers(formattedSellers);
      }
    } catch (err) {
      console.error('Error al cargar top sellers:', err);
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