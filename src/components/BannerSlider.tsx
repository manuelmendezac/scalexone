import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import { supabase } from '../supabase';
import { Loader2 } from 'lucide-react';

interface Banner {
  id: string;
  image: string;
  title: string;
  desc: string;
  link: string;
  cta: string;
  order_index: number;
}

const BannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('banners')
        .select('*')
        .order('order_index');

      if (fetchError) throw fetchError;
      setBanners(data || []);

    } catch (err: any) {
      console.error('Error cargando banners:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500">
        Error cargando banners: {error}
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-12">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
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
                  {banner.desc}
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
    </div>
  );
};

export default BannerSlider; 