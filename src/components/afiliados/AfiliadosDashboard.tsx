import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  LinkIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { motion } from 'framer-motion';
import { Copy, Share2, Plus, Users2, Target, TrendingUp } from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'react-hot-toast';
import AfiliadosComunidadPanel from './AfiliadosComunidadPanel';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AfiliadosDashboard = () => {
  const [activeTab, setActiveTab] = useState('comunidad');
  const [userStats, setUserStats] = useState({
    totalComisiones: 0,
    comisionesPendientes: 0,
    referidosActivos: 0,
    tasaConversion: 0
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener estadísticas del usuario
      const { data: stats } = await supabase
        .from('estadisticas_afiliado')
        .select('*')
        .eq('user_id', user.id);

      if (stats && stats.length > 0) {
        const totals = stats.reduce((acc, stat) => ({
          totalComisiones: acc.totalComisiones + stat.total_comisiones,
          comisionesPendientes: acc.comisionesPendientes + stat.comisiones_pendientes,
          referidosActivos: acc.referidosActivos + stat.usuarios_referidos,
          tasaConversion: acc.tasaConversion + stat.tasa_conversion
        }), { totalComisiones: 0, comisionesPendientes: 0, referidosActivos: 0, tasaConversion: 0 });

        setUserStats({
          ...totals,
          tasaConversion: stats.length > 0 ? totals.tasaConversion / stats.length : 0
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  if (activeTab === 'comunidad') {
    return <AfiliadosComunidadPanel />;
  }
  // Datos de ejemplo para los gráficos
  const lineChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Comisiones',
        data: [1200, 1900, 3000, 5000, 4000, 6000],
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
      },
    ],
  };

  const pieChartData = {
    labels: ['Cuentas Activas', 'Cuentas Inactivas'],
    datasets: [
      {
        data: [70, 30],
        backgroundColor: ['rgb(59, 130, 246)', 'rgb(156, 163, 175)'],
      },
    ],
  };

  const stats = [
    {
      name: 'Comisión Total',
      value: '$12,500',
      icon: CurrencyDollarIcon,
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Cuentas Activas',
      value: '150',
      icon: UserGroupIcon,
      change: '+5%',
      changeType: 'positive',
    },
    {
      name: 'Enlaces Generados',
      value: '45',
      icon: LinkIcon,
      change: '+8%',
      changeType: 'positive',
    },
    {
      name: 'Tasa de Conversión',
      value: '3.2%',
      icon: ChartBarIcon,
      change: '-2%',
      changeType: 'negative',
    },
  ];

  const topAccounts = [
    { id: 1, name: 'Juan Pérez', balance: '$25,000', accounts: 12 },
    { id: 2, name: 'María García', balance: '$18,500', accounts: 8 },
    { id: 3, name: 'Carlos López', balance: '$15,200', accounts: 6 },
    { id: 4, name: 'Ana Martínez', balance: '$12,800', accounts: 5 },
    { id: 5, name: 'Pedro Sánchez', balance: '$10,500', accounts: 4 },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('comunidad')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'comunidad'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users2 className="w-5 h-5" />
            Marketing Comunidad
          </button>
          <button
            onClick={() => setActiveTab('trading')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trading'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Trading IB
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <stat.icon className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rendimiento de Comisiones
          </h3>
          <Line data={lineChartData} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Cuentas
          </h3>
          <div className="h-64">
            <Pie data={pieChartData} />
          </div>
        </div>
      </div>

      {/* Top Accounts Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Cuentas IB
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuentas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topAccounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {account.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{account.balance}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{account.accounts}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfiliadosDashboard; 