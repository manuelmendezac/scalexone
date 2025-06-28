import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Upload, Star, Users, Briefcase, Eye, DollarSign, Info } from 'lucide-react';
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
  // Campos de afiliación
  afilible?: boolean;
  niveles_comision?: number;
  comision_nivel1?: number;
  comision_nivel2?: number;
  comision_nivel3?: number;
  fecha_afiliacion?: string;
  community_id?: string;
  // Campos para suscripciones
  tipo_producto?: 'servicio' | 'suscripcion';
  tipo_pago?: 'pago_unico' | 'suscripcion';
  plan_suscripcion_id?: string;
  duracion_dias?: number;
  caracteristicas?: string[];
  created_at?: string;
  updated_at?: string;
}

const ServiciosMarketplacePanel: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuscripcionModal, setShowSuscripcionModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [suscripcionData, setSuscripcionData] = useState({
    titulo: '',
    descripcion: '',
    precio: 0,
    imagen_url: '',
    proveedor: 'ScaleXone',
    categoria: 'Consultoría',
    rating: 4.8,
    reviews: 0,
    activo: true,
    tipo_producto: 'suscripcion' as const,
    tipo_pago: 'pago_unico' as 'pago_unico' | 'suscripcion',
    duracion_dias: 30,
    caracteristicas: [''],
    // Campos de afiliación
    afilible: true,
    niveles_comision: 3,
    comision_nivel1: 30,
    comision_nivel2: 20,
    comision_nivel3: 10
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

  const handleSuscripcionImageUpload = async (file: File) => {
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

      setSuscripcionData(prev => ({ ...prev, imagen_url: data.publicUrl }));
    } catch (error: any) {
      console.error('Error subiendo imagen de suscripción:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const resetSuscripcionForm = () => {
    setSuscripcionData({
      titulo: '',
      descripcion: '',
      precio: 0,
      imagen_url: '',
      proveedor: 'ScaleXone',
      categoria: 'Consultoría',
      rating: 4.8,
      reviews: 0,
      activo: true,
      tipo_producto: 'suscripcion' as const,
      tipo_pago: 'pago_unico' as 'pago_unico' | 'suscripcion',
      duracion_dias: 30,
      caracteristicas: [''],
      // Campos de afiliación
      afilible: true,
      niveles_comision: 3,
      comision_nivel1: 30,
      comision_nivel2: 20,
      comision_nivel3: 10
    });
  };

  const handleAddCaracteristica = () => {
    setSuscripcionData(prev => ({
      ...prev,
      caracteristicas: [...prev.caracteristicas, '']
    }));
  };

  const handleRemoveCaracteristica = (index: number) => {
    setSuscripcionData(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.filter((_, i) => i !== index)
    }));
  };

  const handleCaracteristicaChange = (index: number, value: string) => {
    setSuscripcionData(prev => ({
      ...prev,
      caracteristicas: prev.caracteristicas.map((item, i) => i === index ? value : item)
    }));
  };

  const handleSuscripcionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔥 PASO 1: Crear el plan SIEMPRE (tanto pago único como suscripción)
      const esPagoUnico = suscripcionData.tipo_pago === 'pago_unico';
      
      const planData = {
        comunidad_id: '8fb70d6e-3237-465e-8669-979461cf2bc1', // ScaleXone UUID como text
        nombre: `${esPagoUnico ? 'Servicio' : 'Plan'}: ${suscripcionData.titulo}`,
        descripcion: suscripcionData.descripcion,
        precio: suscripcionData.precio,
        moneda: 'USD',
        duracion_dias: esPagoUnico ? null : (suscripcionData.duracion_dias || 30), // ✅ Null para pago único
        caracteristicas: suscripcionData.caracteristicas.filter(c => c.trim() !== ''), // ✅ JS Array
        activo: true,
        orden: 0,
        limites: {},
        configuracion: {
          tipo: esPagoUnico ? 'servicio_pago_unico' : 'servicio_suscripcion', // ✅ Diferenciamos el tipo
          pago_unico: esPagoUnico, // ✅ Flag para identificar
          afiliacion: {
            habilitada: suscripcionData.afilible,
            niveles: suscripcionData.niveles_comision,
            comision_nivel1: suscripcionData.comision_nivel1,
            comision_nivel2: suscripcionData.comision_nivel2,
            comision_nivel3: suscripcionData.comision_nivel3
          }
        }
      };

      console.log(`📋 Datos del ${esPagoUnico ? 'servicio pago único' : 'servicio suscripción'} a crear:`, planData);

      const { data: planCreated, error: planError } = await supabase
        .from('planes_suscripcion')
        .insert([planData])
        .select()
        .single();

      if (planError) {
        console.error('❌ Error específico creando plan:', planError);
        throw new Error(`Error creando plan: ${planError.message}`);
      }

      console.log('✅ Plan creado exitosamente:', planCreated);

      // 🔥 PASO 2: Crear el servicio marketplace con referencia al plan
      const servicioData = {
        ...suscripcionData,
        id: crypto.randomUUID(),
        plan_suscripcion_id: planCreated.id, // ✅ SIEMPRE conectar con el plan
        tipo_producto: esPagoUnico ? 'servicio' : 'suscripcion', // ✅ Ajustar tipo_producto
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: servicioError } = await supabase
        .from('servicios_marketplace')
        .insert([servicioData]);

      if (servicioError) throw servicioError;

      await cargarServicios();
      resetSuscripcionForm();
      setShowSuscripcionModal(false);
      
      // ✅ Mensaje de éxito diferenciado
      const tipoServicio = esPagoUnico ? 'Servicio de pago único' : 'Servicio de suscripción';
      alert(`✅ ${tipoServicio} creado exitosamente\n\n🎯 Ahora aparecerá en:\n• Marketplace de Servicios\n• Portal de Suscripciones (para gestión)`);
    } catch (error: any) {
      console.error('Error guardando servicio:', error);
      alert('Error al guardar el servicio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const crearServicioEjemplo = () => {
    setSuscripcionData({
      titulo: 'Consultoría Estratégica Premium',
      descripcion: 'Sesión personalizada de estrategia empresarial con expertos en escalabilidad y crecimiento de negocios digitales.',
      precio: 250,
      imagen_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500&h=300&fit=crop',
      proveedor: 'ScaleXone Consulting',
      categoria: 'Consultoría',
      rating: 4.9,
      reviews: 127,
      activo: true,
      tipo_producto: 'suscripcion' as const,
      tipo_pago: 'pago_unico' as 'pago_unico' | 'suscripcion',
      duracion_dias: 30,
      caracteristicas: [
        'Análisis completo de tu negocio actual',
        'Plan estratégico personalizado',
        'Sesión de consultoría 1:1 de 90 minutos',
        'Documento con recomendaciones',
        'Seguimiento durante 30 días'
      ],
      // Campos de afiliación
      afilible: true,
      niveles_comision: 3,
      comision_nivel1: 25,
      comision_nivel2: 15,
      comision_nivel3: 8
    });
    setShowSuscripcionModal(true);
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
          <p className="text-gray-400">Gestiona servicios del marketplace. Las suscripciones se crean aquí pero se administran desde el Portal de Suscripciones.</p>
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
            onClick={() => setShowSuscripcionModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            Nuevo Servicio
          </button>
        </div>
      </div>

      {/* Estadísticas simples */}
      <div className="flex gap-4 items-center">
        <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-purple-500/20">
          <span className="text-gray-400 text-sm">Total Servicios: </span>
          <span className="text-white font-semibold">{servicios.filter(s => s.tipo_producto !== 'suscripcion').length}</span>
        </div>
        <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-blue-500/20">
          <span className="text-gray-400 text-sm">Suscripciones Creadas: </span>
          <span className="text-blue-400 font-semibold">{servicios.filter(s => s.tipo_producto === 'suscripcion').length}</span>
          <span className="text-gray-500 text-xs ml-1">(Se gestionan en Portal)</span>
        </div>
        <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-green-500/20">
          <span className="text-gray-400 text-sm">Activos: </span>
          <span className="text-green-400 font-semibold">{servicios.filter(s => s.activo).length}</span>
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
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  servicio.activo 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {servicio.activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
                {servicio.tipo_producto === 'suscripcion' && (
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                    SUSCRIPCIÓN
                  </span>
                )}
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
                <div className={`px-2 py-1 rounded-full ${
                  servicio.tipo_producto === 'suscripcion' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {servicio.categoria}
                </div>
              </div>

              <div className="text-sm text-gray-400 mb-3">
                Por: <span className="text-purple-400 font-semibold">{servicio.proveedor}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  ${servicio.precio}
                  {servicio.tipo_producto === 'suscripcion' && servicio.duracion_dias && (
                    <span className="text-sm text-gray-400 font-normal">
                      /{servicio.duracion_dias === 30 ? 'mes' : servicio.duracion_dias === 365 ? 'año' : `${servicio.duracion_dias} días`}
                    </span>
                  )}
                </div>
                {servicio.afilible && (
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-2 py-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-green-400" />
                    <span className="text-green-400 text-xs font-semibold">
                      {servicio.comision_nivel1 || 20}%
                    </span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
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
            onClick={() => setShowSuscripcionModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-400 hover:to-pink-500 transition-all"
          >
            Crear Primer Servicio
          </button>
        </div>
      )}

      {/* Modal de configurar suscripción */}
      {showSuscripcionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl border border-blue-500/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">
                  🎯 Nuevo Servicio
                </h3>
                <button
                  onClick={() => {
                    setShowSuscripcionModal(false);
                    resetSuscripcionForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSuscripcionSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre del Servicio *
                    </label>
                    <input
                      type="text"
                      required
                      value={suscripcionData.titulo}
                      onChange={(e) => setSuscripcionData(prev => ({ ...prev, titulo: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      placeholder="ej. Consultoría Estratégica Premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Proveedor
                    </label>
                    <input
                      type="text"
                      value={suscripcionData.proveedor}
                      onChange={(e) => setSuscripcionData(prev => ({ ...prev, proveedor: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    required
                    value={suscripcionData.descripcion}
                    onChange={(e) => setSuscripcionData(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    rows={3}
                    placeholder="Describe los beneficios y características del servicio..."
                  />
                </div>

                {/* Categoría del Servicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoría del Servicio
                  </label>
                  <select
                    value={suscripcionData.categoria}
                    onChange={(e) => setSuscripcionData(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                  >
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>

                {/* 💰 Tipo de Pago */}
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="text-blue-400" size={18} />
                    <h4 className="text-base font-semibold text-blue-200">💰 Modelo de Facturación</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo de Pago *
                      </label>
                      <select
                        value={suscripcionData.tipo_pago}
                        onChange={(e) => setSuscripcionData(prev => ({ ...prev, tipo_pago: e.target.value as 'pago_unico' | 'suscripcion' }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="pago_unico">💵 Pago Único - Una sola vez</option>
                        <option value="suscripcion">🔄 Suscripción - Recurrente</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg border ${
                        suscripcionData.tipo_pago === 'pago_unico' 
                          ? 'bg-green-900/30 border-green-500/40 text-green-300' 
                          : 'bg-blue-900/30 border-blue-500/40 text-blue-300'
                      }`}>
                        <div className="text-xs font-medium">
                          {suscripcionData.tipo_pago === 'pago_unico' ? '✅ Pago único' : '🔄 Suscripción'}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {suscripcionData.tipo_pago === 'pago_unico' 
                            ? 'El cliente paga una vez y tiene acceso permanente' 
                            : 'El cliente paga mensual/anualmente de forma recurrente'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Precio y duración */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio (USD) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={suscripcionData.precio}
                      onChange={(e) => setSuscripcionData(prev => ({ ...prev, precio: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  {/* ✅ DURACIÓN SOLO PARA SUSCRIPCIONES */}
                  {suscripcionData.tipo_pago === 'suscripcion' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Duración *
                      </label>
                      <select
                        value={suscripcionData.duracion_dias}
                        onChange={(e) => setSuscripcionData(prev => ({ ...prev, duracion_dias: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value={7}>Semanal (7 días)</option>
                        <option value={30}>Mensual (30 días)</option>
                        <option value={90}>Trimestral (90 días)</option>
                        <option value={365}>Anual (365 días)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Imagen del Servicio
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="URL de la imagen"
                      value={suscripcionData.imagen_url}
                      onChange={(e) => setSuscripcionData(prev => ({ ...prev, imagen_url: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    />
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleSuscripcionImageUpload(e.target.files[0])}
                        className="hidden"
                        id="suscripcion-image-upload"
                      />
                      <label
                        htmlFor="suscripcion-image-upload"
                        className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <Upload size={16} />
                        {uploading ? 'Subiendo...' : 'Subir Imagen'}
                      </label>
                    </div>
                    {suscripcionData.imagen_url && (
                      <div className="mt-2">
                        <img
                          src={suscripcionData.imagen_url}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Características */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Características y Beneficios
                  </label>
                  <div className="space-y-2">
                    {suscripcionData.caracteristicas.map((caracteristica, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={caracteristica}
                          onChange={(e) => handleCaracteristicaChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                          placeholder="ej. Acceso a todos los cursos premium"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCaracteristica(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddCaracteristica}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Plus size={16} />
                      Agregar Característica
                    </button>
                  </div>
                </div>

                {/* Configuración de Afiliación */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="text-blue-400" size={20} />
                    <h4 className="text-lg font-semibold text-white">💰 Configuración de Afiliación</h4>
                  </div>

                  <div className="space-y-4">
                    {/* Activar Afiliación */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="suscripcion-afilible"
                        checked={suscripcionData.afilible}
                        onChange={(e) => setSuscripcionData(prev => ({ ...prev, afilible: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="suscripcion-afilible" className="ml-2 text-sm text-gray-300">
                        Activar programa de afiliación para este servicio
                      </label>
                    </div>

                    {suscripcionData.afilible && (
                      <>
                        {/* Selector de Niveles */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Estructura de Comisiones
                          </label>
                          <select
                            value={suscripcionData.niveles_comision}
                            onChange={(e) => setSuscripcionData(prev => ({ ...prev, niveles_comision: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                          >
                            <option value={1}>1 Nivel (Directo)</option>
                            <option value={3}>3 Niveles (Multinivel)</option>
                          </select>
                        </div>

                        {/* Comisiones por Nivel */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Comisión Nivel 1 (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={suscripcionData.comision_nivel1}
                              onChange={(e) => setSuscripcionData(prev => ({ ...prev, comision_nivel1: parseFloat(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                            />
                          </div>

                          {suscripcionData.niveles_comision >= 2 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Comisión Nivel 2 (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={suscripcionData.comision_nivel2}
                                onChange={(e) => setSuscripcionData(prev => ({ ...prev, comision_nivel2: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                              />
                            </div>
                          )}

                          {suscripcionData.niveles_comision >= 3 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Comisión Nivel 3 (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={suscripcionData.comision_nivel3}
                                onChange={(e) => setSuscripcionData(prev => ({ ...prev, comision_nivel3: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-400"
                              />
                            </div>
                          )}
                        </div>

                        {/* Información explicativa */}
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Info className="text-blue-400 mt-0.5" size={16} />
                            <div className="text-sm text-blue-200">
                              <p className="font-medium mb-1">Comisiones Recurrentes:</p>
                              <p>• <strong>Nivel 1:</strong> {suscripcionData.comision_nivel1}% de ${suscripcionData.precio} = ${((suscripcionData.precio * suscripcionData.comision_nivel1) / 100).toFixed(2)} cada {suscripcionData.duracion_dias === 30 ? 'mes' : suscripcionData.duracion_dias === 365 ? 'año' : `${suscripcionData.duracion_dias} días`}</p>
                              {suscripcionData.niveles_comision >= 2 && (
                                <p>• <strong>Nivel 2:</strong> {suscripcionData.comision_nivel2}% de ${suscripcionData.precio} = ${((suscripcionData.precio * suscripcionData.comision_nivel2) / 100).toFixed(2)} cada {suscripcionData.duracion_dias === 30 ? 'mes' : suscripcionData.duracion_dias === 365 ? 'año' : `${suscripcionData.duracion_dias} días`}</p>
                              )}
                              {suscripcionData.niveles_comision >= 3 && (
                                <p>• <strong>Nivel 3:</strong> {suscripcionData.comision_nivel3}% de ${suscripcionData.precio} = ${((suscripcionData.precio * suscripcionData.comision_nivel3) / 100).toFixed(2)} cada {suscripcionData.duracion_dias === 30 ? 'mes' : suscripcionData.duracion_dias === 365 ? 'año' : `${suscripcionData.duracion_dias} días`}</p>
                              )}
                              <p className="mt-2 text-xs text-blue-300">
                                ⚡ Los afiliados reciben comisiones recurrentes mientras la suscripción esté activa.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="suscripcion-activa"
                    checked={suscripcionData.activo}
                    onChange={(e) => setSuscripcionData(prev => ({ ...prev, activo: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="suscripcion-activa" className="ml-2 text-sm text-gray-300">
                    Suscripción activa
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuscripcionModal(false);
                      resetSuscripcionForm();
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Save size={16} />
                    {loading ? 'Creando...' : 'Crear Suscripción'}
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