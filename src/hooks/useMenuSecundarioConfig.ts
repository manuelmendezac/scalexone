import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export function useMenuSecundarioConfig(community_id: string | null) {
  const [menuConfig, setMenuConfig] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!community_id) return;
    setLoading(true);
    supabase
      .from('menu_secundario_config')
      .select('config')
      .eq('community_id', community_id)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        if (data && data.config) setMenuConfig(data.config);
        else setMenuConfig(null);
        setLoading(false);
      });
  }, [community_id]);

  // Guardar cambios
  const saveMenuConfig = async (newConfig: any[]) => {
    if (!community_id) return;
    setLoading(true);
    const { error } = await supabase
      .from('menu_secundario_config')
      .upsert([
        {
          community_id,
          config: newConfig,
          updated_at: new Date().toISOString(),
        },
      ]);
    if (error) setError(error.message);
    setMenuConfig(newConfig);
    setLoading(false);
  };

  return { menuConfig, loading, error, setMenuConfig, saveMenuConfig };
} 