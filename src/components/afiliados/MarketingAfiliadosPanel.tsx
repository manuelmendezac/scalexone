import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, DollarSign, TrendingUp, Target, MousePointer, Percent, RefreshCw, Download, GraduationCap, Briefcase } from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';

// Interfaces para el Dashboard
interface DashboardMetrics {
  totalEarnings: number;
  pendingEarnings: number;
  refunds: number;
  refundPercentage: number;
  totalSales: number;
  totalClicks: number;
  totalLeads: number;
  conversionRate: number;
  paymentsGenerated: number;
  paymentsReceived: number;
}

interface EarningsData {
  date: string;
  earnings: number;
}

interface TopAffiliate {
  id: string;
  name: string;
  avatar: string;
  earnings: number;
  rank: number;
}

interface SolicitudAfiliacion {
  id: string;
  producto_id: string;
  tabla_producto: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_solicitud: string;
}

const MarketingAfiliadosPanel: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudAfiliacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSolicitudes, setShowSolicitudes] = useState(false);
  
  // Estado del Dashboard
  const [dateFilter, setDateFilter] = useState('7d');
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalEarnings: 1247.85,
    pendingEarnings: 324.50,
    refunds: 0.00,
    refundPercentage: 0,
    totalSales: 23,
    totalClicks: 1847,
    totalLeads: 142,
    conversionRate: 7.7,
    paymentsGenerated: 8,
    paymentsReceived: 5
  });
  
  // Datos del gráfico de ingresos (últimos 7 días)
  const [earningsData, setEarningsData] = useState<EarningsData[]>([
    { date: '2024-01-15', earnings: 125 },
    { date: '2024-01-16', earnings: 180 },
    { date: '2024-01-17', earnings: 245 },
    { date: '2024-01-18', earnings: 190 },
    { date: '2024-01-19', earnings: 310 },
    { date: '2024-01-20', earnings: 420 },
    { date: '2024-01-21', earnings: 380 }
  ]);
  
  // Top afiliados para gamificación
  const [topAfiliates, setTopAfiliates] = useState<TopAffiliate[]>([
    { id: '1', name: 'Ana García', avatar: '👩‍💼', earnings: 2847.50, rank: 1 },
    { id: '2', name: 'Carlos Ruiz', avatar: '👨‍💻', earnings: 2134.20, rank: 2 },
    { id: '3', name: 'Laura Martín', avatar: '👩‍🚀', earnings: 1856.75, rank: 3 },
    { id: '4', name: 'Diego López', avatar: '👨‍🎯', earnings: 1423.90, rank: 4 },
    { id: '5', name: 'Sofia Torres', avatar: '👩‍🎨', earnings: 1247.85, rank: 5 }
  ]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cargar solicitudes del usuario
      await cargarSolicitudes(user.id);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const cargarSolicitudes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('solicitudes_afiliacion')
        .select('*')
        .eq('usuario_id', userId)
        .order('fecha_solicitud', { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    }
  };

  const renderEarningsChart = () => {
    const maxEarnings = Math.max(...earningsData.map(d => d.earnings));
    
    return (
      <div className="bg-white/5 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Gráfico de Ingresos</h3>
          <div className="text-blue-400 font-bold text-xl">
            ${earningsData.reduce((acc, d) => acc + d.earnings, 0).toLocaleString()}
          </div>
        </div>
        
        <div className="flex items-end justify-between h-48 gap-3">
          {earningsData.map((data, index) => (
            <div key={data.date} className="flex-1 flex flex-col items-center group">
              <div className="flex-1 flex items-end w-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.earnings / maxEarnings) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:from-blue-500 hover:to-blue-300 transition-colors cursor-pointer"
                />
              </div>
              <div className="mt-2 text-xs text-gray-400 text-center">
                {new Date(data.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
              </div>
              <div className="text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                ${data.earnings}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-white/5 rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              📊 Dashboard de Rendimiento
            </h2>
            <p className="text-gray-300">
              Monitorea tus ingresos, conversiones y rendimiento en tiempo real
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="year">Este año</option>
            </select>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico de Ingresos */}
      {renderEarningsChart()}

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Generado</p>
              <p className="text-white text-3xl font-bold">${dashboardMetrics.totalEarnings.toLocaleString()}</p>
              <p className="text-blue-400 text-sm mt-2">+${dashboardMetrics.pendingEarnings.toLocaleString()} pendiente</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Reembolsada</p>
              <p className="text-white text-3xl font-bold">${dashboardMetrics.refunds.toFixed(2)}</p>
              <p className="text-gray-400 text-sm mt-2">{dashboardMetrics.refundPercentage}% del total</p>
            </div>
            <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">% Reembolso</p>
              <p className="text-white text-3xl font-bold">{dashboardMetrics.refundPercentage}%</p>
              <p className="text-gray-400 text-sm mt-2">Muy por debajo del promedio</p>
            </div>
            <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Rendimiento */}
      <div className="bg-white/5 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-400" />
          Panel de Rendimiento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center bg-gray-800/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-2">{dashboardMetrics.totalSales}</div>
            <div className="text-gray-300 text-sm mb-1">Ventas Generadas</div>
            <div className="text-blue-400 text-xs">+15% vs período anterior</div>
          </div>
          
          <div className="text-center bg-gray-800/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-2">{dashboardMetrics.totalClicks.toLocaleString()}</div>
            <div className="text-gray-300 text-sm mb-1">Clics en Enlaces</div>
            <div className="text-blue-400 text-xs">+8% vs período anterior</div>
          </div>
          
          <div className="text-center bg-gray-800/30 rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-2">{dashboardMetrics.totalLeads}</div>
            <div className="text-gray-300 text-sm mb-1">Leads Generados</div>
            <div className="text-blue-400 text-xs">+23% vs período anterior</div>
          </div>
        </div>
      </div>

      {/* Pagos en Efectivo */}
      <div className="bg-white/5 rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <MousePointer className="w-6 h-6 text-blue-400" />
          Pagos en Efectivo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center bg-gray-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white mb-2">{dashboardMetrics.paymentsGenerated}</div>
            <div className="text-gray-300 text-sm">Pagos Generados</div>
          </div>
          
          <div className="text-center bg-gray-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-white mb-2">{dashboardMetrics.paymentsReceived}</div>
            <div className="text-gray-300 text-sm">Pagos Recibidos</div>
          </div>
          
          <div className="text-center bg-gray-800/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400 mb-2">{dashboardMetrics.conversionRate}%</div>
            <div className="text-gray-300 text-sm">Tasa de Conversión</div>
          </div>
        </div>
      </div>

      {/* Sistema de Gamificación - Top Afiliados */}
      <div className="bg-white/5 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            🏆 Top Afiliados
          </h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm">Ver todas</button>
        </div>
        
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {topAfiliates.map((affiliate, index) => (
            <motion.div
              key={affiliate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 ${
                index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                index === 2 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                'bg-gradient-to-r from-gray-600 to-gray-700'
              }`}>
                {affiliate.avatar}
              </div>
              <div className="text-white text-sm font-medium">{affiliate.name.split(' ')[0]}</div>
              <div className="text-blue-400 text-xs">${affiliate.earnings.toLocaleString()}</div>
              <div className="text-gray-500 text-xs">#{affiliate.rank}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-300">Cargando dashboard de afiliados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Principal Simplificado */}
      <div className="bg-white/5 rounded-xl border border-gray-700/50">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                🚀 Portal de Afiliados ScaleXone
              </h1>
              <p className="text-gray-300 text-lg mt-2">
                Dashboard profesional para maximizar tus ganancias como afiliado
              </p>
            </div>
            <div className="bg-blue-500/20 text-blue-300 px-6 py-3 rounded-lg border border-blue-500/30">
              <div className="text-center">
                <div className="text-2xl font-bold">${dashboardMetrics.totalEarnings.toLocaleString()}</div>
                <div className="text-xs opacity-80">Ganancias Totales</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Principal */}
      {renderDashboard()}

      {/* Panel de solicitudes - Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowSolicitudes(!showSolicitudes)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Heart className="w-5 h-5" />
          <span className="text-sm font-medium">Solicitudes ({solicitudes.length})</span>
        </button>
      </div>

      {/* Panel de solicitudes */}
      {showSolicitudes && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/5 rounded-xl border border-gray-700/50"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-400" />
              Mis Solicitudes de Afiliación
            </h2>
            {solicitudes.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">¡Comienza tu journey como afiliado!</div>
                <p className="text-gray-500">Solicita afiliación a los productos que te interesen y empieza a ganar comisiones</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="bg-gray-800/30 rounded-lg p-4 flex items-center justify-between border border-gray-700/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        {solicitud.tabla_producto === 'cursos' ? (
                          <GraduationCap className="w-6 h-6 text-blue-400" />
                        ) : (
                          <Briefcase className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          {solicitud.tabla_producto === 'cursos' ? 'Curso' : 'Servicio'} • ID: {solicitud.producto_id.slice(-8)}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Solicitado el {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      solicitud.estado === 'pendiente' 
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                        : solicitud.estado === 'aprobada'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {solicitud.estado === 'pendiente' && '⏳ En revisión'}
                      {solicitud.estado === 'aprobada' && '✅ Aprobada'}
                      {solicitud.estado === 'rechazada' && '❌ Rechazada'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MarketingAfiliadosPanel;
