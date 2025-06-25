import React, { useEffect, useRef, useState } from 'react';
import BannerSlider from '../components/BannerSlider';
import QuickAccess from '../components/QuickAccess';
import TipsCarousel from '../components/TipsCarousel';
import useNeuroState, { useHydration } from '../store/useNeuroState';
import LoadingScreen from '../components/LoadingScreen';
import { FaUserAstronaut } from 'react-icons/fa';
import { WaveSurfer, WaveForm } from "wavesurfer-react";
import OnboardingMentor from '../components/OnboardingMentor';
import VideoSlider from '../components/VideoSlider';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Inicio: React.FC = () => {
  const { userName, userInfo } = useNeuroState();
  const isHydrated = useHydration();
  const navigate = useNavigate();
  const [communityName, setCommunityName] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  
  const news = [
    'Nuevo módulo disponible: DynamicExpertProfile',
    'Mejora en el sistema de hábitos y rutinas',
    '¡Ahora puedes personalizar tu clon IA con voz propia!',
  ];
  // Fecha actual
  const today = new Date();
  const dateStr = today.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchCommunityName = async () => {
      if (!userInfo.id) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('comunidades')
          .select('nombre')
          .eq('owner_id', userInfo.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        if (data) {
          setCommunityName(data.nombre);
        }
      } catch (err) {
        console.error("Error fetching community name for loader:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isHydrated) {
      fetchCommunityName();
    }
  }, [isHydrated, userInfo.id]);

  return (
    <div className="w-full min-h-screen" style={{ background: '#000' }}>
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8">
        <BannerSlider />
        <div className="flex flex-col gap-8">
          <OnboardingMentor />
          <VideoSlider />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-8">
              <NovedadesPanel />
              <TipsPanel />
            </div>
          </div>
        </div>
        <QuickAccess />
        <TipsCarousel news={news} />
      </div>
    </div>
  );
};

export default Inicio;

export function VoiceVisualizer({ audioUrl }: { audioUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} style={{ width: "100%", height: 80 }}>
      {containerRef.current && (
        <WaveSurfer
          plugins={[]}
          onMount={() => {}}
          container={containerRef.current}
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
      )}
    </div>
  );
} 