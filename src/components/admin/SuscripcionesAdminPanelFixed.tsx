import React, { useState, useEffect } from 'react';
import { Users, DollarSign, CreditCard, TrendingUp, Calendar, Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Download, Eye, Pause, Play, UserX } from 'lucide-react';
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

  const { userInfo } = useNeuroState();
  
  // Estado para manejar la comunidad
  const [comunidadId, setComunidadId] = useState<string | null>(null);
  const [intentosInicializacion, setIntentosInicializacion] = useState(0);

  // Estados para formularios
  const [nuevoPlan, setNuevoPlan] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion_valor: '1',
    duracion_tipo: 'mes', // dia, semana, mes, año
    moneda: 'USD',
    caracteristicas: [] as string[],
    limite_usuarios: '',
    activo: true,
    prueba_gratis: false,
    duracion_prueba: '7',
    tipo_prueba: 'dia',
    categoria: 'basico', // basico, premium, enterprise
    orden: 0,
    destacado: false,
    color_personalizado: '#3B82F6'
  });

  const [nuevaSuscripcion, setNuevaSuscripcion] = useState({
    usuario_email: '',
    plan_id: '',
    precio_personalizado: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    renovacion_automatica: true
  });

  // Función para inicializar o crear la comunidad
  const inicializarComunidad = async () => {
    if (intentosInicializacion >= 3) {
      console.error('Máximo número de intentos de inicialización alcanzado');
      setMensaje('Error: No se pudo inicializar la comunidad después de varios intentos');
      setLoading(false);
      return;
    }

    setIntentosInicializacion(prev => prev + 1);

    try {
      const communityId = userInfo?.community_id || 'default';
      console.log(`Inicializando comunidad (intento ${intentosInicializacion + 1}) para community_id:`, communityId);
      
      // Usar la nueva función para obtener/crear comunidad
      console.log('Obteniendo o creando comunidad...');
      const comunidad = await SuscripcionesAPI.inicializarComunidadPorCommunityId(communityId);
      
      console.log('Comunidad obtenida/creada exitosamente:', comunidad);
      setComunidadId(comunidad.id);
    } catch (error) {
      console.error('Error completo inicializando comunidad:', error);
      setMensaje('Error al inicializar comunidad: ' + (error as Error).message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.community_id && !comunidadId) {
      console.log('Ejecutando inicializarComunidad desde useEffect');
      inicializarComunidad();
    }
  }, [userInfo?.community_id, comunidadId]);

  useEffect(() => {
    if (comunidadId) {
      cargarDatos();
    }
  }, [comunidadId]);

  const cargarDatos = async () => {
    if (!comunidadId) {
      console.log('No hay comunidadId, esperando...');
      return;
    }

    try {
      setLoading(true);
      
      // Cargar datos en paralelo
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
      setMensaje('Error al cargar los datos: ' + error.message);
    } finally {
      setLoading(false);
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
        caracteristicas: nuevoPlan.caracteristicas,
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

      await SuscripcionesAPI.Planes.crearPlan(planData);
      
      setMensaje('Plan creado exitosamente');
      setShowCreatePlan(false);
      setNuevoPlan({
        nombre: '',
        descripcion: '',
        precio: '',
        duracion_valor: '1',
        duracion_tipo: 'mes',
        moneda: 'USD',
        caracteristicas: [],
        limite_usuarios: '',
        activo: true,
        prueba_gratis: false,
        duracion_prueba: '7',
        tipo_prueba: 'dia',
        categoria: 'basico',
        orden: 0,
        destacado: false,
        color_personalizado: '#3B82F6'
      });
      
      await cargarDatos();
    } catch (error: any) {
      setMensaje('Error al crear plan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
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
                    <button className="p-2 text-blue-400 hover:bg-blue-900 rounded transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-red-400 hover:bg-red-900 rounded transition-colors">
                      <Trash2 size={16} />
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

      {/* Modal Crear Plan */}
      {showCreatePlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 my-8">
            <h3 className="text-xl font-bold text-white mb-6">Crear Nuevo Plan de Suscripción</h3>
            <form onSubmit={handleCreatePlan} className="space-y-6">
              
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Plan</label>
                  <input
                    type="text"
                    value={nuevoPlan.nombre}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, nombre: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="ej. Plan Básico"
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
                      className="px-3 py-2 bg-gray-600 border border-gray-600 rounded-r-lg text-white focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="MXN">MXN</option>
                      <option value="COP">COP</option>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Frecuencia</label>
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
              
              {/* Prueba gratis */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={nuevoPlan.prueba_gratis}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, prueba_gratis: e.target.checked})}
                    className="rounded"
                  />
                  <label className="text-sm font-medium text-gray-300">¿Habilitar prueba gratis?</label>
                </div>
                
                {nuevoPlan.prueba_gratis && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Duración de prueba</label>
                      <input
                        type="number"
                        min="1"
                        value={nuevoPlan.duracion_prueba}
                        onChange={(e) => setNuevoPlan({...nuevoPlan, duracion_prueba: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Tipo</label>
                      <select
                        value={nuevoPlan.tipo_prueba}
                        onChange={(e) => setNuevoPlan({...nuevoPlan, tipo_prueba: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                      >
                        <option value="dia">Día(s)</option>
                        <option value="semana">Semana(s)</option>
                        <option value="mes">Mes(es)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Configuración avanzada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Límite de Usuarios</label>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Orden de visualización</label>
                  <input
                    type="number"
                    min="0"
                    value={nuevoPlan.orden}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, orden: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Color personalizado */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color del Plan</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={nuevoPlan.color_personalizado}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, color_personalizado: e.target.value})}
                    className="w-12 h-10 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    value={nuevoPlan.color_personalizado}
                    onChange={(e) => setNuevoPlan({...nuevoPlan, color_personalizado: e.target.value})}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              
              {/* Opciones adicionales */}
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
                  onClick={() => setShowCreatePlan(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'crear-plan'}
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'crear-plan' ? 'Creando...' : 'Crear Plan'}
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
                  placeholder="Usar precio del plan"
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