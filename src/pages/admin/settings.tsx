import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminConfigPanel from '../../components/admin/AdminConfigPanel';
import CommunitySettingsPanel from '../../components/admin/CommunitySettingsPanel';
import CursosAdminPanel from '../../components/CursosAdminPanel';
import LoadingScreen from '../../components/LoadingScreen';
import { useHydration } from '../../store/useNeuroState';
import { Menu } from 'lucide-react';

export default function AdminSettingsPage() {
  const [selectedItem, setSelectedItem] = useState('welcome');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      setLoading(false);
    }
  }, [isHydrated]);

  if (loading) {
    return <LoadingScreen message="Cargando panel de administración..." />;
  }

  const handleSelect = (key: string) => {
    setSelectedItem(key);
    setIsSidebarOpen(false);
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="flex">
        <AdminSidebar 
          selected={selectedItem} 
          onSelect={handleSelect}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 w-full transition-all duration-300">
          <div className="lg:hidden flex justify-between items-center p-4 sticky top-0 bg-black/80 backdrop-blur-sm z-20">
            <h2 className="text-lg font-bold text-white">Panel Admin</h2>
            <button onClick={() => setIsSidebarOpen(true)} className="text-white">
              <Menu size={28} />
            </button>
          </div>

          <div className="p-4 lg:p-8">
            {selectedItem === 'welcome' && <AdminConfigPanel selected='welcome' />}
            {selectedItem === 'community' && <CommunitySettingsPanel />}
            {selectedItem === 'mainMenu' && <div>Contenido de Menú Principal</div>}
            {selectedItem === 'levels' && <AdminConfigPanel selected='levels' />}
            {selectedItem === 'channels' && <AdminConfigPanel selected='channels' />}
          </div>
        </main>
      </div>
    </div>
  );
} 