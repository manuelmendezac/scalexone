import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  AlertCircle,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CreditCard as CreditCardIcon,
  FileText,
  Settings,
  Zap,
  RefreshCcw
} from 'lucide-react';
import { useUserStore } from '../../stores/userStore';

interface PaymentMethod {
  id: string;
  type: 'stripe' | 'paypal';
  last4: string;
  expiryDate: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  invoiceUrl: string;
}

const SubscriptionPanel: React.FC = () => {
  const { user } = useUserStore();
  const [expandedSections, setExpandedSections] = useState<{
    paymentHistory: boolean;
    paymentMethods: boolean;
    accountSettings: boolean;
  }>({
    paymentHistory: true,
    paymentMethods: false,
    accountSettings: false
  });

  // Datos de ejemplo
  const currentPlan = {
    name: 'Pro',
    status: 'active',
    renewalDate: '2024-04-15',
    credits: {
      used: 750,
      total: 1000
    }
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe_123',
      type: 'stripe',
      last4: '4242',
      expiryDate: '12/25',
      isDefault: true
    },
    {
      id: 'paypal_456',
      type: 'paypal',
      last4: '1234',
      expiryDate: 'N/A',
      isDefault: false
    }
  ];

  const transactions: Transaction[] = [
    {
      id: 'txn_1',
      date: '2024-03-15',
      amount: 20.00,
      status: 'completed',
      paymentMethod: 'Stripe (4242)',
      invoiceUrl: '/invoices/inv_1.pdf'
    },
    {
      id: 'txn_2',
      date: '2024-02-15',
      amount: 20.00,
      status: 'completed',
      paymentMethod: 'Stripe (4242)',
      invoiceUrl: '/invoices/inv_2.pdf'
    },
    {
      id: 'txn_3',
      date: '2024-01-15',
      amount: 20.00,
      status: 'failed',
      paymentMethod: 'PayPal',
      invoiceUrl: '/invoices/inv_3.pdf'
    }
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-neurolink-matrixGreen';
      case 'suspended':
        return 'text-yellow-500';
      case 'expired':
        return 'text-red-500';
      default:
        return 'text-neurolink-coldWhite';
    }
  };

  return (
    <div className="min-h-screen bg-neurolink-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Información del usuario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-2">
                Plan {currentPlan.name}
              </h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-orbitron ${
                getStatusColor(currentPlan.status)
              }`}>
                {currentPlan.status.toUpperCase()}
              </span>
            </div>
            <Link
              to="/pricing"
              className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron hover:bg-neurolink-matrixGreen/90 transition-all"
            >
              Actualizar Plan
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Próxima Renovación</h3>
              <p className="text-neurolink-coldWhite flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {new Date(currentPlan.renewalDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-neurolink-coldWhite/70 font-orbitron mb-2">Créditos IA</h3>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-neurolink-matrixGreen">
                      {currentPlan.credits.used} / {currentPlan.credits.total}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-neurolink-cyberBlue/20">
                  <div
                    style={{ width: `${(currentPlan.credits.used / currentPlan.credits.total) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-neurolink-matrixGreen"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Historial de pagos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('paymentHistory')}
            className="w-full px-6 py-4 flex justify-between items-center text-left"
          >
            <h2 className="text-xl font-orbitron text-neurolink-coldWhite flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Historial de Pagos
            </h2>
            {expandedSections.paymentHistory ? (
              <ChevronUp className="w-5 h-5 text-neurolink-coldWhite" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neurolink-coldWhite" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.paymentHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
              >
                {transactions.some(t => t.status === 'failed') && (
                  <div className="mb-4 p-4 rounded-lg bg-red-500/20 text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Hay pagos fallidos en tu historial
                  </div>
                )}

                <div className="space-y-4">
                  {transactions.map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-neurolink-cyberBlue/10"
                    >
                      <div>
                        <p className="text-neurolink-coldWhite font-orbitron">
                          ${transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-neurolink-coldWhite/70 text-sm">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.status === 'completed'
                            ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                            : transaction.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.status}
                        </span>
                        <Link
                          to={transaction.invoiceUrl}
                          className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30"
                        >
                          <FileText className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Integración con pasarelas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('paymentMethods')}
            className="w-full px-6 py-4 flex justify-between items-center text-left"
          >
            <h2 className="text-xl font-orbitron text-neurolink-coldWhite flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" />
              Métodos de Pago
            </h2>
            {expandedSections.paymentMethods ? (
              <ChevronUp className="w-5 h-5 text-neurolink-coldWhite" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neurolink-coldWhite" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.paymentMethods && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
              >
                <div className="space-y-4">
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-neurolink-cyberBlue/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-neurolink-cyberBlue/20">
                          {method.type === 'stripe' ? (
                            <CreditCardIcon className="w-5 h-5 text-neurolink-cyberBlue" />
                          ) : (
                            <ExternalLink className="w-5 h-5 text-neurolink-cyberBlue" />
                          )}
                        </div>
                        <div>
                          <p className="text-neurolink-coldWhite font-orbitron">
                            {method.type === 'stripe' ? `•••• ${method.last4}` : 'PayPal'}
                          </p>
                          <p className="text-neurolink-coldWhite/70 text-sm">
                            {method.isDefault ? 'Método predeterminado' : method.expiryDate}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30">
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  <button className="flex-1 px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center justify-center gap-2">
                    <RefreshCcw className="w-5 h-5" />
                    Gestionar desde Stripe
                  </button>
                  <button className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 font-orbitron flex items-center justify-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Cancelar Suscripción
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Configuración de cuenta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('accountSettings')}
            className="w-full px-6 py-4 flex justify-between items-center text-left"
          >
            <h2 className="text-xl font-orbitron text-neurolink-coldWhite flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración de Cuenta
            </h2>
            {expandedSections.accountSettings ? (
              <ChevronUp className="w-5 h-5 text-neurolink-coldWhite" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neurolink-coldWhite" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.accountSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6"
              >
                <div className="space-y-4">
                  <button className="w-full p-4 rounded-lg bg-neurolink-cyberBlue/10 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/20 flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5" />
                    Cambiar Método de Pago
                  </button>
                  <button className="w-full p-4 rounded-lg bg-neurolink-cyberBlue/10 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/20 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Descargar Facturas
                  </button>
                  <button className="w-full p-4 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Eliminar Cuenta
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPanel; 