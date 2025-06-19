// Página de línea de videos para classroom, idéntica a cursos pero adaptada a las tablas de classroom
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase';
import ModalFuturista from '../../components/ModalFuturista';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ClassroomVideoGamification from '../../components/ClassroomVideoGamification';
import useNeuroState from '../../store/useNeuroState';

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
  const [completados, setCompletados] = useState<{[key:number]:boolean}>({});
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
  
  // Variables para el reproductor de video
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('adminMode') === 'true');
    if (modulo_id) fetchModuloYVideos();
    // Cargar recursos globales
    fetchRecursosGlobales();
  }, [modulo_id]);

  const fetchModuloYVideos = async () => {
    if (!modulo_id) return;
    
    setLoading(true);
    
    // Obtener información del módulo
    const { data: mod } = await supabase
      .from('classroom_modulos')
      .select('*')
      .eq('id', modulo_id)
      .single();

    if (!mod) {
      console.error('No se encontró el módulo');
      setLoading(false);
      return;
    }

    setModulo(mod);
    // Traer videos asociados
    const { data: vids } = await supabase
      .from('videos_classroom_modulo')
      .select('*')
      .eq('modulo_id', modulo_id)
      .order('orden', { ascending: true });
    setClases(vids || []);
    setLoading(false);
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

  // Utilidad para transformar links normales a embed
  function toEmbedUrl(url: string): string {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  }

  const clasesOrdenadas = [...clases].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  const videoActual = clasesOrdenadas[claseActual] || {};
  const esUltimoVideo = claseActual === clasesOrdenadas.length - 1;
  const embedUrl = toEmbedUrl(videoActual.url);

  // Verificar si todos los videos están completados
  const todosCompletados = clasesOrdenadas.length > 0 && 
    clasesOrdenadas.every((_, idx) => completados[idx]);

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
      navigate('/classroom');
    }
  };

  // Función para manejar el progreso del video
  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
    // Marcar como completado si el progreso es >= 90%
    if (progress >= 90 && !completados[claseActual]) {
      setCompletados(prev => ({ ...prev, [claseActual]: true }));
    }
  };

  // Función para simular el progreso del video (ya que no podemos acceder directamente al iframe)
  useEffect(() => {
    if (!embedUrl) return;

    const interval = setInterval(() => {
      // Simular progreso del video (esto se puede mejorar con postMessage si el video lo soporta)
      setCurrentTime(prev => {
        const newTime = prev + 1;
        if (newTime >= duration) {
          clearInterval(interval);
          return duration;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [embedUrl, duration]);

  // Establecer duración del video (simulado)
  useEffect(() => {
    if (videoActual?.duracion) {
      setDuration(videoActual.duracion);
    } else {
      // Duración por defecto de 10 minutos si no está especificada
      setDuration(600);
    }
  }, [videoActual]);

  useEffect(() => {
    if (todosCompletados && !isAdmin) {
      marcarModuloCompletado();
    }
  }, [todosCompletados, isAdmin]);

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
                  {clasesOrdenadas.filter((_, idx) => completados[idx]).length} / {clasesOrdenadas.length} videos
                </span>
                <div className="w-24 h-2 bg-cyan-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ 
                      width: `${(clasesOrdenadas.filter((_, idx) => completados[idx]).length / Math.max(clasesOrdenadas.length, 1)) * 100}%` 
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

            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <div className="aspect-video bg-black rounded-xl overflow-hidden">
                <iframe
                  ref={videoRef}
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Componente de gamificación */}
              <ClassroomVideoGamification
                videoId={videoActual.id}
                moduloId={modulo_id || ''}
                currentTime={currentTime}
                duration={duration}
                onProgressUpdate={handleVideoProgress}
              />
            </div>
          </div>

          {/* Título y botón de completado */}
          <div className="w-full mt-6 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-xl font-bold text-cyan-300">{videoActual.titulo}</h2>
              <button
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  completados[claseActual] 
                    ? 'bg-green-500 text-black' 
                    : 'bg-cyan-700 text-white hover:bg-cyan-600'
                }`}
                onClick={() => {
                  if (!completados[claseActual]) {
                    setCompletados(prev => ({...prev, [claseActual]: true}));
                    // Si es el último video, esperar un momento antes de mostrar la pantalla de felicitación
                    if (claseActual === clasesOrdenadas.length - 1) {
                      setTimeout(() => {
                        marcarModuloCompletado();
                      }, 500);
                    } else {
                      // Si no es el último video, pasar al siguiente automáticamente
                      setTimeout(() => setClaseActual(prev => prev + 1), 400);
                    }
                  }
                }}
                disabled={completados[claseActual]}
              >
                {completados[claseActual] ? '✓ Completado' : 'Marcar como completado'}
              </button>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => claseActual > 0 && setClaseActual(claseActual - 1)}
                disabled={claseActual === 0}
                className="px-4 py-2 bg-cyan-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-600 transition"
              >
                Video Anterior
              </button>
              <button
                onClick={() => claseActual < clasesOrdenadas.length - 1 && setClaseActual(claseActual + 1)}
                disabled={claseActual === clasesOrdenadas.length - 1}
                className="px-4 py-2 bg-cyan-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-600 transition"
              >
                Siguiente Video
              </button>
            </div>
          </div>

          {/* Sección de información y materiales */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Sobre este módulo */}
            <div className="bg-neutral-900/50 rounded-xl border border-cyan-900/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-cyan-400">Sobre este módulo</h3>
                {isAdmin && (
                  <button 
                    onClick={() => setShowEditDescripcion(true)}
                    className="px-3 py-1 bg-cyan-700 text-white text-sm rounded-lg hover:bg-cyan-600 transition"
                  >
                    Editar
                  </button>
                )}
              </div>
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: descripcionHtml }}
              />
            </div>

            {/* Material y herramientas */}
            <div className="bg-neutral-900/50 rounded-xl border border-green-900/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-green-400">Material y herramientas</h3>
                {isAdmin && (
                  <button 
                    onClick={() => setShowEditMateriales(true)}
                    className="px-3 py-1 bg-green-700 text-white text-sm rounded-lg hover:bg-green-600 transition"
                  >
                    Editar
                  </button>
                )}
              </div>
              <ul className="space-y-2">
                {materiales.map((material) => (
                  <li key={material.id} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                    <a 
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-300 hover:text-green-200 transition"
                    >
                      {material.titulo}
                    </a>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="ml-2 text-xs text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
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
                  const ytMatch = v.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
                  if (ytMatch) thumb = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                  const vimeoMatch = v.url.match(/vimeo\.com\/(\d+)/);
                  if (vimeoMatch) thumb = `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
                }
                return (
                  <div
                    key={v.id}
                    className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition border-2 ${v.id === videoActual.id ? 'bg-cyan-900/30 border-cyan-400' : 'bg-neutral-900 border-neutral-800 hover:bg-cyan-900/10'} group`}
                    onClick={() => setClaseActual(idx)}
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