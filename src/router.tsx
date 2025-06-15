import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import CloneOnboarding from './components/CloneOnboarding';
import Dashboard from './components/Dashboard';
import AIConsole from './components/AIConsole';
import KnowledgeAssistant from './components/KnowledgeAssistant';
import UploaderDocsIA from './components/UploaderDocsIA';
import PanelIA from './components/PanelIA';
import SelectorNicho from './components/SelectorNicho';
import Inicio from './pages/Inicio';
import PlanificadorMetas from './pages/PlanificadorMetas';
import { KnowledgeVaultQuiz } from './components/vault';
import DynamicExpertProfile from './components/expert/DynamicExpertProfile';
import MetaGalaxyMap from './components/aspiracional/MetaGalaxyMap';
import MisionPersonalGame from './components/aspiracional/MisionPersonalGame';
import PasionesGame from './components/aspiracional/PasionesGame';
import HabilidadesGame from './components/aspiracional/HabilidadesGame';
import ImpactoGame from './components/aspiracional/ImpactoGame';
import SuenoMaximoGame from './components/aspiracional/SuenoMaximoGame';
import ImplementarIAPage from './pages/ImplementarIA';
import PersonalizarAgente from './pages/personalizar-agente/[id]';
import ConfiguracionProyecto from './components/ConfiguracionProyecto';
import Login from './pages/login';
import Register from './pages/register';
import ProtectedRoute from './components/ProtectedRoute';
import ResetPassword from './pages/ResetPassword';
import Perfil from './pages/Perfil';
import Error404 from './components/Error404';
import TemplatesIndex from './pages/templates/index';
import TemplateEditor from './pages/templates/editor/[templateId]';
import AfiliadosPage from './pages/afiliados/index';
import IBMarcaBlancaPage from './pages/afiliados/ib-marca-blanca';
import IBScalexOnePage from './pages/afiliados/ib-scalexone';
import MultinivelIBPage from './pages/afiliados/multinivel';
import CuentasIBPage from './pages/afiliados/cuentas';
import HistorialTransaccionesPage from './pages/afiliados/historial';
import PerfilIBPage from './pages/afiliados/perfil';
import EnlacesAfiliadosPage from './pages/afiliados/enlaces';
import ContactoIBPage from './pages/afiliados/contacto';
import Launchpad from './pages/Launchpad';
import Backstage from './pages/Backstage';
import CursosPage from './pages/cursos';
import CursoDetalle from './pages/cursos/id';
import ModulosCurso from './pages/cursos/modulos';
import ModuloDetalle from './pages/cursos/modulo';
import Classroom from './pages/classroom';
import EditarVideosClassroom from './pages/classroom/editar-videos';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Login /> },
      { path: 'registro', element: <Register /> },
      { path: 'inicio', element: <ProtectedRoute><Inicio /></ProtectedRoute> },
      { path: 'home', element: <ProtectedRoute><Inicio /></ProtectedRoute> },
      { path: 'dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
        children: [
          { index: true, element: <ProtectedRoute><Inicio /></ProtectedRoute> },
          { path: 'console', element: <ProtectedRoute><AIConsole /></ProtectedRoute> },
          { path: 'knowledge', element: <ProtectedRoute><KnowledgeAssistant /></ProtectedRoute> },
          { path: 'uploader', element: <ProtectedRoute><UploaderDocsIA /></ProtectedRoute> },
          { path: 'panel', element: <ProtectedRoute><PanelIA /></ProtectedRoute> },
          { path: 'nicho', element: <ProtectedRoute><SelectorNicho /></ProtectedRoute> },
        ]
      },
      { path: 'knowledge-vault', element: <ProtectedRoute><KnowledgeVaultQuiz /></ProtectedRoute> },
      { path: 'dynamic-expert-profile', element: <ProtectedRoute><DynamicExpertProfile /></ProtectedRoute> },
      { path: 'meta-galaxy', element: <ProtectedRoute><MetaGalaxyMap /></ProtectedRoute> },
      { path: 'meta-galaxy/mision-personal', element: <ProtectedRoute><MisionPersonalGame /></ProtectedRoute> },
      { path: 'meta-galaxy/pasiones', element: <ProtectedRoute><PasionesGame /></ProtectedRoute> },
      { path: 'meta-galaxy/habilidades', element: <ProtectedRoute><HabilidadesGame /></ProtectedRoute> },
      { path: 'meta-galaxy/impacto', element: <ProtectedRoute><ImpactoGame /></ProtectedRoute> },
      { path: 'meta-galaxy/sueno-maximo', element: <ProtectedRoute><SuenoMaximoGame /></ProtectedRoute> },
      { path: 'perfil-aspiracional', element: <ProtectedRoute><MetaGalaxyMap /></ProtectedRoute> },
      { path: 'implementar-ia', element: <ProtectedRoute><ImplementarIAPage /></ProtectedRoute> },
      { path: 'personalizar-agente/:id', element: <ProtectedRoute><PersonalizarAgente /></ProtectedRoute> },
      { path: 'configuracion', element: <ProtectedRoute><ConfiguracionProyecto /></ProtectedRoute> },
      { path: 'reset-password', element: <ResetPassword /> },
      { path: 'perfil', element: <ProtectedRoute><Perfil /></ProtectedRoute> },
      { path: 'templates', children: [
        { index: true, element: <ProtectedRoute><TemplatesIndex /></ProtectedRoute> },
        { path: 'editor/:templateId', element: <ProtectedRoute><TemplateEditor /></ProtectedRoute> }
      ] },
      { path: 'launchpad', element: <Launchpad /> },
      { path: 'backstage', element: <Backstage /> },
      { path: 'cursos', element: <ProtectedRoute><CursosPage /></ProtectedRoute> },
      { path: 'cursos/:id', element: <ProtectedRoute><CursoDetalle /></ProtectedRoute> },
      { path: 'cursos/:id/modulos', element: <ProtectedRoute><ModulosCurso /></ProtectedRoute> },
      { path: 'cursos/:id/modulo/:moduloIdx', element: <ProtectedRoute><ModuloDetalle /></ProtectedRoute> },
      { path: 'classroom', element: <ProtectedRoute><Classroom /></ProtectedRoute> },
      { path: 'classroom/editar-videos', element: <ProtectedRoute><EditarVideosClassroom /></ProtectedRoute> },
    ]
  },
  { path: '/afiliados', element: <AfiliadosPage /> },
  { path: '/afiliados/ib-marca-blanca', element: <IBMarcaBlancaPage /> },
  { path: '/afiliados/ib-scalexone', element: <IBScalexOnePage /> },
  { path: '/afiliados/multinivel', element: <MultinivelIBPage /> },
  { path: '/afiliados/cuentas', element: <CuentasIBPage /> },
  { path: '/afiliados/historial', element: <HistorialTransaccionesPage /> },
  { path: '/afiliados/perfil', element: <PerfilIBPage /> },
  { path: '/afiliados/enlaces', element: <EnlacesAfiliadosPage /> },
  { path: '/afiliados/contacto', element: <ContactoIBPage /> },
  { path: '/onboarding', element: <CloneOnboarding /> },
  { path: '/planificador-metas', element: <PlanificadorMetas /> },
  { path: '*', element: <Error404 /> },
]); 