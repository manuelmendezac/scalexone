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
import SegundoCerebro from './pages/SegundoCerebro';
import PlanificadorMetas from './pages/PlanificadorMetas';
import CentroEntrenamientoPage from './components/pages/CentroEntrenamientoPage';
import { KnowledgeVaultQuiz } from './components/vault';
import EntrenamientoDiarioMemoryMatch from './components/centro/EntrenamientoDiarioMemoryMatch';
import InteligenciaHabitos from './components/centro/InteligenciaHabitos';
import PerfilCognitivo from './components/centro/PerfilCognitivo';
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/inicio" replace />
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
        element: <Dashboard />,
        children: [
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
        path: 'segundo-cerebro',
        element: <SegundoCerebro />
      },
      {
        path: 'centro-entrenamiento',
        element: <CentroEntrenamientoPage />
      },
      {
        path: 'knowledge-vault',
        element: <KnowledgeVaultQuiz />
      },
      {
        path: 'entrenamiento-diario',
        element: <EntrenamientoDiarioMemoryMatch />
      },
      {
        path: 'inteligencia-habitos',
        element: <InteligenciaHabitos />
      },
      {
        path: 'perfil-cognitivo',
        element: <PerfilCognitivo />
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
]); 