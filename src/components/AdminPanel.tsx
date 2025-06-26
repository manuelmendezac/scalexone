import { useState } from 'react';
import MiembrosAdminPanel from './MiembrosAdminPanel';
import AdminSidebar from './admin/AdminSidebar';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('miembros');

  return (
    <div className="flex">
      <AdminSidebar selected={activeTab} onSelect={setActiveTab} />
      <div className="flex-1">
        {activeTab === 'miembros' && <MiembrosAdminPanel />}
        {/* Render other components based on activeTab */}
      </div>
    </div>
  );
} 