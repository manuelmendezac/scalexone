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
  const [clickRegistered, setClickRegistered] = useState(false);

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
  }, [searchParams]);

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

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
    try {
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

      if (authError) throw authError;

      if (authData.user) {
        // Registrar conversión si hay código de afiliado
        if (affiliateCode) {
          try {
            const { error: conversionError } = await supabase.rpc('registrar_conversion_afiliado', {
              p_codigo: affiliateCode,
              p_nuevo_usuario_id: authData.user.id,
              p_tipo_conversion: 'registro_comunidad',
              p_valor_conversion: 0
            });

            if (conversionError) {
              console.error('Error registering conversion:', conversionError);
            } else {
              console.log('Conversion registered successfully');
            }
          } catch (conversionErr) {
            console.error('Error in conversion registration:', conversionErr);
          }
        }

        // Crear perfil de usuario en la tabla usuarios
        const userEmail = authData.user.email || authData.user.user_metadata?.email || '';
        if (!userEmail) {
          toast.error('No se pudo obtener el email del usuario. Intenta con otro método de registro.');
          setLoading(false);
          return;
        }
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: authData.user.id,
              email: userEmail,
              nombre: formData.fullName,
              avatar_url: null,
              fecha_creacion: new Date().toISOString(),
              activo: true
            }
          ]);
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        setStep(3);
        toast.success('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
        
        // Redirigir después de un momento
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
            >
              <UserPlus className="h-8 w-8 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900">
              Únete a ScaleXone
            </h2>
            <p className="mt-2 text-gray-600">
              Crea tu cuenta y forma parte de nuestra comunidad
            </p>
            {affiliateCode && (
              <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm inline-block">
                Invitado por: {affiliateCode}
              </div>
            )}
          </div>

          {/* Step 1: User Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(2)}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continuar
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Repite tu contraseña"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                  Acepto los{' '}
                  <a href="/terminos" className="text-blue-600 hover:text-blue-500">
                    términos y condiciones
                  </a>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600">{errors.acceptTerms}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Atrás
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Crear Cuenta'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  ¡Cuenta Creada Exitosamente!
                </h3>
                <p className="text-gray-600">
                  Hemos enviado un email de confirmación a <strong>{formData.email}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Revisa tu bandeja de entrada y confirma tu cuenta para continuar.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Ir al Login
              </motion.button>
            </motion.div>
          )}

          {/* Login Link */}
          {step < 3 && (
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Inicia sesión
                </button>
              </p>
            </div>
          )}
        </motion.div>

        {/* Affiliate Info */}
        {affiliateCode && clickRegistered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg p-4 shadow-md text-center"
          >
            <p className="text-sm text-gray-600">
              🎉 ¡Fuiste invitado por un miembro de nuestra comunidad!
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Al registrarte, tu invitador recibirá una comisión por referirte.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RegistroPage; 