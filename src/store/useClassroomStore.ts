import { create } from 'zustand';
import { supabase } from '../supabase';
import { CLASSROOM_REWARDS } from '../services/classroomGamificationService';
import { useAuth } from '../hooks/useAuth';
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
  cover_type?: string;
  cover_video_url?: string;
  // Nuevos campos para progreso y recompensas
  total_videos?: number;
  videos_completados?: number;
  recompensa_xp?: number;
  recompensa_monedas?: number;
};

interface EditModulo extends Partial<Modulo> {}

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
  
  fetchModulos: () => Promise<void>;
  setPagina: (pagina: number) => void;
  setEditIdx: (idx: number | null) => void;
  setShowEditModal: (show: boolean) => void;
  setEditModulo: (modulo: EditModulo) => void;
  setSaveMsg: (msg: string | null) => void;
  setOrderMsg: (msg: string | null) => void;
  handleSaveEdit: (currentEditModulo?: Modulo) => Promise<void>;
  handleDragEnd: (sourceIdx: number, destIdx: number) => Promise<void>;
  handleDelete: (idx: number) => Promise<void>;
  marcarVideoCompletado: (videoId: string) => Promise<void>;
  marcarModuloCompletado: (moduloId: string) => Promise<void>;
}

const CACHE_DURATION = 5000; // 5 segundos

