import React, { useState, useEffect } from 'react';
import { Users, DollarSign, CreditCard, TrendingUp, Calendar, Search, Filter, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { supabase } from '../../supabase';

interface Suscripcion {
  id: string;
  usuario_id: string;
  usuario_nombre: string;
  usuario_email: string;
  plan: string;
  precio: number;
  estado: 'activa' | 'cancelada' | 'pausada' | 'vencida';
  fecha_inicio: string;
  fecha_fin: string;
  metodo_pago: string;
  renovacion_automatica: boolean;
  descuento?: number;
}

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracion_dias: number;
  descripcion: string;
  activo: boolean;
  caracteristicas: string[];
}

const SuscripcionesAdminPanel: React.FC = () => {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'suscripciones' | 'planes' | 'estadisticas'>('suscripciones');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [mensaje, setMensaje] = useState('');
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  // Mock data inicial
  useEffect(() => {
    const mockSuscripciones: Suscripcion[] = [
      {
        id: '1',
        usuario_id: 'user1',
        usuario_nombre: 'Manuel Méndez',
        usuario_email: 'manuel@example.com',
        plan: 'Premium',
        precio: 29.99,
        estado: 'activa',
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-02-01',
        metodo_pago: 'Tarjeta de Crédito',
        renovacion_automatica: true
      },
      {
        id: '2',
        usuario_id: 'user2',
        usuario_nombre: 'MetaLink3',
        usuario_email: 'metalink3corp@gmail.com',
        plan: 'Pro',
        precio: 19.99,
        estado: 'activa',
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-02-15',
        metodo_pago: 'PayPal',
        renovacion_automatica: false
      },
      {
        id: '3',
        usuario_id: 'user3',
        usuario_nombre: 'Hospper Inmobiliaria',
        usuario_email: 'hospper@example.com',
        plan: 'Basic',
        precio: 9.99,
        estado: 'vencida',
        fecha_inicio: '2023-12-01',
        fecha_fin: '2024-01-01',
        metodo_pago: 'Transferencia',
        renovacion_automatica: false
      }
    ];

    const mockPlanes: Plan[] = [
      {
        id: '1',
        nombre: 'Basic',
        precio: 9.99,
        duracion_dias: 30,
        descripcion: 'Plan básico con funcionalidades esenciales',
        activo: true,
        caracteristicas: ['Acceso a cursos básicos', 'Soporte por email', '5 GB de almacenamiento']
      },
      {
        id: '2',
        nombre: 'Pro',
        precio: 19.99,
        duracion_dias: 30,
        descripcion: 'Plan profesional con más funcionalidades',
        activo: true,
        caracteristicas: ['Todo de Basic', 'Acceso a cursos avanzados', 'Soporte prioritario', '50 GB de almacenamiento', 'Certificaciones']
      },
      {
        id: '3',
        nombre: 'Premium',
        precio: 29.99,
        duracion_dias: 30,
        descripcion: 'Plan premium con todas las funcionalidades',
        activo: true,
        caracteristicas: ['Todo de Pro', 'Acceso completo', 'Soporte 24/7', 'Almacenamiento ilimitado', 'Mentorías 1:1', 'Contenido exclusivo']
      }
    ];

    setSuscripciones(mockSuscripciones);
    setPlanes(mockPlanes);
    setLoading(false);
  }, []);

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pausada':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'vencida':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colors = {
      activa: 'bg-green-500',
      cancelada: 'bg-red-500',
      pausada: 'bg-yellow-500',
      vencida: 'bg-gray-500'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${colors[estado as keyof typeof colors] || colors.vencida}`}>
        {getEstadoIcon(estado)}
        <span className="ml-1 capitalize">{estado}</span>
      </span>
    );
  };

  const calcularEstadisticas = () => {
    const total = suscripciones.length;
    const activas = suscripciones.filter(s => s.estado === 'activa').length;
    const ingresosMensual = suscripciones
      .filter(s => s.estado === 'activa')
      .reduce((acc, s) => acc + s.precio, 0);
    const tasaRetencion = total > 0 ? (activas / total) * 100 : 0;

    return { total, activas, ingresosMensual, tasaRetencion };
  };

  const stats = calcularEstadisticas();

  const filteredSuscripciones = suscripciones.filter(sub => {
    const matchesSearch = sub.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.usuario_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.plan.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'todos') return matchesSearch;
    return matchesSearch && sub.estado === selectedFilter;
  });

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
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Suscripciones Activas</p>
                <p className="text-2xl font-bold text-green-500">{stats.activas}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-yellow-500">${stats.ingresosMensual.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tasa de Retención</p>
                <p className="text-2xl font-bold text-purple-500">{stats.tasaRetencion.toFixed(1)}%</p>
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
                    <th className="text-left p-4 text-gray-300">Método de Pago</th>
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
                          {sub.plan}
                        </span>
                      </td>
                      <td className="p-4 text-white font-medium">${sub.precio}</td>
                      <td className="p-4">{getEstadoBadge(sub.estado)}</td>
                      <td className="p-4 text-white">{new Date(sub.fecha_fin).toLocaleDateString()}</td>
                      <td className="p-4 text-gray-300">{sub.metodo_pago}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 bg-yellow-500 text-black rounded hover:bg-yellow-600">
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    <Edit size={16} className="inline mr-2" />
                    Editar
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'estadisticas' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Resumen Financiero</h3>
              <div className="text-gray-300">
                <p>Funcionalidad de estadísticas en desarrollo...</p>
                <p>Aquí se mostrarán gráficos y métricas detalladas.</p>
              </div>
            </div>
          </div>
        )}

        {/* Mensajes */}
        {mensaje && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg">
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuscripcionesAdminPanel; 