import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

// ========================================================================
// REGLAS DE RECOMPENSA SIMPLIFICADAS (Según solicitud)
// ========================================================================
export const CLASSROOM_REWARDS = {
  VIDEO_COMPLETADO: {
    xp: 10,
    monedas: 1
  },
  // Se eliminan los bonus para una lógica más clara
};

export interface VideoProgress {
  video_id: string;
  usuario_id: string;
  tiempo_visto: number;
  porcentaje_completado: number;
  completado: boolean;
  ultima_reproduccion: string;
  recompensa_reclamada: boolean;
}

export interface ModuloProgress {
  modulo_id: string;
  usuario_id: string;
  videos_completados: number;
  total_videos: number;
  completado: boolean;
  fecha_completado?: string;
  recompensa_reclamada: boolean;
}

class ClassroomGamificationService {
  private static instance: ClassroomGamificationService;

  private constructor() {}

  public static getInstance(): ClassroomGamificationService {
    if (!ClassroomGamificationService.instance) {
      ClassroomGamificationService.instance = new ClassroomGamificationService();
    }
    return ClassroomGamificationService.instance;
  }

  // Verificar si es el primer video del día
  private async verificarPrimerVideoDia(usuarioId: string): Promise<boolean> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { data: videosHoy } = await supabase
      .from('progreso_videos_classroom')
      .select('video_id')
      .eq('usuario_id', usuarioId)
      .gte('ultima_reproduccion', hoy.toISOString())
      .limit(1);

