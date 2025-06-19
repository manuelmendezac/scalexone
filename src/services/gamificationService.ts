import { supabase } from '../supabase';

export interface VideoActivity {
  video_id: string;
  modulo_id: string;
  curso_id: string;
  tipo_video: 'curso' | 'classroom';
  completado: boolean;
  tiempo_visto: number;
  porcentaje_completado: number;
}

export interface ModuloActivity {
  modulo_id: string;
  curso_id: string;
  tipo_modulo: 'curso' | 'classroom';
  completado: boolean;
  videos_completados: number;
  total_videos: number;
  porcentaje_completado: number;
}

export interface CursoActivity {
  curso_id: string;
  completado: boolean;
  modulos_completados: number;
  total_modulos: number;
  videos_completados: number;
  total_videos: number;
  porcentaje_completado: number;
}

export interface UserProgress {
  nivel_actual: number;
  xp_actual: number;
  xp_siguiente_nivel: number;
  monedas: number;
  titulo_nivel: string;
  descripcion_nivel: string;
}

export interface Achievement {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  xp_recompensa: number;
  monedas_recompensa: number;
  icono: string;
  color: string;
  desbloqueado: boolean;
  desbloqueado_at?: string;
}

class GamificationService {
  // Obtener progreso del usuario
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('progreso_usuario_xp')
        .select('*')
        .eq('usuario_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        // Obtener información del nivel actual
        const { data: nivelData } = await supabase
          .from('niveles_xp')
          .select('titulo, descripcion')
          .eq('nivel', data.nivel_actual)
          .single();

        return {
          nivel_actual: data.nivel_actual,
          xp_actual: data.xp_actual,
          xp_siguiente_nivel: data.xp_siguiente_nivel,
          monedas: data.monedas,
          titulo_nivel: nivelData?.titulo || 'Novato',
          descripcion_nivel: nivelData?.descripcion || 'Comienza tu viaje'
        };
      }

