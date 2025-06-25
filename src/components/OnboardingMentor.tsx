import React, { useEffect, useRef, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useNeuroState from '../store/useNeuroState';
import { useNavigate } from 'react-router-dom';
import { WaveSurfer, WaveForm } from 'wavesurfer-react';
import AvatarUploader from './AvatarUploader';
import { supabase } from '../supabase';

const steps = [
  'Lanza tu primer producto o servicio',
  'Accede a cursos y recursos exclusivos',
  'Únete y participa en la comunidad',
  'Activa tu agente IA para ventas y soporte',
  'Configura automatizaciones para tu negocio',
  'Consulta tu dashboard de crecimiento',
];

const audioUrl = '/sounds/synthesis.mp3';
const defaultAvatar = '/images/silueta-perfil.svg';

const OnboardingMentor: React.FC = () => {
  const { avatarUrl, userName, setUserName, setAvatarUrl } = useNeuroState();
  const [currentStep, setCurrentStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const navigate = useNavigate();
  const audioInstance = useRef<HTMLAudioElement | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [showEditModal, setShowEditModal] = useState(false);
  const [avatarInput, setAvatarInput] = useState(avatarUrl);
  const [userMetadata, setUserMetadata] = useState<any>(null);

  useEffect(() => {
    if (sessionStorage.getItem('bienvenidaReproducida')) return;
    if (audioInstance.current) {
      audioInstance.current.pause();
      audioInstance.current.currentTime = 0;
    }
    const audio = new Audio(audioUrl);
    audioInstance.current = audio;
    audio.play();
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);
    audio.onplay = () => setIsPlaying(true);
    sessionStorage.setItem('bienvenidaReproducida', 'true');
    return () => {
      if (audioInstance.current) {
        audioInstance.current.pause();
        audioInstance.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    async function fetchUserMetadata() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserMetadata(user?.user_metadata || null);
      if (user?.user_metadata?.full_name || user?.user_metadata?.name) {
        setNameInput(user.user_metadata.full_name || user.user_metadata.name);
      } else if (user?.email) {
        setNameInput(user.email);
      } else {
        setNameInput('Invitado');
      }
      // Forzar avatar por defecto si no hay avatar
      if (!user?.user_metadata?.avatar_url) {
        setAvatarInput(defaultAvatar);
      } else {
        setAvatarInput(user.user_metadata.avatar_url);
      }
    }
    fetchUserMetadata();
  }, []);

  useEffect(() => {
    async function checkAndInsertUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Reutiliza la función ya definida en login/register
        if (typeof ensureUserInUsuariosTable === 'function') {
          await ensureUserInUsuariosTable(user);
        } else {
          // Lógica directa si la función no está disponible
          const { data: existing } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', user.id)
            .single();
          if (!existing) {
            await supabase.from('usuarios').insert([
              {
                id: user.id,
                name: user.user_metadata?.nombre || user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                created_at: new Date().toISOString(),
              },
            ]);
          }
        }
      }
    }
    checkAndInsertUser();
  }, []);

  useEffect(() => {
    async function debugAuthAndUserTable() {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('auth.uid:', user?.id, typeof user?.id);
      if (user?.id) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id')
          .eq('id', user.id)
          .single();
        console.log('usuario en tabla:', data, typeof data?.id, 'error:', error);
      } else {
        console.log('No hay usuario autenticado');
      }
    }
    debugAuthAndUserTable();
  }, []);

  // Simular avance de pasos con delay
  useEffect(() => {
    if (currentStep < steps.length) {
      const timeout = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 3000);
      return () => clearTimeout(timeout);
    } else if (currentStep === steps.length) {
      setTimeout(() => setFinished(true), 1000);
    }
  }, [currentStep]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Visualizador de audio real debajo del avatar
  function VoiceVisualizer({ audioUrl }: { audioUrl: string }) {
    return (
      <div style={{ width: '100%', height: 80 }}>
        <WaveSurfer
          height={80}
          waveColor="#00FFE0"
          progressColor="#7F00FF"
          barWidth={4}
          barRadius={4}
          url={audioUrl}
          interact={false}
          cursorWidth={0}
          plugins={[]}
          onMount={() => {}}
          container=""
        >
          <WaveForm id="onboarding-voice-waveform" />
        </WaveSurfer>
      </div>
    );
  }

  // Función para crear el usuario en la tabla 'usuarios' si no existe
  async function ensureUserInUsuariosTable(user: any) {
    if (!user) return;
    console.log('Intentando insertar usuario:', user);
    const { data: existing, error: selectError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', user.id)
      .single();
    if (!existing) {
      const { error } = await supabase.from('usuarios').insert([
        {
          id: user.id,
          name: user.user_metadata?.nombre || user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error('Error insertando usuario en tabla usuarios:', error);
        alert('Error insertando usuario en tabla usuarios: ' + error.message);
      } else {
        alert('Usuario insertado correctamente en la tabla usuarios');
      }
    } else {
      console.log('El usuario ya existe en la tabla usuarios');
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#111827] rounded-2xl p-8 shadow-xl border" style={{ borderColor: '#FFD700', boxShadow: '0 2px 24px #FFD70044' }}>
      {/* Avatar IA con halo y visualizador de voz */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative mb-4 flex flex-col items-center">
          {/* Halo animado parlante avanzado y ondas SIEMPRE visibles */}
          <span
            className="absolute w-56 h-56 rounded-full z-0 halo-animado"
            style={{
              left: '-32px',
              top: '-32px',
              background: 'radial-gradient(circle, #FFD70033 60%, transparent 100%)',
              filter: 'blur(18px)',
            }}
          />
          {/* Ondas de voz parlante (efecto realidad aumentada) */}
          <span
            className="absolute w-64 h-64 rounded-full border-2 voz-parlante-onda"
            style={{ left: '-48px', top: '-48px', borderColor: '#FFD700' }}
          />
          <span
            className="absolute w-72 h-72 rounded-full border-2 voz-parlante-onda voz-parlante-onda-2"
            style={{ left: '-80px', top: '-80px', borderColor: '#E8A317' }}
          />
          <span
            className="absolute w-80 h-80 rounded-full border-2 voz-parlante-onda voz-parlante-onda-3"
            style={{ left: '-112px', top: '-112px', borderColor: '#FDB813' }}
          />
          <img
            src={avatarInput || defaultAvatar}
            alt="avatar"
            style={{
              cursor: 'pointer',
              width: 180,
              height: 180,
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
              margin: '0 auto',
              boxShadow: '0 0 32px #FFD70088',
              border: '4px solid #FFD700',
              background: '#e5e7eb',
              position: 'relative',
              zIndex: 2
            }}
            onClick={() => document.getElementById('avatar-upload-input')?.click()}
          />
          <style>{`
            @media (max-width: 600px) {
              img[alt="avatar"] {
                width: 120px !important;
                height: 120px !important;
              }
            }
          `}</style>
        </div>
        {/* Visualizador de audio real debajo del avatar */}
        {audioUrl && <VoiceVisualizer audioUrl={audioUrl} />}
        {audioUrl && (
          <button
            className="mt-2 px-2 py-1 rounded font-bold text-sm flex items-center justify-center"
            style={{ minWidth: 32, minHeight: 32, borderRadius: '50%', width: 36, height: 36, padding: 0, background: 'linear-gradient(90deg, #FFD700 0%, #E8A317 100%)', color: '#18181b', boxShadow: '0 2px 8px #FFD70055' }}
            onClick={() => {
              if (audioInstance.current) {
                audioInstance.current.currentTime = 0;
                audioInstance.current.play();
                setIsPlaying(true);
              }
            }}
            disabled={isPlaying}
            title="Reproducir bienvenida"
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>&#9654;</span>
          </button>
        )}
      </div>
      <button
        className="mt-2 px-4 py-2 rounded font-bold text-base shadow transition"
        style={{ background: 'linear-gradient(90deg, #FFD700 0%, #E8A317 100%)', color: '#18181b', boxShadow: '0 2px 8px #FFD70055' }}
        onClick={() => {
          setNameInput(userName);
          setAvatarInput(avatarUrl);
          setShowEditModal(true);
        }}
      >Editar perfil</button>
      <div className="text-2xl md:text-3xl font-orbitron mb-1 text-center" style={{ color: '#FFD700', textShadow: '0 2px 8px #E8A31799' }}>
        {nameInput || 'Invitado'} AI
      </div>
      <div className="text-lg font-light italic mb-1 text-center" style={{ color: '#FDB813' }}>
        "Hoy es un gran día para crear lo imposible 🚀"
      </div>
      <div className="text-base font-medium mb-2 text-center" style={{ color: '#E8A317' }}>{dateStr}</div>
      <div className="text-lg md:text-xl font-light mb-6 animate-pulse text-center" style={{ color: '#FFD700' }}>Bienvenido a tu portal de inteligencia aumentada</div>
      {/* Bloque de pasos onboarding */}
      <div className="w-full max-w-md mx-auto mb-6">
        <ul className="flex flex-col gap-4">
          {steps.map((step, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl border font-orbitron text-base md:text-lg transition-all shadow-xl ${
                i < currentStep
                  ? 'bg-[#18181b] border-yellow-400 text-yellow-200 shadow-yellow-400/30'
                  : 'bg-[#18181b] border-gray-700 text-yellow-100 opacity-60'
              }`}
            >
              <span>
                {i < currentStep ? (
                  <FaCheckCircle className="text-yellow-400 animate-pulse" />
                ) : (
                  <span className="w-5 h-5 inline-block rounded-full border" style={{ borderColor: '#FFD700' }} />
                )}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Final de onboarding */}
      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 mt-4"
        >
          <div className="text-xl font-bold font-orbitron" style={{ color: '#FFD700', textShadow: '0 2px 8px #E8A31799' }}>¡Estás listo para comenzar!</div>
          <button
            className="px-6 py-2 rounded-lg font-bold shadow transition text-lg"
            style={{ background: 'linear-gradient(90deg, #FFD700 0%, #E8A317 100%)', color: '#18181b', boxShadow: '0 2px 12px #FFD70055' }}
            onClick={() => navigate('/crear-clon')}
          >
            Crear mi clon IA
          </button>
        </motion.div>
      )}
      {/* Modal de edición de perfil */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="rounded-2xl p-8 shadow-2xl flex flex-col items-center w-full max-w-md relative" style={{ background: '#181a2f', border: '2px solid #FFD700', boxShadow: '0 2px 24px #FFD70044' }}>
            <button className="absolute top-2 right-2 text-2xl" style={{ color: '#FFD700' }} onClick={() => setShowEditModal(false)}>&times;</button>
            <h2 className="text-2xl font-orbitron mb-4" style={{ color: '#FFD700', textShadow: '0 2px 8px #E8A31799' }}>Nombre de tu clon</h2>
            <AvatarUploader
              onUpload={async url => {
                setAvatarInput(url);
                setAvatarUrl(url);
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (!user || userError) {
                  alert('No se pudo obtener el usuario autenticado.');
                  return;
                }
                // Verificar si el registro ya existe
                const { data: existing, error: selectError } = await supabase
                  .from('usuarios')
                  .select('id')
                  .eq('id', user.id)
                  .single();
                if (selectError) {
                  alert('Error consultando la tabla usuarios: ' + selectError.message);
                  return;
                }
                if (existing) {
                  // SOLO UPDATE
                  const { error: updateError } = await supabase
                    .from('usuarios')
                    .update({ avatar_url: url })
                    .eq('id', user.id);
                  if (updateError) {
                    alert('Error actualizando tu foto de perfil: ' + updateError.message);
                  }
                } else {
                  alert('Tu usuario no existe en la tabla usuarios. Por favor, recarga la página o vuelve a iniciar sesión.');
                }
              }}
              initialUrl={avatarInput || defaultAvatar}
              label="Sube tu foto de perfil principal"
            />
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="mt-4 px-4 py-2 rounded border bg-black text-lg font-bold text-center w-full"
              style={{ borderColor: '#FFD700', color: '#FFD700' }}
              placeholder="Tu nombre"
            />
            <button
              className="mt-6 px-6 py-2 rounded font-bold text-lg shadow transition"
              style={{ background: 'linear-gradient(90deg, #FFD700 0%, #E8A317 100%)', color: '#18181b', boxShadow: '0 2px 8px #FFD70055' }}
              onClick={() => {
                setUserName(nameInput.trim() || 'Invitado');
                setAvatarUrl(avatarInput);
                setShowEditModal(false);
              }}
            >Guardar cambios</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingMentor; 