import React from 'react';

const FeedComunidad = () => {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">
      {/* Caja para crear nueva publicación */}
      <div className="bg-[#23232b] rounded-2xl p-6 shadow-lg flex flex-col gap-4 mb-4">
        <textarea
          className="w-full bg-[#18181b] text-white rounded-xl p-3 resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#e6a800]"
          placeholder="Comparte algo con la comunidad..."
        />
        <div className="flex items-center gap-3">
          <button className="bg-[#e6a800] hover:bg-[#ffb300] text-black font-bold px-6 py-2 rounded-xl transition">Publicar</button>
          <button className="bg-[#18181b] text-[#e6a800] font-bold px-4 py-2 rounded-xl border border-[#e6a800] hover:bg-[#23232b] transition">Adjuntar archivo</button>
          <button className="bg-[#18181b] text-[#e6a800] font-bold px-4 py-2 rounded-xl border border-[#e6a800] hover:bg-[#23232b] transition">Agregar enlace</button>
        </div>
      </div>
      {/* Listado de publicaciones (mock) */}
      <div className="flex flex-col gap-6">
        {[1,2,3].map((i) => (
          <div key={i} className="bg-[#23232b] rounded-2xl p-6 shadow flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <img src={`https://randomuser.me/api/portraits/men/${30+i}.jpg`} alt="avatar" className="w-10 h-10 rounded-full border-2 border-[#e6a800]" />
              <div>
                <span className="text-white font-bold">Usuario {i}</span>
                <span className="ml-2 text-xs text-[#e6a800] font-semibold">Canal General</span>
                <div className="text-xs text-gray-400">Hace {i*2} horas</div>
              </div>
            </div>
            <div className="text-white text-base mb-2">Este es un ejemplo de publicación en la comunidad. ¡Puedes compartir texto, imágenes, archivos y más!</div>
            <div className="flex gap-4 mt-2">
              <button className="text-[#e6a800] font-bold hover:underline">Comentar</button>
              <button className="text-[#e6a800] font-bold hover:underline">Reaccionar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedComunidad; 