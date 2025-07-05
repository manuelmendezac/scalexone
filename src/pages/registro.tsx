import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

const RegistroPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [clickRegistered, setClickRegistered] = useState(false);
  const [showLoginLink, setShowLoginLink] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Capturar código de afiliado de la URL
    const refCode = searchParams.get('ref');
    if (refCode) {
      setAffiliateCode(refCode);
      registerAffiliateClick(refCode);
    }
    // Detectar sesión activa en Auth
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        // Verificar si ya existe en la tabla usuarios
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('id')
          .eq('id', user.id)
          .single();
        if (perfil) {
          navigate('/home', { replace: true });
          return;
        }
        setSessionUser(user);
        setFormData(prev => ({
          ...prev,
          email: user.email || user.user_metadata?.email || '',
          fullName: user.user_metadata?.full_name || user.user_metadata?.name || ''
        }));
      }
    });
  }, [searchParams, navigate]);

  const registerAffiliateClick = async (codigo: string) => {
    try {
      // Obtener información del navegador y ubicación
      const userAgent = navigator.userAgent;
      const referrer = document.referrer;
      
      // Detectar dispositivo
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const dispositivo = isMobile ? 'mobile' : 'desktop';

      // Obtener parámetros UTM
      const utmSource = searchParams.get('utm_source');
      const utmMedium = searchParams.get('utm_medium');
      const utmCampaign = searchParams.get('utm_campaign');

      // Registrar click usando la función SQL
      const { data, error } = await supabase.rpc('registrar_click_afiliado', {
        p_codigo: codigo,
        p_ip_address: null, // Se obtiene del servidor
        p_user_agent: userAgent,
        p_referrer: referrer,
        p_utm_source: utmSource,
        p_utm_medium: utmMedium,
        p_utm_campaign: utmCampaign
      });

      if (error) {
        console.error('Error registering affiliate click:', error);
      } else {
        setClickRegistered(true);
        console.log('Affiliate click registered:', data);
      }
    } catch (error) {
      console.error('Error in registerAffiliateClick:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!sessionUser) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setShowLoginLink(false);
    try {
      let userId = null;
      let userEmail = formData.email;
      if (sessionUser) {
        userId = sessionUser.id;
        userEmail = sessionUser.email || sessionUser.user_metadata?.email || '';
      } else {
        // Registrar usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              affiliate_code: affiliateCode
            }
          }
        });
        if (authError) {
          if (authError.message.toLowerCase().includes('already registered')) {
            toast.error('Este correo ya está registrado. Inicia sesión aquí.');
            setShowLoginLink(true);
          } else {
            toast.error(authError.message);
          }
          setLoading(false);
          return;
        }
        if (!authData.user) throw new Error('No se pudo crear el usuario en Auth.');
        userId = authData.user.id;
        userEmail = authData.user.email || authData.user.user_metadata?.email || '';
      }

      // Crear perfil de usuario en la tabla usuarios
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: userId,
            email: userEmail,
            name: formData.fullName,
            avatar_url: null,
            rol: 'user'
          }
        ]);
      if (profileError) {
        console.error('Error creating user profile:', profileError);
        toast.error('Error creando perfil de usuario: ' + profileError.message);
        setLoading(false);
        return;
      }
      // Crear IB único usando la función RPC robusta
      await supabase.rpc('crear_codigo_afiliado_para_usuario', { p_user_id: userId });

      setStep(3);
      toast.success('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
      
      // Redirigir solo a /home
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGoogle = async () => {
    setError('');
    setSuccess('');
    setShowLoginLink(false);
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
              rol: 'user'
            }
          ]);
          // Crear IB único usando la función RPC robusta
          await supabase.rpc('crear_codigo_afiliado_para_usuario', { p_user_id: user.id });
        }
        // Redirigir a home
        navigate('/home');
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Error al registrar con Google.');
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
              <img src="/images/google.svg" alt="Google" style={{ width: 22, height: 22 }} /> REGISTRARSE CON GOOGLE
            </button>
            <div style={{ textAlign: 'center', color: '#FFD700', margin: '18px 0 10px 0', fontWeight: 600 }}>o regístrate con tu correo</div>
            <form onSubmit={handleRegister} style={{ width: '100%' }}>
              <input type="text" placeholder="Nombre completo" value={formData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 12, borderRadius: 7, border: 'none', background: '#181828', color: '#fff', fontSize: 16, borderColor: '#FFD700', borderWidth: 2 }} required />
              <input type="email" placeholder="Correo electrónico" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 12, borderRadius: 7, border: 'none', background: '#181828', color: '#fff', fontSize: 16, borderColor: '#FFD700', borderWidth: 2 }} required />
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input type={showPassword ? 'text' : 'password'} placeholder="Contraseña" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 7, border: 'none', background: '#181828', color: '#fff', fontSize: 16, borderColor: '#FFD700', borderWidth: 2 }} required />
                <span onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: 14, cursor: 'pointer', color: '#FFD700', fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</span>
              </div>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input type="password" placeholder="Confirmar contraseña" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 7, border: 'none', background: '#181828', color: '#fff', fontSize: 16, borderColor: '#FFD700', borderWidth: 2 }} required />
              </div>
              <div style={{ textAlign: 'left', marginBottom: 12 }}>
                <input type="checkbox" id="acceptTerms" checked={formData.acceptTerms} onChange={(e) => handleInputChange('acceptTerms', e.target.checked)} style={{ accentColor: '#FFD700', width: 18, height: 18, marginRight: 8 }} />
                <label htmlFor="acceptTerms" style={{ color: '#FFD700', fontSize: 15, cursor: 'pointer', userSelect: 'none' }}>
                  Acepto los <a href="/terminos" style={{ color: '#FFD700', textDecoration: 'underline' }}>términos y condiciones</a>
                </label>
              </div>
              {errors.fullName && <div style={{ color: 'red', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{errors.fullName}</div>}
              {errors.email && <div style={{ color: 'red', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{errors.email}</div>}
              {errors.password && <div style={{ color: 'red', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{errors.password}</div>}
              {errors.confirmPassword && <div style={{ color: 'red', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{errors.confirmPassword}</div>}
              {errors.acceptTerms && <div style={{ color: 'red', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>{errors.acceptTerms}</div>}
              <button type="submit" disabled={loading} style={{ width: '100%', background: '#FFD700', color: '#000', border: 'none', borderRadius: 7, padding: 12, fontWeight: 700, fontSize: 22, marginBottom: 12, marginTop: 8, cursor: 'pointer' }}>
                {loading ? 'Registrando...' : 'REGISTRARSE'}
              </button>
              {showLoginLink && (
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 13, color: '#FFD700' }}>
                    ¿Ya tienes cuenta?{' '}
                    <a href="/login" style={{ color: '#FFD700', textDecoration: 'underline', cursor: 'pointer' }}>Inicia sesión aquí</a>
                  </span>
                </div>
              )}
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
    </div>
  );
};

export default RegistroPage; 