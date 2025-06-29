import { create } from 'zustand';
import { supabase } from '../supabase';

interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  orden: number;
}

interface CursosStore {
  cursos: Curso[];
  cursoActivo: Curso | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  fetchCursos: () => Promise<void>;
  setCursoActivo: (curso: Curso | null) => void;
}

const CACHE_DURATION = 60000; // 1 minuto

const useCursosStore = create<CursosStore>((set, get) => ({
  cursos: [],
  cursoActivo: null,
  loading: false,
  error: null,
  lastFetch: null,

  fetchCursos: async () => {
    const now = Date.now();
    const lastFetch = get().lastFetch;

    // Si tenemos datos en caché y no ha pasado 1 minuto, usamos el caché
    if (lastFetch && now - lastFetch < CACHE_DURATION && get().cursos.length > 0) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('orden', { ascending: true });

      if (error) throw error;

      const cursos = data || [];
      set({
        cursos,
        cursoActivo: cursos.length > 0 ? cursos[0] : null,
        lastFetch: Date.now()
      });
    } catch (error) {
      console.error('Error fetching cursos:', error);
      set({ error: error instanceof Error ? error.message : 'Error al cargar los cursos' });
    } finally {
      set({ loading: false });
    }
  },

  setCursoActivo: (curso) => {
    set({ cursoActivo: curso });
  }
}));

export default useCursosStore; 