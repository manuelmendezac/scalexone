import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';
import './VideoSlider.css';

interface ActionButton {
  id?: number;  // Opcional para permitir nuevos botones
  title: string;
  url: string;
  order_index: number;
  created_at?: string;  // Opcional ya que es manejado por la base de datos
  updated_at?: string;  // Opcional ya que es manejado por la base de datos
}

interface VideoSlide {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_type: 'youtube' | 'vimeo';
  is_visible?: boolean;
  order?: number;
  thumbnail_url?: string;
}

interface VimeoOEmbedResponse {
  thumbnail_url: string;
  width: number;
  height: number;
}

const VideoSlider: React.FC = () => {
  const [slides, setSlides] = useState<VideoSlide[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<VideoSlide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { user, isAdmin } = useAuth();
  const [isEditingActions, setIsEditingActions] = useState(false);
  const [actionButtons, setActionButtons] = useState<ActionButton[]>([]);
  const [editingButton, setEditingButton] = useState<ActionButton | null>(null);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoSlide | null>(null);

  // Memoizar las expresiones regulares para mejor rendimiento
  const videoIdRegex = useMemo(() => ({
    youtube: /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\n?\s]{11})/,
    vimeo: /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/
  }), []);

  // Cache para miniaturas
  const thumbnailCache = useMemo(() => new Map<string, string>(), []);

  const getVimeoThumbnail = useCallback(async (url: string): Promise<string> => {
    // Verificar si ya tenemos la miniatura en caché
    if (thumbnailCache.has(url)) {
      return thumbnailCache.get(url)!;
    }

    try {
      const videoId = url.match(videoIdRegex.vimeo);
      if (!videoId) return '';
      
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Error al obtener datos de Vimeo');
      
      const data: VimeoOEmbedResponse = await response.json();
      // Guardar en caché
      thumbnailCache.set(url, data.thumbnail_url);
      return data.thumbnail_url;
    } catch (err) {
      console.error('Error al obtener miniatura de Vimeo:', err);
      return '';
    }
  }, [videoIdRegex.vimeo, thumbnailCache]);

  const getThumbnailUrl = useCallback(async (url: string, type: 'youtube' | 'vimeo'): Promise<string> => {
    // Verificar si ya tenemos la miniatura en caché
    if (thumbnailCache.has(url)) {
      return thumbnailCache.get(url)!;
    }

    try {
      if (type === 'youtube') {
        const videoId = url.match(videoIdRegex.youtube);
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId[1]}/mqdefault.jpg` : '';
        // Guardar en caché
        thumbnailCache.set(url, thumbnailUrl);
        return thumbnailUrl;
      } else {
        return await getVimeoThumbnail(url);
      }
    } catch (err) {
      console.error('Error al procesar URL para miniatura:', err);
      return '';
    }
  }, [videoIdRegex.youtube, getVimeoThumbnail, thumbnailCache]);

  const fetchSlides = useCallback(async () => {
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

      // Procesar las miniaturas en paralelo
      const validSlides = await Promise.all((data || []).map(async slide => {
        const thumbnail = await getThumbnailUrl(slide.video_url, slide.video_type as 'youtube' | 'vimeo');
        return {
          id: String(slide.id),
          title: String(slide.title),
          description: String(slide.description),
          video_url: String(slide.video_url),
          video_type: slide.video_type as 'youtube' | 'vimeo',
          is_visible: slide.is_visible !== undefined ? Boolean(slide.is_visible) : true,
          order: slide.order,
          thumbnail_url: thumbnail
        };
      }));

      setSlides(validSlides);
    } catch (err) {
      console.error('Error al cargar videos:', err);
      setError('Error al cargar los videos');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, getThumbnailUrl]);

  const fetchActionButtons = useCallback(async () => {
    try {
      console.log('Intentando cargar botones...');
      const { data, error } = await supabase
        .from('botones_accion')
        .select('*')
        .order('order_index');

      if (error) {
        console.error('Error al cargar botones:', error);
        throw error;
      }

      console.log('Botones cargados:', data);

      if (data && data.length > 0) {
        setActionButtons(data);
      } else {
        console.log('No hay botones, creando botones por defecto...');
        // Si no hay botones en la base de datos, crear los botones por defecto
        const defaultButtons = [
          {
            title: "Únete a nuestra comunidad",
            url: "https://www.facebook.com/groups/bepartnex",
            order_index: 1
          },
          {
            title: "Accede a recursos exclusivos",
            url: "/recursos",
            order_index: 2
          },
          {
            title: "Grupo de Telegram",
            url: "https://t.me/bepartnex",
            order_index: 3
          }
        ];

        const { data: insertedButtons, error: insertError } = await supabase
          .from('botones_accion')
          .insert(defaultButtons)
          .select();

        if (insertError) {
          console.error('Error al insertar botones por defecto:', insertError);
          throw insertError;
        }

        console.log('Botones por defecto insertados:', insertedButtons);
        if (insertedButtons) {
          setActionButtons(insertedButtons);
        }
      }
    } catch (err) {
      console.error('Error al cargar los botones:', err);
      setError('Error al cargar los botones de acción');
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchSlides();
    fetchActionButtons();
  }, [user, fetchSlides, fetchActionButtons]);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', currentUser.id)
            .single();

          if (userError) {
            console.error('Error al verificar permisos:', userError);
            throw userError;
          }

          console.log('Rol del usuario:', userData?.rol);
          if (userData?.rol !== 'admin' && userData?.rol !== 'superadmin') {
            setError('No tienes permisos para editar los botones');
          }
        }
      } catch (err) {
        console.error('Error al verificar permisos:', err);
        setError('Error al verificar permisos de usuario');
      }
    };

    if (isEditing) {
      checkPermissions();
    }
  }, [isEditing]);

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

  const handleAddVideo = () => {
    setSelectedSlide({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      video_url: '',
      video_type: 'youtube',
      is_visible: true,
      order: slides.length + 1
    });
    setIsEditing(true);
  };

  const handleEditVideo = (video: VideoSlide) => {
    setEditingVideo(video);
    setIsEditingVideo(true);
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este video?')) return;

    try {
      const { error } = await supabase
        .from('video_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSlides();
      if (currentSlideIndex >= slides.length - 1) {
        setCurrentSlideIndex(Math.max(0, slides.length - 2));
      }
    } catch (err) {
      console.error('Error al eliminar video:', err);
      setError('Error al eliminar el video');
    }
  };

  const handleSaveVideo = (updatedVideo: VideoSlide) => {
    // Aquí iría la lógica para guardar los cambios del video
    setIsEditingVideo(false);
    setEditingVideo(null);
  };

  const handleCancelEdit = () => {
    setIsEditingVideo(false);
    setEditingVideo(null);
  };

  const handleEditActions = () => {
    setIsEditingActions(true);
  };

  const handleSaveActionButton = (button: ActionButton) => {
    if (button.id) {
      setActionButtons(buttons =>
        buttons.map(b => b.id === button.id ? button : b)
      );
    }
    setEditingButton(null);
    setIsEditingActions(false);
  };

  const handleCancelEditAction = () => {
    setEditingButton(null);
    setIsEditingActions(false);
  };

  const handleSaveActionButtons = async () => {
    try {
      console.log('Intentando guardar botones...');
      // Preparar los datos para el upsert, asegurándonos de que tengan el formato correcto
      const buttonsToUpdate = actionButtons.map((button, index) => ({
        id: button.id,
        title: button.title,
        url: button.url,
        order_index: index + 1
      }));

      console.log('Botones a actualizar:', buttonsToUpdate);

      // Separar botones existentes de nuevos botones
      const existingButtons = buttonsToUpdate.filter(button => button.id);
      const newButtons = buttonsToUpdate.filter(button => !button.id).map(({id, ...rest}) => rest);

      console.log('Botones existentes:', existingButtons);
      console.log('Botones nuevos:', newButtons);

      // Actualizar botones existentes
      if (existingButtons.length > 0) {
        const { error: updateError } = await supabase
          .from('botones_accion')
          .upsert(existingButtons);

        if (updateError) {
          console.error('Error al actualizar botones existentes:', updateError);
          throw updateError;
        }
      }

      // Insertar nuevos botones
      if (newButtons.length > 0) {
        const { error: insertError } = await supabase
          .from('botones_accion')
          .insert(newButtons);

        if (insertError) {
          console.error('Error al insertar nuevos botones:', insertError);
          throw insertError;
        }
      }

      console.log('Botones guardados exitosamente');
      setIsEditing(false);
      await fetchActionButtons(); // Recargar los botones después de guardar
    } catch (err) {
      console.error('Error al guardar los botones:', err);
      setError('Error al guardar los cambios en los botones');
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

  return (
    <div className="video-slider-container">
      {isAdmin && (
        <div className="admin-controls">
          <button onClick={handleAddVideo} className="add-button">
            + Agregar Video
          </button>
        </div>
      )}

      <div className="video-slider-layout">
        <div className="video-content-column">
          {currentSlide ? (
            <>
              <div className="video-content">
                <div className="video-player-container">
                  <div className="video-player">
                    <iframe
                      src={getEmbedUrl(currentSlide.video_url, currentSlide.video_type)}
                      title={currentSlide.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
                <div className="video-info">
                  <div className="video-header">
                    <h2>{currentSlide.title}</h2>
                    {isAdmin && (
                      <div className="video-actions">
                        <button onClick={() => handleEditVideo(currentSlide)} className="edit-button">
                          Editar
                        </button>
                        <button onClick={() => handleDeleteVideo(currentSlide.id)} className="delete-button">
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                  <p>{currentSlide.description}</p>
                </div>
              </div>

              <div className="progress-bar">
                <div className="progress-line">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className="progress-point-container">
                      <div
                        className={`progress-point ${index <= currentSlideIndex ? 'completed' : ''} ${index === currentSlideIndex ? 'current' : ''}`}
                        onClick={() => setCurrentSlideIndex(index)}
                      >
                        {index + 1}
                      </div>
                      <div className="progress-thumbnail">
                        {slide.thumbnail_url ? (
                          <img 
                            src={slide.thumbnail_url} 
                            alt={`Miniatura ${index + 1}`}
                            className="thumbnail-image"
                            loading="lazy"
                          />
                        ) : (
                          <div className="thumbnail-placeholder">
                            <span>Video {index + 1}</span>
                          </div>
                        )}
                      </div>
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
            </>
          ) : (
            <div className="empty-state">
              <p>No hay videos disponibles</p>
              {isAdmin && (
                <button onClick={handleAddVideo} className="add-button">
                  + Agregar Primer Video
                </button>
              )}
            </div>
          )}
        </div>

        <div className="action-column">
          <div className="action-content">
            <h2 className="action-title">¿Qué hay de nuevo en tu comunidad?</h2>
            {isAdmin && (
              <button 
                onClick={() => setIsEditing(true)}
                className="edit-button"
                style={{ marginBottom: '15px' }}
              >
                Editar Botones
              </button>
            )}
            <div className="action-buttons">
              {actionButtons.map(button => (
                <a
                  key={button.id}
                  href={button.url}
                  className="action-button"
                  target={button.url.startsWith('http') ? '_blank' : undefined}
                  rel={button.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {button.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isEditingVideo && editingVideo && (
        <div className="edit-video-modal">
          <div className="edit-modal-content">
            <div className="edit-modal-header">
              <h3>Editar Video</h3>
            </div>
            <div className="edit-form-group">
              <label>Título</label>
              <input
                type="text"
                value={editingVideo.title}
                onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
              />
            </div>
            <div className="edit-form-group">
              <label>Descripción</label>
              <textarea
                value={editingVideo.description}
                onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
              />
            </div>
            <div className="edit-form-group">
              <label>URL del Video</label>
              <input
                type="text"
                value={editingVideo.video_url}
                onChange={(e) => setEditingVideo({...editingVideo, video_url: e.target.value})}
              />
            </div>
            <div className="edit-form-group">
              <label>URL de la Miniatura (opcional)</label>
              <input
                type="text"
                value={editingVideo.thumbnail_url || ''}
                onChange={(e) => setEditingVideo({...editingVideo, thumbnail_url: e.target.value})}
              />
            </div>
            <div className="edit-modal-buttons">
              <button
                className="edit-modal-button edit-modal-cancel"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
              <button
                className="edit-modal-button edit-modal-save"
                onClick={() => handleSaveVideo(editingVideo)}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="action-edit-modal">
          <div className="action-modal-content">
            <div className="action-modal-header">
              <h3>Editar Botones de Acción</h3>
            </div>
            {actionButtons.map((button, index) => (
              <div key={button.id} className="action-form-group">
                <label>Botón {index + 1}</label>
                <input
                  type="text"
                  value={button.title}
                  onChange={(e) => {
                    setActionButtons(buttons =>
                      buttons.map(b =>
                        b.id === button.id ? { ...b, title: e.target.value } : b
                      )
                    );
                  }}
                  placeholder="Título del botón"
                />
                <input
                  type="text"
                  value={button.url}
                  onChange={(e) => {
                    setActionButtons(buttons =>
                      buttons.map(b =>
                        b.id === button.id ? { ...b, url: e.target.value } : b
                      )
                    );
                  }}
                  placeholder="URL del botón"
                  style={{ marginTop: '10px' }}
                />
              </div>
            ))}
            <div className="action-modal-buttons">
              <button
                className="action-modal-button action-modal-cancel"
                onClick={() => {
                  setIsEditing(false);
                  fetchActionButtons(); // Recargar los botones originales al cancelar
                }}
              >
                Cancelar
              </button>
              <button
                className="action-modal-button action-modal-save"
                onClick={handleSaveActionButtons}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSlider; 