import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import useNeuroState from "../store/useNeuroState";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface Canal {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  permisos_publicar: string;
  permisos_comentar: string;
  membresia_requerida: string | null;
  activo: boolean;
  orden: number;
  created_at: string;
}

interface PlanSuscripcion {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
}

interface FormData {
  nombre: string;
  descripcion: string;
  tipo: string;
  permisos_publicar: string;
  permisos_comentar: string;
  membresia_requerida: string;
  activo: boolean;
}

export default function AdminCanalesPanel() {
  // Estado para el formulario
  const [form, setForm] = useState<FormData>({
    nombre: "",
    descripcion: "",
    tipo: "public",
    permisos_publicar: "todos",
    permisos_comentar: "todos",
    membresia_requerida: "",
    activo: true,
  });

  // Estados principales
  const [canales, setCanales] = useState<Canal[]>([]);
  const [planesSuscripcion, setPlanesSuscripcion] = useState<PlanSuscripcion[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [communityUUID, setCommunityUUID] = useState<string | null>(null);
  
  // Estados para modales
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCanal, setEditingCanal] = useState<Canal | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Canal | null>(null);

  // Obtener community_id dinámicamente
  const { userInfo } = useNeuroState();
  const community_id = userInfo?.community_id || '8fb70d6e-3237-465e-8669-979461cf2bc1';

  // Función para obtener el UUID real de la comunidad
  const getCommunityUUID = async (communitySlug: string): Promise<string | null> => {
    try {
      // Primero intentar buscar por slug
      const { data: comunidad, error: comunidadError } = await supabase
        .from("comunidades")
        .select("id")
        .eq("slug", communitySlug)
        .single();
      
      if (comunidad && !comunidadError) {
        return comunidad.id;
      }
      
      // Si no encuentra por slug, intentar buscar por nombre
      const { data: comunidadByName, error: errorByName } = await supabase
        .from("comunidades")
        .select("id")
        .ilike("nombre", `%${communitySlug}%`)
        .single();
      
      if (comunidadByName && !errorByName) {
        return comunidadByName.id;
      }
      
      console.error("No se encontró la comunidad:", communitySlug);
      return null;
    } catch (error) {
      console.error("Error al obtener UUID de comunidad:", error);
      return null;
    }
  };

  // Cargar UUID de comunidad y luego datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      if (community_id) {
        const uuid = await getCommunityUUID(community_id);
        if (uuid) {
          setCommunityUUID(uuid);
        } else {
          setMensaje("Error: No se pudo encontrar la comunidad");
        }
      }
    };
    
    initializeData();
  }, [community_id]);

  // Cargar datos cuando tenemos el UUID
  useEffect(() => {
    if (communityUUID) {
      fetchCanales();
      fetchPlanesSuscripcion();
    }
  }, [communityUUID]);

  const fetchCanales = async () => {
    if (!communityUUID) return;
    
    const { data, error } = await supabase
      .from("canales_comunidad")
      .select("*")
      .eq("community_id", communityUUID)
      .order("orden", { ascending: true });
    
    if (error) {
      console.error("Error fetching canales: ", error);
      setMensaje("Error al cargar canales: " + error.message);
    } else {
      setCanales(data || []);
    }
  };

  const fetchPlanesSuscripcion = async () => {
    if (!communityUUID) return;
    
    try {
      const { data, error } = await supabase
        .from("planes_suscripcion")
        .select("id, nombre, precio, descripcion")
        .eq("comunidad_id", communityUUID)
        .eq("activo", true)
        .order("orden", { ascending: true });
        
      if (error) {
        console.error("Error fetching planes suscripción: ", error);
      } else {
        setPlanesSuscripcion(data || []);
      }
    } catch (error) {
      console.error("Error general en fetchPlanesSuscripcion:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    });
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      tipo: "public",
      permisos_publicar: "todos",
      permisos_comentar: "todos",
      membresia_requerida: "",
      activo: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!communityUUID) {
      setMensaje("Error: UUID de comunidad no disponible");
      return;
    }
    
    setLoading(true);
    setMensaje("");

    try {
      const maxOrden = canales.length > 0 ? Math.max(...canales.map(c => c.orden)) : 0;
      
      const canalData = {
        ...form,
        community_id: communityUUID,
        membresia_requerida: form.membresia_requerida || null,
        orden: maxOrden + 1,
      };

      const { error } = await supabase
        .from("canales_comunidad")
        .insert([canalData]);

      if (error) throw error;

      setMensaje("¡Canal creado exitosamente!");
      resetForm();
      setShowCreateForm(false);
      fetchCanales();
    } catch (error: any) {
      setMensaje("Error al crear canal: " + error.message);
      console.error("Error detallado:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (canal: Canal) => {
    setEditingCanal(canal);
    setForm({
      nombre: canal.nombre,
      descripcion: canal.descripcion || "",
      tipo: canal.tipo,
      permisos_publicar: canal.permisos_publicar,
      permisos_comentar: canal.permisos_comentar,
      membresia_requerida: canal.membresia_requerida || "",
      activo: canal.activo,
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCanal) return;

    setLoading(true);
    setMensaje("");

    try {
      const { error } = await supabase
        .from("canales_comunidad")
        .update({
          ...form,
          membresia_requerida: form.membresia_requerida || null,
        })
        .eq("id", editingCanal.id);

      if (error) throw error;

      setMensaje("¡Canal actualizado exitosamente!");
      setEditingCanal(null);
      resetForm();
      fetchCanales();
    } catch (error: any) {
      setMensaje("Error al actualizar canal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (canal: Canal) => {
    setLoading(true);
    setMensaje("");

    try {
      const { error } = await supabase
        .from("canales_comunidad")
        .delete()
        .eq("id", canal.id);

      if (error) throw error;

      setMensaje("Canal eliminado exitosamente");
      setShowDeleteModal(null);
      fetchCanales();
    } catch (error: any) {
      setMensaje("Error al eliminar canal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (canal: Canal) => {
    try {
      const { error } = await supabase
        .from("canales_comunidad")
        .update({ activo: !canal.activo })
        .eq("id", canal.id);

      if (error) throw error;

      setMensaje(`Canal ${!canal.activo ? 'activado' : 'desactivado'} exitosamente`);
      fetchCanales();
    } catch (error: any) {
      setMensaje("Error al cambiar estado del canal: " + error.message);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(canales);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Actualizar orden local inmediatamente
    const reorderedItems = items.map((item, index) => ({
      ...item,
      orden: index + 1
    }));
    setCanales(reorderedItems);

    // Actualizar en base de datos
    try {
      const updates = reorderedItems.map((item, index) => 
        supabase
          .from("canales_comunidad")
          .update({ orden: index + 1 })
          .eq("id", item.id)
      );

      await Promise.all(updates);
      setMensaje("Orden actualizado exitosamente");
    } catch (error: any) {
      setMensaje("Error al actualizar orden: " + error.message);
      fetchCanales(); // Recargar si hay error
    }
  };

  const getPlanNombre = (planId: string | null) => {
    if (!planId) return "Acceso libre";
    const plan = planesSuscripcion.find(p => p.id === planId);
    return plan ? `${plan.nombre} - $${plan.precio}` : "Plan no encontrado";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Gestión de Canales</h1>
          <p className="text-gray-300">Crea, edita y administra los canales de tu comunidad</p>
        </div>

        {/* Mensajes */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg ${
            mensaje.includes('Error') ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
          }`}>
            {mensaje}
          </div>
        )}

        {/* Botón crear canal */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition"
          >
            + Crear Nuevo Canal
          </button>
        </div>

        {/* Lista de canales con drag & drop */}
        <div className="bg-gray-900 border-2 border-yellow-400 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6">Canales de tu Comunidad</h2>
          
          {canales.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl mb-2">No hay canales aún</h3>
              <p>Crea tu primer canal para comenzar</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="canales">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {canales.map((canal, index) => (
                      <Draggable key={canal.id} draggableId={canal.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 transition-all ${
                              snapshot.isDragging ? 'shadow-lg shadow-yellow-400/20 border-yellow-400' : ''
                            } ${!canal.activo ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                {/* Drag handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="text-gray-400 hover:text-yellow-400 cursor-grab active:cursor-grabbing"
                                >
                                  ⋮⋮
                                </div>

                                {/* Canal info */}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-xl font-bold text-yellow-400">#{canal.nombre}</h3>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      canal.tipo === 'public' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'
                                    }`}>
                                      {canal.tipo === 'public' ? 'Público' : 'Privado'}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      canal.activo ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                    }`}>
                                      {canal.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                  </div>
                                  
                                  {canal.descripcion && (
                                    <p className="text-gray-300 mb-2">{canal.descripcion}</p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    <span>📝 Publicar: <strong>{canal.permisos_publicar}</strong></span>
                                    <span>💬 Comentar: <strong>{canal.permisos_comentar}</strong></span>
                                    <span>🎯 {getPlanNombre(canal.membresia_requerida)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Acciones */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleToggleActive(canal)}
                                  className={`px-3 py-1 rounded text-sm transition ${
                                    canal.activo 
                                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                                      : 'bg-green-600 hover:bg-green-700 text-white'
                                  }`}
                                >
                                  {canal.activo ? 'Desactivar' : 'Activar'}
                                </button>
                                
                                <button
                                  onClick={() => handleEdit(canal)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
                                >
                                  Editar
                                </button>
                                
                                <button
                                  onClick={() => setShowDeleteModal(canal)}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Modal Crear/Editar Canal */}
        {(showCreateForm || editingCanal) && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">
                {editingCanal ? 'Editar Canal' : 'Crear Nuevo Canal'}
              </h3>
              
              <form onSubmit={editingCanal ? handleUpdate : handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-yellow-400 mb-2 font-medium">Nombre del Canal</label>
                    <input
                      name="nombre"
                      type="text"
                      className="w-full p-3 rounded bg-black text-white border border-yellow-400 focus:border-yellow-300 focus:outline-none"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="ej. general, anuncios, soporte"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-yellow-400 mb-2 font-medium">Descripción</label>
                    <textarea
                      name="descripcion"
                      rows={3}
                      className="w-full p-3 rounded bg-black text-white border border-yellow-400 focus:border-yellow-300 focus:outline-none"
                      value={form.descripcion}
                      onChange={handleChange}
                      placeholder="Describe el propósito de este canal"
                    />
                  </div>

                  <div>
                    <label className="block text-yellow-400 mb-2 font-medium">Tipo de Canal</label>
                    <select
                      name="tipo"
                      className="w-full p-3 rounded bg-black text-white border border-yellow-400 focus:border-yellow-300 focus:outline-none"
                      value={form.tipo}
                      onChange={handleChange}
                    >
                      <option value="public">🌍 Público</option>
                      <option value="private">🔒 Privado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-yellow-400 mb-2 font-medium">Plan Requerido</label>
                    <select
                      name="membresia_requerida"
                      className="w-full p-3 rounded bg-black text-white border border-yellow-400 focus:border-yellow-300 focus:outline-none"
                      value={form.membresia_requerida}
                      onChange={handleChange}
                    >
                      <option value="">🆓 Acceso libre</option>
                      {planesSuscripcion.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          💎 {plan.nombre} - ${plan.precio}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-yellow-400 mb-2 font-medium">Permisos para Publicar</label>
                    <select
                      name="permisos_publicar"
                      className="w-full p-3 rounded bg-black text-white border border-yellow-400 focus:border-yellow-300 focus:outline-none"
                      value={form.permisos_publicar}
                      onChange={handleChange}
                    >
                      <option value="todos">👥 Todos los miembros</option>
                      <option value="admin_mod">👮 Admin/Moderadores</option>
                      <option value="solo_admin">👑 Solo Administradores</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-yellow-400 mb-2 font-medium">Permisos para Comentar</label>
                    <select
                      name="permisos_comentar"
                      className="w-full p-3 rounded bg-black text-white border border-yellow-400 focus:border-yellow-300 focus:outline-none"
                      value={form.permisos_comentar}
                      onChange={handleChange}
                    >
                      <option value="todos">👥 Todos los miembros</option>
                      <option value="admin_mod">👮 Admin/Moderadores</option>
                      <option value="solo_admin">👑 Solo Administradores</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        name="activo"
                        type="checkbox"
                        className="w-4 h-4 text-yellow-400 bg-black border-yellow-400 rounded focus:ring-yellow-300"
                        checked={form.activo}
                        onChange={handleChange}
                      />
                      <span className="text-yellow-400 font-medium">Canal activo</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingCanal(null);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 transition disabled:opacity-50"
                  >
                    {loading ? 'Procesando...' : (editingCanal ? 'Actualizar Canal' : 'Crear Canal')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Confirmar Eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-red-400 mb-4">Confirmar Eliminación</h3>
              <p className="text-gray-300 mb-6">
                ¿Estás seguro de que quieres eliminar el canal <strong>#{showDeleteModal.nombre}</strong>?
                Esta acción no se puede deshacer y se perderán todos los mensajes.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 