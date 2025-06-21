import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import { actualizarNivelAcademico } from '../utils/actualizarNivelUsuario';

// ========================================================================
// CONSTANTES DE RECOMPENSAS
// ========================================================================

export const CLASSROOM_REWARDS = {
  VIDEO_COMPLETADO: { xp: 10, monedas: 1 },
  MODULO_COMPLETADO: { xp: 0, monedas: 0 },
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
    moduloId: string,
    usuarioId: string
  ): Promise<{ xpGanado: number; monedasGanadas: number; mensaje: string; moduloCompletado: boolean }> {
    
    // 1. Obtener el progreso académico actual del usuario
    let { data: progreso, error: fetchError } = await supabase
      .from('progreso_academico_usuario')
      .select('videos_ids, videos_completados')
      .eq('usuario_id', usuarioId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error al obtener el progreso del usuario:', fetchError);
      return { xpGanado: 0, monedasGanadas: 0, mensaje: 'Error al obtener progreso.', moduloCompletado: false };
    }
    
    // Si no existe progreso, creamos un registro inicial
    if (!progreso) {
      progreso = { videos_ids: [], videos_completados: 0 };
    }

    // 2. Verificar si el video ya fue completado
    const videosVistos = new Set(progreso.videos_ids || []);
    if (videosVistos.has(videoId)) {
      console.log(`El video ${videoId} ya fue completado anteriormente.`);
      return { xpGanado: 0, monedasGanadas: 0, mensaje: 'Video ya completado.', moduloCompletado: false };
    }

    // 3. Actualizar el progreso
    const nuevosVideosIds = [...videosVistos, videoId];
    const nuevosVideosCompletados = (progreso.videos_completados || 0) + 1;

    const { error: updateError } = await supabase
      .from('progreso_academico_usuario')
      .upsert({
        usuario_id: usuarioId,
        videos_ids: nuevosVideosIds,
        videos_completados: nuevosVideosCompletados,
        ultima_actividad: new Date().toISOString(),
      }, { onConflict: 'usuario_id' });

    if (updateError) {
      console.error('Error al actualizar el progreso del usuario:', updateError);
      return { xpGanado: 0, monedasGanadas: 0, mensaje: 'Error al guardar progreso.', moduloCompletado: false };
    }
    
    // Se ha actualizado el progreso, ahora verificamos si sube de nivel
    await actualizarNivelAcademico(usuarioId);

    // 4. Otorgar recompensa por el video
    const { xp, monedas } = CLASSROOM_REWARDS.VIDEO_COMPLETADO;
    const neuro = useNeuroState.getState();
    neuro.addXP(xp);
    neuro.addCoins(monedas);

    // 5. Verificar si el módulo se completó
    let moduloCompletado = false;
    const { data: videosDelModulo } = await supabase
      .from('videos_classroom_modulo')
      .select('id')
      .eq('modulo_id', moduloId);

    if (videosDelModulo) {
        const idVideosDelModulo = new Set(videosDelModulo.map(v => v.id));
        const videosVistosDelModulo = nuevosVideosIds.filter(id => idVideosDelModulo.has(id));

        if (videosVistosDelModulo.length === idVideosDelModulo.size) {
            moduloCompletado = true;
            console.log(`¡Módulo ${moduloId} completado!`);
        }
    }

    return {
      xpGanado: xp,
      monedasGanadas: monedas,
      mensaje: `¡Video completado! +${xp} XP, +${monedas} Monedas.`,
      moduloCompletado,
    };
  }

  // NUEVA FUNCIÓN: Registrar la finalización de un módulo
  async registrarModuloCompletado(
    moduloId: string,
    usuarioId: string
  ): Promise<{ xpGanado: number; monedasGanadas: number; mensaje: string } | null> {
    
    // 1. Obtener el progreso académico actual del usuario
    const { data: progreso, error: fetchError } = await supabase
      .from('progreso_academico_usuario')
      .select('modulos_ids, modulos_completados')
      .eq('usuario_id', usuarioId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error al obtener el progreso del usuario:', fetchError);
      return null;
    }
    
    // 2. Verificar si el módulo ya fue completado para evitar duplicados
    const modulosCompletadosSet = new Set(progreso?.modulos_ids || []);
    if (modulosCompletadosSet.has(moduloId)) {
      console.log(`El módulo ${moduloId} ya fue completado anteriormente.`);
      return null; // No hacer nada si ya está completado
    }

    // 3. Actualizar el progreso del módulo
    const nuevosModulosIds = [...modulosCompletadosSet, moduloId];
    const nuevosModulosCompletados = (progreso?.modulos_completados || 0) + 1;

    const { error: updateError } = await supabase
      .from('progreso_academico_usuario')
      .upsert({
        usuario_id: usuarioId,
        modulos_ids: nuevosModulosIds,
        modulos_completados: nuevosModulosCompletados,
        ultima_actividad: new Date().toISOString(),
      }, { onConflict: 'usuario_id' });

    if (updateError) {
      console.error('Error al actualizar el progreso del módulo:', updateError);
      return null;
    }
    
    // 4. Otorgar recompensa por el módulo
    const { xp, monedas } = CLASSROOM_REWARDS.MODULO_COMPLETADO;
    const neuro = useNeuroState.getState();
    neuro.addXP(xp);
    neuro.addCoins(monedas);

    // 5. Verificar si el usuario sube de nivel después de completar el módulo
    await actualizarNivelAcademico(usuarioId);

    console.log(`Recompensa por módulo ${moduloId} otorgada: ${xp} XP, ${monedas} Monedas.`);

    return {
      xpGanado: xp,
      monedasGanadas: monedas,
      mensaje: `¡Módulo completado! +${xp} XP, +${monedas} Monedas.`,
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