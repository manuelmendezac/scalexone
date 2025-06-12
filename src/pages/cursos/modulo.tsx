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
        <div className="w-full max-w-3xl bg-neutral-900 rounded-2xl shadow-xl p-6 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-cyan-400">{clase.titulo}</h2>
          <p className="mb-4 text-cyan-200">{clase.descripcion}</p>
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 flex items-center justify-center">
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
          <div className="flex gap-4 mt-2">
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-bold"
              onClick={() => setClaseActual((prev) => Math.max(prev - 1, 0))}
              disabled={claseActual === 0}
            >
              ← Anterior
            </button>
            <button
              className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-bold"
              onClick={() => setClaseActual((prev) => Math.min(prev + 1, clases.length - 1))}
              disabled={claseActual === clases.length - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar de clases */}
      <div className="w-full md:w-96 bg-neutral-950 p-6 flex flex-col gap-4">
        <h3 className="text-xl font-bold mb-2 text-cyan-300">Clases del módulo</h3>
        {clases.map((c, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition border ${idx === claseActual ? 'bg-cyan-900/30 border-cyan-400' : 'bg-neutral-900 border-neutral-800 hover:bg-cyan-900/10'}`}
            onClick={() => setClaseActual(idx)}
          >
            <div className="w-16 h-12 bg-cyan-900/30 rounded-lg flex items-center justify-center text-cyan-300 font-bold text-lg">{idx + 1}</div>
            <div>
              <div className="font-bold text-cyan-200 text-base">{c.titulo}</div>
              <div className="text-xs text-cyan-400">Video</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuloDetalle; 