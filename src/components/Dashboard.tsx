import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import UserLevelProgress from './UserLevelProgress';
import SeguimientoGlobal from './SeguimientoGlobal';
import { FiZap, FiPlusCircle, FiUser, FiMessageCircle } from 'react-icons/fi';
import useNeuroState from '../store/useNeuroState';

// Componente de ranking top 10
const RankingTop10 = ({ usuarioActual = 'manuel@email.com' }) => {
  // Datos simulados
  const top10 = [
    { nombre: 'Manuel Méndez', email: 'manuel@email.com', pais: '🇲🇽', nivel: 7, xp: 4200, avatar: '/avatars/7.png' },
    { nombre: 'Ana Torres', email: 'ana@email.com', pais: '🇪🇸', nivel: 6, xp: 3900, avatar: '/avatars/6.png' },
    { nombre: 'Lucas Silva', email: 'lucas@email.com', pais: '🇧🇷', nivel: 6, xp: 3700, avatar: '/avatars/6b.png' },
    { nombre: 'Sofía Rojas', email: 'sofia@email.com', pais: '🇨🇴', nivel: 5, xp: 3400, avatar: '/avatars/5.png' },
    { nombre: 'David Lee', email: 'david@email.com', pais: '🇺🇸', nivel: 5, xp: 3200, avatar: '/avatars/5b.png' },
    { nombre: 'Marta Ruiz', email: 'marta@email.com', pais: '🇦🇷', nivel: 4, xp: 3000, avatar: '/avatars/4.png' },
    { nombre: 'Juan Pérez', email: 'juan@email.com', pais: '🇲🇽', nivel: 4, xp: 2900, avatar: '/avatars/4b.png' },
    { nombre: 'Elena Gómez', email: 'elena@email.com', pais: '🇪🇸', nivel: 3, xp: 2700, avatar: '/avatars/3.png' },
    { nombre: 'Carlos Díaz', email: 'carlos@email.com', pais: '🇨🇱', nivel: 3, xp: 2500, avatar: '/avatars/3b.png' },
    { nombre: 'Sara López', email: 'sara@email.com', pais: '🇵🇪', nivel: 2, xp: 2300, avatar: '/avatars/2.png' },
  ];
  // Simular usuario fuera del top
  const usuario = { nombre: 'Tú', email: usuarioActual, pais: '🇲🇽', nivel: 2, xp: 1200, avatar: '/avatars/2b.png', puesto: 23 };
  const enTop = top10.find(u => u.email === usuarioActual);
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
                <tr key={u.email} className={`border-b border-neurolink-cyberBlue/10 ${u.email === usuarioActual ? 'bg-neurolink-cyberBlue/10' : ''}`}>
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
              {!enTop && (
                <tr className="bg-neurolink-cyberBlue/10">
                  <td className="py-2 pr-4 font-bold">{usuario.puesto}</td>
                  <td className="py-2 pr-4"><img src={usuario.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-neurolink-matrixGreen shadow" /></td>
                  <td className="py-2 pr-4">{usuario.nombre} (Tú)</td>
                  <td className="py-2 pr-4 text-2xl">{usuario.pais}</td>
                  <td className="py-2 pr-4">{usuario.nivel}</td>
                  <td className="py-2 pr-4">{usuario.xp}</td>
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
    { icon: <FiZap />, texto: 'Alimentar fuentes', link: '/dashboard/uploader' },
    { icon: <FiUser />, texto: 'Ver perfil', link: '/perfil' },
  ];

  // Datos para SeguimientoGlobal (puedes conectar a tu store real)
  const porcentaje = 40; // Simulado

  return (
    <div className="min-h-screen bg-neurolink-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-10"
      >
        {/* Panel de tarjetas de nivel, experiencia y monedas (estilo horizontal) */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Nivel */}
            <div className="border border-neurolink-cyberBlue/40 rounded-xl p-6 bg-black/60 flex flex-col items-start gap-2 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-neurolink-matrixGreen text-2xl"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 21h10M12 17v4M17 17a5 5 0 0 0 2-4V7.5a2.5 2.5 0 0 0-5 0V13a2.5 2.5 0 0 1-5 0V7.5a2.5 2.5 0 0 0-5 0V13a5 5 0 0 0 2 4"/></svg></span>
                <span className="font-orbitron text-xl text-neurolink-coldWhite">Nivel {userLevel}</span>
              </div>
              <span className="text-neurolink-coldWhite/70 text-base font-mono">{userXP} / {xpForNextLevel} XP</span>
            </div>
            {/* Experiencia Total */}
            <div className="border border-neurolink-cyberBlue/40 rounded-xl p-6 bg-black/60 flex flex-col items-start gap-2 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-neurolink-matrixGreen text-2xl"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17.75l-6.16 3.24 1.18-6.88L2 9.76l6.92-1L12 2.5l3.08 6.26 6.92 1-5.02 4.35 1.18 6.88z"/></svg></span>
                <span className="font-orbitron text-xl text-neurolink-coldWhite">Experiencia Total</span>
              </div>
              <span className="text-neurolink-matrixGreen text-2xl font-bold">{userXP} XP</span>
            </div>
            {/* Monedas */}
            <div className="border border-neurolink-cyberBlue/40 rounded-xl p-6 bg-black/60 flex flex-col items-start gap-2 shadow-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-neurolink-matrixGreen text-2xl"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg></span>
                <span className="font-orbitron text-xl text-neurolink-coldWhite">Monedas</span>
              </div>
              <span className="text-neurolink-matrixGreen text-2xl font-bold">{userCoins}</span>
            </div>
          </div>
        </section>

        {/* Panel de nivel, experiencia, monedas y racha */}
        <section>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
            <div className="flex-1">
              <UserLevelProgress />
            </div>
            <div className="flex flex-col items-center justify-center min-w-[180px] bg-black/40 border border-neurolink-cyberBlue/30 rounded-2xl p-6 shadow-xl">
              <div className="text-neurolink-matrixGreen text-4xl font-bold mb-2">🔥 {streak}</div>
              <div className="text-neurolink-coldWhite/80 text-lg font-orbitron">Racha de uso</div>
              <div className="text-neurolink-coldWhite/50 text-sm">Días seguidos</div>
            </div>
          </div>
        </section>

        {/* Ranking Top 10 */}
        <RankingTop10 usuarioActual="manuel@email.com" />

        {/* Barra de progreso global */}
        <section>
          <SeguimientoGlobal porcentaje={porcentaje} xp={userXP} coins={userCoins} />
        </section>

        {/* Accesos rápidos y actividad reciente */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Accesos rápidos */}
          <div className="bg-black/30 rounded-xl border border-neurolink-cyberBlue/30 p-6 flex flex-col gap-4 shadow-lg">
            <div className="text-neurolink-coldWhite/80 font-orbitron text-lg mb-2">Accesos rápidos</div>
            <div className="flex flex-wrap gap-4">
              {accesos.map((a, i) => (
                <a key={i} href={a.link} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/40 font-semibold transition">
                  {a.icon}
                  <span>{a.texto}</span>
                </a>
              ))}
            </div>
          </div>
          {/* Actividad reciente */}
          <div className="bg-black/30 rounded-xl border border-neurolink-cyberBlue/30 p-6 flex flex-col gap-4 shadow-lg">
            <div className="text-neurolink-coldWhite/80 font-orbitron text-lg mb-2">Actividad reciente</div>
            <ul className="space-y-2">
              {actividad.map((a, i) => (
                <li key={i} className="flex items-center gap-3 text-neurolink-coldWhite/80">
                  <span className="text-neurolink-matrixGreen text-xl">{a.icon}</span>
                  <span>{a.texto}</span>
                  <span className="ml-auto text-xs text-neurolink-coldWhite/40">{a.fecha}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Dashboard; 