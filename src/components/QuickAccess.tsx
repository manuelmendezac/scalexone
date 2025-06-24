import React from 'react';
import { FaBrain } from 'react-icons/fa';
import { FiBookOpen, FiGlobe, FiUsers } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

interface AccessItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  color: string;
}

const access: AccessItem[] = [];

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