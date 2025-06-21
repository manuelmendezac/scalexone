import React from 'react';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiZap, FiUser } from 'react-icons/fi';
import useNeuroState from '../store/useNeuroState';
import NivelesClasificacionDashboard from './NivelesClasificacionDashboard';
import RankingTopSellers from './RankingTopSellers';
import RankingTopCreators from './RankingTopCreators';
import RankingVentasCompacto from './RankingVentasCompacto';
import { supabase } from '../supabase';
import LoadingScreen from '../components/LoadingScreen';

const Dashboard: React.FC = () => {
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
            <RankingVentasCompacto />
          </div>
        </div>

        {/* Grid de Rankings de Creadores (CLONADO) */}
        <div className="bg-black/40 border border-[#00BFFF]/30 rounded-xl p-6 space-y-8">
          {/* Título y subtitulo nuevo */}
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

          {/* Podio de ganadores de Creadores */}
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
                className="w-24 h-24 rounded-full border-4 border-[#00BFFF] mb-2"
              />
              <div className="w-24 h-40 bg-[#00BFFF]/20 rounded-t-lg flex items-center justify-center">
                <span className="text-4xl">🚀</span>
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

          {/* Ranking de Creadores */}
          <div className="space-y-8">
            <RankingTopCreators />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 