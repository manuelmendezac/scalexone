import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';

const DEFAULT_COMMUNITY_ID = '8fb70d6e-3237-465e-8669-979461cf2bc1'; // ScaleXone

const AfiliadoRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { ib } = useParams<{ ib: string }>();

  useEffect(() => {
    const redirect = async () => {
      if (!ib) return;
      // Buscar el user_id del IB
      const { data: codigo } = await supabase
        .from('codigos_afiliado')
        .select('user_id')
        .eq('codigo', ib)
        .eq('activo', true)
        .single();
      let communityId = DEFAULT_COMMUNITY_ID;
      if (codigo?.user_id) {
        // Buscar el community_id del usuario dueño del IB
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('community_id')
          .eq('id', codigo.user_id)
          .single();
        if (usuario?.community_id) {
          communityId = usuario.community_id;
        }
      }
      // Guardar en localStorage para respaldo
      localStorage.setItem('affiliate_ref', ib);
      localStorage.setItem('affiliate_community_id', communityId);
      // Redirigir a registro con ref y community_id
      navigate(`/registro?ref=${ib}&community_id=${communityId}`, { replace: true });
    };
    redirect();
  }, [ib, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-blue-900 text-xl">
      Redirigiendo al registro de afiliado...
    </div>
  );
};

export default AfiliadoRedirect; 