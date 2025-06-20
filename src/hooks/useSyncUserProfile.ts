import { useEffect } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

export const useSyncUserProfile = () => {
  const { setXP, setCoins, setUserInfo } = useNeuroState();

  useEffect(() => {
    const syncData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData, error } = await supabase
          .from('usuarios')
          .select('*, xp, monedas')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error al sincronizar perfil de usuario:', error);
          return;
        }

        if (profileData) {
          setUserInfo(profileData);
          setXP(profileData.xp || 0);
          setCoins(profileData.monedas || 0);
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          syncData();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setXP, setCoins, setUserInfo]);
}; 