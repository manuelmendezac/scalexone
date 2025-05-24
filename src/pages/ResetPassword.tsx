import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const accessToken = searchParams.get('access_token');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess('¡Contraseña actualizada! Ahora puedes iniciar sesión.');
  };

  if (!accessToken) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>Token inválido o expirado.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleReset} style={{ width: 320, background: 'rgba(20,20,30,0.9)', borderRadius: 12, padding: 32, boxShadow: '0 0 24px #0ff2' }}>
        <h2 style={{ color: '#0ff', textAlign: 'center', marginBottom: 16 }}>Restablecer contraseña</h2>
        <input type="password" placeholder="Nueva contraseña" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: 'none', background: '#181828', color: '#fff' }} required />
        <input type="password" placeholder="Confirmar contraseña" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: 'none', background: '#181828', color: '#fff' }} required />
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: '#0f0', marginBottom: 8 }}>{success}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#0ff', color: '#000', border: 'none', borderRadius: 6, padding: 12, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword; 