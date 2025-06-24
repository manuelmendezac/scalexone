import React from 'react';
import { FaBrain } from 'react-icons/fa';
import { FiBookOpen, FiGlobe, FiUsers } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

const access = [
  // { label: 'Mi Segundo Cerebro', icon: <FaBrain />, to: '/mind-sync', color: 'from-cyan-700 to-cyan-400' },
  // { label: 'Centro de Entrenamiento', icon: <FiBookOpen />, to: '/knowledge-vault', color: 'from-purple-700 to-cyan-400' },
  { label: 'Implementar mi IA', icon: <FiGlobe />, to: '/embed-js', color: 'from-yellow-700 to-yellow-500' },
  { label: 'Dashboard de Afiliación', icon: <FiUsers />, to: '/afiliados', color: 'from-yellow-800 to-yellow-600' },
];

const QuickAccess: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {access.map((a) => (
      <NavLink
        key={a.label}
        to={a.to}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center bg-gradient-to-br ${a.color} rounded-xl p-6 shadow-lg hover:scale-105 transition group` +
          (isActive ? ' ring-2 ring-yellow-400' : '')
        }
      >
        <div className="text-3xl mb-2 text-yellow-300 group-hover:text-yellow-200 transition" style={{ textShadow: '0 2px 8px #FFD70099' }}>{a.icon}</div>
        <div className="text-lg font-bold text-yellow-200 group-hover:text-yellow-100 transition text-center" style={{ textShadow: '0 2px 8px #FFD70099' }}>{a.label}</div>
      </NavLink>
    ))}
  </div>
);

export default QuickAccess; 