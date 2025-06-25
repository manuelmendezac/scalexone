import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Edit2 } from 'lucide-react';
import { supabase } from '../supabase';
import useNeuroState from '../store/useNeuroState';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './VideoSlider.css';

interface VideoSlide {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  videoUrl: string;
}

const VideoSlider: React.FC = () => {
  const [slides, setSlides] = useState<VideoSlide[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<VideoSlide | null>(null);
  const { userInfo } = useNeuroState();

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('video_slides')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching slides:', error);
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

  const isAdmin = userInfo?.role === 'admin';

  return (
    <div className="video-slider-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="video-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="video-slide">
              <div className="video-container">
                <iframe
                  src={slide.videoUrl}
                  title={slide.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="video-content">
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
                <button className="video-cta">{slide.buttonText}</button>
              </div>
              {isAdmin && (
                <button
                  className="admin-edit-button"
                  onClick={() => handleEdit(slide)}
                >
                  <Edit2 size={20} />
                </button>
              )}
            </div>
          </SwiperSlide>
        ))}
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
              />
              <textarea
                value={selectedSlide.description}
                onChange={(e) => setSelectedSlide({
                  ...selectedSlide,
                  description: e.target.value
                })}
                placeholder="Descripción"
              />
              <input
                type="text"
                value={selectedSlide.buttonText}
                onChange={(e) => setSelectedSlide({
                  ...selectedSlide,
                  buttonText: e.target.value
                })}
                placeholder="Texto del botón"
              />
              <input
                type="text"
                value={selectedSlide.videoUrl}
                onChange={(e) => setSelectedSlide({
                  ...selectedSlide,
                  videoUrl: e.target.value
                })}
                placeholder="URL del video"
              />
              <div className="button-group">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setIsEditing(false)}>
                  Cancelar
                </button>
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSlider; 