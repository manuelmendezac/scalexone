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
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setState(prevState => ({
        ...prevState,
        isAdmin: data?.role === 'admin'
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