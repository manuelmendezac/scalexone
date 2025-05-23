import React from 'react';
import './TabsMenu.css';

const tabs = [
  { key: 'playground', label: 'Playground' },
  { key: 'actividad', label: 'Actividad' },
  { key: 'metricas', label: 'Métricas' },
  { key: 'fuentes', label: 'Fuentes' },
  { key: 'personalizacion', label: 'Personalización' },
  { key: 'conectar', label: 'Conectar' },
  { key: 'configuracion', label: 'Configuración' },
];

interface TabsMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabsMenu: React.FC<TabsMenuProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="ia-tabs-menu">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`ia-tab-btn${activeTab === tab.key ? ' active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default TabsMenu; 