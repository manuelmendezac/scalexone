import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Share2, MessageSquare, Info, ChevronLeft, ChevronRight, Maximize2, Menu, Upload, Star, Minimize2 } from 'lucide-react';
import LaunchCalendar from '../components/launchpad/LaunchCalendar';
import { supabase } from '../supabase';
import { useHydration } from '../store/useNeuroState';
import useNeuroState from '../store/useNeuroState';
import LoadingScreen from '../components/LoadingScreen';

interface LaunchEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  video_url: string;
}

interface LaunchpadLink {
  id: string;
  label: string;
  url: string;
  icon?: string;
  icon_img?: string;
  order_index?: number;
}

// Función para subir imagen a Supabase Storage y devolver la URL pública
async function uploadImageToStorage(file: File, pathPrefix = 'misc') {
  console.log('Archivo a subir:', file);
  if (!file || file.size === 0) {
    alert('Archivo vacío o no válido');
    throw new Error('Archivo vacío o no válido');
  }
  const fileName = `${pathPrefix}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('launchpad-assets').upload(fileName, file, { upsert: true });
  if (error) {
    console.error('Error real de Supabase:', error);
    alert('Error subiendo imagen: ' + error.message);
    throw error;
  }
  const { data } = supabase.storage.from('launchpad-assets').getPublicUrl(fileName);
  return data.publicUrl;
}

// Función para transformar URLs normales a URLs embebidas
function toEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  // Si ya es embed o no se reconoce, devolver igual
  return url;
}

// Utilidad para extraer el ID de YouTube
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

const Launchpad: React.FC = () => {
  console.log('Render Launchpad');
  const { userInfo } = useNeuroState();
  const isHydrated = useHydration();
  
  // Obtener el community_id del usuario activo
  const communityId = userInfo?.community_id || '8fb70d6e-3237-465e-8669-979461cf2bc1';
  
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LaunchEvent | null>(null);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Estado para el evento destacado editable
  const [editEvent, setEditEvent] = useState({
    title: '',
    description: '',
    cta: '',
    date: '', // fecha/hora principal (para el contador)
    start_date: '', // nueva: fecha de inicio del lanzamiento
    end_date: '',   // nueva: fecha de fin del lanzamiento
  });
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);
  // Estado para el evento destacado mostrado en la vista principal
  const [featuredEvent, setFeaturedEvent] = useState({
    title: '',
    description: '',
    date: '',
    cta: '',
    start_date: '',
    end_date: '',
  });
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  // Estado para enlaces rápidos
  const [links, setLinks] = useState<LaunchpadLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);
  const [newLink, setNewLink] = useState({ label: '', url: '', icon: '', icon_img: '' });
  // Estado para configuración de la barra lateral
  const [sidebarSettings, setSidebarSettings] = useState({ sidebar_title: 'IA Heroes Live', sidebar_logo: '' });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  // Estado para videos
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [editVideo, setEditVideo] = useState<any | null>(null);
  const [savingVideo, setSavingVideo] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail: '',
    type: 'Directo',
    date: '',
    destacado: false,
  });
  // Estado para calificaciones y comentarios
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [comment, setComment] = useState('');
  const [commentName, setCommentName] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [savingRating, setSavingRating] = useState(false);
  // Estado para el usuario actual (para link de afiliado)
  const [currentUser, setCurrentUser] = useState<any>(null);
  // Estado para mostrar el menú de compartir
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  // Ajustar barra lateral según el ancho de pantalla después del primer render
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAdmin(localStorage.getItem('adminMode') === 'true');
    }
  }, []);

  // Simulación de 3 directos y 3 cápsulas de prueba
  // const videosPrueba = [...]; // Eliminar esta sección
  // const directos = [...]; // Eliminar demo
  // const capsulas = [...]; // Eliminar demo
  // const videosFinal = [...directos, ...capsulas];
  const videosFinal = videos;
  const filteredVideos = selectedDate ? videosFinal.filter(v => v.date === selectedDate) : videosFinal;

  // Cargar el evento destacado desde Supabase al montar la página
  async function fetchFeatured() {
    setLoadingFeatured(true);
    const { data, error } = await supabase
      .from('launchpad_events')
      .select('*')
      .eq('community_id', communityId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    if (data) {
      setFeaturedEvent({
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        cta: data.cta || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
      });
    }
    setLoadingFeatured(false);
  }
  useEffect(() => { 
    if (isHydrated) {
      fetchFeatured(); 
    }
  }, [isHydrated, communityId]);

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

  // Cargar datos del evento destacado desde Supabase al abrir el drawer
  useEffect(() => {
    if (!drawerOpen || !isHydrated) return;
    async function fetchEvent() {
      setLoadingEvent(true);
      const { data, error } = await supabase
        .from('launchpad_events')
        .select('*')
        .eq('community_id', communityId)
        .order('date', { ascending: false })
        .limit(1)
        .single();
      if (data) {
        setEditEvent({
          title: data.title || '',
          description: data.description || '',
          cta: data.cta || '',
          date: data.date ? data.date.slice(0, 16) : '',
          start_date: data.start_date ? data.start_date.slice(0, 10) : '',
          end_date: data.end_date ? data.end_date.slice(0, 10) : '',
        });
      }
      setLoadingEvent(false);
    }
    fetchEvent();
  }, [drawerOpen, isHydrated, communityId]);

  // Cargar enlaces rápidos desde Supabase al iniciar la página
  useEffect(() => {
    if (!isHydrated) return;
    async function fetchLinks() {
      setLoadingLinks(true);
      const { data, error } = await supabase
        .from('launchpad_links')
        .select('*')
        .eq('community_id', communityId)
        .order('order_index', { ascending: true });
      if (data) setLinks(data);
      setLoadingLinks(false);
    }
    fetchLinks();
  }, [isHydrated, communityId]);

  // Cargar configuración al montar
  useEffect(() => {
    if (!isHydrated) return;
    async function fetchSettings() {
      setLoadingSettings(true);
      const { data } = await supabase
        .from('launchpad_settings')
        .select('*')
        .eq('community_id', communityId)
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
  }, [isHydrated, communityId]);

  // Cargar videos desde Supabase
  useEffect(() => {
    if (!isHydrated) return;
    async function fetchVideos() {
      setLoadingVideos(true);
      const { data } = await supabase
        .from('launchpad_videos')
        .select('*')
        .eq('community_id', communityId)
        .order('date', { ascending: true });
      if (data) setVideos(data);
      setLoadingVideos(false);
    }
    fetchVideos();
  }, [isHydrated, communityId]);

  // Cargar calificaciones y comentarios cuando cambia el video seleccionado
  useEffect(() => {
    if (!selectedEvent || !isHydrated) return;
    // Calificaciones
    async function fetchRatings() {
      const { data, error } = await supabase
        .from('launchpad_video_ratings')
        .select('rating')
        .eq('video_id', selectedEvent.id)
        .eq('community_id', communityId);
      if (data) {
        const ratings = data.map((r: any) => r.rating);
        setAvgRating(ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0);
        setRatingCount(ratings.length);
      }
    }
    // Comentarios
    async function fetchComments() {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('launchpad_video_comments')
        .select('*')
        .eq('video_id', selectedEvent.id)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });
      if (data) setComments(data);
      setLoadingComments(false);
    }
    fetchRatings();
    fetchComments();
  }, [selectedEvent, isHydrated, communityId]);

  // Guardar cambios en Supabase
  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();
    setSavingEvent(true);
    // Buscar si ya existe un evento
    const { data: existing } = await supabase
      .from('launchpad_events')
      .select('id')
      .eq('community_id', communityId)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    let result;
    if (existing) {
      result = await supabase
        .from('launchpad_events')
        .update({
          title: editEvent.title,
          description: editEvent.description,
          cta: editEvent.cta,
          date: editEvent.date,
          start_date: editEvent.start_date,
          end_date: editEvent.end_date,
        })
        .eq('id', existing.id);
    } else {
      result = await supabase
        .from('launchpad_events')
        .insert([
          {
            title: editEvent.title,
            description: editEvent.description,
            cta: editEvent.cta,
            date: editEvent.date,
            start_date: editEvent.start_date,
            end_date: editEvent.end_date,
            community_id: communityId,
          },
        ]);
    }
    setSavingEvent(false);
    setDrawerOpen(false);
    // Refrescar datos en la vista principal sin recargar la página
    fetchFeatured();
  }

  // Guardar nuevo enlace rápido
  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    setSavingLinks(true);
    const { data, error } = await supabase
      .from('launchpad_links')
      .insert([{ ...newLink, order_index: links.length, community_id: communityId }]);
    setSavingLinks(false);
    setNewLink({ label: '', url: '', icon: '', icon_img: '' });
    // Refrescar lista
    const { data: updated } = await supabase
      .from('launchpad_links')
      .select('*')
      .eq('community_id', communityId)
      .order('order_index', { ascending: true });
    if (updated) setLinks(updated);
  }

  // Eliminar enlace rápido
  async function handleDeleteLink(id: string) {
    await supabase.from('launchpad_links').delete().eq('id', id);
    setLinks(links.filter(l => l.id !== id));
  }

  // Editar enlace rápido (solo label, url, icon)
  async function handleEditLink(id: string, field: string, value: string) {
    const updatedLinks = links.map(l => l.id === id ? { ...l, [field]: value } : l);
    setLinks(updatedLinks);
    await supabase.from('launchpad_links').update({ [field]: value }).eq('id', id);
  }

  // Guardar cambios en la configuración
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    // Buscar si ya existe un registro
    const { data: existing } = await supabase
      .from('launchpad_settings')
      .select('id')
      .eq('community_id', communityId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    let result;
    if (existing) {
      result = await supabase
        .from('launchpad_settings')
        .update({
          sidebar_title: sidebarSettings.sidebar_title,
          sidebar_logo: sidebarSettings.sidebar_logo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      result = await supabase
        .from('launchpad_settings')
        .insert([
          {
            sidebar_title: sidebarSettings.sidebar_title,
            sidebar_logo: sidebarSettings.sidebar_logo,
            community_id: communityId,
          },
        ]);
    }
    setSavingSettings(false);
  }

  // Subir miniatura a Supabase Storage
  async function uploadVideoThumbnail(file: File) {
    if (!file || file.size === 0) {
      alert('Archivo vacío o no válido');
      throw new Error('Archivo vacío o no válido');
    }
    const fileName = `videos/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('launchpad-assets').upload(fileName, file, { upsert: true });
    if (error) {
      alert('Error subiendo miniatura: ' + error.message);
      throw error;
    }
    const { data } = supabase.storage.from('launchpad-assets').getPublicUrl(fileName);
    return data.publicUrl;
  }

  // Guardar nuevo video
  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault();
    setSavingVideo(true);
    // Si es destacado, desmarcar otros
    if (newVideo.destacado) {
      await supabase
        .from('launchpad_videos')
        .update({ destacado: false })
        .eq('destacado', true)
        .eq('community_id', communityId);
    }
    // Transformar la URL antes de guardar
    const videoToSave = { ...newVideo, video_url: toEmbedUrl(newVideo.video_url), community_id: communityId };
    const { error } = await supabase.from('launchpad_videos').insert([videoToSave]);
    setSavingVideo(false);
    setNewVideo({ title: '', description: '', video_url: '', thumbnail: '', type: 'Directo', date: '', destacado: false });
    // Refrescar lista
    const { data } = await supabase
      .from('launchpad_videos')
      .select('*')
      .eq('community_id', communityId)
      .order('date', { ascending: true });
    if (data) setVideos(data);
    if (error) alert('Error guardando video: ' + error.message);
  }

  // Editar video existente
  async function handleEditVideo(e: React.FormEvent) {
    e.preventDefault();
    setSavingVideo(true);
    if (editVideo.destacado) {
      await supabase
        .from('launchpad_videos')
        .update({ destacado: false })
        .eq('destacado', true)
        .eq('community_id', communityId);
    }
    // Transformar la URL antes de guardar
    const videoToUpdate = { ...editVideo, video_url: toEmbedUrl(editVideo.video_url) };
    const { error } = await supabase.from('launchpad_videos').update(videoToUpdate).eq('id', editVideo.id);
    setSavingVideo(false);
    setEditVideo(null);
    // Refrescar lista
    const { data } = await supabase
      .from('launchpad_videos')
      .select('*')
      .eq('community_id', communityId)
      .order('date', { ascending: true });
    if (data) setVideos(data);
    if (error) alert('Error actualizando video: ' + error.message);
  }

  // Eliminar video
  async function handleDeleteVideo(id: string) {
    await supabase.from('launchpad_videos').delete().eq('id', id);
    setVideos(videos.filter(v => v.id !== id));
  }

  // Enviar calificación
  async function handleSendRating() {
    if (!selectedEvent || !rating) return;
    const videoId = selectedEvent.id;
    setSavingRating(true);
    await supabase
      .from('launchpad_video_ratings')
      .insert({ video_id: videoId, rating, community_id: communityId });
    setRating(0);
    // Refrescar promedio
    const { data } = await supabase
      .from('launchpad_video_ratings')
      .select('rating')
      .eq('video_id', videoId)
      .eq('community_id', communityId);
    if (data) {
      const ratings = data.map((r: any) => r.rating);
      setAvgRating(ratings.length ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0);
      setRatingCount(ratings.length);
    }
    setSavingRating(false);
  }
  
  // Enviar comentario
  async function handleSendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEvent || !comment.trim()) return;
    const videoId = selectedEvent.id;
    setSavingComment(true);
    await supabase
      .from('launchpad_video_comments')
      .insert({
        video_id: videoId,
        nombre: commentName,
        comentario: comment,
        community_id: communityId,
      });
    setComment('');
    setCommentName('');
    // Refrescar comentarios
    const { data } = await supabase
      .from('launchpad_video_comments')
      .select('*')
      .eq('video_id', videoId)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false });
    if (data) setComments(data);
    setSavingComment(false);
  }

  // Al cargar la página, obtener el usuario actual y seleccionar el primer directo si hay
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    fetchUser();
  }, []);

  // Seleccionar automáticamente el primer video real si existe
  useEffect(() => {
    if (!selectedEvent && videos.length > 0) {
      setSelectedEvent(videos[0]);
    }
  }, [videos]);

  // Cerrar menú de compartir si se colapsa la barra lateral
  useEffect(() => {
    if (isCollapsed && shareMenuOpen) {
      setShareMenuOpen(false);
    }
  }, [isCollapsed, shareMenuOpen]);

  // Función para obtener el enlace de afiliado
  function getShareUrl() {
    let url = window.location.origin + window.location.pathname;
    if (currentUser && currentUser.id) {
      url += `?aff=${currentUser.id}`;
    }
    return url;
  }

  // Cuando cambia el video seleccionado, hacer scroll al inicio del video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedEvent]);

  // Determinar si está cargando datos principales
  const loadingMain = loadingFeatured || loadingLinks || loadingSettings || loadingVideos;

  // Mostrar loading screen mientras se hidrata
  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full min-h-screen" style={{ background: '#000' }}>
      {/* Botón flotante para abrir el panel de edición solo para admin */}
      {isAdmin && (
        <button
          className="fixed z-50 bottom-6 right-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white p-4 rounded-full shadow-xl border-4 border-fuchsia-300 font-orbitron text-lg"
          onClick={() => setDrawerOpen(true)}
          aria-label="Editar Launchpad"
        >
          ✏️ Editar Launchpad
        </button>
      )}
      {/* Botón flotante para abrir barra lateral en móvil */}
      {!isMenuOpen && !isCollapsed && (
        <button
          className="fixed top-28 left-4 z-50 bg-cyan-500 hover:bg-cyan-400 text-white p-3 rounded-full shadow-lg lg:hidden"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
      {/* Drawer lateral para edición */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Fondo oscuro semitransparente */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          {/* Panel lateral */}
          <div className="relative ml-auto w-full max-w-md h-full bg-gray-900 border-l border-fuchsia-400 shadow-2xl p-8 flex flex-col animate-slide-in-right overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-fuchsia-400 hover:text-fuchsia-200 text-2xl font-bold"
              onClick={() => setDrawerOpen(false)}
              aria-label="Cerrar panel"
            >
              ×
            </button>
            <h2 className="font-orbitron text-2xl mb-6 text-fuchsia-300">Editar Launchpad</h2>
            {/* Formulario de edición del evento destacado */}
            <form onSubmit={handleSaveEvent} className="flex flex-col gap-4 mb-8">
              <label className="text-fuchsia-200 font-semibold">Título</label>
              <input
                type="text"
                className="p-2 rounded bg-gray-800 border border-fuchsia-400 text-white"
                value={editEvent.title}
                onChange={e => setEditEvent(ev => ({ ...ev, title: e.target.value }))}
                required
              />
              <label className="text-fuchsia-200 font-semibold">Descripción</label>
              <textarea
                className="p-2 rounded bg-gray-800 border border-fuchsia-400 text-white"
                value={editEvent.description}
                onChange={e => setEditEvent(ev => ({ ...ev, description: e.target.value }))}
                rows={3}
                required
              />
              <label className="text-fuchsia-200 font-semibold">CTA (llamada a la acción)</label>
              <input
                type="text"
                className="p-2 rounded bg-gray-800 border border-fuchsia-400 text-white"
                value={editEvent.cta}
                onChange={e => setEditEvent(ev => ({ ...ev, cta: e.target.value }))}
                required
              />
              <label className="text-fuchsia-200 font-semibold">Fecha y hora (contador)</label>
              <input
                type="datetime-local"
                className="p-2 rounded bg-gray-800 border border-fuchsia-400 text-white"
                value={editEvent.date}
                onChange={e => setEditEvent(ev => ({ ...ev, date: e.target.value }))}
                required
              />
              <label className="text-fuchsia-200 font-semibold">Fecha de inicio del lanzamiento</label>
              <input
                type="date"
                className="p-2 rounded bg-gray-800 border border-fuchsia-400 text-white"
                value={editEvent.start_date}
                onChange={e => setEditEvent(ev => ({ ...ev, start_date: e.target.value }))}
                required
              />
              <label className="text-fuchsia-200 font-semibold">Fecha de fin del lanzamiento</label>
              <input
                type="date"
                className="p-2 rounded bg-gray-800 border border-fuchsia-400 text-white"
                value={editEvent.end_date}
                onChange={e => setEditEvent(ev => ({ ...ev, end_date: e.target.value }))}
                required
              />
              <button
                type="submit"
                className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2 rounded shadow-lg border border-fuchsia-300 disabled:opacity-60"
                disabled={savingEvent}
              >
                {savingEvent ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {loadingEvent && <div className="text-center text-fuchsia-300">Cargando datos...</div>}
            </form>
            {/* Sección de edición de enlaces rápidos */}
            <div className="mb-8">
              <h3 className="font-orbitron text-xl mb-4 text-cyan-300">Enlaces rápidos</h3>
              {loadingLinks ? (
                <div className="text-cyan-200">Cargando enlaces...</div>
              ) : (
                <ul className="space-y-2 mb-4">
                  {links.map(link => (
                    <li key={link.id} className="flex items-center gap-2 bg-gray-800 rounded p-2">
                      <label className="flex flex-col items-center cursor-pointer bg-cyan-800 hover:bg-cyan-700 text-white px-2 py-1 rounded-lg shadow transition-all mr-2">
                        <Upload className="w-4 h-4 mb-0.5" />
                        <span className="text-[10px]">Subir</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const url = await uploadImageToStorage(file, 'iconos');
                              handleEditLink(link.id, 'icon_img', url);
                            } catch (err) {
                              alert('Error subiendo imagen');
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {link.icon_img && (
                        <img src={link.icon_img} alt="icono" className="w-8 h-8 rounded object-cover border border-cyan-400 ml-1" />
                      )}
                      <input
                        type="text"
                        className="w-24 p-1 rounded bg-gray-900 border border-cyan-400 text-cyan-200 text-center"
                        value={link.label}
                        onChange={e => handleEditLink(link.id, 'label', e.target.value)}
                        placeholder="Nombre"
                      />
                      <input
                        type="text"
                        className="flex-1 p-1 rounded bg-gray-900 border border-cyan-400 text-cyan-200"
                        value={link.url}
                        onChange={e => handleEditLink(link.id, 'url', e.target.value)}
                        placeholder="URL"
                      />
                      <button
                        type="button"
                        className="ml-2 text-red-400 hover:text-red-200 text-lg font-bold"
                        onClick={() => handleDeleteLink(link.id)}
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {/* Formulario para agregar nuevo enlace */}
              <form onSubmit={handleAddLink} className="flex items-center gap-2">
                <label className="flex flex-col items-center cursor-pointer bg-cyan-800 hover:bg-cyan-700 text-white px-2 py-1 rounded-lg shadow transition-all mr-2">
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px]">Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadImageToStorage(file, 'iconos');
                        setNewLink(l => ({ ...l, icon_img: url }));
                      } catch (err) {
                        alert('Error subiendo imagen');
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {newLink.icon_img && (
                  <img src={newLink.icon_img} alt="icono" className="w-8 h-8 rounded object-cover border border-cyan-400 ml-1" />
                )}
                <input
                  type="text"
                  className="flex-1 p-1 rounded bg-gray-900 border border-cyan-400 text-cyan-200"
                  value={newLink.label}
                  onChange={e => setNewLink(l => ({ ...l, label: e.target.value }))}
                  placeholder="Nombre"
                  required
                />
                <input
                  type="text"
                  className="flex-1 p-1 rounded bg-gray-900 border border-cyan-400 text-cyan-200"
                  value={newLink.url}
                  onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))}
                  placeholder="URL"
                  required
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded font-bold disabled:opacity-60"
                  disabled={savingLinks}
                >
                  +
                </button>
              </form>
            </div>
            {/* Formulario de edición de configuración de barra lateral */}
            <form onSubmit={handleSaveSettings} className="flex flex-col gap-3 mb-8">
              <h3 className="font-orbitron text-xl mb-2 text-cyan-300">Barra lateral</h3>
              <label className="text-cyan-200 font-semibold">Título</label>
              <input
                type="text"
                className="p-2 rounded bg-gray-800 border border-cyan-400 text-white"
                value={sidebarSettings.sidebar_title}
                onChange={e => setSidebarSettings(s => ({ ...s, sidebar_title: e.target.value }))}
                required
              />
              <label className="text-cyan-200 font-semibold">Logo (URL de imagen o subir archivo)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className="p-2 rounded bg-gray-800 border border-cyan-400 text-white flex-1"
                  value={sidebarSettings.sidebar_logo}
                  onChange={e => setSidebarSettings(s => ({ ...s, sidebar_logo: e.target.value }))}
                  placeholder="https://..."
                />
                <label className="flex flex-col items-center cursor-pointer bg-cyan-800 hover:bg-cyan-700 text-white px-3 py-2 rounded-lg shadow transition-all">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs">Subir imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadImageToStorage(file, 'logo');
                        setSidebarSettings(s => ({ ...s, sidebar_logo: url }));
                      } catch (err) {
                        alert('Error subiendo imagen');
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {sidebarSettings.sidebar_logo && (
                  <img src={sidebarSettings.sidebar_logo} alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400 ml-2" />
                )}
              </div>
              <button
                type="submit"
                className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded shadow-lg border border-cyan-300 disabled:opacity-60"
                disabled={savingSettings}
              >
                {savingSettings ? 'Guardando...' : 'Guardar configuración'}
              </button>
              {loadingSettings && <div className="text-center text-cyan-300">Cargando configuración...</div>}
            </form>
            {/* Panel de administración de videos */}
            <div className="mb-8">
              <h3 className="font-orbitron text-xl mb-4 text-cyan-300">Directos y Cápsulas</h3>
              {/* Formulario para agregar o editar video */}
              <form onSubmit={editVideo ? handleEditVideo : handleAddVideo} className="flex flex-col gap-2 mb-6 bg-gray-800 p-4 rounded-xl">
                <label className="text-cyan-200 font-semibold">Título</label>
                <input type="text" className="p-2 rounded bg-gray-900 border border-cyan-400 text-white" value={editVideo ? editVideo.title : newVideo.title} onChange={e => editVideo ? setEditVideo((v: any) => ({ ...v, title: e.target.value })) : setNewVideo(v => ({ ...v, title: e.target.value }))} required />
                <label className="text-cyan-200 font-semibold">Descripción</label>
                <textarea className="p-2 rounded bg-gray-900 border border-cyan-400 text-white" value={editVideo ? editVideo.description : newVideo.description} onChange={e => editVideo ? setEditVideo((v: any) => ({ ...v, description: e.target.value })) : setNewVideo(v => ({ ...v, description: e.target.value }))} rows={2} required />
                <label className="text-cyan-200 font-semibold">URL del video (YouTube, Vimeo, etc.)</label>
                <input type="text" className="p-2 rounded bg-gray-900 border border-cyan-400 text-white" value={editVideo ? editVideo.video_url : newVideo.video_url} onChange={e => editVideo ? setEditVideo((v: any) => ({ ...v, video_url: e.target.value })) : setNewVideo(v => ({ ...v, video_url: e.target.value }))} required />
                <label className="text-cyan-200 font-semibold">Miniatura</label>
                <input type="file" accept="image/*" onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = await uploadVideoThumbnail(file);
                  if (editVideo) setEditVideo((v: any) => ({ ...v, thumbnail: url }));
                  else setNewVideo(v => ({ ...v, thumbnail: url }));
                }} />
                {(editVideo ? editVideo.thumbnail : newVideo.thumbnail) && (
                  <img src={editVideo ? editVideo.thumbnail : newVideo.thumbnail} alt="miniatura" className="w-32 h-20 object-cover rounded border border-cyan-400 mt-2" />
                )}
                <label className="text-cyan-200 font-semibold">Tipo</label>
                <select className="p-2 rounded bg-gray-900 border border-cyan-400 text-white" value={editVideo ? editVideo.type : newVideo.type} onChange={e => editVideo ? setEditVideo((v: any) => ({ ...v, type: e.target.value })) : setNewVideo(v => ({ ...v, type: e.target.value }))}>
                  <option value="Directo">Directo</option>
                  <option value="Cápsula">Cápsula</option>
                </select>
                <label className="text-cyan-200 font-semibold">Fecha</label>
                <input type="date" className="p-2 rounded bg-gray-900 border border-cyan-400 text-white" value={editVideo ? editVideo.date : newVideo.date} onChange={e => editVideo ? setEditVideo((v: any) => ({ ...v, date: e.target.value })) : setNewVideo(v => ({ ...v, date: e.target.value }))} required />
                <label className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={editVideo ? editVideo.destacado : newVideo.destacado} onChange={e => editVideo ? setEditVideo((v: any) => ({ ...v, destacado: e.target.checked })) : setNewVideo(v => ({ ...v, destacado: e.target.checked }))} />
                  <span className="text-cyan-200 font-semibold">Marcar como destacado</span>
                </label>
                <button type="submit" className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded shadow-lg border border-cyan-300 disabled:opacity-60" disabled={savingVideo}>{savingVideo ? 'Guardando...' : (editVideo ? 'Actualizar video' : 'Agregar video')}</button>
                {editVideo && (
                  <button type="button" className="mt-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 rounded shadow border border-cyan-300" onClick={() => setEditVideo(null)}>Cancelar edición</button>
                )}
              </form>
              {/* Lista de videos existentes */}
              <ul className="space-y-2">
                {loadingVideos ? <div className="text-cyan-200">Cargando videos...</div> : videos.map(video => (
                  <li key={video.id} className="flex items-center gap-3 bg-gray-900 rounded p-2 border border-cyan-400/30">
                    <img src={video.thumbnail} alt={video.title} className="w-16 h-10 object-cover rounded border border-cyan-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${video.type === 'Directo' ? 'bg-fuchsia-600 text-white' : 'bg-cyan-600 text-white'}`}>{video.type}</span>
                        <span className="text-xs text-cyan-300">{video.date}</span>
                        {video.destacado && <span className="text-xs bg-yellow-400 text-black rounded px-2 py-0.5 ml-2 font-bold">Destacado</span>}
                      </div>
                      <div className="font-semibold text-sm mt-1 text-cyan-100">{video.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{video.description}</div>
                    </div>
                    <button className="text-cyan-400 hover:text-cyan-200 font-bold px-2" onClick={() => setEditVideo(video)}>Editar</button>
                    <button className="text-red-400 hover:text-red-200 font-bold px-2" onClick={() => handleDeleteVideo(video.id)}>Eliminar</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <div className="flex">
        {/* Barra lateral con glassmorphism y animación, debajo de las barras superiores */}
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
            <div ref={videoRef} className={`${isVideoExpanded ? 'lg:col-span-3' : 'lg:col-span-2'} bg-gray-800 rounded-xl p-4 flex flex-col items-center relative`}>
              {selectedEvent ? (
                <>
                  {/* Botón expandir/reducir video */}
                  <button
                    className="absolute top-4 right-4 z-10 bg-gray-900/70 hover:bg-cyan-700 text-white p-2 rounded-full shadow-lg border border-cyan-400 transition"
                    onClick={() => setIsVideoExpanded(v => !v)}
                    title={isVideoExpanded ? 'Reducir video' : 'Expandir video'}
                  >
                    {isVideoExpanded ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                  </button>
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
                    <div className="aspect-video w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-cyan-400 min-h-[180px] max-h-[70vh]">
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
                            onClick={handleSendRating}
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
                      <form onSubmit={handleSendComment} className="flex flex-col gap-2 mb-4">
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
            <div className={`${isVideoExpanded ? 'hidden' : ''} flex flex-col gap-6 bg-gray-800 rounded-xl p-4`}>
              {/* Información del evento destacado */}
              <div className="mb-4">
                <div className="rounded-xl p-4 mb-4 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-pink-400 shadow-lg flex flex-col items-center text-white">
                  {loadingFeatured ? (
                    <div className="text-white/80 text-center">Cargando evento destacado...</div>
                  ) : (
                    <>
                      <div className="font-orbitron text-xl md:text-2xl font-bold mb-1 tracking-wide">{featuredEvent.title}</div>
                      <div className="text-sm md:text-base mb-2 text-white/90 text-center leading-tight">{featuredEvent.description} <span className="underline font-semibold cursor-pointer">{featuredEvent.cta}</span></div>
                      <div className="flex items-center gap-2 text-lg font-mono font-bold bg-white/10 px-4 py-2 rounded-lg mt-2">
                        <span>{String(countdown.hours).padStart(2, '0')}</span>
                        <span className="text-xs font-normal">h</span>
                        <span>:</span>
                        <span>{String(countdown.min).padStart(2, '0')}</span>
                        <span className="text-xs font-normal">m</span>
                        <span>:</span>
                        <span>{String(countdown.sec).padStart(2, '0')}</span>
                        <span className="text-xs font-normal">s</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Calendario */}
              <LaunchCalendar
                events={videosFinal}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                launchStartDate={featuredEvent.start_date}
                launchEndDate={featuredEvent.end_date}
              />
              {/* Lista de videos */}
              <div className="bg-gray-900/70 rounded-xl p-3 mt-2 shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-orbitron text-lg">Directos y Cápsulas</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {filteredVideos.length === 0 && (
                    <div className="text-gray-500 text-sm">No hay videos para este día.</div>
                  )}
                  {filteredVideos.map(video => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedEvent(video)}
                      className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all text-left bg-gray-800/80 hover:bg-cyan-900/40 border border-transparent hover:border-cyan-400 ${selectedEvent?.id === video.id ? 'ring-2 ring-cyan-400 border-cyan-400' : ''}`}
                    >
                      <img src={video.thumbnail} alt={video.title} className="w-16 h-10 object-cover rounded-md border border-gray-700" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${video.type === 'Directo' ? 'bg-fuchsia-600 text-white' : 'bg-cyan-600 text-white'}`}>{video.type}</span>
                          <span className="text-xs text-cyan-300">{new Date(video.date).toLocaleDateString()}</span>
                        </div>
                        <div className="font-semibold text-sm mt-1 text-cyan-100">{video.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{video.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Launchpad; 