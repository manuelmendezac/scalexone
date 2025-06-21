import React from 'react';
import LoadingScreen from './LoadingScreen';

interface TopCreator {
  nombre: string;
  email: string;
  pais: string;
  xp_total: number;
  nivel_academico: string;
  avatar: string;
  puesto?: number;
}

interface RankingProps {
  creators: TopCreator[];
  loading: boolean;
}

const RankingTopCreators: React.FC<RankingProps> = ({ creators, loading }) => {
  // Ya no necesita su propio estado de email, se puede añadir si es necesario después
  
  if (loading) {
    return <div className="text-center text-white/80 py-4">Cargando tabla de creadores...</div>;
  }

  return (
    <div className="bg-black/40 border border-[#FFD700]/30 rounded-2xl p-6 shadow-xl">
      <div className="text-white/90 font-orbitron text-xl mb-4 flex items-center gap-2">
        🏆 TOP RANKING DE CREADORES
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
              <th className="py-2 pr-4">XP Total</th>
            </tr>
          </thead>
          <tbody>
            {creators.map((creator, i) => (
              <tr key={creator.email} className={`border-b border-[#FFD700]/10`}>
                <td className="py-2 pr-4 font-bold">
                  {creator.puesto === 1 ? '🥇' : creator.puesto === 2 ? '🥈' : creator.puesto === 3 ? '🥉' : creator.puesto}
                </td>
                <td className="py-2 pr-4">
                  <img 
                    src={creator.avatar} 
                    alt="avatar" 
                    className="w-10 h-10 rounded-full border-2 border-[#FFD700] shadow" 
                  />
                </td>
                <td className="py-2 pr-4 text-white">{creator.nombre}</td>
                <td className="py-2 pr-4 text-2xl">{creator.pais}</td>
                <td className="py-2 pr-4 text-white">{creator.nivel_academico}</td>
                <td className="py-2 pr-4 text-[#FFD700] font-bold">{creator.xp_total.toLocaleString()} XP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTopCreators; 