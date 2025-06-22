import React from 'react';
import { Home, Settings, BarChart2, Tv, Users, Calendar, MessageSquare, Briefcase, DollarSign, List, CreditCard, Activity, ChevronsLeft, ChevronsRight } from 'lucide-react';

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
    <aside className={`fixed top-0 left-0 h-full bg-black text-white flex flex-col transition-all duration-300 z-50 border-r border-gray-800 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-center p-4 h-20 border-b border-gray-800">
        {!isCollapsed && <h1 className="text-xl font-bold text-yellow-500 whitespace-nowrap">Panel Admin</h1>}
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map(item => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            title={item.label}
            className={`w-full flex items-center p-3 rounded-md transition-colors text-left
              ${selected === item.key 
                ? 'bg-yellow-500 text-black font-bold' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }
              ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            {item.icon}
            {!isCollapsed && <span className="ml-3">{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className="p-2 border-t border-gray-800">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="w-full flex items-center justify-center p-3 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar; 