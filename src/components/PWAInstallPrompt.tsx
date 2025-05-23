import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('Usuario instaló la PWA');
    } else {
      console.log('Usuario rechazó la instalación');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-gradient-to-r from-cyan-900/90 to-violet-900/90 backdrop-blur-lg rounded-lg p-4 shadow-lg border border-cyan-700/30 max-w-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-cyan-100 font-orbitron text-lg">Instalar NeuroLink AI</h3>
              <button
                onClick={handleDismiss}
                className="text-violet-200/60 hover:text-violet-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-violet-200/80 text-sm mb-4">
              Instala NeuroLink AI en tu dispositivo para acceder rápidamente y disfrutar de una experiencia offline.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-600/30 text-cyan-100 hover:bg-cyan-600/50 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg bg-violet-600/30 text-violet-100 hover:bg-violet-600/50"
              >
                Más tarde
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt; 