import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Hero from './components/Hero';
import Error404 from './components/Error404';
import Dashboard from './components/Dashboard';
import { AutonomousTrainingHub } from './components/AutonomousTrainingHub';
import { NeuroFeedbackEngine } from './components/NeuroFeedbackEngine';
import { NeuroAutoAgentLab } from './components/NeuroAutoAgentLab';
import { MonetizationHub } from './components/MonetizationHub';
import PricingPage from './components/pages/PricingPage';
import SubscriptionPanel from './components/pages/SubscriptionPanel';
import ResellerDashboard from './components/pages/ResellerDashboard';
import ReferralDashboard from './components/pages/ReferralDashboard';
import FunnelHub from './components/pages/FunnelHub';
import AffiliateDashboard from './components/pages/AffiliateDashboard';
import FunnelBuilder from './components/pages/FunnelBuilder';
import EmailAutomationCenter from './components/pages/EmailAutomationCenter';
import ExportCenter from './components/pages/ExportCenter';
import LeadMonetizationCenter from './components/pages/LeadMonetizationCenter';
import NeuroCloneStore from './components/pages/NeuroCloneStore';
import AdminSettingsPage from './pages/admin/settings';
import FocusMode from './components/dashboard/FocusMode';
import HabitIntelligence from './components/pages/HabitIntelligence';
import ProgressTracker from './components/pages/ProgressTracker';
import SettingsPanel from './components/pages/SettingsPanel';
import Inicio from './pages/Inicio';
import Classroom from './pages/classroom';
import CursosPage from './pages/cursos';
import Launchpad from './pages/Launchpad';
import ComunidadPage from './pages/comunidad';
import AfiliadosPage from './pages/afiliados/index';
import Login from './pages/login';
import Register from './pages/register';
import ResetPassword from './pages/ResetPassword';
import ConfiguracionProyecto from './components/ConfiguracionProyecto';
import CursoDetalle from './pages/cursos/id';
import ModuloDetalle from './pages/cursos/modulo';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error404 />,
    children: [
      { index: true, element: <Login /> },
      { path: 'landing', element: <Hero /> },
      { path: 'clasificacion', element: <Dashboard /> },
      { path: 'home', element: <Inicio /> },
      { path: 'classroom', element: <Classroom /> },
      {
        path: 'cursos',
        children: [
          { index: true, element: <CursosPage /> },
          { path: ':id', element: <CursoDetalle /> },
          { path: 'modulo/:moduloIdx', element: <ModuloDetalle /> },
        ]
      },
      { path: 'launchpad', element: <Launchpad /> },
      { path: 'comunidad', element: <ComunidadPage /> },
      { path: 'configuracion', element: <ConfiguracionProyecto /> },
      { path: 'configuracion-admin', element: <AdminSettingsPage /> },
      { path: 'console', element: <div style={{color: 'white', fontSize: 32, textAlign: 'center', marginTop: 40}}>Test Console</div> },
      { path: 'focus', element: <FocusMode /> },
      { path: 'habits', element: <HabitIntelligence /> },
      { path: 'progress', element: <ProgressTracker /> },
      { path: 'settings', element: <SettingsPanel /> },
      { path: '*', element: <Error404 /> }
    ]
  },
  {
    path: 'afiliados',
    element: <AfiliadosPage />
  },
  {
    path: 'train',
    element: <AutonomousTrainingHub />
  },
  {
    path: 'feedback',
    element: <NeuroFeedbackEngine />
  },
  {
    path: 'autoagent',
    element: <NeuroAutoAgentLab />
  },
  {
    path: 'monetization',
    element: <MonetizationHub />
  },
  {
    path: 'pricing',
    element: <PricingPage />
  },
  {
    path: 'account/subscription',
    element: <SubscriptionPanel />
  },
  {
    path: 'reseller/dashboard',
    element: <ResellerDashboard />
  },
  {
    path: 'referrals',
    element: <ReferralDashboard />
  },
  {
    path: 'funnels',
    element: <FunnelHub />
  },
  {
    path: 'affiliates',
    element: <AffiliateDashboard />
  },
  {
    path: 'automation',
    element: <EmailAutomationCenter />
  },
  {
    path: 'export',
    element: <ExportCenter />
  },
  {
    path: 'monetization',
    element: <LeadMonetizationCenter />
  },
  {
    path: 'store',
    element: <NeuroCloneStore />
  },
  {
    path: '*',
    element: <Error404 />
  },
  {
    path: 'login',
    element: <Login />
  },
  {
    path: 'register',
    element: <Register />
  },
  {
    path: 'reset-password',
    element: <ResetPassword />
  },
  {
    path: 'registro',
    element: <Register />
  }
]); 