import { useState } from 'react';
import MiembrosAdminPanel from './MiembrosAdminPanel';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('miembros');

  return (
    <div>
      <button onClick={() => setActiveTab('miembros')}>Miembros</button>
      {/* Otros botones */}

      {activeTab === 'miembros' && <MiembrosAdminPanel />}
      {/* Renderiza otros componentes según la pestaña activa */}
    </div>
  );
} 