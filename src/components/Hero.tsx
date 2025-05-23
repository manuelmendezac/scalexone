import { useEffect, useState } from 'react';
import WelcomeOnboarding from './WelcomeOnboarding';
import WelcomePortalOnboarding from './WelcomePortalOnboarding';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPortalOnboarding, setShowPortalOnboarding] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Mostrar onboarding solo si no está completado
    const done = localStorage.getItem('neurolink_welcome_onboarding') !== 'true';
    setShowOnboarding(done);
    // Mostrar portal onboarding solo si no se ha visto en la sesión
    const seenPortal = sessionStorage.getItem('neurolink_portal_onboarding') !== 'true';
    setShowPortalOnboarding(seenPortal);
  }, []);

  return (
    <div className="min-h-screen bg-neurolink-background flex flex-col items-center justify-center px-4">
      <div className={`text-center space-y-8 transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h1 className="text-5xl md:text-7xl font-futuristic font-bold text-neurolink-cyberBlue tracking-wider">
          NeuroLink AI 🧠⚡
        </h1>
        {/* Onboarding visual portal solo si no se ha visto en la sesión */}
        {showPortalOnboarding && (
          <div className="hidden md:block">
            <WelcomePortalOnboarding />
          </div>
        )}
        {/* Onboarding solo en desktop y si no está completado */}
        {showOnboarding && !showPortalOnboarding && (
          <div className="hidden md:block">
            <WelcomeOnboarding />
          </div>
        )}
        <p className="text-xl md:text-2xl font-futuristic text-neurolink-coldWhite max-w-2xl mx-auto">
          Tu puerta al futuro con inteligencia artificial
        </p>
        <button 
          className="mt-8 px-8 py-4 text-lg font-futuristic text-neurolink-coldWhite 
                     border-2 border-neurolink-neonPink rounded-lg
                     hover:bg-neurolink-neonPink hover:bg-opacity-10
                     transition-all duration-300 transform hover:scale-105
                     focus:outline-none focus:ring-2 focus:ring-neurolink-neonPink focus:ring-opacity-50"
        >
          Explorar la Plataforma
        </button>
      </div>
    </div>
  );
};

export default Hero; 