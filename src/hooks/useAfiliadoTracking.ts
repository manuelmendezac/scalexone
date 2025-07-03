import { useEffect } from 'react';

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name: string) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

export function useAfiliadoTracking() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const ref = url.searchParams.get('ref');
    if (!ref) return;

    // Si ya existe la cookie, no la sobrescribas (puedes cambiar esta lógica si quieres)
    if (!getCookie('afiliado_ref')) {
      setCookie('afiliado_ref', ref, 90); // 90 días de duración
    }

    // Extrae UTM y otros datos útiles
    const utm_source = url.searchParams.get('utm_source') || '';
    const utm_medium = url.searchParams.get('utm_medium') || '';
    const utm_campaign = url.searchParams.get('utm_campaign') || '';

    // Info de dispositivo/navegador básica
    const dispositivo = navigator.platform || '';
    const navegador = navigator.userAgent || '';

    // Llama al endpoint para registrar el clic
    fetch('/api/afiliados/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_afiliado_id: ref,
        referrer: document.referrer || '',
        utm_source,
        utm_medium,
        utm_campaign,
        pais: '', // Puedes usar una API de geolocalización si quieres
        ciudad: '',
        dispositivo,
        navegador,
      })
    });
  }, []);
} 