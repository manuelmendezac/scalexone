import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Hero from './components/Hero'
import LeadForm from './components/LeadForm'
import AIConsole from './components/AIConsole'
import Header from './components/Header'
import KnowledgeMatrix from './components/KnowledgeMatrix'
import RoutineGenerator from './components/RoutineGenerator'
import CognitiveProfile from './components/CognitiveProfile'
import NeuroDash from './components/NeuroDash'
import SkillUploader from './components/SkillUploader'
import CognitiveDashboard from './components/CognitiveDashboard'
import EmbedGenerator from './components/EmbedGenerator'
import AfiliadosDashboard from './components/AfiliadosDashboard'
import AITrainerPanel from './components/AITrainerPanel'
import AISimulationRoom from './components/AISimulationRoom'
import PanelIA from './components/PanelIA'
import UploaderDocsIA from './components/UploaderDocsIA'
import KnowledgeAssistant from './components/KnowledgeAssistant'
import SelectorNicho from './components/SelectorNicho'
import Dashboard from './components/Dashboard'
import ThemeToggle from './components/ThemeToggle'
import useNeuroState, { useHydration } from './store/useNeuroState'
import PushNotificationManager from './components/PushNotificationManager'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import OnboardingModal from './components/OnboardingModal'
import WelcomeHero from './components/WelcomeHero'
import SmartOnboardingTour from './components/SmartOnboardingTour'
import OnboardingAssistant from './components/OnboardingAssistant'
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Topbar from './components/Topbar';
import SecondNavbar from './components/SecondNavbar';
import { BibliotecaProvider } from './context/BibliotecaContext';
import ModuloCardBibliotecaConocimiento from './components/ModuloCardBibliotecaConocimiento';
import ModuloCardConsejeroInteligente from './components/ModuloCardConsejeroInteligente';

// Definición de tipos para las vistas
type ViewType = 'inicio' | 'simulacion' | 'dashboard' | 'perfil' | 'configuracion' | 'panel' | 'uploader' | 'knowledge' | 'nicho' | 'modules' | 'train';

interface ViewConfig {
  id: ViewType;
  label: string;
  icon: string;
  component: React.ReactNode;
}

function App() {
  const isHydrated = useHydration();
  const { t } = useTranslation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const { avatarUrl, notifications, userName } = useNeuroState();
  // Estado para modo oscuro (puedes mejorarlo según tu lógica global)
  const [darkMode, setDarkMode] = useState(false);
  // Simulación de login (ajusta según tu lógica real)
  const isLoggedIn = userName !== 'Invitado';
  const location = useLocation();
  const hideMenu = location.pathname === '/login' || location.pathname === '/register';

  const handleThemeToggle = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    // Verificar si el onboarding ya se completó
    const onboardingCompleted = localStorage.getItem('neurolink_onboarding_completed') === 'true';
    setShowOnboarding(!onboardingCompleted);
  }, []);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    navigate('/dashboard/console');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen w-full bg-[#0a1a2f] flex items-center justify-center">
        <div className="text-gray-800 dark:text-neurolink-coldWhite font-futuristic text-xl">
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <BibliotecaProvider>
      <div className="min-h-screen w-full" style={{background: 'transparent'}}>
        {!hideMenu && (
          <>
            <Topbar
              userAvatar={avatarUrl}
              notificationsCount={notifications.length}
              onThemeToggle={handleThemeToggle}
              darkMode={darkMode}
              isLoggedIn={isLoggedIn}
            />
            <SecondNavbar />
          </>
        )}
        <main className={!hideMenu ? "pt-20 w-full flex flex-col items-center gap-12" : "w-full min-h-screen flex items-center justify-center"} style={{background: 'transparent'}}>
          <Outlet />
        </main>
      </div>
    </BibliotecaProvider>
  );
}

export default App
