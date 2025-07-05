import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { userName } = useNeuroState();
  const [remember, setRemember] = useState(false);
  const location = useLocation();
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [showRegisterLink, setShowRegisterLink] = useState(false);

  useEffect(() => {
    if (
      userName &&
      userName !== 'Invitado' &&
      location.pathname !== '/reset-password'
    ) {
      window.location.href = '/home';
    }
    // Recuperar email si está guardado
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) setEmail(savedEmail);
  }, [userName, location.pathname]);

  // Login con email/contraseña
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setShowRegisterLink(false);
    if (remember) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        setError('Usuario o contraseña incorrectos. ¿Olvidaste tu contraseña? Recuperar o Regístrate aquí.');
        setShowRegisterLink(true);
      } else {
        setError(error.message);
      }
      return;
    }
    // Obtener el usuario autenticado
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setError('No se pudo autenticar el usuario.');
      return;
    }
    // 1. Busca el perfil en la tabla usuarios
    const { data: perfil, error: perfilError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!perfil) {
      setError('No tienes cuenta registrada. Por favor, regístrate primero.');
      setShowRegisterPrompt(true);
      return;
    } else if (perfil.activo === false) {
      setError('Tu cuenta está inactiva. Contacta soporte.');
      await supabase.auth.signOut();
      return;
    }
    // Si todo está bien, permite el acceso normal
    window.location.href = '/home';
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
    setError('');
    setSuccess('');
    setShowRegisterLink(false);
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      setTimeout(async () => {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) {
          setError('No se pudo autenticar con Google.');
          setLoading(false);
          return;
        }
        // Buscar el perfil en la tabla usuarios
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('id')
          .eq('id', user.id)
          .single();
        if (!perfil) {
          // Crear perfil en la tabla usuarios
          await supabase.from('usuarios').insert([
            {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.nombre || user.user_metadata?.full_name || user.email,
              avatar_url: user.user_metadata?.avatar_url || null,
              fecha_creacion: new Date().toISOString(),
              activo: true,
              community_id: '8fb70d6e-3237-465e-8669-979461cf2bc1'
            }
          ]);
          // Crear IB único usando la función RPC robusta
          await supabase.rpc('crear_codigo_afiliado_para_usuario', { p_user_id: user.id });
        }
        // Redirigir a home
        window.location.href = '/home';
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Error al autenticar con Google.');
      setLoading(false);
    }
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
            boxShadow: '0 0 32px #FFD700',
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
            <button onClick={handleGoogle} style={{ width: '100%', background: '#FFD700', color: '#181828', border: 'none', borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 16, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 2px 8px #0002', cursor: 'pointer' }}>
              <img src="/images/google.svg" alt="Google" style={{ width: 22, height: 22 }} /> INGRESAR CON GOOGLE
            </button>
            <div style={{ textAlign: 'center', color: '#FFD700', margin: '18px 0 10px 0', fontWeight: 600 }}>o ingresa con tu correo</div>
            <form onSubmit={handleLogin} style={{ width: '100%' }}>
              <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 12, borderRadius: 7, border: 'none', background: '#181828', color: '#fff', fontSize: 16, borderColor: '#FFD700', borderWidth: 2 }} required />
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 7, border: 'none', background: '#181828', color: '#fff', fontSize: 16, borderColor: '#FFD700', borderWidth: 2 }} required />
                <span onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: 14, cursor: 'pointer', color: '#FFD700', fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</span>
              </div>
              <div style={{ textAlign: 'right', marginBottom: 12 }}>
                <span onClick={handleForgotPassword} style={{ color: '#FFD700', cursor: 'pointer', fontSize: 13 }}>¿Olvidaste tu contraseña?</span>
              </div>
              {error && <div style={{ color: 'red', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
              {success && <div style={{ color: '#0f0', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{success}</div>}
              <button type="submit" disabled={loading} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', borderRadius: 7, padding: 12, fontWeight: 700, fontSize: 22, marginBottom: 12, marginTop: 8, cursor: 'pointer' }}>
                {loading ? 'Ingresando...' : 'INGRESAR'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <input type="checkbox" id="remember" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: '#FFD700', width: 18, height: 18 }} />
                <label htmlFor="remember" style={{ color: '#FFD700', fontSize: 15, cursor: 'pointer', userSelect: 'none' }}>Recordar correo</label>
              </div>
              {showRegisterLink && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 13, color: '#FFD700' }}>
                    ¿No tienes cuenta?{' '}
                    <a href="/registro" style={{ color: '#FFD700', textDecoration: 'underline', cursor: 'pointer' }}>Regístrate aquí</a>
                  </span>
                </div>
              )}
            </form>
            {showRegisterPrompt && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button onClick={() => window.location.href = '/registro'} style={{ background: '#FFD700', color: '#181828', border: 'none', borderRadius: 8, padding: 10, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                  Ir a Registro
                </button>
              </div>
            )}
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