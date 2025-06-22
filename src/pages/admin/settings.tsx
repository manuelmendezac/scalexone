import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminConfigPanel from '../../components/admin/AdminConfigPanel';
import AdminHeader from '../../components/admin/AdminHeader';
import LoadingScreen from '../../components/LoadingScreen';
import { useHydration } from '../../store/useNeuroState';
import { useMediaQuery } from 'react-responsive';

export default function AdminSettingsPage() {
  const [selected, setSelected] = useState('welcome');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isHydrated = useHydration();
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });

  useEffect(() => {
    // La barra lateral está permanentemente 'abierta' en desktop, pero el estado de control es para móvil
    if (isDesktop) {
      setSidebarOpen(false); // En desktop, el estado no importa, la barra es visible por CSS
    }
  }, [isDesktop]);
  
  useEffect(() => {
    if (isHydrated) {
      setLoading(false);
    }
  }, [isHydrated]);

  if (!isHydrated || loading) {
    return <LoadingScreen message="Cargando configuración..." />;
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <AdminSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selected={selected} 
        onSelect={setSelected} 
      />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="pt-16 lg:pt-0 flex-1">
          <AdminConfigPanel selected={selected} />
        </main>
      </div>
    </div>
  );
} 