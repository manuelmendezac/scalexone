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
      // Validación estricta del userId y email del usuario
      if (!userId || !state.user?.email || typeof state.user.email !== 'string' || state.user.email.trim() === '') {
        console.log('Datos de usuario inválidos para verificar admin:', { 
          userId, 
          email: state.user?.email,
          userExists: !!state.user 
        });
        setState(prevState => ({
          ...prevState,
          isAdmin: false
        }));
        return;
      }

      console.log('Verificando admin status para:', { userId, email: state.user.email });

      // Verificar directamente el rol del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single();

      if (userError) {
        // Si hay error al buscar el usuario, intentar crearlo solo si tenemos email válido
        if (userError.code === 'PGRST116') { // No data found
          console.log('Usuario no encontrado, creando nuevo usuario');
          const { error: insertError } = await supabase
            .from('usuarios')
            .insert([
              {
                id: userId,
                email: state.user.email.trim(),
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
        const isUserAdmin = userData.rol === 'admin' || userData.rol === 'superadmin';
        console.log('Admin status verificado:', { email: state.user.email, rol: userData.rol, isAdmin: isUserAdmin });
        setState(prevState => ({
          ...prevState,
          isAdmin: isUserAdmin
        }));
      } else {
        // Si no hay datos del usuario después de todo, establecer como no admin
        console.log('No se encontraron datos de usuario después de verificación');
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