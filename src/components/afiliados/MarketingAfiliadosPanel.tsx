import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { Heart, DollarSign, TrendingUp, Target, MousePointer, Percent, RefreshCw, Download, GraduationCap, Briefcase, Award, Star, Trophy, Shield, Zap, Gift, HelpCircle } from 'lucide-react';
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
  montoRetiro: number;
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

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

const MarketingAfiliadosPanel: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudAfiliacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSolicitudes, setShowSolicitudes] = useState(false);
  
  // Estado del Dashboard
  const [dateFilter, setDateFilter] = useState('7d');
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalEarnings: 0,
    pendingEarnings: 0,
    refunds: 0,
    refundPercentage: 0,
    totalSales: 0,
    totalClicks: 0,
    totalLeads: 0,
    conversionRate: 0,
    paymentsGenerated: 0,
    paymentsReceived: 0,
    montoRetiro: 0
  });
  
  // Datos del gráfico de ingresos (últimos 7 días)
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  
  // Top afiliados para gamificación
  const [topAfiliates, setTopAfiliates] = useState<TopAffiliate[]>([
    { id: '1', name: 'Ana García', avatar: '👩‍💼', earnings: 2847.50, rank: 1 },
    { id: '2', name: 'Carlos Ruiz', avatar: '👨‍💻', earnings: 2134.20, rank: 2 },
    { id: '3', name: 'Laura Martín', avatar: '👩‍🚀', earnings: 1856.75, rank: 3 },
    { id: '4', name: 'Diego López', avatar: '👨‍🎯', earnings: 1423.90, rank: 4 },
    { id: '5', name: 'Sofia Torres', avatar: '👩‍🎨', earnings: 1247.85, rank: 5 }
  ]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fechaRegistro, setFechaRegistro] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        // Obtener perfil real del usuario (avatar y fecha de registro)
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('full_name, avatar_url, created_at')
          .eq('id', user.id)
          .single();
        let avatarUrl = usuario?.avatar_url || null;
        if (!avatarUrl && user.user_metadata?.avatar_url) {
          avatarUrl = user.user_metadata.avatar_url;
        }
        setProfile({
          full_name: usuario?.full_name || user.email,
          avatar_url: avatarUrl,
        });
        setFechaRegistro(usuario?.created_at || null);
        // Obtener código de afiliado principal
        const { data: codigos } = await supabase
          .from('codigos_afiliado')
          .select('id, codigo')
          .eq('user_id', user.id)
          .eq('activo', true)
          .order('created_at', { ascending: false })
          .limit(1);
        const codigoAfiliado = codigos?.[0]?.codigo;
        const codigoAfiliadoId = codigos?.[0]?.id;
        // Si no hay código de afiliado, forzar saldo a 0 y mostrar mensaje
        if (!codigoAfiliadoId) {
          setDashboardMetrics(metrics => ({ ...metrics, montoRetiro: 0 }));
          setLoading(false);
          return;
        }
        // Métricas principales
        let totalClicks = 0, totalLeads = 0, totalSales = 0, totalEarnings = 0, pendingEarnings = 0, paymentsGenerated = 0, paymentsReceived = 0;
        // CLICKS
        if (codigoAfiliadoId) {
          const { count: clicksCount } = await supabase
            .from('clicks_afiliado')
            .select('id', { count: 'exact', head: true })
            .eq('codigo_afiliado_id', codigoAfiliadoId);
          totalClicks = clicksCount || 0;
        }
        // LEADS
        if (codigoAfiliadoId) {
          const { count: leadsCount } = await supabase
            .from('leads_afiliado')
            .select('id', { count: 'exact', head: true })
            .eq('codigo_afiliado_id', codigoAfiliadoId);
          totalLeads = leadsCount || 0;
        }
        // CONVERSIONES/VENTAS
        if (codigoAfiliadoId) {
          const { data: conversiones } = await supabase
            .from('conversiones_afiliado')
            .select('id, valor_conversion, comision_generada, estado, created_at')
            .eq('codigo_afiliado_id', codigoAfiliadoId);
          totalSales = conversiones?.length || 0;
          totalEarnings = (conversiones && conversiones.length > 0) ? conversiones.reduce((acc, c) => acc + (c.comision_generada ?? 0), 0) : 0;
          pendingEarnings = (conversiones && conversiones.length > 0) ? conversiones.filter(c => c.estado === 'pendiente').reduce((acc, c) => acc + (c.comision_generada ?? 0), 0) : 0;
          paymentsGenerated = conversiones?.filter(c => c.estado === 'confirmada').length || 0;
          paymentsReceived = conversiones?.filter(c => c.estado === 'pagada').length || 0;
          // Gráfica de ingresos por fecha
          const ingresosPorFecha: { [fecha: string]: number } = {};
          conversiones?.forEach(c => {
            const fecha = c.created_at?.slice(0, 10);
            if (!fecha) return;
            ingresosPorFecha[fecha] = (ingresosPorFecha[fecha] || 0) + (c.comision_generada ?? 0);
          });
          setEarningsData(Object.entries(ingresosPorFecha).map(([date, earnings]) => ({ date, earnings })));
        }
        // Calcular tasa de conversión
        const conversionRate = totalClicks > 0 ? (totalSales / totalClicks) * 100 : 0;
        setDashboardMetrics({
          totalEarnings,
          pendingEarnings,
          refunds: 0, // Implementar si tienes reembolsos
          refundPercentage: 0, // Implementar si tienes reembolsos
          totalSales,
          totalClicks,
          totalLeads,
          conversionRate,
          paymentsGenerated,
          paymentsReceived,
          montoRetiro: 0 // Inicialmente 0, luego se actualiza abajo
        });
        // Calcular monto de retiro real
        let montoRetiro = 0;
        if (codigoAfiliadoId) {
          // Comisiones confirmadas y liberadas (ventas con más de 7 días, no reembolsadas)
          const { data: conversiones } = await supabase
            .from('conversiones_afiliado')
            .select('comision_generada, estado, created_at')
            .eq('codigo_afiliado_id', codigoAfiliadoId)
            .eq('estado', 'confirmada');
          const hoy = new Date();
          const comisionesLiberadas = (conversiones || []).filter(c => {
            const fecha = new Date(c.created_at);
            const diff = (hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24);
            return diff >= 7 && (c.comision_generada ?? 0) > 0;
          });
          montoRetiro = comisionesLiberadas.reduce((acc, c) => acc + (c.comision_generada ?? 0), 0);
          // Restar retiros realizados
          const { data: retiros } = await supabase
            .from('retiros_afiliados')
            .select('monto, estado')
            .eq('codigo_afiliado_id', codigoAfiliadoId)
            .in('estado', ['aprobado', 'pagado']);
          montoRetiro -= (retiros || []).reduce((acc, r) => acc + (r.monto ?? 0), 0);
        }
        setDashboardMetrics(metrics => ({ ...metrics, montoRetiro: montoRetiro > 0 ? montoRetiro : 0 }));
      } catch (error) {
        console.error('Error cargando métricas de afiliado:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

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
    if (earningsData.length === 0) {
      return (
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 flex flex-col items-center justify-center min-h-[300px]">
          <div style={{ color: '#6b7280', fontSize: 18, marginBottom: 12 }}>Sin datos de ventas aún</div>
          {/* Ejemplo simulado opcional */}
          {/* <img src="/images/ejemplo-grafica-hotmart.png" alt="Ejemplo" style={{ maxWidth: 320, opacity: 0.3 }} /> */}
        </div>
      );
    }
    return (
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresos</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart
              data={earningsData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tickFormatter={(str: string) => new Date(str).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                axisLine={true}
                tickLine={true}
                stroke="#6b7280"
              />
              <YAxis 
                axisLine={true}
                tickLine={true}
                stroke="#6b7280"
                tickFormatter={(value: number) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backdropFilter: 'blur(4px)'
                }}
                labelFormatter={(label: string) => new Date(label).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingresos']}
              />
              <Area 
                type="monotone" 
                dataKey="earnings" 
                stroke="#2563eb" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorUv)" 
                activeDot={{ r: 6, stroke: 'white', strokeWidth: 2, fill: '#2563eb' }}
                dot={{ r: 4, stroke: 'white', strokeWidth: 2, fill: '#2563eb' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const RightSidebar = ({ profile }: { profile: Profile | null }) => {
    const availableForWithdrawal = 472.41;
    const achievements = [
        { icon: Award, name: 'Vendedor Iniciante' },
        { icon: Star, name: 'Primera Venta' },
        { icon: Trophy, name: 'Top Afiliado' },
        { icon: Target, name: 'Misión Cumplida' },
        { icon: Shield, name: 'Vendedor Seguro' },
        { icon: Zap, name: 'Venta Rápida' },
        { icon: Gift, name: 'Bonus' },
        { icon: HelpCircle, name: '?' },
    ];
  
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200 flex flex-col items-center justify-center">
                <img
                    src={profile?.avatar_url || '/images/silueta-perfil.svg'}
                    alt="Avatar"
                    style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 12, objectFit: 'cover', border: '2px solid #2563eb' }}
                />
                <div style={{ fontWeight: 700, fontSize: 18, color: '#2563eb', marginBottom: 4 }}>
                    {profile?.full_name || 'Afiliado'}
                </div>
                <div style={{ color: '#6b7280', fontSize: 15 }}>
                    {fechaRegistro ? `Afiliado desde ${new Date(fechaRegistro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}` : 'Afiliado'}
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-gray-500 text-sm mb-2">Monto disponible para retiro</p>
                <p className="text-3xl font-bold text-green-600 mb-4">${availableForWithdrawal.toFixed(2)}</p>
                <Link to="/afiliados/retiros" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-center inline-block transition-colors">
                    Retirar Saldo
                </Link>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Logros</h3>
                <div className="grid grid-cols-4 gap-4">
                    {achievements.map((ach, index) => (
                        <div key={index} className="aspect-square bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg flex items-center justify-center" title={ach.name}>
                            <ach.icon className="w-6 h-6 text-gray-500" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando dashboard de afiliados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
       <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-blue-700">
                    Portal de Afiliados ScaleXone
                </h1>
                <p className="text-gray-800 text-lg mt-2">
                    Dashboard profesional para maximizar tus ganancias como afiliado
                </p>
            </div>
            <div className="text-right">
                <p className="text-gray-500 text-sm">Ganancias Totales</p>
                <div className="text-3xl font-bold text-green-600">
                    ${dashboardMetrics.totalEarnings.toLocaleString()} US$
                </div>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {renderEarningsChart()}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-gray-500 text-sm font-medium flex items-center">
                    Total <InfoIcon />
                </p>
                <p className="text-gray-900 text-3xl font-bold mt-2">${dashboardMetrics.totalEarnings.toLocaleString()} US$</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-gray-500 text-sm font-medium flex items-center">
                    Reembolsada <InfoIcon />
                </p>
                <p className="text-gray-900 text-3xl font-bold mt-2">${dashboardMetrics.refunds.toFixed(2)} US$</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-gray-500 text-sm font-medium flex items-center">
                    % Reembolso <InfoIcon />
                </p>
                <p className="text-gray-900 text-3xl font-bold mt-2">{dashboardMetrics.refundPercentage}%</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Desempeño</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                    <p className="text-gray-500 text-sm mb-1 flex items-center justify-center">Ventas <InfoIcon /></p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.totalSales}</p>
                    <p className="text-green-500 text-sm font-medium mt-1">▲ 450%</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1 flex items-center justify-center">Clics <InfoIcon /></p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.totalClicks.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1 flex items-center justify-center">Leads <InfoIcon /></p>
                    <p className="text-3xl font-bold text-gray-900">{dashboardMetrics.totalLeads}</p>
                </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Pagos concretados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                    <p className="text-gray-500 text-sm mb-1">Generados</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.paymentsGenerated}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Pagados</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.paymentsReceived}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">% Conversión</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.conversionRate}%</p>
                </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <RightSidebar profile={profile} />
        </div>
      </div>
    </div>
  );
};

const InfoIcon = () => (
  <span className="ml-1.5 text-gray-400 hover:text-gray-600 cursor-pointer" title="Información adicional">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
  </span>
);

export default MarketingAfiliadosPanel;
