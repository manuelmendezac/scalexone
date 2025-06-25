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
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('video_slides')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error al obtener slides:', error);
        setError(error.message);
        return;
      }

      // Validar y transformar los datos
      const validSlides = (data || []).reduce((acc: VideoSlide[], slide: any) => {
        if (!slide) return acc;

        // Validar campos requeridos
        if (!slide.id || !slide.title || !slide.description || !slide.videoUrl || !slide.videoType) {
          console.warn('Slide inválido encontrado:', slide);
          return acc;
        }

        // Validar tipo de video
        if (slide.videoType !== 'youtube' && slide.videoType !== 'vimeo') {
          console.warn('Tipo de video inválido:', slide.videoType);
          return acc;
        }

        // Crear objeto slide con valores por defecto seguros
        const validSlide: VideoSlide = {
          id: String(slide.id),
          title: String(slide.title),
          description: String(slide.description),
          videoUrl: String(slide.videoUrl),
          videoType: slide.videoType as 'youtube' | 'vimeo',
          buttonText: slide.buttonText ? String(slide.buttonText) : undefined,
          buttonUrl: slide.buttonUrl ? String(slide.buttonUrl) : undefined
        };

        return [...acc, validSlide];
      }, []);

      setSlides(validSlides);
    } catch (err) {
      console.error('Error inesperado:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url: string, type: 'youtube' | 'vimeo'): string => {
    if (!url || !type) {
      console.warn('URL o tipo indefinido:', { url, type });
      return '';
    }

    try {
      if (type === 'youtube') {
        // Validar si ya es una URL de embed
        if (url.includes('youtube.com/embed/')) {
          return url;
        }

        const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\n?\s]{11})/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : '';
      } else if (type === 'vimeo') {
        // Validar si ya es una URL de embed
        if (url.includes('player.vimeo.com/video/')) {
          return url;
        }

        const videoId = url.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/);
        return videoId ? `https://player.vimeo.com/video/${videoId[1]}` : '';
      }
      
      console.warn('Tipo de video no soportado:', type);
      return '';
    } catch (err) {
      console.error('Error al procesar URL:', err);
      return '';
    }
  };

  const handleEdit = (slide: VideoSlide) => {
    setSelectedSlide(slide);
    setIsEditing(true);
  };

  const handleSave = async (updatedSlide: VideoSlide) => {
    try {
      if (!updatedSlide.id || !updatedSlide.title || !updatedSlide.description || !updatedSlide.videoUrl) {
        setError('Todos los campos requeridos deben estar completos');
        return;
      }

      // Validar URL del video según el tipo
      const embedUrl = getEmbedUrl(updatedSlide.videoUrl, updatedSlide.videoType);
      if (!embedUrl) {
        setError('URL del video inválida');
        return;
      }

      const slideToSave = {
        ...updatedSlide,
        videoUrl: embedUrl
      };

      const { error: saveError } = await supabase
        .from('video_slides')
        .upsert(slideToSave);

      if (saveError) throw saveError;
      
      setIsEditing(false);
      setSelectedSlide(null);
      await fetchSlides();
    } catch (err) {
      console.error('Error al guardar slide:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar el slide');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('video_slides')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchSlides();
      setIsEditing(false);
    } catch (err) {
      console.error('Error al eliminar slide:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el slide');
    }
  };

  if (loading) {
    return (
      <div className="video-slider-container">
        <div className="video-slide loading-placeholder">
          <div className="animate-pulse bg-gray-700 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
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

  if (slides.length === 0) {
    if (userInfo?.rol === 'admin') {
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
          const embedUrl = getEmbedUrl(slide.videoUrl, slide.videoType);
          if (!embedUrl) return null;

          return (
            <SwiperSlide key={slide.id}>
              <div className="video-slide">
                <div className="video-container">
                  <iframe
                    src={embedUrl}
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