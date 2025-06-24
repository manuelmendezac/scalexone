// BannerSlider component - Updated for deployment
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-creative';
import { Pagination, Autoplay, Navigation, EffectCreative } from 'swiper/modules';
import { supabase } from '../supabase';
import { Loader2, Edit2 } from 'lucide-react';
import BannerEditModal from './BannerEditModal';
import type { Banner } from '../types/banner.types';
import './BannerSlider.css';

const initialBanner: Banner = {
  id: 'initial',
  image: '/images/modulos/modulo2.png',
  title: 'IA AUTOMATIZADA',
  description: 'CONCENTRA TU NEGOCIO DIGITAL 24/7',
  link: '/modules/dynamic-expert-profile',
  cta: 'INGRESAR',
  order_index: 0,
};

const BannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([initialBanner]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadBanners();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(data?.rol === 'admin' || data?.rol === 'superadmin');
      }
    } catch (err) {
      console.error('Error verificando rol de admin:', err);
    }
  };

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('banners')
        .select('*')
        .order('order_index');

      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        setBanners(data);
      }

    } catch (err: any) {
      console.error('Error cargando banners:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedBanners: Banner[]) => {
    try {
      setLoading(true);
      setError(null);

      // Eliminar banners que ya no existen
      const bannersToDelete = banners.filter(
        oldBanner => oldBanner.id !== 'initial' && !updatedBanners.find(newBanner => newBanner.id === oldBanner.id)
      );

      if (bannersToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('banners')
          .delete()
          .in('id', bannersToDelete.map(b => b.id));

        if (deleteError) throw deleteError;
      }

      // Filtrar el banner inicial y actualizar o insertar los demás
      const bannersToSave = updatedBanners
        .filter(b => b.id !== 'initial')
        .map((banner, index) => ({
          ...banner,
          order_index: index,
          created_at: banner.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      
      if (bannersToSave.length > 0) {
        const { error: upsertError } = await supabase
          .from('banners')
          .upsert(bannersToSave);

        if (upsertError) throw upsertError;
      }

      await loadBanners();
    } catch (err: any) {
      console.error('Error guardando banners:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full mb-12">
      <Swiper
        modules={[Pagination, Autoplay, Navigation, EffectCreative]}
        pagination={{ clickable: true }}
        navigation={true}
        autoplay={{ 
          delay: 5000,
          disableOnInteraction: false
        }}
        effect="creative"
        creativeEffect={{
          prev: {
            shadow: true,
            translate: ["-20%", 0, -1],
            opacity: 0
          },
          next: {
            translate: ["100%", 0, 0],
            opacity: 0
          },
        }}
        loop
        className="rounded-2xl shadow-lg"
        style={{ background: '#000000' }}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div 
              className="flex flex-col md:flex-row items-center p-10 md:p-14 rounded-2xl gap-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(45deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.9) 100%)',
                boxShadow: '0 4px 60px 0 rgba(255,215,0,0.15), inset 0 0 0 1px rgba(255,215,0,0.1)'
              }}
            >
              {/* Botón de editar */}
              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors z-10"
                >
                  <Edit2 size={20} />
                </button>
              )}

              {/* Efectos de luz dorados */}
              <div 
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 30% 50%, rgba(255,215,0,0.1) 0%, transparent 60%), radial-gradient(circle at 70% 50%, rgba(255,215,0,0.05) 0%, transparent 60%)'
                }}
              />
              <div 
                className="absolute top-0 left-0 w-full h-1"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.2) 50%, transparent 100%)'
                }}
              />
              
              {/* Imagen con efecto dorado */}
              <div className="relative">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-36 h-36 md:w-48 md:h-48 object-cover rounded-xl shadow-2xl" 
                  style={{
                    boxShadow: '0 0 30px 0 rgba(255,215,0,0.2), 0 0 0 1px rgba(255,215,0,0.1)'
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(45deg, rgba(255,215,0,0.1) 0%, transparent 100%)'
                  }}
                />
              </div>

              {/* Contenido */}
              <div className="flex-1 relative z-10">
                <h2 
                  className="text-3xl md:text-4xl font-orbitron mb-4"
                  style={{
                    background: 'linear-gradient(90deg, #FFD700 0%, #FDB813 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 20px rgba(255,215,0,0.2)'
                  }}
                >
                  {banner.title}
                </h2>
                <p 
                  className="mb-6 text-lg md:text-xl"
                  style={{ color: '#FDB813' }}
                >
                  {banner.description}
                </p>
                <a
                  href={banner.link}
                  className="inline-block px-8 py-3 rounded-lg font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(90deg, #FFD700 0%, #FDB813 100%)',
                    color: '#000000',
                    boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
                    border: '1px solid rgba(255,215,0,0.3)'
                  }}
                >
                  {banner.cta}
                </a>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {isModalOpen && (
        <BannerEditModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          banners={banners}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default BannerSlider; 