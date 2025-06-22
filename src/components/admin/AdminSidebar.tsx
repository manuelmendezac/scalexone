import React from 'react';
import { Home, Settings, BarChart2, Tv, Users, Calendar, MessageSquare, Briefcase, DollarSign, List, CreditCard, Activity, X } from 'lucide-react';

interface AdminSidebarProps {
  selected: string;
  onSelect: (key: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
    { key: 'welcome', label: 'Bienvenida', icon: <Home size={20} /> },
    { key: 'community', label: 'Comunidad', icon: <Users size={20} /> },
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

const AdminSidebar: React.FC<AdminSidebarProps> = ({ selected, onSelect, isOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile view */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose}></div>}

      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-gray-900 p-4
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-transform duration-300 ease-in-out 
        z-40
        lg:relative lg:translate-x-0 lg:w-64 lg:h-auto lg:bg-transparent lg:p-0
      `}>
        {/* Panel de Administración */}
        <div className="bg-gray-900/50 rounded-lg p-4 h-full flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
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
    </>
  );
};

export default AdminSidebar; 