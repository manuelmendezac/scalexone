import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminConfigPanel from '../../components/admin/AdminConfigPanel';
import LoadingScreen from '../../components/LoadingScreen';
import { useHydration } from '../../store/useNeuroState';

export default function AdminSettingsPage() {
  const [selected, setSelected] = useState('welcome');
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isHydrated = useHydration();

  // Collapse sidebar on mobile by default
  useEffect(() => {
    const checkSize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

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
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <AdminConfigPanel selected={selected} />
      </main>
    </div>
  );
} 