      return null;
    } catch (error) {
      console.error('Error al obtener progreso del usuario:', error);
      return null;
    }
  }

  // Registrar actividad de video
  async recordVideoActivity(userId: string, activity: VideoActivity): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('actividad_videos_usuario')
        .upsert({
          usuario_id: userId,
          ...activity,
          ultima_actividad: new Date().toISOString()
        }, {
          onConflict: 'usuario_id,video_id,tipo_video'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al registrar actividad de video:', error);
      return false;
    }
  }

  // Marcar video como completado
  async markVideoCompleted(userId: string, videoId: string, tipoVideo: 'curso' | 'classroom'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('actividad_videos_usuario')
        .update({
          completado: true,
          porcentaje_completado: 100,
          ultima_actividad: new Date().toISOString()
        })
        .eq('usuario_id', userId)
        .eq('video_id', videoId)
        .eq('tipo_video', tipoVideo);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al marcar video como completado:', error);
      return false;
    }
  }

  // Actualizar tiempo visto de video
  async updateVideoTime(userId: string, videoId: string, tipoVideo: 'curso' | 'classroom', tiempoVisto: number, porcentajeCompletado: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('actividad_videos_usuario')
        .update({
          tiempo_visto: tiempoVisto,
          porcentaje_completado: porcentajeCompletado,
          ultima_actividad: new Date().toISOString()
        })
        .eq('usuario_id', userId)
        .eq('video_id', videoId)
        .eq('tipo_video', tipoVideo);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al actualizar tiempo de video:', error);
      return false;
    }
  }

  // Registrar actividad de módulo
  async recordModuloActivity(userId: string, activity: ModuloActivity): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('actividad_modulos_usuario')
        .upsert({
          usuario_id: userId,
          ...activity,
          ultima_actividad: new Date().toISOString()
        }, {
          onConflict: 'usuario_id,modulo_id,tipo_modulo'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al registrar actividad de módulo:', error);
      return false;
    }
  }

  // Registrar actividad de curso
  async recordCursoActivity(userId: string, activity: CursoActivity): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('actividad_cursos_usuario')
        .upsert({
          usuario_id: userId,
          ...activity,
          ultima_actividad: new Date().toISOString()
        }, {
          onConflict: 'usuario_id,curso_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al registrar actividad de curso:', error);
      return false;
    }
  }

  // Obtener logros del usuario
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('logros')
        .select(`
          id,
          titulo,
          descripcion,
          tipo,
          xp_recompensa,
          monedas_recompensa,
          icono,
          color,
          logros_usuario!left(
            desbloqueado_at
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(logro => ({
        id: logro.id,
        titulo: logro.titulo,
        descripcion: logro.descripcion,
        tipo: logro.tipo,
        xp_recompensa: logro.xp_recompensa,
        monedas_recompensa: logro.monedas_recompensa,
        icono: logro.icono,
        color: logro.color,
        desbloqueado: !!logro.logros_usuario,
        desbloqueado_at: logro.logros_usuario?.[0]?.desbloqueado_at
      })) || [];
    } catch (error) {
      console.error('Error al obtener logros del usuario:', error);
      return [];
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats(userId: string) {
    try {
      const [
        { data: videosCompletados },
        { data: modulosCompletados },
        { data: cursosCompletados },
        { data: tiempoTotal },
        { data: logrosDesbloqueados }
      ] = await Promise.all([
        supabase
          .from('actividad_videos_usuario')
          .select('id')
          .eq('usuario_id', userId)
          .eq('completado', true),
        supabase
          .from('actividad_modulos_usuario')
          .select('id')
          .eq('usuario_id', userId)
          .eq('completado', true),
        supabase
          .from('actividad_cursos_usuario')
          .select('id')
          .eq('usuario_id', userId)
          .eq('completado', true),
        supabase
          .from('actividad_videos_usuario')
          .select('tiempo_visto')
          .eq('usuario_id', userId),
        supabase
          .from('logros_usuario')
          .select('id')
          .eq('usuario_id', userId)
      ]);

      const tiempoTotalSegundos = tiempoTotal?.reduce((acc, curr) => acc + (curr.tiempo_visto || 0), 0) || 0;
      const horasTotales = Math.floor(tiempoTotalSegundos / 3600);
      const minutosTotales = Math.floor((tiempoTotalSegundos % 3600) / 60);

      return {
        videos_completados: videosCompletados?.length || 0,
        modulos_completados: modulosCompletados?.length || 0,
        cursos_completados: cursosCompletados?.length || 0,
        tiempo_total: {
          segundos: tiempoTotalSegundos,
          horas: horasTotales,
          minutos: minutosTotales
        },
        logros_desbloqueados: logrosDesbloqueados?.length || 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del usuario:', error);
      return null;
    }
  }

  // Obtener historial de XP
  async getXpHistory(userId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('historial_xp')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener historial de XP:', error);
      return [];
    }
  }

  // Verificar si un video ya fue completado
  async isVideoCompleted(userId: string, videoId: string, tipoVideo: 'curso' | 'classroom'): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('actividad_videos_usuario')
        .select('completado')
        .eq('usuario_id', userId)
        .eq('video_id', videoId)
        .eq('tipo_video', tipoVideo)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.completado || false;
    } catch (error) {
      console.error('Error al verificar si video fue completado:', error);
      return false;
    }
  }

  // Obtener progreso de un módulo específico
  async getModuloProgress(userId: string, moduloId: string, tipoModulo: 'curso' | 'classroom') {
    try {
      const { data, error } = await supabase
        .from('actividad_modulos_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .eq('modulo_id', moduloId)
        .eq('tipo_modulo', tipoModulo)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener progreso del módulo:', error);
      return null;
    }
  }

  // Obtener progreso de un curso específico
  async getCursoProgress(userId: string, cursoId: string) {
    try {
      const { data, error } = await supabase
        .from('actividad_cursos_usuario')
        .select('*')
        .eq('usuario_id', userId)
        .eq('curso_id', cursoId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener progreso del curso:', error);
      return null;
    }
  }
}

export const gamificationService = new GamificationService(); 