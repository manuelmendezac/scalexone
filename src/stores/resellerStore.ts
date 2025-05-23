import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Clone {
  id: string;
  name: string;
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  description: string;
  subdomain: string;
  stripeConnected: boolean;
  metrics: {
    activeUsers: number;
    totalRevenue: number;
    subscriptions: number;
  };
}

interface ResellerState {
  clones: Clone[];
  createClone: (clone: Clone) => Promise<void>;
  updateClone: (id: string, clone: Partial<Clone>) => Promise<void>;
  deleteClone: (id: string) => Promise<void>;
  connectStripe: (cloneId: string) => Promise<void>;
}

export const useResellerStore = create<ResellerState>()(
  persist(
    (set, get) => ({
      clones: [],
      createClone: async (clone: Clone) => {
        try {
          // Aquí iría la llamada a la API para crear el clon
          set(state => ({
            clones: [...state.clones, clone]
          }));
        } catch (error) {
          console.error('Error creating clone:', error);
          throw error;
        }
      },
      updateClone: async (id: string, clone: Partial<Clone>) => {
        try {
          // Aquí iría la llamada a la API para actualizar el clon
          set(state => ({
            clones: state.clones.map(c => c.id === id ? { ...c, ...clone } : c)
          }));
        } catch (error) {
          console.error('Error updating clone:', error);
          throw error;
        }
      },
      deleteClone: async (id: string) => {
        try {
          // Aquí iría la llamada a la API para eliminar el clon
          set(state => ({
            clones: state.clones.filter(c => c.id !== id)
          }));
        } catch (error) {
          console.error('Error deleting clone:', error);
          throw error;
        }
      },
      connectStripe: async (cloneId: string) => {
        try {
          // Aquí iría la llamada a la API para conectar con Stripe
          set(state => ({
            clones: state.clones.map(c => c.id === cloneId ? { ...c, stripeConnected: true } : c)
          }));
        } catch (error) {
          console.error('Error connecting to Stripe:', error);
          throw error;
        }
      }
    }),
    {
      name: 'reseller-storage'
    }
  )
); 