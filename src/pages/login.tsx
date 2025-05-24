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
      window.location.href = '/home';
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
    else window.location.href = '/home';
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

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'row', background: '#0a1a2f' }}>
      {/* Columna izquierda: formulario */}
      <div style={{ flex: 1, minWidth: 350, maxWidth: 480, background: 'rgba(10,20,40,0.92)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
        <div style={{ width: '100%', maxWidth: 340, margin: '0 auto', padding: 32, borderRadius: 18, background: 'rgba(20,20,30,0.92)', boxShadow: '0 0 32px #0ff2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <img src="/logo.png" alt="Logo" style={{ width: 48, height: 48, borderRadius: 12 }} />
            <span style={{ color: '#0ff', fontWeight: 700, fontSize: 28, fontFamily: 'Orbitron, sans-serif', letterSpacing: 1 }}>Neuroclon.AI</span>
          </div>
          <button onClick={handleGoogle} style={{ width: '100%', background: '#fff', color: '#222', border: 'none', borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 16, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>
            <img src="/images/google.svg" alt="Google" style={{ width: 22, height: 22 }} /> Ingresar con Google
          </button>
          <div style={{ textAlign: 'center', color: '#b6eaff', margin: '18px 0 10px 0', fontWeight: 600 }}>o ingresa con tu correo</div>
          <form onSubmit={handleLogin} style={{ width: '100%' }}>
            <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 12, borderRadius: 7, border: 'none', background: '#181828', color: '#fff', fontSize: 16 }} required />
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 7, border: 'none', background: '#181828', color: '#fff', fontSize: 16 }} required />
              <span onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: 14, cursor: 'pointer', color: '#0ff', fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</span>
            </div>
            <div style={{ textAlign: 'right', marginBottom: 12 }}>
              <span onClick={handleForgotPassword} style={{ color: '#0ff', cursor: 'pointer', fontSize: 13 }}>¿Olvidaste tu contraseña?</span>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
            {success && <div style={{ color: '#0f0', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{success}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#0ff', color: '#000', border: 'none', borderRadius: 7, padding: 12, fontWeight: 700, fontSize: 16, marginBottom: 8, marginTop: 8, cursor: 'pointer' }}>
              {loading ? 'Ingresando...' : 'Comienza a aprender'}
            </button>
          </form>
        </div>
      </div>
      {/* Columna derecha: video */}
      <div style={{ flex: 2, position: 'relative', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <video
          src="/videos/videologinactual.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
        />
        {/* Overlay para oscurecer el video si se desea */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, #0a1a2f 0%, #0a1a2f88 40%, #0000 100%)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
};

export default Login; 