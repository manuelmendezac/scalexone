import { useState } from 'react';
import CognitiveProfile from './CognitiveProfile';
import useNeuroState from '../store/useNeuroState';
import { BarChart2, Settings } from 'lucide-react';

const Header = () => {
  const [showProfile, setShowProfile] = useState(false);
  const { userName, avatarUrl } = useNeuroState();

  const navLinks = [
    { name: 'Clasificación', href: '/clasificacion', icon: <BarChart2 size={16} /> },
    { name: 'Configuración', href: '/admin/settings', icon: <Settings size={16} /> },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-neurolink-background/80 backdrop-blur-sm border-b border-neurolink-cyberBlue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/images/logoneuroclonhorizontal.svg" alt="Logo" className="h-10 w-auto object-contain" />
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-neurolink-coldWhite font-futuristic">
                {userName}
              </span>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400 shadow"
                  style={{ background: '#e5e7eb' }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center border-2 border-cyan-400">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2"/></svg>
                </div>
              )}
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="px-4 py-2 bg-neurolink-cyberBlue bg-opacity-10 text-neurolink-coldWhite font-futuristic border-2 border-neurolink-cyberBlue rounded-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
              >
                {showProfile ? 'Cerrar Perfil' : 'Perfil Cognitivo'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {showProfile && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-neurolink-background/90 backdrop-blur-sm">
          <div className="min-h-screen pt-20 pb-12">
            <CognitiveProfile />
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 