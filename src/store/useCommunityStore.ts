import { create } from 'zustand';
import { supabase } from '../supabase';

interface Post {
  id: string;
  usuario_id: string;
  contenido: string;
  tipo: string;
  media_url: string | null;
  descripcion: string | null;
  created_at: string;
  orientacion?: 'vertical' | 'horizontal';
  usuario?: {
    avatar_url?: string;
    name?: string;
  };
  imagenes_urls?: string[] | null;
}

interface CommunityStore {
  posts: Post[];
  reaccionesPorPost: Record<string, any>;
  usuarios: Record<string, { avatar_url?: string; name?: string }>;
  lastFetch: number | null;
  loading: boolean;
  fetchPosts: () => Promise<void>;
  cargarReacciones: (postId: string) => Promise<void>;
}

const CACHE_DURATION = 30000; // 30 segundos

const useCommunityStore = create<CommunityStore>((set, get) => ({
  posts: [],
  reaccionesPorPost: {},
  usuarios: {},
  lastFetch: null,
  loading: false,

  fetchPosts: async () => {
    const now = Date.now();
    const lastFetch = get().lastFetch;

    // Si tenemos datos en caché y no han pasado 30 segundos, usamos el caché
    if (lastFetch && now - lastFetch < CACHE_DURATION && get().posts.length > 0) {
      return;
    }

    set({ loading: true });
    
    try {
      const { data, error } = await supabase
        .from('comunidad_posts')
        .select('*, usuario:usuario_id ( avatar_url, name )')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const usuariosMap: Record<string, { avatar_url?: string; name?: string }> = {};
        data.forEach((post: Post) => {
          if (post.usuario_id && post.usuario) {
            usuariosMap[post.usuario_id] = {
              avatar_url: post.usuario.avatar_url,
              name: post.usuario.name,
            };
          }
        });

        set({
          posts: data,
          usuarios: usuariosMap,
          lastFetch: Date.now()
        });

        // Cargar reacciones para los posts nuevos o actualizados
        data.forEach((post: Post) => {
          if (!get().reaccionesPorPost[post.id]) {
            get().cargarReacciones(post.id);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      set({ loading: false });
    }
  },

  cargarReacciones: async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comunidad_reacciones')
        .select('*')
        .eq('post_id', postId);

      if (error) throw error;

      if (data) {
        const agrupadas: Record<string, { tipo: string; count: number; usuarios: string[] }> = {};
        data.forEach((r: any) => {
          if (!agrupadas[r.tipo]) {
            agrupadas[r.tipo] = { tipo: r.tipo, count: 0, usuarios: [] };
          }
          agrupadas[r.tipo].count++;
          agrupadas[r.tipo].usuarios.push(r.usuario_id);
        });

        set(state => ({
          reaccionesPorPost: {
            ...state.reaccionesPorPost,
            [postId]: Object.values(agrupadas)
          }
        }));
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  }
}));

export default useCommunityStore; 