const useClassroomStore = create<ClassroomStore>((set, get) => ({
  modulos: [],
  loading: false,
  error: null,
  lastFetch: null,
  pagina: 1,
  editIdx: null,
  showEditModal: false,
  editModulo: {},
  saveMsg: null,
  orderMsg: null,

  fetchModulos: async () => {
    const { user } = useAuth.getState();
    const userId = user?.id;

    set({ loading: true, error: null });

    try {
      // 1. Fetch todos los módulos y todos los videos en paralelo
      const [modulosRes, videosRes, progresoRes] = await Promise.all([
        supabase.from('classroom_modulos').select('*').order('orden', { ascending: true }),
        supabase.from('videos_classroom_modulo').select('id, modulo_id'),
        userId ? supabase.from('progreso_academico_usuario').select('videos_ids').eq('usuario_id', userId).single() : Promise.resolve({ data: null, error: null })
      ]);

      if (modulosRes.error) throw modulosRes.error;
      if (videosRes.error) throw videosRes.error;
      if (progresoRes.error && progresoRes.error.code !== 'PGRST116') throw progresoRes.error;

      const todosLosModulos = modulosRes.data || [];
      const todosLosVideos = videosRes.data || [];
      const videosCompletadosSet = new Set((progresoRes.data?.videos_ids as string[] | null) || []);

      // 2. Procesar y enriquecer los datos
      const videosPorModulo = todosLosVideos.reduce((acc, video) => {
        if (!acc[video.modulo_id]) {
          acc[video.modulo_id] = [];
        }
        acc[video.modulo_id].push(video.id);
        return acc;
      }, {} as Record<string, string[]>);

      const modulosEnriquecidos = todosLosModulos.map(mod => {
        const videosDelModulo = videosPorModulo[mod.id] || [];
        const videosCompletados = videosDelModulo.filter(videoId => videosCompletadosSet.has(videoId)).length;
        
        return {
          ...mod,
          total_videos: videosDelModulo.length,
          videos_completados: videosCompletados,
          recompensa_xp: videosDelModulo.length * CLASSROOM_REWARDS.VIDEO_COMPLETADO.xp,
          recompensa_monedas: videosDelModulo.length * CLASSROOM_REWARDS.VIDEO_COMPLETADO.monedas
        };
      });

      set({
        modulos: modulosEnriquecidos,
        lastFetch: Date.now(),
        loading: false
      });

    } catch (error) {
      console.error('Error fetching módulos:', error);
      set({ error: error instanceof Error ? error.message : 'Error al cargar los módulos', loading: false });
    }
  },

  setPagina: (pagina) => set({ pagina }),
  
  setEditIdx: (idx) => {
    if (idx !== null) {
      const modulo = get().modulos[idx];
      set({ editIdx: idx, editModulo: { ...modulo } });
    } else {
      set({ editIdx: null, editModulo: {} });
    }
  },
  
  setShowEditModal: (show) => set({ showEditModal: show }),
  
  setEditModulo: (modulo) => set(state => ({ 
    editModulo: { ...state.editModulo, ...modulo } 
  })),
  
  setSaveMsg: (msg) => {
    set({ saveMsg: msg });
    setTimeout(() => set({ saveMsg: null }), 3000);
  },
  
  setOrderMsg: (msg) => {
    set({ orderMsg: msg });
    setTimeout(() => set({ orderMsg: null }), 3000);
  },

  handleSaveEdit: async (currentEditModulo) => {
    const { editIdx, modulos } = get();
    const finalEditModulo = { ...get().editModulo, ...currentEditModulo };
    set({ saveMsg: null });

    try {
      const dataToSave = {
        titulo: finalEditModulo.titulo,
        descripcion: finalEditModulo.descripcion,
        imagen_url: finalEditModulo.imagen_url,
        cover_type: finalEditModulo.cover_type,
        cover_video_url: finalEditModulo.cover_video_url,
      };

      if (editIdx === null) {
        const { error } = await supabase.from('classroom_modulos').insert({
          ...dataToSave,
          orden: modulos.length + 1,
        });
        if (error) throw error;
        get().setSaveMsg('¡Módulo creado con éxito!');
      } else {
        const mod = modulos[editIdx];
        if (mod.id) {
          const { error } = await supabase
            .from('classroom_modulos')
            .update(dataToSave)
            .eq('id', mod.id);
          if (error) throw error;
          get().setSaveMsg('¡Módulo actualizado con éxito!');
        }
      }
      await get().fetchModulos();
      set({ showEditModal: false, editIdx: null, editModulo: {} });
    } catch (error) {
      console.error('Error saving módulo:', error);
      get().setSaveMsg(`Error al ${editIdx === null ? 'crear' : 'actualizar'} el módulo.`);
    }
  },

  handleDragEnd: async (sourceIdx, destIdx) => {
    if (sourceIdx === destIdx) return;
    const newModulos = Array.from(get().modulos);
    const [removed] = newModulos.splice(sourceIdx, 1);
    newModulos.splice(destIdx, 0, removed);
    set({ modulos: newModulos });

    try {
      const updates = newModulos.map((mod, index) =>
        supabase
          .from('classroom_modulos')
          .update({ orden: index })
          .eq('id', mod.id)
      );
      await Promise.all(updates);
      await get().fetchModulos();
    } catch (error) {
      console.error('Error updating order:', error);
      get().setOrderMsg('Error al actualizar el orden.');
    }
  },

  handleDelete: async (idx) => {
    const modulo = get().modulos[idx];
    if (!modulo.id) return;
    try {
      const { error } = await supabase.from('classroom_modulos').delete().eq('id', modulo.id);
      if (error) throw error;
      get().setSaveMsg('Módulo eliminado con éxito');
      await get().fetchModulos();
    } catch (error) {
      console.error('Error deleting módulo:', error);
      get().setSaveMsg('Error al eliminar el módulo.');
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
      get().setSaveMsg('¡Video completado!');
      setTimeout(() => get().setSaveMsg(null), 2000);
    } catch (error) {
      console.error('Error al marcar video como completado:', error);
      get().setSaveMsg('Error al marcar el video como completado');
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
      get().setSaveMsg('¡Módulo completado!');
      setTimeout(() => get().setSaveMsg(null), 2000);
    } catch (error) {
      console.error('Error al marcar módulo como completado:', error);
      get().setSaveMsg('Error al marcar el módulo como completado');
    }
  }
}));

export default useClassroomStore; 