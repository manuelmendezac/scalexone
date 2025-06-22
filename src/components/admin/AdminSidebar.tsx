import React from 'react';
import { Home, Settings, BarChart2, Tv, Users, Calendar, MessageSquare, Briefcase, DollarSign, List, CreditCard, Activity, Link, Key, Shield, User, Zap } from 'lucide-react';

interface AdminSidebarProps {
  selected: string;
  onSelect: (key: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const menuItems = [
  { key: 'welcome', label: 'Bienvenida', icon: <Home size={20} /> },
  { key: 'mainMenu', label: 'Menú Principal', icon: <Settings size={20} /> },
  { key: 'levels', label: 'Niveles', icon: <BarChart2 size={20} /> },
  { key: 'channels', label: 'Canales', icon: <Tv size={20} /> },
  { key: 'members', label: 'Miembros', icon: <Users size={20} /> },
  { key: 'events', label: 'Eventos', icon: <Calendar size={20} /> },
  { key: 'chats', label: 'Chats', icon: <MessageSquare size={20} /> },
  { key: 'affiliates', label: 'Afiliados', icon: <Briefcase size={20} /> },
  { key: 'payments', label: 'Métodos de Cobro', icon: <DollarSign size={20} /> },
  { key: 'salesHistory', label: 'Historial de Ventas', icon: <List size={20} /> },
  { key: 'transactions', label: 'Transacciones', icon: <CreditCard size={20} /> },
  { key: 'cryptoTransactions', label: 'Transacciones Crypto', icon: <Activity size={20} /> },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ selected, onSelect, isCollapsed, setIsCollapsed }) => {
  return (
    <div className={`fixed top-0 left-0 h-full bg-black border-r border-gray-800 text-white flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 h-20 border-b border-gray-800">
        {!isCollapsed && <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-white hover:text-yellow-500">
          {isCollapsed ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
        </button>
      </div>
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${selected === item.key ? 'bg-yellow-500 text-black' : 'hover:bg-gray-800'}`}
          >
            {item.icon}
            {!isCollapsed && <span className="ml-4 font-semibold">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar; 