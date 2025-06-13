import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import ModalFuturista from '../../components/ModalFuturista';

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
  const [videosModulo, setVideosModulo] = useState<any[]>([]);
  const [modalInfoOpen, setModalInfoOpen] = useState(false);
  const [modalInfoModulo, setModalInfoModulo] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: portada } = await supabase.from('cursos_portada').select('*').eq('curso_id', id).single();
      let modArr = (portada && portada.modulos) ? portada.modulos : [];
      if (!Array.isArray(modArr)) modArr = [];
      setModulos(modArr);
      setLoading(false);
    }
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    async function fetchVideosModulo() {
      if (!modulos[moduloActivo] || !modulos[moduloActivo].titulo) {
        setVideosModulo([]);
        return;
      }
      // Buscar el id real del módulo
      const { data: moduloReal } = await supabase
        .from('modulos_curso')
        .select('id')
        .eq('curso_id', id)
        .eq('titulo', modulos[moduloActivo].titulo)
        .maybeSingle();
      if (!moduloReal?.id) {
        setVideosModulo([]);
        return;
      }
      // Traer videos reales
      const { data: videosData } = await supabase
        .from('videos_modulo')
        .select('*')
        .eq('modulo_id', moduloReal.id)
        .order('orden', { ascending: true });
      setVideosModulo(videosData || []);
    }
    if (modulos.length > 0) fetchVideosModulo();
  }, [modulos, moduloActivo, id]);

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
            {/* Renderizar tarjetas de videos reales */}
            {videosModulo.length > 0 ? (
              videosModulo.map((video, idx) => (
                <div key={video.id} className="bg-neutral-900 rounded-2xl p-8 shadow-xl flex flex-col min-h-[340px] justify-between border border-neutral-800">
                  <div className="flex flex-col items-center mb-4">
                    <div className="mb-2">{focoSVG}</div>
                    <CircularProgress percent={Math.floor(Math.random()*60+40)} size={54} stroke={7} />
                  </div>
                  <div className="text-xl font-bold text-white mb-2 text-center uppercase">{video.titulo}</div>
                  <div className="text-white/90 text-base mb-6 text-center">{video.descripcion}</div>
                  <div className="flex gap-2 mt-auto justify-center">
                    <button
                      className="bg-white text-black font-bold py-2 px-6 rounded-full transition-all text-base shadow hover:bg-cyan-200"
                      onClick={() => navigate(`/cursos/${id}/modulo/${moduloActivo}?video=${idx}`)}
                    >
                      Iniciar
                    </button>
                    <button
                      className="bg-cyan-700 text-white font-bold py-2 px-6 rounded-full transition-all text-base shadow hover:bg-cyan-500"
                      onClick={() => { setModalInfoModulo({ modulo: modulos[moduloActivo], videos: videosModulo }); setModalInfoOpen(true); }}
                    >
                      Más información
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-cyan-300 col-span-3 text-center">No hay videos cargados para este módulo.</div>
            )}
          </div>
        </div>
      )}
      {/* Modal de información de módulo */}
      <ModalFuturista open={modalInfoOpen} onClose={() => setModalInfoOpen(false)}>
        {modalInfoModulo && (
          <div className="flex flex-col gap-4 w-full">
            <h2 className="text-2xl font-bold text-cyan-300 mb-2 text-center">{modalInfoModulo.modulo.titulo}</h2>
            <p className="text-cyan-100 text-base mb-4 text-center">{modalInfoModulo.modulo.descripcion}</p>
            <div className="flex flex-col gap-3">
              {modalInfoModulo.videos.map((v: any, idx: number) => (
                <div key={v.id} className="bg-neutral-800 rounded-xl p-3 flex flex-col gap-2 border border-cyan-900/40">
                  <div className="font-bold text-cyan-200 text-base">{v.titulo}</div>
                  <div className="text-cyan-400 text-sm mb-2">{v.descripcion}</div>
                  <button
                    className="bg-cyan-600 hover:bg-cyan-400 text-white font-bold py-1 px-4 rounded-full w-fit self-end"
                    onClick={() => { setModalInfoOpen(false); navigate(`/cursos/${id}/modulo/${moduloActivo}?video=${idx}`); }}
                  >
                    Ver este video
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalFuturista>
    </div>
  );
};

export default ModulosCurso; 