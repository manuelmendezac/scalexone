import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ImplementarPanel from '../../components/ImplementarIA/ImplementarPanel';
import ChatInterfacePanel from '../../components/ImplementarIA/ChatInterfacePanel';
import SecurityPanel from '../../components/ImplementarIA/SecurityPanel';
import LeadsPanel from '../../components/ImplementarIA/LeadsPanel';
import NotificationsPanel from '../../components/ImplementarIA/NotificationsPanel';
import WebhooksPanel from '../../components/ImplementarIA/WebhooksPanel';
import CustomDomainsPanel from '../../components/ImplementarIA/CustomDomainsPanel';
import GeneralPanel from '../../components/ImplementarIA/GeneralPanel';

const SECCIONES = [
  { key: 'general', label: 'General', icon: '⚙️' },
  { key: 'ai', label: 'AI', icon: '✨' },
  { key: 'chat', label: 'Chat Interface', icon: '🖌️' },
  { key: 'security', label: 'Security', icon: '🛡️' },
  { key: 'leads', label: 'Leads', icon: '👥' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
  { key: 'webhooks', label: 'Webhooks', icon: '🔗' },
  { key: 'domains', label: 'Custom Domains', icon: '🌐' },
];

const PersonalizarAgente = () => {
  const { id } = useParams();
  const [seccion, setSeccion] = useState('general');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', minWidth: '100vw', background: '#fff' }}>
      {/* Menú lateral */}
      <aside style={{ width: 260, background: '#fff', borderRight: '1.5px solid #e0e7ef', padding: '2.5rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '100vh' }}>
        {SECCIONES.map(sec => (
          <button
            key={sec.key}
            onClick={() => setSeccion(sec.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '0.9rem 1.2rem',
              border: 'none', borderRadius: 12, background: seccion === sec.key ? '#ede9fe' : 'transparent',
              color: seccion === sec.key ? '#7c3aed' : '#222', fontWeight: 600, fontSize: '1.08rem', cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s', outline: 'none', marginBottom: 2
            }}
          >
            <span style={{ fontSize: 22 }}>{sec.icon}</span> {sec.label}
          </button>
        ))}
      </aside>
      {/* Panel de contenido */}
      <main style={{ flex: 1, padding: '2.5rem 3.5rem', minHeight: '100vh', background: '#fff' }}>
        {seccion === 'general' && <GeneralPanel />}
        {seccion === 'ai' && <ImplementarPanel />}
        {seccion === 'chat' && <ChatInterfacePanel />}
        {seccion === 'security' && <SecurityPanel />}
        {seccion === 'leads' && <LeadsPanel />}
        {seccion === 'notifications' && <NotificationsPanel />}
        {seccion === 'webhooks' && <WebhooksPanel />}
        {seccion === 'domains' && <CustomDomainsPanel />}
      </main>
    </div>
  );
};

export default PersonalizarAgente; 