    return !videosHoy || videosHoy.length === 0;
  }

  // Calcular racha actual
  private async calcularRachaActual(usuarioId: string): Promise<number> {
    const { data: ultimoProgreso } = await supabase
      .from('progreso_videos_classroom')
      .select('ultima_reproduccion')
      .eq('usuario_id', usuarioId)
      .order('ultima_reproduccion', { ascending: false })
      .limit(1)
      .single();

    if (!ultimoProgreso) return 0;

    const ultimaReproduccion = new Date(ultimoProgreso.ultima_reproduccion);
    const hoy = new Date();
    const diferenciaDias = Math.floor((hoy.getTime() - ultimaReproduccion.getTime()) / (1000 * 60 * 60 * 24));

    if (diferenciaDias > 1) return 0;
    
    const { data: racha } = await supabase
      .from('rachas_usuario')
      .select('dias_consecutivos')
      .eq('usuario_id', usuarioId)
      .single();

    return racha?.dias_consecutivos || 1;
  }

  // Actualizar progreso de video y dar recompensas
  async actualizarProgresoVideo(
    videoId: string,
    usuarioId: string,
    tiempoVisto: number,
    porcentajeCompletado: number
  ): Promise<{ xpGanado: number; monedasGanadas: number; mensaje: string }> {
    const completado = porcentajeCompletado >= 100;

    if (!completado) {
      // Si el video no está completo, no hacemos nada más.
      return { xpGanado: 0, monedasGanadas: 0, mensaje: '' };
    }

    // 1. Marcar el video como completado en la base de datos.
    await supabase
      .from('progreso_videos_classroom')
      .upsert({
        video_id: videoId,
        usuario_id: usuarioId,
        tiempo_visto: tiempoVisto,
        porcentaje_completado: porcentajeCompletado,
        completado: true,
        ultima_reproduccion: new Date().toISOString(),
        recompensa_reclamada: true, // Marcamos que la recompensa individual (ahora inexistente) está "reclamada"
      }, { onConflict: 'usuario_id,video_id' });

    // 2. Verificar si el módulo completo se ha alcanzado AHORA.
    const moduloInfo = await this.verificarModuloCompletado(videoId, usuarioId);

    if (moduloInfo && !moduloInfo.recompensaReclamada) {
      // 3. Si el módulo está completo Y la recompensa no se ha dado, calcular y dar la recompensa TOTAL.
      return await this.darRecompensaTotalPorModulo(moduloInfo.modulo_id, usuarioId, moduloInfo.totalVideos);
    }

    // 4. Si el módulo no está completo, no devolver ninguna recompensa.
    return { xpGanado: 0, monedasGanadas: 0, mensaje: '' };
  }

  private async verificarModuloCompletado(videoId: string, usuarioId: string): Promise<{ modulo_id: string; totalVideos: number; recompensaReclamada: boolean } | null> {
    const { data: video } = await supabase.from('videos_classroom_modulo').select('modulo_id').eq('id', videoId).single();
    if (!video) return null;
    const { modulo_id } = video;

    const { data: videosDelModulo, error: videosError } = await supabase
      .from('videos_classroom_modulo')
      .select('id')
      .eq('modulo_id', modulo_id);
    if (videosError || !videosDelModulo) return null;

    const { data: videosCompletados, error: progresoError } = await supabase
      .from('progreso_videos_classroom')
      .select('video_id')
      .eq('usuario_id', usuarioId)
      .eq('completado', true)
      .in('video_id', videosDelModulo.map(v => v.id));

    if (progresoError || videosCompletados === null) return null;
    
    if (videosCompletados.length === videosDelModulo.length) {
      const { data: progresoModulo } = await supabase
        .from('progreso_modulos_classroom')
        .select('recompensa_reclamada')
        .eq('modulo_id', modulo_id)
        .eq('usuario_id', usuarioId)
        .single();
        
      return { 
        modulo_id, 
        totalVideos: videosDelModulo.length, 
        recompensaReclamada: progresoModulo?.recompensa_reclamada || false 
      };
    }

    return null;
  }

  private async darRecompensaTotalPorModulo(moduloId: string, usuarioId: string, totalVideos: number): Promise<{ xpGanado: number; monedasGanadas: number; mensaje: string }> {
    const xpPorVideos = totalVideos * CLASSROOM_REWARDS.VIDEO_COMPLETADO.xp;
    const monedasPorVideos = totalVideos * CLASSROOM_REWARDS.VIDEO_COMPLETADO.monedas;

    const neuro = useNeuroState.getState();
    neuro.addXP(xpPorVideos);
    neuro.addCoins(monedasPorVideos);
    
    await supabase.from('progreso_modulos_classroom').upsert({
      modulo_id: moduloId,
      usuario_id: usuarioId,
      recompensa_reclamada: true,
      completado: true,
      fecha_completado: new Date().toISOString()
    }, { onConflict: 'modulo_id,usuario_id' });

    return {
      xpGanado: xpPorVideos,
      monedasGanadas: monedasPorVideos,
      mensaje: `¡Módulo completado! Has ganado un total de +${xpPorVideos} XP y +${monedasPorVideos} Monedas.`
    };
  }

  // Obtener progreso de un módulo
  async obtenerProgresoModulo(moduloId: string, usuarioId: string): Promise<ModuloProgress | null> {
    try {
      const { data: videos } = await supabase
        .from('videos_classroom_modulo')
        .select('id')
        .eq('modulo_id', moduloId);

      if (!videos) return null;

      const { data: videosCompletados } = await supabase
        .from('progreso_videos_classroom')
        .select('video_id')
        .eq('usuario_id', usuarioId)
        .eq('completado', true);

      if (!videosCompletados) {
        return {
          modulo_id: moduloId,
          usuario_id: usuarioId,
          videos_completados: 0,
          total_videos: videos.length,
          completado: false,
          recompensa_reclamada: false
        };
      }

      const videosCompletadosIds = videosCompletados.map(v => v.video_id);
      const videosCompletadosDelModulo = videosCompletadosIds.filter(id => 
        videos.some(v => v.id === id)
      );

      const completado = videosCompletadosDelModulo.length === videos.length;

      return {
        modulo_id: moduloId,
        usuario_id: usuarioId,
        videos_completados: videosCompletadosDelModulo.length,
        total_videos: videos.length,
        completado,
        recompensa_reclamada: false
      };
    } catch (error) {
      console.error('Error al obtener progreso del módulo:', error);
      return null;
    }
  }

  // Obtener estadísticas del usuario
  async obtenerEstadisticasUsuario(usuarioId: string): Promise<{
    totalVideosCompletados: number;
    totalModulosCompletados: number;
    rachaActual: number;
    xpTotal: number;
    monedasTotal: number;
  }> {
    try {
      // Videos completados
      const { data: videosCompletados } = await supabase
        .from('progreso_videos_classroom')
        .select('video_id')
        .eq('usuario_id', usuarioId)
        .eq('completado', true);

      // Módulos completados
      const { data: modulosCompletados } = await supabase
        .from('progreso_modulos_classroom')
        .select('modulo_id')
        .eq('usuario_id', usuarioId)
        .eq('completado', true);

      // Calcular racha (implementación básica)
      const rachaActual = await this.calcularRachaActual(usuarioId);

      return {
        totalVideosCompletados: videosCompletados?.length || 0,
        totalModulosCompletados: modulosCompletados?.length || 0,
        rachaActual,
        xpTotal: useNeuroState.getState().userXP,
        monedasTotal: useNeuroState.getState().userCoins
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        totalVideosCompletados: 0,
        totalModulosCompletados: 0,
        rachaActual: 0,
        xpTotal: 0,
        monedasTotal: 0
      };
    }
  }
}

export default ClassroomGamificationService.getInstance(); 