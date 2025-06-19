import { create } from 'zustand';
import { supabase } from '../supabase';
import { registrarProgresoAcademico } from '../utils/actualizarNivelUsuario';

export type Modulo = {
  id?: string;
  titulo: string;
  descripcion: string;
  icono?: string;
  imagen_url?: string;
  orden?: number;
  color?: string;
  badge_url?: string;
};

interface EditModulo {
  titulo: string;
  descripcion: string;
  imagen_url: string;
  color: string;
}

interface ClassroomStore {
  modulos: Modulo[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagina: number;
  editIdx: number | null;
  showEditModal: boolean;
  editModulo: EditModulo;
  saveMsg: string | null;
  orderMsg: string | null;
  
  // Acciones
  fetchModulos: () => Promise<void>;
  setPagina: (pagina: number) => void;
  setEditIdx: (idx: number | null) => void;
  setShowEditModal: (show: boolean) => void;
  setEditModulo: (modulo: Partial<EditModulo>) => void;
  setSaveMsg: (msg: string | null) => void;
  setOrderMsg: (msg: string | null) => void;
  handleSaveEdit: () => Promise<void>;
  handleDragEnd: (sourceIdx: number, destIdx: number) => Promise<void>;
  handleDelete: (idx: number) => Promise<void>;
  marcarVideoCompletado: (videoId: string) => Promise<void>;
  marcarModuloCompletado: (moduloId: string) => Promise<void>;
}

const CACHE_DURATION = 60000; // 1 minuto
const MODULOS_POR_PAGINA = 9;

const useClassroomStore = create<ClassroomStore>((set, get) => ({
  modulos: [],
  loading: false,
  error: null,
  lastFetch: null,
  pagina: 1,
  editIdx: null,
  showEditModal: false,
  editModulo: {
    titulo: '',
    descripcion: '',
    imagen_url: '',
    color: '#fff'
  },
  saveMsg: null,
  orderMsg: null,

  fetchModulos: async () => {
    const now = Date.now();
    const lastFetch = get().lastFetch;

    // Si tenemos datos en caché y no ha pasado 1 minuto, usamos el caché
    if (lastFetch && now - lastFetch < CACHE_DURATION && get().modulos.length > 0) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('classroom_modulos')
        .select('*')
        .order('orden', { ascending: true });

      if (error) throw error;

      set({
        modulos: data || [],
        lastFetch: Date.now()
      });
    } catch (error) {
      console.error('Error fetching módulos:', error);
      set({ error: error instanceof Error ? error.message : 'Error al cargar los módulos' });
    } finally {
      set({ loading: false });
    }
  },

  setPagina: (pagina) => set({ pagina }),
  setEditIdx: (idx) => {
    if (idx !== null) {
      const modulo = get().modulos[idx];
      set({
        editIdx: idx,
        editModulo: {
          titulo: modulo.titulo,
          descripcion: modulo.descripcion,
          imagen_url: modulo.imagen_url || '',
          color: modulo.color || '#fff'
        }
      });
    } else {
      set({ editIdx: null });
    }
  },
  setShowEditModal: (show) => set({ showEditModal: show }),
  setEditModulo: (modulo) => set(state => ({ 
    editModulo: { ...state.editModulo, ...modulo } 
  })),
  setSaveMsg: (msg) => set({ saveMsg: msg }),
  setOrderMsg: (msg) => set({ orderMsg: msg }),

  handleSaveEdit: async () => {
    const { editIdx, editModulo, modulos } = get();
    set({ saveMsg: null });

    try {
      if (editIdx === null) {
        const { error } = await supabase.from('classroom_modulos').insert({
          ...editModulo,
          icono: '',
          orden: modulos.length + 1,
          badge_url: ''
        });
        if (error) throw error;
        set({ saveMsg: '¡Módulo creado con éxito!' });
      } else {
        const mod = modulos[editIdx];
        if (mod.id) {
          const { error } = await supabase
            .from('classroom_modulos')
            .update(editModulo)
            .eq('id', mod.id);
          if (error) throw error;
          set({ saveMsg: '¡Módulo actualizado con éxito!' });
        }
      }
      await get().fetchModulos();
      set({ showEditModal: false });
    } catch (error) {
      console.error('Error saving módulo:', error);
      set({ 
        saveMsg: `Error al ${editIdx === null ? 'crear' : 'actualizar'} el módulo: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      });
    }
  },

  handleDragEnd: async (sourceIdx, destIdx) => {
    if (sourceIdx === destIdx) return;

    const newModulos = Array.from(get().modulos);
    const [removed] = newModulos.splice(sourceIdx, 1);
    newModulos.splice(destIdx, 0, removed);

    set({ modulos: newModulos });

    try {
      for (let i = 0; i < newModulos.length; i++) {
        if (newModulos[i].id) {
          const { error } = await supabase
            .from('classroom_modulos')
            .update({ orden: i + 1 })
            .eq('id', newModulos[i].id);
          if (error) throw error;
        }
      }
      await get().fetchModulos();
    } catch (error) {
      console.error('Error updating order:', error);
      set({ 
        orderMsg: `Error al actualizar el orden: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      });
    }
  },

  handleDelete: async (idx) => {
    const modulo = get().modulos[idx];
    if (!modulo.id) return;

    try {
      const { error } = await supabase
        .from('classroom_modulos')
        .delete()
        .eq('id', modulo.id);
      
      if (error) throw error;
      await get().fetchModulos();
    } catch (error) {
      console.error('Error deleting módulo:', error);
      set({ 
        saveMsg: `Error al eliminar el módulo: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      });
    }
  },

  // NUEVO: Marcar un video como completado
  marcarVideoCompletado: async (videoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Registrar el video como completado
      const { error } = await supabase
        .from('videos_completados')
        .upsert({
          usuario_id: user.id,
          video_id: videoId,
          completado_en: new Date().toISOString()
        });

      if (error) throw error;

      // Actualizar progreso y nivel académico
      await registrarProgresoAcademico(user.id, 'video', videoId);

      // Opcional: Mostrar mensaje de éxito
      set({ saveMsg: '¡Video completado!' });
      setTimeout(() => set({ saveMsg: null }), 2000);
    } catch (error) {
      console.error('Error al marcar video como completado:', error);
      set({ saveMsg: 'Error al marcar el video como completado' });
    }
  },

  // NUEVO: Marcar un módulo como completado
  marcarModuloCompletado: async (moduloId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Registrar el módulo como completado
      const { error } = await supabase
        .from('modulos_completados')
        .upsert({
          usuario_id: user.id,
          modulo_id: moduloId,
          completado_en: new Date().toISOString()
        });

      if (error) throw error;

      // Actualizar progreso y nivel académico
      await registrarProgresoAcademico(user.id, 'modulo', moduloId);

      // Opcional: Mostrar mensaje de éxito
      set({ saveMsg: '¡Módulo completado!' });
      setTimeout(() => set({ saveMsg: null }), 2000);
    } catch (error) {
      console.error('Error al marcar módulo como completado:', error);
      set({ saveMsg: 'Error al marcar el módulo como completado' });
    }
  }
}));

export default useClassroomStore; 