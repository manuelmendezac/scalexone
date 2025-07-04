import { useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

let syncDataGlobal: () => Promise<void> = async () => {};

export const useSyncUserProfile = () => {
  const { setXP, setCoins, setUserInfo } = useNeuroState();

  const syncData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profileData, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error al sincronizar perfil de usuario (tabla usuarios):', profileError);
      }

      if (profileData) {
        setUserInfo(profileData);
      }

      const { data: progressData, error: progressError } = await supabase
        .from('progreso_usuario_xp')
        .select('id, xp_actual, monedas')
        .eq('usuario_id', user.id)
        .limit(1)
        .maybeSingle();
      
      if (progressError) {
        console.error('Error al sincronizar progreso de gamificación (tabla progreso_usuario_xp):', progressError);
        return;
      }
      
      setXP(progressData?.xp_actual || 0);
      setCoins(progressData?.monedas || 0);
    }
  }, [setUserInfo, setXP, setCoins]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          syncData();
        }
      }
    );

    syncDataGlobal = syncData;

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [syncData]);
};

export const syncUserProfile = () => {
    syncDataGlobal();
} 