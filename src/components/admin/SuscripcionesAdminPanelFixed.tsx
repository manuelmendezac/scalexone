import React, { useState, useEffect } from 'react';
import { Users, DollarSign, CreditCard, TrendingUp, Calendar, Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Download, Eye, Pause, Play, UserX, Upload, Save, X, Info } from 'lucide-react';
import { SuscripcionesAPI, type SuscripcionConDetalles, type PlanSuscripcion, type EstadisticasComunidad } from '../../services/suscripcionesServiceV2';
import useNeuroState from '../../store/useNeuroState';
import { supabase } from '../../supabase';

const SuscripcionesAdminPanel: React.FC = () => {
  const [suscripciones, setSuscripciones] = useState<SuscripcionConDetalles[]>([]);
  const [planes, setPlanes] = useState<PlanSuscripcion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasComunidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'suscripciones' | 'planes' | 'estadisticas'>('suscripciones');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [mensaje, setMensaje] = useState('');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateSuscripcion, setShowCreateSuscripcion] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<PlanSuscripcion | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { userInfo } = useNeuroState();
  
  // Estado para manejar la comunidad
  const [comunidadId, setComunidadId] = useState<string | null>(null);
  const [intentosInicializacion, setIntentosInicializacion] = useState(0);

  // Estados para formularios
  const [nuevoPlan, setNuevoPlan] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    moneda: 'USD',
    duracion_valor: '1',
    duracion_tipo: 'mes',
    caracteristicas: [''],
    limite_usuarios: '',
    prueba_gratis: false,
    duracion_prueba: '7',
    tipo_prueba: 'dias',
    categoria: 'premium',
    destacado: false,
    color_personalizado: '#3B82F6',
    activo: true,
    orden: 0,
    // Campos de marketplace e imagen
    imagen_url: '',
    agregar_marketplace: true,
    // Campos de afiliación
    afilible: true,
    niveles_comision: 3,
    comision_nivel1: 30,
    comision_nivel2: 20,
    comision_nivel3: 10
  });

  const [nuevaSuscripcion, setNuevaSuscripcion] = useState({
    usuario_email: '',
    plan_id: '',
    precio_personalizado: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    renovacion_automatica: true
  });

  const inicializarComunidad = async () => {
    if (!userInfo?.id) return;

    try {
      // Usar el UUID real de la comunidad ScaleXone existente
      const communityId = userInfo?.community_id || '8fb70d6e-3237-465e-8669-979461cf2bc1';
      console.log(`Usando community_id: ${communityId}`);
      
      setComunidadId(communityId);
      setMensaje('Comunidad inicializada correctamente');
    } catch (error: any) {
      console.error('Error inicializando comunidad:', error);
      setMensaje(`Error inicializando: ${error.message}`);
      
      // Reintentar hasta 3 veces
      if (intentosInicializacion < 3) {
        setIntentosInicializacion(prev => prev + 1);
        setTimeout(() => inicializarComunidad(), 2000);
      }
    }
  };

  const cargarDatos = async () => {
    if (!comunidadId) return;

    try {
      setLoading(true);
      
      // Cargar suscripciones y planes en paralelo
      const [suscripcionesData, planesData, estadisticasData] = await Promise.all([
        SuscripcionesAPI.Suscripciones.obtenerSuscripcionesPorComunidad(comunidadId),
        SuscripcionesAPI.Planes.obtenerPlanesPorComunidad(comunidadId),
        SuscripcionesAPI.Estadisticas.obtenerEstadisticasComunidad(comunidadId)
      ]);

      setSuscripciones(suscripcionesData);
      setPlanes(planesData);
      setEstadisticas(estadisticasData);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      setMensaje(`Error cargando datos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.id && !comunidadId) {
      inicializarComunidad();
    }
  }, [userInfo?.id]);

  useEffect(() => {
    if (comunidadId) {
      cargarDatos();
    }
  }, [comunidadId]);

  // Función para subir imagen
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `suscripciones/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('servicios-marketplace')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('servicios-marketplace')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      setMensaje(`Error al subir imagen: ${error.message}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Funciones para crear plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comunidadId) return;

    try {
      setActionLoading('crear-plan');
      
      // Calcular duracion_dias basado en tipo y valor
      const calcularDuracionDias = () => {
        const valor = parseInt(nuevoPlan.duracion_valor);
        switch (nuevoPlan.duracion_tipo) {
          case 'dia': return valor;
          case 'semana': return valor * 7;
          case 'mes': return valor * 30;
          case 'año': return valor * 365;
          default: return valor * 30;
        }
      };

      const planData = {
        nombre: nuevoPlan.nombre,
        descripcion: nuevoPlan.descripcion,
        precio: parseFloat(nuevoPlan.precio),
        moneda: nuevoPlan.moneda,
        duracion_dias: calcularDuracionDias(),
        caracteristicas: nuevoPlan.caracteristicas.filter(c => c.trim() !== ''),
        limites: nuevoPlan.limite_usuarios ? { usuarios: parseInt(nuevoPlan.limite_usuarios) } : {},
        configuracion: {
          prueba_gratis: nuevoPlan.prueba_gratis,
          duracion_prueba: nuevoPlan.prueba_gratis ? parseInt(nuevoPlan.duracion_prueba) : 0,
          tipo_prueba: nuevoPlan.tipo_prueba,
          categoria: nuevoPlan.categoria,
          destacado: nuevoPlan.destacado,
          color: nuevoPlan.color_personalizado
        },
        activo: nuevoPlan.activo,
        orden: nuevoPlan.orden,
        comunidad_id: comunidadId
      };

      // Crear el plan de suscripción
      const planCreado = await SuscripcionesAPI.Planes.crearPlan(planData);
      
      // Si está marcado para agregar al marketplace, agregarlo automáticamente
      if (nuevoPlan.agregar_marketplace && planCreado) {
        await agregarPlanAlMarketplace(planCreado);
      }
      
      setMensaje('Plan creado exitosamente');
      setShowCreatePlan(false);
      resetFormPlan();
      await cargarDatos();
    } catch (error: any) {
      setMensaje('Error al crear plan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Función para agregar plan al marketplace
  const agregarPlanAlMarketplace = async (plan: PlanSuscripcion) => {
    try {
      const servicioData = {
        titulo: `Suscripción ${plan.nombre}`,
        descripcion: plan.descripcion || `Plan de suscripción ${plan.nombre} con acceso completo a la plataforma`,
        precio: plan.precio,
        imagen_url: nuevoPlan.imagen_url || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&h=300&fit=crop',
        proveedor: 'ScaleXone',
        categoria: 'Suscripción Premium',
        rating: 4.8,
        reviews: 0,
        activo: plan.activo,
        tipo_producto: 'suscripcion',
        plan_suscripcion_id: plan.id,
        duracion_dias: plan.duracion_dias,
        caracteristicas: plan.caracteristicas || [],
        afilible: nuevoPlan.afilible,
        niveles_comision: nuevoPlan.niveles_comision,
        comision_nivel1: nuevoPlan.comision_nivel1,
        comision_nivel2: nuevoPlan.comision_nivel2,
        comision_nivel3: nuevoPlan.comision_nivel3,
        fecha_afiliacion: new Date().toISOString(),
        community_id: comunidadId
      };

      const { error } = await supabase
        .from('servicios_marketplace')
        .insert([servicioData]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error agregando al marketplace:', error);
      setMensaje('Plan creado, pero error agregando al marketplace: ' + error.message);
    }
  };

  // Función para editar plan
  const handleEditPlan = (plan: PlanSuscripcion) => {
    setEditingPlan(plan);
    setNuevoPlan({
      nombre: plan.nombre,
      descripcion: plan.descripcion || '',
      precio: plan.precio.toString(),
      moneda: plan.moneda || 'USD',
      duracion_valor: '1',
      duracion_tipo: plan.duracion_dias === 30 ? 'mes' : plan.duracion_dias === 365 ? 'año' : 'dia',
      caracteristicas: plan.caracteristicas?.length ? plan.caracteristicas : [''],
      limite_usuarios: plan.limites?.usuarios?.toString() || '',
      prueba_gratis: plan.configuracion?.prueba_gratis || false,
      duracion_prueba: plan.configuracion?.duracion_prueba?.toString() || '7',
      tipo_prueba: plan.configuracion?.tipo_prueba || 'dias',
      categoria: plan.configuracion?.categoria || 'premium',
      destacado: plan.configuracion?.destacado || false,
      color_personalizado: plan.configuracion?.color || '#3B82F6',
      activo: plan.activo,
      orden: plan.orden || 0,
      imagen_url: '',
      agregar_marketplace: false,
      afilible: true,
      niveles_comision: 3,
      comision_nivel1: 30,
      comision_nivel2: 20,
      comision_nivel3: 10
    });
    setShowCreatePlan(true);
  };

  // Función para eliminar plan
  const handleDeletePlan = async (planId: string, planNombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el plan "${planNombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setActionLoading(`delete-${planId}`);
      
      // Eliminar del marketplace primero (si existe)
      await supabase
        .from('servicios_marketplace')
        .delete()
        .eq('plan_suscripcion_id', planId);

      // Eliminar el plan
      await SuscripcionesAPI.Planes.eliminarPlan(planId);
      
      setMensaje('Plan eliminado exitosamente');
      await cargarDatos();
    } catch (error: any) {
      setMensaje('Error al eliminar plan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Función para actualizar plan
  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comunidadId || !editingPlan) return;

    try {
      setActionLoading('actualizar-plan');
      
      const calcularDuracionDias = () => {
        const valor = parseInt(nuevoPlan.duracion_valor);
        switch (nuevoPlan.duracion_tipo) {
          case 'dia': return valor;
          case 'semana': return valor * 7;
          case 'mes': return valor * 30;
          case 'año': return valor * 365;
          default: return valor * 30;
        }
      };

      const planData = {
        nombre: nuevoPlan.nombre,
        descripcion: nuevoPlan.descripcion,
        precio: parseFloat(nuevoPlan.precio),
        moneda: nuevoPlan.moneda,
        duracion_dias: calcularDuracionDias(),
        caracteristicas: nuevoPlan.caracteristicas.filter(c => c.trim() !== ''),
        limites: nuevoPlan.limite_usuarios ? { usuarios: parseInt(nuevoPlan.limite_usuarios) } : {},
        configuracion: {
          prueba_gratis: nuevoPlan.prueba_gratis,
          duracion_prueba: nuevoPlan.prueba_gratis ? parseInt(nuevoPlan.duracion_prueba) : 0,
          tipo_prueba: nuevoPlan.tipo_prueba,
          categoria: nuevoPlan.categoria,
          destacado: nuevoPlan.destacado,
          color: nuevoPlan.color_personalizado
        },
        activo: nuevoPlan.activo,
        orden: nuevoPlan.orden
      };

      await SuscripcionesAPI.Planes.actualizarPlan(editingPlan.id, planData);
      
      setMensaje('Plan actualizado exitosamente');
      setShowCreatePlan(false);
      setEditingPlan(null);
      resetFormPlan();
      await cargarDatos();
    } catch (error: any) {
      setMensaje('Error al actualizar plan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Función para resetear formulario
  const resetFormPlan = () => {
    setNuevoPlan({
      nombre: '',
      descripcion: '',
      precio: '',
      moneda: 'USD',
      duracion_valor: '1',
      duracion_tipo: 'mes',
      caracteristicas: [''],
      limite_usuarios: '',
      prueba_gratis: false,
      duracion_prueba: '7',
      tipo_prueba: 'dias',
      categoria: 'premium',
      destacado: false,
      color_personalizado: '#3B82F6',
      activo: true,
      orden: 0,
      imagen_url: '',
      agregar_marketplace: true,
      afilible: true,
      niveles_comision: 3,
      comision_nivel1: 30,
      comision_nivel2: 20,
      comision_nivel3: 10
    });
    setEditingPlan(null);
  };

  // Función para crear suscripción
  const handleCreateSuscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comunidadId) return;

    try {
      setActionLoading('crear-suscripcion');
      
      // Buscar usuario por email
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', nuevaSuscripcion.usuario_email)
        .single();

      if (userError || !usuario) {
        throw new Error('Usuario no encontrado con ese email');
      }

      const suscripcionData = {
        usuario_id: usuario.id,
        plan_id: nuevaSuscripcion.plan_id,
        precio_pagado: nuevaSuscripcion.precio_personalizado ? 
          parseFloat(nuevaSuscripcion.precio_personalizado) : undefined,
        fecha_inicio: nuevaSuscripcion.fecha_inicio,
        renovacion_automatica: nuevaSuscripcion.renovacion_automatica,
        estado: 'activa' as const
      };

      await SuscripcionesAPI.Suscripciones.crearSuscripcion(suscripcionData);
      
      setMensaje('Suscripción creada exitosamente');
      setShowCreateSuscripcion(false);
      setNuevaSuscripcion({
        usuario_email: '',
        plan_id: '',
        precio_personalizado: '',
        fecha_inicio: new Date().toISOString().split('T')[0],
        renovacion_automatica: true
      });
      
      await cargarDatos();
    } catch (error: any) {
      setMensaje('Error al crear suscripción: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filtrar suscripciones
  const filteredSuscripciones = suscripciones.filter(sub => {
    const matchesSearch = sub.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.usuario_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'todos') return matchesSearch;
    return matchesSearch && sub.estado === selectedFilter;
  });

  // Estadísticas calculadas si no tenemos de la BD
  const stats = estadisticas || {
    comunidad_id: comunidadId || '',
    comunidad_nombre: 'Mi Comunidad',
    total_suscriptores: suscripciones.length,
    suscriptores_activos: suscripciones.filter(s => s.estado === 'activa').length,
    ingresos_mes_actual: suscripciones
      .filter(s => s.estado === 'activa')
      .reduce((acc, s) => acc + (s.precio_pagado || 0), 0),
    ingresos_totales: suscripciones
      .reduce((acc, s) => acc + (s.precio_pagado || 0), 0),
    total_planes: planes.length
  };

  if (loading || !comunidadId) {
    return (
      <div className="flex-1 p-8 bg-black">
        <div className="w-full bg-gray-900/50 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">Portal de Suscripciones</h1>
          <div className="text-white">
            {!comunidadId ? 'Inicializando comunidad...' : 'Cargando datos...'}
          </div>
          {mensaje && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
              {mensaje}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-black">
      <div className="w-full bg-gray-900/50 rounded-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Portal de Suscripciones</h1>
            <p className="text-gray-400">Gestiona suscripciones, planes y estadísticas financieras.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreatePlan(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Crear Plan
            </button>
            <button
              onClick={() => setShowCreateSuscripcion(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Nueva Suscripción
            </button>
          </div>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-300">
            {mensaje}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setSelectedTab('suscripciones')}
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === 'suscripciones'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Suscripciones
          </button>
          <button
            onClick={() => setSelectedTab('planes')}
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === 'planes'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Planes
          </button>
          <button
            onClick={() => setSelectedTab('estadisticas')}
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === 'estadisticas'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Estadísticas
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Suscriptores</p>
                <p className="text-2xl font-bold text-white">{stats.total_suscriptores}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Suscriptores Activos</p>
                <p className="text-2xl font-bold text-green-500">{stats.suscriptores_activos}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ingresos Mes Actual</p>
                <p className="text-2xl font-bold text-yellow-500">${stats.ingresos_mes_actual.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Planes</p>
                <p className="text-2xl font-bold text-purple-500">{stats.total_planes}</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        {selectedTab === 'suscripciones' && (
          <>
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar suscripciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
                  />
                </div>
                
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activa">Activas</option>
                  <option value="cancelada">Canceladas</option>
                  <option value="pausada">Pausadas</option>
                  <option value="vencida">Vencidas</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
            </div>

            {/* Suscripciones Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="text-left p-4 text-gray-300">Usuario</th>
                    <th className="text-left p-4 text-gray-300">Plan</th>
                    <th className="text-left p-4 text-gray-300">Precio</th>
                    <th className="text-left p-4 text-gray-300">Estado</th>
                    <th className="text-left p-4 text-gray-300">Vencimiento</th>
                    <th className="text-left p-4 text-gray-300">Renovación</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuscripciones.map((sub, index) => (
                    <tr key={sub.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-white">{sub.usuario_nombre}</div>
                          <div className="text-sm text-gray-400">{sub.usuario_email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                          {sub.plan_nombre}
                        </span>
                      </td>
                      <td className="p-4 text-white font-medium">${sub.precio_pagado || sub.plan_precio}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          sub.estado === 'activa' ? 'bg-green-600 text-white' :
                          sub.estado === 'pausada' ? 'bg-yellow-600 text-white' :
                          sub.estado === 'cancelada' ? 'bg-red-600 text-white' :
                          sub.estado === 'vencida' ? 'bg-gray-600 text-white' :
                          'bg-blue-600 text-white'
                        }`}>
                          {sub.estado.charAt(0).toUpperCase() + sub.estado.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-white">{new Date(sub.fecha_fin).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${sub.renovacion_automatica ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                          {sub.renovacion_automatica ? 'Automática' : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredSuscripciones.length === 0 && (
                <div className="p-8 text-center text-gray-400">
                  No se encontraron suscripciones con los filtros aplicados.
                </div>
              )}
            </div>
          </>
        )}

        {selectedTab === 'planes' && (
          <div className="space-y-6">
            {planes.map((plan) => (
              <div key={plan.id} className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{plan.nombre}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${plan.activo ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                        {plan.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3">{plan.descripcion}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-300">
                      <span className="flex items-center gap-2">
                        <DollarSign size={16} />
                        ${plan.precio} / {plan.duracion_dias} días
                      </span>
                                             {plan.limites?.usuarios && (
                         <span className="flex items-center gap-2">
                           <Users size={16} />
                           Máx. {plan.limites.usuarios} usuarios
                         </span>
                       )}
                    </div>
                    {plan.caracteristicas && plan.caracteristicas.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-400 mb-2">Características:</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.caracteristicas.map((caracteristica, index) => (
                            <span key={index} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                              {caracteristica}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditPlan(plan)}
                      className="p-2 text-blue-400 hover:bg-blue-900 rounded transition-colors"
                      title="Editar plan"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id, plan.nombre)}
                      disabled={actionLoading === `delete-${plan.id}`}
                      className="p-2 text-red-400 hover:bg-red-900 rounded transition-colors disabled:opacity-50"
                      title="Eliminar plan"
                    >
                      {actionLoading === `delete-${plan.id}` ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {planes.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay planes creados aún.</p>
                <p className="text-sm">Haz clic en "Crear Plan" para comenzar.</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'estadisticas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Resumen Financiero</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ingresos Totales:</span>
                  <span className="text-white font-medium">${stats.ingresos_totales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ingresos Este Mes:</span>
                  <span className="text-green-500 font-medium">${stats.ingresos_mes_actual.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Promedio por Suscriptor:</span>
                  <span className="text-white font-medium">
                    ${stats.total_suscriptores > 0 ? (stats.ingresos_mes_actual / stats.suscriptores_activos).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Métricas de Suscriptores</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tasa de Conversión:</span>
                  <span className="text-white font-medium">
                    {stats.total_suscriptores > 0 ? 
                      ((stats.suscriptores_activos / stats.total_suscriptores) * 100).toFixed(1) : '0'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Planes Disponibles:</span>
                  <span className="text-white font-medium">{stats.total_planes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Crecimiento:</span>
                  <span className="text-green-500 font-medium">+{stats.suscriptores_activos}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Plan */}
      {showCreatePlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingPlan ? 'Editar Plan de Suscripción' : 'Crear Nuevo Plan de Suscripción'}
              </h3>
              <button
                onClick={() => {
                  setShowCreatePlan(false);
                  resetFormPlan();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan} className="space-y-6">
              
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Plan</label>
                  <input
                    type="text"
                    value={nuevoPlan.nombre}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, nombre: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="ej. Plan Premium"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
                  <select
                    value={nuevoPlan.categoria}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, categoria: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="basico">Básico</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="starter">Starter</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={nuevoPlan.descripcion}
                  onChange={(e) => setNuevoPlan({...nuevoPlan, descripcion: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  rows={3}
                  placeholder="Describe las características principales del plan..."
                />
              </div>

              {/* Imagen del Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Imagen del Plan</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const imageUrl = await uploadImage(file);
                        if (imageUrl) {
                          setNuevoPlan({ ...nuevoPlan, imagen_url: imageUrl });
                        }
                      }
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                    disabled={uploadingImage}
                  />
                  
                  {uploadingImage && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                      <span className="text-sm">Subiendo imagen...</span>
                    </div>
                  )}

                  {nuevoPlan.imagen_url && (
                    <div className="relative">
                      <img
                        src={nuevoPlan.imagen_url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setNuevoPlan({ ...nuevoPlan, imagen_url: '' })}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <input
                    type="url"
                    placeholder="O pega una URL de imagen"
                    value={nuevoPlan.imagen_url || ''}
                    onChange={(e) => setNuevoPlan({ ...nuevoPlan, imagen_url: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>
              
              {/* Precio y duración */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Precio</label>
                  <div className="flex">
                    <input
                      type="number"
                      step="0.01"
                      value={nuevoPlan.precio}
                      onChange={(e) => setNuevoPlan({...nuevoPlan, precio: e.target.value})}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:border-yellow-500 focus:outline-none"
                      placeholder="0.00"
                      required
                    />
                    <select
                      value={nuevoPlan.moneda}
                      onChange={(e) => setNuevoPlan({...nuevoPlan, moneda: e.target.value})}
                      className="px-3 py-2 bg-gray-700 border-l-0 border border-gray-600 rounded-r-lg text-white focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="MXN">MXN</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duración</label>
                  <input
                    type="number"
                    min="1"
                    value={nuevoPlan.duracion_valor}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, duracion_valor: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Período</label>
                  <select
                    value={nuevoPlan.duracion_tipo}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, duracion_tipo: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="dia">Día(s)</option>
                    <option value="semana">Semana(s)</option>
                    <option value="mes">Mes(es)</option>
                    <option value="año">Año(s)</option>
                  </select>
                </div>
              </div>

              {/* Integración con Marketplace */}
              {!editingPlan && (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="agregar_marketplace"
                      checked={nuevoPlan.agregar_marketplace}
                      onChange={(e) => setNuevoPlan({...nuevoPlan, agregar_marketplace: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="agregar_marketplace" className="text-blue-200 font-medium">
                      🚀 Agregar automáticamente al Marketplace
                    </label>
                  </div>
                  <p className="text-blue-300 text-sm mt-2">
                    Si activas esta opción, el plan se agregará automáticamente al marketplace de servicios 
                    para que los afiliados puedan promocionarlo y generar comisiones.
                  </p>
                </div>
              )}

              {/* 💰 Configuración de Afiliación */}
              {nuevoPlan.agregar_marketplace && (
                <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="text-yellow-300 font-semibold mb-4 flex items-center gap-2">
                    💰 Configuración de Afiliación
                  </h4>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="afilible"
                      checked={nuevoPlan.afilible}
                      onChange={(e) => setNuevoPlan({...nuevoPlan, afilible: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="afilible" className="text-yellow-200 font-medium">
                      Permitir afiliación a este plan
                    </label>
                  </div>

                  {nuevoPlan.afilible && (
                    <div className="space-y-4">
                      {/* Selector de niveles */}
                      <div>
                        <label className="block text-gray-300 mb-2">Sistema de Comisiones</label>
                        <select
                          value={nuevoPlan.niveles_comision || 1}
                          onChange={(e) => setNuevoPlan({ 
                            ...nuevoPlan, 
                            niveles_comision: parseInt(e.target.value),
                            // Resetear niveles no usados
                            comision_nivel2: parseInt(e.target.value) < 2 ? 0 : nuevoPlan.comision_nivel2,
                            comision_nivel3: parseInt(e.target.value) < 3 ? 0 : nuevoPlan.comision_nivel3
                          })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
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
                            value={nuevoPlan.comision_nivel1 || 0}
                            onChange={(e) => setNuevoPlan({ ...nuevoPlan, comision_nivel1: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                            placeholder="Ej: 30"
                          />
                          <p className="text-xs text-gray-400 mt-1">Afiliado directo</p>
                        </div>

                        {/* Nivel 2 */}
                        <div className={nuevoPlan.niveles_comision === 1 ? 'opacity-50' : ''}>
                          <label className="block text-gray-300 mb-2">Nivel 2 (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={nuevoPlan.comision_nivel2 || 0}
                            onChange={(e) => setNuevoPlan({ ...nuevoPlan, comision_nivel2: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                            placeholder="Ej: 20"
                            disabled={nuevoPlan.niveles_comision === 1}
                          />
                          <p className="text-xs text-gray-400 mt-1">Quien refirió al afiliado</p>
                        </div>

                        {/* Nivel 3 */}
                        <div className={nuevoPlan.niveles_comision === 1 ? 'opacity-50' : ''}>
                          <label className="block text-gray-300 mb-2">Nivel 3 (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={nuevoPlan.comision_nivel3 || 0}
                            onChange={(e) => setNuevoPlan({ ...nuevoPlan, comision_nivel3: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                            placeholder="Ej: 10"
                            disabled={nuevoPlan.niveles_comision === 1}
                          />
                          <p className="text-xs text-gray-400 mt-1">Nivel superior en la red</p>
                        </div>
                      </div>

                      {/* Información de comisiones calculadas */}
                      <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Info className="text-yellow-400 mt-0.5" size={16} />
                          <div className="text-sm text-yellow-200">
                            <p className="font-medium mb-1">Cálculo de Comisiones Recurrentes:</p>
                            <p>• <strong>Nivel 1:</strong> {nuevoPlan.comision_nivel1}% de ${nuevoPlan.precio} = ${((parseFloat(nuevoPlan.precio) * nuevoPlan.comision_nivel1) / 100).toFixed(2)} por período</p>
                            {nuevoPlan.niveles_comision >= 2 && (
                              <p>• <strong>Nivel 2:</strong> {nuevoPlan.comision_nivel2}% de ${nuevoPlan.precio} = ${((parseFloat(nuevoPlan.precio) * nuevoPlan.comision_nivel2) / 100).toFixed(2)} por período</p>
                            )}
                            {nuevoPlan.niveles_comision >= 3 && (
                              <p>• <strong>Nivel 3:</strong> {nuevoPlan.comision_nivel3}% de ${nuevoPlan.precio} = ${((parseFloat(nuevoPlan.precio) * nuevoPlan.comision_nivel3) / 100).toFixed(2)} por período</p>
                            )}
                            <p className="mt-2 text-xs text-yellow-300">
                              💡 Las comisiones se generan cada vez que el usuario renueva su suscripción.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Características */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Características del Plan</label>
                <div className="space-y-2">
                  {nuevoPlan.caracteristicas.map((caracteristica, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={caracteristica}
                        onChange={(e) => {
                          const newCaracteristicas = [...nuevoPlan.caracteristicas];
                          newCaracteristicas[index] = e.target.value;
                          setNuevoPlan({...nuevoPlan, caracteristicas: newCaracteristicas});
                        }}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                        placeholder="ej. Acceso completo a la plataforma"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newCaracteristicas = nuevoPlan.caracteristicas.filter((_, i) => i !== index);
                          setNuevoPlan({...nuevoPlan, caracteristicas: newCaracteristicas});
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNuevoPlan({...nuevoPlan, caracteristicas: [...nuevoPlan.caracteristicas, '']})}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    + Agregar característica
                  </button>
                </div>
              </div>
              
              {/* Configuraciones adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Límite de Usuarios (opcional)</label>
                  <input
                    type="number"
                    min="1"
                    value={nuevoPlan.limite_usuarios}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, limite_usuarios: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="Sin límite"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Orden de Visualización</label>
                  <input
                    type="number"
                    value={nuevoPlan.orden}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, orden: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>
              
              {/* Prueba gratuita */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={nuevoPlan.prueba_gratis}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, prueba_gratis: e.target.checked})}
                    className="rounded"
                  />
                  <label className="text-sm text-gray-300">Incluir período de prueba gratuita</label>
                </div>
                
                {nuevoPlan.prueba_gratis && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duración de la prueba</label>
                      <input
                        type="number"
                        min="1"
                        value={nuevoPlan.duracion_prueba}
                        onChange={(e) => setNuevoPlan({...nuevoPlan, duracion_prueba: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                      <select
                        value={nuevoPlan.tipo_prueba}
                        onChange={(e) => setNuevoPlan({...nuevoPlan, tipo_prueba: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                      >
                        <option value="dias">Días</option>
                        <option value="semanas">Semanas</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Opciones finales */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={nuevoPlan.activo}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, activo: e.target.checked})}
                    className="rounded"
                  />
                  <label className="text-sm text-gray-300">Plan activo</label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={nuevoPlan.destacado}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, destacado: e.target.checked})}
                    className="rounded"
                  />
                  <label className="text-sm text-gray-300">Plan destacado</label>
                </div>
              </div>
              
              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePlan(false);
                    resetFormPlan();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'crear-plan' || actionLoading === 'actualizar-plan' || uploadingImage}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(actionLoading === 'crear-plan' || actionLoading === 'actualizar-plan') ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingPlan ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingPlan ? 'Actualizar Plan' : 'Crear Plan'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Suscripción */}
      {showCreateSuscripcion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Nueva Suscripción</h3>
            <form onSubmit={handleCreateSuscripcion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email del Usuario</label>
                <input
                  type="email"
                  value={nuevaSuscripcion.usuario_email}
                  onChange={(e) => setNuevaSuscripcion({...nuevaSuscripcion, usuario_email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Plan</label>
                <select
                  value={nuevaSuscripcion.plan_id}
                  onChange={(e) => setNuevaSuscripcion({...nuevaSuscripcion, plan_id: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  required
                >
                  <option value="">Selecciona un plan</option>
                  {planes.filter(p => p.activo).map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nombre} - ${plan.precio}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Precio Personalizado (opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={nuevaSuscripcion.precio_personalizado}
                  onChange={(e) => setNuevaSuscripcion({...nuevaSuscripcion, precio_personalizado: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Dejar vacío para usar precio del plan"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Inicio</label>
                <input
                  type="date"
                  value={nuevaSuscripcion.fecha_inicio}
                  onChange={(e) => setNuevaSuscripcion({...nuevaSuscripcion, fecha_inicio: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={nuevaSuscripcion.renovacion_automatica}
                  onChange={(e) => setNuevaSuscripcion({...nuevaSuscripcion, renovacion_automatica: e.target.checked})}
                  className="rounded"
                />
                <label className="text-sm text-gray-300">Renovación automática</label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateSuscripcion(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'crear-suscripcion'}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'crear-suscripcion' ? 'Creando...' : 'Crear Suscripción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuscripcionesAdminPanel; 