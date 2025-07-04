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
      if (!userId || !userEmail || typeof userEmail !== 'string' || userEmail.trim() === '') {
        setState(prevState => ({
          ...prevState,
          isAdmin: false,
          authReady: true
        }));
        return;
      }
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol, id, email')
        .eq('id', userId)
        .single();
      if (userError) {
        if (userError.code === 'PGRST116') { // No data found
          await supabase.auth.signOut();
          window.location.href = '/registro';
          return;
        } else {
          setState(prevState => ({
            ...prevState,
            isAdmin: false,
            authReady: true
          }));
          return;
        }
      }
      if (userData) {
        const isUserAdmin = userData.rol === 'admin' || userData.rol === 'superadmin';
        setState(prevState => ({
          ...prevState,
          isAdmin: isUserAdmin,
          authReady: true
        }));
      } else {
        setState(prevState => ({
          ...prevState,
          isAdmin: false,
          authReady: true
        }));
      }
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        isAdmin: false,
        authReady: true
      }));
    }
  };

  return state;
} 