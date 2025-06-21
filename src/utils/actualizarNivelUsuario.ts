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
  // 1. Obtener progreso académico del usuario
  const { data: progresoAcademico } = await supabase
    .from('progreso_academico_usuario')
    .select('modulos_completados, videos_completados, nivel_actual')
    .eq('usuario_id', usuario_id)
    .single();

  if (!progresoAcademico) return;

  // 2. Obtener progreso de XP del usuario
  const { data: progresoXP } = await supabase
    .from('progreso_usuario_xp')
    .select('xp_actual')
    .eq('usuario_id', usuario_id)
    .single();

  const xp_actual = progresoXP?.xp_actual || 0;

  // 3. Obtener todos los niveles académicos, ordenados del más alto al más bajo
  const { data: niveles } = await supabase
    .from('niveles_academicos')
    .select('*')
    .order('modulos_requeridos', { ascending: false })
    .order('videos_requeridos', { ascending: false })
    .order('xp_requerido', { ascending: false });

  if (!niveles || niveles.length === 0) return;

  // 4. Encontrar el nivel más alto que el usuario cumple
  const nuevoNivel = niveles.find(
    (n: any) =>
      (progresoAcademico.modulos_completados || 0) >= n.modulos_requeridos &&
      (progresoAcademico.videos_completados || 0) >= n.videos_requeridos &&
      xp_actual >= (n.xp_requerido || 0)
  );

  // 5. Si se encontró un nivel y es diferente al actual, actualizar
  if (nuevoNivel && nuevoNivel.id !== progresoAcademico.nivel_actual) {
    await supabase
      .from('progreso_academico_usuario')
      .update({ nivel_actual: nuevoNivel.id })
      .eq('usuario_id', usuario_id);

    console.log(`Usuario ${usuario_id} ha subido al nivel académico: ${nuevoNivel.nombre}`);
  }
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