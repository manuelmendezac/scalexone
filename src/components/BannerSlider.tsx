import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';

const banners = [
  {
    image: '/banner1.jpg',
    title: '¡Nuevo módulo IA disponible!',
    desc: 'Descubre DynamicExpertProfile y lleva tu clon al siguiente nivel.',
    link: '/modules/dynamic-expert-profile',
    cta: 'Ver más',
  },
  {
    image: '/banner2.jpg',
    title: 'Mejora en hábitos y rutinas',
    desc: 'Ahora tu IA puede medir y sugerir rutinas personalizadas.',
    link: '/habit-intelligence',
    cta: 'Explorar',
  },
  {
    image: '/banner3.jpg',
    title: '¡Tu clon IA ahora tiene voz propia!',
    desc: 'Activa la voz y personaliza la experiencia.',
    link: '/settings',
    cta: 'Configurar',
  },
];

const BannerSlider: React.FC = () => (
  <div className="w-full mb-12">
    <Swiper
      modules={[Pagination, Autoplay]}
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000 }}
      loop
      className="rounded-2xl shadow-lg"
      style={{ background: '#000000' }}
    >
      {banners.map((b, i) => (
        <SwiperSlide key={i}>
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
                src={b.image} 
                alt={b.title} 
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
                {b.title}
              </h2>
              <p 
                className="mb-6 text-lg md:text-xl"
                style={{ color: '#FDB813' }}
              >
                {b.desc}
              </p>
              <a 
                href={b.link} 
                className="inline-block px-8 py-3 rounded-lg font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  background: 'linear-gradient(90deg, #FFD700 0%, #FDB813 100%)',
                  color: '#000000',
                  boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
                  border: '1px solid rgba(255,215,0,0.3)'
                }}
              >
                {b.cta}
              </a>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export default BannerSlider; 