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
    <div className="flex min-h-screen bg-black">
      <AdminSidebar selected={selected} onSelect={setSelected} />
      <AdminConfigPanel selected={selected} />
    </div>
  );
} 