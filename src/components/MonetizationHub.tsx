import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  CreditCard,
  Users,
  BarChart2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Settings,
  RefreshCcw,
  Share2,
  Activity
} from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Interfaces
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
  paymentProcessor: 'stripe' | 'paypal' | 'crypto';
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'inactive' | 'pending';
  lastPayment: string;
  totalSpent: number;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  subscriber: string;
  plan: string;
  status: 'completed' | 'pending' | 'failed';
  processor: 'stripe' | 'paypal' | 'crypto';
}

// Datos de ejemplo
const EXAMPLE_PLANS: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Plan Básico',
    price: 29.99,
    description: 'Acceso a funcionalidades básicas del clon',
    features: ['Acceso básico al clon', 'Soporte por email'],
    isActive: true,
    paymentProcessor: 'stripe'
  },
  {
    id: '2',
    name: 'Plan Pro',
    price: 99.99,
    description: 'Acceso completo con funcionalidades avanzadas',
    features: ['Acceso completo al clon', 'Soporte prioritario', 'Mentorías mensuales'],
    isActive: true,
    paymentProcessor: 'stripe'
  },
  {
    id: '3',
    name: 'Plan Enterprise',
    price: 299.99,
    description: 'Solución completa para empresas',
    features: ['Acceso completo al clon', 'Soporte 24/7', 'Mentorías semanales', 'API personalizada'],
    isActive: true,
    paymentProcessor: 'stripe'
  }
];

const EXAMPLE_SUBSCRIBERS: Subscriber[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@email.com',
    plan: 'Plan Pro',
    status: 'active',
    lastPayment: '2024-03-15',
    totalSpent: 299.97
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@email.com',
    plan: 'Plan Enterprise',
    status: 'active',
    lastPayment: '2024-03-14',
    totalSpent: 899.97
  }
];

const EXAMPLE_PAYMENTS: Payment[] = [
  {
    id: '1',
    amount: 99.99,
    date: '2024-03-15',
    subscriber: 'Juan Pérez',
    plan: 'Plan Pro',
    status: 'completed',
    processor: 'stripe'
  },
  {
    id: '2',
    amount: 299.99,
    date: '2024-03-14',
    subscriber: 'María García',
    plan: 'Plan Enterprise',
    status: 'completed',
    processor: 'stripe'
  }
];

// Datos para gráficos
const monthlyData = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Ingresos Mensuales',
      data: [1200, 1900, 3000, 5000, 4800, 6000],
      borderColor: 'rgb(0, 255, 0)',
      backgroundColor: 'rgba(0, 255, 0, 0.1)',
      tension: 0.4
    }
  ]
};

const planDistributionData = {
  labels: ['Básico', 'Pro', 'Enterprise'],
  datasets: [
    {
      data: [30, 45, 25],
      backgroundColor: [
        'rgba(0, 255, 0, 0.2)',
        'rgba(0, 150, 255, 0.2)',
        'rgba(255, 255, 255, 0.2)'
      ],
      borderColor: [
        'rgba(0, 255, 0, 1)',
        'rgba(0, 150, 255, 1)',
        'rgba(255, 255, 255, 1)'
      ],
      borderWidth: 1
    }
  ]
};

