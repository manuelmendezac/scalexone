import React from 'react';

// Interfaz genérica para la entidad en el podio (puede ser creador o vendedor)
interface PodiumEntity {
  nombre: string;
  avatar: string;
  puesto: number;
  ventas_totales?: number; // Opcional, para vendedores
}

// Props que recibe el componente del podio
interface TopSellersPodiumProps {
  topThree: PodiumEntity[];
  loading: boolean;
}

// Componente para un solo puesto en el podio (1er, 2do, 3er lugar)
const PodiumStand: React.FC<{ entity: PodiumEntity, positionClass: string, medal: string }> = ({ entity, positionClass, medal }) => {
  return (
    <div className={`flex flex-col items-center ${positionClass}`}>
      <div className="relative">
        <img
          src={entity.avatar}
          alt={`Avatar de ${entity.nombre}`}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 object-cover"
          style={{
            borderColor: entity.puesto === 1 ? '#FFD700' : entity.puesto === 2 ? '#C0C0C0' : '#CD7F32'
          }}
        />
        <span className="absolute -bottom-2 -right-2 text-3xl">{medal}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-white truncate w-36 text-center">{entity.nombre}</h3>
      {entity.ventas_totales !== undefined && (
        <p className="text-[#FFD700] font-semibold">${entity.ventas_totales.toLocaleString()}</p>
      )}
      <div 
        className="w-full mt-2 rounded-t-lg bg-gradient-to-t shadow-lg relative"
        style={{ 
          height: entity.puesto === 1 ? '100px' : entity.puesto === 2 ? '70px' : '40px',
          background: entity.puesto === 1 
            ? 'linear-gradient(to top, #FFD700, #F0C400)' 
            : entity.puesto === 2 
            ? 'linear-gradient(to top, #C0C0C0, #A9A9A9)' 
            : 'linear-gradient(to top, #CD7F32, #B87329)'
        }}
      >
        <span className="text-5xl font-extrabold text-black/50 absolute bottom-1 left-1/2 -translate-x-1/2">
          {entity.puesto}
        </span>
      </div>
    </div>
  );
};


// Componente principal del podio
const TopSellersPodium: React.FC<TopSellersPodiumProps> = ({ topThree, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-end h-72 bg-black/20 rounded-xl">
        <p className="text-white/80 mb-8">Cargando el podio de los campeones...</p>
      </div>
    );
  }
  
  if (topThree.length < 3) {
    return (
       <div className="text-center text-white/80 py-4">No hay suficientes vendedores para mostrar el podio.</div>
    )
  }

  const [first, second, third] = topThree;

  return (
    <div className="bg-black/40 border border-[#FFD700]/30 rounded-2xl p-6 shadow-xl text-center">
      <h2 className="text-2xl font-bold text-white mb-2 font-orbitron">
        Este ranking no es de likes, es de resultados.
      </h2>
      <p className="text-yellow-400 mb-8 text-lg">Revisa la tabla de Campeones.</p>
      
      <div className="flex justify-around items-end max-w-3xl mx-auto px-4" style={{ minHeight: '300px' }}>
        {second && <PodiumStand entity={second} positionClass="order-2" medal="🥈" />}
        {first && <PodiumStand entity={first} positionClass="order-1" medal="🥇" />}
        {third && <PodiumStand entity={third} positionClass="order-3" medal="🥉" />}
      </div>
       <p className="text-sm text-white/50 text-right mt-4">Actualizado en tiempo real</p>
    </div>
  );
};

export default TopSellersPodium; 