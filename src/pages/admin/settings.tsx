import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminConfigPanel from '../../components/admin/AdminConfigPanel';
import CommunitySettingsPanel from '../../components/admin/CommunitySettingsPanel';
import CursosAdminPanel from '../../components/CursosAdminPanel';
import LoadingScreen from '../../components/LoadingScreen';
import { useHydration } from '../../store/useNeuroState';
import { useAuth } from '../../hooks/useAuth';

export default function AdminSettingsPage() {
  const [selectedItem, setSelectedItem] = useState('welcome');
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

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="flex flex-col lg:flex-row lg:space-x-8 p-4 lg:p-8">
        <AdminSidebar 
          selected={selectedItem} 
          onSelect={setSelectedItem} 
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