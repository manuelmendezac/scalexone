import React, { useState } from 'react';

// Datos provisionales
const videos = [
  {
    id: 1,
    titulo: 'Introducción al Tráfico Pago',
    descripcion: 'Bienvenida y visión general del módulo.',
    video_url: 'https://player.vimeo.com/video/76979871', // Ejemplo Vimeo
    miniatura_url: 'https://i.vimeocdn.com/video/452001751_640.jpg',
    principal: true,
  },
  {
    id: 2,
    titulo: '¿Qué es un Trafficker?',
    descripcion: 'Explicación del rol y oportunidades.',
    video_url: 'https://player.vimeo.com/video/76979871',
    miniatura_url: 'https://i.vimeocdn.com/video/452001751_640.jpg',
    principal: false,
  },
  {
    id: 3,
    titulo: '¿Por qué es una gran oportunidad?',
    descripcion: 'Motivación y contexto del mercado.',
    video_url: 'https://player.vimeo.com/video/76979871',
    miniatura_url: 'https://i.vimeocdn.com/video/452001751_640.jpg',
    principal: false,
  },
  {
    id: 4,
    titulo: '¿Cuál será el camino?',
    descripcion: 'Estructura y roadmap del módulo.',
    video_url: 'https://player.vimeo.com/video/76979871',
    miniatura_url: 'https://i.vimeocdn.com/video/452001751_640.jpg',
    principal: false,
  },
];

const PrimerModulo = () => {
  const [videoActual, setVideoActual] = useState(videos[0]);

  // NOTA SOBRE PROTECCIÓN DE VIDEO:
  // - Para evitar descargas fáciles, usa Vimeo Pro/Business o servicios con protección HLS/DRM.
  // - Para evitar grabación de pantalla (como Netflix), necesitas DRM propietario, lo cual NO es posible solo con React/HTML5. Puedes dificultar, pero no impedir.
  // - Puedes ocultar controles, deshabilitar click derecho, y usar marcas de agua, pero no hay protección 100% en web.

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Panel principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl bg-neutral-900 rounded-2xl shadow-xl p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-cyan-400">{videoActual.titulo}</h2>
          <p className="mb-4 text-cyan-200">{videoActual.descripcion}</p>
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 flex items-center justify-center">
            {/* Video protegido (ejemplo con Vimeo) */}
            <iframe
              src={videoActual.video_url + '?autoplay=0&title=0&byline=0&portrait=0'}
              title={videoActual.titulo}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{ border: 'none' }}
            />
          </div>
          {/* Botones de navegación */}
          <div className="flex gap-4 mt-2">
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-bold"
              onClick={() => {
                const idx = videos.findIndex(v => v.id === videoActual.id);
                if (idx > 0) setVideoActual(videos[idx - 1]);
              }}
              disabled={videoActual.id === videos[0].id}
            >
              ← Anterior
            </button>
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-bold"
              onClick={() => {
                const idx = videos.findIndex(v => v.id === videoActual.id);
                if (idx < videos.length - 1) setVideoActual(videos[idx + 1]);
              }}
              disabled={videoActual.id === videos[videos.length - 1].id}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar de videos */}
      <div className="w-full md:w-96 bg-neutral-950 p-6 flex flex-col gap-4">
        <h3 className="text-xl font-bold mb-2 text-cyan-300">Clases del módulo</h3>
        {videos.map((v, idx) => (
          <div
            key={v.id}
            className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition border ${v.id === videoActual.id ? 'bg-cyan-900/30 border-cyan-400' : 'bg-neutral-900 border-neutral-800 hover:bg-cyan-900/10'}`}
            onClick={() => setVideoActual(v)}
          >
            <img src={v.miniatura_url} alt={v.titulo} className="w-20 h-14 object-cover rounded-lg" />
            <div>
              <div className="font-bold text-cyan-200 text-base">{v.titulo}</div>
              <div className="text-xs text-cyan-400">Video</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrimerModulo; 