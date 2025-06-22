import React from 'react';
import { Home, Settings, BarChart2, Tv, Users, Calendar, MessageSquare, Briefcase, DollarSign, List, CreditCard, Activity } from 'lucide-react';
import { X } from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose, selected, onSelect }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out z-50 
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                   lg:translate-x-0 lg:bg-black lg:border-r lg:border-gray-800`}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-800">
          <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>
          <button onClick={onClose} className="lg:hidden text-white hover:text-yellow-500">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                onSelect(item.key);
                onClose(); // Close sidebar on selection in mobile
              }}
              className={`w-full flex items-center p-3 rounded-md transition-colors text-left
                ${selected === item.key 
                  ? 'bg-yellow-500 text-black font-bold' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <div className="mr-3">{item.icon}</div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar; 