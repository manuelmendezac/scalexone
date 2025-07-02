import { useState } from 'react';
import MiembrosAdminPanel from './MiembrosAdminPanel';
import AdminSidebar from './admin/AdminSidebar';
import CommunitySettingsPanel from './admin/CommunitySettingsPanelFixed';
import CursosMarketplacePanel from './admin/CursosMarketplacePanel';
import MetodosCobroPanel from './finanzas/MetodosCobroPanel';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('community');

  return (
    <div className="flex w-full">
      <AdminSidebar selected={activeTab} onSelect={setActiveTab} />
      <div className="flex-1">
        {activeTab === 'miembros' && <MiembrosAdminPanel />}
        {activeTab === 'members' && <MiembrosAdminPanel />}
        {activeTab === 'community' && <CommunitySettingsPanel />}
        {activeTab === 'marketplace-cursos' && <CursosMarketplacePanel />}
        {activeTab === 'payments' && <MetodosCobroPanel />}
        {/* Render other components based on activeTab */}
      </div>
    </div>
  );
} 