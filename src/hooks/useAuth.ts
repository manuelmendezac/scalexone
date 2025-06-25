import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  authReady: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false,
    authReady: false
  });

  useEffect(() => {
    // Obtener la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prevState => ({
        ...prevState,
        user: session?.user ?? null,
        loading: false
      }));

      if (session?.user) {
        checkAdminStatus(session.user.id, session.user.email);
      }
    });

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState(prevState => ({
        ...prevState,
        user: session?.user ?? null,
        loading: false
      }));

      if (session?.user) {
        checkAdminStatus(session.user.id, session.user.email);
      } else {
        setState(prevState => ({
          ...prevState,
          isAdmin: false,
          authReady: true
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string, userEmail?: string) => {
    try {
      console.log('[useAuth] checkAdminStatus INICIO', { userId, userEmail });
      if (!userId || !userEmail || typeof userEmail !== 'string' || userEmail.trim() === '') {
        console.log('[useAuth] Datos de usuario inválidos para verificar admin:', { 
          userId, 
          email: userEmail,
        });
        setState(prevState => ({
          ...prevState,
          isAdmin: false,
          authReady: true
        }));
        return;
      }

      console.log('[useAuth] Verificando admin status para:', { userId, email: userEmail });

      // Verificar directamente el rol del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol, id, email')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('[useAuth] Error fetching user:', userError);
        if (userError.code === 'PGRST116') { // No data found
          console.log('[useAuth] Usuario no encontrado, creando nuevo usuario');
          const { error: insertError } = await supabase
            .from('usuarios')
            .insert([
              {
                id: userId,
                email: userEmail.trim(),
                rol: 'user'
              }
            ]);

          if (insertError) {
            console.error('[useAuth] Error creating user:', insertError);
            setState(prevState => ({
              ...prevState,
              isAdmin: false,
              authReady: true
            }));
            return;
          }
        } else {
          setState(prevState => ({
            ...prevState,
            isAdmin: false,
            authReady: true
          }));
          return;
        }
      }

      // Si el usuario existe, verificar su rol
      if (userData) {
        const isUserAdmin = userData.rol === 'admin' || userData.rol === 'superadmin';
        console.log('[useAuth] Admin status verificado:', { 
          email: userEmail, 
          rol: userData.rol, 
          isAdmin: isUserAdmin, 
          userData, 
          userIdSesion: userId, 
          userIdTabla: userData.id 
        });
        setState(prevState => ({
          ...prevState,
          isAdmin: isUserAdmin,
          authReady: true
        }));
      } else {
        console.log('[useAuth] No se encontraron datos de usuario después de verificación');
        setState(prevState => ({
          ...prevState,
          isAdmin: false,
          authReady: true
        }));
      }
    } catch (error) {
      console.error('[useAuth] Error checking admin status:', error);
      setState(prevState => ({
        ...prevState,
        isAdmin: false,
        authReady: true
      }));
    }
  };

  return state;
} 