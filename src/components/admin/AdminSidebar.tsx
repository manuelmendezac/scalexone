import React from 'react';
import { Home, Settings, BarChart2, Tv, Users, Calendar, MessageSquare, Briefcase, DollarSign, List, CreditCard, Activity, Menu, Image, Wallet, UserCheck, ShoppingBag } from 'lucide-react';

interface AdminSidebarProps {
  selected: string;
  onSelect: (key: string) => void;
}

export const menuItems = [
    { key: 'welcome', label: 'Bienvenida', icon: <Home size={20} />, section: 'general' },
    { key: 'banners', label: 'Banners', icon: <Image size={20} />, section: 'general' },
    { key: 'community', label: 'Comunidad', icon: <Users size={20} />, section: 'general' },
    { key: 'mainMenu', label: 'Menú Principal', icon: <Menu size={20} />, section: 'general' },
    { key: 'levels', label: 'Niveles', icon: <BarChart2 size={20} />, section: 'general' },
    { key: 'channels', label: 'Canales', icon: <Tv size={20} />, section: 'general' },
    { key: 'members', label: 'Miembros', icon: <Users size={20} />, section: 'general' },
    { key: 'events', label: 'Eventos', icon: <Calendar size={20} />, section: 'general' },
    { key: 'chats', label: 'Chats', icon: <MessageSquare size={20} />, section: 'general' },
    { key: 'affiliates', label: 'Afiliados', icon: <Briefcase size={20} />, section: 'general' },
    { key: 'marketplace-cursos', label: 'Cursos Marketplace', icon: <ShoppingBag size={20} />, section: 'contenido' },
    { key: 'marketplace-servicios', label: 'Servicios Marketplace', icon: <Briefcase size={20} />, section: 'contenido' },
    { key: 'subscriptions', label: 'Suscripciones', icon: <UserCheck size={20} />, section: 'finanzas' },
    { key: 'payments', label: 'Métodos de Cobro', icon: <DollarSign size={20} />, section: 'finanzas' },
    { key: 'salesHistory', label: 'Historial de Ventas', icon: <List size={20} />, section: 'finanzas' },
    { key: 'transactions', label: 'Transacciones', icon: <CreditCard size={20} />, section: 'finanzas' },
    { key: 'cryptoTransactions', label: 'Transacciones Crypto', icon: <Activity size={20} />, section: 'finanzas' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ selected, onSelect }) => {
  const generalItems = menuItems.filter(item => item.section === 'general' && item.key !== 'banners');
  const contenidoItems = menuItems.filter(item => item.section === 'contenido');
  const finanzasItems = menuItems.filter(item => item.section === 'finanzas');

  return (
    <aside className="hidden lg:flex flex-col w-64 self-start top-8">
      <div className="bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-yellow-500">Panel Admin</h1>
        </div>
        <nav className="flex-1 space-y-1">
          {/* Sección General */}
          {generalItems.map(item => (
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
          
          {/* Separador y título de Contenido */}
          <div className="pt-4 mt-4 border-t border-gray-700">
            <div className="flex items-center mb-3">
              <ShoppingBag className="w-5 h-5 text-cyan-400 mr-2" />
              <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">Contenido</h2>
            </div>
            
            {/* Sección Contenido */}
            {contenidoItems.map(item => (
              <button
                key={item.key}
                onClick={() => onSelect(item.key)}
                className={`w-full flex items-center p-3 rounded-md transition-colors text-left mb-1
                  ${selected === item.key 
                    ? 'bg-cyan-500 text-black font-bold' 
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`
                }
              >
                <div className="mr-3">{item.icon}</div>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          
          {/* Separador y título de Finanzas */}
          <div className="pt-4 mt-4 border-t border-gray-700">
            <div className="flex items-center mb-3">
              <Wallet className="w-5 h-5 text-yellow-400 mr-2" />
              <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">Finanzas</h2>
            </div>
            
            {/* Sección Finanzas */}
            {finanzasItems.map(item => (
              <button
                key={item.key}
                onClick={() => onSelect(item.key)}
                className={`w-full flex items-center p-3 rounded-md transition-colors text-left mb-1
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
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar; 