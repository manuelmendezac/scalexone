import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import axios from 'axios';

const DEFAULT_COMMUNITY_ID = '8fb70d6e-3237-465e-8669-979461cf2bc1'; // ScaleXone

const AfiliadoRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { ib } = useParams<{ ib: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Si ya está logueado, siempre redirigir a /home
        navigate('/home', { replace: true });
        return;
      }
      // Si no está logueado, sigue el flujo normal de tracking
      redirect();
    };

    const trackClick = async (ib: string, communityId: string) => {
      try {
        console.log('TRACKING: Iniciando tracking para IB:', ib, 'communityId:', communityId);
        const userAgent = navigator.userAgent;
        const referrer = document.referrer;
        const urlParams = new URLSearchParams(window.location.search);
        const utm_source = urlParams.get('utm_source');
        const utm_medium = urlParams.get('utm_medium');
        const utm_campaign = urlParams.get('utm_campaign');
        const res = await axios.post('/api/afiliados/track-click', {
          ib,
          community_id: communityId,
          utm_source,
          utm_medium,
          utm_campaign,
          user_agent: userAgent,
          referrer
        });
        console.log('TRACKING: Respuesta de /track-click:', res.data);
        if (res.data?.tracking_id) {
          localStorage.setItem('affiliate_tracking_id', res.data.tracking_id);
          return true;
        } else {
          setError('No se pudo generar el tracking de afiliado. Intenta de nuevo o contacta soporte.');
          return false;
        }
      } catch (err) {
        setError('Error registrando el tracking de afiliado. Intenta de nuevo o contacta soporte.');
        console.error('Error tracking click:', err);
        return false;
      }
    };

    const redirect = async () => {
      if (!ib) {
        setError('Código de afiliado no válido.');
        return;
      }
      // Buscar el user_id del IB
      const { data: codigo } = await supabase
        .from('codigos_afiliado')
        .select('user_id')
        .eq('codigo', ib)
        .eq('activo', true)
        .single();
      if (!codigo?.user_id) {
        setError('El código de afiliado no existe o está inactivo.');
        return;
      }
      // Buscar el community_id del usuario dueño del IB
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('community_id')
        .eq('id', codigo.user_id)
        .single();
      if (!usuario?.community_id || usuario.community_id === 'default') {
        setError('No se pudo determinar la comunidad del afiliado. Contacta soporte.');
        return;
      }
      const communityId = usuario.community_id;
      // Guardar en localStorage para respaldo
      localStorage.setItem('affiliate_ref', ib);
      localStorage.setItem('affiliate_community_id', communityId);
      // Tracking de clics
      const trackingOk = await trackClick(ib, communityId);
      if (!trackingOk) {
        setError('No se pudo generar el tracking. Intenta de nuevo o contacta soporte.');
        return;
      }
      // Protección anti-bucle: verifica tracking_id
      const trackingId = localStorage.getItem('affiliate_tracking_id');
      if (!trackingId) {
        setError('No se pudo generar el tracking. Intenta de nuevo o contacta soporte.');
        return;
      }
      // Redirigir a registro con ref y community_id
      navigate(`/registro?ref=${ib}&community_id=${communityId}`, { replace: true });
    };

    checkSessionAndRedirect();
  }, [ib, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-blue-900 text-xl">
      {error ? (
        <div className="text-red-600 font-bold text-center">{error}</div>
      ) : (
        'Redirigiendo al registro de afiliado...'
      )}
    </div>
  );
};

export default AfiliadoRedirect; 