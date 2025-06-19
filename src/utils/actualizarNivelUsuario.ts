import { supabase } from '../supabase';

// Actualiza el nivel de ventas del usuario según las metas configuradas
export async function actualizarNivelVentas(usuario_id: string) {
  // 1. Obtener ventas acumuladas
  const { data: progreso } = await supabase
    .from('progreso_ventas_usuario')
    .select('ventas_acumuladas')
    .eq('usuario_id', usuario_id)
    .single();

  if (!progreso) return;

  // 2. Obtener niveles
  const { data: niveles } = await supabase
    .from('niveles_ventas')
    .select('*')
    .order('min_ventas', { ascending: true });

  if (!niveles) return;

  // 3. Buscar el nivel correspondiente
  const nivel = niveles.find(
    (n: any) =>
      progreso.ventas_acumuladas >= n.min_ventas &&
      progreso.ventas_acumuladas <= n.max_ventas
  );

  if (!nivel) return;

  // 4. Actualizar nivel_actual
  await supabase
    .from('progreso_ventas_usuario')
    .update({ nivel_actual: nivel.id })
    .eq('usuario_id', usuario_id);
}

// Actualiza el nivel académico del usuario según los requisitos configurados
export async function actualizarNivelAcademico(usuario_id: string) {
  const { data: progreso } = await supabase
    .from('progreso_academico_usuario')
    .select('modulos_completados, videos_completados')
    .eq('usuario_id', usuario_id)
    .single();

  if (!progreso) return;

  const { data: niveles } = await supabase
    .from('niveles_academicos')
    .select('*')
    .order('modulos_requeridos', { ascending: true });

  if (!niveles) return;

  // Buscar el nivel más alto que cumpla los requisitos
  const nivel = niveles
    .filter(
      (n: any) =>
        progreso.modulos_completados >= n.modulos_requeridos &&
        progreso.videos_completados >= n.videos_requeridos
    )
    .pop();

  if (!nivel) return;

  await supabase
    .from('progreso_academico_usuario')
    .update({ nivel_actual: nivel.id })
    .eq('usuario_id', usuario_id);
}

// NUEVO: Helper para actualizar progreso y nivel de ventas en un solo paso
export async function registrarVenta(usuario_id: string, montoVenta: number) {
  try {
    // 1. Obtener ventas acumuladas actuales
    const { data: progreso } = await supabase
      .from('progreso_ventas_usuario')
      .select('ventas_acumuladas')
      .eq('usuario_id', usuario_id)
      .single();

    const ventasAcumuladas = (progreso?.ventas_acumuladas || 0) + montoVenta;

    // 2. Actualizar ventas acumuladas
    await supabase
      .from('progreso_ventas_usuario')
      .upsert({
        usuario_id,
        ventas_acumuladas: ventasAcumuladas,
        ultima_venta: new Date().toISOString()
      });

    // 3. Actualizar nivel
    await actualizarNivelVentas(usuario_id);

    return { success: true };
  } catch (error) {
    console.error('Error al registrar venta:', error);
    return { success: false, error };
  }
}

// NUEVO: Helper para actualizar progreso y nivel académico en un solo paso
export async function registrarProgresoAcademico(
  usuario_id: string,
  tipo: 'modulo' | 'video',
  id_completado: string
) {
  try {
    // 1. Obtener progreso actual
    const { data: progreso } = await supabase
      .from('progreso_academico_usuario')
      .select('modulos_completados, videos_completados, modulos_ids, videos_ids')
      .eq('usuario_id', usuario_id)
      .single();

    // 2. Preparar datos actualizados
    const modulos_ids = new Set(progreso?.modulos_ids || []);
    const videos_ids = new Set(progreso?.videos_ids || []);

    if (tipo === 'modulo') {
      modulos_ids.add(id_completado);
    } else {
      videos_ids.add(id_completado);
    }

    // 3. Actualizar progreso
    await supabase
      .from('progreso_academico_usuario')
      .upsert({
        usuario_id,
        modulos_completados: tipo === 'modulo' ? (progreso?.modulos_completados || 0) + 1 : progreso?.modulos_completados || 0,
        videos_completados: tipo === 'video' ? (progreso?.videos_completados || 0) + 1 : progreso?.videos_completados || 0,
        modulos_ids: Array.from(modulos_ids),
        videos_ids: Array.from(videos_ids),
        ultima_actividad: new Date().toISOString()
      });

    // 4. Actualizar nivel
    await actualizarNivelAcademico(usuario_id);

    return { success: true };
  } catch (error) {
    console.error('Error al registrar progreso académico:', error);
    return { success: false, error };
  }
} 