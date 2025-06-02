import React from 'react';
import { FaBrain } from 'react-icons/fa';
import { FiBookOpen, FiGlobe, FiUsers } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

const access = [
  // { label: 'Mi Segundo Cerebro', icon: <FaBrain />, to: '/mind-sync', color: 'from-cyan-700 to-cyan-400' },
  // { label: 'Centro de Entrenamiento', icon: <FiBookOpen />, to: '/knowledge-vault', color: 'from-purple-700 to-cyan-400' },
  { label: 'Implementar mi IA', icon: <FiGlobe />, to: '/embed-js', color: 'from-pink-700 to-cyan-400' },
  { label: 'Dashboard de Afiliación', icon: <FiUsers />, to: '/afiliados', color: 'from-yellow-700 to-cyan-400' },
];

const QuickAccess: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {access.map((a) => (
      <NavLink
        key={a.label}
        to={a.to}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center bg-gradient-to-br ${a.color} rounded-xl p-6 shadow-lg hover:scale-105 hover:shadow-cyan-400/40 transition group` +
          (isActive ? ' ring-2 ring-cyan-400' : '')
        }
      >
        <div className="text-3xl mb-2 text-white group-hover:text-cyan-200 transition">{a.icon}</div>
        <div className="text-lg font-bold text-white group-hover:text-cyan-100 transition text-center">{a.label}</div>
      </NavLink>
    ))}
  </div>
);

export default QuickAccess; 