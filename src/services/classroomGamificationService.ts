import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

// Constantes de recompensas para classroom
export const CLASSROOM_REWARDS = {
  VIDEO_COMPLETADO: {
    xp: 25,
    monedas: 1
  },
  MODULO_COMPLETADO: {
    xp: 100,
    monedas: 5
  },
  RACHA_DIARIA: {
    xp: 10,
    monedas: 1
  },
  PRIMER_VIDEO_DIA: {
    xp: 15,
    monedas: 2
  }
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
  private neuro = useNeuroState.getState();

  // Actualizar progreso de video y dar recompensas
  async actualizarProgresoVideo(
    videoId: string,
    usuarioId: string,
    tiempoVisto: number,
    porcentajeCompletado: number
  ): Promise<{ xpGanado: number; monedasGanadas: number; mensaje: string }> {
    const completado = porcentajeCompletado >= 90;
    let xpGanado = 0;
    let monedasGanadas = 0;
    let mensaje = '';

    try {
      // 1. Actualizar progreso en la base de datos
      const { error: progresoError } = await supabase
        .from('progreso_videos_classroom')
        .upsert({
          video_id: videoId,
          usuario_id: usuarioId,
          tiempo_visto: tiempoVisto,
          porcentaje_completado: porcentajeCompletado,
          completado,
          ultima_reproduccion: new Date().toISOString()
        }, {
          onConflict: 'usuario_id,video_id'
        });

      if (progresoError) throw progresoError;

      // 2. Si completó el video, verificar si ya se dio recompensa
      if (completado) {
        const { data: progresoExistente } = await supabase
          .from('progreso_videos_classroom')
          .select('recompensa_reclamada')
          .eq('video_id', videoId)
          .eq('usuario_id', usuarioId)
          .single();

        if (!progresoExistente?.recompensa_reclamada) {
          // Dar recompensa por completar video
          xpGanado += CLASSROOM_REWARDS.VIDEO_COMPLETADO.xp;
          monedasGanadas += CLASSROOM_REWARDS.VIDEO_COMPLETADO.monedas;

          // Verificar si es el primer video del día
          const esPrimerVideoDia = await this.verificarPrimerVideoDia(usuarioId);
          if (esPrimerVideoDia) {
            xpGanado += CLASSROOM_REWARDS.PRIMER_VIDEO_DIA.xp;
            monedasGanadas += CLASSROOM_REWARDS.PRIMER_VIDEO_DIA.monedas;
            mensaje += '¡Primer video del día! +15 XP, +2 Monedas. ';
          }

          // Marcar recompensa como reclamada
          await supabase
            .from('progreso_videos_classroom')
            .update({ recompensa_reclamada: true })
            .eq('video_id', videoId)
            .eq('usuario_id', usuarioId);

          // Actualizar estado global
          this.neuro.addXP(xpGanado);
          this.neuro.addCoins(monedasGanadas);

          mensaje += `¡Video completado! +${CLASSROOM_REWARDS.VIDEO_COMPLETADO.xp} XP, +${CLASSROOM_REWARDS.VIDEO_COMPLETADO.monedas} Moneda. `;

          // 3. Verificar si completó el módulo
          const moduloCompletado = await this.verificarModuloCompletado(videoId, usuarioId);
          if (moduloCompletado) {
            const recompensaModulo = await this.darRecompensaModulo(moduloCompletado.modulo_id, usuarioId);
            if (recompensaModulo) {
              xpGanado += recompensaModulo.xp;
              monedasGanadas += recompensaModulo.monedas;
              mensaje += `¡Módulo completado! +${recompensaModulo.xp} XP, +${recompensaModulo.monedas} Monedas. `;
            }
          }
        }
      }

      return { xpGanado, monedasGanadas, mensaje: mensaje.trim() };
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
      throw error;
    }
  }

  // Verificar si es el primer video del día
  private async verificarPrimerVideoDia(usuarioId: string): Promise<boolean> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { data: videosHoy } = await supabase
      .from('progreso_videos_classroom')
      .select('created_at')
      .eq('usuario_id', usuarioId)
      .gte('created_at', hoy.toISOString());

    return !videosHoy || videosHoy.length === 0;
  }

  // Verificar si completó un módulo
  private async verificarModuloCompletado(videoId: string, usuarioId: string): Promise<{ modulo_id: string } | null> {
    // Obtener el módulo del video
    const { data: video } = await supabase
      .from('videos_classroom_modulo')
      .select('modulo_id')
      .eq('id', videoId)
      .single();

    if (!video) return null;

    // Contar videos del módulo
    const { data: totalVideos } = await supabase
      .from('videos_classroom_modulo')
      .select('id', { count: 'exact' })
      .eq('modulo_id', video.modulo_id);

    // Contar videos completados por el usuario
    const { data: videosCompletados } = await supabase
      .from('progreso_videos_classroom')
      .select('video_id')
      .eq('usuario_id', usuarioId)
      .eq('completado', true);

    // Obtener IDs de videos del módulo
    const { data: videosModulo } = await supabase
      .from('videos_classroom_modulo')
      .select('id')
      .eq('modulo_id', video.modulo_id);

    if (!videosModulo || !videosCompletados) return null;

    const videosModuloIds = videosModulo.map(v => v.id);
    const videosCompletadosIds = videosCompletados.map(v => v.video_id);
    const videosCompletadosDelModulo = videosCompletadosIds.filter(id => videosModuloIds.includes(id));

    // Verificar si todos los videos del módulo están completados
    if (videosCompletadosDelModulo.length === videosModuloIds.length) {
      return { modulo_id: video.modulo_id };
    }

    return null;
  }

  // Dar recompensa por completar módulo
  private async darRecompensaModulo(moduloId: string, usuarioId: string): Promise<{ xp: number; monedas: number } | null> {
    try {
      // Verificar si ya se dio la recompensa del módulo
      const { data: progresoModulo } = await supabase
        .from('progreso_modulos_classroom')
        .select('recompensa_reclamada')
        .eq('modulo_id', moduloId)
        .eq('usuario_id', usuarioId)
        .single();

      if (progresoModulo?.recompensa_reclamada) {
        return null; // Ya se dio la recompensa
      }

      // Marcar módulo como completado y recompensa reclamada
      await supabase
        .from('progreso_modulos_classroom')
        .upsert({
          modulo_id: moduloId,
          usuario_id: usuarioId,
          completado: true,
          fecha_completado: new Date().toISOString(),
          recompensa_reclamada: true
        }, {
          onConflict: 'modulo_id,usuario_id'
        });

      // Actualizar estado global
      this.neuro.addXP(CLASSROOM_REWARDS.MODULO_COMPLETADO.xp);
      this.neuro.addCoins(CLASSROOM_REWARDS.MODULO_COMPLETADO.monedas);

      return {
        xp: CLASSROOM_REWARDS.MODULO_COMPLETADO.xp,
        monedas: CLASSROOM_REWARDS.MODULO_COMPLETADO.monedas
      };
    } catch (error) {
      console.error('Error al dar recompensa del módulo:', error);
      return null;
    }
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
        recompensa_reclamada: false // Esto se verificaría desde la tabla progreso_modulos_classroom
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
        xpTotal: this.neuro.userXP,
        monedasTotal: this.neuro.userCoins
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

  // Calcular racha actual (días consecutivos viendo videos)
  private async calcularRachaActual(usuarioId: string): Promise<number> {
    try {
      const { data: fechasVideos } = await supabase
        .from('progreso_videos_classroom')
        .select('created_at')
        .eq('usuario_id', usuarioId)
        .eq('completado', true)
        .order('created_at', { ascending: false });

      if (!fechasVideos || fechasVideos.length === 0) return 0;

      // Convertir fechas a días únicos
      const diasUnicos = [...new Set(
        fechasVideos.map(v => new Date(v.created_at).toDateString())
      )].sort().reverse();

      let racha = 0;
      const hoy = new Date();
      let fechaActual = new Date(hoy);

      for (let i = 0; i < diasUnicos.length; i++) {
        const diaVideo = new Date(diasUnicos[i]);
        const diferenciaDias = Math.floor((fechaActual.getTime() - diaVideo.getTime()) / (1000 * 60 * 60 * 24));

        if (diferenciaDias === racha) {
          racha++;
        } else {
          break;
        }
      }

      return racha;
    } catch (error) {
      console.error('Error al calcular racha:', error);
      return 0;
    }
  }
}

export default new ClassroomGamificationService(); 