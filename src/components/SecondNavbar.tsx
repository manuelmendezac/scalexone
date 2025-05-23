import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart2, FiUser, FiSettings, FiGlobe } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import { MdOutlineSchool } from 'react-icons/md';

const menu = [
  {
    label: 'Inicio',
    icon: <FiHome />,
    to: '/home',
    description: 'Bienvenido de vuelta',
    tips: true,
  },
  {
    label: 'Dashboard',
    icon: <FiBarChart2 />,
    to: '/dashboard',
  },
  {
    label: 'Mi Segundo Cerebro',
    icon: <FaBrain />,
    to: '/segundo-cerebro',
  },
  {
    label: 'Centro de Entrenamiento',
    icon: <MdOutlineSchool />,
    to: '/centro-entrenamiento',
  },
  {
    label: 'Implementar Mi IA',
    icon: <FiGlobe />,
    to: '/implementar-ia',
    description: 'Despliega y gestiona tu clon IA',
  },
  {
    label: 'Configuración',
    icon: <FiSettings />,
    to: '/configuracion',
  },
];

const SecondNavbar: React.FC = () => {
  return (
    <nav className="w-full bg-gray-900 text-white font-orbitron px-2 py-1 flex flex-wrap items-center shadow z-40 border-b border-cyan-900">
      <ul className="flex flex-wrap items-center gap-2 w-full justify-center md:justify-start">
        {menu.map((item) => (
          <li key={item.label} className="relative group">
            <NavLink
              to={item.to!}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 hover:bg-cyan-900/30 transition font-semibold border border-transparent hover:border-cyan-400 ${isActive ? 'bg-cyan-900/60 text-cyan-300' : 'text-white'}`
              }
            >
              <span className="text-cyan-400">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SecondNavbar; 