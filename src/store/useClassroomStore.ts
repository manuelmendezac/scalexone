import { create } from 'zustand';
import { supabase } from '../supabase';

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

interface ClassroomStore {
  modulos: Modulo[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  pagina: number;
  editIdx: number | null;
  showEditModal: boolean;
  editModulo: {
    titulo: string;
    descripcion: string;
    imagen_url: string;
    color: string;
  };
  saveMsg: string | null;
  orderMsg: string | null;
  
  // Acciones
  fetchModulos: () => Promise<void>;
  setPagina: (pagina: number) => void;
  setEditIdx: (idx: number | null) => void;
  setShowEditModal: (show: boolean) => void;
  setEditModulo: (modulo: Partial<typeof editModulo>) => void;
  setSaveMsg: (msg: string | null) => void;
  setOrderMsg: (msg: string | null) => void;
  handleSaveEdit: () => Promise<void>;
  handleDragEnd: (sourceIdx: number, destIdx: number) => Promise<void>;
  handleDelete: (idx: number) => Promise<void>;
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
  }
}));

export default useClassroomStore; 