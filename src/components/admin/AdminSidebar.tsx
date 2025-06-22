import React from 'react';
import { motion } from 'framer-motion';
import { Home, Settings, BarChart2, Tv, Users, Calendar, MessageSquare, Briefcase, DollarSign, List, CreditCard, Activity, ChevronLeft } from 'lucide-react';

interface AdminSidebarProps {
  selected: string;
  onSelect: (key: string) => void;
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
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

const sidebarVariants = {
  open: { width: 288, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  collapsed: { width: 80, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ selected, onSelect, isOpen, isCollapsed, onToggle }) => {
  if (!isOpen) return null;

  return (
    <motion.aside
      variants={sidebarVariants}
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'open'}
      className="bg-gray-900/50 rounded-lg p-4 flex-shrink-0 relative hidden lg:flex flex-col"
    >
      <button 
        onClick={onToggle} 
        className="absolute top-4 -right-3 w-7 h-7 bg-gray-800 hover:bg-yellow-500 text-white hover:text-black rounded-full flex items-center justify-center transition-all z-10"
      >
        <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }}>
          <ChevronLeft size={20} />
        </motion.div>
      </button>

      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
        {!isCollapsed && <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>}
      </div>
      <nav className="flex-1 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`w-full flex items-center p-3 rounded-md transition-colors text-left
              ${selected === item.key 
                ? 'bg-yellow-500 text-black font-bold' 
                : 'bg-transparent text-white hover:bg-gray-700'
              }
              ${isCollapsed ? 'justify-center' : ''}`
            }
            title={isCollapsed ? item.label : ''}
          >
            <div className={!isCollapsed ? 'mr-3' : ''}>{item.icon}</div>
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </motion.aside>
  );
};

export default AdminSidebar; 