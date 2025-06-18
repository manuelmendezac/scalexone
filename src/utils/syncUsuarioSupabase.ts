import { supabase } from '../supabase';

export async function syncUsuarioSupabase(user: any) {
  if (!user || !user.email) return;
  try {
    // Primero verificar si el usuario ya existe para preservar el community_id
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('community_id')
      .eq('email', user.email)
      .single();
    
    await supabase
      .from('usuarios')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
        avatar_url: user.user_metadata?.avatar_url || '',
        community_id: existingUser?.community_id || 'default' // Preservar community_id existente o usar default
      });
  } catch (e) {
    // Solo loguea el error, no bloquees el login
    console.error('Error sincronizando usuario en tabla usuarios:', e);
  }
} 