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

  // Usar SIEMPRE el community_id del usuario, o el de Scalexone como fallback
  const communityId = userInfo?.community_id || '8fb70d6e-3237-465e-8669-979461cf2bc1';

  useEffect(() => {
    const fetchCommunityName = async () => {
      if (!communityId) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('comunidades')
          .select('nombre')
          .eq('id', communityId)
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
  }, [isHydrated, communityId]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full min-h-screen bg-black">
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        <BannerSlider />
        <div className="flex flex-col gap-8 mt-8">
          <OnboardingMentor />
          <div className="w-full">
            <VideoSlider />
          </div>
        </div>
        <div className="mt-8">
          <QuickAccess />
        </div>
        <div className="mt-8">
          <TipsCarousel news={news} />
        </div>
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