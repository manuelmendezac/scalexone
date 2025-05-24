import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { userName } = useNeuroState();

  useEffect(() => {
    if (userName && userName !== 'Invitado') {
      window.location.href = '/dashboard';
    }
  }, [userName]);

  // Login con email/contraseña
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.href = '/dashboard';
  };

  // Recuperar contraseña
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Ingresa tu correo para recuperar la contraseña');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) setError(error.message);
    else setSuccess('Revisa tu correo para restablecer la contraseña.');
  };

  // Login con Google
  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };
  // Login con Facebook
  const handleFacebook = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'facebook' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleLogin} style={{ width: 320, background: 'rgba(20,20,30,0.9)', borderRadius: 12, padding: 32, boxShadow: '0 0 24px #0ff2' }}>
        <h2 style={{ color: '#0ff', textAlign: 'center', marginBottom: 16 }}>CENTRO DE ENTRENAMIENTO IA</h2>
        <p style={{ color: '#fff', textAlign: 'center', marginBottom: 24 }}>Inicia sesión para transformar tu mente</p>
        <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: 'none', background: '#181828', color: '#fff' }} required />
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: 'none', background: '#181828', color: '#fff' }} required />
          <span onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: 12, cursor: 'pointer', color: '#0ff' }}>{showPassword ? '🙈' : '👁️'}</span>
        </div>
        <div style={{ textAlign: 'right', marginBottom: 12 }}>
          <span onClick={handleForgotPassword} style={{ color: '#0ff', cursor: 'pointer', fontSize: 13 }}>¿Olvidaste tu contraseña?</span>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: '#0f0', marginBottom: 8 }}>{success}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#0ff', color: '#000', border: 'none', borderRadius: 6, padding: 12, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          {loading ? 'Ingresando...' : 'Comienza a aprender'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button type="button" onClick={handleGoogle} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><span style={{ fontSize: 28 }}>G</span></button>
          <button type="button" onClick={handleFacebook} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><span style={{ fontSize: 28 }}>f</span></button>
        </div>
      </form>
    </div>
  );
};

export default Login; 