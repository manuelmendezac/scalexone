import React, { useState, useEffect } from 'react';
import { Users, DollarSign, CreditCard, TrendingUp, Calendar, Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Download, Eye, Pause, Play, UserX } from 'lucide-react';
import { SuscripcionesAPI, type SuscripcionConDetalles, type PlanSuscripcion, type EstadisticasOrganizacion } from '../../services/suscripcionesService';
import useNeuroState from '../../store/useNeuroState';
import { supabase } from '../../supabase';

const SuscripcionesAdminPanel: React.FC = () => {
  const [suscripciones, setSuscripciones] = useState<SuscripcionConDetalles[]>([]);
  const [planes, setPlanes] = useState<PlanSuscripcion[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasOrganizacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'suscripciones' | 'planes' | 'estadisticas'>('suscripciones');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [mensaje, setMensaje] = useState('');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateSuscripcion, setShowCreateSuscripcion] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { userInfo } = useNeuroState();
  
  // Por ahora usamos el community_id del usuario como organizacion_id
  const organizacionId = userInfo?.community_id || 'scalexone-default';

  useEffect(() => {
    cargarDatos();
  }, [organizacionId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar datos en paralelo
      const [suscripcionesData, planesData, estadisticasData] = await Promise.all([
        SuscripcionesAPI.suscripciones.obtenerSuscripcionesPorOrganizacion(organizacionId),
        SuscripcionesAPI.planes.obtenerPlanesPorOrganizacion(organizacionId),
        SuscripcionesAPI.estadisticas.obtenerEstadisticasOrganizacion(organizacionId)
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

  const handleCancelSubscription = async (suscripcionId: string, razon?: string) => {
    try {
      setActionLoading(suscripcionId);
      await SuscripcionesAPI.suscripciones.cancelarSuscripcion(suscripcionId, razon);
      setMensaje('Suscripción cancelada exitosamente');
      await cargarDatos(); // Recargar datos
    } catch (error: any) {
      setMensaje('Error al cancelar suscripción: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePauseSubscription = async (suscripcionId: string) => {
    try {
      setActionLoading(suscripcionId);
      await SuscripcionesAPI.suscripciones.pausarSuscripcion(suscripcionId);
      setMensaje('Suscripción pausada exitosamente');
      await cargarDatos();
    } catch (error: any) {
      setMensaje('Error al pausar suscripción: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async (suscripcionId: string) => {
    try {
      setActionLoading(suscripcionId);
      await SuscripcionesAPI.suscripciones.reanudarSuscripcion(suscripcionId);
      setMensaje('Suscripción reanudada exitosamente');
      await cargarDatos();
    } catch (error: any) {
      setMensaje('Error al reanudar suscripción: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTogglePlanActive = async (planId: string) => {
    try {
      setActionLoading(planId);
      await SuscripcionesAPI.planes.toggleActivoPlan(planId);
      setMensaje('Estado del plan actualizado');
      await cargarDatos();
    } catch (error: any) {
      setMensaje('Error al actualizar plan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSuscripcion = async (suscripcionData: any) => {
    try {
      setActionLoading('create');
      
      // Calcular fecha de fin basada en la duración del plan
      const plan = planes.find(p => p.id === suscripcionData.plan_id);
      if (!plan) {
        throw new Error('Plan no encontrado');
      }
      
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + plan.duracion_dias);
      
      const nuevaSuscripcion = {
        ...suscripcionData,
        organizacion_id: organizacionId,
        fecha_inicio: fechaInicio.toISOString(),
        fecha_fin: fechaFin.toISOString(),
        precio_pagado: plan.precio,
        estado: suscripcionData.estado || 'activa'
      };
      
      await SuscripcionesAPI.suscripciones.crearSuscripcion(nuevaSuscripcion);
      setMensaje('Suscripción creada exitosamente');
      setShowCreateSuscripcion(false);
      await cargarDatos();
    } catch (error: any) {
      setMensaje('Error al crear suscripción: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreatePlan = async (planData: any) => {
    try {
      setActionLoading('createPlan');
      
      const nuevoPlan = {
        ...planData,
        organizacion_id: organizacionId,
        activo: true,
        orden: planes.length + 1
      };
      
      await SuscripcionesAPI.planes.crearPlan(nuevoPlan);
      setMensaje('Plan creado exitosamente');
      setShowCreatePlan(false);
      await cargarDatos();
    } catch (error: any) {
      setMensaje('Error al crear plan: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pausada':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'vencida':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'trial':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colors = {
      activa: 'bg-green-500',
      cancelada: 'bg-red-500',
      pausada: 'bg-yellow-500',
      vencida: 'bg-gray-500',
      trial: 'bg-blue-500'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${colors[estado as keyof typeof colors] || colors.vencida}`}>
        {getEstadoIcon(estado)}
        <span className="ml-1 capitalize">{estado}</span>
      </span>
    );
  };

  const filteredSuscripciones = suscripciones.filter(sub => {
    const matchesSearch = sub.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.usuario_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'todos') return matchesSearch;
    return matchesSearch && sub.estado === selectedFilter;
  });

  // Calcular estadísticas desde los datos locales si no tenemos estadísticas de la BD
  const stats = estadisticas || {
    organizacion_id: organizacionId,
    organizacion_nombre: 'Mi Organización',
    total_suscripciones: suscripciones.length,
    suscripciones_activas: suscripciones.filter(s => s.estado === 'activa').length,
    ingresos_mensuales: suscripciones
      .filter(s => s.estado === 'activa')
      .reduce((acc, s) => acc + (s.precio_pagado || 0), 0),
    tasa_retencion: suscripciones.length > 0 
      ? Math.round((suscripciones.filter(s => s.estado === 'activa').length / suscripciones.length) * 100 * 100) / 100
      : 0
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-black">
        <div className="w-full bg-gray-900/50 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-yellow-400 mb-4">Portal de Suscripciones</h1>
          <div className="text-white">Cargando datos...</div>
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
            <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors">
              <Download size={20} />
              Exportar
            </button>
            <button 
              onClick={() => setShowCreateSuscripcion(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors"
            >
              <Plus size={20} />
              Crear Suscripción
            </button>
            <button 
              onClick={() => setShowCreatePlan(true)}
              className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-600 transition-colors"
            >
              <Plus size={20} />
              Crear Plan
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Suscripciones</p>
                <p className="text-2xl font-bold text-white">{stats.total_suscripciones}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Suscripciones Activas</p>
                <p className="text-2xl font-bold text-green-500">{stats.suscripciones_activas}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-yellow-500">${stats.ingresos_mensuales.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tasa de Retención</p>
                <p className="text-2xl font-bold text-purple-500">{stats.tasa_retencion.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          {[
            { key: 'suscripciones', label: 'Suscripciones', icon: CreditCard },
            { key: 'planes', label: 'Planes', icon: DollarSign },
            { key: 'estadisticas', label: 'Estadísticas', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content based on selected tab */}
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
                    <th className="text-left p-4 text-gray-300">Acciones</th>
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
                      <td className="p-4">{getEstadoBadge(sub.estado)}</td>
                      <td className="p-4 text-white">{new Date(sub.fecha_fin).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${sub.renovacion_automatica ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                          {sub.renovacion_automatica ? 'Automática' : 'Manual'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button 
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {sub.estado === 'activa' && (
                            <button 
                              onClick={() => handlePauseSubscription(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="p-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 disabled:opacity-50"
                              title="Pausar suscripción"
                            >
                              <Pause size={16} />
                            </button>
                          )}
                          
                          {sub.estado === 'pausada' && (
                            <button 
                              onClick={() => handleResumeSubscription(sub.id)}
                              disabled={actionLoading === sub.id}
                              className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                              title="Reanudar suscripción"
                            >
                              <Play size={16} />
                            </button>
                          )}
                          
                          {(sub.estado === 'activa' || sub.estado === 'pausada') && (
                            <button 
                              onClick={() => handleCancelSubscription(sub.id, 'Cancelada por administrador')}
                              disabled={actionLoading === sub.id}
                              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                              title="Cancelar suscripción"
                            >
                              <UserX size={16} />
                            </button>
                          )}
                        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planes.map(plan => (
              <div key={plan.id} className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.nombre}</h3>
                    <p className="text-gray-400">{plan.descripcion}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${plan.activo ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {plan.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-yellow-400">${plan.precio}</span>
                  <span className="text-gray-400">/{plan.duracion_dias} días</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.caracteristicas.map((caracteristica, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                      {caracteristica}
                    </li>
                  ))}
                </ul>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleTogglePlanActive(plan.id)}
                    disabled={actionLoading === plan.id}
                    className={`flex-1 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 ${
                      plan.activo 
                        ? 'bg-gray-600 text-white hover:bg-gray-700' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {plan.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    <Edit size={16} />
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {planes.length === 0 && (
              <div className="col-span-full p-8 text-center text-gray-400">
                No hay planes creados aún. ¡Crea tu primer plan!
              </div>
            )}
          </div>
        )}

        {selectedTab === 'estadisticas' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Resumen Financiero</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{stats.total_suscripciones}</div>
                  <div className="text-sm text-gray-400">Total Suscripciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{stats.suscripciones_activas}</div>
                  <div className="text-sm text-gray-400">Activas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">${stats.ingresos_mensuales.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Ingresos Mensuales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{stats.tasa_retencion.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400">Tasa de Retención</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Próximas Funcionalidades</h3>
              <div className="text-gray-300 space-y-2">
                <p>• Gráficos de ingresos por mes</p>
                <p>• Análisis de churn rate</p>
                <p>• Comparación entre planes</p>
                <p>• Predicción de ingresos</p>
                <p>• Métricas de lifetime value</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Crear Suscripción */}
        {showCreateSuscripcion && (
          <CreateSuscripcionModal
            planes={planes.filter(p => p.activo)}
            onClose={() => setShowCreateSuscripcion(false)}
            onSubmit={handleCreateSuscripcion}
            loading={actionLoading === 'create'}
          />
        )}

        {/* Modal Crear Plan */}
        {showCreatePlan && (
          <CreatePlanModal
            onClose={() => setShowCreatePlan(false)}
            onSubmit={handleCreatePlan}
            loading={actionLoading === 'createPlan'}
          />
        )}

        {/* Mensajes */}
        {mensaje && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50">
            {mensaje}
            <button 
              onClick={() => setMensaje('')}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Modal para crear nueva suscripción
interface CreateSuscripcionModalProps {
  planes: PlanSuscripcion[];
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

const CreateSuscripcionModal: React.FC<CreateSuscripcionModalProps> = ({ 
  planes, 
  onClose, 
  onSubmit, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    usuario_id: '',
    plan_id: '',
    estado: 'activa',
    renovacion_automatica: true,
    descuento_aplicado: 0
  });

  const [usuarios, setUsuarios] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [searchUsuario, setSearchUsuario] = useState('');

  // Cargar usuarios disponibles
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        setLoadingUsuarios(true);
        // Aquí deberías hacer una llamada a la API para obtener usuarios
        // Por ahora simularemos algunos usuarios
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, name, email')
          .ilike('email', `%${searchUsuario}%`)
          .limit(10);
        
        if (error) throw error;
        setUsuarios(data || []);
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    cargarUsuarios();
  }, [searchUsuario]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.usuario_id || !formData.plan_id) {
      alert('Por favor selecciona un usuario y un plan');
      return;
    }
    
    onSubmit(formData);
  };

  const selectedPlan = planes.find(p => p.id === formData.plan_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Crear Nueva Suscripción</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selección de Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Usuario
            </label>
            <input
              type="text"
              placeholder="Buscar por email..."
              value={searchUsuario}
              onChange={(e) => setSearchUsuario(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none mb-2"
            />
            <select
              value={formData.usuario_id}
              onChange={(e) => setFormData({...formData, usuario_id: e.target.value})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
              required
            >
              <option value="">Seleccionar usuario...</option>
              {usuarios.map(usuario => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.name} - {usuario.email}
                </option>
              ))}
            </select>
            {loadingUsuarios && (
              <p className="text-sm text-gray-400 mt-1">Buscando usuarios...</p>
            )}
          </div>

          {/* Selección de Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plan de Suscripción
            </label>
            <select
              value={formData.plan_id}
              onChange={(e) => setFormData({...formData, plan_id: e.target.value})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
              required
            >
              <option value="">Seleccionar plan...</option>
              {planes.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre} - ${plan.precio}/{plan.duracion_dias} días
                </option>
              ))}
            </select>
            {selectedPlan && (
              <div className="mt-2 p-2 bg-gray-700 rounded text-sm text-gray-300">
                <p><strong>Precio:</strong> ${selectedPlan.precio}</p>
                <p><strong>Duración:</strong> {selectedPlan.duracion_dias} días</p>
                <p><strong>Descripción:</strong> {selectedPlan.descripcion}</p>
              </div>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado Inicial
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({...formData, estado: e.target.value})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
            >
              <option value="activa">Activa</option>
              <option value="trial">Trial</option>
              <option value="pausada">Pausada</option>
            </select>
          </div>

          {/* Renovación Automática */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="renovacion"
              checked={formData.renovacion_automatica}
              onChange={(e) => setFormData({...formData, renovacion_automatica: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="renovacion" className="text-sm text-gray-300">
              Renovación automática
            </label>
          </div>

          {/* Descuento */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descuento (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.descuento_aplicado}
              onChange={(e) => setFormData({...formData, descuento_aplicado: parseFloat(e.target.value) || 0})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Suscripción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para crear nuevo plan
interface CreatePlanModalProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ 
  onClose, 
  onSubmit, 
  loading 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: 0,
    moneda: 'USD',
    duracion_dias: 30,
    caracteristicas: [''],
    limites: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || formData.precio <= 0) {
      alert('Por favor completa los campos requeridos');
      return;
    }
    
    // Filtrar características vacías
    const caracteristicasLimpias = formData.caracteristicas.filter(c => c.trim() !== '');
    
    onSubmit({
      ...formData,
      caracteristicas: caracteristicasLimpias
    });
  };

  const handleAddCaracteristica = () => {
    setFormData({
      ...formData,
      caracteristicas: [...formData.caracteristicas, '']
    });
  };

  const handleRemoveCaracteristica = (index: number) => {
    const nuevasCaracteristicas = formData.caracteristicas.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      caracteristicas: nuevasCaracteristicas
    });
  };

  const handleCaracteristicaChange = (index: number, value: string) => {
    const nuevasCaracteristicas = [...formData.caracteristicas];
    nuevasCaracteristicas[index] = value;
    setFormData({
      ...formData,
      caracteristicas: nuevasCaracteristicas
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Crear Nuevo Plan</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Plan *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
              placeholder="Ej: Plan Pro"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
              placeholder="Describe las características del plan..."
              rows={3}
            />
          </div>

          {/* Precio y Moneda */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Precio *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value) || 0})}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Moneda
              </label>
              <select
                value={formData.moneda}
                onChange={(e) => setFormData({...formData, moneda: e.target.value})}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="COP">COP ($)</option>
                <option value="MXN">MXN ($)</option>
              </select>
            </div>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duración (días)
            </label>
            <select
              value={formData.duracion_dias}
              onChange={(e) => setFormData({...formData, duracion_dias: parseInt(e.target.value)})}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-yellow-500 focus:outline-none"
            >
              <option value={7}>7 días (Semanal)</option>
              <option value={30}>30 días (Mensual)</option>
              <option value={90}>90 días (Trimestral)</option>
              <option value={365}>365 días (Anual)</option>
            </select>
          </div>

          {/* Características */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Características del Plan
            </label>
            {formData.caracteristicas.map((caracteristica, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={caracteristica}
                  onChange={(e) => handleCaracteristicaChange(index, e.target.value)}
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
                  placeholder="Ej: Acceso a cursos premium"
                />
                {formData.caracteristicas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCaracteristica(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCaracteristica}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Agregar Característica
            </button>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuscripcionesAdminPanel; 