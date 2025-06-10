import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Share2, MessageSquare, Info, ChevronLeft, ChevronRight, Maximize2, Menu, Upload } from 'lucide-react';
import LaunchCalendar from '../components/launchpad/LaunchCalendar';
import { supabase } from '../supabase';

interface LaunchEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  videoUrl: string;
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

const Launchpad: React.FC = () => {
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
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single();
      if (data?.rol === 'admin') setIsAdmin(true);
    }
    checkAdmin();
  }, []);

  // Simulación de 6 directos y 6 cápsulas
  const videosSimulated = [
    // Directos
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `live-${i+1}`,
      type: 'Directo',
      title: `Directo Día ${i+1}: Tema Impactante ${i+1}`,
      date: `2025-05-${String(i+1).padStart(2, '0')}`,
      description: `Descripción del directo número ${i+1}, con aprendizajes clave y participación en vivo.`,
      thumbnail: `https://img.youtube.com/vi/example${i+1}/mqdefault.jpg`,
      videoUrl: `https://www.youtube.com/embed/example${i+1}`
    })),
    // Cápsulas
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `capsula-${i+1}`,
      type: 'Cápsula',
      title: `Cápsula IA #${i+1}: Microaprendizaje` ,
      date: `2025-05-${String(i+7).padStart(2, '0')}`,
      description: `Cápsula rápida sobre IA, tip ${i+1}.`,
      thumbnail: `https://img.youtube.com/vi/capsule${i+1}/mqdefault.jpg`,
      videoUrl: `https://www.youtube.com/embed/capsule${i+1}`
    }))
  ];

  // Filtrar videos por fecha seleccionada
  const filteredVideos = selectedDate
    ? videosSimulated.filter(v => v.date === selectedDate)
    : videosSimulated;

  // Cargar el evento destacado desde Supabase al montar la página
  async function fetchFeatured() {
    setLoadingFeatured(true);
    const { data, error } = await supabase
      .from('launchpad_events')
      .select('*')
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
  useEffect(() => { fetchFeatured(); }, []);

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
    if (!drawerOpen) return;
    async function fetchEvent() {
      setLoadingEvent(true);
      const { data, error } = await supabase
        .from('launchpad_events')
        .select('*')
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
  }, [drawerOpen]);

  // Cargar enlaces rápidos desde Supabase al abrir el drawer
  useEffect(() => {
    if (!drawerOpen) return;
    async function fetchLinks() {
      setLoadingLinks(true);
      const { data, error } = await supabase
        .from('launchpad_links')
        .select('*')
        .order('order_index', { ascending: true });
      if (data) setLinks(data);
      setLoadingLinks(false);
    }
    fetchLinks();
  }, [drawerOpen]);

  // Cargar configuración al montar
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

  // Cargar videos desde Supabase
  useEffect(() => {
    async function fetchVideos() {
      setLoadingVideos(true);
      const { data } = await supabase.from('launchpad_videos').select('*').order('date', { ascending: true });
      if (data) setVideos(data);
      setLoadingVideos(false);
    }
    fetchVideos();
  }, []);

  // Guardar cambios en Supabase
  async function handleSaveEvent(e: React.FormEvent) {
    e.preventDefault();
    setSavingEvent(true);
    // Buscar si ya existe un evento
    const { data: existing } = await supabase
      .from('launchpad_events')
      .select('id')
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
      .insert([{ ...newLink, order_index: links.length }]);
    setSavingLinks(false);
    setNewLink({ label: '', url: '', icon: '', icon_img: '' });
    // Refrescar lista
    const { data: updated } = await supabase
      .from('launchpad_links')
      .select('*')
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
      await supabase.from('launchpad_videos').update({ destacado: false }).eq('destacado', true);
    }
    const { error } = await supabase.from('launchpad_videos').insert([{ ...newVideo }]);
    setSavingVideo(false);
    setNewVideo({ title: '', description: '', video_url: '', thumbnail: '', type: 'Directo', date: '', destacado: false });
    // Refrescar lista
    const { data } = await supabase.from('launchpad_videos').select('*').order('date', { ascending: true });
    if (data) setVideos(data);
    if (error) alert('Error guardando video: ' + error.message);
  }

  // Editar video existente
  async function handleEditVideo(e: React.FormEvent) {
    e.preventDefault();
    setSavingVideo(true);
    if (editVideo.destacado) {
      await supabase.from('launchpad_videos').update({ destacado: false }).eq('destacado', true);
    }
    const { error } = await supabase.from('launchpad_videos').update(editVideo).eq('id', editVideo.id);
    setSavingVideo(false);
    setEditVideo(null);
    // Refrescar lista
    const { data } = await supabase.from('launchpad_videos').select('*').order('date', { ascending: true });
    if (data) setVideos(data);
    if (error) alert('Error actualizando video: ' + error.message);
  }

  // Eliminar video
  async function handleDeleteVideo(id: string) {
    await supabase.from('launchpad_videos').delete().eq('id', id);
    setVideos(videos.filter(v => v.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
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
          className="fixed z-50 bottom-6 left-6 bg-cyan-500 hover:bg-cyan-400 text-white p-3 rounded-full shadow-lg lg:hidden"
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
            <div className={`${isVideoExpanded ? 'lg:col-span-3' : 'lg:col-span-2'} bg-gray-800 rounded-xl p-4`}>
              <div className="relative">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {selectedEvent ? (
                    <iframe
                      src={selectedEvent.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Selecciona un video para comenzar
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsVideoExpanded(!isVideoExpanded)}
                  className="absolute top-4 right-4 p-2 bg-gray-900/50 rounded-lg hover:bg-gray-900"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              {selectedEvent && (
                <div className="mt-4">
                  <h2 className="text-xl font-orbitron text-cyan-400">{selectedEvent.title}</h2>
                  <p className="mt-2 text-gray-400">{selectedEvent.description}</p>
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
                events={videosSimulated}
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