export const MonetizationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plans' | 'subscribers' | 'payments'>('dashboard');
  const [plans, setPlans] = useState<SubscriptionPlan[]>(EXAMPLE_PLANS);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(EXAMPLE_SUBSCRIBERS);
  const [payments, setPayments] = useState<Payment[]>(EXAMPLE_PAYMENTS);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Función para mostrar notificaciones
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Función para crear un nuevo plan
  const createNewPlan = (plan: Omit<SubscriptionPlan, 'id'>) => {
    const newPlan: SubscriptionPlan = {
      ...plan,
      id: Date.now().toString()
    };
    setPlans([...plans, newPlan]);
    showNotification('Plan creado exitosamente');
  };

  // Función para actualizar un plan
  const updatePlan = (updatedPlan: SubscriptionPlan) => {
    setPlans(plans.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan));
    showNotification('Plan actualizado exitosamente');
  };

  // Función para eliminar un plan
  const deletePlan = (planId: string) => {
    setPlans(plans.filter(plan => plan.id !== planId));
    showNotification('Plan eliminado exitosamente');
  };

  return (
    <div className="min-h-screen bg-neurolink-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-3xl font-orbitron text-neurolink-coldWhite mb-6 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-neurolink-matrixGreen" />
          Monetization<span className="text-neurolink-matrixGreen">Hub</span>
        </h1>

        {/* Pestañas de navegación */}
        <div className="flex mb-6 bg-black/30 p-1 rounded-lg">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
            { id: 'plans', label: 'Planes', icon: <CreditCard className="w-5 h-5" /> },
            { id: 'subscribers', label: 'Suscriptores', icon: <Users className="w-5 h-5" /> },
            { id: 'payments', label: 'Pagos', icon: <DollarSign className="w-5 h-5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-orbitron transition-all ${
                activeTab === tab.id 
                  ? 'bg-neurolink-matrixGreen text-neurolink-dark' 
                  : 'text-neurolink-coldWhite hover:bg-neurolink-matrixGreen/20'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido principal */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Resumen de ingresos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30">
                  <h3 className="text-lg font-orbitron text-neurolink-coldWhite/70 mb-2">Ingresos Totales</h3>
                  <p className="text-3xl text-neurolink-matrixGreen">$12,450.00</p>
                </div>
                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30">
                  <h3 className="text-lg font-orbitron text-neurolink-coldWhite/70 mb-2">Suscriptores Activos</h3>
                  <p className="text-3xl text-neurolink-matrixGreen">{subscribers.length}</p>
                </div>
                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30">
                  <h3 className="text-lg font-orbitron text-neurolink-coldWhite/70 mb-2">Ingreso Promedio</h3>
                  <p className="text-3xl text-neurolink-matrixGreen">$299.99</p>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30">
                  <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-4">Ingresos Mensuales</h3>
                  <Line data={monthlyData} options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: {
                          color: 'rgba(255, 255, 255, 0.7)'
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        }
                      }
                    }
                  }} />
                </div>
                <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30">
                  <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-4">Distribución de Planes</h3>
                  <Pie data={planDistributionData} options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                        labels: {
                          color: 'rgba(255, 255, 255, 0.7)'
                        }
                      }
                    }
                  }} />
                </div>
              </div>

              {/* Últimos pagos */}
              <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30">
                <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-4">Últimos Pagos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-neurolink-coldWhite/70">
                        <th className="text-left p-2">Fecha</th>
                        <th className="text-left p-2">Suscriptor</th>
                        <th className="text-left p-2">Plan</th>
                        <th className="text-left p-2">Monto</th>
                        <th className="text-left p-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id} className="border-t border-neurolink-cyberBlue/20">
                          <td className="p-2 text-neurolink-coldWhite">{payment.date}</td>
                          <td className="p-2 text-neurolink-coldWhite">{payment.subscriber}</td>
                          <td className="p-2 text-neurolink-coldWhite">{payment.plan}</td>
                          <td className="p-2 text-neurolink-coldWhite">${payment.amount}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              payment.status === 'completed' 
                                ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                                : payment.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-500'
                                  : 'bg-red-500/20 text-red-500'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Encabezado y botón de nuevo plan */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite">Planes de Suscripción</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewPlanModal(true)}
                  className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nuevo Plan
                </motion.button>
              </div>

              {/* Lista de planes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-orbitron text-neurolink-coldWhite">{plan.name}</h3>
                        <p className="text-3xl text-neurolink-matrixGreen mt-2">${plan.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPlan(plan)}
                          className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-neurolink-coldWhite/70 mb-4">{plan.description}</p>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-neurolink-coldWhite">
                          <CheckCircle className="w-4 h-4 text-neurolink-matrixGreen" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        plan.isActive 
                          ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {plan.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      <span className="text-neurolink-coldWhite/70 text-sm">
                        {plan.paymentProcessor}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'subscribers' && (
            <motion.div
              key="subscribers"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Encabezado y filtros */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite">Suscriptores</h2>
                <div className="flex gap-2">
                  <select className="px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite">
                    <option value="all">Todos los planes</option>
                    <option value="basic">Plan Básico</option>
                    <option value="pro">Plan Pro</option>
                    <option value="enterprise">Plan Enterprise</option>
                  </select>
                  <select className="px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite">
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                    <option value="pending">Pendientes</option>
                  </select>
                </div>
              </div>

              {/* Lista de suscriptores */}
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-neurolink-coldWhite/70">
                        <th className="text-left p-4">Nombre</th>
                        <th className="text-left p-4">Email</th>
                        <th className="text-left p-4">Plan</th>
                        <th className="text-left p-4">Estado</th>
                        <th className="text-left p-4">Último Pago</th>
                        <th className="text-left p-4">Total Gastado</th>
                        <th className="text-left p-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map(subscriber => (
                        <tr key={subscriber.id} className="border-t border-neurolink-cyberBlue/20">
                          <td className="p-4 text-neurolink-coldWhite">{subscriber.name}</td>
                          <td className="p-4 text-neurolink-coldWhite">{subscriber.email}</td>
                          <td className="p-4 text-neurolink-coldWhite">{subscriber.plan}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              subscriber.status === 'active' 
                                ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                                : subscriber.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-500'
                                  : 'bg-red-500/20 text-red-400'
                            }`}>
                              {subscriber.status}
                            </span>
                          </td>
                          <td className="p-4 text-neurolink-coldWhite">{subscriber.lastPayment}</td>
                          <td className="p-4 text-neurolink-coldWhite">${subscriber.totalSpent}</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/30">
                                <Activity className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'payments' && (
            <motion.div
              key="payments"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Encabezado y filtros */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite">Historial de Pagos</h2>
                <div className="flex gap-2">
                  <select className="px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite">
                    <option value="all">Todos los procesadores</option>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">Cripto</option>
                  </select>
                  <select className="px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite">
                    <option value="all">Todos los estados</option>
                    <option value="completed">Completados</option>
                    <option value="pending">Pendientes</option>
                    <option value="failed">Fallidos</option>
                  </select>
                </div>
              </div>

              {/* Lista de pagos */}
              <div className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-neurolink-coldWhite/70">
                        <th className="text-left p-4">Fecha</th>
                        <th className="text-left p-4">Suscriptor</th>
                        <th className="text-left p-4">Plan</th>
                        <th className="text-left p-4">Monto</th>
                        <th className="text-left p-4">Procesador</th>
                        <th className="text-left p-4">Estado</th>
                        <th className="text-left p-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment.id} className="border-t border-neurolink-cyberBlue/20">
                          <td className="p-4 text-neurolink-coldWhite">{payment.date}</td>
                          <td className="p-4 text-neurolink-coldWhite">{payment.subscriber}</td>
                          <td className="p-4 text-neurolink-coldWhite">{payment.plan}</td>
                          <td className="p-4 text-neurolink-coldWhite">${payment.amount}</td>
                          <td className="p-4 text-neurolink-coldWhite">{payment.processor}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              payment.status === 'completed' 
                                ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                                : payment.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-500'
                                  : 'bg-red-500/20 text-red-400'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30">
                                <RefreshCcw className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/30">
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notificación flotante */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-neurolink-matrixGreen text-neurolink-dark px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-orbitron">{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MonetizationHub; 