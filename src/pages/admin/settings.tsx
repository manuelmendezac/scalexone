import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminConfigPanel from '../../components/admin/AdminConfigPanel';
import LoadingScreen from '../../components/LoadingScreen';
import { useHydration } from '../../store/useNeuroState';
import { useMediaQuery } from 'react-responsive';

export default function AdminSettingsPage() {
  const [selected, setSelected] = useState('welcome');
  const [loading, setLoading] = useState(true);
  const isHydrated = useHydration();

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);
  
  useEffect(() => {
    if (isHydrated) {
      setLoading(false);
    }
  }, [isHydrated]);

  if (!isHydrated || loading) {
    return <LoadingScreen message="Cargando configuración..." />;
  }

  return (
    <div className="flex min-h-screen bg-black">
      <AdminSidebar 
        selected={selected} 
        onSelect={setSelected} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <AdminConfigPanel selected={selected} />
      </div>
    </div>
  );
} 