import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart2, FiUser } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import { MdOutlineSchool } from 'react-icons/md';

const menu = [
  {
    label: 'Inicio',
    icon: <FiHome size={24} />,
    to: '/home',
  },
  {
    label: 'Clasificación',
    icon: <FiBarChart2 size={24} />,
    to: '/clasificacion',
  },
  {
    label: 'Classroom',
    icon: <MdOutlineSchool size={24} />,
    to: '/classroom',
  },
  {
    label: 'Launchpad',
    icon: <FaBrain size={24} />,
    to: '/launchpad',
  },
  {
    label: 'Comunidad',
    icon: <FiUser size={24} />,
    to: '/comunidad',
  },
  {
    label: 'Perfil',
    icon: <FiUser size={24} />,
    to: '/perfil',
  },
];

const SecondNavbar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-gray-900 border-t border-cyan-900 flex md:hidden">
      <ul className="flex justify-between items-center w-full px-1 py-1">
        {menu.map((item) => (
          <li key={item.label} className="flex-1 flex flex-col items-center">
            <NavLink
              to={item.to!}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full py-1 transition font-semibold text-xs ${isActive ? 'text-cyan-300' : 'text-white'}`
              }
            >
              <span>{item.icon}</span>
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SecondNavbar; 