import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Edit2 } from 'lucide-react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';

// Importar estilos de Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './VideoSlider.css';

interface VideoSlide {
  id: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonUrl?: string;
  videoUrl: string;
  videoType: 'youtube' | 'vimeo';
}

const VideoSlider: React.FC = () => {
  const [slides, setSlides] = useState<VideoSlide[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<VideoSlide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userInfo } = useNeuroState();

  useEffect(() => {
    console.log('VideoSlider montado');
    console.log('Estado inicial - loading:', loading, 'slides:', slides);
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      console.log('Iniciando fetchSlides...');
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('video_slides')
        .select('*')
        .order('created_at', { ascending: true });

      console.log('Respuesta de Supabase:', { data, error });

      if (error) {
        console.error('Error de Supabase:', error);
        setError(error.message);
        throw error;
      }
      
      if (!data) {
        console.log('No hay datos disponibles');
        setSlides([]);
      } else {
        console.log('Slides obtenidos:', data);
        setSlides(data);
      }
    } catch (error) {
      console.error('Error en fetchSlides:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
      console.log('Estado final - loading:', false, 'slides:', slides);
    }
  };

  const getEmbedUrl = (url: string, type: 'youtube' | 'vimeo'): string => {
    console.log('Procesando URL:', url, 'tipo:', type);
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\n?\s]{11})/);
      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
      console.log('URL de embed generada:', embedUrl);
      return embedUrl;
    } else {
      const videoId = url.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/);
      const embedUrl = videoId ? `https://player.vimeo.com/video/${videoId[1]}` : url;
      console.log('URL de embed generada:', embedUrl);
      return embedUrl;
    }
  };

  const handleEdit = (slide: VideoSlide) => {
    setSelectedSlide(slide);
    setIsEditing(true);
  };

  const handleSave = async (updatedSlide: VideoSlide) => {
    try {
      const { error } = await supabase
        .from('video_slides')
        .upsert(updatedSlide);

      if (error) throw error;
      
      setIsEditing(false);
      setSelectedSlide(null);
      fetchSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('video_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  console.log('Renderizando VideoSlider - Estado actual:', {
    loading,
    error,
    slidesCount: slides.length,
    isAdmin: userInfo?.rol === 'admin'
  });

  // Si está cargando, mostrar un placeholder
  if (loading) {
    console.log('Mostrando estado de carga');
    return (
      <div className="video-slider-container">
        <div className="video-slide loading-placeholder">
          <div className="animate-pulse bg-gray-700 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    console.log('Mostrando estado de error:', error);
    return (
      <div className="video-slider-container">
        <div className="video-slide error-state">
          <p className="text-red-500">Error: {error}</p>
          <button 
            onClick={fetchSlides}
            className="mt-4 px-4 py-2 bg-gold text-black rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si no hay slides y el usuario es admin, mostrar botón para crear
  if (slides.length === 0) {
    console.log('No hay slides disponibles');
    if (userInfo?.rol === 'admin') {
      console.log('Mostrando botón de creación para admin');
      return (
        <div className="video-slider-container">
          <div className="video-slide flex flex-col items-center justify-center">
            <p className="text-gold mb-4">No hay videos configurados</p>
            <button
              onClick={() => {
                setSelectedSlide({
                  id: crypto.randomUUID(),
                  title: '',
                  description: '',
                  videoUrl: '',
                  videoType: 'youtube'
                });
                setIsEditing(true);
              }}
              className="px-4 py-2 bg-gold text-black rounded-lg"
            >
              Agregar Video
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  console.log('Renderizando slider con', slides.length, 'slides');
  return (
    <div className="video-slider-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={true}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="video-swiper"
        spaceBetween={30}
        slidesPerView={1}
      >
        {slides.map((slide) => {
          console.log('Renderizando slide:', slide);
          return (
            <SwiperSlide key={slide.id}>
              <div className="video-slide">
                <div className="video-container">
                  <iframe
                    src={getEmbedUrl(slide.videoUrl, slide.videoType)}
                    title={slide.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="video-content">
                  <h2>{slide.title}</h2>
                  <p>{slide.description}</p>
                  {slide.buttonText && slide.buttonUrl && (
                    <a 
                      href={slide.buttonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-cta"
                    >
                      {slide.buttonText}
                    </a>
                  )}
                </div>
                {userInfo?.rol === 'admin' && (
                  <button
                    className="admin-edit-button"
                    onClick={() => handleEdit(slide)}
                  >
                    <Edit2 size={20} />
                  </button>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {isEditing && selectedSlide && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Editar Slide</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSave(selectedSlide);
            }}>
              <input
                type="text"
                value={selectedSlide.title}
                onChange={(e) => setSelectedSlide({
                  ...selectedSlide,
                  title: e.target.value
                })}
                placeholder="Título"
                required
              />
              <textarea
                value={selectedSlide.description}
                onChange={(e) => setSelectedSlide({
                  ...selectedSlide,
                  description: e.target.value
                })}
                placeholder="Descripción"
                required
              />
              <select
                value={selectedSlide.videoType}
                onChange={(e) => setSelectedSlide({
                  ...selectedSlide,
                  videoType: e.target.value as 'youtube' | 'vimeo'
                })}
                required
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
              </select>
              <input
                type="text"
                value={selectedSlide.videoUrl}
                onChange={(e) => setSelectedSlide({
                  ...selectedSlide,
                  videoUrl: e.target.value
                })}
                placeholder="URL del video (YouTube o Vimeo)"
                required
              />
              <input
                type="text"
                value={selectedSlide.buttonText || ''}
                onChange={(e) => setSelectedSlide({
                  ...selectedSlide,
                  buttonText: e.target.value
                })}
                placeholder="Texto del botón (opcional)"
              />
              <input
                type="text"
                value={selectedSlide.buttonUrl || ''}
                onChange={(e) => setSelectedSlide({
                  ...selectedSlide,
                  buttonUrl: e.target.value
                })}
                placeholder="URL del botón (opcional)"
              />
              <div className="button-group">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setIsEditing(false)}>
                  Cancelar
                </button>
                {selectedSlide.id && (
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => {
                      handleDelete(selectedSlide.id);
                      setIsEditing(false);
                    }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSlider; 