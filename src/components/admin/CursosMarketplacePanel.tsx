import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Upload, Eye, EyeOff, Save, X, GraduationCap } from 'lucide-react';
import { supabase } from '../../supabase';

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
  categoria?: string;
  rating?: number;
  estudiantes?: number;
  // Campos de afiliación
  afilible?: boolean;
  niveles_comision?: number;
  comision_nivel1?: number;
  comision_nivel2?: number;
  comision_nivel3?: number;
}

const CursosMarketplacePanel: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Curso>>({
    titulo: '',
    descripcion: '',
    precio: 0,
    instructor: 'ScaleXone',
    duracion_horas: 0,
    nivel: 'Principiante',
    activo: true,
    community_id: 'default',
    orden: 0,
    categoria: 'Curso',
    rating: 4.8,
    estudiantes: 0,
    // Campos de afiliación por defecto
    afilible: false,
    niveles_comision: 1,
    comision_nivel1: 0,
    comision_nivel2: 0,
    comision_nivel3: 0
  });

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('orden', { ascending: true });

      if (error) {
        console.error('Error cargando cursos:', error);
        setError(`Error al cargar cursos: ${error.message}`);
        setCursos([]);
      } else {
        setCursos(data || []);
      }
    } catch (error: any) {
      console.error('Error cargando cursos:', error);
      setError(`Error inesperado: ${error.message}`);
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cursos-marketplace')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('cursos-marketplace')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      setError(`Error al subir imagen: ${error.message}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const cursoData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        precio: formData.precio,
        imagen_url: formData.imagen_url,
        instructor: formData.instructor,
        duracion_horas: formData.duracion_horas,
        nivel: formData.nivel,
        community_id: formData.community_id || 'default',
        orden: formData.orden || 0,
        categoria: formData.categoria || 'Curso',
        rating: formData.rating || 4.8,
        estudiantes: formData.estudiantes || 0,
        // Campos de afiliación
        afilible: formData.afilible || false,
        niveles_comision: formData.niveles_comision || 1,
        comision_nivel1: formData.comision_nivel1 || 0,
        comision_nivel2: formData.comision_nivel2 || 0,
        comision_nivel3: formData.comision_nivel3 || 0
      };

      if (editingCurso) {
        // Actualizar curso existente
        const { error } = await supabase
          .from('cursos')
          .update(cursoData)
          .eq('id', editingCurso.id);

        if (error) throw error;
      } else {
        // Crear nuevo curso - agregar campo activo solo al crear
        const { error } = await supabase
          .from('cursos')
          .insert([{
            ...cursoData,
            activo: true
          }]);

        if (error) throw error;
      }

      await cargarCursos();
      resetForm();
      alert(editingCurso ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente');
    } catch (error: any) {
      console.error('Error guardando curso:', error);
      setError(`Error al guardar: ${error.message}`);
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
    } catch (error: any) {
      console.error('Error eliminando curso:', error);
      setError(`Error al eliminar: ${error.message}`);
    }
  };

  const toggleActivo = async (curso: Curso) => {
    try {
      const { error } = await supabase
        .from('cursos')
        .update({ activo: !curso.activo })
        .eq('id', curso.id);

      if (error) {
        console.error('Error actualizando estado activo:', error);
        setError(`No se puede cambiar el estado: ${error.message}`);
        return;
      }

      await cargarCursos();
    } catch (error: any) {
      console.error('Error actualizando estado:', error);
      setError(`Error al actualizar estado: ${error.message}`);
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
      orden: 0,
      categoria: 'Curso',
      rating: 4.8,
      estudiantes: 0,
      // Campos de afiliación por defecto
      afilible: false,
      niveles_comision: 1,
      comision_nivel1: 0,
      comision_nivel2: 0,
      comision_nivel3: 0
    });
    setError(null);
  };

  const crearCursoEjemplo = async () => {
    const cursoEjemplo = {
      titulo: 'Curso de Ejemplo - Marketplace',
      descripcion: 'Este es un curso de ejemplo para el marketplace de ventas. Puedes editarlo o eliminarlo.',
      precio: 99.99,
      instructor: 'ScaleXone Academy',
      duracion_horas: 10,
      nivel: 'Principiante' as const,
      activo: true,
      community_id: 'default',
      orden: 999,
      categoria: 'Curso',
      rating: 4.8,
      estudiantes: 25
    };

    try {
      const { error } = await supabase
        .from('cursos')
        .insert([cursoEjemplo]);

      if (error) throw error;

      await cargarCursos();
      alert('Curso de ejemplo creado exitosamente');
    } catch (error: any) {
      console.error('Error creando curso ejemplo:', error);
      setError(`Error al crear curso ejemplo: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="ml-3 text-gray-300">Cargando cursos del marketplace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Gestión de Cursos - Marketplace</h2>
          <p className="text-gray-400">Administra los cursos disponibles en el marketplace independiente</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={crearCursoEjemplo}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <GraduationCap size={20} />
            Curso Ejemplo
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus size={20} />
            Nuevo Curso
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
          <h3 className="text-red-400 font-bold mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
          >
            Cerrar
          </button>
        </div>
      )}

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

              <div>
                <label className="block text-gray-300 mb-2">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 4.8 })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Estudiantes</label>
                <input
                  type="number"
                  value={formData.estudiantes}
                  onChange={(e) => setFormData({ ...formData, estudiantes: parseInt(e.target.value) || 0 })}
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

            {/* Campo de imagen */}
            <div>
              <label className="block text-gray-300 mb-2">Imagen del Curso</label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const imageUrl = await uploadImage(file);
                      if (imageUrl) {
                        setFormData({ ...formData, imagen_url: imageUrl });
                      }
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  disabled={uploadingImage}
                />
                
                {uploadingImage && (
                  <div className="flex items-center gap-2 text-cyan-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                    <span className="text-sm">Subiendo imagen...</span>
                  </div>
                )}

                {formData.imagen_url && (
                  <div className="relative">
                    <img
                      src={formData.imagen_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imagen_url: '' })}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <input
                  type="url"
                  placeholder="O pega una URL de imagen"
                  value={formData.imagen_url || ''}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Sección de Configuración de Afiliación */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h4 className="text-yellow-400 font-bold text-lg mb-4 flex items-center gap-2">
                💰 Configuración de Afiliación
              </h4>
              
              <div className="space-y-4">
                {/* Activar/Desactivar afiliación */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="afilible"
                    checked={formData.afilible || false}
                    onChange={(e) => setFormData({ ...formData, afilible: e.target.checked })}
                    className="w-4 h-4 text-yellow-600 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500"
                  />
                  <label htmlFor="afilible" className="text-gray-300 font-medium">
                    Disponible para afiliación
                  </label>
                </div>

                {/* Configuración solo si está habilitada */}
                {formData.afilible && (
                  <div className="space-y-4">
                    {/* Selector de niveles */}
                    <div>
                      <label className="block text-gray-300 mb-2">Sistema de Comisiones</label>
                      <select
                        value={formData.niveles_comision || 1}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          niveles_comision: parseInt(e.target.value),
                          // Resetear niveles no usados
                          comision_nivel2: parseInt(e.target.value) < 2 ? 0 : formData.comision_nivel2,
                          comision_nivel3: parseInt(e.target.value) < 3 ? 0 : formData.comision_nivel3
                        })}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                      >
                        <option value={1}>Un solo nivel (Afiliado directo)</option>
                        <option value={3}>Tres niveles (Red de afiliados)</option>
                      </select>
                    </div>

                    {/* Porcentajes de comisión */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Nivel 1 */}
                      <div>
                        <label className="block text-gray-300 mb-2">
                          Nivel 1 (%) <span className="text-yellow-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.comision_nivel1 || 0}
                          onChange={(e) => setFormData({ ...formData, comision_nivel1: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                          placeholder="Ej: 25"
                        />
                        <p className="text-xs text-gray-400 mt-1">Afiliado directo</p>
                      </div>

                      {/* Nivel 2 */}
                      <div className={formData.niveles_comision === 1 ? 'opacity-50' : ''}>
                        <label className="block text-gray-300 mb-2">Nivel 2 (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.comision_nivel2 || 0}
                          onChange={(e) => setFormData({ ...formData, comision_nivel2: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                          placeholder="Ej: 15"
                          disabled={formData.niveles_comision === 1}
                        />
                        <p className="text-xs text-gray-400 mt-1">Quien refirió al afiliado</p>
                      </div>

                      {/* Nivel 3 */}
                      <div className={formData.niveles_comision === 1 ? 'opacity-50' : ''}>
                        <label className="block text-gray-300 mb-2">Nivel 3 (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.comision_nivel3 || 0}
                          onChange={(e) => setFormData({ ...formData, comision_nivel3: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                          placeholder="Ej: 10"
                          disabled={formData.niveles_comision === 1}
                        />
                        <p className="text-xs text-gray-400 mt-1">Nivel superior en la red</p>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-yellow-300 text-sm">
                        <strong>💡 Información:</strong> Los partners podrán solicitar afiliación a este curso. 
                        Una vez aprobados, podrán generar enlaces únicos y ganar comisiones por cada venta.
                      </p>
                      {formData.niveles_comision === 3 && (
                        <p className="text-yellow-300 text-sm mt-2">
                          <strong>🌐 Red multinivel:</strong> Los afiliados también ganarán comisiones por las ventas 
                          de sus referidos, creando una red de afiliados.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    {editingCurso ? 'Actualizar' : 'Crear'} Curso
                  </>
                )}
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

      {/* Lista de cursos */}
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
              <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                {curso.imagen_url ? (
                  <img
                    src={curso.imagen_url}
                    alt={curso.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <GraduationCap size={32} className="text-cyan-400" />
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

            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm">
                Por: {curso.instructor}
              </div>
              <div className="text-yellow-400 text-sm">
                ⭐ {curso.rating} ({curso.estudiantes})
              </div>
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

      {cursos.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No hay cursos en el marketplace</h3>
          <p className="text-gray-400 mb-4">
            La tabla 'cursos' está vacía. Puedes:
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={crearCursoEjemplo}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Crear Curso de Ejemplo
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Crear Primer Curso
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CursosMarketplacePanel; 