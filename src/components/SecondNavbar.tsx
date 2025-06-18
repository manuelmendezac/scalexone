import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBarChart2, FiUser } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import { MdOutlineSchool } from 'react-icons/md';
import { useMenuSecundarioConfig } from '../hooks/useMenuSecundarioConfig';
import useNeuroState from '../store/useNeuroState';

const SecondNavbar: React.FC = () => {
  const { userInfo } = useNeuroState();
  const community_id = userInfo?.community_id || null;
  const { menuConfig, loading } = useMenuSecundarioConfig(community_id);

  const defaultMenu = [
    { key: 'inicio', label: 'Inicio', to: '/home', visible: true },
    { key: 'clasificacion', label: 'Clasificación', to: '/clasificacion', visible: true },
    { key: 'classroom', label: 'Classroom', to: '/classroom', visible: true },
    { key: 'cursos', label: 'Cursos', to: '/cursos', visible: true },
    { key: 'launchpad', label: 'Launchpad', to: '/launchpad', visible: true },
    { key: 'comunidad', label: 'Comunidad', to: '/comunidad', visible: true },
    { key: 'embudos', label: 'Embudos', to: '/funnels', visible: true },
    { key: 'ia', label: 'IA', to: '/ia', visible: true },
    { key: 'automatizaciones', label: 'Automatizaciones', to: '/automatizaciones', visible: true },
    { key: 'whatsappcrm', label: 'WhatsApp CRM', to: '/whatsapp-crm', visible: true },
    { key: 'configuracion', label: 'Configuración', to: '/configuracion', visible: true },
  ];

  // Si hay config personalizada, usarla, si no, usar default
  const menu = menuConfig || defaultMenu;

  if (loading) return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 border-t border-cyan-900 flex md:hidden" style={{ background: '#000' }}>
      <ul className="flex justify-between items-center w-full px-1 py-1">
        {menu.filter(item => item.visible).map((item) => (
          <li key={item.key} className="flex-1 flex flex-col items-center">
            <NavLink
              to={item.to || item.ruta}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full py-1 transition font-semibold text-xs ${isActive ? 'text-cyan-300' : 'text-white'}`
              }
            >
              <span>{item.icon || null}</span>
              <span className="text-[11px] mt-0.5">{item.nombre || item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SecondNavbar; 