import React, { useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import useClassroomStore from '../store/useClassroomStore';
import { useHydration } from '../store/useNeuroState';
import LoadingScreen from '../components/LoadingScreen';
import GlobalLoader from '../components/GlobalLoader';
import { supabase } from '../supabase';
import { Star, LandPlot } from 'lucide-react';
import GlobalLoadingSpinner from '../components/GlobalLoadingSpinner';
import NeonSpinner from '../components/NeonSpinner';

// Modelo de módulo con imagen de portada
export type Modulo = {
  id?: string;
  titulo: string;
  descripcion: string;
  icono?: string;
  imagen_url?: string;
  imagen_url_mobile?: string;
  orden?: number;
  color?: string;
  badge_url?: string;
  cover_type?: string;
  cover_video_url?: string;
  total_videos?: number;
  videos_completados?: number;
  recompensa_xp?: number;
  recompensa_monedas?: number;
  origen?: string;
};

const MODULOS_MODELO: Modulo[] = [
  {
    titulo: 'Bienvenida y visión Scalexone',
    descripcion: 'Qué es, para qué sirve, cómo puede transformar tu vida/proyecto.',
    imagen_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Mentalidad de crecimiento y futuro exponencial',
    descripcion: 'Cómo prepararte para aprovechar la IA y la automatización.',
    imagen_url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Navegación y uso de la plataforma',
    descripcion: 'Tutorial práctico de todas las secciones y herramientas.',
    imagen_url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Herramientas de IA y automatización',
    descripcion: 'Qué puedes hacer, ejemplos prácticos y casos de uso.',
    imagen_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Construcción y escalado de comunidades',
    descripcion: 'Estrategias, recursos y cómo usar Scalexone para crecer tu audiencia.',
    imagen_url: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Marca personal y monetización',
    descripcion: 'Cómo posicionarte, vender y diferenciarte usando la plataforma.',
    imagen_url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Integración de IA en tu día a día',
    descripcion: 'Automatiza tareas, crea contenido, analiza datos y más.',
    imagen_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Recursos, soporte y comunidad',
    descripcion: 'Dónde encontrar ayuda, networking y oportunidades de colaboración.',
    imagen_url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  },
  {
    titulo: 'Plan de acción y próximos pasos',
    descripcion: 'Cómo avanzar, retos, certificaciones y cómo escalar tu impacto.',
    imagen_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80',
  },
];

// Barra de progreso futurista
const ProgresoFuturista = ({ porcentaje }: { porcentaje: number }) => (
  <div className="w-full h-3 rounded-full bg-neutral-700 relative overflow-hidden mt-2 mb-1">
    <div
      className="h-3 rounded-full transition-all duration-700"
      style={{
        width: `${porcentaje}%`,
        background: 'linear-gradient(90deg, #FDB813 0%, #E8A317 100%)',
        boxShadow: '0 0 10px 1px #FDB81399',
      }}
    />
    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white" style={{textShadow:'0 1px 1px rgba(0,0,0,0.7)'}}>
      {porcentaje}%
    </span>
  </div>
);

const MODULOS_POR_PAGINA = 9;

interface ClassroomModuleVideoProps {
  videoUrl: string;
  onClick: () => void;
}

const getVideoThumbnail = (url: string): string | null => {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (youtubeMatch) return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
  return null;
};

// Lazy load del modal de edición
const EditModuleModal = lazy(() => Promise.resolve({
  default: ({
    editIdx, editModulo, setShowEditModal, setEditModulo, isUploading, handleCoverImageUpload, handleSaveEdit, setIsUploading, previewImage, setPreviewImage
  }: any) => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={() => setShowEditModal(false)}
    >
      <div
        className="bg-neutral-900 rounded-lg shadow-2xl border border-neutral-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
                {editIdx === null ? 'Nuevo Módulo' : 'Editar Módulo'}
            </h2>
            <button onClick={() => setShowEditModal(false)} className="text-neutral-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        {/* Body */}
        <form className="flex flex-col gap-6 p-6" onSubmit={e => { e.preventDefault(); handleSaveEdit(editModulo); }}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <label className="text-sm font-semibold text-amber-400">Título</label>
              <input
                type="text"
                className="bg-neutral-800 rounded px-4 py-2 text-white border border-neutral-700 focus:border-amber-400 outline-none"
                value={editModulo.titulo || ''}
                onChange={e => setEditModulo({ ...editModulo, titulo: e.target.value })}
                required
              />
              <label className="text-sm font-semibold text-amber-400">Descripción</label>
              <textarea
                className="bg-neutral-800 rounded px-4 py-2 text-white border border-neutral-700 focus:border-amber-400 outline-none min-h-[80px]"
                value={editModulo.descripcion || ''}
                onChange={e => setEditModulo({ ...editModulo, descripcion: e.target.value })}
                required
              />
              <label className="text-sm font-semibold text-amber-400">Color de fondo</label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  className="w-10 h-10 p-0 border-none bg-transparent"
                  value={editModulo.color || '#18181b'}
                  onChange={e => setEditModulo({ ...editModulo, color: e.target.value })}
                />
                <span className="text-white">{editModulo.color || '#18181b'}</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <label className="text-sm font-semibold text-amber-400">Portada (imagen o video)</label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  disabled={isUploading}
                  className="text-white"
                />
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="rounded-lg mt-2 max-h-40 object-cover border-2 border-blue-400"
                    width="320"
                    height="180"
                    loading="lazy"
                  />
                ) : editModulo.imagen_url ? (
                  <>
                    <img
                      src={editModulo.imagen_url}
                      srcSet={editModulo.imagen_url_mobile ? `${editModulo.imagen_url_mobile} 800w, ${editModulo.imagen_url} 1280w` : undefined}
                      sizes="(max-width: 600px) 800px, 1280px"
                      alt="Portada"
                      className="rounded-lg mt-2 max-h-40 object-cover border-2 border-amber-400"
                      width="320"
                      height="180"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      className="mt-2 px-4 py-1 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                      onClick={() => { setEditModulo({ ...editModulo, imagen_url: '', imagen_url_mobile: '' }); setPreviewImage(null); }}
                    >
                      Eliminar portada
                    </button>
                  </>
                ) : (
                  <div className="rounded-lg mt-2 max-h-40 flex items-center justify-center border-2 border-dashed border-blue-400 bg-neutral-900 text-blue-300" style={{ width: 320, height: 180 }}>
                    Sube o arrastra una imagen aquí
                  </div>
                )}
                <div className="mt-2 p-2 bg-neutral-800 rounded text-xs text-amber-300 border border-amber-400/30">
                  <b>Tips para una portada óptima:</b><br/>
                  • Formato recomendado: <b>WebP</b> (se convierte automáticamente).<br/>
                  • Tamaño recomendado: <b>800x450px</b> (relación 16:9).<br/>
                  • Peso máximo: <b>2 MB</b>.<br/>
                  • Evita imágenes borrosas o con mucho texto.<br/>
                  • La imagen se recortará si no es 16:9.<br/>
                  • Usa imágenes claras y sin bordes para mejor resultado.<br/>
                </div>
              </div>
              <label className="text-sm font-semibold text-amber-400">Tipo de portada</label>
              <select
                className="bg-neutral-800 rounded px-4 py-2 text-white border border-neutral-700 focus:border-amber-400 outline-none"
                value={editModulo.cover_type || 'imagen'}
                onChange={e => setEditModulo({ ...editModulo, cover_type: e.target.value })}
              >
                <option value="imagen">Imagen</option>
                <option value="video">Video</option>
              </select>
              {editModulo.cover_type === 'video' && (
                <>
                  <label className="text-sm font-semibold text-amber-400">URL del video (YouTube o Vimeo)</label>
                  <input
                    type="text"
                    className="bg-neutral-800 rounded px-4 py-2 text-white border border-neutral-700 focus:border-amber-400 outline-none"
                    value={editModulo.cover_video_url || ''}
                    onChange={e => setEditModulo({ ...editModulo, cover_video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-6 py-2 rounded-lg bg-neutral-700 text-white font-semibold hover:bg-neutral-600 transition"
              onClick={() => setShowEditModal(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition"
            >
              {editIdx === null ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}));

const Classroom = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const isHydrated = useHydration();
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const {
    modulos,
    loading,
    error,
    pagina,
    editIdx,
    showEditModal,
    editModulo,
    saveMsg,
    orderMsg,
    fetchModulos,
    setPagina,
    setEditIdx,
    setShowEditModal,
    setEditModulo,
    handleSaveEdit,
    handleDragEnd: handleDragEndStore,
    handleDelete
  } = useClassroomStore();

  useEffect(() => {
    if (!isHydrated) return;
    setIsAdmin(localStorage.getItem('adminMode') === 'true');
    fetchModulos();
  }, [isHydrated, fetchModulos]);

  const getProgreso = (mod: Modulo) => {
    if (!mod.total_videos || mod.total_videos === 0) return 0;
    return Math.round(((mod.videos_completados ?? 0) / mod.total_videos) * 100);
  };
  
  const getBadge = (mod: Modulo) => (getProgreso(mod) === 100 ? '🏆' : null);

  const handleEdit = (idx: number) => {
    setEditIdx(idx + (pagina - 1) * MODULOS_POR_PAGINA);
  };

  // Función para manejar el drag & drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIdx = result.source.index + (pagina - 1) * MODULOS_POR_PAGINA;
    const destIdx = result.destination.index + (pagina - 1) * MODULOS_POR_PAGINA;
    handleDragEndStore(sourceIdx, destIdx);
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    let file = e.target.files[0];

    setIsUploading(true);
    try {
      // Validar peso máximo antes de procesar
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen supera el peso máximo de 2 MB. Por favor, selecciona una imagen más ligera.');
        setIsUploading(false);
        return;
      }
      // Optimización: convertir a WebP y redimensionar
      if (file.type.startsWith('image/')) {
        if (file.type === 'image/webp') {
          // Subir WebP directamente
          try {
            const fileNameWebp = `classroom-cover-webp-${Date.now()}-${file.name}`;
            const { error: uploadErrorWebp } = await supabase.storage
              .from('cursos')
              .upload(fileNameWebp, file);
            if (uploadErrorWebp) throw uploadErrorWebp;
            const { data: urlDataWebp } = supabase.storage.from('cursos').getPublicUrl(fileNameWebp);
            setEditModulo({
              ...(editModulo as Modulo),
              imagen_url: urlDataWebp.publicUrl,
              imagen_url_mobile: urlDataWebp.publicUrl
            });
          } catch (err) {
            alert('No se pudo subir la imagen WebP.');
          }
        } else {
          // Comprimir y subir para otros formatos
          try {
            const imageCompression = (await eval("import('browser-image-compression')")).default;
            // Redimensionar a 800px para móvil, 1280px para escritorio
            const compressedMobile = await imageCompression(file, {
              maxWidthOrHeight: 800,
              maxSizeMB: 2,
              useWebWorker: true,
              fileType: 'image/webp',
              initialQuality: 0.7
            });
            const compressedDesktop = await imageCompression(file, {
              maxWidthOrHeight: 1280,
              maxSizeMB: 2,
              useWebWorker: true,
              fileType: 'image/webp',
              initialQuality: 0.7
            });
            // Subir ambas versiones
            const fileNameMobile = `classroom-cover-mobile-${Date.now()}-${file.name.replace(/\.[^.]+$/, '.webp')}`;
            const fileNameDesktop = `classroom-cover-desktop-${Date.now()}-${file.name.replace(/\.[^.]+$/, '.webp')}`;
            const { error: uploadErrorMobile } = await supabase.storage
              .from('cursos')
              .upload(fileNameMobile, compressedMobile);
            const { error: uploadErrorDesktop } = await supabase.storage
              .from('cursos')
              .upload(fileNameDesktop, compressedDesktop);
            if (uploadErrorMobile || uploadErrorDesktop) throw uploadErrorMobile || uploadErrorDesktop;
            const { data: urlDataMobile } = supabase.storage.from('cursos').getPublicUrl(fileNameMobile);
            const { data: urlDataDesktop } = supabase.storage.from('cursos').getPublicUrl(fileNameDesktop);
            setEditModulo({
              ...(editModulo as Modulo),
              imagen_url: urlDataDesktop.publicUrl,
              imagen_url_mobile: urlDataMobile.publicUrl
            });
          } catch (err) {
            // Si falla la compresión, sube el archivo original
            try {
              const fileNameOriginal = `classroom-cover-original-${Date.now()}-${file.name}`;
              const { error: uploadErrorOriginal } = await supabase.storage
                .from('cursos')
                .upload(fileNameOriginal, file);
              if (uploadErrorOriginal) throw uploadErrorOriginal;
              const { data: urlDataOriginal } = supabase.storage.from('cursos').getPublicUrl(fileNameOriginal);
              setEditModulo({
                ...(editModulo as Modulo),
                imagen_url: urlDataOriginal.publicUrl,
                imagen_url_mobile: urlDataOriginal.publicUrl
              });
              alert('La imagen se subió sin optimizar porque el proceso de compresión falló.');
            } catch (err2) {
              alert('No se pudo subir la imagen. Asegúrate de que el archivo sea una imagen válida.');
            }
          }
        }
      } else {
        alert('El archivo seleccionado no es una imagen válida.');
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Después de obtener todos los módulos
  const todosLosModulos = (modulos || []).filter((mod) => mod.origen === 'classroom');
  const totalPaginas = Math.ceil(todosLosModulos.length / MODULOS_POR_PAGINA);
  const modulosPagina = todosLosModulos.slice((pagina-1)*MODULOS_POR_PAGINA, pagina*MODULOS_POR_PAGINA);

  if (!isHydrated) return <GlobalLoader pageName="Classroom" />;
  
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;

  return (
    <GlobalLoadingSpinner loading={loading}>
      <div className="min-h-screen bg-black text-white p-4">
        {/* Mensajes de estado */}
        {saveMsg && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg ${saveMsg.includes('Error') ? 'bg-red-500' : 'bg-green-500'} text-white`}>
            {saveMsg}
          </div>
        )}
        {orderMsg && (
          <div className="fixed top-4 right-4 p-4 rounded-lg bg-red-500 text-white">
            {orderMsg}
          </div>
        )}

        {/* Header */}
        <div className="w-full flex justify-end items-center mb-8">
          {isAdmin && (
            <button
              onClick={() => {
                setEditIdx(null);
                setShowEditModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              Nuevo Módulo
            </button>
          )}
        </div>

        {/* Título principal */}
        <h1 className="text-4xl font-extrabold text-center mb-8" style={{ color: '#FFD700', textShadow: '0 0 16px #FFD70099, 0 2px 8px #fff' }}>RUTA DIGITAL</h1>

        <div style={{ background: 'red', color: 'white', fontSize: 48, textAlign: 'center', padding: 32 }}>
          TEST RUTA DIGITAL
        </div>

        {/* Grid de módulos */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="modulos" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
              >
                {modulosPagina.map((mod, idx) => {
                  const isEditingThisModule = editIdx === idx + (pagina - 1) * MODULOS_POR_PAGINA;
                  const displayMod = {
                    ...((isEditingThisModule ? editModulo : mod) as Modulo),
                    titulo: (isEditingThisModule ? editModulo.titulo : mod.titulo) || '',
                    descripcion: (isEditingThisModule ? editModulo.descripcion : mod.descripcion) || ''
                  };

                  return (
                    <Draggable
                      key={displayMod.id || idx}
                      draggableId={displayMod.id || `temp-${idx}`}
                      index={idx}
                      isDragDisabled={!isAdmin}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="w-full max-w-sm bg-neutral-900 rounded-2xl shadow-2xl border border-amber-400/30 flex flex-col transition-transform relative group backdrop-blur-sm"
                          style={{
                            ...provided.draggableProps.style,
                            background: 'rgba(23, 23, 23, 0.8)',
                            cursor: isAdmin ? 'grab' : (displayMod.cover_type === 'video' ? 'default' : 'pointer')
                          }}
                          onClick={() => !isAdmin && displayMod.cover_type !== 'video' && navigate(`/classroom/videos/${displayMod.id}`)}
                        >
                          {/* Video o Imagen de Portada */}
                          <div className="aspect-video w-full rounded-t-2xl overflow-hidden flex items-center justify-center bg-neutral-800 relative">
                            {displayMod.cover_type === 'video' && displayMod.cover_video_url ? (
                              <ClassroomModuleVideo 
                                videoUrl={displayMod.cover_video_url} 
                                onClick={() => !isAdmin && navigate(`/classroom/videos/${displayMod.id}`)}
                              />
                            ) : displayMod.imagen_url ? (
                              <img
                                src={displayMod.imagen_url}
                                srcSet={displayMod.imagen_url_mobile ? `${displayMod.imagen_url_mobile} 800w, ${displayMod.imagen_url} 1280w` : undefined}
                                sizes="(max-width: 600px) 800px, 1280px"
                                alt={displayMod.titulo}
                                className="object-cover w-full h-full"
                                width="400"
                                height="225"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-6xl text-neutral-600">{displayMod.icono || '📦'}</span>
                            )}
                          </div>
                          
                          {/* Badge si existe */}
                          {getBadge(displayMod) && (
                            <div className="absolute top-3 right-3 text-2xl z-10">
                              {getBadge(displayMod)}
                            </div>
                          )}

                          <div className="flex-1 flex flex-col p-5">
                            <div>
                              <h3 className="text-lg font-bold text-amber-400 mb-2 text-center">{displayMod.titulo}</h3>
                              <p className="text-neutral-400 text-sm text-center">{displayMod.descripcion}</p>
                            </div>
                            
                            <div className="mt-auto pt-4">
                              <ProgresoFuturista porcentaje={getProgreso(displayMod)} />
                              <div className="flex justify-center items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5">
                                  <img src="/images/modulos/xp.svg" alt="XP" className="w-4 h-4" />
                                  <span className="text-xs text-amber-400 font-medium">+{displayMod.recompensa_xp || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <img src="/images/modulos/neurocoin.svg" alt="NeuroCoin" className="w-4 h-4" />
                                  <span className="text-xs text-amber-400 font-medium">{displayMod.recompensa_monedas || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Botones de admin */}
                          {isAdmin && (
                            <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(idx + (pagina - 1) * MODULOS_POR_PAGINA);
                                  setShowEditModal(true);
                                }}
                                className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold hover:bg-yellow-500"
                              >
                                Editar portada/color
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/classroom/editar-videos?modulo_id=${displayMod.id}`);
                                }}
                                className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold hover:bg-blue-600"
                              >
                                Editar videos
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('¿Seguro que quieres eliminar este módulo?')) {
                                    handleDelete(idx + (pagina - 1) * MODULOS_POR_PAGINA);
                                  }
                                }}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold hover:bg-red-600"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPagina(num)}
                className={`w-8 h-8 rounded-full ${
                  pagina === num
                    ? 'bg-blue-500 text-white'
                    : 'bg-neutral-800 text-gray-300 hover:bg-neutral-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}

        {/* Modal de edición */}
        {showEditModal && (
          <Suspense fallback={<NeonSpinner size={64} />}>
            <EditModuleModal
              editIdx={editIdx}
              editModulo={editModulo}
              setShowEditModal={setShowEditModal}
              setEditModulo={setEditModulo}
              isUploading={isUploading}
              handleCoverImageUpload={handleCoverImageUpload}
              handleSaveEdit={handleSaveEdit}
              setIsUploading={setIsUploading}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
            />
          </Suspense>
        )}
      </div>
    </GlobalLoadingSpinner>
  );
};

// Reemplazar ClassroomModuleVideo para que ReactPlayer se cargue y reproduzca siempre
const ClassroomModuleVideo: React.FC<ClassroomModuleVideoProps> = ({ videoUrl, onClick }) => {
  const [showPlayer, setShowPlayer] = React.useState(false);
  const [ReactPlayer, setReactPlayer] = React.useState<any>(null);
  React.useEffect(() => {
    const timer = setTimeout(() => setShowPlayer(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  React.useEffect(() => {
    if (showPlayer && !ReactPlayer) {
      import('react-player').then((mod) => setReactPlayer(() => mod.default));
    }
  }, [showPlayer, ReactPlayer]);
  const thumbnail = getVideoThumbnail(videoUrl);
  return (
    <div className="w-full h-full relative">
      {!showPlayer && thumbnail && (
        <>
          <img
            src={thumbnail}
            alt="Video preview"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 1 }}
            width="400"
            height="225"
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
            <NeonSpinner size={48} />
          </div>
        </>
      )}
      {showPlayer && ReactPlayer && (
        <div className="absolute top-0 left-0 w-full h-full">
          <ReactPlayer
            url={videoUrl}
            playing={true}
            loop
            muted
            playsinline
            width="100%"
            height="100%"
            className="react-player"
          />
        </div>
      )}
      {/* Overlay para navegación */}
      <div 
        className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onClick}
        style={{ zIndex: 20 }}
      >
        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-amber-400/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 3.222v13.556c0 .445.54.667.895.39l11.556-6.778a.444.444 0 000-.78L4.895 2.832A.444.444 0 004 3.222z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Classroom; 