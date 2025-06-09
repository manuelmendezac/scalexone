import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  LinkIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

interface AfiliadosLayoutProps {
  children: React.ReactNode;
}

const AfiliadosLayout: React.FC<AfiliadosLayoutProps> = ({ children }) => {
  const [isClientMode, setIsClientMode] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Panel de Control', icon: HomeIcon, path: '/afiliados' },
    { name: 'Comisiones Marca Blanca', icon: ChartBarIcon, path: '/afiliados/ib-marca-blanca' },
    { name: 'Comisiones ScalexOne', icon: ChartBarIcon, path: '/afiliados/ib-scalexone' },
    { name: 'Multinivel IB', icon: UserGroupIcon, path: '/afiliados/multinivel' },
    { name: 'Cuentas IB', icon: UserGroupIcon, path: '/afiliados/cuentas' },
    { name: 'Historial', icon: ClockIcon, path: '/afiliados/historial' },
    { name: 'Perfil', icon: UserIcon, path: '/afiliados/perfil' },
    { name: 'Enlaces de Referencia', icon: LinkIcon, path: '/afiliados/enlaces' },
    { name: 'Contáctenos', icon: PhoneIcon, path: '/afiliados/contacto' },
  ];

  return (
    <div className="flex h-screen bg-[#f7f9fb]">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white flex flex-col shadow-lg">
        <div className="p-6 border-b border-blue-700">
          <h2 className="text-2xl font-bold font-orbitron tracking-wide">Portal IB</h2>
        </div>
        <nav className="mt-4 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-5 py-3 my-1 rounded-lg font-semibold transition-all
                  ${isActive ? 'bg-white text-blue-800 shadow border-l-4 border-blue-400' : 'hover:bg-blue-700 text-gray-100'}`}
                style={{ fontFamily: 'Orbitron, Inter, Arial, sans-serif' }}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-blue-200'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f7f9fb]">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-900 font-orbitron tracking-wide">Comisiones de Afiliados</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Client/IB Switch */}
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-600">Cliente</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isClientMode}
                    onChange={() => setIsClientMode(!isClientMode)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="ml-2 text-sm text-gray-600">IB</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f7f9fb] p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AfiliadosLayout; 