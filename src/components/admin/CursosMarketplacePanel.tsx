import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, Save, X } from 'lucide-react';
import { supabase } from '../../supabase';
import useNeuroState from '../../store/useNeuroState';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
  instructor: string;
  duracion_horas: number;
  nivel: 'Principiante' | 'Intermedio' | 'Avanzado';
  activo: boolean;
  community_id: string;
  orden: number;
}

const CursosMarketplacePanel: React.FC = () => {
  const { userInfo } = useNeuroState();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Curso>>({
    titulo: '',
    descripcion: '',
    precio: 0,
    instructor: 'ScaleXone',
    duracion_horas: 0,
    nivel: 'Principiante',
    activo: true,
    community_id: 'default',
    orden: 0
  });

  const isAdmin = userInfo?.rol === 'admin' || userInfo?.rol === 'superadmin';

  useEffect(() => {
    if (isAdmin) {
      cargarCursos();
    }
  }, [isAdmin]);

  const cargarCursos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('orden', { ascending: true });

      if (error) throw error;
      setCursos(data || []);
    } catch (error) {
      console.error('Error cargando cursos:', error);
      alert('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `curso_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cursos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('cursos')
        .getPublicUrl(fileName);

      setFormData({ ...formData, imagen_url: urlData.publicUrl });
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCurso) {
        // Actualizar curso existente
        const { error } = await supabase
          .from('cursos')
          .update({
            ...formData,
            nombre: formData.titulo, // Para compatibilidad
            imagen: formData.imagen_url // Para compatibilidad
          })
          .eq('id', editingCurso.id);

        if (error) throw error;
      } else {
        // Crear nuevo curso
        const { error } = await supabase
          .from('cursos')
          .insert([{
            ...formData,
            nombre: formData.titulo, // Para compatibilidad
            imagen: formData.imagen_url // Para compatibilidad
          }]);

        if (error) throw error;
      }

      await cargarCursos();
      resetForm();
      alert(editingCurso ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente');
    } catch (error) {
      console.error('Error guardando curso:', error);
      alert('Error al guardar el curso');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (curso: Curso) => {
    setEditingCurso(curso);
    setFormData(curso);
    setShowForm(true);
  };

  const handleDelete = async (curso: Curso) => {
    if (!confirm(`¿Estás seguro de eliminar el curso "${curso.titulo}"?`)) return;

    try {
      const { error } = await supabase
        .from('cursos')
        .delete()
        .eq('id', curso.id);

      if (error) throw error;

      await cargarCursos();
      alert('Curso eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando curso:', error);
      alert('Error al eliminar el curso');
    }
  };

  const toggleActivo = async (curso: Curso) => {
    try {
      const { error } = await supabase
        .from('cursos')
        .update({ activo: !curso.activo })
        .eq('id', curso.id);

      if (error) throw error;

      await cargarCursos();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado del curso');
    }
  };

  const resetForm = () => {
    setEditingCurso(null);
    setShowForm(false);
    setFormData({
      titulo: '',
      descripcion: '',
      precio: 0,
      instructor: 'ScaleXone',
      duracion_horas: 0,
      nivel: 'Principiante',
      activo: true,
      community_id: 'default',
      orden: 0
    });
  };

  if (!isAdmin) {
    return (
      <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-6">
        <h3 className="text-red-400 font-bold text-lg mb-2">Acceso Denegado</h3>
        <p className="text-gray-300">No tienes permisos para gestionar cursos del marketplace.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        <span className="ml-3 text-gray-300">Cargando cursos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Gestión de Cursos - Marketplace</h2>
          <p className="text-gray-400">Administra los cursos disponibles en el marketplace</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus size={20} />
          Nuevo Curso
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-xl p-6 border border-cyan-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">
              {editingCurso ? 'Editar Curso' : 'Nuevo Curso'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Duración (horas)</label>
                <input
                  type="number"
                  value={formData.duracion_horas}
                  onChange={(e) => setFormData({ ...formData, duracion_horas: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Nivel</label>
                <select
                  value={formData.nivel}
                  onChange={(e) => setFormData({ ...formData, nivel: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Orden</label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Imagen del Curso</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  <Upload size={16} />
                  {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                </label>
                {formData.imagen_url && (
                  <img
                    src={formData.imagen_url}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="rounded"
                />
                Curso activo
              </label>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar Curso'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Lista de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.map((curso) => (
          <motion.div
            key={curso.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-cyan-500/40 transition-all"
          >
            {/* Imagen */}
            <div className="relative mb-4">
              <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
                {curso.imagen_url ? (
                  <img
                    src={curso.imagen_url}
                    alt={curso.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  curso.activo ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {curso.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            {/* Contenido */}
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
              {curso.titulo}
            </h3>
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">
              {curso.descripcion}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="text-cyan-400 font-bold text-lg">
                ${curso.precio}
              </div>
              <div className="text-gray-400 text-sm">
                {curso.duracion_horas}h • {curso.nivel}
              </div>
            </div>

            <div className="text-gray-400 text-sm mb-4">
              Por: {curso.instructor}
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(curso)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                <Edit size={14} />
                Editar
              </button>
              <button
                onClick={() => toggleActivo(curso)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                  curso.activo
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {curso.activo ? <EyeOff size={14} /> : <Eye size={14} />}
                {curso.activo ? 'Ocultar' : 'Mostrar'}
              </button>
              <button
                onClick={() => handleDelete(curso)}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {cursos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No hay cursos</h3>
          <p className="text-gray-400 mb-4">Crea tu primer curso para el marketplace</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Crear Primer Curso
          </button>
        </div>
      )}
    </div>
  );
};

export default CursosMarketplacePanel; 