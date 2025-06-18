// Cambio mínimo de prueba para commit y push
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
import { MdFilterAlt, MdOutlineSchool } from 'react-icons/md';
import { FaRobot, FaWhatsapp, FaHome, FaChalkboardTeacher, FaBrain, FaTrophy, FaUsers } from 'react-icons/fa';
import { FiBarChart2, FiZap, FiSettings } from 'react-icons/fi';
import CursosPage from './pages/cursos';
import { syncUsuarioSupabase } from './utils/syncUsuarioSupabase';

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
    async function checkAndSyncUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const nombre = user.user_metadata?.name || user.user_metadata?.full_name || user.email;
        setUserName(nombre);
        updateUserInfo({
          name: nombre,
          email: user.email,
          rol: user.user_metadata?.rol || 'user'
        });
        syncUsuarioSupabase(user);
        // Redirige solo si está en login, registro o raíz
        if (["/login", "/registro", "/"].includes(location.pathname)) {
          navigate("/home", { replace: true });
        }
      }
    }
    checkAndSyncUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAndSyncUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [location.pathname, setUserName, updateUserInfo, navigate]);

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
      <div className="min-h-screen w-full" style={{background: '#10192b'}}>
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
            {/* Menú tipo tabs minimalista, solo texto subrayado */}
            <nav className="flex gap-2 px-2 py-2 bg-transparent border-b border-[#23283a] overflow-x-auto w-full whitespace-nowrap">
              {[
                { path: '/home', label: 'Inicio' },
                { path: '/clasificacion', label: 'Clasificación' },
                { path: '/classroom', label: 'Classroom' },
                { path: '/cursos', label: 'Cursos' },
                { path: '/launchpad', label: 'Launchpad' },
                { path: '/comunidad', label: 'Comunidad' },
                { path: '/gamificacion', label: 'Gamificación' },
                { path: '/funnels', label: 'Embudos' },
                { path: '/ia', label: 'IA' },
                { path: '/automatizaciones', label: 'Automatizaciones' },
                { path: '/whatsapp-crm', label: 'WhatsApp CRM' },
                { path: '/configuracion', label: 'Configuración' },
              ].map(tab => (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`relative px-2 md:px-3 py-1 text-xs md:text-sm font-medium transition-colors
                    ${location.pathname.startsWith(tab.path)
                      ? 'text-cyan-300'
                      : 'text-[#b0c4d8] hover:text-cyan-200'}
                  `}
                  style={{ background: 'none', border: 'none', outline: 'none' }}
                >
                  <span>{tab.label}</span>
                  {location.pathname.startsWith(tab.path) && (
                    <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-cyan-400 rounded-full animate-fadein-sci-fi" style={{transition:'all 0.2s'}} />
                  )}
                </button>
              ))}
            </nav>
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
