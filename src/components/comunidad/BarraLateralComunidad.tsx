import React from 'react';

const BarraLateralComunidad = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Portada de la comunidad */}
      <div className="bg-[#23232b] rounded-2xl overflow-hidden shadow-lg mb-2">
        <div className="h-28 w-full bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80)'}} />
        <div className="flex flex-col items-center p-4">
          <img src="https://ui-avatars.com/api/?name=Comunidad&background=e6a800&color=fff&size=96" alt="Comunidad" className="w-20 h-20 rounded-full border-4 border-[#18181b] -mt-12 mb-2 bg-[#e6a800]" />
          <h3 className="text-xl font-bold text-white mb-1">Nombre Comunidad</h3>
          <span className="text-[#e6a800] font-semibold text-sm mb-1">Comunidad pública</span>
          <span className="text-gray-400 text-xs">Descripción breve de la comunidad...</span>
        </div>
      </div>
      {/* Miembros, cursos, servicios */}
      <div className="bg-[#23232b] rounded-2xl p-4 flex flex-col items-center gap-2">
        <div className="flex gap-4 mb-2">
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg">134</span>
            <span className="text-gray-400 text-xs">Miembros</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg">1</span>
            <span className="text-gray-400 text-xs">Cursos</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-lg">7</span>
            <span className="text-gray-400 text-xs">Servicios</span>
          </div>
        </div>
        {/* Avatares de miembros */}
        <div className="flex -space-x-3 mb-2">
          <img className="w-8 h-8 rounded-full border-2 border-[#18181b]" src="https://randomuser.me/api/portraits/men/32.jpg" alt="" />
          <img className="w-8 h-8 rounded-full border-2 border-[#18181b]" src="https://randomuser.me/api/portraits/women/44.jpg" alt="" />
          <img className="w-8 h-8 rounded-full border-2 border-[#18181b]" src="https://randomuser.me/api/portraits/men/45.jpg" alt="" />
          <img className="w-8 h-8 rounded-full border-2 border-[#18181b]" src="https://randomuser.me/api/portraits/women/46.jpg" alt="" />
          <span className="w-8 h-8 rounded-full bg-[#e6a800] text-white flex items-center justify-center text-xs font-bold border-2 border-[#18181b]">+9</span>
        </div>
        {/* Botón de configuración */}
        <button className="w-full mt-2 py-2 rounded-xl bg-[#e6a800] text-black font-bold text-base hover:bg-[#ffb300] transition">Configuración</button>
      </div>
      {/* Leaderboard */}
      <div className="bg-[#23232b] rounded-2xl p-4">
        <h4 className="text-[#e6a800] font-bold mb-2 text-sm">Leaderboard</h4>
        <ol className="list-decimal list-inside text-white text-sm">
          <li>Juan Carlos (+692)</li>
          <li>Pablo Duhart (+535)</li>
          <li>York Rodriguez (+400)</li>
        </ol>
      </div>
      {/* Lista de canales/temas solo en escritorio */}
      <div className="hidden md:block bg-[#23232b] rounded-2xl p-4">
        <h4 className="text-[#e6a800] font-bold mb-2 text-sm">Canales</h4>
        <ul className="flex flex-col gap-2">
          <li className="text-white hover:text-[#e6a800] cursor-pointer">General</li>
          <li className="text-white hover:text-[#e6a800] cursor-pointer">Presentaciones</li>
          <li className="text-white hover:text-[#e6a800] cursor-pointer">Recursos</li>
          <li className="text-white hover:text-[#e6a800] cursor-pointer">Networking</li>
        </ul>
      </div>
    </div>
  );
};

export default BarraLateralComunidad; 