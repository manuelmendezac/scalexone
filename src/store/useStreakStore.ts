import { create } from 'zustand';
import { supabase } from '../supabase';

interface StreakState {
  racha: number;
  rachaMaxima: number;
  diasActivos: number;
  ultimoIngreso: string | null;
  loading: boolean;
  error: string | null;
  fetchRacha: () => Promise<void>;
  registrarActividad: () => Promise<void>;
}

const useStreakStore = create<StreakState>((set, get) => ({
  racha: 0,
  rachaMaxima: 0,
  diasActivos: 0,
  ultimoIngreso: null,
  loading: false,
  error: null,

  fetchRacha: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener datos de racha
      const { data: streakData, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      if (streakError) throw streakError;

      if (streakData) {
        set({
          racha: streakData.racha_actual,
          rachaMaxima: streakData.racha_maxima,
          diasActivos: streakData.dias_activos,
          ultimoIngreso: streakData.ultimo_ingreso
        });
      }
    } catch (error) {
      console.error('Error al obtener racha:', error);
      set({ error: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      set({ loading: false });
    }
  },

  registrarActividad: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Registrar actividad diaria
      const { error: activityError } = await supabase
        .from('user_daily_activity')
        .upsert({
          usuario_id: user.id,
          fecha: new Date().toISOString().split('T')[0],
          actividades_completadas: 1
        });

      if (activityError) throw activityError;

      // Actualizar estado local
      await get().fetchRacha();
    } catch (error) {
      console.error('Error al registrar actividad:', error);
      set({ error: error instanceof Error ? error.message : 'Error desconocido' });
    } finally {
      set({ loading: false });
    }
  }
}));

export default useStreakStore; 