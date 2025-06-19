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
                        onClick={() => !isAdmin && navigate(`/classroom/${mod.id}`)}
                      >
                        {/* Imagen del módulo */}
                        <div className="h-40 w-full rounded-t-2xl overflow-hidden flex items-center justify-center bg-gray-100">
                          {mod.imagen_url ? (
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-neutral-800 rounded-xl p-6 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">
                {editIdx === null ? 'Nuevo Módulo' : 'Editar Módulo'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    value={editModulo.titulo}
                    onChange={(e) => setEditModulo({ titulo: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-700 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={editModulo.descripcion}
                    onChange={(e) => setEditModulo({ descripcion: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-700 rounded"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">URL de Imagen</label>
                  <input
                    type="text"
                    value={editModulo.imagen_url}
                    onChange={(e) => setEditModulo({ imagen_url: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-700 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <HexColorPicker
                    color={editModulo.color}
                    onChange={(color) => setEditModulo({ color })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-neutral-700 rounded hover:bg-neutral-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                >
                  Guardar
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