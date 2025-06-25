import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Eye, EyeOff, ArrowLeft, ArrowRight, Edit3 } from 'lucide-react';
import { supabase } from '../supabase';
import './VideoSlider.css';
import { useAuth } from '../hooks/useAuth';

interface VideoSlide {
  id: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonUrl?: string;
  videoUrl: string;
  videoType: 'youtube' | 'vimeo';
  is_visible?: boolean;
  order?: number;
}

interface UserConfig {
  show_video_slider: boolean;
}

const VideoSlider: React.FC = () => {
  const [slides, setSlides] = useState<VideoSlide[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<VideoSlide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { user, isAdmin } = useAuth();
  const [showSlider, setShowSlider] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    fetchSlides();
    fetchUserConfig();
  }, [user]);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('video_slides')
        .select('*')
        .order('order', { ascending: true });

      // Si no es admin, solo mostrar slides visibles
      if (!isAdmin) {
        query = query.eq('is_visible', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al obtener slides:', error);
        setError(error.message);
        return;
      }

      const validSlides = (data || []).reduce((acc: VideoSlide[], slide: any) => {
        if (!slide) return acc;

        try {
          const validSlide: VideoSlide = {
            id: String(slide.id),
            title: String(slide.title),
            description: String(slide.description),
            videoUrl: String(slide.video_url),
            videoType: slide.video_type as 'youtube' | 'vimeo',
            buttonText: slide.button_text ? String(slide.button_text) : undefined,
            buttonUrl: slide.button_url ? String(slide.button_url) : undefined,
            is_visible: slide.is_visible !== undefined ? Boolean(slide.is_visible) : true,
            order: slide.order
          };

          // Validar campos requeridos
          if (!validSlide.title || !validSlide.description || !validSlide.videoUrl) {
            console.warn('Slide con campos requeridos faltantes:', slide);
            return acc;
          }

          // Validar tipo de video
          if (validSlide.videoType !== 'youtube' && validSlide.videoType !== 'vimeo') {
            console.warn('Tipo de video inválido:', validSlide.videoType);
            return acc;
          }

          return [...acc, validSlide];
        } catch (err) {
          console.error('Error procesando slide:', err);
          return acc;
        }
      }, []);

      setSlides(validSlides);
    } catch (err) {
      console.error('Error inesperado:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConfig = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_config')
        .select('show_video_slider')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignorar error cuando no hay registros
        throw error;
      }

      if (data) {
        setShowSlider(data.show_video_slider);
      } else if (isAdmin) {
        // Solo crear configuración por defecto para admins
        const { error: insertError } = await supabase
          .from('user_config')
          .insert([{ 
            user_id: user.id, 
            show_video_slider: true 
          }]);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error fetching user config:', error);
      // No mostrar error al usuario ya que esto es configuración opcional
    }
  };

  const toggleSliderVisibility = async () => {
    try {
      const newValue = !showSlider;
      const { error } = await supabase
        .from('user_config')
        .upsert({ 
          user_id: user?.id, 
          show_video_slider: newValue 
        });

      if (error) throw error;
      setShowSlider(newValue);
    } catch (error) {
      console.error('Error updating slider visibility:', error);
    }
  };

  const getEmbedUrl = (url: string, type: 'youtube' | 'vimeo'): string => {
    if (!url || !type) {
      console.warn('URL o tipo indefinido:', { url, type });
      return '';
    }

    try {
      if (type === 'youtube') {
        if (url.includes('youtube.com/embed/')) {
          return url;
        }

        const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\n?\s]{11})/);
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : '';
      } else if (type === 'vimeo') {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!selectedSlide) return;

      if (!selectedSlide.title || !selectedSlide.description || !selectedSlide.videoUrl) {
        setError('Todos los campos requeridos deben estar completos');
        return;
      }

      const slideToSave = {
        id: selectedSlide.id,
        title: selectedSlide.title,
        description: selectedSlide.description,
        video_url: selectedSlide.videoUrl,
        video_type: selectedSlide.videoType,
        button_text: selectedSlide.buttonText || null,
        button_url: selectedSlide.buttonUrl || null,
        is_visible: selectedSlide.is_visible !== undefined ? selectedSlide.is_visible : true,
        order: selectedSlide.order || slides.length + 1
      };

      console.log('Guardando slide:', slideToSave);

      const { error: saveError } = await supabase
        .from('video_slides')
        .upsert(slideToSave);

      if (saveError) {
        console.error('Error al guardar:', saveError);
        throw saveError;
      }
      
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

  const toggleVisibility = async (slide: VideoSlide) => {
    try {
      const { error: updateError } = await supabase
        .from('video_slides')
        .update({ is_visible: !slide.is_visible })
        .eq('id', slide.id);

      if (updateError) throw updateError;
      await fetchSlides();
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err);
      setError(err instanceof Error ? err.message : 'Error al cambiar visibilidad');
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < visibleSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleVideoUrlChange = (url: string) => {
    if (!selectedSlide) return;
    
    setSelectedSlide({
      ...selectedSlide,
      videoUrl: url
    });

    // Generar URL de preview
    const embedUrl = getEmbedUrl(url, selectedSlide.videoType);
    setPreviewUrl(embedUrl);
  };

  const handleAddVideo = () => {
    setSelectedSlide({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      videoUrl: '',
      videoType: 'youtube',
      is_visible: true,
      order: visibleSlides.length + 1
    });
    setIsEditing(true);
  };

  const handleEditCurrent = () => {
    if (currentSlide) {
      setSelectedSlide(currentSlide);
      setIsEditing(true);
    }
  };

  if (!user) {
    return null; // O un componente de "Inicie sesión para ver el contenido"
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!showSlider && !isAdmin) {
    return null;
  }

  const visibleSlides = isAdmin ? slides : slides.filter(slide => slide.is_visible);
  const currentSlide = visibleSlides[currentSlideIndex];

  return (
    <div className="w-full">
      <div className="flex justify-end gap-4 p-4 mb-4">
        {isAdmin && (
          <>
            <button
              onClick={handleAddVideo}
              className="bg-gold hover:bg-gold/90 text-black font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <Plus size={20} />
              Agregar Video
            </button>
            <button
              onClick={toggleSliderVisibility}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              {showSlider ? 'Deshabilitar' : 'Habilitar'} Sección
            </button>
          </>
        )}
      </div>
      
      {showSlider && (
        <div className="video-slider-container">
          {currentSlide ? (
            <>
              <div className="main-video-section">
                <div className="main-video-container">
                  <div className="video-container">
                    <iframe
                      src={getEmbedUrl(currentSlide.videoUrl, currentSlide.videoType)}
                      title={currentSlide.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
                <div className="video-info">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gold">{currentSlide.title}</h2>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditCurrent}
                          className="p-2 bg-gold text-black rounded-full hover:bg-gold/90 transition-all"
                          title="Editar video"
                        >
                          <Edit3 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(currentSlide.id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                          title="Eliminar video"
                        >
                          <Trash2 size={20} />
                        </button>
                        <button
                          onClick={() => toggleVisibility(currentSlide)}
                          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
                          title={currentSlide.is_visible ? "Ocultar video" : "Mostrar video"}
                        >
                          {currentSlide.is_visible ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 mb-4">{currentSlide.description}</p>
                  {currentSlide.buttonText && currentSlide.buttonUrl && (
                    <a 
                      href={currentSlide.buttonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="video-cta"
                    >
                      {currentSlide.buttonText}
                    </a>
                  )}
                </div>
              </div>

              <div className="timeline-container">
                <div className="timeline-line"></div>
                <div 
                  className="timeline-progress" 
                  style={{ width: `${((currentSlideIndex + 1) / visibleSlides.length) * 100}%` }}
                ></div>
                <div className="timeline-steps">
                  {visibleSlides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`timeline-step ${index === currentSlideIndex ? 'active' : index < currentSlideIndex ? 'completed' : ''}`}
                      onClick={() => setCurrentSlideIndex(index)}
                    >
                      <div className="step-circle">
                        {index + 1}
                      </div>
                      <div className="step-label">{slide.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="navigation-buttons">
                <button
                  className="nav-button prev"
                  onClick={handlePrev}
                  disabled={currentSlideIndex === 0}
                >
                  <ArrowLeft size={20} />
                  Anterior
                </button>
                <button
                  className="nav-button next"
                  onClick={handleNext}
                  disabled={currentSlideIndex === visibleSlides.length - 1}
                >
                  Siguiente
                  <ArrowRight size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p className="text-gold mb-4">No hay videos configurados</p>
              {isAdmin && (
                <button onClick={handleAddVideo}>
                  <Plus size={20} />
                  Agregar Primer Video
                </button>
              )}
            </div>
          )}

          {/* Modal de Edición */}
          {isEditing && selectedSlide && (
            <div className="edit-modal">
              <div className="modal-content">
                <h3>{selectedSlide.id ? 'Editar Video' : 'Agregar Video'}</h3>
                <form onSubmit={handleSave}>
                  <div className="form-group">
                    <label htmlFor="title">Título</label>
                    <input
                      id="title"
                      type="text"
                      value={selectedSlide.title}
                      onChange={(e) => setSelectedSlide({
                        ...selectedSlide,
                        title: e.target.value
                      })}
                      placeholder="Ingresa el título del video"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Descripción</label>
                    <textarea
                      id="description"
                      value={selectedSlide.description}
                      onChange={(e) => setSelectedSlide({
                        ...selectedSlide,
                        description: e.target.value
                      })}
                      placeholder="Ingresa una descripción del video"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="videoType">Tipo de Video</label>
                    <select
                      id="videoType"
                      value={selectedSlide.videoType}
                      onChange={(e) => {
                        setSelectedSlide({
                          ...selectedSlide,
                          videoType: e.target.value as 'youtube' | 'vimeo'
                        });
                        setPreviewUrl('');
                      }}
                      required
                    >
                      <option value="youtube">YouTube</option>
                      <option value="vimeo">Vimeo</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="videoUrl">URL del Video</label>
                    <input
                      id="videoUrl"
                      type="text"
                      value={selectedSlide.videoUrl}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      placeholder={`URL del video de ${selectedSlide.videoType === 'youtube' ? 'YouTube' : 'Vimeo'}`}
                      required
                    />
                    <div className="hint">
                      {selectedSlide.videoType === 'youtube' 
                        ? 'Ejemplo: https://www.youtube.com/watch?v=XXXX o https://youtu.be/XXXX'
                        : 'Ejemplo: https://vimeo.com/XXXX'}
                    </div>
                  </div>

                  {previewUrl && (
                    <div className="video-preview">
                      <iframe
                        src={previewUrl}
                        title="Video Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="buttonText">Texto del Botón (opcional)</label>
                    <input
                      id="buttonText"
                      type="text"
                      value={selectedSlide.buttonText || ''}
                      onChange={(e) => setSelectedSlide({
                        ...selectedSlide,
                        buttonText: e.target.value
                      })}
                      placeholder="Texto para el botón de acción"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="buttonUrl">URL del Botón (opcional)</label>
                    <input
                      id="buttonUrl"
                      type="text"
                      value={selectedSlide.buttonUrl || ''}
                      onChange={(e) => setSelectedSlide({
                        ...selectedSlide,
                        buttonUrl: e.target.value
                      })}
                      placeholder="URL para el botón de acción"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="order">Orden</label>
                    <input
                      id="order"
                      type="number"
                      value={selectedSlide.order || ''}
                      onChange={(e) => setSelectedSlide({
                        ...selectedSlide,
                        order: parseInt(e.target.value) || undefined
                      })}
                      placeholder="Posición en la secuencia"
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedSlide.is_visible}
                        onChange={(e) => setSelectedSlide({
                          ...selectedSlide,
                          is_visible: e.target.checked
                        })}
                      />
                      {' '}Video visible
                    </label>
                  </div>

                  <div className="button-group">
                    <button type="submit" className="save-button">
                      {selectedSlide.id ? 'Guardar' : 'Crear'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedSlide(null);
                        setPreviewUrl('');
                      }}
                      className="cancel-button"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoSlider; 