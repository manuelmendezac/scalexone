import { create } from 'zustand';
import { supabase } from '../supabase';

interface ConfigStore {
  userConfig: any;
  loading: boolean;
  lastFetch: number | null;
  fetchUserConfig: () => Promise<void>;
  updateUserConfig: (config: any) => Promise<void>;
}

const CACHE_DURATION = 60000; // 1 minuto

const useConfigStore = create<ConfigStore>((set, get) => ({
  userConfig: null,
  loading: false,
  lastFetch: null,

  fetchUserConfig: async () => {
    const now = Date.now();
    const lastFetch = get().lastFetch;

    // Si tenemos datos en caché y no ha pasado 1 minuto, usamos el caché
    if (lastFetch && now - lastFetch < CACHE_DURATION && get().userConfig) {
      return;
    }

    set({ loading: true });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      set({
        userConfig: data,
        lastFetch: Date.now()
      });
    } catch (error) {
      console.error('Error fetching user config:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateUserConfig: async (config: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      const { error } = await supabase
        .from('usuarios')
        .update(config)
        .eq('id', user.id);

      if (error) throw error;

      set(state => ({
        userConfig: {
          ...state.userConfig,
          ...config
        },
        lastFetch: Date.now()
      }));
    } catch (error) {
      console.error('Error updating user config:', error);
      throw error;
    }
  }
}));

export default useConfigStore; 