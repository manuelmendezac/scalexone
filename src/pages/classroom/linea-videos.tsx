import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import ModalFuturista from '../../components/ModalFuturista';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import useNeuroState from '../../store/useNeuroState';
import classroomGamificationService from '../../services/classroomGamificationService';
import { CLASSROOM_REWARDS } from '../../services/classroomGamificationService';
import ReactPlayer from 'react-player/lazy';

const LineaVideosClassroom = () => {
  const { modulo_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const neuro = useNeuroState();
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
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        if (modulo_id) {
          await fetchModuloYProgreso(modulo_id, user.id);
        }
      } else {
        if (modulo_id) {
           await fetchModuloYProgreso(modulo_id, null);
        }
      }
      setIsAdmin(localStorage.getItem('adminMode') === 'true');
      fetchRecursosGlobales();
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
      const resultado = await classroomGamificationService.actualizarProgresoVideo(videoActual.id, modulo_id, userId);
      setVideosCompletados(prev => new Set(prev).add(videoActual.id));

      if (resultado.moduloCompletado) {
        const recompensaModulo = await classroomGamificationService.registrarModuloCompletado(modulo_id, userId);
        if (recompensaModulo) {
           setRecompensaTotal({ xp: recompensaModulo.xpGanado, coins: recompensaModulo.monedasGanadas });
        } else {
           setRecompensaTotal({ xp: CLASSROOM_REWARDS.MODULO_COMPLETADO.xp, coins: CLASSROOM_REWARDS.MODULO_COMPLETADO.monedas });
        }
        setShowModuloCompletadoModal(true);
      } else if (!esUltimoVideo) {
        setTimeout(() => cambiarVideo(claseActual + 1), 1500);
      }
    } catch (error) {
      console.error("Error al procesar la finalización del video:", error);
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

  if (loading) return <div className="text-cyan-400 text-center py-10">Cargando módulo...</div>;

  return (
    <div className={`min-h-screen bg-black text-white flex flex-col ${fullscreen ? '' : 'md:flex-row'} px-1 sm:px-2`}>
      <div className={`flex-1 flex flex-col items-center justify-center ${fullscreen ? 'fixed inset-0 z-50 bg-black overflow-auto' : 'p-1 sm:p-2 md:p-8'} transition-all duration-300`}>
        <div className={`w-full ${fullscreen ? '' : 'max-w-6xl'} bg-gradient-to-br from-neutral-950 to-black rounded-3xl shadow-2xl p-4 flex flex-col items-center border border-cyan-900/40`}>
          <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-300 mb-2">{modulo?.titulo || 'Módulo de Classroom'}</h1>
              <p className="text-cyan-200 text-sm sm:text-base">{modulo?.descripcion || 'Descripción del módulo'}</p>
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
                <span className="text-cyan-300 text-sm">{videosCompletados.size} / {clasesOrdenadas.length} videos</span>
                <div className="w-24 h-2 bg-cyan-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style={{ width: `${(videosCompletados.size / Math.max(clasesOrdenadas.length, 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full relative">
            <div className="aspect-video w-full h-full bg-black rounded-xl overflow-hidden border-2 border-cyan-900/50">
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
                  <h3 className="text-xl font-bold text-cyan-300">Video no disponible</h3>
                  {isAdmin && <p className="text-yellow-400 mt-2">Administrador: Falta la URL o código embed.</p>}
                </div>
              )}
            </div>
            {isSaving && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 rounded-xl">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-cyan-300 text-lg font-semibold mt-4">Guardando progreso...</p>
              </div>
            )}
            <div className="absolute bottom-2 left-0 w-full h-1 bg-black/30 pointer-events-none rounded-b-xl overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${videoProgress}%`, transition: 'width 0.2s linear' }} />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-cyan-300">{videoActual.titulo || 'Sin título'}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => cambiarVideo(claseActual - 1)} disabled={claseActual === 0} className="px-3 py-2 rounded-lg transition-all duration-300 font-medium bg-cyan-900/50 hover:bg-cyan-800/50 disabled:opacity-50 flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Anterior</span>
              </button>
              {videoActual.embed_code && !videosCompletados.has(videoActual.id) ? (
                <button onClick={handleVideoEnded} disabled={isSaving} className="px-6 py-2 rounded-lg font-bold bg-black text-yellow-400 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-black transition-all duration-300 shadow-lg disabled:opacity-50">
                  {isSaving ? 'Procesando...' : 'Recoger Recompensa'}
                </button>
              ) : (
                esUltimoVideo ? (
                  <button onClick={navegarSiguienteModulo} className="px-3 py-2 rounded-lg transition-all duration-300 font-medium bg-green-600 hover:bg-green-700 flex items-center gap-2">
                    <span className="hidden sm:inline">Siguiente Módulo</span> <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button onClick={() => cambiarVideo(claseActual + 1)} className="px-3 py-2 rounded-lg transition-all duration-300 font-medium bg-cyan-900/50 hover:bg-cyan-800/50 flex items-center gap-2">
                    <span className="hidden sm:inline">Siguiente</span> <ChevronRight className="w-5 h-5" />
                  </button>
                )
              )}
            </div>
          </div>
          <p className="mt-1 text-gray-300 text-sm w-full text-left">{videoActual.descripcion || 'Sin descripción'}</p>
        </div>
      </div>
      {!fullscreen && (
        <div className="w-full md:w-[320px] bg-gradient-to-br from-neutral-950 to-black p-4 flex flex-col gap-4 rounded-3xl border-l-4 border-cyan-900/30 shadow-2xl min-h-[220px] md:min-h-screen">
          {isAdmin && <button className="mb-4 px-4 py-2 rounded-full bg-cyan-700 hover:bg-cyan-500 text-white font-bold" onClick={() => navigate(`/classroom/editar-videos?modulo_id=${modulo_id}`)}>Editar videos</button>}
          <h3 className="text-xl font-bold text-cyan-300 uppercase text-center">Clases del módulo</h3>
          <div className="flex flex-col space-y-2">
            {clasesOrdenadas.map((clase, index) => (
              <div key={clase.id} onClick={() => cambiarVideo(index)} className={`p-2 rounded-lg cursor-pointer flex items-center gap-4 transition-all ${claseActual === index ? 'bg-blue-900/80' : 'bg-gray-800 hover:bg-gray-700'}`}>
                <img src={clase.thumbnail_url || thumbnailCache[clase.id] || '/images/modulos/document.svg'} alt={clase.titulo} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className={`font-semibold ${claseActual === index ? 'text-white' : 'text-gray-300'}`}>{clase.titulo}</h3>
                  <p className={`text-sm ${videosCompletados.has(clase.id) ? 'text-green-400' : 'text-gray-400'}`}>{videosCompletados.has(clase.id) ? 'Completado' : 'Pendiente'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showModuloCompletadoModal && (
        <ModalFuturista open={showModuloCompletadoModal} onClose={() => setShowModuloCompletadoModal(false)}>
          <div className="flex flex-col items-center gap-4 text-center">
            <h3 className="text-2xl font-bold text-cyan-300">¡Felicidades, módulo completado!</h3>
            <div className="flex gap-6 my-4">
              <div className="bg-yellow-500/20 px-4 py-2 rounded-lg"><span className="text-yellow-400 font-bold">{recompensaTotal.xp} XP</span></div>
              <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg">
                <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-6 h-6" />
                <span className="text-yellow-400 font-bold">{recompensaTotal.coins}</span>
              </div>
            </div>
            <button onClick={() => { setShowModuloCompletadoModal(false); navegarSiguienteModulo(); }} className="mt-4 px-6 py-3 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold">Ir al Siguiente Módulo</button>
          </div>
        </ModalFuturista>
      )}
    </div>
  );
};

export default LineaVideosClassroom;