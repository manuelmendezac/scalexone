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
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-300">
            {mensaje}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default SuscripcionesAdminPanel; 