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
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    if (userName && userName !== 'Invitado') {
      window.location.href = '/home';
    }
    // Recuperar email si está guardado
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) setEmail(savedEmail);
  }, [userName]);

  // Login con email/contraseña
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (remember) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
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
    <div
      className="login-main-container"
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'row',
        background: '#0a1a2f',
      }}
    >
      {/* Columna izquierda: formulario */}
      <div
        className="login-form-col"
        style={{
          flex: 1,
          minWidth: 350,
          maxWidth: 480,
          background: 'rgba(10,20,40,0.92)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 340,
            margin: '0 auto',
            padding: 0,
            borderRadius: 18,
            background: '#000',
            boxShadow: '0 0 32px #0ff2',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <video
            src="/videos/introneuroclon.mp4"
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              height: '180px',
              minHeight: '120px',
              maxHeight: '220px',
              objectFit: 'cover',
              background: '#000',
              display: 'block',
              borderRadius: 0,
            }}
          />
          <div style={{ padding: 32, paddingTop: 24, width: '100%' }}>
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
              <button type="submit" disabled={loading} style={{ width: '100%', background: '#0ff', color: '#000', border: 'none', borderRadius: 7, padding: 12, fontWeight: 700, fontSize: 22, marginBottom: 12, marginTop: 8, cursor: 'pointer' }}>
                {loading ? 'Ingresando...' : 'ACTIVA TU CLON'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: '#0ff', width: 18, height: 18 }} />
                <label htmlFor="remember" style={{ color: '#b6eaff', fontSize: 15, cursor: 'pointer', userSelect: 'none' }}>Recordar correo</label>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* Columna derecha: video */}
      <div
        className="login-video-col"
        style={{
          flex: 2,
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <video
          src="/videos/videologinactual.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        {/* Overlay para oscurecer el video y tapar el logo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(90deg, #0a1a2f 0%, #0a1a2f88 40%, #0000 100%), linear-gradient(0deg, #0a1a2f 0%, #0000 80%)',
            pointerEvents: 'none',
          }}
        />
      </div>
      <style>{`
        @media (max-width: 900px) {
          .login-form-col {
            max-width: 100vw !important;
            min-width: 0 !important;
            flex: 1 1 100%;
          }
          .login-video-col {
            flex: 1 1 100%;
            height: 40vh !important;
            min-height: 220px;
            max-height: 320px;
          }
        }
        @media (max-width: 600px) {
          .login-main-container {
            flex-direction: column-reverse !important;
          }
          .login-video-col {
            width: 100vw !important;
            height: 32vh !important;
            min-height: 140px;
            max-height: 200px;
          }
          .login-form-col {
            min-width: 0 !important;
            max-width: 100vw !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login; 