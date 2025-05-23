import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FunnelTemplate {
  id: string;
  name: string;
  type: 'capture' | 'webinar' | 'evergreen' | 'digital';
  description: string;
  pages: {
    capture: string;
    confirmation: string;
    event: string;
    checkout: string;
  };
  metrics: {
    views: number;
    conversions: number;
    clicks: number;
    sales: number;
  };
}

interface Funnel {
  id: string;
  templateId: string;
  name: string;
  customUrl: string;
  status: 'draft' | 'active' | 'paused';
  createdAt: string;
  metrics: {
    views: number;
    conversions: number;
    clicks: number;
    sales: number;
  };
}

interface FunnelState {
  templates: FunnelTemplate[];
  funnels: Funnel[];
  createFunnel: (funnel: Omit<Funnel, 'id'>) => Promise<void>;
  updateFunnel: (id: string, updates: Partial<Funnel>) => Promise<void>;
  deleteFunnel: (id: string) => Promise<void>;
  trackView: (funnelId: string) => Promise<void>;
  trackConversion: (funnelId: string) => Promise<void>;
  trackClick: (funnelId: string) => Promise<void>;
  trackSale: (funnelId: string, amount: number) => Promise<void>;
}

export const useFunnelStore = create<FunnelState>()(
  persist(
    (set, get) => ({
      templates: [
        {
          id: '1',
          name: 'Embudo de Captación',
          type: 'capture',
          description: 'Perfecto para captar leads y construir tu lista de correo',
          pages: {
            capture: '/templates/capture/page1',
            confirmation: '/templates/capture/page2',
            event: '/templates/capture/page3',
            checkout: '/templates/capture/page4'
          },
          metrics: {
            views: 0,
            conversions: 0,
            clicks: 0,
            sales: 0
          }
        },
        {
          id: '2',
          name: 'Embudo de Webinar',
          type: 'webinar',
          description: 'Ideal para presentar tu producto o servicio en vivo',
          pages: {
            capture: '/templates/webinar/page1',
            confirmation: '/templates/webinar/page2',
            event: '/templates/webinar/page3',
            checkout: '/templates/webinar/page4'
          },
          metrics: {
            views: 0,
            conversions: 0,
            clicks: 0,
            sales: 0
          }
        },
        {
          id: '3',
          name: 'Embudo Evergreen',
          type: 'evergreen',
          description: 'Vende tu producto digital de forma automática',
          pages: {
            capture: '/templates/evergreen/page1',
            confirmation: '/templates/evergreen/page2',
            event: '/templates/evergreen/page3',
            checkout: '/templates/evergreen/page4'
          },
          metrics: {
            views: 0,
            conversions: 0,
            clicks: 0,
            sales: 0
          }
        }
      ],
      funnels: [],
      createFunnel: async (funnel) => {
        try {
          // Aquí iría la llamada a la API para crear el embudo
          const newFunnel = {
            ...funnel,
            id: Math.random().toString(36).substr(2, 9)
          };
          set(state => ({
            funnels: [...state.funnels, newFunnel]
          }));
        } catch (error) {
          console.error('Error creating funnel:', error);
          throw error;
        }
      },
      updateFunnel: async (id, updates) => {
        try {
          // Aquí iría la llamada a la API para actualizar el embudo
          set(state => ({
            funnels: state.funnels.map(funnel =>
              funnel.id === id ? { ...funnel, ...updates } : funnel
            )
          }));
        } catch (error) {
          console.error('Error updating funnel:', error);
          throw error;
        }
      },
      deleteFunnel: async (id) => {
        try {
          // Aquí iría la llamada a la API para eliminar el embudo
          set(state => ({
            funnels: state.funnels.filter(funnel => funnel.id !== id)
          }));
        } catch (error) {
          console.error('Error deleting funnel:', error);
          throw error;
        }
      },
      trackView: async (funnelId) => {
        try {
          // Aquí iría la llamada a la API para registrar la vista
          set(state => ({
            funnels: state.funnels.map(funnel =>
              funnel.id === funnelId
                ? {
                    ...funnel,
                    metrics: {
                      ...funnel.metrics,
                      views: funnel.metrics.views + 1
                    }
                  }
                : funnel
            )
          }));
        } catch (error) {
          console.error('Error tracking view:', error);
          throw error;
        }
      },
      trackConversion: async (funnelId) => {
        try {
          // Aquí iría la llamada a la API para registrar la conversión
          set(state => ({
            funnels: state.funnels.map(funnel =>
              funnel.id === funnelId
                ? {
                    ...funnel,
                    metrics: {
                      ...funnel.metrics,
                      conversions: funnel.metrics.conversions + 1
                    }
                  }
                : funnel
            )
          }));
        } catch (error) {
          console.error('Error tracking conversion:', error);
          throw error;
        }
      },
      trackClick: async (funnelId) => {
        try {
          // Aquí iría la llamada a la API para registrar el clic
          set(state => ({
            funnels: state.funnels.map(funnel =>
              funnel.id === funnelId
                ? {
                    ...funnel,
                    metrics: {
                      ...funnel.metrics,
                      clicks: funnel.metrics.clicks + 1
                    }
                  }
                : funnel
            )
          }));
        } catch (error) {
          console.error('Error tracking click:', error);
          throw error;
        }
      },
      trackSale: async (funnelId, amount) => {
        try {
          // Aquí iría la llamada a la API para registrar la venta
          set(state => ({
            funnels: state.funnels.map(funnel =>
              funnel.id === funnelId
                ? {
                    ...funnel,
                    metrics: {
                      ...funnel.metrics,
                      sales: funnel.metrics.sales + 1
                    }
                  }
                : funnel
            )
          }));
        } catch (error) {
          console.error('Error tracking sale:', error);
          throw error;
        }
      }
    }),
    {
      name: 'funnel-storage'
    }
  )
); 