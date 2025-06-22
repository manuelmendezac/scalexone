import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminConfigPanel from '../../components/admin/AdminConfigPanel';
import CommunitySettingsPanel from '../../components/admin/CommunitySettingsPanel';
import LoadingScreen from '../../components/LoadingScreen';
import { useHydration } from '../../store/useNeuroState';
import { Menu, X, Home, Settings, BarChart2, Tv, Users, Calendar, MessageSquare, Briefcase, DollarSign, List, CreditCard, Activity } from 'lucide-react';

// Esta lista es una réplica de la que está en AdminSidebar.tsx para usarla en el menú móvil.
const menuItems = [
    { key: 'welcome', label: 'Bienvenida', icon: <Home size={20} /> },
    { key: 'community', label: 'Comunidad', icon: <Users size={20} /> },
    { key: 'mainMenu', label: 'Menú Principal', icon: <Settings size={20} /> },
    { key: 'levels', label: 'Niveles', icon: <BarChart2 size={20} /> },
    { key: 'channels', label: 'Canales', icon: <Tv size={20} /> },
    { key: 'members', label: 'Miembros', icon: <Users size={20} /> },
    { key: 'events', label: 'Eventos', icon: <Calendar size={20} /> },
    { key: 'chats', label: 'Chats', icon: <MessageSquare size={20} /> },
    { key: 'affiliates', label: 'Afiliados', icon: <Briefcase size={20} /> },
    { key: 'payments', label: 'Métodos de Cobro', icon: <DollarSign size={20} /> },
    { key: 'salesHistory', label: 'Historial de Ventas', icon: <List size={20} /> },
    { key: 'transactions', label: 'Transacciones', icon: <CreditCard size={20} /> },
    { key: 'cryptoTransactions', label: 'Transacciones Crypto', icon: <Activity size={20} /> },
];

export default function AdminSettingsPage() {
  const [selectedItem, setSelectedItem] = useState('welcome');
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) setLoading(false);
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(true);
        setIsCollapsed(false);
      } else {
        setIsMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isHydrated]);

  if (loading) {
    return <LoadingScreen message="Cargando panel de administración..." />;
  }

  const handleSelect = (key: string) => {
    setSelectedItem(key);
    if (window.innerWidth < 1024) {
      setIsMenuOpen(false);
    }
  };

  const MobileSidebar = () => (
    <AnimatePresence>
      {isMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-72 bg-gray-900 p-4 z-40 lg:hidden"
          >
             <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
                <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>
                <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto">
              {menuItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item.key)}
                  className={`w-full flex items-center p-3 rounded-md transition-colors text-left
                    ${selectedItem === item.key 
                      ? 'bg-yellow-500 text-black font-bold' 
                      : 'bg-transparent text-white hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="mr-3">{item.icon}</div>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Botón de Menú para Móvil */}
      <div className="lg:hidden flex items-center p-4">
        <button onClick={() => setIsMenuOpen(true)} className="text-white">
          <Menu size={28} />
        </button>
        <h2 className="text-lg font-bold text-white ml-4">Configuración</h2>
      </div>

      <MobileSidebar />

      <div className="flex flex-row lg:space-x-8 p-4 lg:p-8">
        <AdminSidebar 
          selected={selectedItem} 
          onSelect={handleSelect}
          isOpen={isMenuOpen}
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        
        <div className="flex-1 w-full">
          {selectedItem === 'welcome' && <AdminConfigPanel selected='welcome' />}
          {selectedItem === 'community' && <CommunitySettingsPanel />}
          {selectedItem === 'mainMenu' && <div>Contenido de Menú Principal</div>}
          {selectedItem === 'levels' && <AdminConfigPanel selected='levels' />}
          {selectedItem === 'channels' && <AdminConfigPanel selected='channels' />}
        </div>
      </div>
    </div>
  );
} 