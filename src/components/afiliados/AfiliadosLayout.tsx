import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const menuItems = [
    { name: 'Panel de Control', icon: HomeIcon, path: '/afiliados' },
    { name: 'Informe IB', icon: ChartBarIcon, path: '/afiliados/informe' },
    { name: 'Multinivel IB', icon: UserGroupIcon, path: '/afiliados/multinivel' },
    { name: 'Cuentas IB', icon: UserGroupIcon, path: '/afiliados/cuentas' },
    { name: 'Historial', icon: ClockIcon, path: '/afiliados/historial' },
    { name: 'Perfil', icon: UserIcon, path: '/afiliados/perfil' },
    { name: 'Enlaces de Referencia', icon: LinkIcon, path: '/afiliados/enlaces' },
    { name: 'Contáctenos', icon: PhoneIcon, path: '/afiliados/contacto' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Portal IB</h2>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center px-4 py-3 text-gray-100 hover:bg-blue-700"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">Portal de Afiliados</h1>
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AfiliadosLayout; 