import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Menu, ChevronLeft, ChevronRight, Star, Share2 } from 'lucide-react';
import LaunchCalendar from '../components/launchpad/LaunchCalendar';
import { supabase } from '../supabase';

// Utilidad para transformar URLs normales a URLs embebidas
function toEmbedUrl(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

const Backstage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  // Evento destacado
  const [featuredEvent, setFeaturedEvent] = useState({
    title: '', description: '', date: '', cta: '', start_date: '', end_date: ''
  });
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  // Enlaces rápidos
  const [links, setLinks] = useState<any[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  // Configuración barra lateral
  const [sidebarSettings, setSidebarSettings] = useState({ sidebar_title: 'IA Heroes Live', sidebar_logo: '' });
  const [loadingSettings, setLoadingSettings] = useState(true);
  // Videos
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  // Ratings y comentarios
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [comment, setComment] = useState('');
  const [commentName, setCommentName] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  // Compartir
  const [shareMenuOpen, setShareMenuOpen] = useState(false);

  // Menú lateral responsive
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMenuOpen(window.innerWidth >= 1024);
      setIsCollapsed(false);
      const handleResize = () => {
        setIsMenuOpen(window.innerWidth >= 1024);
        setIsCollapsed(false);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Evento destacado
  useEffect(() => {
    async function fetchFeatured() {
      setLoadingFeatured(true);
      const { data } = await supabase
        .from('launchpad_events')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single();
      if (data) setFeaturedEvent({
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        cta: data.cta || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
      });
      setLoadingFeatured(false);
    }
    fetchFeatured();
  }, []);

  // Enlaces rápidos
  useEffect(() => {
    async function fetchLinks() {
      setLoadingLinks(true);
      const { data } = await supabase
        .from('launchpad_links')
        .select('*')
        .order('order_index', { ascending: true });
      if (data) setLinks(data);
      setLoadingLinks(false);
    }
    fetchLinks();
  }, []);

  // Configuración barra lateral
  useEffect(() => {
    async function fetchSettings() {
      setLoadingSettings(true);
      const { data } = await supabase
        .from('launchpad_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      if (data) setSidebarSettings({
        sidebar_title: data.sidebar_title || 'IA Heroes Live',
        sidebar_logo: data.sidebar_logo || ''
      });
      setLoadingSettings(false);
    }
    fetchSettings();
  }, []);

  // Videos
  useEffect(() => {
    async function fetchVideos() {
      setLoadingVideos(true);
      const { data } = await supabase.from('launchpad_videos').select('*').order('date', { ascending: true });
      if (data) setVideos(data);
      setLoadingVideos(false);
    }
    fetchVideos();
  }, []);

  // Eliminar videos demo y trabajar solo con videos reales
  // const videosPrueba = [...]; // Eliminar esta sección
  // const videosFinal = videos.length > 0 ? videos : videosPrueba;
  const videosFinal = videos;
  const filteredVideos = selectedDate ? videosFinal.filter(v => v.date === selectedDate) : videosFinal;

  // Seleccionar automáticamente el primer video real si existe
  useEffect(() => {
    if (!selectedEvent && videos.length > 0) {
      setSelectedEvent(videos[0]);
    }
  }, [videos]);

  // Ratings y comentarios
  useEffect(() => {
    if (!selectedEvent) return;
    async function fetchRatings() {
      if (!selectedEvent) return;
      const { data } = await supabase
        .from('launchpad_video_ratings')
        .select('rating')
        .eq('video_id', selectedEvent.id);
      if (data) {
        const ratings = data.map((r: any) => r.rating);
        setAvgRating(ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0);
        setRatingCount(ratings.length);
      }
    }
    async function fetchComments() {
      if (!selectedEvent) return;
      setLoadingComments(true);
      const { data } = await supabase
        .from('launchpad_video_comments')
        .select('*')
        .eq('video_id', selectedEvent.id)
        .order('created_at', { ascending: false });
      if (data) setComments(data);
      setLoadingComments(false);
    }
    fetchRatings();
    fetchComments();
  }, [selectedEvent]);

  // Compartir
  function getShareUrl() {
    let url = window.location.origin + window.location.pathname;
    return url;
  }

  // Contador evento destacado
  function getCountdown(targetDate: string) {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = Math.max(0, target.getTime() - now.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const min = Math.floor((diff / (1000 * 60)) % 60);
    const sec = Math.floor((diff / 1000) % 60);
    return { hours, min, sec };
  }
  const [countdown, setCountdown] = useState(getCountdown(featuredEvent.date));
  useEffect(() => {
    setCountdown(getCountdown(featuredEvent.date));
    const interval = setInterval(() => {
      setCountdown(getCountdown(featuredEvent.date));
    }, 1000);
    return () => clearInterval(interval);
  }, [featuredEvent.date]);

  // Cerrar menú de compartir si se colapsa la barra lateral
  useEffect(() => {
    if (isCollapsed && shareMenuOpen) {
      setShareMenuOpen(false);
    }
  }, [isCollapsed, shareMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        {/* Barra lateral con glassmorphism y animación */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -300, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ top: 112, height: 'calc(100vh - 112px)' }}
              className={`fixed left-0 z-40 p-2 bg-cyan-900/40 backdrop-blur-lg border-r border-cyan-400/30 shadow-xl flex flex-col items-center transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
            >
              {/* Botón colapsar/expandir */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-4 bg-cyan-600 p-1 rounded-full shadow-lg"
                aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
              {/* Logo/avatar */}
              <div className={`mb-8 mt-2 flex flex-col items-center transition-all ${isCollapsed ? 'scale-90' : ''}`}>
                {sidebarSettings.sidebar_logo ? (
                  <img src={sidebarSettings.sidebar_logo} alt="Logo" className="w-14 h-14 rounded-full object-cover shadow-lg border-4 border-cyan-300/40 bg-cyan-400" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-cyan-400 flex items-center justify-center shadow-lg border-4 border-cyan-300/40">
                    <span className="text-3xl font-bold text-cyan-900">🚀</span>
                  </div>
                )}
                {!isCollapsed && (
                  <span className="mt-2 text-cyan-200 font-orbitron text-lg tracking-wide">{sidebarSettings.sidebar_title}</span>
                )}
              </div>
              {/* Accesos con tooltips o solo íconos */}
              <nav className="space-y-4 w-full mt-4 flex flex-col items-center">
                <div className="relative w-full">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg font-semibold border border-cyan-400/40 transition-all justify-center bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-700 hover:from-cyan-700 hover:to-cyan-500 text-white active:scale-95"
                    style={{ fontSize: isCollapsed ? 22 : 18 }}
                    onClick={() => setShareMenuOpen(v => !v)}
                  >
                    <Share2 className={`text-cyan-300 ${isCollapsed ? 'text-2xl' : 'text-xl'}`} />
                    {!isCollapsed && <span className="ml-2 font-orbitron text-base md:text-lg" style={{color: '#fff', fontWeight: 600}}>Compartir Experiencia</span>}
                  </button>
                  {shareMenuOpen && (
                    <div className="absolute left-0 mt-2 w-full bg-gray-900 border border-cyan-400 rounded-xl shadow-xl z-50 flex flex-col">
                      <button className="px-4 py-2 hover:bg-cyan-800 text-cyan-200 text-left" onClick={() => {navigator.clipboard.writeText(getShareUrl()); setShareMenuOpen(false); alert('¡Enlace copiado!')}}>Copiar enlace</button>
                      <a className="px-4 py-2 hover:bg-cyan-800 text-cyan-200 text-left" href={`https://wa.me/?text=${encodeURIComponent(getShareUrl())}`} target="_blank" rel="noopener noreferrer" onClick={()=>setShareMenuOpen(false)}>Compartir por WhatsApp</a>
                      <a className="px-4 py-2 hover:bg-cyan-800 text-cyan-200 text-left" href={`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}`} target="_blank" rel="noopener noreferrer" onClick={()=>setShareMenuOpen(false)}>Compartir por Telegram</a>
                      <a className="px-4 py-2 hover:bg-cyan-800 text-cyan-200 text-left" href={`mailto:?subject=¡Mira este lanzamiento!&body=${encodeURIComponent(getShareUrl())}`} onClick={()=>setShareMenuOpen(false)}>Compartir por Correo</a>
                    </div>
                  )}
                </div>
                {links.map((item, idx) => (
                  <div key={item.id} className="group relative flex items-center w-full justify-center">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg font-semibold border border-cyan-400/40 transition-all w-full justify-center
                        bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-700
                        hover:from-cyan-700 hover:to-cyan-500
                        text-white
                        active:scale-95
                        ${isCollapsed ? 'justify-center px-2 py-2' : ''}`}
                      style={{ fontSize: isCollapsed ? 22 : 18 }}
                    >
                      <span className={`text-cyan-300 ${isCollapsed ? 'text-2xl' : 'text-xl'}`}>
                        {item.icon_img ? (
                          <img src={item.icon_img} alt={item.label} className="w-7 h-7 rounded object-cover inline-block" />
                        ) : (
                          item.icon || '🔗'
                        )}
                      </span>
                      {!isCollapsed && <span className="ml-2 font-orbitron text-base md:text-lg" style={{color: '#fff', fontWeight: 600}}>{item.label}</span>}
                    </a>
                    {/* Tooltip solo cuando está colapsado */}
                    {isCollapsed && (
                      <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-cyan-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                        {item.label}
                      </span>
                    )}
                  </div>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
        {/* Contenido principal */}
        <div className={`flex-1 transition-all duration-300 ${isMenuOpen ? (isCollapsed ? 'ml-20' : 'ml-64') : ''}`}>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Área del video */}
            <div className={`${isVideoExpanded ? 'lg:col-span-3' : 'lg:col-span-2'} bg-gray-800 rounded-xl p-4 flex flex-col items-center`}>
              {selectedEvent ? (
                <>
                  {/* Título grande */}
                  <h1 className="text-xl md:text-3xl font-orbitron font-bold text-cyan-300 text-center mb-2 mt-2 md:mt-4">{selectedEvent.title}</h1>
                  {/* Fecha y hora */}
                  <div className="text-lg text-cyan-100 font-semibold text-center mb-4">
                    {selectedEvent.date && (
                      <span>{new Date(selectedEvent.date).toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</span>
                    )}
                  </div>
                  {/* Video centrado y grande */}
                  <div className="w-full flex justify-center">
                    <div className="aspect-video w-full max-w-full bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-cyan-400 min-h-[180px] max-h-[240px] sm:min-h-[200px] sm:max-h-[260px]">
                      <iframe
                        src={selectedEvent.video_url}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay; encrypted-media"
                      />
                    </div>
                  </div>
                  {/* Descripción */}
                  <div className="mt-6 w-full max-w-2xl mx-auto bg-gray-900/80 rounded-xl p-4 shadow-inner border border-cyan-400">
                    <h2 className="text-cyan-200 font-bold text-lg mb-2">Descripción</h2>
                    <p className="text-gray-200 text-base whitespace-pre-line">{selectedEvent.description}</p>
                  </div>
                  {/* Calificación */}
                  <div className="mt-8 w-full max-w-2xl mx-auto">
                    <div className="mb-6 bg-gray-900/80 rounded-xl p-4 border border-cyan-400 shadow-inner">
                      <div className="flex flex-col items-center gap-2 mb-2 w-full">
                        <span className="text-cyan-200 font-bold text-lg text-center">Califica este directo:</span>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-2 w-full">
                          <div className="flex flex-row justify-center gap-1 w-full">
                            {[1,2,3,4,5].map(star => (
                              <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-xl md:text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-500'} hover:text-yellow-300 transition`}
                                disabled={savingRating}
                                aria-label={`Calificar con ${star} estrellas`}
                              >
                                <Star fill={star <= rating ? '#facc15' : 'none'} />
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={async () => {
                              if (!selectedEvent || !rating) return;
                              setSavingRating(true);
                              await supabase.from('launchpad_video_ratings').insert({ video_id: selectedEvent.id, rating });
                              setRating(0);
                              // Refrescar promedio
                              const { data } = await supabase
                                .from('launchpad_video_ratings')
                                .select('rating')
                                .eq('video_id', selectedEvent.id);
                              if (data) {
                                const ratings = data.map((r: any) => r.rating);
                                setAvgRating(ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0);
                                setRatingCount(ratings.length);
                              }
                              setSavingRating(false);
                            }}
                            className="mt-2 md:mt-0 md:ml-4 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded font-bold disabled:opacity-60"
                            disabled={savingRating || !rating}
                          >
                            Enviar
                          </button>
                        </div>
                      </div>
                      <div className="text-cyan-300 text-sm text-center">
                        Promedio: <span className="font-bold">{avgRating.toFixed(2)}</span> ({ratingCount} calificaciones)
                      </div>
                    </div>
                    {/* Comentarios */}
                    <div className="bg-gray-900/80 rounded-xl p-4 border border-cyan-400 shadow-inner">
                      <h3 className="text-cyan-200 font-bold text-lg mb-2">Comentarios</h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!selectedEvent || !comment.trim()) return;
                        setSavingComment(true);
                        await supabase.from('launchpad_video_comments').insert({
                          video_id: selectedEvent.id,
                          nombre: commentName,
                          comentario: comment,
                        });
                        setComment('');
                        setCommentName('');
                        // Refrescar comentarios
                        const { data } = await supabase
                          .from('launchpad_video_comments')
                          .select('*')
                          .eq('video_id', selectedEvent.id)
                          .order('created_at', { ascending: false });
                        if (data) setComments(data);
                        setSavingComment(false);
                      }} className="flex flex-col gap-2 mb-4">
                        <input
                          type="text"
                          className="p-2 rounded bg-gray-800 border border-cyan-400 text-white"
                          placeholder="Tu nombre (opcional)"
                          value={commentName}
                          onChange={e => setCommentName(e.target.value)}
                        />
                        <textarea
                          className="p-2 rounded bg-gray-800 border border-cyan-400 text-white"
                          placeholder="Escribe tu comentario..."
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          rows={2}
                          required
                        />
                        <button
                          type="submit"
                          className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded font-bold disabled:opacity-60"
                          disabled={savingComment || !comment.trim()}
                        >
                          {savingComment ? 'Enviando...' : 'Comentar'}
                        </button>
                      </form>
                      {loadingComments ? (
                        <div className="text-cyan-200">Cargando comentarios...</div>
                      ) : comments.length === 0 ? (
                        <div className="text-gray-400">Sé el primero en comentar este directo.</div>
                      ) : (
                        <ul className="space-y-3">
                          {comments.map(c => (
                            <li key={c.id} className="bg-gray-800 rounded p-3 border border-cyan-400/30">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-cyan-300 text-sm">{c.nombre || 'Anónimo'}</span>
                                <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString('es-ES')}</span>
                              </div>
                              <div className="text-gray-200 text-base">{c.comentario}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 w-full min-h-[300px]">
                  Selecciona un video para comenzar
                </div>
              )}
            </div>
            {/* Calendario y lista de videos */}
            <div className={`${isVideoExpanded ? 'hidden' : ''} flex flex-col gap-6 bg-gray-800 rounded-xl p-4`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backstage;