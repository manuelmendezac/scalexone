import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import { supabase } from '../supabase';
import { Loader2, Edit2 } from 'lucide-react';
import BannerEditModal from './BannerEditModal';

interface Banner {
  id: string;
  image: string;
  title: string;
  desc: string;
  link: string;
  cta: string;
  order_index: number;
}

const initialBanner: Banner = {
  id: 'initial',
  image: '/images/modulos/modulo2.png',
  title: '¡Nuevo módulo IA disponible!',
  desc: 'Descubre DynamicExpertProfile y lleva tu clon al siguiente nivel.',
  link: '/modules/dynamic-expert-profile',
  cta: 'Ver más',
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
      await loadBanners(); // Recargar los banners después de guardar
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
    <>
      <div className="relative">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="w-full rounded-xl overflow-hidden"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="relative aspect-[21/9]">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-6 md:p-8">
                  <div className="max-w-2xl">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{banner.title}</h2>
                    <p className="text-gray-200 text-sm md:text-base mb-4">{banner.desc}</p>
                    <a
                      href={banner.link}
                      className="inline-block px-6 py-2 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FDB813] transition-colors"
                    >
                      {banner.cta}
                    </a>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
            title="Editar banners"
          >
            <Edit2 size={20} />
          </button>
        )}
      </div>

      <BannerEditModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banners={banners}
        onSave={handleSave}
      />
    </>
  );
};

export default BannerSlider; 