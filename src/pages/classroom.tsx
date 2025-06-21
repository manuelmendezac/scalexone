import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import useClassroomStore from '../store/useClassroomStore';
import { useHydration } from '../store/useNeuroState';
import LoadingScreen from '../components/LoadingScreen';
import GlobalLoadingSpinner from '../components/GlobalLoadingSpinner';

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
  <div className="w-full h-3 rounded-full bg-gray-200 relative overflow-hidden mt-2 mb-1">
    <div
      className="h-3 rounded-full transition-all duration-700"
      style={{
        width: `${porcentaje}%`,
        background: 'linear-gradient(90deg, #1976d2 0%, #00e676 100%)',
        boxShadow: '0 0 12px 2px #00e67699, 0 0 4px 1px #1976d2cc',
      }}
    />
    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-700" style={{textShadow:'0 0 4px #fff'}}>{porcentaje}%</span>
  </div>
);

const MODULOS_POR_PAGINA = 9;

const Classroom = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = React.useState(false);
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
    setSaveMsg,
    setOrderMsg,
    handleSaveEdit,
    handleDragEnd: handleDragEndStore,
    handleDelete
  } = useClassroomStore();

  useEffect(() => {
    if (!isHydrated) return;
    setIsAdmin(localStorage.getItem('adminMode') === 'true');
    fetchModulos();
  }, [isHydrated, fetchModulos]);

  // Progreso real: por ahora, siempre 0%
  const getProgreso = () => 0;
  const getBadge = (mod: typeof modulos[0]) => mod.badge_url || (getProgreso() === 100 ? '🏆' : null);

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setShowEditModal(true);
  };

  // Función para manejar el drag & drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIdx = result.source.index + (pagina - 1) * MODULOS_POR_PAGINA;
    const destIdx = result.destination.index + (pagina - 1) * MODULOS_POR_PAGINA;
    handleDragEndStore(sourceIdx, destIdx);
  };

  const totalPaginas = Math.ceil(modulos.length / MODULOS_POR_PAGINA);
  const modulosPagina = modulos.slice((pagina-1)*MODULOS_POR_PAGINA, pagina*MODULOS_POR_PAGINA);

  if (!isHydrated) return (
    <GlobalLoadingSpinner loading={true}>
      <div />
    </GlobalLoadingSpinner>
  );
  
  if (loading) return <LoadingScreen message="Cargando classroom..." />;
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
                {modulosPagina.map((mod, idx) => (
                  <Draggable
                    key={mod.id || idx}
                    draggableId={mod.id || `temp-${idx}`}
                    index={idx}
                    isDragDisabled={!isAdmin}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="w-full max-w-xs bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col cursor-pointer hover:scale-105 transition-transform relative group"
                        style={{
                          ...provided.draggableProps.style,
                          background: mod.color || '#fff',
                          cursor: isAdmin ? 'grab' : 'pointer'
                        }}
                        onClick={() => !isAdmin && navigate(`/classroom/videos/${mod.id}`)}
                      >
                        {/* Imagen del módulo */}
                        <div className="h-40 w-full rounded-t-2xl overflow-hidden flex items-center justify-center bg-gray-100">
                          {mod.cover_type === 'video' && mod.cover_video_url ? (
                            <video
                              src={mod.cover_video_url}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="object-cover w-full h-full"
                            />
                          ) : mod.imagen_url ? (
                            <img src={mod.imagen_url} alt={mod.titulo} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-6xl">{mod.icono || '📦'}</span>
                          )}
                        </div>
                        
                        {/* Badge si existe */}
                        {getBadge(mod) && (
                          <div className="absolute top-3 right-3 text-2xl z-10">
                            {getBadge(mod)}
                          </div>
                        )}

                        <div className="flex-1 flex flex-col p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{mod.titulo}</h3>
                          <p className="text-gray-600 text-sm mb-4 text-center">{mod.descripcion}</p>
                          <ProgresoFuturista porcentaje={getProgreso()} />
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
                                navigate(`/classroom/editar-videos?modulo_id=${mod.id}`);
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
                ))}
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
                              <div className="aspect-[4/3] w-full bg-neutral-800 rounded-lg border-2 border-dashed border-neutral-700 flex items-center justify-center relative group cursor-pointer">
                                  {/* Lógica para mostrar imagen */}
                                  <div className="text-neutral-500 text-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </div>
                                  <button className="absolute bottom-2 right-2 bg-neutral-900/50 p-2 rounded-full text-white hover:bg-red-500/80 transition-colors opacity-0 group-hover:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                              </div>
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
                  <button onClick={handleSaveEdit} className="px-6 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition">
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

export default Classroom; 