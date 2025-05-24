import React, { useState } from 'react';
import { supabase } from '../supabase';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Registro con email/contraseña
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('¡Registro exitoso! Redirigiendo...');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
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

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleRegister} style={{ width: 320, background: 'rgba(20,20,30,0.9)', borderRadius: 12, padding: 32, boxShadow: '0 0 24px #0ff2' }}>
        <h2 style={{ color: '#0ff', textAlign: 'center', marginBottom: 16 }}>Registro</h2>
        <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: 'none', background: '#181828', color: '#fff' }} required />
        <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: 'none', background: '#181828', color: '#fff' }} required />
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: 'none', background: '#181828', color: '#fff' }} required />
          <span onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: 12, cursor: 'pointer', color: '#0ff' }}>{showPassword ? '🙈' : '👁️'}</span>
        </div>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input type={showPassword ? 'text' : 'password'} placeholder="Confirmar contraseña" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 6, border: 'none', background: '#181828', color: '#fff' }} required />
        </div>
        <div style={{ textAlign: 'right', marginBottom: 12 }}>
          <span onClick={handleForgotPassword} style={{ color: '#0ff', cursor: 'pointer', fontSize: 13 }}>¿Olvidaste tu contraseña?</span>
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: '#0f0', marginBottom: 8 }}>{success}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', background: '#0ff', color: '#000', border: 'none', borderRadius: 6, padding: 12, fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <button type="button" onClick={async () => await supabase.auth.signInWithOAuth({ provider: 'google' })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><span style={{ fontSize: 28 }}>G</span></button>
          <button type="button" onClick={async () => await supabase.auth.signInWithOAuth({ provider: 'facebook' })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><span style={{ fontSize: 28 }}>f</span></button>
        </div>
      </form>
    </div>
  );
};

export default Register; 