import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

// Barra de progreso circular (copiada de id.tsx)
const CircularProgress = ({ percent = 0, size = 64, stroke = 8 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="block relative z-10">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00fff7" />
            <stop offset="100%" stopColor="#7f5cff" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="#222a" strokeWidth={stroke} fill="rgba(20,20,30,0.7)" />
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          stroke="url(#grad1)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: 'url(#glow)' }}
        />
      </svg>
      <span className="text-cyan-300 font-bold text-sm mt-1 drop-shadow-glow">{percent}%</span>
    </div>
  );
};

const focoSVG = (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <circle cx="24" cy="24" r="24" fill="none" />
      <path d="M24 36V40" stroke="#39FF14" strokeWidth="3" strokeLinecap="round"/>
      <path d="M16 28C16 22.4772 20.4772 18 26 18C31.5228 18 36 22.4772 36 28C36 31.3137 33.3137 34 30 34H22C18.6863 34 16 31.3137 16 28Z" stroke="#39FF14" strokeWidth="3"/>
      <circle cx="26" cy="28" r="6" stroke="#39FF14" strokeWidth="3"/>
    </g>
  </svg>
);

const ModulosCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modulos, setModulos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduloActivo, setModuloActivo] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: portada } = await supabase.from('cursos_portada').select('*').eq('curso_id', id).single();
      let modArr = (portada && portada.modulos) ? portada.modulos : [];
      if (!Array.isArray(modArr)) modArr = [];
      // Si el primer módulo no tiene clases, agregamos 4 de ejemplo
      if (modArr[0] && !Array.isArray(modArr[0].clases)) {
        modArr[0].clases = [
          {
            titulo: 'Bienvenida a Traffic',
            descripcion: '¡Felicidades! Esta es tu puerta de entrada para entrenarte como Traffic Master. Te convertirás en un profesional del marketing digital, pero primero, debes conocer la plataforma y la comunidad que te acompañará durante este proceso.'
          },
          {
            titulo: '¿Qué es un Trafficker?',
            descripcion: 'Descubre el rol del trafficker digital y por qué es una de las profesiones más demandadas en el mundo del marketing online.'
          },
          {
            titulo: 'Oportunidades del Tráfico Pago',
            descripcion: 'Explora las oportunidades que ofrece el tráfico pago para emprender, escalar negocios y generar resultados medibles.'
          },
          {
            titulo: 'Tu Camino en Traffic Master',
            descripcion: 'Conoce la estructura del curso, los módulos y cómo aprovechar al máximo cada clase para tu crecimiento profesional.'
          }
        ];
      }
      setModulos(modArr);
      setLoading(false);
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="text-cyan-400 text-center py-10">Cargando módulos...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">Módulos del Curso</h1>
      <div className="flex flex-wrap gap-3 mb-10 justify-center">
        {modulos.map((mod, idx) => (
          <button
            key={idx}
            className={`px-5 py-2 rounded-full border font-bold transition-all text-base ${moduloActivo === idx ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-black text-cyan-300 border-cyan-700 hover:bg-cyan-900/20'}`}
            onClick={() => setModuloActivo(idx)}
          >
            Módulo {idx + 1}
          </button>
        ))}
      </div>
      {modulos.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">{modulos[moduloActivo].titulo}</h2>
          <p className="text-white/80 mb-6">{modulos[moduloActivo].descripcion}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Renderizar tarjetas de clases/contenidos */}
            {Array.isArray(modulos[moduloActivo].clases) ? (
              modulos[moduloActivo].clases.map((clase: any, idx: number) => (
                <div key={idx} className="bg-neutral-900 rounded-2xl p-8 shadow-xl flex flex-col min-h-[340px] justify-between border border-neutral-800">
                  <div className="flex flex-col items-center mb-4">
                    <div className="mb-2">{focoSVG}</div>
                    <CircularProgress percent={Math.floor(Math.random()*60+40)} size={54} stroke={7} />
                  </div>
                  <div className="text-xl font-bold text-white mb-2 text-center uppercase">{clase.titulo}</div>
                  <div className="text-white/90 text-base mb-6 text-center">{clase.descripcion}</div>
                  <div className="flex gap-2 mt-auto justify-center">
                    <button
                      className="bg-white text-black font-bold py-2 px-6 rounded-full transition-all text-base shadow hover:bg-cyan-200"
                      onClick={() => navigate(`/cursos/${id}/modulo/${moduloActivo}`)}
                    >
                      Iniciar
                    </button>
                    <button className="flex items-center gap-1 border border-cyan-400 text-cyan-400 font-bold py-2 px-5 rounded-full transition-all text-base shadow hover:bg-cyan-900/20">
                      Ver clases <span className="ml-1">&rarr;</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-cyan-300 col-span-3 text-center">No hay clases cargadas para este módulo.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulosCurso; 