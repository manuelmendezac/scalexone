import React from 'react';
import { Home, Settings, BarChart2, Tv, Users, Calendar, MessageSquare, Briefcase, DollarSign, List, CreditCard, Activity } from 'lucide-react';

interface AdminSidebarProps {
  selected: string;
  onSelect: (key: string) => void;
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

const AdminSidebar: React.FC<AdminSidebarProps> = ({ selected, onSelect }) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 self-start top-8">
      <div className="bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>
        </div>
        <nav className="flex-1 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`w-full flex items-center p-3 rounded-md transition-colors text-left
                ${selected === item.key 
                  ? 'bg-yellow-500 text-black font-bold' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
                }`
              }
            >
              <div className="mr-3">{item.icon}</div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar; 