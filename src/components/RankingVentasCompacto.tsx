import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';

interface VendedorRanking {
  id: string;
  nombre: string;
  avatar_url: string;
  ventas_totales: number;
  ventas_mes: number;
  nivel: string;
  posicion: number;
}

const RankingVentasCompacto = () => {
  const [vendedores, setVendedores] = useState<VendedorRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarRanking = async () => {
      try {
        const { data: rankingData, error } = await supabase
          .rpc('obtener_ranking_ventas_detallado');

        if (error) throw error;

        setVendedores(rankingData || []);
      } catch (error) {
        console.error('Error al cargar ranking:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarRanking();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="bg-black/40 border border-[#FFD700]/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-orbitron text-white/90">
          🏆 Top Vendedores
        </h3>
        <div className="flex gap-4">
          <span className="text-[#FFD700] text-sm">
            Actualizado en tiempo real
          </span>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4"
      >
        {vendedores.slice(0, 5).map((vendedor, index) => (
          <motion.div
            key={vendedor.id}
            variants={itemVariants}
            className="relative flex items-center bg-black/30 rounded-lg p-4 border border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-all"
          >
            {/* Posición */}
            <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-bold shadow-lg">
              {index + 1}
            </div>

            {/* Avatar y Nombre */}
            <div className="flex items-center flex-1">
              <div className="relative">
                <img
                  src={vendedor.avatar_url || '/images/silueta-perfil.svg'}
                  alt={vendedor.nombre}
                  className="w-12 h-12 rounded-full border-2 border-[#FFD700]/50"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/80 border border-[#FFD700]/30 flex items-center justify-center">
                  {index === 0 ? '👑' : index === 1 ? '⭐' : '✨'}
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-white font-medium">{vendedor.nombre}</h4>
                <p className="text-[#FFD700]/70 text-sm">{vendedor.nivel}</p>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="flex items-center gap-6 ml-4">
              <div className="text-right">
                <p className="text-sm text-white/60">Total</p>
                <p className="text-[#FFD700] font-bold">
                  ${vendedor.ventas_totales.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">Este mes</p>
                <p className="text-[#FFD700] font-bold">
                  ${vendedor.ventas_mes.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Indicador de tendencia */}
            <div className="ml-6 w-8">
              {vendedor.ventas_mes > 1000 ? (
                <span className="text-green-400">↑</span>
              ) : vendedor.ventas_mes > 500 ? (
                <span className="text-yellow-400">→</span>
              ) : (
                <span className="text-red-400">↓</span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default RankingVentasCompacto; 