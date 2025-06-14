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

// Copiar función getVideoThumbnail del módulo
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

const ModulosCurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [modulos, setModulos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [videosPorModulo, setVideosPorModulo] = useState<any[][]>([]);
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
    async function fetchVideosTodosModulos() {
      if (!modulos.length) {
        setVideosPorModulo([]);
        return;
      }
      const videosArr: any[][] = [];
      for (const mod of modulos) {
        // Buscar el id real del módulo
        const { data: moduloReal } = await supabase
          .from('modulos_curso')
          .select('id')
          .eq('curso_id', id)
          .eq('titulo', mod.titulo)
          .maybeSingle();
        if (!moduloReal?.id) {
          videosArr.push([]);
          continue;
        }
        // Traer videos reales
        const { data: videosData } = await supabase
          .from('videos_modulo')
          .select('*')
          .eq('modulo_id', moduloReal.id)
          .order('orden', { ascending: true });
        videosArr.push(videosData || []);
      }
      setVideosPorModulo(videosArr);
    }
    if (modulos.length > 0) fetchVideosTodosModulos();
  }, [modulos, id]);

  // Función para abrir el popup de un módulo específico
  const handleVerClases = async (mod: any, idx: number) => {
    // Buscar el id real del módulo
    const { data: moduloReal } = await supabase
      .from('modulos_curso')
      .select('id')
      .eq('curso_id', id)
      .eq('titulo', mod.titulo)
      .maybeSingle();
    let videos = [];
    if (moduloReal?.id) {
      const { data: videosData } = await supabase
        .from('videos_modulo')
        .select('*')
        .eq('modulo_id', moduloReal.id)
        .order('orden', { ascending: true });
      videos = videosData || [];
    }
    setModalInfoModulo({ modulo: mod, videos });
    setModalInfoOpen(true);
  };

  if (loading) return <div className="text-cyan-400 text-center py-10">Cargando módulos...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Barra de botones de anclaje */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {modulos.map((mod, idx) => (
          <button
            key={idx}
            onClick={() => {
              const el = document.getElementById(`modulo-${idx}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="bg-black border border-white text-white px-8 py-3 rounded-2xl text-lg font-semibold transition-all hover:bg-white hover:text-black hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            style={{ minWidth: '170px' }}
          >
            {mod.titulo || `Módulo ${idx + 1}`}
          </button>
        ))}
      </div>
      <h1 className="text-3xl font-bold text-cyan-400 mb-8">Módulos del Curso</h1>
      {modulos.map((mod, idx) => (
        <div key={idx} id={`modulo-${idx}`} className="bg-black/80 border-2 border-cyan-400 rounded-2xl p-8 shadow-xl flex flex-col min-h-[340px] max-w-3xl w-full mx-auto mb-10">
          <div className="flex flex-col items-center mb-4">
            <div className="mb-2">{focoSVG}</div>
            <CircularProgress percent={Math.floor(Math.random()*60+40)} size={54} stroke={7} />
          </div>
          <div className="text-xl font-bold text-white mb-2 text-center uppercase">{mod.titulo}</div>
          <div className="text-white/90 text-base mb-6 text-center">{mod.descripcion}</div>
          <div className="flex gap-2 mb-8 justify-center">
            <button
              className="bg-white text-black font-bold py-2 px-6 rounded-full transition-all text-base shadow hover:bg-cyan-200"
              onClick={() => navigate(`/cursos/${id}/modulo/${idx}?video=0`)}
            >
              Iniciar
            </button>
            <button
              className="bg-cyan-700 text-white font-bold py-2 px-6 rounded-full transition-all text-base shadow hover:bg-cyan-500"
              onClick={() => handleVerClases(mod, idx)}
            >
              Ver clases
            </button>
          </div>
          {/* Tarjetas de videos del módulo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {videosPorModulo[idx] && videosPorModulo[idx].map((v: any, vidx: number) => {
              let thumb = v.miniatura_url;
              if (!thumb && v.url) {
                thumb = getVideoThumbnail(v.url);
              }
              return (
                <div key={v.id} className="flex flex-row items-center gap-4 bg-neutral-900 rounded-2xl border-4 border-cyan-400 p-3 shadow-2xl w-full">
                  <div className="w-[120px] h-[80px] sm:w-[120px] sm:h-[80px] w-[90vw] h-[56vw] max-w-[120px] max-h-[80px] sm:max-w-[120px] sm:max-h-[80px] bg-black rounded-2xl overflow-hidden flex items-center justify-center border-4 border-cyan-400 shadow-lg">
                    {thumb ? (
                      <img src={thumb} alt={v.titulo} className="w-full h-full object-cover" />
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
                    onClick={() => navigate(`/cursos/${id}/modulo/${idx}?video=${vidx}`)}
                    title="Ir a video"
                  >
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" fill="currentColor" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {/* Modal de información de módulo */}
      <ModalFuturista open={modalInfoOpen} onClose={() => setModalInfoOpen(false)}>
        {modalInfoModulo && (
          <div className="flex flex-col gap-4 w-full">
            <h2 className="text-2xl font-bold text-cyan-300 mb-2 text-center">{modalInfoModulo.modulo.titulo}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {modalInfoModulo.videos.map((v: any, idx: number) => {
                let thumb = v.miniatura_url;
                if (!thumb && v.url) {
                  thumb = getVideoThumbnail(v.url);
                }
                return (
                  <div key={v.id} className="flex flex-row items-center gap-4 bg-neutral-900 rounded-2xl border-4 border-cyan-400 p-3 shadow-2xl w-full">
                    <div className="w-[120px] h-[80px] sm:w-[120px] sm:h-[80px] w-[90vw] h-[56vw] max-w-[120px] max-h-[80px] sm:max-w-[120px] sm:max-h-[80px] bg-black rounded-2xl overflow-hidden flex items-center justify-center border-4 border-cyan-400 shadow-lg">
                      {thumb ? (
                        <img src={thumb} alt={v.titulo} className="w-full h-full object-cover" />
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
                      onClick={() => { setModalInfoOpen(false); navigate(`/cursos/${id}/modulo/${modulos.findIndex(m => m.titulo === modalInfoModulo.modulo.titulo)}?video=${idx}`); }}
                      title="Ir a video"
                    >
                      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20" fill="currentColor" /></svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ModalFuturista>
    </div>
  );
};

export default ModulosCurso; 