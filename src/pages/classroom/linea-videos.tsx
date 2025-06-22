import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useAuth } from '../../hooks/useAuth';
import ModalFuturista from '../../components/ModalFuturista';
import { ChevronLeft, ChevronRight, CheckCircle, Award, Film, Download, Info } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useNeuroState from '../../store/useNeuroState';
import classroomGamificationService, { CLASSROOM_REWARDS } from '../../services/classroomGamificationService';
import ReactPlayer from 'react-player/lazy';
import Confetti from 'react-confetti';
import DraggableProgressCircle from '../../components/DraggableProgressCircle';

const LineaVideosClassroom = () => {
  const { modulo_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const neuro = useNeuroState();
  const { user } = useAuth();
  const [modulo, setModulo] = useState<any>(null);
  const [clases, setClases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claseActual, setClaseActual] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, string>>({});
  const [videosCompletados, setVideosCompletados] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [showEditDescripcion, setShowEditDescripcion] = useState(false);
  const [descripcionHtml, setDescripcionHtml] = useState<string>('');
  const [descMsg, setDescMsg] = useState<string|null>(null);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [showEditMateriales, setShowEditMateriales] = useState(false);
  const [materialTitulo, setMaterialTitulo] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialFile, setMaterialFile] = useState<File|null>(null);
  const [materialMsg, setMaterialMsg] = useState<string|null>(null);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showModuloCompletadoModal, setShowModuloCompletadoModal] = useState(false);
  const [recompensaTotal, setRecompensaTotal] = useState({ xp: 0, coins: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const session = await supabase.auth.getSession();
      const currentUserId = session?.data?.session?.user?.id ?? null;
      setUserId(currentUserId);
      
      const adminMode = localStorage.getItem('adminMode') === 'true';
      setIsAdmin(adminMode);

      if (modulo_id) {
        await fetchModuloYProgreso(modulo_id, currentUserId);
        await fetchRecursosGlobales();
      }
      setLoading(false);
    };
    initialize();
  }, [modulo_id]);

  function getVideoThumbnail(url: string): string | null {
    if (!url) return null;
    const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([\w-]{11})(?:\S+)?/);
    if (youtubeMatch && youtubeMatch[1]) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/mqdefault.jpg`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    }
    return null;
  }

  useEffect(() => {
    const fetchThumbnails = async () => {
        const newThumbnails: Record<string, string> = {};
        for (const clase of clases) {
           if (!clase.thumbnail_url && !thumbnailCache[clase.id] && clase.url) {
                const thumb = getVideoThumbnail(clase.url);
                if (thumb) {
                   newThumbnails[clase.id] = thumb;
                }
           }
        }
        if (Object.keys(newThumbnails).length > 0) {
            setThumbnailCache(prev => ({ ...prev, ...newThumbnails }));
        }
    };

    if (clases.length > 0) {
        fetchThumbnails();
    }
  }, [clases]);

  const fetchModuloYProgreso = async (currentModuloId: string, currentUserId: string | null) => {
    const { data: mod } = await supabase.from('classroom_modulos').select('*').eq('id', currentModuloId).single();
    if (!mod) return;
    setModulo(mod);

    const { data: vids } = await supabase.from('videos_classroom_modulo').select('*').eq('modulo_id', currentModuloId).order('orden', { ascending: true });
    setClases(vids || []);

    if (currentUserId) {
      const { data: progreso } = await supabase.from('progreso_academico_usuario').select('videos_ids').eq('usuario_id', currentUserId).single();
      const completadosSet = new Set((progreso?.videos_ids as string[] | null) || []);
      setVideosCompletados(completadosSet);
    }
  };

  const fetchRecursosGlobales = async () => {
    const { data: desc } = await supabase.from('classroom_recursos_descripcion').select('*').eq('id', 'global').single();
    setDescripcionHtml(desc?.descripcion_html || '');
    const { data: mats } = await supabase.from('classroom_recursos_materiales').select('*').order('fecha_subida', { ascending: false });
    setMateriales(mats || []);
  };

  const clasesOrdenadas = [...clases].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const videoActual = clasesOrdenadas[claseActual] || {};
  const esUltimoVideo = claseActual === clasesOrdenadas.length - 1;

  const navegarSiguienteModulo = async () => {
    try {
      const { data: siguienteModulo } = await supabase.from('classroom_modulos').select('id').gt('orden', modulo?.orden || 0).order('orden').limit(1).single();
      if (siguienteModulo) {
        navigate(`/classroom/videos/${siguienteModulo.id}`);
      } else {
        navigate('/classroom');
      }
    } catch (error) {
      console.error('Error al buscar siguiente módulo:', error);
    }
  };

  const cambiarVideo = useCallback((index: number) => {
    if (index >= 0 && index < clasesOrdenadas.length) {
      setVideoProgress(0);
      setClaseActual(index);
    }
  }, [clasesOrdenadas.length]);

  const handleVideoEnded = useCallback(async () => {
    if (!userId || !videoActual.id || !modulo_id) return;
    
    if (videosCompletados.has(videoActual.id)) {
      if (!esUltimoVideo) {
        cambiarVideo(claseActual + 1);
      }
      return;
    }

    setIsSaving(true);
    
    try {
      await classroomGamificationService.actualizarProgresoVideo(videoActual.id, modulo_id, userId);
      setVideosCompletados(prev => new Set(prev).add(videoActual.id));

      setShowConfetti(true);
      const rewardText = `+${CLASSROOM_REWARDS.VIDEO_COMPLETADO.xp} XP y +${CLASSROOM_REWARDS.VIDEO_COMPLETADO.monedas} Monedas`;
      alert(`¡Video completado! Has ganado: ${rewardText}`);
      setTimeout(() => setShowConfetti(false), 4000);

      if (!esUltimoVideo) {
        setTimeout(() => cambiarVideo(claseActual + 1), 1500);
      }
    } catch (error) {
      console.error("Error al procesar la finalización del video:", error);
      alert("Error: No se pudo guardar tu progreso.");
    } finally {
      setTimeout(() => setIsSaving(false), 1200);
    }
  }, [userId, videoActual.id, modulo_id, videosCompletados, esUltimoVideo, cambiarVideo, claseActual]);

  const handleProgress = useCallback((state: { played: number }) => {
    if (videosCompletados.has(videoActual.id)) {
      setVideoProgress(100);
      return;
    }
    setVideoProgress(state.played * 100);
  }, [videosCompletados, videoActual.id]);

  if (loading) return <div className="text-yellow-300 text-center py-10">Cargando módulo...</div>;

  return (
    <div className={`min-h-screen bg-black text-white flex flex-col ${fullscreen ? '' : 'md:flex-row'} px-1 sm:px-2`}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={250} />}
      <DraggableProgressCircle progress={videoProgress} />

      <div className={`flex-1 flex flex-col items-center justify-center ${fullscreen ? 'fixed inset-0 z-50 bg-black overflow-auto' : 'p-1 sm:p-2 md:p-8'} transition-all duration-300`}>
        <div className={`w-full ${fullscreen ? '' : 'max-w-6xl'} bg-gradient-to-br from-neutral-950 to-black rounded-3xl shadow-2xl p-4 flex flex-col items-center border border-yellow-800/40`}>
          <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-2">{modulo?.titulo || 'Módulo de Classroom'}</h1>
              <p className="text-yellow-200 text-sm sm:text-base">{modulo?.descripcion || 'Descripción del módulo'}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
                  <span className="text-yellow-400 font-bold text-sm">XP: {neuro.userXP}</span>
                </div>
                <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
                  <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-4 h-4" />
                  <span className="text-yellow-400 font-bold text-sm">{neuro.userCoins}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-300 text-sm">{videosCompletados.size} / {clasesOrdenadas.length} videos</span>
              </div>
            </div>
          </div>
          <div className="w-full relative">
            <div className="aspect-video w-full h-full bg-black rounded-xl overflow-hidden border-2 border-yellow-800/50">
              {videoActual.embed_code ? (
                <div className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" dangerouslySetInnerHTML={{ __html: videoActual.embed_code }} />
              ) : videoActual.url ? (
                <ReactPlayer
                  ref={playerRef}
                  url={videoActual.url}
                  width="100%"
                  height="100%"
                  controls
                  playing
                  onProgress={handleProgress}
                  onEnded={handleVideoEnded}
                  config={{ youtube: { playerVars: { showinfo: 0, rel: 0 } }, vimeo: { playerOptions: { dnt: true } } }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-center p-4">
                  <h3 className="text-xl font-bold text-yellow-400">Video no disponible</h3>
                  {isAdmin && <p className="text-yellow-400 mt-2">Administrador: Falta la URL o código embed.</p>}
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-between items-center w-full">
              <h2 className="text-xl font-bold text-yellow-400">{videoActual.titulo || 'Sin título'}</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => cambiarVideo(claseActual - 1)} disabled={claseActual === 0} className="px-3 py-2 rounded-lg transition-all duration-300 font-medium bg-yellow-900/50 hover:bg-yellow-800/70 disabled:opacity-50 flex items-center gap-2">
                  <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Anterior</span>
                </button>
                {videoActual.embed_code && !videosCompletados.has(videoActual.id) ? (
                  <button onClick={handleVideoEnded} disabled={isSaving} className="px-6 py-2 rounded-lg font-bold bg-yellow-500 text-black border-2 border-yellow-600 hover:bg-yellow-400 transition-all duration-300 shadow-lg disabled:opacity-50">
                    {isSaving ? 'Procesando...' : 'Completar y Siguiente'}
                  </button>
                ) : (
                  esUltimoVideo ? (
                    <button onClick={navegarSiguienteModulo} className="px-3 py-2 rounded-lg transition-all duration-300 font-medium bg-green-800/70 hover:bg-green-700/70 flex items-center gap-2">
                      <span className="hidden sm:inline">Siguiente Módulo</span> <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button onClick={() => cambiarVideo(claseActual + 1)} className="px-3 py-2 rounded-lg transition-all duration-300 font-medium bg-yellow-900/50 hover:bg-yellow-800/70 flex items-center gap-2">
                      <span className="hidden sm:inline">Siguiente</span> <ChevronRight className="w-5 h-5" />
                    </button>
                  )
                )}
              </div>
            </div>
            <p className="mt-1 text-yellow-200/80 text-sm w-full text-left">{videoActual.descripcion || 'Sin descripción'}</p>

            <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-neutral-900/70 p-6 rounded-2xl border border-yellow-700/30">
                  <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Info className="w-6 h-6" />
                    Sobre este módulo
                  </h3>
                  <div className="text-yellow-200/80 prose prose-invert max-w-none prose-p:my-2 prose-a:text-yellow-300 hover:prose-a:text-yellow-200" dangerouslySetInnerHTML={{ __html: descripcionHtml || '<p>No hay descripción disponible.</p>' }} />
              </div>
              <div className="bg-neutral-900/70 p-6 rounded-2xl border border-yellow-700/30">
                  <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Download className="w-6 h-6" />
                    Material y herramientas
                  </h3>
                  <div className="space-y-3">
                  {materiales.length > 0 ? materiales.map((material) => (
                      <a
                        key={material.id}
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg bg-yellow-900/40 hover:bg-yellow-800/60 transition-colors text-yellow-300 font-medium"
                      >
                        {material.titulo}
                      </a>
                  )) : <p className="text-yellow-200/80">No hay materiales disponibles.</p>}
                  </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {!fullscreen && (
        <div className="w-full md:w-[380px] bg-gradient-to-br from-neutral-950 to-black p-4 flex flex-col gap-4 rounded-3xl border-l-4 border-yellow-900/50 shadow-2xl min-h-[220px] md:min-h-screen">
          {isAdmin && <button className="mb-4 px-4 py-2 rounded-full bg-yellow-700 hover:bg-yellow-600 text-white font-bold" onClick={() => navigate(`/classroom/editar-videos?modulo_id=${modulo_id}`)}>Editar videos</button>}
          <h3 className="text-xl font-bold text-yellow-400 uppercase text-center tracking-wider">Clases del módulo</h3>
          <div className="flex flex-col space-y-2 overflow-y-auto">
            {clasesOrdenadas.map((clase, index) => (
              <div key={clase.id} onClick={() => cambiarVideo(index)} className={`p-3 rounded-lg cursor-pointer flex items-center gap-4 transition-all duration-300 border-2 ${claseActual === index ? 'bg-yellow-600/30 border-yellow-500' : 'bg-neutral-800/50 border-transparent hover:bg-neutral-700/70'}`}>
                <img src={thumbnailCache[clase.id] || clase.thumbnail_url || '/images/modulos/document.svg'} alt={clase.titulo} className="w-28 h-16 object-cover rounded-md flex-shrink-0 border border-yellow-800/50" />
                <div className="flex-grow min-w-0">
                  <h3 className={`font-semibold truncate ${claseActual === index ? 'text-white' : 'text-yellow-200'}`}>{clase.titulo}</h3>
                  <div className={`text-sm flex items-center gap-1.5 ${videosCompletados.has(clase.id) ? 'text-green-400' : 'text-gray-400'}`}>
                    {videosCompletados.has(clase.id) ? <CheckCircle className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                    <span>{videosCompletados.has(clase.id) ? 'Completado' : 'Pendiente'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LineaVideosClassroom;