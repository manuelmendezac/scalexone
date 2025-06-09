import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Share2, MessageSquare, Info, ChevronLeft, ChevronRight, Maximize2, Menu } from 'lucide-react';
import LaunchCalendar from '../components/launchpad/LaunchCalendar';

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
  const [isMenuOpen, setIsMenuOpen] = useState(window.innerWidth >= 1024);
  const [selectedEvent, setSelectedEvent] = useState<LaunchEvent | null>(null);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  // Datos de ejemplo
  const events: LaunchEvent[] = [
    {
      id: '1',
      title: 'La Revolución de la IA y cómo aprovecharla',
      date: '2025-05-05',
      description: 'Descubre por qué la inteligencia artificial es la tecnología que marcará el rumbo de la era exponencial y por qué tienes que dominarla.',
      videoUrl: 'https://www.youtube.com/embed/example1'
    },
    {
      id: '2',
      title: 'Multiplica tus ingresos con agentes y crea con modelos de imagen y video',
      date: '2025-05-06',
      description: 'Aprende a utilizar los modelos más avanzados de IA para crear contenido visual impactante.',
      videoUrl: 'https://www.youtube.com/embed/example2'
    }
  ];

  // Filtrar eventos por fecha seleccionada
  const filteredEvents = selectedDate
    ? events.filter(e => e.date === selectedDate)
    : events;

  // Responsive: mostrar/ocultar barra lateral en móvil
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsMenuOpen(false);
      else setIsMenuOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Botón flotante para abrir barra lateral en móvil */}
      {!isMenuOpen && (
        <button
          className="fixed z-50 bottom-6 left-6 bg-cyan-500 hover:bg-cyan-400 text-white p-3 rounded-full shadow-lg lg:hidden"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
      <div className="flex">
        {/* Barra lateral con glassmorphism y animación */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -300, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-64 h-screen fixed left-0 top-0 z-40 p-4 bg-cyan-900/40 backdrop-blur-lg border-r border-cyan-400/30 shadow-xl flex flex-col items-center"
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute -right-3 top-4 bg-cyan-600 p-1 rounded-full shadow-lg"
                aria-label="Cerrar menú"
              >
                <ChevronLeft size={16} />
              </button>
              {/* Logo/avatar */}
              <div className="mb-8 mt-2 flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-cyan-400 flex items-center justify-center shadow-lg border-4 border-cyan-300/40">
                  {/* Aquí puedes poner el logo real o avatar */}
                  <span className="text-3xl font-bold text-cyan-900">🚀</span>
                </div>
                <span className="mt-2 text-cyan-200 font-orbitron text-lg tracking-wide">IA Heroes Live</span>
              </div>
              {/* Accesos con tooltips */}
              <nav className="space-y-4 w-full mt-4">
                {sidebarItems.map((item, idx) => (
                  <div key={item.label} className="group relative flex items-center w-full">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-cyan-900/30 transition font-semibold border border-transparent hover:border-cyan-400 text-cyan-100"
                      onClick={item.onClick}
                    >
                      {item.icon}
                      <span className="hidden md:inline">{item.label}</span>
                    </button>
                    {/* Tooltip */}
                    <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-cyan-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                      {item.tooltip}
                    </span>
                  </div>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>
        {/* Contenido principal */}
        <div className={`flex-1 ${isMenuOpen ? 'ml-64' : ''} transition-all duration-300`}>
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
            {/* Calendario y lista de eventos */}
            <div className={`${isVideoExpanded ? 'hidden' : ''} flex flex-col gap-6 bg-gray-800 rounded-xl p-4`}>
              {/* Calendario */}
              <LaunchCalendar
                events={events}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              {/* Lista de eventos */}
              <div>
                <div className="flex items-center gap-2 mb-2 mt-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-orbitron text-lg">Eventos del mes</h3>
                </div>
                <div className="space-y-4">
                  {filteredEvents.length === 0 && (
                    <div className="text-gray-500 text-sm">No hay eventos para este día.</div>
                  )}
                  {filteredEvents.map(event => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full p-4 rounded-lg transition-all text-left ${
                        selectedEvent?.id === event.id
                          ? 'bg-cyan-900/60 border border-cyan-400'
                          : 'bg-gray-900/60 hover:bg-gray-900'
                      }`}
                    >
                      <div className="text-sm text-cyan-400">{new Date(event.date).toLocaleDateString()}</div>
                      <div className="font-semibold mt-1">{event.title}</div>
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