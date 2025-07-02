// Deploy fantasma para forzar build en Vercel
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeft, ChevronRight, CheckCircle, Award, Film, Download, Info } from 'lucide-react';
import useNeuroState from '../../store/useNeuroState';
import classroomGamificationService, { CLASSROOM_REWARDS } from '../../services/classroomGamificationService';
import ReactPlayer from 'react-player/lazy';
import Confetti from 'react-confetti';
import DraggableProgressCircle from '../../components/DraggableProgressCircle';
import RewardToast from '../../components/RewardToast';
import NeonSpinner from '../../components/NeonSpinner';

const ModuloDetalle = () => {
  const { id, moduloIdx } = useParams();
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
  const [showReward, setShowReward] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const playerRef = useRef<any>(null);

  // Función para obtener thumbnail de video
  function getVideoThumbnail(url: string): string | null {
    if (!url) return null;
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (youtubeMatch) return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
    return null;
  }

  // Cargar thumbnails en caché
  const fetchThumbnails = async () => {
    const cache: Record<string, string> = {};
    for (const clase of clases) {
      if (clase.url) {
        const thumbnail = getVideoThumbnail(clase.url);
        if (thumbnail) {
          cache[clase.id] = thumbnail;
        }
      }
    }
    setThumbnailCache(cache);
  };

  useEffect(() => {
    if (clases.length > 0) {
      fetchThumbnails();
    }
  }, [clases]);

  // Inicialización
  useEffect(() => {
    const initialize = async () => {
      if (!id || moduloIdx === undefined) return;
      
      setLoading(true);
      setUserId(user?.id || null);

      // Obtener módulo y progreso
      await fetchModuloYProgreso(id, moduloIdx, user?.id || null);
      
      // Obtener recursos globales
      await fetchRecursosGlobales();
      
      setLoading(false);
    };

    initialize();
  }, [id, moduloIdx, user?.id]);

  const fetchModuloYProgreso = async (cursoId: string, moduloIdx: string, currentUserId: string | null) => {
    // 1. Obtener la portada y los módulos embebidos
    const { data: portada } = await supabase.from('cursos_portada').select('*').eq('curso_id', cursoId).single();
    let modArr = (portada && portada.modulos) ? portada.modulos : [];
    if (!Array.isArray(modArr)) modArr = [];
    const idx = parseInt(moduloIdx || '0', 10);
    const mod = modArr[idx] || {};

    // 2. Buscar el id real del módulo en la tabla 'modulos_curso'
    let moduloReal = null;
    if (mod.titulo) {
      const { data: foundMod } = await supabase
        .from('modulos_curso')
        .select('*')
        .eq('curso_id', cursoId)
        .eq('titulo', mod.titulo)
        .maybeSingle();
      
      if (!foundMod) {
        // Crear el módulo si no existe
        const moduloToInsert: any = {
          curso_id: cursoId,
          titulo: mod.titulo,
          descripcion: mod.descripcion || '',
          nivel: mod.nivel || '',
          orden: Number.isFinite(idx) ? idx : 0,
          origen: 'curso'
        };
        const { data: newMod } = await supabase
          .from('modulos_curso')
          .insert([moduloToInsert])
          .select()
          .maybeSingle();
        moduloReal = newMod;
      } else {
        moduloReal = foundMod;
      }
    }

    setModulo(moduloReal ? { ...mod, id: moduloReal.id } : mod);

    // 3. Cargar videos desde videos_classroom_modulo
    if (moduloReal?.id) {
      const { data: vids } = await supabase
        .from('videos_classroom_modulo')
        .select('*')
        .eq('modulo_id', moduloReal.id)
        .order('orden', { ascending: true });
      setClases(vids || []);
    } else {
      setClases([]);
    }

    // 4. Obtener progreso del usuario
    if (currentUserId) {
      const { data: progreso } = await supabase
        .from('progreso_academico_usuario')
        .select('videos_ids')
        .eq('usuario_id', currentUserId)
        .single();
      const completadosSet = new Set((progreso?.videos_ids as string[] | null) || []);
      setVideosCompletados(completadosSet);
    }

    // 5. Leer query param 'video' para posicionar video actual
    const params = new URLSearchParams(location.search);
    const videoIdx = params.get('video');
    if (videoIdx !== null && !isNaN(Number(videoIdx))) {
      setClaseActual(Number(videoIdx));
    } else {
      setClaseActual(0);
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
      // Buscar siguiente módulo en el mismo curso
      const { data: portada } = await supabase.from('cursos_portada').select('modulos').eq('curso_id', id).single();
      let modArr = (portada && portada.modulos) ? portada.modulos : [];
      if (!Array.isArray(modArr)) modArr = [];
      
      const siguienteIdx = parseInt(moduloIdx || '0') + 1;
      if (siguienteIdx < modArr.length) {
        navigate(`/cursos/${id}/modulo/${siguienteIdx}`);
      } else {
        // Volver a la página de módulos del curso
        navigate(`/cursos/${id}/modulos`);
      }
    } catch (error) {
      console.error('Error al buscar siguiente módulo:', error);
      navigate(`/cursos/${id}/modulos`);
    }
  };

  const cambiarVideo = useCallback(async (index: number) => {
    if (index >= 0 && index < clasesOrdenadas.length) {
      setLoading(true);
      setVideoProgress(0);
      setClaseActual(index);
      setTimeout(() => setLoading(false), 500);
    }
  }, [clasesOrdenadas.length]);

  const handleVideoEnded = useCallback(async () => {
    if (!userId || !videoActual.id || !modulo?.id) return;
    
    if (videosCompletados.has(videoActual.id)) {
      if (!esUltimoVideo) {
        cambiarVideo(claseActual + 1);
      }
      return;
    }

    setIsSaving(true);
    
    try {
      await classroomGamificationService.actualizarProgresoVideo(videoActual.id, modulo.id, userId);
      setVideosCompletados(prev => new Set(prev).add(videoActual.id));

      setShowConfetti(true);
      setShowReward(false);
      requestAnimationFrame(() => {
        setShowReward(true);
      });

      setTimeout(() => setShowConfetti(false), 4000);
      setTimeout(() => setShowReward(false), 3000);

      if (!esUltimoVideo) {
        setTimeout(() => cambiarVideo(claseActual + 1), 1500);
      }
    } catch (error) {
      console.error("Error al procesar la finalización del video:", error);
      alert("Error: No se pudo guardar tu progreso.");
    } finally {
      setTimeout(() => setIsSaving(false), 1200);
    }
  }, [userId, videoActual.id, modulo?.id, videosCompletados, esUltimoVideo, cambiarVideo, claseActual]);

  const handleProgress = useCallback((state: { played: number }) => {
    if (videosCompletados.has(videoActual.id)) {
      setVideoProgress(100);
      return;
    }
    setVideoProgress(state.played * 100);
  }, [videosCompletados, videoActual.id]);

  useEffect(() => {
    setShowPlayer(false);
  }, [claseActual]);

  // Verificar si es admin
  useEffect(() => {
    const checkAdmin = async () => {
      // Validación más estricta del usuario y email
      if (!user || !user.email || typeof user.email !== 'string' || user.email.trim() === '') {
        console.log('Usuario no válido para verificar admin:', { user: user?.id, email: user?.email });
        setIsAdmin(false);
        return;
      }

      try {
        console.log('Verificando admin para usuario:', user.email);
        const { data, error } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('email', user.email.trim())
          .single();

        if (error) {
          console.error('Error verificando admin status:', error);
          setIsAdmin(false);
          return;
        }

        const isUserAdmin = data?.rol === 'admin' || data?.rol === 'superadmin';
        console.log('Resultado verificación admin:', { email: user.email, rol: data?.rol, isAdmin: isUserAdmin });
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error('Error inesperado verificando admin:', error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user?.email]);

  // Agrega la función para sincronizar y redirigir
  const handleEditVideos = async () => {
    if (!modulo?.id) return;
    // Verifica si el módulo existe en classroom_modulos
    const { data: classroomModulo } = await supabase
      .from('classroom_modulos')
      .select('id')
      .eq('id', modulo.id)
      .single();

    if (!classroomModulo) {
      // Si no existe, créalo automáticamente
      await supabase.from('classroom_modulos').insert([{
        id: modulo.id,
        titulo: modulo.titulo,
        descripcion: modulo.descripcion,
        orden: modulo.orden || 0,
        origen: 'curso'
      }]);
    }

    // Ahora sí, redirige al editor
    navigate(`/classroom/editar-videos?modulo_id=${modulo.id}`);
  };

  return (
    <div className={`min-h-screen bg-black text-white flex flex-col ${fullscreen ? '' : 'md:flex-row'} px-1 sm:px-2`}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={250} />}
      <DraggableProgressCircle progress={videoProgress}>
        <RewardToast 
          xp={CLASSROOM_REWARDS.VIDEO_COMPLETADO.xp}
          coins={CLASSROOM_REWARDS.VIDEO_COMPLETADO.monedas}
          show={showReward}
        />
      </DraggableProgressCircle>

      <div className={`flex-1 flex flex-col items-center justify-center ${fullscreen ? 'fixed inset-0 z-50 bg-black overflow-auto' : 'p-1 sm:p-2 md:p-8'} transition-all duration-300`}>
        <div className={`w-full ${fullscreen ? '' : 'max-w-6xl'} bg-gradient-to-br from-neutral-950 to-black rounded-3xl shadow-2xl p-4 flex flex-col items-center border border-yellow-800/40`}>
          <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-2">{modulo?.titulo || 'Módulo del Curso'}</h1>
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
          <div className="w-full aspect-video relative">
            {isAdmin && modulo?.id && (
              <button
                className="absolute top-3 right-3 z-20 bg-yellow-500 hover:bg-yellow-400 text-black rounded-full p-2 shadow-lg transition-all"
                title="Editar videos del módulo"
                onClick={handleEditVideos}
                style={{ fontSize: 20 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-2a2 2 0 012-2h2a2 2 0 012 2v2h6" /></svg>
              </button>
            )}
            <div className="w-full h-full bg-black rounded-xl overflow-hidden border-2 border-yellow-800/50">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-center p-4">
                  <NeonSpinner size={64} />
                </div>
              ) : !showPlayer && (videoActual.url || videoActual.embed_code) ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-center p-4 relative">
                  {getVideoThumbnail(videoActual.url) && (
                    <img
                      src={getVideoThumbnail(videoActual.url)!}
                      alt="Video preview"
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                      style={{ zIndex: 1 }}
                      width="400"
                      height="225"
                      loading="lazy"
                    />
                  )}
                  <button
                    className="relative z-10 px-6 py-3 rounded-full bg-yellow-500 text-black font-bold text-lg shadow-lg hover:bg-yellow-400 transition"
                    onClick={() => setShowPlayer(true)}
                  >
                    Ver video
                  </button>
                </div>
              ) : videoActual.embed_code ? (
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
                  onEnded={() => {
                    handleVideoEnded();
                    setTimeout(() => setShowPlayer(false), 1000);
                  }}
                  config={{ youtube: { playerVars: { showinfo: 0, rel: 0, autoplay: 1 } }, vimeo: { playerOptions: { dnt: true, autoplay: true } } }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-center p-4">
                  <h3 className="text-xl font-bold text-yellow-400">Video no disponible</h3>
                  {isAdmin && <p className="text-yellow-400 mt-2">Administrador: Falta la URL o código embed.</p>}
                </div>
              )}
            </div>
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
      {!fullscreen && (
        <div className="w-full md:w-[380px] bg-gradient-to-br from-neutral-950 to-black p-4 flex flex-col gap-4 rounded-3xl border-l-4 border-yellow-900/50 shadow-2xl min-h-[220px] md:min-h-screen">
          {isAdmin && <button className="mb-4 px-4 py-2 rounded-full bg-yellow-700 hover:bg-yellow-600 text-white font-bold" onClick={() => navigate(`/cursos/${id}/modulos`)}>Volver a módulos</button>}
          <h3 className="text-xl font-bold text-yellow-400 uppercase text-center tracking-wider">Clases del módulo</h3>
          <div className="flex flex-col space-y-2 overflow-y-auto">
            {clasesOrdenadas.map((clase, index) => (
              <div key={clase.id} onClick={() => cambiarVideo(index)} className={`p-3 rounded-lg cursor-pointer flex items-center gap-4 transition-all duration-300 border-2 ${claseActual === index ? 'bg-yellow-600/30 border-yellow-500' : 'bg-neutral-800/50 border-transparent hover:bg-neutral-700/70'}`}>
                <img src={thumbnailCache[clase.id] || clase.miniatura_url || '/images/modulos/document.svg'} alt={clase.titulo} className="w-28 h-16 object-cover rounded-md flex-shrink-0 border border-yellow-800/50" />
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

export default ModuloDetalle; 