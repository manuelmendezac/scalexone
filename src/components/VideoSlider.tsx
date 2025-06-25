import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';
import './VideoSlider.css';

interface VideoSlide {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_type: 'youtube' | 'vimeo';
  is_visible?: boolean;
  order?: number;
}

const VideoSlider: React.FC = () => {
  const [slides, setSlides] = useState<VideoSlide[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<VideoSlide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchSlides();
  }, [user]);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('video_slides')
        .select('*')
        .order('order', { ascending: true });

      if (!isAdmin) {
        query = query.eq('is_visible', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      const validSlides = (data || []).map(slide => ({
        id: String(slide.id),
        title: String(slide.title),
        description: String(slide.description),
        video_url: String(slide.video_url),
        video_type: slide.video_type as 'youtube' | 'vimeo',
        is_visible: slide.is_visible !== undefined ? Boolean(slide.is_visible) : true,
        order: slide.order
      }));

      setSlides(validSlides);
    } catch (err) {
      console.error('Error al cargar videos:', err);
      setError('Error al cargar los videos');
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url: string, type: 'youtube' | 'vimeo'): string => {
    try {
      if (type === 'youtube') {
        const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\n?\s]{11})/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : '';
      } else {
        const videoId = url.match(/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/);
        return videoId ? `https://player.vimeo.com/video/${videoId[1]}` : '';
      }
    } catch (err) {
      console.error('Error al procesar URL:', err);
      return '';
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedSlide) return;

      const slideToSave = {
        id: selectedSlide.id,
        title: selectedSlide.title,
        description: selectedSlide.description,
        video_url: selectedSlide.video_url,
        video_type: selectedSlide.video_type,
        is_visible: selectedSlide.is_visible !== undefined ? selectedSlide.is_visible : true,
        order: selectedSlide.order || slides.length + 1
      };

      const { error: saveError } = await supabase
        .from('video_slides')
        .upsert(slideToSave);

      if (saveError) throw saveError;
      
      setIsEditing(false);
      setSelectedSlide(null);
      await fetchSlides();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError('Error al guardar el video');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  const currentSlide = slides[currentSlideIndex];
  if (!currentSlide) return null;

  return (
    <div className="video-slider-simple">
      <div className="video-content">
        <div className="video-player">
          <iframe
            src={getEmbedUrl(currentSlide.video_url, currentSlide.video_type)}
            title={currentSlide.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="video-info">
          <h2>{currentSlide.title}</h2>
          <p>{currentSlide.description}</p>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-line">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`progress-point ${index <= currentSlideIndex ? 'completed' : ''} ${index === currentSlideIndex ? 'current' : ''}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="navigation-buttons">
        <button
          onClick={handlePrev}
          disabled={currentSlideIndex === 0}
          className="nav-button prev"
        >
          ANTERIOR
        </button>
        <button
          onClick={handleNext}
          disabled={currentSlideIndex === slides.length - 1}
          className="nav-button next"
        >
          SIGUIENTE
        </button>
      </div>

      {isAdmin && (
        <div className="admin-controls">
          <button onClick={() => setIsEditing(true)}>Editar</button>
        </div>
      )}

      {isEditing && selectedSlide && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Editar Video</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={selectedSlide.title}
                  onChange={(e) => setSelectedSlide({
                    ...selectedSlide,
                    title: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={selectedSlide.description}
                  onChange={(e) => setSelectedSlide({
                    ...selectedSlide,
                    description: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>URL del Video</label>
                <input
                  type="text"
                  value={selectedSlide.video_url}
                  onChange={(e) => setSelectedSlide({
                    ...selectedSlide,
                    video_url: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo de Video</label>
                <select
                  value={selectedSlide.video_type}
                  onChange={(e) => setSelectedSlide({
                    ...selectedSlide,
                    video_type: e.target.value as 'youtube' | 'vimeo'
                  })}
                  required
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </div>
              <div className="button-group">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setIsEditing(false)}>
                  Cancelar
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