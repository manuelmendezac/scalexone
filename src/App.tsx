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
import { supabase } from './supabase';
import { MdFilterAlt } from 'react-icons/md';
import { FaRobot, FaWhatsapp } from 'react-icons/fa';
import { FiZap, FiSettings } from 'react-icons/fi';

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
  const { avatarUrl, notifications, userName, setHydrated, setMessages, setNotifications, setUserName, updateUserInfo } = useNeuroState();
  // Estado para modo oscuro (puedes mejorarlo según tu lógica global)
  const [darkMode, setDarkMode] = useState(false);
  // Simulación de login (ajusta según tu lógica real)
  const isLoggedIn = userName !== 'Invitado';
  const location = useLocation();
  const hideMenu = location.pathname === '/' || location.pathname === '/registro';
  const isLaunchpad = location.pathname === '/launchpad';

  // LOGS TEMPORALES PARA DEPURACIÓN
  console.log('isHydrated:', isHydrated);
  console.log('userName:', userName);
  console.log('location:', location.pathname);

  const handleThemeToggle = () => setDarkMode((prev) => !prev);

  useEffect(() => {
    // Verificar si el onboarding ya se completó
    const onboardingCompleted = localStorage.getItem('neurolink_onboarding_completed') === 'true';
    setShowOnboarding(!onboardingCompleted);
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Evitamos actualizar el estado global y redirigir si estamos en el flujo de recuperación de contraseña
      const isRecoveryFlow =
        window.location.pathname === '/reset-password' ||
        window.location.hash.includes('access_token=') ||
        window.location.hash.includes('type=recovery');

      if (session && session.user && !isRecoveryFlow) {
        setUserName(session.user.user_metadata?.nombre || session.user.email || 'Usuario');
        updateUserInfo({
          name: session.user.user_metadata?.nombre || '',
          email: session.user.email || '',
        });
        // Solo redirige si estás en login o registro
        if (
          window.location.pathname === '/' ||
          window.location.pathname === '/registro'
        ) {
          window.location.href = '/home';
        }
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [setUserName, updateUserInfo]);

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
        {/* Mostrar menú solo si está logueado, no en launchpad ni en rutas públicas */}
        {!hideMenu && isLoggedIn && (
          <>
            <Topbar
              userAvatar={avatarUrl}
              notificationsCount={notifications.length}
              onThemeToggle={handleThemeToggle}
              darkMode={darkMode}
              isLoggedIn={isLoggedIn}
            />
            {/* Barra de accesos directos tipo cápsula solo en móvil, ahora en dos líneas */}
            <div className="flex flex-col gap-1 px-2 py-2 bg-transparent md:hidden w-full">
              <div className="flex gap-2 w-full overflow-x-auto">
                <button onClick={() => navigate('/funnels')} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-700 to-blue-700 text-white font-semibold shadow hover:from-cyan-600 hover:to-blue-600 transition whitespace-nowrap">
                  <MdFilterAlt className="w-5 h-5" /> <span className="text-xs font-bold">Embudos</span>
                </button>
                <button onClick={() => navigate('/ia')} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-700 to-pink-600 text-white font-semibold shadow hover:from-fuchsia-600 hover:to-pink-500 transition whitespace-nowrap">
                  <FaRobot className="w-5 h-5" /> <span className="text-xs font-bold">IA</span>
                </button>
                <button onClick={() => navigate('/automatizaciones')} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-white font-semibold shadow hover:from-yellow-400 hover:to-yellow-600 transition whitespace-nowrap">
                  <FiZap className="w-5 h-5" /> <span className="text-xs font-bold">Automatizaciones</span>
                </button>
              </div>
              <div className="flex gap-2 w-full overflow-x-auto">
                <button onClick={() => navigate('/whatsapp-crm')} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-600 to-green-800 text-white font-semibold shadow hover:from-green-500 hover:to-green-700 transition whitespace-nowrap">
                  <FaWhatsapp className="w-5 h-5" /> <span className="text-xs font-bold">WhatsApp CRM</span>
                </button>
                <button onClick={() => navigate('/configuracion')} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold shadow hover:from-gray-600 hover:to-gray-800 transition whitespace-nowrap">
                  <FiSettings className="w-5 h-5" /> <span className="text-xs font-bold">Configuración</span>
                </button>
              </div>
            </div>
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
