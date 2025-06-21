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
    return (
      <div className="flex justify-center items-end h-72 bg-black/20 rounded-xl">
        <p className="text-white/80 mb-8">Cargando el podio de los campeones...</p>
      </div>
    );
  }
  
  if (topThree.length < 3) {
    return (
       <div className="text-center text-white/80 py-4">No hay suficientes creadores para mostrar el podio.</div>
    )
  }

  const [first, second, third] = topThree;

  return (
    <div className="bg-black/40 border border-[#FFD700]/30 rounded-2xl p-6 shadow-xl text-center">
      <h2 className="text-2xl font-bold text-white mb-2 font-orbitron">
        Esta tabla no mide notas, mide transformación.
      </h2>
      <p className="text-yellow-400 mb-8 text-lg">Mira quién está ascendiendo.</p>
      
      <div className="flex justify-around items-end max-w-3xl mx-auto px-4" style={{ minHeight: '300px' }}>
        {/* Segundo Lugar */}
        {second && <PodiumStand creator={second} positionClass="order-2" medal="🥈" />}
        
        {/* Primer Lugar */}
        {first && <PodiumStand creator={first} positionClass="order-1" medal="🥇" />}
        
        {/* Tercer Lugar */}
        {third && <PodiumStand creator={third} positionClass="order-3" medal="🥉" />}
      </div>
       <p className="text-sm text-white/50 text-right mt-4">Actualizado en tiempo real</p>
    </div>
  );
};

export default TopCreatorsPodium; 