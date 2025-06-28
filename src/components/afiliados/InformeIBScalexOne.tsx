import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Calendar,
  Filter,
  Download,
  Eye,
  ChevronDown,
  Search,
  Award,
  Target,
  BarChart3
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';

interface ComisionScaleXone {
  id: string;
  fecha: string;
  referido_nombre: string;
  referido_email: string;
  producto_id: string;
  producto_nombre: string;
  categoria: string;
  tipo_producto: 'curso' | 'servicio' | 'suscripcion';
  nivel: number;
  monto_venta: number;
  porcentaje_comision: number;
  monto_comision: number;
  estado: 'pendiente' | 'pagada' | 'procesando';
  fecha_pago?: string;
  metodo_pago?: string;
  codigo_afiliado: string;
}

interface RendimientoProducto {
  producto_id: string;
  producto_nombre: string;
  categoria: string;
  total_ventas: number;
  total_comisiones: number;
  numero_referidos: number;
  conversion_rate: number;
  ultimo_venta: string;
}

interface EstadisticasNivel {
  nivel: number;
  total_comisiones: number;
  numero_ventas: number;
  porcentaje_promedio: number;
  mejor_producto: string;
}

const InformeIBScalexOne: React.FC = () => {
  const [comisiones, setComisiones] = useState<ComisionScaleXone[]>([]);
  const [rendimientoProductos, setRendimientoProductos] = useState<RendimientoProducto[]>([]);
  const [estadisticasNiveles, setEstadisticasNiveles] = useState<EstadisticasNivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Filtros
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  const categorias = ['Todos', 'Cursos', 'Servicios', 'Suscripciones'];

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
        cargarComisionesScaleXone(user.id),
        cargarRendimientoProductos(user.id),
        cargarEstadisticasNiveles(user.id)
      ]);

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarComisionesScaleXone = async (userId: string) => {
    try {
      // Simular datos de comisiones del marketplace ScaleXone
      const comisionesSimuladas: ComisionScaleXone[] = [
        {
          id: '1',
          fecha: '2024-12-25',
          referido_nombre: 'María González',
          referido_email: 'maria@example.com',
          producto_id: 'prod_001',
          producto_nombre: 'Trading Mastery Course',
          categoria: 'Cursos',
          tipo_producto: 'curso',
          nivel: 1,
          monto_venta: 497,
          porcentaje_comision: 25,
          monto_comision: 124.25,
          estado: 'pagada',
          fecha_pago: '2024-12-27',
          metodo_pago: 'PayPal',
          codigo_afiliado: 'AFF_SCALE_001'
        },
        {
          id: '2',
          fecha: '2024-12-24',
          referido_nombre: 'Carlos Mendoza',
          referido_email: 'carlos@example.com',
          producto_id: 'prod_002',
          producto_nombre: 'AI Business Automation',
          categoria: 'Servicios',
          tipo_producto: 'servicio',
          nivel: 2,
          monto_venta: 299,
          porcentaje_comision: 15,
          monto_comision: 44.85,
          estado: 'pendiente',
          codigo_afiliado: 'AFF_SCALE_002'
        },
        {
          id: '3',
          fecha: '2024-12-23',
          referido_nombre: 'Ana Rivera',
          referido_email: 'ana@example.com',
          producto_id: 'prod_003',
          producto_nombre: 'ScaleXone Pro Monthly',
          categoria: 'Suscripciones',
          tipo_producto: 'suscripcion',
          nivel: 1,
          monto_venta: 97,
          porcentaje_comision: 30,
          monto_comision: 29.1,
          estado: 'procesando',
          codigo_afiliado: 'AFF_SCALE_003'
        },
        {
          id: '4',
          fecha: '2024-12-22',
          referido_nombre: 'Luis Herrera',
          referido_email: 'luis@example.com',
          producto_id: 'prod_004',
          producto_nombre: 'NeuroLink Training',
          categoria: 'Cursos',
          tipo_producto: 'curso',
          nivel: 3,
          monto_venta: 799,
          porcentaje_comision: 10,
          monto_comision: 79.9,
          estado: 'pagada',
          fecha_pago: '2024-12-24',
          metodo_pago: 'Stripe',
          codigo_afiliado: 'AFF_SCALE_004'
        }
      ];

      setComisiones(comisionesSimuladas);
    } catch (error) {
      console.error('Error cargando comisiones:', error);
    }
  };

  const cargarRendimientoProductos = async (userId: string) => {
    try {
      const rendimientoSimulado: RendimientoProducto[] = [
        {
          producto_id: 'prod_001',
          producto_nombre: 'Trading Mastery Course',
          categoria: 'Cursos',
          total_ventas: 1245,
          total_comisiones: 311.25,
          numero_referidos: 8,
          conversion_rate: 15.2,
          ultimo_venta: '2024-12-25'
        },
        {
          producto_id: 'prod_002',
          producto_nombre: 'AI Business Automation',
          categoria: 'Servicios',
          total_ventas: 897,
          total_comisiones: 134.55,
          numero_referidos: 5,
          conversion_rate: 12.8,
          ultimo_venta: '2024-12-24'
        },
        {
          producto_id: 'prod_003',
          producto_nombre: 'ScaleXone Pro Monthly',
          categoria: 'Suscripciones',
          total_ventas: 2910,
          total_comisiones: 873,
          numero_referidos: 12,
          conversion_rate: 22.5,
          ultimo_venta: '2024-12-23'
        }
      ];

      setRendimientoProductos(rendimientoSimulado);
    } catch (error) {
      console.error('Error cargando rendimiento:', error);
    }
  };

  const cargarEstadisticasNiveles = async (userId: string) => {
    try {
      const estadisticasSimuladas: EstadisticasNivel[] = [
        {
          nivel: 1,
          total_comisiones: 684.25,
          numero_ventas: 15,
          porcentaje_promedio: 27.5,
          mejor_producto: 'ScaleXone Pro Monthly'
        },
        {
          nivel: 2,
          total_comisiones: 289.70,
          numero_ventas: 8,
          porcentaje_promedio: 15.0,
          mejor_producto: 'AI Business Automation'
        },
        {
          nivel: 3,
          total_comisiones: 159.80,
          numero_ventas: 4,
          porcentaje_promedio: 10.0,
          mejor_producto: 'NeuroLink Training'
        }
      ];

      setEstadisticasNiveles(estadisticasSimuladas);
    } catch (error) {
      console.error('Error cargando estadísticas de niveles:', error);
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

    // Filtrar por categoría
    if (filtroCategoria && filtroCategoria !== 'Todos') {
      items = items.filter(item => item.categoria === filtroCategoria);
    }

    // Filtrar por nivel
    if (filtroNivel) {
      items = items.filter(item => item.nivel === parseInt(filtroNivel));
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
        item.codigo_afiliado.toLowerCase().includes(busquedaLower)
      );
    }

    return items;
  }, [comisiones, filtroFechaInicio, filtroFechaFin, filtroCategoria, filtroNivel, filtroEstado, busqueda]);

  const comisionesPaginadas = React.useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return comisionesFiltradas.slice(inicio, fin);
  }, [comisionesFiltradas, paginaActual, itemsPorPagina]);

  const totalPaginas = Math.ceil(comisionesFiltradas.length / itemsPorPagina);

  const estadisticasGlobales = React.useMemo(() => {
    const total = comisiones.reduce((acc, comision) => ({
      totalComisiones: acc.totalComisiones + comision.monto_comision,
      comisionesPendientes: acc.comisionesPendientes + (comision.estado === 'pendiente' ? comision.monto_comision : 0),
      comisionesPagadas: acc.comisionesPagadas + (comision.estado === 'pagada' ? comision.monto_comision : 0),
      totalVentas: acc.totalVentas + comision.monto_venta
    }), { totalComisiones: 0, comisionesPendientes: 0, comisionesPagadas: 0, totalVentas: 0 });

    return {
      ...total,
      totalReferidos: new Set(comisiones.map(c => c.referido_email)).size,
      promedioComision: comisiones.length > 0 ? total.totalComisiones / comisiones.length : 0
    };
  }, [comisiones]);

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
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-gray-900">${estadisticasGlobales.totalVentas.toFixed(2)}</p>
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

      {/* Rendimiento por niveles */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Rendimiento por Niveles</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {estadisticasNiveles.map((nivel) => (
            <motion.div
              key={nivel.nivel}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  <h4 className="text-lg font-bold text-gray-900">Nivel {nivel.nivel}</h4>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {nivel.porcentaje_promedio}%
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Comisiones:</span>
                  <span className="font-bold text-green-600">${nivel.total_comisiones}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ventas:</span>
                  <span className="font-semibold text-gray-900">{nivel.numero_ventas}</span>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-xs text-gray-500">Mejor producto:</p>
                  <p className="text-sm font-medium text-gray-700">{nivel.mejor_producto}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top productos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Productos ScaleXone</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas Totales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisiones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversión
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rendimientoProductos.map((producto) => (
                <motion.tr
                  key={producto.producto_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {producto.producto_nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      producto.categoria === 'Cursos' ? 'bg-amber-100 text-amber-800' :
                      producto.categoria === 'Servicios' ? 'bg-purple-100 text-purple-800' :
                      'bg-cyan-100 text-cyan-800'
                    }`}>
                      {producto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${producto.total_ventas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      ${producto.total_comisiones}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {producto.numero_referidos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">{producto.conversion_rate}%</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(producto.conversion_rate, 100)}%` }}
                        ></div>
                      </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <div className="relative">
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria === 'Todos' ? '' : categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
            <div className="relative">
              <select
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="">Todos los niveles</option>
                <option value="1">Nivel 1</option>
                <option value="2">Nivel 2</option>
                <option value="3">Nivel 3</option>
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
            Comisiones ScaleXone ({comisionesFiltradas.length})
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
                  Referido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
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
                    <div className="text-sm text-gray-900">{comision.referido_nombre}</div>
                    <div className="text-sm text-gray-500">{comision.referido_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{comision.producto_nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      comision.categoria === 'Cursos' ? 'bg-amber-100 text-amber-800' :
                      comision.categoria === 'Servicios' ? 'bg-purple-100 text-purple-800' :
                      'bg-cyan-100 text-cyan-800'
                    }`}>
                      {comision.categoria}
                    </span>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {comision.codigo_afiliado}
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
          <p className="text-gray-600">Cargando comisiones ScaleXone...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                🚀 Comisiones ScaleXone
              </h1>
              <p className="text-xl text-blue-100">
                Monitorea todas las comisiones generadas por el marketplace ScaleXone
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">${estadisticasGlobales.totalComisiones.toFixed(2)}</div>
                <div className="text-blue-200 text-sm">Total Comisiones</div>
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
                <BarChart3 className="w-5 h-5" />
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

export default InformeIBScalexOne; 