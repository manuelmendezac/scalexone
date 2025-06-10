import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  LinkIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import SwitchClienteIB from '../SwitchClienteIB';

interface AfiliadosLayoutProps {
  children: React.ReactNode;
}

const AfiliadosLayout: React.FC<AfiliadosLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mode = location.pathname.startsWith('/afiliados') ? 'IB' : 'Client';
  const handleSwitch = (newMode: 'Client' | 'IB') => {
    if (newMode === 'Client') {
      navigate('/home');
    }
  };

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

  // Menú inferior para móvil
  const mobileMenu = [
    menuItems[0], // Panel de Control
    menuItems[2], // Comisiones ScalexOne
    menuItems[3], // Multinivel IB
    menuItems[6], // Perfil
    menuItems[8], // Contacto
  ];

  return (
    <div className="flex h-screen bg-[#f7f9fb]">
      {/* Sidebar escritorio */}
      <div className="w-64 bg-blue-800 text-white flex-col shadow-lg hidden md:flex">
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

      {/* Drawer móvil */}
      <>
        {/* Botón hamburguesa solo en móvil */}
        <button
          className="fixed top-4 left-4 z-50 bg-blue-800 text-white p-2 rounded-full shadow-lg md:hidden"
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menú"
        >
          <Bars3Icon className="w-7 h-7" />
        </button>
        {/* Drawer lateral */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Fondo oscuro */}
            <div className="fixed inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            {/* Menú lateral */}
            <div className="relative w-64 h-full bg-blue-800 text-white flex flex-col shadow-lg animate-slide-in-left">
              <button
                className="absolute top-4 right-4 text-white p-1 rounded-full hover:bg-blue-700"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
              >
                <XMarkIcon className="w-7 h-7" />
              </button>
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
                      onClick={() => setDrawerOpen(false)}
                    >
                      <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-blue-200'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f7f9fb]">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-2 md:px-8 md:py-4">
            <div className="flex items-center">
              <h1 className="text-lg md:text-2xl font-bold text-blue-900 font-orbitron tracking-wide">Comisiones de Afiliados</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Client/IB Switch */}
              <SwitchClienteIB mode={mode} onChange={handleSwitch} size="md" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f7f9fb] p-3 md:p-8">
          {children}
        </main>

        {/* Menú inferior móvil */}
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-blue-800 border-t border-blue-900 flex md:hidden">
          <ul className="flex justify-between items-center w-full px-1 py-1">
            {mobileMenu.map((item) => (
              <li key={item.name} className="flex-1 flex flex-col items-center">
                <Link
                  to={item.path}
                  className={`flex flex-col items-center justify-center w-full py-1 transition font-semibold text-xs ${location.pathname === item.path ? 'text-blue-300' : 'text-white'}`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-[11px] mt-0.5">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AfiliadosLayout; 