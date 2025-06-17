import { supabase } from '../supabase';

export async function syncUsuarioSupabase(user: any) {
  if (!user || !user.email) return;
  try {
    await supabase
      .from('usuarios')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
        avatar_url: user.user_metadata?.avatar_url || '',
      });
  } catch (e) {
    // Solo loguea el error, no bloquees el login
    console.error('Error sincronizando usuario en tabla usuarios:', e);
  }
} 