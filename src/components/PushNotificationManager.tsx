import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';

const PushNotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Verificar si las notificaciones están soportadas
    if (!('Notification' in window)) {
      setIsSupported(false);
      return;
    }

    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Registrar el service worker para notificaciones push
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY
        });

        // Aquí podrías enviar la suscripción a tu servidor
        console.log('Push Notification subscription:', subscription);
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 left-4 z-50"
    >
      {permission !== 'granted' && (
        <button
          onClick={requestPermission}
          className="bg-gradient-to-r from-cyan-900/90 to-violet-900/90 backdrop-blur-lg rounded-lg p-3 shadow-lg border border-cyan-700/30 hover:scale-105 transition-transform"
          title="Activar notificaciones"
        >
          {permission === 'default' ? (
            <Bell className="w-5 h-5 text-cyan-300" />
          ) : (
            <BellOff className="w-5 h-5 text-violet-300" />
          )}
        </button>
      )}
    </motion.div>
  );
};

export default PushNotificationManager; 