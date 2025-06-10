import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Share2, MessageSquare, Info, ChevronLeft, ChevronRight, Maximize2, Menu } from 'lucide-react';
import LaunchCalendar from '../components/launchpad/LaunchCalendar';
import { supabase } from '../supabase';

interface LaunchEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  videoUrl: string;
}

const sidebarItems = [
  {
    label: 'Compartir experiencia',
    icon: <Share2 className="w-4 h-4" />, 
    tooltip: 'Comparte tu experiencia',
    onClick: () => {},
  },
  {
    label: 'Grupo de WhatsApp',
    icon: <MessageSquare className="w-4 h-4" />, 
    tooltip: 'Únete al grupo',
    onClick: () => {},
  },
  {
    label: 'Contactar soporte',
    icon: <Info className="w-4 h-4" />, 
    tooltip: 'Soporte',
    onClick: () => {},
  },
];

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
    date: '',
  });
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [savingEvent, setSavingEvent] = useState(false);

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
  const videos = [
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
    ? videos.filter(v => v.date === selectedDate)
    : videos;

  // Simulación de información del evento destacado y contador
  const featuredEvent = {
    title: 'IA HEROES LIVE',
    description: 'Para obtener las Masterclasses Exclusivas y reservar tu plaza solo quedan:',
    date: '2025-06-05T19:00:00',
    cta: 'Masterclasses Exclusivas',
  };

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
    const interval = setInterval(() => {
      setCountdown(getCountdown(featuredEvent.date));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
          date: data.date ? data.date.slice(0, 16) : '', // formato para input datetime-local
        });
      }
      setLoadingEvent(false);
    }
    fetchEvent();
  }, [drawerOpen]);

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
          },
        ]);
    }
    setSavingEvent(false);
    setDrawerOpen(false);
    // Refrescar datos en la vista principal (puedes mejorar esto con SWR o similar)
    window.location.reload();
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
            <form onSubmit={handleSaveEvent} className="flex flex-col gap-4">
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
              <label className="text-fuchsia-200 font-semibold">Fecha y hora</label>
              <input
                type="datetime-local"
                className="p-2 rounded bg-gray-800 border border-fuchsia-400 text-white"
                value={editEvent.date}
                onChange={e => setEditEvent(ev => ({ ...ev, date: e.target.value }))}
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
                <div className="w-14 h-14 rounded-full bg-cyan-400 flex items-center justify-center shadow-lg border-4 border-cyan-300/40">
                  <span className="text-3xl font-bold text-cyan-900">🚀</span>
                </div>
                {!isCollapsed && (
                  <span className="mt-2 text-cyan-200 font-orbitron text-lg tracking-wide">IA Heroes Live</span>
                )}
              </div>
              {/* Accesos con tooltips o solo íconos */}
              <nav className="space-y-4 w-full mt-4 flex flex-col items-center">
                {sidebarItems.map((item, idx) => (
                  <div key={item.label} className="group relative flex items-center w-full justify-center">
                    <button
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg font-semibold border border-cyan-400/40 transition-all w-full justify-center
                        bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-700
                        hover:from-cyan-700 hover:to-cyan-500
                        text-white
                        active:scale-95
                        ${isCollapsed ? 'justify-center px-2 py-2' : ''}`}
                      style={{ fontSize: isCollapsed ? 22 : 18 }}
                      onClick={item.onClick}
                    >
                      <span className={`text-cyan-300 ${isCollapsed ? 'text-2xl' : 'text-xl'}`}>{item.icon}</span>
                      {!isCollapsed && <span className="ml-2 font-orbitron text-base md:text-lg" style={{color: '#fff', fontWeight: 600}}>{item.label}</span>}
                    </button>
                    {/* Tooltip solo cuando está colapsado */}
                    {isCollapsed && (
                      <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-cyan-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                        {item.tooltip}
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
                </div>
              </div>
              {/* Calendario */}
              <LaunchCalendar
                events={videos}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
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