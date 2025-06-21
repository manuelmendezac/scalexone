import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiZap, FiUser } from 'react-icons/fi';
import useNeuroState from '../store/useNeuroState';
import NivelesClasificacionDashboard from './NivelesClasificacionDashboard';
import RankingTopSellers from './RankingTopSellers';
import TopCreatorsPodium from './TopCreatorsPodium';
import RankingTopCreators from './RankingTopCreators';
import { supabase } from '../supabase';
import LoadingScreen from '../components/LoadingScreen';

interface TopCreator {
  nombre: string;
  avatar: string;
  puesto: number;
  xp_total: number;
  email: string;
  pais: string;
  nivel_academico: string;
}

const Dashboard: React.FC = () => {
  const [creators, setCreators] = useState<TopCreator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopCreators = async () => {
      setLoading(true);
      try {
        // Lógica de dos pasos que sí funciona
        const { data: progressData, error: progressError } = await supabase
          .from('progreso_usuario_xp')
          .select('usuario_id, xp_actual')
          .order('xp_actual', { ascending: false })
          .limit(100);

        if (progressError) throw progressError;

        if (!progressData || progressData.length === 0) {
            setCreators([]);
            setLoading(false);
            return;
        }

        const userIds = progressData.map(p => p.usuario_id).filter(Boolean);
        if (userIds.length === 0) {
            setCreators([]);
            setLoading(false);
            return;
        }

        const { data: usersData, error: usersError } = await supabase
            .from('usuarios')
            .select('id, name, email, avatar_url')
            .in('id', userIds);

        if (usersError) throw usersError;

        const usersById = usersData ? new Map(usersData.map(u => [u.id, u])) : new Map();
        
        const formattedCreators: TopCreator[] = progressData
            .map((progress, index) => {
                const user = usersById.get(progress.usuario_id);
                if (!user) return null;
                return {
                    puesto: index + 1,
                    nombre: user.name || 'Usuario Anónimo',
                    email: user.email || '',
                    pais: '🌍',
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
        setLoading(false);
      }
    };

    fetchTopCreators();
  }, []);

  const accesos = [
    { icon: <FiPlusCircle />, texto: 'Crear agente', link: '/implementar-ia' },
    { icon: <FiZap />, texto: 'Alimentar fuentes', link: '/clasificacion/uploader' },
    { icon: <FiUser />, texto: 'Ver perfil', link: '/perfil' },
  ];

  return (
    <div className="min-h-screen bg-black w-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-10"
      >
        {/* Niveles de Clasificación (Encabezado visual) */}
        <NivelesClasificacionDashboard />

        {/* Grid de Rankings de Ventas */}
        <div className="bg-black/40 border border-[#FFD700]/30 rounded-xl p-6 space-y-8">
          {/* Título nuevo para Ventas */}
          <div className="text-center mb-6">
            <h4 className="text-2xl font-semibold text-[#FFD700] mb-2">
              Este ranking no es de likes, es de resultados. Revisa la tabla de Campeones.
            </h4>
          </div>
          {/* Título y actualización */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-orbitron text-white/90 flex items-center gap-2">
              🏆 Top Afiliados
            </h3>
            <span className="text-[#FFD700] text-sm">
              Actualizado en tiempo real
            </span>
          </div>

          {/* Podio de ganadores de Ventas */}
          <div className="flex justify-center items-end gap-8 mb-12 mt-4">
            {/* Segundo lugar */}
            <div className="flex flex-col items-center">
              <img
                src="/images/silueta-perfil.svg"
                alt="Segundo lugar"
                className="w-20 h-20 rounded-full border-4 border-[#C0C0C0] mb-2"
              />
              <div className="w-24 h-32 bg-[#C0C0C0]/20 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">🥈</span>
              </div>
            </div>

            {/* Primer lugar */}
            <div className="flex flex-col items-center">
              <img
                src="/images/silueta-perfil.svg"
                alt="Primer lugar"
                className="w-24 h-24 rounded-full border-4 border-[#FFD700] mb-2"
              />
              <div className="w-24 h-40 bg-[#FFD700]/20 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">👑</span>
              </div>
            </div>

            {/* Tercer lugar */}
            <div className="flex flex-col items-center">
              <img
                src="/images/silueta-perfil.svg"
                alt="Tercer lugar"
                className="w-20 h-20 rounded-full border-4 border-[#CD7F32] mb-2"
              />
              <div className="w-24 h-24 bg-[#CD7F32]/20 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">🥉</span>
              </div>
            </div>
          </div>

          {/* Rankings de Ventas */}
          <div className="space-y-8">
            <RankingTopSellers />
          </div>
        </div>

        {/* Grid de Rankings de Creadores (Ahora con datos) */}
        <div className="bg-black/40 border border-[#00BFFF]/30 rounded-xl p-6 space-y-8">
          {/* Título */}
          <div className="text-center mb-6">
            <h4 className="text-2xl font-semibold text-[#FFD700] mb-2">
              Esta tabla no mide notas, mide transformación. Mira quién está ascendiendo.
            </h4>
          </div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-orbitron text-white/90 flex items-center gap-2">
              🏆 Top Creadores
            </h3>
            <span className="text-[#00BFFF] text-sm">
              Actualizado en tiempo real
            </span>
          </div>

          <TopCreatorsPodium topThree={creators.slice(0, 3)} loading={loading} />

          <div className="mt-8">
            <RankingTopCreators creators={creators} loading={loading} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 