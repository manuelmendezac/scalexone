import React, { useEffect, useState } from 'react';
import { useMenuSecundarioConfig } from '../hooks/useMenuSecundarioConfig';
import useNeuroState from '../store/useNeuroState';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, GraduationCap, BookOpen, Rocket, BarChart2, Settings } from 'lucide-react';

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

const ScrollNavbar: React.FC = () => {
  const { userInfo } = useNeuroState();
  const community_id = userInfo?.community_id || null;
  const { menuConfig, loading } = useMenuSecundarioConfig(community_id);
  const [mobile, setMobile] = useState(isMobile());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Elegir la barra según el dispositivo
  let menu: any[] = [];
  if (menuConfig && typeof menuConfig === 'object') {
    if (mobile && Array.isArray((menuConfig as any).barra_scroll_movil)) {
      menu = (menuConfig as any).barra_scroll_movil;
    } else if (!mobile && Array.isArray((menuConfig as any).barra_scroll_desktop)) {
      menu = (menuConfig as any).barra_scroll_desktop;
    }
  }

  // Fallback a un menú fijo si no hay config
  if (!menu || menu.length === 0) {
    menu = [
      { key: 'inicio', nombre: 'Inicio', ruta: '/home', icon: <Home size={16} />, visible: true },
      { key: 'clasificacion', nombre: 'Clasificación', ruta: '/clasificacion', icon: <BarChart2 size={16} />, visible: true },
      { key: 'classroom', nombre: 'Classroom', ruta: '/classroom', icon: <GraduationCap size={16} />, visible: true },
      { key: 'cursos', nombre: 'Cursos', ruta: '/cursos', icon: <BookOpen size={16} />, visible: true },
      { key: 'launchpad', nombre: 'Launchpad', ruta: '/launchpad', icon: <Rocket size={16} />, visible: true },
      { key: 'comunidad', nombre: 'Comunidad', ruta: '/comunidad', icon: <Users size={16} />, visible: true },
      { key: 'embudos', nombre: 'Embudos', ruta: '/funnels', icon: '🫧', visible: true },
      { key: 'ia', nombre: 'IA', ruta: '/ia', icon: '🤖', visible: true },
      { key: 'automatizaciones', nombre: 'Automatizaciones', ruta: '/automatizaciones', icon: '⚙️', visible: true },
      { key: 'whatsappcrm', nombre: 'WhatsApp CRM', ruta: '/whatsapp-crm', icon: '💬', visible: true },
      { key: 'configuracion', nombre: 'Configuración', ruta: '/configuracion-admin', icon: <Settings size={16} />, visible: true },
    ];
  }

  if (loading) return null;

  // Forzar la ruta correcta para Configuración antes de renderizar
  const finalMenu = menu.map(item => {
    if (item.key === 'configuracion') {
      return { ...item, ruta: '/configuracion-admin' };
    }
    return item;
  });

  return (
    <nav className="w-full px-2 py-2 bg-transparent border-b border-[#23283a] overflow-x-auto whitespace-nowrap" style={{ zIndex: 49 }}>
      <div className="flex justify-center min-w-full w-fit mx-auto gap-2">
        {finalMenu.filter(item => item && item.visible !== false).map((item: any) => (
          <button
            key={item.key}
            onClick={() => navigate(item.ruta || item.to)}
            className={`relative px-2 md:px-3 py-1 text-xs md:text-sm font-medium transition-colors
              ${location.pathname.startsWith(item.ruta || item.to)
                ? 'text-cyan-300'
                : 'text-[#b0c4d8] hover:text-cyan-200'}
            `}
            style={{ background: 'none', border: 'none', outline: 'none' }}
          >
            <span>{item.icon || item.icono || ''}</span> <span>{item.nombre || item.label}</span>
            {(location.pathname.startsWith(item.ruta || item.to)) && (
              <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-cyan-400 rounded-full animate-fadein-sci-fi" style={{transition:'all 0.2s'}} />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default ScrollNavbar; 