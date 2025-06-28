import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Users, 
  Calendar,
  Filter,
  Download,
  Eye,
  ChevronDown,
  Search
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';

interface ComisionMarcaBlanca {
  id: string;
  fecha: string;
  comunidad_nombre: string;
  comunidad_id: string;
  tipo_comision: string;
  referido_nombre: string;
  referido_email: string;
  producto_nombre: string;
  nivel: number;
  monto_venta: number;
  porcentaje_comision: number;
  monto_comision: number;
  estado: 'pendiente' | 'pagada' | 'procesando';
  fecha_pago?: string;
  metodo_pago?: string;
}

interface EstadisticasComunidad {
  comunidad_id: string;
  comunidad_nombre: string;
  total_comisiones: number;
  comisiones_pendientes: number;
  comisiones_pagadas: number;
  total_referidos: number;
  ultima_comision: string;
}

const InformeIBMarcaBlanca: React.FC = () => {
  const [comisiones, setComisiones] = useState<ComisionMarcaBlanca[]>([]);
  const [estadisticasComunidades, setEstadisticasComunidades] = useState<EstadisticasComunidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Filtros
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroComunidad, setFiltroComunidad] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuario no autenticado');
        return;
      }

      await Promise.all([
        cargarComisionesMarcaBlanca(user.id),
        cargarEstadisticasComunidades(user.id)
      ]);

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarComisionesMarcaBlanca = async (userId: string) => {
    try {
      // Simular datos de comisiones de marca blanca
      // En producción, esto vendría de una consulta a la base de datos
      const comisionesSimuladas: ComisionMarcaBlanca[] = [
        {
          id: '1',
          fecha: '2024-12-20',
          comunidad_nombre: 'Trading Pro Community',
          comunidad_id: 'comm_001',
          tipo_comision: 'Suscripción Premium',
          referido_nombre: 'Juan Pérez',
          referido_email: 'juan@example.com',
          producto_nombre: 'Plan Trading Avanzado',
          nivel: 1,
          monto_venta: 299,
          porcentaje_comision: 30,
          monto_comision: 89.7,
          estado: 'pagada',
          fecha_pago: '2024-12-22',
          metodo_pago: 'PayPal'
        },
        {
          id: '2',
          fecha: '2024-12-19',
          comunidad_nombre: 'Forex Masters',
          comunidad_id: 'comm_002',
          tipo_comision: 'Curso Premium',
          referido_nombre: 'María García',
          referido_email: 'maria@example.com',
          producto_nombre: 'Curso Forex Completo',
          nivel: 2,
          monto_venta: 199,
          porcentaje_comision: 15,
          monto_comision: 29.85,
          estado: 'pendiente'
        },
        {
          id: '3',
          fecha: '2024-12-18',
          comunidad_nombre: 'Crypto Academy',
          comunidad_id: 'comm_003',
          tipo_comision: 'Membresía VIP',
          referido_nombre: 'Carlos López',
          referido_email: 'carlos@example.com',
          producto_nombre: 'VIP Crypto Signals',
          nivel: 1,
          monto_venta: 149,
          porcentaje_comision: 25,
          monto_comision: 37.25,
          estado: 'procesando'
        }
      ];

      setComisiones(comisionesSimuladas);
    } catch (error) {
      console.error('Error cargando comisiones:', error);
    }
  };

  const cargarEstadisticasComunidades = async (userId: string) => {
    try {
      const estadisticasSimuladas: EstadisticasComunidad[] = [
        {
          comunidad_id: 'comm_001',
          comunidad_nombre: 'Trading Pro Community',
          total_comisiones: 450.75,
          comisiones_pendientes: 125.50,
          comisiones_pagadas: 325.25,
          total_referidos: 15,
          ultima_comision: '2024-12-20'
        },
        {
          comunidad_id: 'comm_002',
          comunidad_nombre: 'Forex Masters',
          total_comisiones: 289.30,
          comisiones_pendientes: 89.45,
          comisiones_pagadas: 199.85,
          total_referidos: 8,
          ultima_comision: '2024-12-19'
        },
        {
          comunidad_id: 'comm_003',
          comunidad_nombre: 'Crypto Academy',
          total_comisiones: 198.60,
          comisiones_pendientes: 37.25,
          comisiones_pagadas: 161.35,
          total_referidos: 12,
          ultima_comision: '2024-12-18'
        }
      ];

      setEstadisticasComunidades(estadisticasSimuladas);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const comisionesFiltradas = React.useMemo(() => {
    let items = comisiones;

    // Filtrar por fechas
    if (filtroFechaInicio) {
      items = items.filter(item => item.fecha >= filtroFechaInicio);
    }
    if (filtroFechaFin) {
      items = items.filter(item => item.fecha <= filtroFechaFin);
    }

    // Filtrar por comunidad
    if (filtroComunidad) {
      items = items.filter(item => item.comunidad_id === filtroComunidad);
    }

    // Filtrar por estado
    if (filtroEstado) {
      items = items.filter(item => item.estado === filtroEstado);
    }

    // Filtrar por búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      items = items.filter(item =>
        item.referido_nombre.toLowerCase().includes(busquedaLower) ||
        item.referido_email.toLowerCase().includes(busquedaLower) ||
        item.producto_nombre.toLowerCase().includes(busquedaLower) ||
        item.comunidad_nombre.toLowerCase().includes(busquedaLower)
      );
    }

    return items;
  }, [comisiones, filtroFechaInicio, filtroFechaFin, filtroComunidad, filtroEstado, busqueda]);

  const comisionesPaginadas = React.useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return comisionesFiltradas.slice(inicio, fin);
  }, [comisionesFiltradas, paginaActual, itemsPorPagina]);

  const totalPaginas = Math.ceil(comisionesFiltradas.length / itemsPorPagina);

  const estadisticasGlobales = React.useMemo(() => {
    const total = estadisticasComunidades.reduce((acc, est) => ({
      totalComisiones: acc.totalComisiones + est.total_comisiones,
      comisionesPendientes: acc.comisionesPendientes + est.comisiones_pendientes,
      comisionesPagadas: acc.comisionesPagadas + est.comisiones_pagadas,
      totalReferidos: acc.totalReferidos + est.total_referidos
    }), { totalComisiones: 0, comisionesPendientes: 0, comisionesPagadas: 0, totalReferidos: 0 });

    return {
      ...total,
      totalComunidades: estadisticasComunidades.length
    };
  }, [estadisticasComunidades]);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Estadísticas globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Comisiones</p>
              <p className="text-2xl font-bold text-gray-900">${estadisticasGlobales.totalComisiones.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-50">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">${estadisticasGlobales.comisionesPendientes.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pagadas</p>
              <p className="text-2xl font-bold text-gray-900">${estadisticasGlobales.comisionesPagadas.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Comunidades</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticasGlobales.totalComunidades}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-indigo-50">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Referidos</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticasGlobales.totalReferidos}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Estadísticas por comunidad */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Rendimiento por Comunidad</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comunidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Comisiones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pendientes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Comisión
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estadisticasComunidades.map((comunidad) => (
                <motion.tr
                  key={comunidad.comunidad_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {comunidad.comunidad_nombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      ${comunidad.total_comisiones.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-yellow-600">
                      ${comunidad.comisiones_pendientes.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-600">
                      ${comunidad.comisiones_pagadas.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {comunidad.total_referidos}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(comunidad.ultima_comision).toLocaleDateString()}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderComisiones = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={filtroFechaInicio}
              onChange={(e) => setFiltroFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={filtroFechaFin}
              onChange={(e) => setFiltroFechaFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comunidad</label>
            <div className="relative">
              <select
                value={filtroComunidad}
                onChange={(e) => setFiltroComunidad(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="">Todas las comunidades</option>
                {estadisticasComunidades.map((comunidad) => (
                  <option key={comunidad.comunidad_id} value={comunidad.comunidad_id}>
                    {comunidad.comunidad_nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div className="relative">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="procesando">Procesando</option>
                <option value="pagada">Pagada</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar referido, producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de comisiones */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Comisiones de Marca Blanca ({comisionesFiltradas.length})
          </h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comunidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {comisionesPaginadas.map((comision) => (
                <motion.tr
                  key={comision.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(comision.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {comision.comunidad_nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{comision.referido_nombre}</div>
                    <div className="text-sm text-gray-500">{comision.referido_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{comision.producto_nombre}</div>
                    <div className="text-sm text-gray-500">{comision.tipo_comision}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Nivel {comision.nivel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${comision.monto_venta}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      ${comision.monto_comision} ({comision.porcentaje_comision}%)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      comision.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                      comision.estado === 'procesando' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {comision.estado === 'pagada' ? '✓ Pagada' :
                       comision.estado === 'procesando' ? '⏳ Procesando' : '⌛ Pendiente'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((paginaActual - 1) * itemsPorPagina) + 1} a {Math.min(paginaActual * itemsPorPagina, comisionesFiltradas.length)} de {comisionesFiltradas.length} resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando comisiones de marca blanca...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                💼 Comisiones Marca Blanca
              </h1>
              <p className="text-xl text-blue-100">
                Visualiza todas las comisiones generadas por comunidades de marca blanca
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">${estadisticasGlobales.totalComisiones.toFixed(2)}</div>
                <div className="text-blue-200 text-sm">Total Generado</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-200 hover:text-white hover:border-blue-300'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('comisiones')}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'comisiones'
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-200 hover:text-white hover:border-blue-300'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                Detalle de Comisiones
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' ? renderDashboard() : renderComisiones()}
      </div>
    </div>
  );
};

export default InformeIBMarcaBlanca; 