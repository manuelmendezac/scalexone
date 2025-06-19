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