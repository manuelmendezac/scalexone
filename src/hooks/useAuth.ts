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
      // Primero, asegurarse de que el usuario existe en la tabla usuarios
      const { data: existingUser, error: existingError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingUser) {
        // Si el usuario no existe, crearlo
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: userId,
              email: state.user?.email,
              rol: 'user'
            }
          ]);

        if (insertError) throw insertError;
      }

      // Verificar el rol del usuario
      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setState(prevState => ({
        ...prevState,
        isAdmin: data?.rol === 'admin' || data?.rol === 'superadmin'
      }));
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