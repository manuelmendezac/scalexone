import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import useNeuroState from '../../store/useNeuroState';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface Transaccion {
  id: string;
  tipo: 'venta' | 'retiro';
  usuario_id: string;
  nombre_usuario: string;
  email_usuario: string;
  producto_id?: string;
  nombre_producto?: string;
  tipo_producto?: string;
  monto: number;
  moneda: string;
  estado: string;
  metodo_pago: string;
  referencia_externa?: string;
  fecha: string;
  comunidad_id: string;
  afiliado_id?: string;
  nombre_afiliado?: string;
  motivo_rechazo?: string;
  aprobado_por?: string;
  nombre_admin?: string;
  metadata?: any;
}

interface Estadisticas {
  total_ventas: number;
  total_retiros: number;
  ventas_pendientes: number;
  retiros_pendientes: number;
  monto_total_ventas: number;
  monto_total_retiros: number;
  monto_pendiente_retiros: number;
}

const TransaccionesPanel: React.FC = () => {
  const { userInfo } = useNeuroState();
  const user = userInfo;
  const comunidadId = userInfo?.community_id;
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    total_ventas: 0,
    total_retiros: 0,
    ventas_pendientes: 0,
    retiros_pendientes: 0,
    monto_total_ventas: 0,
    monto_total_retiros: 0,
    monto_pendiente_retiros: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'todos' | 'venta' | 'retiro'>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterFecha, setFilterFecha] = useState<string>('todos');
  const [selectedTransaccion, setSelectedTransaccion] = useState<Transaccion | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [procesandoRetiro, setProcesandoRetiro] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [referenciaPago, setReferenciaPago] = useState('');

  useEffect(() => {
    if (user && comunidadId) {
      cargarTransacciones();
      cargarEstadisticas();
    }
  }, [user, comunidadId]);

  const cargarTransacciones = async () => {
    try {
      setLoading(true);
      
      // Cargar ventas
      const { data: ventas, error: errorVentas } = await supabase
        .from('ventas')
        .select(`
          id,
          usuario_id,
          producto_id,
          tipo_producto,
          monto,
          moneda,
          estado,
          metodo_pago,
          referencia_externa,
          fecha,
          comunidad_id,
          afiliado_id,
          metadata,
          usuarios!ventas_usuario_id_fkey(nombre, email),
          afiliados:usuarios!ventas_afiliado_id_fkey(nombre)
        `)
        .eq('comunidad_id', comunidadId)
        .order('fecha', { ascending: false });

      if (errorVentas) throw errorVentas;

      // Cargar retiros de afiliados
      const { data: retiros, error: errorRetiros } = await supabase
        .from('retiros_detallados')
        .select('*')
        .eq('comunidad_id', comunidadId)
        .order('fecha_solicitud', { ascending: false });

      if (errorRetiros) throw errorRetiros;

      // Combinar y formatear datos
      const ventasFormateadas: Transaccion[] = (ventas || []).map(venta => ({
        id: venta.id,
        tipo: 'venta' as const,
        usuario_id: venta.usuario_id,
        nombre_usuario: venta.usuarios?.nombre || 'Usuario',
        email_usuario: venta.usuarios?.email || '',
        producto_id: venta.producto_id,
        nombre_producto: venta.metadata?.nombre_producto || venta.tipo_producto,
        tipo_producto: venta.tipo_producto,
        monto: venta.monto,
        moneda: venta.moneda,
        estado: venta.estado,
        metodo_pago: venta.metodo_pago,
        referencia_externa: venta.referencia_externa,
        fecha: venta.fecha,
        comunidad_id: venta.comunidad_id,
        afiliado_id: venta.afiliado_id,
        nombre_afiliado: venta.afiliados?.nombre || '',
        metadata: venta.metadata
      }));

      const retirosFormateados: Transaccion[] = (retiros || []).map(retiro => ({
        id: retiro.id,
        tipo: 'retiro' as const,
        usuario_id: retiro.afiliado_id,
        nombre_usuario: retiro.nombre_afiliado || 'Afiliado',
        email_usuario: retiro.email_afiliado || '',
        monto: retiro.monto,
        moneda: 'USD',
        estado: retiro.estado,
        metodo_pago: retiro.metodo_pago,
        referencia_externa: retiro.referencia_pago,
        fecha: retiro.fecha_solicitud,
        comunidad_id: retiro.comunidad_id,
        afiliado_id: retiro.afiliado_id,
        nombre_afiliado: retiro.nombre_afiliado,
        motivo_rechazo: retiro.motivo_rechazo,
        aprobado_por: retiro.aprobado_por,
        nombre_admin: retiro.nombre_admin,
        metadata: retiro.datos_pago
      }));

      const todasTransacciones = [...ventasFormateadas, ...retirosFormateados]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      setTransacciones(todasTransacciones);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      // Estadísticas de ventas
      const { data: statsVentas } = await supabase
        .from('ventas')
        .select('monto, estado')
        .eq('comunidad_id', comunidadId);

      // Estadísticas de retiros
      const { data: statsRetiros } = await supabase
        .from('estadisticas_retiros_comunidad')
        .select('*')
        .eq('comunidad_id', comunidadId)
        .single();

      const ventas = statsVentas || [];
      const retiros = statsRetiros || {};

      setEstadisticas({
        total_ventas: ventas.length,
        total_retiros: retiros.total_retiros || 0,
        ventas_pendientes: ventas.filter(v => v.estado === 'pendiente').length,
        retiros_pendientes: retiros.retiros_pendientes || 0,
        monto_total_ventas: ventas.reduce((sum, v) => sum + (v.monto || 0), 0),
        monto_total_retiros: retiros.monto_total_procesado || 0,
        monto_pendiente_retiros: retiros.monto_pendiente || 0
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const procesarRetiro = async () => {
    if (!selectedTransaccion || selectedTransaccion.tipo !== 'retiro') return;

    try {
      setProcesandoRetiro(true);

      const { data, error } = await supabase.rpc('procesar_retiro_afiliado', {
        p_retiro_id: selectedTransaccion.id,
        p_estado: nuevoEstado,
        p_admin_id: user?.id,
        p_motivo_rechazo: nuevoEstado === 'rechazado' ? motivoRechazo : null,
        p_referencia_pago: nuevoEstado === 'pagado' ? referenciaPago : null
      });

      if (error) throw error;

      if (data && data[0]?.exito) {
        setShowModal(false);
        setSelectedTransaccion(null);
        cargarTransacciones();
        cargarEstadisticas();
      } else {
        alert(data?.[0]?.mensaje || 'Error procesando retiro');
      }
    } catch (error) {
      console.error('Error procesando retiro:', error);
      alert('Error procesando retiro');
    } finally {
      setProcesandoRetiro(false);
    }
  };

  const filtrarTransacciones = () => {
    return transacciones.filter(transaccion => {
      const cumpleTipo = filterTipo === 'todos' || transaccion.tipo === filterTipo;
      const cumpleEstado = filterEstado === 'todos' || transaccion.estado === filterEstado;
      const cumpleBusqueda = searchTerm === '' || 
        transaccion.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaccion.nombre_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaccion.email_usuario.toLowerCase().includes(searchTerm.toLowerCase());

      let cumpleFecha = true;
      if (filterFecha !== 'todos') {
        const fechaTransaccion = new Date(transaccion.fecha);
        const hoy = new Date();
        
        switch (filterFecha) {
          case 'hoy':
            cumpleFecha = fechaTransaccion.toDateString() === hoy.toDateString();
            break;
          case 'semana':
            const unaSemanaAtras = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
            cumpleFecha = fechaTransaccion >= unaSemanaAtras;
            break;
          case 'mes':
            const unMesAtras = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
            cumpleFecha = fechaTransaccion >= unMesAtras;
            break;
        }
      }

      return cumpleTipo && cumpleEstado && cumpleBusqueda && cumpleFecha;
    });
  };

  const getEstadoBadge = (estado: string, tipo: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    switch (estado) {
      case 'confirmada':
      case 'aprobado':
      case 'pagado':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <CheckCircleIcon className="w-3 h-3 inline mr-1" />
          {estado === 'confirmada' ? 'Confirmada' : estado === 'aprobado' ? 'Aprobado' : 'Pagado'}
        </span>;
      case 'pendiente':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          <ClockIcon className="w-3 h-3 inline mr-1" />
          Pendiente
        </span>;
      case 'rechazado':
      case 'cancelado':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>
          <XCircleIcon className="w-3 h-3 inline mr-1" />
          {estado === 'rechazado' ? 'Rechazado' : 'Cancelado'}
        </span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          {estado}
        </span>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    if (tipo === 'venta') {
      return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
        <CurrencyDollarIcon className="w-3 h-3 inline mr-1" />
        Venta
      </span>;
    } else {
      return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
        <BanknotesIcon className="w-3 h-3 inline mr-1" />
        Retiro
      </span>;
    }
  };

  const transaccionesFiltradas = filtrarTransacciones();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Transacciones</h2>
            <p className="text-sm text-gray-600">Gestiona todas las transacciones financieras de tu comunidad</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={cargarTransacciones}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Ventas</p>
                <p className="text-lg font-semibold text-gray-900">${estadisticas.monto_total_ventas.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{estadisticas.total_ventas} transacciones</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <BanknotesIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Retiros</p>
                <p className="text-lg font-semibold text-gray-900">${estadisticas.monto_total_retiros.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{estadisticas.total_retiros} solicitudes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-lg font-semibold text-gray-900">{estadisticas.retiros_pendientes}</p>
                <p className="text-xs text-gray-500">${estadisticas.monto_pendiente_retiros.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Ventas Pendientes</p>
                <p className="text-lg font-semibold text-gray-900">{estadisticas.ventas_pendientes}</p>
                <p className="text-xs text-gray-500">Por procesar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, producto o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="venta">Ventas</option>
              <option value="retiro">Retiros</option>
            </select>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="confirmada">Confirmada</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobado">Aprobado</option>
              <option value="pagado">Pagado</option>
              <option value="rechazado">Rechazado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select
              value={filterFecha}
              onChange={(e) => setFilterFecha(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todas las fechas</option>
              <option value="hoy">Hoy</option>
              <option value="semana">Última semana</option>
              <option value="mes">Último mes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto/Detalle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Cargando transacciones...
                </td>
              </tr>
            ) : transaccionesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No se encontraron transacciones
                </td>
              </tr>
            ) : (
              transaccionesFiltradas.map((transaccion) => (
                <tr key={transaccion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTipoBadge(transaccion.tipo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaccion.nombre_usuario}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaccion.email_usuario}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaccion.tipo === 'venta' 
                        ? transaccion.nombre_producto || transaccion.tipo_producto
                        : `Retiro - ${transaccion.metodo_pago}`
                      }
                    </div>
                    {transaccion.nombre_afiliado && (
                      <div className="text-sm text-gray-500">
                        Afiliado: {transaccion.nombre_afiliado}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${transaccion.monto.toFixed(2)} {transaccion.moneda}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(transaccion.estado, transaccion.tipo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaccion.metodo_pago}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaccion.fecha).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedTransaccion(transaccion);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalles */}
      {showModal && selectedTransaccion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de Transacción
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getTipoBadge(selectedTransaccion.tipo)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getEstadoBadge(selectedTransaccion.estado, selectedTransaccion.tipo)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaccion.nombre_usuario} ({selectedTransaccion.email_usuario})
                  </p>
                </div>

                {selectedTransaccion.tipo === 'venta' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Producto</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaccion.nombre_producto || selectedTransaccion.tipo_producto}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <p className="mt-1 text-sm text-gray-900">
                      ${selectedTransaccion.monto.toFixed(2)} {selectedTransaccion.moneda}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaccion.metodo_pago}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedTransaccion.fecha).toLocaleString('es-ES')}
                  </p>
                </div>

                {selectedTransaccion.referencia_externa && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Referencia</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaccion.referencia_externa}
                    </p>
                  </div>
                )}

                {selectedTransaccion.nombre_afiliado && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Afiliado</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaccion.nombre_afiliado}
                    </p>
                  </div>
                )}

                {selectedTransaccion.motivo_rechazo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Motivo de Rechazo</label>
                    <p className="mt-1 text-sm text-red-600">
                      {selectedTransaccion.motivo_rechazo}
                    </p>
                  </div>
                )}

                {selectedTransaccion.nombre_admin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Procesado por</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTransaccion.nombre_admin}
                    </p>
                  </div>
                )}

                {/* Acciones para retiros pendientes */}
                {selectedTransaccion.tipo === 'retiro' && selectedTransaccion.estado === 'pendiente' && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Procesar Retiro</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nuevo Estado</label>
                        <select
                          value={nuevoEstado}
                          onChange={(e) => setNuevoEstado(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Seleccionar estado</option>
                          <option value="aprobado">Aprobar</option>
                          <option value="rechazado">Rechazar</option>
                          <option value="pagado">Marcar como Pagado</option>
                        </select>
                      </div>

                      {nuevoEstado === 'rechazado' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Motivo de Rechazo</label>
                          <textarea
                            value={motivoRechazo}
                            onChange={(e) => setMotivoRechazo(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            placeholder="Explica el motivo del rechazo..."
                          />
                        </div>
                      )}

                      {nuevoEstado === 'pagado' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Referencia de Pago</label>
                          <input
                            type="text"
                            value={referenciaPago}
                            onChange={(e) => setReferenciaPago(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ID de transacción, número de transferencia, etc."
                          />
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={procesarRetiro}
                          disabled={!nuevoEstado || procesandoRetiro}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {procesandoRetiro ? 'Procesando...' : 'Procesar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaccionesPanel; 