import React, { useEffect, useRef, useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useNeuroState from '../store/useNeuroState';
import { useNavigate } from 'react-router-dom';
import { WaveSurfer, WaveForm } from 'wavesurfer-react';
import AvatarUploader from './AvatarUploader';

const steps = [
  'Explora tu Segundo Cerebro',
  'Personaliza tu clon en el Centro de Entrenamiento',
  'Activa el modo Focus',
  'Conecta tu clon fuera de la plataforma',
  'Consulta tu Dashboard',
];

const audioUrl = '/sounds/synthesis.mp3';
const defaultAvatar = 'https://i.imgur.com/NOIpTwj.png';

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
        >
          <WaveForm id="onboarding-voice-waveform" />
        </WaveSurfer>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#111827] rounded-2xl p-8 shadow-xl border border-cyan-700 animate-fade-in">
      {/* Avatar IA con halo y visualizador de voz */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative mb-4 flex flex-col items-center">
          {/* Halo animado parlante avanzado y ondas SIEMPRE visibles */}
          <span
            className="absolute w-56 h-56 rounded-full z-0 halo-animado"
            style={{
              left: '-32px',
              top: '-32px',
              background: 'radial-gradient(circle, #22d3ee33 60%, transparent 100%)',
              filter: 'blur(18px)',
            }}
          />
          {/* Ondas de voz parlante (efecto realidad aumentada) */}
          <span
            className="absolute w-64 h-64 rounded-full border-2 border-cyan-400 voz-parlante-onda"
            style={{ left: '-48px', top: '-48px' }}
          />
          <span
            className="absolute w-72 h-72 rounded-full border-2 border-purple-400 voz-parlante-onda voz-parlante-onda-2"
            style={{ left: '-80px', top: '-80px' }}
          />
          <span
            className="absolute w-80 h-80 rounded-full border-2 border-cyan-300 voz-parlante-onda voz-parlante-onda-3"
            style={{ left: '-112px', top: '-112px' }}
          />
          <img
            src={avatarUrl || defaultAvatar}
            alt="avatar"
            className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-cyan-400 shadow-cyan-400/40 shadow-lg object-cover z-10 relative ring-4 ring-cyan-300 animate-avatar-float bg-black"
            style={{ background: '#111827', objectFit: 'cover' }}
          />
          {/* Visualizador de audio real debajo del avatar */}
          {audioUrl && <VoiceVisualizer audioUrl={audioUrl} />}
          {audioUrl && (
            <button
              className="mt-2 px-2 py-1 rounded bg-cyan-600 text-white font-bold text-sm flex items-center justify-center"
              style={{ minWidth: 32, minHeight: 32, borderRadius: '50%', width: 36, height: 36, padding: 0 }}
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
          className="mt-2 px-4 py-2 rounded bg-cyan-600 text-white font-bold text-base shadow hover:bg-cyan-400 transition"
          onClick={() => {
            setNameInput(userName);
            setAvatarInput(avatarUrl);
            setShowEditModal(true);
          }}
        >Editar perfil</button>
        <div className="text-2xl md:text-3xl font-orbitron text-cyan-300 mb-1 text-center">{userName || 'Invitado'} AI</div>
        <div className="text-cyan-200 text-lg font-light italic mb-1 text-center">"Hoy es un gran día para crear lo imposible 🚀"</div>
        <div className="text-cyan-400 text-base font-medium mb-2 text-center">{dateStr}</div>
      </div>
      <div className="text-cyan-200 text-lg md:text-xl font-light mb-6 animate-pulse text-center">Bienvenido a tu portal de inteligencia aumentada</div>
      {/* Bloque de pasos onboarding */}
      <div className="w-full max-w-md mx-auto mb-6">
        <ul className="flex flex-col gap-4">
          {steps.map((step, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl border font-orbitron text-base md:text-lg transition-all shadow-xl ${
                i < currentStep
                  ? 'bg-[#0d1c30] border-cyan-400 text-cyan-200 shadow-cyan-400/30'
                  : 'bg-[#0d1c30] border-gray-700 text-cyan-100 opacity-60'
              }`}
            >
              <span>
                {i < currentStep ? (
                  <FaCheckCircle className="text-cyan-400 animate-pulse" />
                ) : (
                  <span className="w-5 h-5 inline-block rounded-full border border-cyan-700" />
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
          <div className="text-cyan-300 text-xl font-bold font-orbitron">¡Estás listo para comenzar!</div>
          <button
            className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-400 text-white font-bold shadow transition text-lg"
            onClick={() => navigate('/crear-clon')}
          >
            Crear mi clon IA
          </button>
        </motion.div>
      )}
      {/* Modal de edición de perfil */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#181a2f] rounded-2xl p-8 shadow-2xl flex flex-col items-center w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-cyan-400 text-2xl" onClick={() => setShowEditModal(false)}>&times;</button>
            <h2 className="text-2xl font-orbitron text-cyan-300 mb-4">Nombre de tu clon</h2>
            <AvatarUploader
              onUpload={url => setAvatarInput(url)}
              initialUrl={avatarInput || defaultAvatar}
              label="Sube tu foto de perfil principal"
            />
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="mt-4 px-4 py-2 rounded border border-cyan-400 bg-black text-cyan-200 text-lg font-bold text-center w-full"
              placeholder="Tu nombre"
            />
            <button
              className="mt-6 px-6 py-2 rounded bg-cyan-600 text-white font-bold text-lg shadow hover:bg-cyan-400 transition"
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