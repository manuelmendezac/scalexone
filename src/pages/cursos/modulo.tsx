import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

const videosDemo = [
  {
    titulo: 'Bienvenida a Traffic',
    descripcion: '¡Felicidades! Esta es tu puerta de entrada para entrenarte como Traffic Master. Te convertirás en un profesional del marketing digital, pero primero, debes conocer la plataforma y la comunidad que te acompañará durante este proceso.',
    video_url: 'https://player.vimeo.com/video/76979871',
  },
  {
    titulo: '¿Qué es un Trafficker?',
    descripcion: 'Descubre el rol del trafficker digital y por qué es una de las profesiones más demandadas en el mundo del marketing online.',
    video_url: 'https://player.vimeo.com/video/76979871',
  },
  {
    titulo: 'Oportunidades del Tráfico Pago',
    descripcion: 'Explora las oportunidades que ofrece el tráfico pago para emprender, escalar negocios y generar resultados medibles.',
    video_url: 'https://player.vimeo.com/video/76979871',
  },
  {
    titulo: 'Tu Camino en Traffic Master',
    descripcion: 'Conoce la estructura del curso, los módulos y cómo aprovechar al máximo cada clase para tu crecimiento profesional.',
    video_url: 'https://player.vimeo.com/video/76979871',
  },
];

const miniaturasDemo = [
  'https://i.vimeocdn.com/video/452001751_640.jpg',
  'https://i.vimeocdn.com/video/452001751_640.jpg',
  'https://i.vimeocdn.com/video/452001751_640.jpg',
  'https://i.vimeocdn.com/video/452001751_640.jpg',
];

const ModuloDetalle = () => {
  const { id, moduloIdx } = useParams();
  const navigate = useNavigate();
  const [modulo, setModulo] = useState<any>(null);
  const [clases, setClases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claseActual, setClaseActual] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: portada } = await supabase.from('cursos_portada').select('*').eq('curso_id', id).single();
      let modArr = (portada && portada.modulos) ? portada.modulos : [];
      if (!Array.isArray(modArr)) modArr = [];
      const idx = parseInt(moduloIdx || '0', 10);
      const mod = modArr[idx] || {};
      setModulo(mod);
      if (Array.isArray(mod.clases) && mod.clases.length > 0) {
        setClases(mod.clases);
      } else {
        setClases(videosDemo);
      }
      setClaseActual(0);
      setLoading(false);
    }
    if (id && moduloIdx !== undefined) fetchData();
  }, [id, moduloIdx]);

  if (loading) return <div className="text-cyan-400 text-center py-10">Cargando módulo...</div>;
  const clase = clases[claseActual] || {};

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Panel principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl bg-gradient-to-br from-neutral-900 to-black rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-cyan-900/40">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-cyan-400 drop-shadow-glow text-center uppercase tracking-tight" style={{letterSpacing: '-1px'}}>{clase.titulo}</h2>
          <p className="mb-6 text-cyan-200 text-lg text-center max-w-2xl">{clase.descripcion}</p>
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden mb-6 flex items-center justify-center border-2 border-cyan-900/30 shadow-lg">
            {/* Video protegido (ejemplo con Vimeo) */}
            <iframe
              src={clase.video_url + '?autoplay=0&title=0&byline=0&portrait=0'}
              title={clase.titulo}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{ border: 'none' }}
            />
          </div>
          {/* Botones de navegación */}
          <div className="flex gap-6 mt-2 justify-center">
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-md transition-all"
              onClick={() => setClaseActual((prev) => Math.max(prev - 1, 0))}
              disabled={claseActual === 0}
            >
              ← Anterior
            </button>
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-md transition-all"
              onClick={() => setClaseActual((prev) => Math.min(prev + 1, clases.length - 1))}
              disabled={claseActual === clases.length - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar de clases */}
      <div className="w-full md:w-[420px] bg-gradient-to-br from-neutral-950 to-black p-6 flex flex-col gap-5 rounded-3xl border-l border-cyan-900/30 shadow-2xl min-h-screen">
        <h3 className="text-2xl font-bold mb-4 text-cyan-300 tracking-tight uppercase text-center">Clases del módulo</h3>
        {clases.map((c, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition border-2 ${idx === claseActual ? 'bg-cyan-900/30 border-cyan-400 shadow-lg' : 'bg-neutral-900 border-neutral-800 hover:bg-cyan-900/10'} group`}
            onClick={() => setClaseActual(idx)}
            style={{ minHeight: 90 }}
          >
            <img
              src={c.miniatura_url || miniaturasDemo[idx % miniaturasDemo.length]}
              alt={c.titulo}
              className="w-24 h-16 object-cover rounded-xl border-2 border-cyan-800 group-hover:border-cyan-400 transition"
            />
            <div className="flex-1">
              <div className="font-bold text-cyan-200 text-base uppercase tracking-tight group-hover:text-cyan-400 transition">{c.titulo}</div>
              <div className="text-xs text-cyan-400 mt-1">Video</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuloDetalle; 