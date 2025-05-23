import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  Copy,
  BarChart2,
  Users,
  DollarSign,
  CreditCard,
  Star,
  Crown,
  AlertCircle
} from 'lucide-react';
import { useReferralStore } from '../../stores/referralStore';

const ReferralDashboard: React.FC = () => {
  const { stats, referrals, resources, requestPayout, trackClick, connectStripe } = useReferralStore();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);

  const handleCopyLink = async () => {
    const referralLink = `${window.location.origin}/ref/${stats.referralCode}`;
    await navigator.clipboard.writeText(referralLink);
    trackClick();
  };

  const handleShare = async () => {
    const referralLink = `${window.location.origin}/ref/${stats.referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: '¡Únete a NeuroLink AI!',
          text: 'Descubre el poder de la IA para mejorar tu productividad',
          url: referralLink
        });
        trackClick();
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleRequestPayout = async () => {
    try {
      await requestPayout();
      setShowPayoutModal(false);
    } catch (error) {
      console.error('Error requesting payout:', error);
    }
  };

  const handleConnectStripe = async () => {
    try {
      // Aquí iría la lógica para conectar con Stripe Connect
      const accountId = 'acct_123'; // Esto vendría de la API de Stripe
      await connectStripe(accountId);
      setShowStripeModal(false);
    } catch (error) {
      console.error('Error connecting Stripe:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neurolink-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-orbitron text-neurolink-coldWhite mb-2">
              Panel de Referidos
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Gana comisiones invitando a otros a NeuroLink AI
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStripeModal(true)}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Conectar Stripe
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPayoutModal(true)}
              disabled={stats.pendingEarnings < 50}
              className={`px-4 py-2 rounded-lg font-orbitron flex items-center gap-2 ${
                stats.pendingEarnings >= 50
                  ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                  : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite/50 cursor-not-allowed'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              Solicitar Pago
            </motion.button>
          </div>
        </motion.div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-neurolink-cyberBlue/20">
                <Users className="w-6 h-6 text-neurolink-matrixGreen" />
              </div>
              <div>
                <h3 className="text-neurolink-coldWhite/70 font-orbitron">Referidos Activos</h3>
                <p className="text-2xl text-neurolink-coldWhite">{stats.activeSubscriptions}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-neurolink-coldWhite/50">
              <BarChart2 className="w-4 h-4" />
              <span>Total: {stats.registrations}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-neurolink-cyberBlue/20">
                <DollarSign className="w-6 h-6 text-neurolink-matrixGreen" />
              </div>
              <div>
                <h3 className="text-neurolink-coldWhite/70 font-orbitron">Ganado este Mes</h3>
                <p className="text-2xl text-neurolink-coldWhite">${stats.monthlyEarnings.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-neurolink-coldWhite/50">
              <BarChart2 className="w-4 h-4" />
              <span>Total: ${stats.totalEarnings.toFixed(2)}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-neurolink-cyberBlue/20">
                <CreditCard className="w-6 h-6 text-neurolink-matrixGreen" />
              </div>
              <div>
                <h3 className="text-neurolink-coldWhite/70 font-orbitron">Pendiente</h3>
                <p className="text-2xl text-neurolink-coldWhite">${stats.pendingEarnings.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-neurolink-coldWhite/50">
              <BarChart2 className="w-4 h-4" />
              <span>Pagado: ${stats.paidEarnings.toFixed(2)}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-neurolink-cyberBlue/20">
                <Star className="w-6 h-6 text-neurolink-matrixGreen" />
              </div>
              <div>
                <h3 className="text-neurolink-coldWhite/70 font-orbitron">Estado de Bonos</h3>
                <p className="text-2xl text-neurolink-coldWhite">
                  {stats.volumeBonus ? '+5%' : '0%'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-neurolink-coldWhite/50">
              {stats.partnerStatus ? (
                <div className="flex items-center gap-1 text-neurolink-matrixGreen">
                  <Crown className="w-4 h-4" />
                  <span>Partner Status</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Falta: ${(500 - stats.monthlyEarnings).toFixed(2)} para Partner</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Enlace de Referido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
        >
          <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
            Tu Enlace de Referido
          </h2>
          <div className="flex gap-4">
            <div className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite font-mono">
              {`${window.location.origin}/ref/${stats.referralCode}`}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <Copy className="w-5 h-5" />
              Copiar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Compartir
            </motion.button>
          </div>
        </motion.div>

        {/* Recursos para Compartir */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
        >
          <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
            Recursos para Compartir
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map(resource => (
              <div
                key={resource.id}
                className="bg-black/40 rounded-lg border border-neurolink-cyberBlue/30 p-4"
              >
                <div className="aspect-video bg-neurolink-cyberBlue/10 rounded-lg mb-4 overflow-hidden">
                  {resource.preview && (
                    <img
                      src={resource.preview}
                      alt={resource.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h3 className="text-neurolink-coldWhite font-orbitron mb-2">
                  {resource.title}
                  {resource.isPremium && stats.partnerStatus && (
                    <span className="ml-2 text-xs text-neurolink-matrixGreen">Premium</span>
                  )}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-neurolink-coldWhite/70 text-sm">
                    {resource.type}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(resource.url, '_blank')}
                    className="px-3 py-1 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 text-sm font-orbitron"
                  >
                    Descargar
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal de Pago */}
      <AnimatePresence>
        {showPayoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                Solicitar Pago
              </h2>
              <p className="text-neurolink-coldWhite/70 mb-6">
                Monto disponible para retiro: ${stats.pendingEarnings.toFixed(2)}
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRequestPayout}
                  className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Stripe */}
      <AnimatePresence>
        {showStripeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                Conectar con Stripe
              </h2>
              <p className="text-neurolink-coldWhite/70 mb-6">
                Conecta tu cuenta de Stripe para recibir pagos automáticamente
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowStripeModal(false)}
                  className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConnectStripe}
                  className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron"
                >
                  Conectar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReferralDashboard; 