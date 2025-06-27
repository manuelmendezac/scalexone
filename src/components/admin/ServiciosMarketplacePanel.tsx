import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Upload, Star, Users, Briefcase, Eye } from 'lucide-react';
import { supabase } from '../../supabase';

interface Servicio {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  proveedor: string;
  categoria: string;
  rating: number;
  reviews: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

const ServiciosMarketplacePanel: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: 0,
    imagen_url: '',
    proveedor: '',
    categoria: 'Consultoría',
    rating: 4.8,
    reviews: 0,
    activo: true
  });

  const categorias = [
    'Consultoría',
    'Diseño',
    'Marketing',
    'Automatización',
    'Desarrollo',
    'Coaching',
    'Otros'
  ];

  useEffect(() => {
    cargarServicios();
  }, []);

  const cargarServicios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('servicios_marketplace')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServicios(data || []);
    } catch (error: any) {
      console.error('Error cargando servicios:', error);
      // Si la tabla no existe, inicializamos con array vacío
      setServicios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingServicio) {
        // Actualizar servicio existente
        const { error } = await supabase
          .from('servicios_marketplace')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingServicio.id);

        if (error) throw error;
      } else {
        // Crear nuevo servicio
        const { error } = await supabase
          .from('servicios_marketplace')
          .insert([{
            ...formData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      await cargarServicios();
      resetForm();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error guardando servicio:', error);
      alert('Error al guardar el servicio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setFormData({
      titulo: servicio.titulo,
      descripcion: servicio.descripcion,
      precio: servicio.precio,
      imagen_url: servicio.imagen_url || '',
      proveedor: servicio.proveedor,
      categoria: servicio.categoria,
      rating: servicio.rating,
      reviews: servicio.reviews,
      activo: servicio.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) return;

    try {
      const { error } = await supabase
        .from('servicios_marketplace')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await cargarServicios();
    } catch (error: any) {
      console.error('Error eliminando servicio:', error);
      alert('Error al eliminar el servicio');
    }
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      const { error } = await supabase
        .from('servicios_marketplace')
        .update({ 
          activo: !activo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await cargarServicios();
    } catch (error: any) {
      console.error('Error actualizando estado:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `servicios/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('servicios-marketplace')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('servicios-marketplace')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imagen_url: data.publicUrl }));
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      precio: 0,
      imagen_url: '',
      proveedor: '',
      categoria: 'Consultoría',
      rating: 4.8,
      reviews: 0,
      activo: true
    });
    setEditingServicio(null);
  };

  const crearServicioEjemplo = () => {
    setFormData({
      titulo: 'Consultoría Estratégica Premium',
      descripcion: 'Sesión personalizada de estrategia empresarial con expertos en escalabilidad y crecimiento de negocios digitales.',
      precio: 250,
      imagen_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500&h=300&fit=crop',
      proveedor: 'ScaleXone Consulting',
      categoria: 'Consultoría',
      rating: 4.9,
      reviews: 127,
      activo: true
    });
    setShowModal(true);
  };

  if (loading && servicios.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        <span className="ml-2 text-gray-300">Cargando servicios...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Servicios Marketplace</h2>
          <p className="text-gray-400">Gestiona los servicios disponibles en el marketplace</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={crearServicioEjemplo}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Eye size={16} />
            Servicio Ejemplo
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            Nuevo Servicio
          </button>
        </div>
      </div>

      {/* Lista de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicios.map((servicio) => (
          <motion.div
            key={servicio.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 rounded-xl border border-purple-500/20 overflow-hidden"
          >
            {/* Imagen */}
            <div className="relative h-48 bg-gray-800">
              {servicio.imagen_url ? (
                <img
                  src={servicio.imagen_url}
                  alt={servicio.titulo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Briefcase size={48} className="text-purple-400" />
                </div>
              )}
              
              {/* Badge de estado */}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  servicio.activo 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {servicio.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>

              {/* Rating */}
              <div className="absolute top-3 right-3">
                <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                  <Star className="w-3 h-3 text-purple-400 fill-current" />
                  <span className="text-purple-400 text-xs font-semibold">{servicio.rating}</span>
                </div>
              </div>
            </div>

            {/* Información */}
            <div className="p-4">
              <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                {servicio.titulo}
              </h3>
              
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {servicio.descripcion}
              </p>

              <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{servicio.reviews} reviews</span>
                </div>
                <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                  {servicio.categoria}
                </div>
              </div>

              <div className="text-sm text-gray-400 mb-3">
                Por: <span className="text-purple-400 font-semibold">{servicio.proveedor}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  ${servicio.precio}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(servicio)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  <Edit size={14} />
                  Editar
                </button>
                <button
                  onClick={() => toggleActivo(servicio.id, servicio.activo)}
                  className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors ${
                    servicio.activo
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {servicio.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDelete(servicio.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Estado vacío */}
      {servicios.length === 0 && !loading && (
        <div className="text-center py-12">
          <Briefcase size={64} className="text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No hay servicios</h3>
          <p className="text-gray-400 mb-4">Crea tu primer servicio para el marketplace</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-400 hover:to-pink-500 transition-all"
          >
            Crear Primer Servicio
          </button>
        </div>
      )}

      {/* Modal de crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl border border-purple-500/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  {editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Proveedor *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.proveedor}
                      onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rating
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 4.8 }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reviews
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reviews}
                      onChange={(e) => setFormData(prev => ({ ...prev, reviews: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  >
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Imagen del Servicio
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="URL de la imagen"
                      value={formData.imagen_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, imagen_url: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-400"
                    />
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <Upload size={16} />
                        {uploading ? 'Subiendo...' : 'Subir Imagen'}
                      </label>
                    </div>
                    {formData.imagen_url && (
                      <div className="mt-2">
                        <img
                          src={formData.imagen_url}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="activo" className="ml-2 text-sm text-gray-300">
                    Servicio activo
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Save size={16} />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ServiciosMarketplacePanel; 