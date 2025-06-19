import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface GamificationState {
  xp: number;
  nivel: number;
  monedas: number;
  xpSiguienteNivel: number;
  logrosDesbloqueados: any[];
  ultimosLogros: any[];
}

interface VideoProgress {
  videoId: string;
  moduloId: string;
  cursoId: string;
  tipoVideo: 'curso' | 'classroom';
  tiempoVisto: number;
  porcentajeCompletado: number;
}

export const useGamification = () => {
  const [state, setState] = useState<GamificationState>({
    xp: 0,
    nivel: 1,
    monedas: 0,
    xpSiguienteNivel: 1000,
    logrosDesbloqueados: [],
    ultimosLogros: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProgresoUsuario();
  }, []);

  const cargarProgresoUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progreso } = await supabase
        .from('progreso_usuario_xp')
        .select('*')
        .eq('usuario_id', user.id)
        .single();

      const { data: logros } = await supabase
        .from('logros_usuario')
        .select(`
          *,
          logros (*)
        `)
        .eq('usuario_id', user.id)
        .order('desbloqueado_at', { ascending: false });

      if (progreso) {
        setState(prev => ({
          ...prev,
          xp: progreso.xp_actual,
          nivel: progreso.nivel_actual,
          monedas: progreso.monedas,
          xpSiguienteNivel: progreso.xp_siguiente_nivel,
          logrosDesbloqueados: logros || [],
          ultimosLogros: (logros || []).slice(0, 3)
        }));
      }
    } catch (error) {
      console.error('Error al cargar progreso:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarProgresoVideo = async (progreso: VideoProgress) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('actividad_videos_usuario')
        .upsert({
          usuario_id: user.id,
          video_id: progreso.videoId,
          modulo_id: progreso.moduloId,
          curso_id: progreso.cursoId,
          tipo_video: progreso.tipoVideo,
          tiempo_visto: progreso.tiempoVisto,
          porcentaje_completado: progreso.porcentajeCompletado,
          completado: progreso.porcentajeCompletado >= 90,
          ultima_actividad: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      // Recargar progreso para obtener XP y logros actualizados
      await cargarProgresoUsuario();

      return data;
    } catch (error) {
      console.error('Error al actualizar progreso del video:', error);
      throw error;
    }
  };

  const mostrarNotificacionLogro = (logro: any) => {
    // Aquí puedes implementar la lógica para mostrar una notificación
    // cuando se desbloquea un nuevo logro
    console.log('¡Nuevo logro desbloqueado!', logro);
  };

  return {
    ...state,
    loading,
    actualizarProgresoVideo,
    mostrarNotificacionLogro
  };
}; 