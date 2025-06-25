import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';
import './VideoSlider.css';

interface ActionButton {
  id?: number;  // ID generado por la base de datos
  title: string;
  url: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
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
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Obtener los modos del localStorage
  const isAffiliateMode = localStorage.getItem('affiliateMode') === 'IB';
  const isAdminMode = localStorage.getItem('adminMode') === 'true';
  
  // Determinar si se deben mostrar los controles de edición
  // Solo mostrar si es admin, sin importar otros modos
  const showEditControls = isAdmin;

  // Logs para depuración
  console.log('[VideoSlider] Estado de controles de edición:', {
    isAdmin,
    showEditControls,
    user
  });

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
    if (!user) return;
    
    try {
      console.log('Cargando botones...');
      const { data, error } = await supabase
        .from('botones_accion')
        .select('*')
        .order('order_index');

      if (error) {
        console.error('Error al cargar botones:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setActionButtons(data);
      } else if (isAdmin) {
        // Solo crear botones por defecto si es admin y no hay botones
        console.log('Creando botones por defecto...');
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

        const { error: insertError } = await supabase
          .from('botones_accion')
          .insert(defaultButtons);

        if (insertError) {
          console.error('Error al crear botones por defecto:', insertError);
          throw insertError;
        }

        // Recargar los botones después de insertar
        const { data: newData } = await supabase
          .from('botones_accion')
          .select('*')
          .order('order_index');

        if (newData) {
          setActionButtons(newData);
        }
      }
    } catch (err) {
      console.error('Error en fetchActionButtons:', err);
      setError('Error al cargar los botones de acción');
    }
  }, [user, isAdmin]);

  useEffect(() => {
    console.log('[VideoSlider] useEffect user:', user);
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSlides(),
          fetchActionButtons()
        ]);
      } catch (err) {
        console.error('[VideoSlider] Error al cargar datos iniciales:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadInitialData();
    } else {
      setLoading(false);
    }
  }, [user, fetchSlides, fetchActionButtons]);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        if (!user) {
          setUserRole(null);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Error al obtener rol del usuario:', userError);
          setUserRole(null);
          return;
        }

        setUserRole(userData?.rol || null);
        console.log('Rol del usuario:', userData?.rol);
      } catch (err) {
        console.error('Error al verificar rol del usuario:', err);
        setUserRole(null);
      }
    };

    checkUserRole();
  }, [user]);

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
    setIsEditing(true);
  };

  const handleSaveActionButton = (button: ActionButton) => {
    if (button.id) {
      setActionButtons(buttons =>
        buttons.map(b => b.id === button.id ? button : b)
      );
    }
    setEditingButton(null);
    setIsEditing(false);
  };

  const handleCancelEditAction = () => {
    setEditingButton(null);
    setIsEditing(false);
    fetchActionButtons(); // Recargar los botones originales
  };

  const handleSaveActionButtons = async () => {
    if (!user) {
      setError('Debes iniciar sesión para realizar esta acción');
      return;
    }

    try {
      console.log('Guardando botones de acción...');
      setError(null);
      
      // Asignar order_index basado en la posición actual
      const buttonsWithOrder = actionButtons.map((button, index) => ({
        ...button,
        order_index: index + 1
      }));
      
      // Verificar que todos los botones tengan los campos requeridos
      const validButtons = buttonsWithOrder.every(button => 
        button.title && 
        button.url && 
        typeof button.order_index === 'number'
      );

      if (!validButtons) {
        setError('Todos los botones deben tener título y URL');
        return;
      }

      // Separar botones existentes de nuevos botones
      const existingButtons = buttonsWithOrder.filter(button => button.id);
      const newButtons = buttonsWithOrder.filter(button => !button.id);
      
      // Actualizar botones existentes
      if (existingButtons.length > 0) {
        const { error: updateError } = await supabase
          .from('botones_accion')
          .upsert(
            existingButtons.map(({ id, title, url, order_index }) => ({
              id,
              title,
              url,
              order_index
            }))
          );

        if (updateError) {
          console.error('Error al actualizar botones existentes:', updateError);
          setError(`Error al actualizar botones: ${updateError.message}`);
          return;
        }
      }

      // Insertar nuevos botones
      if (newButtons.length > 0) {
        const { error: insertError } = await supabase
          .from('botones_accion')
          .insert(
            newButtons.map(({ title, url, order_index }) => ({
              title,
              url,
              order_index
            }))
          );

        if (insertError) {
          console.error('Error al insertar nuevos botones:', insertError);
          setError(`Error al insertar botones: ${insertError.message}`);
          return;
        }
      }

      // Recargar los botones después de guardar
      await fetchActionButtons();
      setIsEditing(false);
      
    } catch (err) {
      console.error('Error al guardar botones:', err);
      setError('Error al guardar los botones de acción');
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
      {showEditControls && (
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
                    {showEditControls && (
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
              {showEditControls && (
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
            {showEditControls && (
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

      {showEditControls && isEditingVideo && editingVideo && (
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

      {showEditControls && isEditing && (
        <div className="action-edit-modal">
          <div className="action-modal-content">
            <div className="action-modal-header">
              <h3>Editar Botones de Acción</h3>
            </div>
            {actionButtons.map((button, index) => (
              <div key={button.id || index} className="action-form-group">
                <label>Botón {index + 1}</label>
                <input
                  type="text"
                  value={button.title}
                  onChange={(e) => {
                    setActionButtons(buttons =>
                      buttons.map((b, i) =>
                        i === index ? { ...b, title: e.target.value } : b
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
                      buttons.map((b, i) =>
                        i === index ? { ...b, url: e.target.value } : b
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
                  fetchActionButtons();
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