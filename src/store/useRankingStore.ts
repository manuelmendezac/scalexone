import { create } from 'zustand';
import { supabase } from '../supabase';

interface RankingUser {
  nombre: string;
  email: string;
  pais: string;
  nivel: number;
  xp: number;
  avatar: string;
  puesto?: number;
}

interface RankingStore {
  top10: RankingUser[];
  userRank: RankingUser | null;
  loading: boolean;
  lastFetch: number | null;
  fetchRanking: () => Promise<void>;
}

const CACHE_DURATION = 60000; // 1 minuto

const useRankingStore = create<RankingStore>((set, get) => ({
  top10: [],
  userRank: null,
  loading: false,
  lastFetch: null,

  fetchRanking: async () => {
    const now = Date.now();
    const lastFetch = get().lastFetch;

    // Si tenemos datos en caché y no ha pasado 1 minuto, usamos el caché
    if (lastFetch && now - lastFetch < CACHE_DURATION && get().top10.length > 0) {
      return;
    }

    set({ loading: true });

    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      // Obtener top 10 usuarios ordenados por XP
      const { data: top10Data, error: top10Error } = await supabase
        .from('usuarios')
        .select('nombres, email, pais, nivel, xp, avatar_url')
        .order('xp', { ascending: false })
        .limit(10);

      if (top10Error) throw top10Error;

      // Si el usuario actual no está en el top 10, obtener su posición
      let userRankData = null;
      if (user) {
        const { data: userPosition } = await supabase
          .rpc('get_user_rank', { user_email: user.email });

        if (userPosition) {
          const { data: userData } = await supabase
            .from('usuarios')
            .select('nombres, email, pais, nivel, xp, avatar_url')
            .eq('email', user.email)
            .single();

          if (userData) {
            userRankData = {
              nombre: userData.nombres || 'Usuario',
              email: userData.email,
              pais: userData.pais || '🌎',
              nivel: userData.nivel || 1,
              xp: userData.xp || 0,
              avatar: userData.avatar_url || '/avatars/default.png',
              puesto: userPosition
            };
          }
        }
      }

      const formattedTop10 = top10Data?.map(user => ({
        nombre: user.nombres || 'Usuario',
        email: user.email,
        pais: user.pais || '🌎',
        nivel: user.nivel || 1,
        xp: user.xp || 0,
        avatar: user.avatar_url || '/avatars/default.png'
      })) || [];

      set({
        top10: formattedTop10,
        userRank: userRankData,
        lastFetch: Date.now()
      });
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      set({ loading: false });
    }
  }
}));

export default useRankingStore; 