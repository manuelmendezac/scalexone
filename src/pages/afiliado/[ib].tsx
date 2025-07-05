import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import axios from 'axios';

const DEFAULT_COMMUNITY_ID = '8fb70d6e-3237-465e-8669-979461cf2bc1'; // ScaleXone

const AfiliadoRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { ib } = useParams<{ ib: string }>();

  useEffect(() => {
    const trackClick = async (ib: string, communityId: string) => {
      try {
        const userAgent = navigator.userAgent;
        const referrer = document.referrer;
        const urlParams = new URLSearchParams(window.location.search);
        const utm_source = urlParams.get('utm_source');
        const utm_medium = urlParams.get('utm_medium');
        const utm_campaign = urlParams.get('utm_campaign');
        // Obtener IP pública (opcional, puede omitirse si el backend la detecta)
        // const ip_address = await fetch('https://api.ipify.org?format=json').then(res => res.json()).then(data => data.ip);
        const res = await axios.post('/api/afiliados/track-click', {
          ib,
          community_id: communityId,
          utm_source,
          utm_medium,
          utm_campaign,
          user_agent: userAgent,
          referrer
        });
        if (res.data?.tracking_id) {
          localStorage.setItem('affiliate_tracking_id', res.data.tracking_id);
        }
      } catch (err) {
        console.error('Error tracking click:', err);
      }
    };
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
      // Tracking de clics
      await trackClick(ib, communityId);
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