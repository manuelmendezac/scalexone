import React from 'react';

// Interfaz para un creador individual en el podio
interface PodiumCreator {
  nombre: string;
  avatar: string;
  xp_total: number;
  puesto: number;
}

// Props que recibe el componente del podio
interface TopCreatorsPodiumProps {
  topThree: PodiumCreator[];
  loading: boolean;
}

// Componente para un solo puesto en el podio (1er, 2do, 3er lugar)
const PodiumStand: React.FC<{ creator: PodiumCreator, positionClass: string, medal: string }> = ({ creator, positionClass, medal }) => {
  return (
    <div className={`flex flex-col items-center ${positionClass}`}>
      <div className="relative">
        <img
          src={creator.avatar}
          alt={`Avatar de ${creator.nombre}`}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 object-cover"
          style={{
            borderColor: creator.puesto === 1 ? '#FFD700' : creator.puesto === 2 ? '#C0C0C0' : '#CD7F32'
          }}
        />
        <span className="absolute -bottom-2 -right-2 text-3xl">{medal}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-white truncate w-36 text-center">{creator.nombre}</h3>
      <p className="text-[#FFD700] font-semibold">{creator.xp_total.toLocaleString()} XP</p>
      <div 
        className="w-full mt-2 rounded-t-lg bg-gradient-to-t from-yellow-600 to-yellow-400 shadow-lg"
        style={{ 
          height: creator.puesto === 1 ? '100px' : creator.puesto === 2 ? '70px' : '40px',
          background: creator.puesto === 1 
            ? 'linear-gradient(to top, #FFD700, #F0C400)' 
            : creator.puesto === 2 
            ? 'linear-gradient(to top, #C0C0C0, #A9A9A9)' 
            : 'linear-gradient(to top, #CD7F32, #B87329)'
        }}
      >
        <span className="text-5xl font-extrabold text-black/50 absolute bottom-1 left-1/2 -translate-x-1/2">
          {creator.puesto}
        </span>
      </div>
    </div>
  );
};


// Componente principal del podio
const TopCreatorsPodium: React.FC<TopCreatorsPodiumProps> = ({ topThree, loading }) => {
  if (loading) {
    return <div className="text-center text-white/80 py-10">Cargando podio de creadores...</div>;
  }

  const segundoLugar = topThree.find(c => c.puesto === 2) || { avatar: '/images/silueta-perfil.svg', nombre: '...' };
  const primerLugar = topThree.find(c => c.puesto === 1) || { avatar: '/images/silueta-perfil.svg', nombre: '...' };
  const tercerLugar = topThree.find(c => c.puesto === 3) || { avatar: '/images/silueta-perfil.svg', nombre: '...' };

  return (
    <div className="flex justify-center items-end gap-8 mb-12 mt-4">
      {/* Segundo lugar */}
      <div className="flex flex-col items-center text-center">
        <img src={segundoLugar.avatar} alt="Segundo lugar" className="w-20 h-20 rounded-full border-4 border-[#C0C0C0] mb-2" />
        <p className="text-white font-bold">{segundoLugar.nombre}</p>
        <div className="w-24 h-32 bg-[#C0C0C0]/20 rounded-t-lg flex items-center justify-center">
          <span className="text-4xl">🥈</span>
        </div>
      </div>
      {/* Primer lugar */}
      <div className="flex flex-col items-center text-center">
        <img src={primerLugar.avatar} alt="Primer lugar" className="w-24 h-24 rounded-full border-4 border-[#00BFFF] mb-2" />
        <p className="text-white font-bold">{primerLugar.nombre}</p>
        <div className="w-24 h-40 bg-[#00BFFF]/20 rounded-t-lg flex items-center justify-center">
          <span className="text-4xl">🚀</span>
        </div>
      </div>
      {/* Tercer lugar */}
      <div className="flex flex-col items-center text-center">
        <img src={tercerLugar.avatar} alt="Tercer lugar" className="w-20 h-20 rounded-full border-4 border-[#CD7F32] mb-2" />
        <p className="text-white font-bold">{tercerLugar.nombre}</p>
        <div className="w-24 h-24 bg-[#CD7F32]/20 rounded-t-lg flex items-center justify-center">
          <span className="text-4xl">🥉</span>
        </div>
      </div>
    </div>
  );
};

export default TopCreatorsPodium; 