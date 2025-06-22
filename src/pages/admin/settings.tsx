import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar, { menuItems } from '../../components/admin/AdminSidebar';
import AdminConfigPanel from '../../components/admin/AdminConfigPanel';
import CommunitySettingsPanel from '../../components/admin/CommunitySettingsPanel';
import CursosAdminPanel from '../../components/CursosAdminPanel';
import LoadingScreen from '../../components/LoadingScreen';
import { useHydration } from '../../store/useNeuroState';
import { Menu, X } from 'lucide-react';
import useNeuroState from '../../store/useNeuroState';

export default function AdminSettingsPage() {
  const [selectedItem, setSelectedItem] = useState('welcome');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isHydrated = useHydration();
  const { userInfo } = useNeuroState();

  useEffect(() => {
    if (isHydrated) {
      setLoading(false);
    }
  }, [isHydrated]);
  
  const isAdmin = userInfo?.rol === 'admin' || userInfo?.rol === 'superadmin';

  if (loading) {
    return <LoadingScreen message="Cargando panel de administración..." />;
  }

  const handleSelect = (key: string) => {
    setSelectedItem(key);
    setIsMobileMenuOpen(false); // Cierra el menú móvil al seleccionar
  };

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Botón de Menú Flotante para Móvil (Solo Admins) */}
      {isAdmin && (
        <motion.div
          drag
          dragConstraints={{
            top: -250,
            left: -250,
            right: 250,
            bottom: 250,
          }}
          className="lg:hidden fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing"
        >
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="bg-yellow-500 text-black w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform"
            aria-label="Abrir menú"
          >
            <Menu size={32} />
          </button>
        </motion.div>
      )}

      {/* Menú Deslizante para Móvil (Solo se puede abrir si el botón es visible) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full w-72 bg-gray-900 p-4 z-50 lg:hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
                <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto">
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

      <div className="flex flex-row space-x-0 lg:space-x-8 p-4 lg:p-8">
        {/* Sidebar para Escritorio (Solo Admins) */}
        {isAdmin && (
          <AdminSidebar 
            selected={selectedItem} 
            onSelect={setSelectedItem} 
          />
        )}
        
        {/* Contenido Principal */}
        <div className="flex-1 w-full">
          {/* El perfil es visible para todos */}
          {selectedItem === 'welcome' && <AdminConfigPanel selected='welcome' />}
          
          {/* El resto de paneles son solo para admins */}
          {isAdmin && selectedItem === 'community' && <CommunitySettingsPanel />}
          {isAdmin && selectedItem === 'mainMenu' && <div>Contenido de Menú Principal</div>}
          {isAdmin && selectedItem === 'levels' && <AdminConfigPanel selected='levels' />}
          {isAdmin && selectedItem === 'channels' && <AdminConfigPanel selected='channels' />}
        </div>
      </div>
    </div>
  );
} 