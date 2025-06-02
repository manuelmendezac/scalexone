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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Login />
      },
      {
        path: 'registro',
        element: <Register />
      },
      {
        path: 'inicio',
        element: <Inicio />
      },
      {
        path: 'home',
        element: <Inicio />
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
        children: [
          {
            index: true,
            element: <Inicio />
          },
          {
            path: 'console',
            element: <AIConsole />
          },
          {
            path: 'knowledge',
            element: <KnowledgeAssistant />
          },
          {
            path: 'uploader',
            element: <UploaderDocsIA />
          },
          {
            path: 'panel',
            element: <PanelIA />
          },
          {
            path: 'nicho',
            element: <SelectorNicho />
          }
        ]
      },
      {
        path: 'knowledge-vault',
        element: <KnowledgeVaultQuiz />
      },
      {
        path: 'dynamic-expert-profile',
        element: <DynamicExpertProfile />
      },
      {
        path: 'meta-galaxy',
        element: <MetaGalaxyMap />
      },
      {
        path: 'meta-galaxy/mision-personal',
        element: <MisionPersonalGame />
      },
      {
        path: 'meta-galaxy/pasiones',
        element: <PasionesGame />
      },
      {
        path: 'meta-galaxy/habilidades',
        element: <HabilidadesGame />
      },
      {
        path: 'meta-galaxy/impacto',
        element: <ImpactoGame />
      },
      {
        path: 'meta-galaxy/sueno-maximo',
        element: <SuenoMaximoGame />
      },
      {
        path: 'perfil-aspiracional',
        element: <MetaGalaxyMap />
      },
      {
        path: 'implementar-ia',
        element: <ImplementarIAPage />
      },
      {
        path: 'personalizar-agente/:id',
        element: <PersonalizarAgente />,
      },
      {
        path: 'configuracion',
        element: <ConfiguracionProyecto />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />
      },
      {
        path: 'perfil',
        element: <Perfil />
      },
      {
        path: 'templates',
        children: [
          { index: true, element: <TemplatesIndex /> },
          { path: 'editor/:templateId', element: <TemplateEditor /> }
        ]
      },
    ]
  },
  {
    path: '/onboarding',
    element: <CloneOnboarding />,
  },
  {
    path: '/planificador-metas',
    element: <PlanificadorMetas />,
  },
  {
    path: '*',
    element: <Error404 />
  },
]); 