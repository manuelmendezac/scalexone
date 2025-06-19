import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import SeguimientoGlobal from './SeguimientoGlobal';
import { FiZap, FiPlusCircle, FiUser, FiMessageCircle } from 'react-icons/fi';
import useNeuroState from '../store/useNeuroState';
import useRankingStore from '../store/useRankingStore';
import NivelesClasificacionDashboard from './NivelesClasificacionDashboard';
import { supabase } from '../supabase';
import LoadingScreen from '../components/LoadingScreen';

// Componente de ranking top 10
const RankingTop10 = () => {
  const { top10, userRank, loading, fetchRanking } = useRankingStore();

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  if (loading) {
    return <LoadingScreen message="Cargando ranking..." />;
  }

  return (
    <section className="w-full max-w-4xl mx-auto mb-8">
      <div className="bg-black/40 border border-neurolink-cyberBlue/30 rounded-2xl p-6 shadow-xl">
        <div className="text-neurolink-coldWhite/90 font-orbitron text-xl mb-4 flex items-center gap-2">
          🏆 Ranking Top 10 Evolución
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-neurolink-coldWhite/60 text-sm">
                <th className="py-2 pr-4">Puesto</th>
                <th className="py-2 pr-4">Avatar</th>
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">País</th>
                <th className="py-2 pr-4">Nivel</th>
                <th className="py-2 pr-4">XP</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((u, i) => (
                <tr key={u.email} className={`border-b border-neurolink-cyberBlue/10 ${userRank?.email === u.email ? 'bg-neurolink-cyberBlue/10' : ''}`}>
                  <td className="py-2 pr-4 font-bold">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="py-2 pr-4"><img src={u.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-neurolink-matrixGreen shadow" /></td>
                  <td className="py-2 pr-4">{u.nombre}</td>
                  <td className="py-2 pr-4 text-2xl">{u.pais}</td>
                  <td className="py-2 pr-4">{u.nivel}</td>
                  <td className="py-2 pr-4">{u.xp}</td>
                </tr>
              ))}
              {userRank && !top10.find(u => u.email === userRank.email) && (
                <tr className="bg-neurolink-cyberBlue/10">
                  <td className="py-2 pr-4 font-bold">{userRank.puesto}</td>
                  <td className="py-2 pr-4"><img src={userRank.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-neurolink-matrixGreen shadow" /></td>
                  <td className="py-2 pr-4">{userRank.nombre} (Tú)</td>
                  <td className="py-2 pr-4 text-2xl">{userRank.pais}</td>
                  <td className="py-2 pr-4">{userRank.nivel}</td>
                  <td className="py-2 pr-4">{userRank.xp}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const Dashboard: React.FC = () => {
  // Racha de uso diario (localStorage)
  const [streak, setStreak] = useState(1);
  const setAvatarUrl = useNeuroState(state => state.setAvatarUrl);
  const userInfo = useNeuroState(state => state.userInfo);
  const avatarUrl = useNeuroState(state => state.avatarUrl);

  // Sincronizar avatar real desde Supabase si no está en el store
  useEffect(() => {
    async function syncAvatar() {
      if (!avatarUrl && userInfo.email) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('avatar_url')
          .eq('email', userInfo.email)
          .single();
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    }
    syncAvatar();
  }, [avatarUrl, userInfo.email, setAvatarUrl]);

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    const ultimaFecha = localStorage.getItem('dashboard_ultimo_dia');
    let nuevaRacha = 1;
    if (ultimaFecha) {
      const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (ultimaFecha === ayer) {
        nuevaRacha = parseInt(localStorage.getItem('dashboard_racha') || '0', 10) + 1;
      }
    }
    localStorage.setItem('dashboard_ultimo_dia', hoy);
    localStorage.setItem('dashboard_racha', nuevaRacha.toString());
    setStreak(nuevaRacha);
  }, []);

  // Datos del store para nivel, XP y monedas
  const { userLevel, userXP, userCoins } = useNeuroState();
  const xpForNextLevel = userLevel * 1000;

  // Simulación de actividad reciente y accesos rápidos
  const actividad = [
    { icon: <FiMessageCircle />, texto: 'Última conversación con IA', fecha: 'Hoy' },
    { icon: <FiUser />, texto: 'Nuevo agente creado', fecha: 'Ayer' },
    { icon: <FiZap />, texto: 'Entrenamiento completado', fecha: 'Hace 2 días' },
  ];
  const accesos = [
    { icon: <FiPlusCircle />, texto: 'Crear agente', link: '/implementar-ia' },
    { icon: <FiZap />, texto: 'Alimentar fuentes', link: '/clasificacion/uploader' },
    { icon: <FiUser />, texto: 'Ver perfil', link: '/perfil' },
  ];

  // Datos para SeguimientoGlobal (puedes conectar a tu store real)
  const porcentaje = 40; // Simulado

  return (
    <div className="min-h-screen bg-black w-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-10"
      >
        {/* Niveles de Clasificación (Encabezado visual) */}
        <NivelesClasificacionDashboard />

        {/* Ranking Top 10 */}
        <RankingTop10 />

        {/* Barra de progreso global */}
        <section>
          <SeguimientoGlobal porcentaje={porcentaje} xp={userXP} coins={userCoins} />
        </section>

        {/* Accesos rápidos y actividad reciente */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Accesos rápidos */}
          <div className="bg-black/30 rounded-xl border border-[#FFD700]/30 p-6 flex flex-col gap-4 shadow-lg">
            <h3 className="text-white/90 font-orbitron text-lg">Accesos Rápidos</h3>
            <div className="grid grid-cols-1 gap-3">
              {accesos.map((acceso, i) => (
                <a
                  key={i}
                  href={acceso.link}
                  className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-[#FFD700]/20 hover:bg-[#FFD700]/10 transition-colors"
                >
                  <span className="text-[#FFD700] text-xl">{acceso.icon}</span>
                  <span className="text-white/80">{acceso.texto}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-black/30 rounded-xl border border-[#FFD700]/30 p-6 flex flex-col gap-4 shadow-lg">
            <h3 className="text-white/90 font-orbitron text-lg">Actividad Reciente</h3>
            <div className="grid grid-cols-1 gap-3">
              {actividad.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-[#FFD700]/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#FFD700] text-xl">{item.icon}</span>
                    <span className="text-white/80">{item.texto}</span>
                  </div>
                  <span className="text-white/50 text-sm">{item.fecha}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Dashboard; 