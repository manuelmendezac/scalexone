import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import App from './App';
import Error404 from './components/Error404';
import GlobalLoadingSpinner from './components/GlobalLoadingSpinner';
import AfiliadosLayout from './components/afiliados/AfiliadosLayout';
import InformeIBMarcaBlanca from './components/afiliados/InformeIBMarcaBlanca';
import InformeIBScalexOne from './components/afiliados/InformeIBScalexOne';
import MultinivelIBPage from './pages/afiliados/multinivel';
import CuentasIBPage from './pages/afiliados/cuentas';
import HistorialTransaccionesPage from './pages/afiliados/historial';
import PerfilIBPage from './pages/afiliados/perfil';
import EnlacesAfiliadosPage from './pages/afiliados/enlaces';
import ContactoIBPage from './pages/afiliados/contacto';
import RetiroAfiliadoPage from './pages/afiliados/retiro';
import TransferenciaIBPage from './pages/afiliados/transferencia';
import RegistroPage from './pages/registro';

// Implementación de Lazy Loading para todos los componentes de página
const Hero = lazy(() => import('./components/Hero'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AutonomousTrainingHub = lazy(() => import('./components/AutonomousTrainingHub'));
const NeuroFeedbackEngine = lazy(() => import('./components/NeuroFeedbackEngine'));
const NeuroAutoAgentLab = lazy(() => import('./components/NeuroAutoAgentLab'));
const MonetizationHub = lazy(() => import('./components/MonetizationHub'));
const PricingPage = lazy(() => import('./components/pages/PricingPage'));
const SubscriptionPanel = lazy(() => import('./components/pages/SubscriptionPanel'));
const ResellerDashboard = lazy(() => import('./components/pages/ResellerDashboard'));
const ReferralDashboard = lazy(() => import('./components/pages/ReferralDashboard'));
const FunnelHub = lazy(() => import('./components/pages/FunnelHub'));
const AffiliateDashboard = lazy(() => import('./components/pages/AffiliateDashboard'));
const FunnelBuilder = lazy(() => import('./components/pages/FunnelBuilder'));
const EmailAutomationCenter = lazy(() => import('./components/pages/EmailAutomationCenter'));
const ExportCenter = lazy(() => import('./components/pages/ExportCenter'));
const NeuroCloneStore = lazy(() => import('./components/pages/NeuroCloneStore'));
const AdminSettingsPage = lazy(() => import('./pages/admin/settings'));
const FocusMode = lazy(() => import('./components/dashboard/FocusMode'));
const HabitIntelligence = lazy(() => import('./components/pages/HabitIntelligence'));
const ProgressTracker = lazy(() => import('./components/pages/ProgressTracker'));
const SettingsPanel = lazy(() => import('./components/pages/SettingsPanel'));
const Inicio = lazy(() => import('./pages/Inicio'));
const Classroom = lazy(() => import('./pages/classroom'));
const LineaVideosClassroom = lazy(() => import('./pages/classroom/linea-videos'));
const EditarVideosClassroom = lazy(() => import('./pages/classroom/editar-videos'));
const CursosPage = lazy(() => import('./pages/cursos'));
const Launchpad = lazy(() => import('./pages/Launchpad'));
const ComunidadPage = lazy(() => import('./pages/comunidad'));
const AfiliadosPage = lazy(() => import('./pages/afiliados/index'));
const Login = lazy(() => import('./pages/login'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ConfiguracionProyecto = lazy(() => import('./components/ConfiguracionProyecto'));
const CursoDetalle = lazy(() => import('./pages/cursos/id'));
const ModuloDetalle = lazy(() => import('./pages/cursos/modulo'));
const ModulosCurso = lazy(() => import('./pages/cursos/modulos'));
const Marketplace = lazy(() => import('./pages/marketplace'));
const PaginaProductoMarketplace = lazy(() => import('./pages/marketplace/producto/[id]'));
const MarketplaceAfiliados = lazy(() => import('./pages/afiliados/marketplace'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div />}>
    {children}
  </Suspense>
);

// Componente para redirigir /afiliado/:ib a /registro?ref=IB
function AfiliadoRedirect() {
  const { ib } = useParams();
  if (!ib) return <Navigate to="/registro" replace />;
  return <Navigate to={`/registro?ref=${ib}`} replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error404 />,
    children: [
      { index: true, element: <SuspenseWrapper><Login /></SuspenseWrapper> },
      { path: 'landing', element: <SuspenseWrapper><Hero /></SuspenseWrapper> },
      { path: 'clasificacion', element: <SuspenseWrapper><Dashboard /></SuspenseWrapper> },
      { path: 'home', element: <SuspenseWrapper><Inicio /></SuspenseWrapper> },
      {
        path: 'classroom',
        children: [
          { index: true, element: <SuspenseWrapper><Classroom /></SuspenseWrapper> },
          { path: 'videos/:modulo_id', element: <SuspenseWrapper><LineaVideosClassroom /></SuspenseWrapper> },
          { path: 'videos', element: <SuspenseWrapper><LineaVideosClassroom /></SuspenseWrapper> },
          { path: 'editar-videos/:modulo_id', element: <SuspenseWrapper><EditarVideosClassroom /></SuspenseWrapper> },
          { path: 'editar-videos', element: <SuspenseWrapper><EditarVideosClassroom /></SuspenseWrapper> }
        ]
      },
      {
        path: 'cursos',
        children: [
          { index: true, element: <SuspenseWrapper><CursosPage /></SuspenseWrapper> },
          { path: ':id', element: <SuspenseWrapper><CursoDetalle /></SuspenseWrapper> },
          { path: ':id/modulos', element: <SuspenseWrapper><ModulosCurso /></SuspenseWrapper> },
          { path: ':id/modulo/:moduloIdx', element: <SuspenseWrapper><ModuloDetalle /></SuspenseWrapper> },
          { path: 'modulo/:moduloIdx', element: <SuspenseWrapper><ModuloDetalle /></SuspenseWrapper> },
        ]
      },
      { path: 'launchpad', element: <SuspenseWrapper><Launchpad /></SuspenseWrapper> },
      { path: 'comunidad', element: <SuspenseWrapper><ComunidadPage /></SuspenseWrapper> },
      { 
        path: 'marketplace', 
        children: [
          { index: true, element: <SuspenseWrapper><Marketplace /></SuspenseWrapper> },
          { path: 'producto/:id', element: <SuspenseWrapper><PaginaProductoMarketplace /></SuspenseWrapper> },
        ] 
      },
      { path: 'configuracion-admin', element: <SuspenseWrapper><AdminSettingsPage /></SuspenseWrapper> },
      { path: 'console', element: <div style={{color: 'white', fontSize: 32, textAlign: 'center', marginTop: 40}}>Test Console</div> },
      { path: 'focus', element: <SuspenseWrapper><FocusMode /></SuspenseWrapper> },
      { path: 'habits', element: <SuspenseWrapper><HabitIntelligence /></SuspenseWrapper> },
      { path: 'progress', element: <SuspenseWrapper><ProgressTracker /></SuspenseWrapper> },
      { path: 'settings', element: <SuspenseWrapper><SettingsPanel /></SuspenseWrapper> },
      { path: 'train', element: <SuspenseWrapper><AutonomousTrainingHub /></SuspenseWrapper> },
      { path: 'feedback', element: <SuspenseWrapper><NeuroFeedbackEngine /></SuspenseWrapper> },
      { path: 'autoagent', element: <SuspenseWrapper><NeuroAutoAgentLab /></SuspenseWrapper> },
      { path: 'monetization', element: <SuspenseWrapper><MonetizationHub /></SuspenseWrapper> },
      { path: 'pricing', element: <SuspenseWrapper><PricingPage /></SuspenseWrapper> },
      { path: 'account/subscription', element: <SuspenseWrapper><SubscriptionPanel /></SuspenseWrapper> },
      { path: 'reseller/dashboard', element: <SuspenseWrapper><ResellerDashboard /></SuspenseWrapper> },
      { path: 'referrals', element: <SuspenseWrapper><ReferralDashboard /></SuspenseWrapper> },
      { path: 'funnels', element: <SuspenseWrapper><FunnelHub /></SuspenseWrapper> },
      { path: 'affiliates', element: <SuspenseWrapper><AffiliateDashboard /></SuspenseWrapper> },
      { path: 'automation', element: <SuspenseWrapper><EmailAutomationCenter /></SuspenseWrapper> },
      { path: 'export', element: <SuspenseWrapper><ExportCenter /></SuspenseWrapper> },
      { path: 'store', element: <SuspenseWrapper><NeuroCloneStore /></SuspenseWrapper> },
      { path: 'login', element: <SuspenseWrapper><Login /></SuspenseWrapper> },
      { path: 'register', element: <SuspenseWrapper><RegistroPage /></SuspenseWrapper> },
      { path: 'reset-password', element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper> },
      { path: 'registro', element: <SuspenseWrapper><RegistroPage /></SuspenseWrapper> },
      { path: '*', element: <Error404 /> }
    ]
  },
  {
    path: '/afiliados',
    element: <AfiliadosLayout />,
    children: [
      { index: true, element: <SuspenseWrapper><AfiliadosPage /></SuspenseWrapper> },
      { path: 'ib-marca-blanca', element: <InformeIBMarcaBlanca /> },
      { path: 'ib-scalexone', element: <InformeIBScalexOne /> },
      { path: 'multinivel', element: <MultinivelIBPage /> },
      { path: 'cuentas', element: <CuentasIBPage /> },
      { path: 'historial', element: <HistorialTransaccionesPage /> },
      { path: 'retiro', element: <RetiroAfiliadoPage /> },
      { path: 'transferencia', element: <TransferenciaIBPage /> },
      { path: 'perfil', element: <PerfilIBPage /> },
      { path: 'enlaces', element: <EnlacesAfiliadosPage /> },
      { path: 'contacto', element: <ContactoIBPage /> },
      { path: 'marketplace', element: <SuspenseWrapper><MarketplaceAfiliados /></SuspenseWrapper> },
    ]
  },
  {
    path: '/afiliado/:ib',
    element: <AfiliadoRedirect />,
  },
]); 