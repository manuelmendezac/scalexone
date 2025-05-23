import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import AIConsole from '../components/AIConsole';
import FocusMode from '../components/dashboard/FocusMode';
import HabitIntelligence from '../components/pages/HabitIntelligence';
import ProgressTracker from '../components/pages/ProgressTracker';
import SettingsPanel from '../components/pages/SettingsPanel';
import { AutonomousTrainingHub } from '../components/AutonomousTrainingHub';
import { NeuroFeedbackEngine } from '../components/NeuroFeedbackEngine';
import { NeuroAutoAgentLab } from '../components/NeuroAutoAgentLab';
import { MonetizationHub } from '../components/MonetizationHub';
import PricingPage from '../components/pages/PricingPage';
import SubscriptionPanel from '../components/pages/SubscriptionPanel';
import ResellerDashboard from '../components/pages/ResellerDashboard';
import ReferralDashboard from '../components/pages/ReferralDashboard';
import FunnelHub from '../components/pages/FunnelHub';
import AffiliateDashboard from '../components/pages/AffiliateDashboard';
import FunnelBuilder from '../components/pages/FunnelBuilder';
import EmailAutomationCenter from '../components/pages/EmailAutomationCenter';
import ExportCenter from '../components/pages/ExportCenter';
import LeadMonetizationCenter from '../components/pages/LeadMonetizationCenter';
import NeuroCloneStore from '../components/pages/NeuroCloneStore';
import App from '../App';
import Hero from '../components/Hero';
import Error404 from '../components/Error404';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <Error404 />,
    children: [
      {
        index: true,
        element: <Hero />
      },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          {
            path: 'console',
            element: <div style={{color: 'white', fontSize: 32, textAlign: 'center', marginTop: 40}}>Test Console</div>
          },
          {
            path: 'focus',
            element: <FocusMode />
          },
          {
            path: 'habits',
            element: <HabitIntelligence />
          },
          {
            path: 'progress',
            element: <ProgressTracker />
          },
          {
            path: 'settings',
            element: <SettingsPanel />
          },
          {
            path: '*',
            element: <Error404 />
          }
        ]
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
      }
    ]
  }
]); 