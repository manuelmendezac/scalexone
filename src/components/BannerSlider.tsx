// BannerSlider component - Updated for deployment
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
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
  backgroundImage: '/images/banners/city-background.jpg',
  title: 'Conecta con TU SER',
  description: 'Desbloquea el poder que te llevará a la vida que mereces',
  link: '/modules/dynamic-expert-profile',
  cta: 'Comenzar',
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
    <div className="w-full relative banner-container">
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
        className="banner-swiper"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="banner-slide">
              {/* Imagen de fondo con overlay */}
              <div 
                className="banner-background"
                style={{
                  backgroundImage: `url(${banner.backgroundImage || banner.image})`,
                }}
              >
                <div className="banner-overlay" />
              </div>
              
              {/* Contenido del banner */}
              <div className="banner-content">
                <div className="banner-text">
                  <h1 className="banner-title">{banner.title}</h1>
                  <p className="banner-description">{banner.description}</p>
                  <a href={banner.link} className="banner-cta">
                    {banner.cta}
                  </a>
                </div>
              </div>

              {/* Botón de editar para admins */}
              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="admin-edit-button"
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {isModalOpen && (
        <BannerEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          banners={banners}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default BannerSlider; 