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
import { Outlet, useNavigate, useLocation, useNavigation } from 'react-router-dom';
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
import ScrollNavbar from './components/ScrollNavbar';
import { useGlobalLoading } from './store/useGlobalLoading';

// Definición de tipos para las vistas
type ViewType = 'inicio' | 'simulacion' | 'dashboard' | 'perfil' | 'configuracion' | 'panel' | 'uploader' | 'knowledge' | 'nicho' | 'modules' | 'train';

interface ViewConfig {
  id: ViewType;
  label: string;
  icon: string;
  component: React.ReactNode;
}

function App() {
  console.log('RENDER App');
  const isHydrated = useHydration();
  const { t } = useTranslation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();
  const { avatarUrl, notifications, userName, setHydrated, setMessages, setNotifications, setUserName, updateUserInfo, userInfo } = useNeuroState();
  // Estado para modo oscuro (puedes mejorarlo según tu lógica global)
  const [darkMode, setDarkMode] = useState(false);
  // Simulación de login (ajusta según tu lógica real)
  const isLoggedIn = userName !== 'Invitado';
  const location = useLocation();
  const hideMenu = location.pathname === '/' || location.pathname === '/registro';
  const isLaunchpad = location.pathname === '/launchpad';
  const navigation = useNavigation();
  const isLoadingGlobal = useGlobalLoading(state => state.isLoadingGlobal);

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
        if (nombre !== userName) setUserName(nombre);

        // Obtener datos completos del usuario desde la tabla usuarios
        const { data: usuarioData } = await supabase
          .from('usuarios')
          .select('rol, community_id')
          .eq('email', user.email)
          .single();

        // Solo actualiza si hay cambios reales
        if (
          usuarioData?.rol !== userInfo.rol ||
          usuarioData?.community_id !== userInfo.community_id ||
          nombre !== userInfo.name ||
          user.email !== userInfo.email
        ) {
          updateUserInfo({
            name: nombre,
            email: user.email,
            rol: usuarioData?.rol || user.user_metadata?.rol || 'user',
            community_id: usuarioData?.community_id || 'default'
          });
        }

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
  }, [location.pathname, setUserName, updateUserInfo, navigate, userInfo, userName]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    navigate('/clasificacion/console');
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
      <div className="min-h-screen w-full" style={{background: '#000'}}>
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
            <ScrollNavbar />
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
