import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminConfigPanel from '../../components/admin/AdminConfigPanel';

export default function AdminSettingsPage() {
  const [selected, setSelected] = useState('welcome');
  return (
    <div className="flex min-h-screen">
      <AdminSidebar selected={selected} onSelect={setSelected} />
      <AdminConfigPanel selected={selected} />
    </div>
  );
} 