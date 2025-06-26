import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar, { menuItems } from '../../components/admin/AdminSidebar';
import AdminConfigPanel from '../../components/admin/AdminConfigPanel';
import CommunitySettingsPanel from '../../components/admin/CommunitySettingsPanel';
import CursosAdminPanel from '../../components/CursosAdminPanel';
import MiembrosAdminPanel from '../../components/MiembrosAdminPanel';
import LoadingScreen from '../../components/LoadingScreen';
import { useHydration } from '../../store/useNeuroState';
import { Menu, X } from 'lucide-react';
import useNeuroState from '../../store/useNeuroState';
import ConfiguracionProyecto from '../../components/ConfiguracionProyecto';
import AdminCanalesPanel from '../../components/AdminCanalesPanel';

export default function AdminSettingsPage() {
  const [selectedItem, setSelectedItem] = useState('community');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isHydrated = useHydration();
  const { userInfo } = useNeuroState();

  useEffect(() => {
    console.log('AdminSettingsPage mounted');
    console.log('isHydrated:', isHydrated);
    console.log('userInfo:', userInfo);
    console.log('selectedItem:', selectedItem);
    
    if (isHydrated) {
      setLoading(false);
    }
  }, [isHydrated, userInfo, selectedItem]);
  
  const isAdmin = userInfo?.rol === 'admin' || userInfo?.rol === 'superadmin';

  const handleSelect = (key: string) => {
    console.log('Selected item changed to:', key);
    setSelectedItem(key);
    setIsMobileMenuOpen(false);
    setError(null);
  };

  const renderContent = () => {
    console.log('Rendering content for:', selectedItem);
    
    try {
      switch (selectedItem) {
        case 'welcome':
          return <AdminConfigPanel selected='welcome' />;
        case 'community':
          return <CommunitySettingsPanel />;
        case 'mainMenu':
          return <ConfiguracionProyecto />;
        case 'levels':
          return <AdminConfigPanel selected='levels' />;
        case 'channels':
          return <AdminCanalesPanel />;
        case 'members':
        case 'miembros':
          console.log('Rendering MiembrosAdminPanel');
          return <MiembrosAdminPanel />;
        default:
          return (
            <div className="w-full p-8">
              <div className="bg-gray-900/50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-yellow-500 mb-4">
                  {selectedItem}
                </h2>
                <div className="text-white">
                  Contenido para {selectedItem} (en desarrollo)
                </div>
              </div>
            </div>
          );
      }
    } catch (err: any) {
      console.error('Error rendering content:', err);
      setError(err.message);
      return (
        <div className="w-full p-8">
          <div className="bg-red-900/50 rounded-lg p-6 border border-red-500">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <div className="text-white">
              Error al cargar el contenido: {err.message}
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header móvil con hamburger menu (Solo Admins) */}
      {isAdmin && (
        <div className="lg:hidden bg-gray-900/50 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-yellow-500 hover:text-yellow-400"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* Menú móvil (Solo Admins) */}
      <AnimatePresence>
        {isMobileMenuOpen && isAdmin && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-gray-900/50 border-b border-gray-800"
          >
            <div className="p-4 space-y-2">
              {menuItems.filter(item => item.key !== 'banners').map(item => (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item.key)}
                  className={`w-full flex items-center p-3 rounded-md transition-colors text-left
                    ${selectedItem === item.key 
                      ? 'bg-yellow-500 text-black font-bold' 
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="mr-3">{item.icon}</div>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex w-full">
        {/* Sidebar para Escritorio (Solo Admins) */}
        {isAdmin && (
          <AdminSidebar 
            selected={selectedItem} 
            onSelect={handleSelect} 
          />
        )}
        
        {/* Contenido Principal */}
        <div className="flex-1 min-h-screen">
          {error && (
            <div className="p-4">
              <div className="bg-red-900/50 rounded-lg p-4 border border-red-500 text-red-300">
                Error: {error}
              </div>
            </div>
          )}
          
          {!isAdmin && selectedItem !== 'welcome' ? (
            <div className="p-8">
              <div className="bg-gray-900/50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-yellow-500 mb-4">
                  Acceso Restringido
                </h2>
                <div className="text-white">
                  Solo los administradores pueden acceder a esta sección.
                </div>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
} 