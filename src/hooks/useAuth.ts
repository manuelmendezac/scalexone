import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false
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
        checkAdminStatus(session.user.id);
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
        checkAdminStatus(session.user.id);
      } else {
        setState(prevState => ({
          ...prevState,
          isAdmin: false
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      // Verificar directamente el rol del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single();

      if (userError) {
        // Si hay error al buscar el usuario, intentar crearlo
        if (userError.code === 'PGRST116') { // No data found
          const { error: insertError } = await supabase
            .from('usuarios')
            .insert([
              {
                id: userId,
                email: state.user?.email,
                rol: 'user'
              }
            ]);

          if (insertError) {
            console.error('Error creating user:', insertError);
            setState(prevState => ({
              ...prevState,
              isAdmin: false
            }));
            return;
          }
        } else {
          console.error('Error fetching user:', userError);
          setState(prevState => ({
            ...prevState,
            isAdmin: false
          }));
          return;
        }
      }

      // Si el usuario existe, verificar su rol
      if (userData) {
        setState(prevState => ({
          ...prevState,
          isAdmin: userData.rol === 'admin' || userData.rol === 'superadmin'
        }));
      } else {
        // Si no hay datos del usuario después de todo, establecer como no admin
        setState(prevState => ({
          ...prevState,
          isAdmin: false
        }));
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setState(prevState => ({
        ...prevState,
        isAdmin: false
      }));
    }
  };

  return state;
} 