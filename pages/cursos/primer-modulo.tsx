import React, { useState } from 'react';
import ModalFuturista from '../../components/ModalFuturista';

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

function getVideoThumbnail(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (ytMatch) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
  }
  return null;
}

const PrimerModulo = () => {
  const [videoActual, setVideoActual] = useState(videos[0]);
  const [modalOpen, setModalOpen] = useState(false);

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
          {/* Botones de navegación y ver clases */}
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
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-bold"
              onClick={() => setModalOpen(true)}
            >
              Ver clases
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
      {/* Popup de clases */}
      <ModalFuturista open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col gap-4 w-full">
          <h2 className="text-2xl font-bold text-cyan-300 mb-2 text-center">Clases del módulo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {videos.map((v, idx) => {
              let thumb = v.miniatura_url as string;
              if ((!thumb || thumb === 'null') && v.video_url) {
                const t = getVideoThumbnail(v.video_url);
                thumb = t ? t : '';
              }
              return (
                <div key={v.id} className="flex flex-row items-center gap-4 bg-neutral-900 rounded-2xl border-4 border-cyan-400 p-3 shadow-2xl w-full">
                  <div className="w-[120px] h-[80px] sm:w-[120px] sm:h-[80px] w-[90vw] h-[56vw] max-w-[120px] max-h-[80px] sm:max-w-[120px] sm:max-h-[80px] bg-black rounded-2xl overflow-hidden flex items-center justify-center border-4 border-cyan-400 shadow-lg">
                    {thumb ? (
                      <img src={thumb || ''} alt={v.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cyan-400">Sin imagen</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="font-bold text-cyan-200 text-base truncate mb-1">{v.titulo}</div>
                    <div className="text-xs text-cyan-400 opacity-70">Video</div>
                  </div>
                  <button
                    className="bg-cyan-600 hover:bg-cyan-400 text-white font-bold p-2 rounded-full w-10 h-10 flex items-center justify-center"
                    onClick={() => { setModalOpen(false); setVideoActual(v); }}
                    title="Ir a video"
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" fill="currentColor" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </ModalFuturista>
    </div>
  );
};

export default PrimerModulo; 