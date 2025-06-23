import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import useClassroomStore from '../store/useClassroomStore';
import { useHydration } from '../store/useNeuroState';
import LoadingScreen from '../components/LoadingScreen';
import GlobalLoadingSpinner from '../components/GlobalLoadingSpinner';
import ReactPlayer from 'react-player/lazy';
import { supabase } from '../supabase';
import { Star, LandPlot } from 'lucide-react';

// Modelo de módulo con imagen de portada
type Modulo = {
  id?: string;
  titulo: string;
  descripcion: string;
  icono?: string;
  imagen_url?: string;
  orden?: number;
  color?: string;
  badge_url?: string;
  cover_type?: string;
  cover_video_url?: string;
  total_videos?: number;
  videos_completados?: number;
  recompensa_xp?: number;
  recompensa_monedas?: number;
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

const Classroom = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const isHydrated = useHydration();

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
    return Math.round(((mod.videos_completados || 0) / mod.total_videos) * 100);
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
    const file = e.target.files[0];

    setIsUploading(true);
    try {
      const fileName = `classroom-cover-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('cursos') // Usamos el bucket 'cursos'
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('cursos')
        .getPublicUrl(fileName);

      setEditModulo({ ...editModulo, imagen_url: urlData.publicUrl });
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      // Aquí podrías añadir un mensaje de error para el usuario
    } finally {
      setIsUploading(false);
    }
  };

  const totalPaginas = Math.ceil(modulos.length / MODULOS_POR_PAGINA);
  const modulosPagina = modulos.slice((pagina-1)*MODULOS_POR_PAGINA, pagina*MODULOS_POR_PAGINA);

  if (!isHydrated) return (
    <GlobalLoadingSpinner loading={true}>
      <div />
    </GlobalLoadingSpinner>
  );
  
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;

  return (
    <GlobalLoadingSpinner loading={false}>
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
                  const displayMod = isEditingThisModule ? editModulo : mod;

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
                              <img src={displayMod.imagen_url} alt={displayMod.titulo} className="object-cover w-full h-full" />
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
              <div className="p-6 flex-grow space-y-8">
                  {/* Top Section: Portada & Detalles */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Columna Izquierda: Portada */}
                      <div className="md:col-span-1">
                          <label className="block text-sm font-medium text-neutral-300 mb-2">Tipo de Portada</label>
                          <div className="flex items-center gap-4 mb-4">
                            <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                              <input type="radio" name="coverType" value="image" checked={editModulo?.cover_type === 'image' || !editModulo?.cover_type} onChange={(e) => setEditModulo({ ...editModulo, cover_type: 'image' })} className="h-4 w-4 text-blue-500 bg-neutral-700 border-neutral-600 focus:ring-blue-600" />
                              Imagen
                            </label>
                            <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                              <input type="radio" name="coverType" value="video" checked={editModulo?.cover_type === 'video'} onChange={(e) => setEditModulo({ ...editModulo, cover_type: 'video' })} className="h-4 w-4 text-blue-500 bg-neutral-700 border-neutral-600 focus:ring-blue-600"/>
                              Video
                            </label>
                          </div>

                          {(!editModulo?.cover_type || editModulo?.cover_type === 'image') ? (
                            <div>
                              <label className="block text-sm font-medium text-neutral-300 mb-2">Portada</label>
                              <div 
                                onClick={() => !isUploading && document.getElementById('cover-image-upload')?.click()}
                                className="aspect-[4/3] w-full bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-700 flex items-center justify-center relative group cursor-pointer"
                              >
                                  {isUploading ? (
                                    <div className="flex flex-col items-center justify-center text-neutral-400">
                                      <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                      <span className="mt-2 text-sm">Subiendo...</span>
                                    </div>
                                  ) : editModulo.imagen_url ? (
                                    <img src={editModulo.imagen_url} alt="Portada" className="w-full h-full object-cover rounded-md" />
                                  ) : (
                                    <div className="text-neutral-500 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                  )}
                                  {editModulo.imagen_url && !isUploading && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setEditModulo({ ...editModulo, imagen_url: '' })}}
                                      className="absolute bottom-2 right-2 bg-neutral-900/50 p-2 rounded-full text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  )}
                              </div>
                              <input id="cover-image-upload" type="file" className="hidden" accept="image/*" onChange={handleCoverImageUpload} disabled={isUploading} />
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm font-medium text-neutral-300 mb-2">URL del Video de Portada</label>
                              <input type="text" placeholder="https://ejemplo.com/video.mp4" value={editModulo?.cover_video_url || ''} onChange={(e) => setEditModulo({ ...editModulo, cover_video_url: e.target.value })} className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                              <p className="text-xs text-neutral-500 mt-1">Se reproducirá en bucle y sin sonido.</p>
                            </div>
                          )}
                      </div>

                      {/* Columna Derecha: Título, Desc, etc. */}
                      <div className="md:col-span-2 space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-neutral-300 mb-2">Título del Módulo</label>
                              <input type="text" value={editModulo?.titulo || ''} onChange={(e) => setEditModulo({ ...editModulo, titulo: e.target.value })} className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-neutral-300 mb-2">Descripción Corta</label>
                              <textarea value={editModulo?.descripcion || ''} onChange={(e) => setEditModulo({ ...editModulo, descripcion: e.target.value })} className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-neutral-300 mb-2">Video Trailer</label>
                              <input type="text" placeholder="https://youtube.com/watch?v=..." className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-neutral-300 mb-2">URL personalizada</label>
                              <input type="text" placeholder="mi-modulo-increible" className="w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                              <p className="text-xs text-neutral-500 mt-1">La URL personalizada debe ser única</p>
                          </div>
                      </div>
                  </div>

                  {/* Middle Section: Promocionar */}
                  <div className="border-t border-neutral-800 pt-6">
                      <div className="flex items-start gap-4">
                          <input type="radio" id="promocionar" name="promocion" className="mt-1 h-4 w-4 text-blue-500 bg-neutral-700 border-neutral-600 focus:ring-blue-600" />
                          <div>
                              <label htmlFor="promocionar" className="text-md font-semibold text-white">Promocionar</label>
                              <p className="text-sm text-neutral-400">Permite a otras comunidades promover tu módulo en la sección de cursos.</p>
                          </div>
                      </div>
                  </div>

                  {/* Acceso Restringido */}
                  <div className="border-t border-neutral-800 pt-6 space-y-6">
                      <div>
                          <h3 className="text-md font-semibold text-white">Acceso Restringido por pago</h3>
                          <p className="text-sm text-neutral-400">Tus miembros deberán pagar una oferta para obtener acceso. <a href="#" className="text-blue-400 hover:underline">Crea una aquí</a></p>
                          <input type="text" placeholder="Escribe el nombre de tu oferta" className="mt-2 w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                          <div className="mt-2 w-full p-4 h-24 rounded bg-neutral-800 border border-neutral-700">
                              {/* Las ofertas seleccionadas irían aquí */}
                          </div>
                      </div>
                       <div>
                          <h3 className="text-md font-semibold text-white">Acceso Restringido por nivel</h3>
                          <p className="text-sm text-neutral-400">¿Aún no asignas niveles de acceso a tu comunidad? <a href="#" className="text-blue-400 hover:underline">Puedes hacerlo dando clic aquí</a></p>
                          <input type="text" placeholder="Escribe el nombre de tu nivel" className="mt-2 w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                  </div>

                  {/* Visualización */}
                  <div className="border-t border-neutral-800 pt-6">
                      <div className="flex items-center justify-between">
                          <label className="text-md font-semibold text-white">Visualización</label>
                          <label htmlFor="toggle" className="flex items-center cursor-pointer">
                              <div className="relative">
                                  <input type="checkbox" id="toggle" className="sr-only peer" />
                                  <div className="block bg-neutral-600 w-14 h-8 rounded-full peer-checked:bg-blue-600 transition"></div>
                                  <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-full"></div>
                              </div>
                          </label>
                      </div>
                  </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-800 flex justify-end gap-4 bg-neutral-900/50 sticky bottom-0">
                  <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 transition">Cancelar</button>
                  <button onClick={() => handleSaveEdit(editModulo)} className="px-6 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition">
                      {editIdx === null ? 'Crear' : 'Guardar'}
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlobalLoadingSpinner>
  );
};

// Componente para el video del módulo con lógica de hover
const ClassroomModuleVideo = ({ videoUrl, onClick }) => {
  return (
    <>
      <div className='absolute top-0 left-0 w-full h-full'>
        <ReactPlayer
          url={videoUrl}
          playing={true}
          loop
          muted
          playsInline
          width="100%"
          height="100%"
          className="react-player"
        />
      </div>
      <div 
        className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onClick}
      >
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-amber-400/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 3.222v13.556c0 .445.54.667.895.39l11.556-6.778a.444.444 0 000-.78L4.895 2.832A.444.444 0 004 3.222z" />
              </svg>
          </div>
      </div>
    </>
  )
}

export default Classroom; 