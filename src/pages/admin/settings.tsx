import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminConfigPanel from '../../components/admin/AdminConfigPanel';
import LoadingScreen from '../../components/LoadingScreen';
import { useHydration } from '../../store/useNeuroState';

export default function AdminSettingsPage() {
  const [selected, setSelected] = useState('welcome');
  const [loading, setLoading] = useState(true);
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      setLoading(false);
    }
  }, [isHydrated]);

  if (!isHydrated || loading) {
    return <LoadingScreen message="Cargando configuración..." />;
  }

  return (
    <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto gap-8">
        {/* Sidebar: hidden on mobile, flex column on desktop */}
        <AdminSidebar 
          selected={selected} 
          onSelect={setSelected} 
        />
        
        {/* Main Content */}
        <div className="flex-1 w-full">
          <AdminConfigPanel selected={selected} />
        </div>
      </div>
    </div>
  );
} 