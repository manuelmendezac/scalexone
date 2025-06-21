// Trigger deploy
// Página de línea de videos para classroom, idéntica a cursos pero adaptada a las tablas de classroom
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

// UUID especial para el portal de recursos de classroom (válido para campos tipo uuid)
const MODULO_CURSO_ID_RECURSOS = "11111111-1111-1111-1111-111111111111";

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
  
  // Nuevo estado para el seguimiento de videos completados
  const [videosCompletados, setVideosCompletados] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  // Descripción y materiales
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
  
  // Estado de la UI
  const [videoProgress, setVideoProgress] = useState(0);
  const [showModuloCompletadoModal, setShowModuloCompletadoModal] = useState(false);
  const [recompensaTotal, setRecompensaTotal] = useState({ xp: 0, coins: 0 });
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null); // Ref para la instancia del reproductor

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
        // Si no hay usuario, podemos dejarlo ver los videos pero sin progreso
        if (modulo_id) {
           await fetchModuloYProgreso(modulo_id, null);
        }
      }
      setIsAdmin(localStorage.getItem('adminMode') === 'true');
      fetchRecursosGlobales();
      setLoading(false);
    };

    initialize();

    return () => {
      // Limpiar instancia del reproductor al desmontar
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [modulo_id]);

  const fetchModuloYProgreso = async (currentModuloId: string, currentUserId: string | null) => {
    // 1. Obtener información del módulo
    const { data: mod } = await supabase
      .from('classroom_modulos')
      .select('*')
      .eq('id', currentModuloId)
      .single();

    if (!mod) {
      return;
    }
    setModulo(mod);

    // 2. Traer videos asociados
    const { data: vids } = await supabase
      .from('videos_classroom_modulo')
      .select('*')
      .eq('modulo_id', currentModuloId)
      .order('orden', { ascending: true });
    
    const videosOrdenados = vids || [];
    setClases(videosOrdenados);

    // 3. Obtener progreso del usuario DESDE LA TABLA CORRECTA
    if (currentUserId) {
      const { data: progreso } = await supabase
        .from('progreso_academico_usuario')
        .select('videos_ids')
        .eq('usuario_id', currentUserId)
        .single();

      const completadosSet = new Set((progreso?.videos_ids as string[] | null) || []);
      setVideosCompletados(completadosSet);
    }
  };

  // Cargar recursos globales
  const fetchRecursosGlobales = async () => {
    // Descripción global
    const { data: desc } = await supabase.from('classroom_recursos_descripcion').select('*').eq('id', 'global').single();
    setDescripcionHtml(desc?.descripcion_html || '');
    // Materiales globales
    const { data: mats } = await supabase.from('classroom_recursos_materiales').select('*').order('fecha_subida', { ascending: false });
    setMateriales(mats || []);
  };

  const clasesOrdenadas = [...clases].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const videoActual = clasesOrdenadas[claseActual] || {};
  const esUltimoVideo = claseActual === clasesOrdenadas.length - 1;

  // Verificar si todos los videos están completados
  const todosCompletados = clasesOrdenadas.length > 0 && 
    clasesOrdenadas.every(video => videosCompletados.has(video.id));

  // Marcar módulo como completado
  const marcarModuloCompletado = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('modulos_completados')
        .upsert({
          usuario_id: user.id,
          modulo_id: modulo_id,
          completado_en: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error al marcar módulo como completado:', error);
    }
  };

  // Obtener el siguiente módulo
  const navegarSiguienteModulo = async () => {
    try {
      // Buscar el siguiente módulo basado en el orden
      const { data: siguienteModulo } = await supabase
        .from('classroom_modulos')
        .select('id')
        .gt('orden', modulo?.orden || 0)
        .order('orden')
        .limit(1)
        .single();

      if (siguienteModulo) {
        navigate(`/classroom/videos/${siguienteModulo.id}`);
      } else {
        // Si no hay siguiente módulo, volver al inicio
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
    
    // Si el video ya está completado, no hacer nada.
    if (videosCompletados.has(videoActual.id)) {
      if (!esUltimoVideo) {
        cambiarVideo(claseActual + 1);
      }
      return;
    }

    console.log(`Video ${videoActual.id} completado. Procesando progreso.`);
    setIsSaving(true);
    
    try {
      // Llamar al servicio con los argumentos correctos
      const resultado = await classroomGamificationService.actualizarProgresoVideo(
        videoActual.id,
        modulo_id,
        userId
      );

      // Actualizar estado local
      setVideosCompletados(prev => new Set(prev).add(videoActual.id));
      
      // Mostrar feedback
      console.log("Recompensa otorgada por video:", resultado);

      // Si el módulo está completo, mostrar la modal final
      if (resultado.moduloCompletado) {
        // Llamamos al servicio para registrar la finalización del módulo y obtener la recompensa
        const recompensaModulo = await classroomGamificationService.registrarModuloCompletado(
          modulo_id,
          userId
        );

        if (recompensaModulo) {
           console.log("Recompensa otorgada por módulo:", recompensaModulo);
           // Se usa la recompensa REAL del módulo para la modal final
           setRecompensaTotal({ 
             xp: recompensaModulo.xpGanado, 
             coins: recompensaModulo.monedasGanadas
           });
        } else {
          // Fallback por si el servicio no devuelve recompensa
           setRecompensaTotal({ 
             xp: CLASSROOM_REWARDS.MODULO_COMPLETADO.xp, 
             coins: CLASSROOM_REWARDS.MODULO_COMPLETADO.monedas 
           });
        }
        setShowModuloCompletadoModal(true);
      } else if (!esUltimoVideo) {
        // Si no, pasar al siguiente video
        setTimeout(() => cambiarVideo(claseActual + 1), 1500); // Dar tiempo para ver el spinner
      }
    } catch (error) {
      console.error("Error al procesar la finalización del video:", error);
    } finally {
      // No ocultar el spinner inmediatamente para que se vea
      setTimeout(() => setIsSaving(false), 1200);
    }
  }, [userId, videoActual.id, modulo_id, videosCompletados, esUltimoVideo, cambiarVideo, claseActual]);

  const handleProgress = useCallback((state: { playedSeconds: number, loadedSeconds: number, played: number, loaded: number }) => {
    setVideoProgress(state.played * 100);
    // Podríamos añadir lógica de guardado de progreso aquí en el futuro si es necesario
  }, []);

  // Guardar descripción global
  async function handleSaveDescripcion() {
    setDescMsg(null);
    try {
      // Verificar si ya existe
      const { data: existente } = await supabase
        .from('classroom_recursos_descripcion')
        .select('id')
        .eq('id', 'global')
        .single();
      let error;
      if (existente) {
        ({ error } = await supabase
          .from('classroom_recursos_descripcion')
          .update({ descripcion_html: descripcionHtml })
          .eq('id', 'global'));
      } else {
        ({ error } = await supabase
          .from('classroom_recursos_descripcion')
          .insert([{ id: 'global', descripcion_html: descripcionHtml }]));
      }
      if (error) {
        setDescMsg('Error al guardar: ' + error.message);
        return;
      }
      setDescMsg('¡Guardado con éxito!');
      setShowEditDescripcion(false);
      fetchRecursosGlobales();
    } catch (err: any) {
      setDescMsg('Error inesperado: ' + (err.message || err));
    }
  }

  // Guardar material global
  async function handleAddMaterialV2(e: React.FormEvent) {
    e.preventDefault();
    setMaterialMsg(null);
    setMaterialLoading(true);
    let url = materialUrl;
    try {
      // Si hay archivo, subirlo
      if (materialFile) {
        const ext = materialFile.name.split('.').pop();
        const fileName = `material_classroom_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('cursos').upload(fileName, materialFile, { upsert: true });
        if (uploadError) {
          setMaterialLoading(false);
          setMaterialMsg('Error al subir archivo: ' + uploadError.message);
          return;
        }
        const { data: publicUrlData } = supabase.storage.from('cursos').getPublicUrl(fileName);
        url = publicUrlData?.publicUrl || url;
      }
      const { error } = await supabase
        .from('classroom_recursos_materiales')
        .insert([{ titulo: materialTitulo, url }]);
      if (error) {
        setMaterialMsg('Error al guardar: ' + error.message);
        setMaterialLoading(false);
        return;
      }
      fetchRecursosGlobales();
      setMaterialTitulo('');
      setMaterialUrl('');
      setMaterialFile(null);
      setMaterialMsg('¡Guardado con éxito!');
      setMaterialLoading(false);
    } catch (err: any) {
      setMaterialMsg('Error inesperado: ' + (err.message || err));
      setMaterialLoading(false);
    }
  }

  // Eliminar material global
  async function handleDeleteMaterial(id: string) {
    await supabase
      .from('classroom_recursos_materiales')
      .delete()
      .eq('id', id);
    setMateriales(materiales.filter(m => m.id !== id));
  }

  if (loading) return <div className="text-cyan-400 text-center py-10">Cargando módulo...</div>;

  return (
    <div className={`min-h-screen bg-black text-white flex flex-col ${fullscreen ? '' : 'md:flex-row'} px-1 sm:px-2`}>
      {/* Panel principal mejorado */}
      <div className={`flex-1 flex flex-col items-center justify-center ${fullscreen ? 'fixed inset-0 z-50 bg-black overflow-auto' : 'p-1 sm:p-2 md:p-8'} transition-all duration-300`}>
        <div className={`w-full ${fullscreen ? '' : 'max-w-6xl'} bg-gradient-to-br from-neutral-950 to-black rounded-3xl shadow-2xl p-4 flex flex-col items-center border border-cyan-900/40`}>
          {/* Header con información del módulo y progreso */}
          <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-300 mb-2">
                {modulo?.titulo || 'Módulo de Classroom'}
              </h1>
              <p className="text-cyan-200 text-sm sm:text-base">
                {modulo?.descripcion || 'Descripción del módulo'}
              </p>
            </div>
            
            {/* Indicador de progreso y recompensas */}
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
              
              {/* Progreso del módulo */}
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 text-sm">
                  {videosCompletados.size} / {clasesOrdenadas.length} videos
                </span>
                <div className="w-24 h-2 bg-cyan-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ 
                      width: `${(videosCompletados.size / Math.max(clasesOrdenadas.length, 1)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contenedor del video con aspect ratio 16:9 */}
          <div className="w-full max-w-4xl mx-auto relative">
            {/* Flecha para volver atrás */}
            <button
              className="absolute top-2 left-2 sm:top-4 sm:left-4 z-40 bg-black/60 hover:bg-cyan-900 text-cyan-200 p-1 sm:p-2 rounded-full shadow border border-cyan-800 transition"
              style={{fontSize: 18, opacity: 0.7, minWidth: 28, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
              onClick={() => window.history.back()}
              title="Volver atrás"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            {/* Botón pantalla completa */}
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-30 bg-cyan-700 hover:bg-cyan-500 text-white p-2 rounded-full shadow-lg border border-cyan-400 transition"
              onClick={() => setFullscreen(!fullscreen)}
              title={fullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
              style={{boxShadow: '0 2px 12px #0008'}}
            >
              {fullscreen ? (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19L5 23M5 23h6M5 23v-6M19 9l4-4m0 0v6m0-6h-6"/></svg>
              ) : (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9V5h4M19 5h4v4M5 19v4h4M19 23h4v-4"/></svg>
              )}
            </button>

            <div className="relative">
              <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                {videoActual.url ? (
                  <ReactPlayer
                    key={videoActual.id}
                    ref={playerRef}
                    url={videoActual.url}
                    className="absolute top-0 left-0"
                    width="100%"
                    height="100%"
                    controls
                    playing
                    onEnded={handleVideoEnded}
                    onProgress={handleProgress}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-center p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.55a1 1 0 01.55.89V14.1a1 1 0 01-.55.9l-4.55 2.73a1 1 0 01-1.45-.9V8.17a1 1 0 011.45-.89zM4 18h8a2 2 0 002-2V8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    <h3 className="text-xl font-bold text-cyan-300">Video no disponible</h3>
                    {isAdmin && (
                       <p className="text-yellow-400 mt-2">
                         Administrador: Falta la URL de este video. Por favor, edita el módulo para añadir una URL válida.
                       </p>
                    )}
                  </div>
                )}
                {isSaving && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 rounded-xl">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-cyan-300 text-lg font-semibold mt-4">Guardando progreso...</p>
                  </div>
                )}
              </div>

              {/* Indicador de progreso del video actual */}
              <div className="absolute bottom-0 left-0 w-full h-2 bg-black/50 pointer-events-none rounded-b-xl overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ 
                    width: `${videoProgress}%`, 
                    transition: 'width 0.2s linear',
                    boxShadow: '0 0 8px rgba(0, 255, 255, 0.7), 0 0 12px rgba(0, 191, 255, 0.5)',
                    animation: 'pulse-glow 2s infinite ease-in-out'
                  }}
                />
              </div>
            </div>

            {/* Título y botones de navegación */}
            <div className="mt-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-cyan-300">
                {videoActual.titulo || 'Sin título'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarVideo(claseActual - 1)}
                  disabled={claseActual === 0}
                  className="px-3 py-2 rounded-lg transition-all duration-300 font-medium bg-cyan-900/50 hover:bg-cyan-800/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                {esUltimoVideo ? (
                  todosCompletados ? (
                     <button
                        onClick={navegarSiguienteModulo}
                        className="px-3 py-2 rounded-lg transition-all duration-300 font-medium bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      >
                       <span className="hidden sm:inline">Siguiente Módulo</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                  ) : (
                    <button
                      onClick={handleVideoEnded}
                      className="px-3 py-2 rounded-lg transition-all duration-300 font-medium bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">Completar y Finalizar</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => cambiarVideo(claseActual + 1)}
                    className="px-3 py-2 rounded-lg transition-all duration-300 font-medium bg-cyan-900/50 hover:bg-cyan-800/50 flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Descripción del video */}
            <p className="mt-1 text-gray-300 text-sm">
              {videoActual.descripcion || 'Sin descripción'}
            </p>
          </div>

          {/* Bloques de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20">
              <h3 className="text-lg font-bold text-cyan-300 mb-2">Sobre este módulo</h3>
              <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: descripcionHtml }} />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/20">
              <h3 className="text-lg font-bold text-cyan-300 mb-2">Material y herramientas</h3>
              <div className="space-y-2">
                {materiales.map((material) => (
                  <a
                    key={material.id}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                  >
                    {material.titulo}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sidebar de videos */}
      {!fullscreen && (
        <div className="w-full md:w-[320px] bg-gradient-to-br from-neutral-950 to-black p-2 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-6 rounded-3xl border-l-4 border-cyan-900/30 shadow-2xl min-h-[220px] sm:min-h-[320px] md:min-h-screen transition-all duration-300">
          {/* Solo mostrar el botón de editar si es admin */}
          {isAdmin && (
            <button
              className="mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-cyan-700 hover:bg-cyan-500 text-white font-bold shadow transition-all text-base sm:text-lg w-full"
              onClick={() => navigate(`/classroom/editar-videos/${modulo_id}`)}
            >
              Editar videos del módulo
            </button>
          )}

          {/* Mostrar pantalla de felicitación o lista de videos */}
          {todosCompletados && !isAdmin ? (
            <div className="flex flex-col items-center gap-6 py-8 transition-opacity duration-700 opacity-100">
              <div className="flex flex-col items-center">
                <svg width="64" height="64" fill="none" stroke="#4ade80" strokeWidth="2" className="animate-bounce">
                  <circle cx="32" cy="32" r="30"/>
                  <path d="M16 32l12 12 20-20"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-cyan-300 text-center">¡Has completado el módulo!</div>
              <audio id="felicitacion-audio" src="/audio/felicitacion-modulo.mp3" autoPlay onEnded={e => { e.currentTarget.currentTime = 0; }} />
              <div className="flex flex-col gap-2 mt-2 w-full">
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-neutral-800 hover:bg-cyan-900 text-cyan-200 font-bold text-sm shadow transition-all border border-cyan-700 w-full"
                  onClick={() => navigate('/classroom')}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 8H4M8 12L4 8l4-4"/></svg>
                  Regresar al Inicio
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold text-sm shadow transition-all border border-green-700 w-full"
                  onClick={navegarSiguienteModulo}
                >
                  Siguiente Módulo 
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h11M11 4l4 4-4 4"/></svg>
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-cyan-300 tracking-tight uppercase text-center drop-shadow-glow">Clases del módulo</h3>
              {clasesOrdenadas.map((v, idx) => {
                let thumb = v.miniatura_url;
                if ((!thumb || thumb === 'null') && v.url) {
                  const vimeoMatch = v.url.match(/vimeo\.com\/(\d+)/);
                  if (vimeoMatch) thumb = `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
                }
                return (
                  <div
                    key={v.id}
                    className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition border-2 ${v.id === videoActual.id ? 'bg-cyan-900/30 border-cyan-400' : 'bg-neutral-900 border-neutral-800 hover:bg-cyan-900/10'} group`}
                    onClick={() => cambiarVideo(idx)}
                    style={{ minHeight: 110 }}
                  >
                    <div className="flex-shrink-0 w-32 h-20 bg-black rounded-xl overflow-hidden flex items-center justify-center border-2 border-cyan-800 group-hover:border-cyan-400 transition">
                      {thumb ? (
                        <img src={thumb} alt={v.titulo} className="w-full h-full object-cover" />
                      ) : v.url && (v.url.endsWith('.mp4') || v.url.endsWith('.webm')) ? (
                        <video src={v.url} className="w-full h-full object-cover" muted playsInline preload="metadata" style={{pointerEvents:'none'}} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cyan-400">Sin video</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div className="font-bold text-cyan-200 text-base truncate mb-1" style={{fontSize:'1rem'}}>{v.titulo}</div>
                      <div className="text-xs text-cyan-400 opacity-70">Video</div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
      {/* Modal de Módulo Completado */}
      {showModuloCompletadoModal && (
        <ModalFuturista open={showModuloCompletadoModal} onClose={() => setShowModuloCompletadoModal(false)}>
          <div className="flex flex-col items-center gap-4 text-center">
            <h3 className="text-2xl font-bold text-cyan-300">¡Felicidades, módulo completado!</h3>
            <p className="text-lg text-cyan-200">Has ganado un total de:</p>
            <div className="flex gap-6 my-4">
              <div className="bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/30">
                <span className="text-yellow-400 font-bold text-2xl">{recompensaTotal.xp} XP</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-lg border border-yellow-500/30">
                <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-8 h-8" />
                <span className="text-yellow-400 font-bold text-2xl">{recompensaTotal.coins}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowModuloCompletadoModal(false);
                navegarSiguienteModulo();
              }}
              className="mt-4 px-6 py-3 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg transition-all"
            >
              Ir al Siguiente Módulo
            </button>
          </div>
        </ModalFuturista>
      )}

      {/* Modales de edición */}
      <ModalFuturista open={showEditDescripcion} onClose={() => setShowEditDescripcion(false)}>
        <div className="flex flex-col gap-4 w-full">
          <h3 className="text-xl font-bold text-cyan-400 mb-2 text-center">Editar descripción del módulo</h3>
          {descMsg && <div className={descMsg.startsWith('¡Guardado') ? 'text-green-400' : 'text-red-400'}>{descMsg}</div>}
          <ReactQuill value={descripcionHtml || ''} onChange={setDescripcionHtml} className="bg-white text-black rounded" />
          <button className="mt-4 px-4 py-2 rounded-full bg-cyan-700 hover:bg-cyan-500 text-white font-bold shadow w-full" onClick={handleSaveDescripcion}>Guardar</button>
          <div className="text-xs text-cyan-300 mt-2">Tabla: classroom_recursos_descripcion (global)</div>
        </div>
      </ModalFuturista>
      <ModalFuturista open={showEditMateriales} onClose={() => setShowEditMateriales(false)}>
        <div className="flex flex-col gap-4 w-full">
          <h3 className="text-xl font-bold text-green-400 mb-2 text-center">Editar materiales y herramientas</h3>
          {materialMsg && <div className={materialMsg.startsWith('¡Guardado') ? 'text-green-400' : 'text-red-400'}>{materialMsg}</div>}
          <form onSubmit={handleAddMaterialV2} className="flex flex-col gap-2">
            <input name="titulo" value={materialTitulo} onChange={e => setMaterialTitulo(e.target.value)} placeholder="Título del material" className="px-3 py-2 rounded bg-black text-green-200 border border-green-700" required />
            <input name="url" value={materialUrl} onChange={e => setMaterialUrl(e.target.value)} placeholder="Enlace o URL de archivo (opcional si subes archivo)" className="px-3 py-2 rounded bg-black text-green-200 border border-green-700" />
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar,.ppt,.pptx,.txt" onChange={e => e.target.files && setMaterialFile(e.target.files[0])} />
            <button type="submit" className="px-4 py-2 rounded-full bg-green-700 hover:bg-green-500 text-white font-bold shadow w-full" disabled={materialLoading}>{materialLoading ? 'Guardando...' : 'Agregar material'}</button>
          </form>
          <div className="text-xs text-green-300 mt-2">Tabla: classroom_recursos_materiales (global)</div>
          <ul className="flex flex-col gap-2 mt-2">
            {materiales.map((mat, idx) => (
              <li key={mat.id || idx} className="flex items-center gap-2">
                <a href={mat.url} target="_blank" rel="noopener noreferrer" className="flex-1 hover:underline text-green-200">{mat.titulo}</a>
                <button className="text-xs text-red-400 hover:text-red-600 font-bold" onClick={() => handleDeleteMaterial(mat.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      </ModalFuturista>
    </div>
  );
};

export default LineaVideosClassroom;