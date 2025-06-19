import { supabase } from '../supabase';
import type { Video, ProgresoVideo, RecursoModulo } from '../types/video.types';

export interface VideoClassroom {
  id: string;
  modulo_id: string;
  titulo: string;
  descripcion?: string;
  url: string;
  miniatura_url?: string;
  orden: number;
  duracion: number;
  created_at: string;
  updated_at: string;
}

class ClassroomVideoService {
  // Obtener todos los videos de un módulo
  async getVideosModulo(moduloId: string): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos_classroom_modulo')
      .select('*')
      .eq('modulo_id', moduloId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Obtener el progreso de un video
  async getProgresoVideo(videoId: string, usuarioId: string): Promise<ProgresoVideo | null> {
    const { data, error } = await supabase
      .from('videos_classroom_progreso')
      .select('*')
      .eq('video_id', videoId)
      .eq('usuario_id', usuarioId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Actualizar el progreso de un video
  async actualizarProgresoVideo(
    videoId: string,
    usuarioId: string,
    tiempoVisto: number,
    porcentajeCompletado: number
  ): Promise<void> {
    const completado = porcentajeCompletado >= 90;
    const { error } = await supabase.from('videos_classroom_progreso').upsert(
      {
        video_id: videoId,
        usuario_id: usuarioId,
        tiempo_visto: tiempoVisto,
        porcentaje_completado: porcentajeCompletado,
        completado,
        ultima_reproduccion: new Date().toISOString()
      },
      {
        onConflict: 'video_id,usuario_id'
      }
    );

    if (error) throw error;
  }

  // Obtener recursos de un módulo
  async getRecursosModulo(moduloId: string): Promise<RecursoModulo[]> {
    const { data, error } = await supabase
      .from('classroom_recursos_materiales')
      .select('*')
      .eq('modulo_id', moduloId)
      .order('orden', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Agregar un recurso al módulo
  async agregarRecurso(recurso: Omit<RecursoModulo, 'id' | 'created_at' | 'updated_at'>): Promise<RecursoModulo> {
    const { data, error } = await supabase
      .from('classroom_recursos_materiales')
      .insert([recurso])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar un recurso
  async eliminarRecurso(id: string): Promise<void> {
    const { error } = await supabase
      .from('classroom_recursos_materiales')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Actualizar el progreso académico del usuario
  private async actualizarProgresoAcademico(usuarioId: string): Promise<void> {
    // Obtener el total de videos completados
    const { count: videosCompletados } = await supabase
      .from('progreso_videos_classroom')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)
      .eq('completado', true);

    // Obtener el nivel actual del usuario
    const { data: nivelActual } = await supabase
      .from('niveles_academicos')
      .select('*')
      .lte('videos_requeridos', videosCompletados || 0)
      .order('videos_requeridos', { ascending: false })
      .limit(1)
      .single();

    if (nivelActual) {
      // Actualizar el nivel del usuario si es necesario
      const { error } = await supabase
        .from('usuarios')
        .update({ nivel_academico_id: nivelActual.id })
        .eq('id', usuarioId);

      if (error) throw error;
    }
  }

  // Obtener estadísticas de progreso del usuario
  async getEstadisticasUsuario(usuarioId: string) {
    const { data: stats, error } = await supabase
      .from('progreso_videos_classroom')
      .select(`
        completado,
        tiempo_visto,
        porcentaje_completado,
        videos_classroom_modulo (
          duracion
        )
      `)
      .eq('usuario_id', usuarioId);

    if (error) throw error;

    const totalVideos = stats?.length || 0;
    const videosCompletados = stats?.filter(s => s.completado)?.length || 0;
    const tiempoTotalVisto = stats?.reduce((acc, s) => acc + (s.tiempo_visto || 0), 0) || 0;
    const porcentajePromedio = stats?.reduce((acc, s) => acc + (s.porcentaje_completado || 0), 0) / (totalVideos || 1);

    return {
      totalVideos,
      videosCompletados,
      tiempoTotalVisto,
      porcentajePromedio,
      porcentajeCompletado: (videosCompletados / (totalVideos || 1)) * 100
    };
  }
}

export const classroomVideoService = new ClassroomVideoService(); 