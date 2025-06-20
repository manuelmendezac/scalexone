import { useEffect } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

export const useSyncUserProfile = () => {
  const { setXP, setCoins, setUserInfo } = useNeuroState();

  useEffect(() => {
    const syncData = async () => {
      // 1. Obtener el usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. Obtener el perfil principal del usuario
        const { data: profileData, error: profileError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error al sincronizar perfil de usuario:', profileError);
          return;
        }

        if (profileData) {
          setUserInfo(profileData);
        }

        // 3. Obtener el progreso de gamificación
        const { data: progressData, error: progressError } = await supabase
          .from('progreso_usuario_xp')
          .select('xp_actual, monedas')
          .eq('usuario_id', user.id)
          .single();
        
        if (progressError && progressError.code !== 'PGRST116') { // Ignorar si no hay fila
          console.error('Error al sincronizar progreso de gamificación:', progressError);
          return;
        }
        
        // 4. Actualizar el estado de Zustand con datos frescos
        setXP(progressData?.xp_actual || 0);
        setCoins(progressData?.monedas || 0);
      }
    };

    // Escuchar cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          syncData();
        }
      }
    );

    // Limpiar el listener al desmontar el componente
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setXP, setCoins, setUserInfo]);
}; 