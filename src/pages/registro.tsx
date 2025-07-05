import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { syncUsuarioSupabase } from '../utils/syncUsuarioSupabase';
import axios from 'axios';

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
  const [communityId, setCommunityId] = useState<string>('default');
  const [afiliadoReferente, setAfiliadoReferente] = useState<string | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

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
    const commId = searchParams.get('community_id');
    if (refCode) {
      setAffiliateCode(refCode);
      registerAffiliateClick(refCode);
      // Buscar el user_id del IB referente
      supabase
        .from('codigos_afiliado')
        .select('user_id')
        .eq('codigo', refCode)
        .eq('activo', true)
        .single()
        .then(({ data }) => {
          if (data?.user_id) setAfiliadoReferente(data.user_id);
        });
    }
    if (commId) {
      setCommunityId(commId);
    } else {
      setCommunityId('default');
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

  const getParams = () => {
    let refCode = searchParams.get('ref');
    let commId = searchParams.get('community_id');
    // Si no hay en la URL, buscar en localStorage
    if (!refCode) refCode = localStorage.getItem('affiliate_ref');
    if (!commId) commId = localStorage.getItem('affiliate_community_id');
    return {
      affiliateCode: refCode,
      communityId: commId || 'default',
    };
  };

  const handleRegister = async () => {
    // Validar tracking_id antes de continuar
    const trackingId = localStorage.getItem('affiliate_tracking_id');
    if (!trackingId) {
      setTrackingError('No se detectó el tracking de afiliado. Por favor, accede desde el link de invitación o recarga la página.');
      toast.error('No se detectó el tracking de afiliado. Usa el link de invitación.');
      return;
    }
    setTrackingError(null);
    if (!validateForm()) return;
    setLoading(true);
    setShowLoginLink(false);
    // Tomar los parámetros directamente de la URL
    const { affiliateCode: refCode, communityId: commId } = getParams();
    let referenteId = afiliadoReferente;
    if (refCode && !referenteId) {
      // Buscar el user_id del IB referente si no está en estado
      const { data } = await supabase
        .from('codigos_afiliado')
        .select('user_id')
        .eq('codigo', refCode)
        .eq('activo', true)
        .single();
      if (data?.user_id) referenteId = data.user_id;
    }
    if (!commId) {
      toast.error('No se detectó la comunidad. Intenta de nuevo desde el link de afiliado.');
      setLoading(false);
      return;
    }
    try {
      let userId = null;
      let userEmail = formData.email;
      let userObj = null;
      if (sessionUser) {
        userId = sessionUser.id;
        userEmail = sessionUser.email || sessionUser.user_metadata?.email || '';
        userObj = sessionUser;
      } else {
        // Registrar usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              affiliate_code: refCode,
              community_id: commId,
              afiliado_referente: referenteId
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
        if (!authData.user) {
          toast.error('No se pudo crear el usuario en Auth.');
          setLoading(false);
          return;
        }
        userId = authData.user.id;
        userEmail = authData.user.email || authData.user.user_metadata?.email || '';
        userObj = authData.user;
      }
      // Sincronizar usuario SOLO vía backend
      setSyncing(true);
      try {
        await axios.post('/api/afiliados/registro', {
          user_id: userId,
          email: userEmail,
          nombre: formData.fullName,
          tracking_id: trackingId
        });
        localStorage.removeItem('affiliate_tracking_id');
      } catch (err) {
        setSyncing(false);
        setLoading(false);
        toast.error('Error al sincronizar afiliación. Intenta de nuevo.');
        return;
      }
      setSyncing(false);
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
    // Tomar los parámetros directamente de la URL
    const { affiliateCode: refCode, communityId: commId } = getParams();
    let referenteId = afiliadoReferente;
    if (refCode && !referenteId) {
      const { data } = await supabase
        .from('codigos_afiliado')
        .select('user_id')
        .eq('codigo', refCode)
        .eq('activo', true)
        .single();
      if (data?.user_id) referenteId = data.user_id;
    }
    if (!commId) {
      setError('No se detectó la comunidad. Intenta de nuevo desde el link de afiliado.');
      setLoading(false);
      return;
    }
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
        // Sincronizar usuario en tabla usuarios
        await syncUsuarioSupabase({
          ...user,
          community_id: commId,
          afiliado_referente: referenteId,
          user_metadata: {
            ...user.user_metadata,
            community_id: commId,
            afiliado_referente: referenteId
          }
        });
        // Tracking de lead/conversión
        const trackingId = localStorage.getItem('affiliate_tracking_id');
        if (trackingId) {
          try {
            await axios.post('/api/afiliados/registro', {
              user_id: user.id,
              email: user.email,
              nombre: user.user_metadata?.full_name || user.user_metadata?.name || '',
              tracking_id: trackingId
            });
            localStorage.removeItem('affiliate_tracking_id');
          } catch (err) {
            console.error('Error registrando lead/conversión:', err);
          }
        }
        // Crear IB único usando la función RPC robusta
        await supabase.rpc('crear_codigo_afiliado_para_usuario', { p_user_id: user.id });
        // Limpiar localStorage tras registro exitoso
        localStorage.removeItem('affiliate_ref');
        localStorage.removeItem('affiliate_community_id');
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
              {trackingError && (
                <div style={{ color: 'red', marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>
                  {trackingError}
                </div>
              )}
              {syncing && (
                <div style={{ color: '#FFD700', marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>
                  Sincronizando afiliación...
                </div>
              )}
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