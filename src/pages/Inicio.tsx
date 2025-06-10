import React, { useEffect, useRef } from 'react';
import BannerSlider from '../components/BannerSlider';
import KPIDashboard from '../components/KPIDashboard';
import QuickAccess from '../components/QuickAccess';
import TipsCarousel from '../components/TipsCarousel';
import useNeuroState from '../store/useNeuroState';
import { FaUserAstronaut } from 'react-icons/fa';
import { WaveSurfer, WaveForm } from "wavesurfer-react";
import OnboardingMentor from '../components/OnboardingMentor';

const Inicio: React.FC = () => {
  const { userName } = useNeuroState();
  // Simulación de datos
  const kpis = {
    microtasks: 82,
    focusTime: 3.5,
    lastAIMessage: '¡Recuerda tu meta semanal!',
    emotion: '😃',
  };
  const news = [
    'Nuevo módulo disponible: DynamicExpertProfile',
    'Mejora en el sistema de hábitos y rutinas',
    '¡Ahora puedes personalizar tu clon IA con voz propia!',
  ];
  // Fecha actual
  const today = new Date();
  const dateStr = today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    // Eliminar reproducción automática de audio remoto
  }, [userName]);

  return (
    <div className="w-full min-h-screen bg-transparent">
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8">
        <BannerSlider />
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Onboarding Mentor IA centrado */}
          <div className="flex-1 flex items-center justify-center mx-auto">
            <OnboardingMentor />
          </div>
        </div>
        <KPIDashboard kpis={kpis} />
        <QuickAccess />
        <TipsCarousel news={news} />
      </div>
    </div>
  );
};

export default Inicio;

export function VoiceVisualizer({ audioUrl }: { audioUrl: string }) {
  return (
    <div style={{ width: "100%", height: 80 }}>
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