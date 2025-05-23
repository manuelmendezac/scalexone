import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  DollarSign,
  CreditCard,
  Star,
  Crown,
  AlertCircle,
  Copy,
  Share2,
  Link,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Bell,
  Settings,
  Volume2,
  VolumeX,
  Mail,
  X
} from 'lucide-react';
import { useReferralStore } from '../../stores/referralStore';
import { toast } from 'react-hot-toast';

interface PaymentHistory {
  id: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

interface NotificationSettings {
  sound: boolean;
  push: boolean;
  email: boolean;
}

const AffiliateDashboard: React.FC = () => {
  const { stats, referrals, requestPayout, trackClick } = useReferralStore();
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [expandedReferral, setExpandedReferral] = useState<string | null>(null);
  const [showCustomLinkModal, setShowCustomLinkModal] = useState(false);
  const [customLink, setCustomLink] = useState('');
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    sound: true,
    push: true,
    email: true
  });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    amount: number;
    name: string;
  } | null>(null);

  // Efecto para solicitar permisos de notificación al cargar
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  // Efecto para simular nuevas comisiones (mock)
  useEffect(() => {
    const mockNewCommission = () => {
      const randomAmount = Math.floor(Math.random() * 50) + 10;
      const randomName = `Usuario ${Math.floor(Math.random() * 1000)}`;
      
      handleNewCommission(randomAmount, randomName);
    };

    // Simular una nueva comisión cada 30 segundos (solo para demo)
    const interval = setInterval(mockNewCommission, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNewCommission = (amount: number, name: string) => {
    // Reproducir sonido si está activado
    if (notificationSettings.sound) {
      const audio = new Audio('/sounds/coin.mp3');
      audio.play().catch(console.error);
    }

    // Mostrar notificación push si está activado
    if (notificationSettings.push && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('¡Nueva Comisión!', {
        body: `Has ganado $${amount} con tu referido ${name}`,
        icon: '/logo.png'
      });
    }

    // Enviar correo si está activado (mock)
    if (notificationSettings.email) {
      console.log(`Enviando correo: Has ganado $${amount} con tu referido ${name}`);
    }

    // Mostrar notificación visual
    setNotificationData({ amount, name });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);

    // Mostrar toast
    toast.success(`¡Nueva comisión de $${amount} con ${name}!`, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid #00ff9d'
      }
    });
  };

  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      amount: 150,
      date: '2024-03-15',
      status: 'completed'
    },
    {
      id: '2',
      amount: 75,
      date: '2024-02-15',
      status: 'completed'
    },
    {
      id: '3',
      amount: 200,
      date: '2024-01-15',
      status: 'completed'
    }
  ];

  const handleCopyLink = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${stats.referralCode}`;
    await navigator.clipboard.writeText(referralLink);
    trackClick();
  };

  const handleShare = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${stats.referralCode}`;
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

  const generateCustomLink = () => {
    const baseUrl = `${window.location.origin}/signup`;
    const params = new URLSearchParams({
      ref: stats.referralCode,
      source: customLink
    });
    return `${baseUrl}?${params.toString()}`;
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
              Panel de Afiliados
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Gestiona tus referidos y comisiones
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotificationSettings(true)}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Configuración
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

        {/* Resumen General */}
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
              <Calendar className="w-4 h-4" />
              <span>Este mes: {stats.registrations}</span>
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
              <DollarSign className="w-4 h-4" />
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
              <CheckCircle className="w-4 h-4" />
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

        {/* Enlaces de Referido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-orbitron text-neurolink-coldWhite">
              Enlaces de Referido
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCustomLinkModal(true)}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <Link className="w-5 h-5" />
              Crear Enlace Personalizado
            </motion.button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite font-mono">
                {`${window.location.origin}/signup?ref=${stats.referralCode}`}
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
          </div>
        </motion.div>

        {/* Tabla de Referidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
        >
          <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
            Mis Referidos
          </h2>
          <div className="space-y-4">
            {referrals.map(referral => (
              <div
                key={referral.id}
                className="bg-black/40 rounded-lg border border-neurolink-cyberBlue/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedReferral(expandedReferral === referral.id ? null : referral.id)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left"
                >
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron">{referral.name}</h3>
                    <p className="text-neurolink-coldWhite/70">{referral.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      referral.status === 'active'
                        ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {referral.plan}
                    </span>
                    {expandedReferral === referral.id ? (
                      <ChevronUp className="w-5 h-5 text-neurolink-coldWhite" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neurolink-coldWhite" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedReferral === referral.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-neurolink-coldWhite/70 text-sm">Fecha de Registro</p>
                          <p className="text-neurolink-coldWhite">
                            {new Date(referral.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-neurolink-coldWhite/70 text-sm">Ganancias</p>
                          <p className="text-neurolink-coldWhite">
                            ${referral.earnings.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Historial de Pagos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6"
        >
          <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
            Historial de Pagos
          </h2>
          <div className="space-y-4">
            {paymentHistory.map(payment => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30"
              >
                <div>
                  <p className="text-neurolink-coldWhite font-orbitron">
                    ${payment.amount.toFixed(2)}
                  </p>
                  <p className="text-neurolink-coldWhite/70 text-sm">
                    {new Date(payment.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {payment.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-neurolink-matrixGreen" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className={`text-sm ${
                    payment.status === 'completed'
                      ? 'text-neurolink-matrixGreen'
                      : 'text-yellow-500'
                  }`}>
                    {payment.status === 'completed' ? 'Completado' : 'En proceso'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Notificación Flotante */}
      <AnimatePresence>
        {showNotification && notificationData && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.3 }}
            className="fixed bottom-8 right-8 bg-neurolink-matrixGreen/20 backdrop-blur-xl border border-neurolink-matrixGreen/30 rounded-xl p-4 shadow-lg z-50"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-neurolink-matrixGreen/20">
                <DollarSign className="w-6 h-6 text-neurolink-matrixGreen" />
              </div>
              <div>
                <h3 className="text-neurolink-coldWhite font-orbitron">
                  ¡Nueva Comisión!
                </h3>
                <p className="text-neurolink-coldWhite/70">
                  Has ganado ${notificationData.amount} con tu referido {notificationData.name}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="p-1 rounded-full hover:bg-neurolink-matrixGreen/20"
              >
                <X className="w-4 h-4 text-neurolink-coldWhite" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Configuración de Notificaciones */}
      <AnimatePresence>
        {showNotificationSettings && (
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
                Configuración de Notificaciones
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                  <div className="flex items-center gap-3">
                    {notificationSettings.sound ? (
                      <Volume2 className="w-5 h-5 text-neurolink-matrixGreen" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-neurolink-coldWhite/50" />
                    )}
                    <div>
                      <h3 className="text-neurolink-coldWhite font-orbitron">Sonido</h3>
                      <p className="text-neurolink-coldWhite/70 text-sm">
                        Reproducir sonido al recibir comisiones
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, sound: !prev.sound }))}
                    className={`px-4 py-2 rounded-lg font-orbitron ${
                      notificationSettings.sound
                        ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                        : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                    }`}
                  >
                    {notificationSettings.sound ? 'Activado' : 'Desactivado'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                  <div className="flex items-center gap-3">
                    <Bell className={`w-5 h-5 ${
                      notificationSettings.push
                        ? 'text-neurolink-matrixGreen'
                        : 'text-neurolink-coldWhite/50'
                    }`} />
                    <div>
                      <h3 className="text-neurolink-coldWhite font-orbitron">Notificaciones Push</h3>
                      <p className="text-neurolink-coldWhite/70 text-sm">
                        Recibir notificaciones en el navegador
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, push: !prev.push }))}
                    className={`px-4 py-2 rounded-lg font-orbitron ${
                      notificationSettings.push
                        ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                        : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                    }`}
                  >
                    {notificationSettings.push ? 'Activado' : 'Desactivado'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                  <div className="flex items-center gap-3">
                    <Mail className={`w-5 h-5 ${
                      notificationSettings.email
                        ? 'text-neurolink-matrixGreen'
                        : 'text-neurolink-coldWhite/50'
                    }`} />
                    <div>
                      <h3 className="text-neurolink-coldWhite font-orbitron">Correo Electrónico</h3>
                      <p className="text-neurolink-coldWhite/70 text-sm">
                        Recibir resumen por correo
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationSettings(prev => ({ ...prev, email: !prev.email }))}
                    className={`px-4 py-2 rounded-lg font-orbitron ${
                      notificationSettings.email
                        ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                        : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                    }`}
                  >
                    {notificationSettings.email ? 'Activado' : 'Desactivado'}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowNotificationSettings(false)}
                  className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Modal de Enlace Personalizado */}
      <AnimatePresence>
        {showCustomLinkModal && (
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
                Crear Enlace Personalizado
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-neurolink-coldWhite/70 mb-2">
                    Nombre de la Campaña
                  </label>
                  <input
                    type="text"
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    placeholder="ej: facebook-ads"
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                  />
                </div>
                {customLink && (
                  <div className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                    <p className="text-neurolink-coldWhite/70 mb-2">Tu enlace personalizado:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-neurolink-coldWhite font-mono text-sm">
                        {generateCustomLink()}
                      </code>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigator.clipboard.writeText(generateCustomLink())}
                        className="p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30"
                      >
                        <Copy className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowCustomLinkModal(false)}
                  className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AffiliateDashboard; 