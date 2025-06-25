import { supabase } from '../supabase';

export async function syncUsuarioSupabase(user: any) {
  // Validación estricta del usuario y email
  if (!user || !user.email || typeof user.email !== 'string' || user.email.trim() === '') {
    console.log('Usuario no válido para sincronizar:', { 
      userExists: !!user, 
      email: user?.email,
      emailType: typeof user?.email 
    });
    return;
  }

  try {
    console.log('Sincronizando usuario:', user.email);
    
    // Primero verificar si el usuario ya existe para preservar el community_id
    const { data: existingUser, error: selectError } = await supabase
      .from('usuarios')
      .select('community_id')
      .eq('email', user.email.trim())
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error verificando usuario existente:', selectError);
      return;
    }

    // Construir el objeto a upsert sin updated_at
    const usuarioUpsert = {
      id: user.id,
      email: user.email.trim(),
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
      avatar_url: user.user_metadata?.avatar_url || '',
      community_id: existingUser?.community_id || 'default' // Preservar community_id existente o usar default
    };
    // Log para depuración
    console.log('Objeto que se enviará a upsert usuarios:', usuarioUpsert);
    
    const { error: upsertError } = await supabase
      .from('usuarios')
      .upsert(usuarioUpsert);

    if (upsertError) {
      console.error('Error sincronizando usuario en tabla usuarios:', upsertError);
    } else {
      console.log('Usuario sincronizado exitosamente');
    }
  } catch (e) {
    // Solo loguea el error, no bloquees el login
    console.error('Error sincronizando usuario en tabla usuarios:', e);
  }
} 