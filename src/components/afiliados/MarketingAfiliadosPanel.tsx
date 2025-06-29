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

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }
        setProfile(profileData);

        // Cargar solicitudes del usuario
        await cargarSolicitudes(user.id);
        
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar los datos del dashboard');
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
                axisLine={false}
                tickLine={false}
                stroke="#6b7280"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
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
            <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${profile?.full_name || 'placeholder'}`}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-100 shadow-sm"
                />
                <h2 className="text-xl font-bold text-gray-800">{profile?.full_name || 'Cargando...'}</h2>
                <p className="text-sm text-gray-500">Afiliado desde 2023</p>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Pagos en efectivo</h3>
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
