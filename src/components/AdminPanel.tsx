import { useState } from 'react';
import MiembrosAdminPanel from './MiembrosAdminPanel';
import AdminSidebar from './admin/AdminSidebar';
import CommunitySettingsPanel from './admin/CommunitySettingsPanel';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('community');

  return (
    <div className="flex w-full">
      <AdminSidebar selected={activeTab} onSelect={setActiveTab} />
      <div className="flex-1">
        {activeTab === 'miembros' && <MiembrosAdminPanel />}
        {activeTab === 'members' && <MiembrosAdminPanel />}
        {activeTab === 'community' && <CommunitySettingsPanel />}
        {/* Render other components based on activeTab */}
      </div>
    </div>
  );
} 