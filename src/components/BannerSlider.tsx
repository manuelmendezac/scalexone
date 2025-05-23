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
      style={{ background: 'transparent' }}
    >
      {banners.map((b, i) => (
        <SwiperSlide key={i}>
          <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-cyan-900/80 to-purple-900/80 p-10 md:p-14 rounded-2xl gap-8" style={{ boxShadow: '0 4px 32px 0 #22d3ee22' }}>
            <img src={b.image} alt={b.title} className="w-36 h-36 md:w-48 md:h-48 object-cover rounded-xl shadow-cyan-500/30" />
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-orbitron text-cyan-300 mb-2">{b.title}</h2>
              <p className="text-cyan-100 mb-4 text-lg md:text-xl">{b.desc}</p>
              <a href={b.link} className="inline-block px-7 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-400 text-white font-bold shadow transition text-lg md:text-xl">{b.cta}</a>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export default BannerSlider; 