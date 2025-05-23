import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Plus,
  Settings,
  Link,
  BarChart2,
  Palette,
  Type,
  Image,
  Video,
  FileText,
  CreditCard,
  Share2,
  Copy,
  Globe,
  Code,
  Save,
  Loader2
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';

interface FunnelPage {
  id: string;
  type: 'landing' | 'form' | 'video' | 'payment';
  title: string;
  content: any;
  order: number;
}

interface FunnelTemplate {
  id: string;
  name: string;
  type: 'webinar' | 'lead-magnet' | 'digital-product' | 'waitlist' | 'white-label';
  description: string;
  pages: FunnelPage[];
}

interface Funnel {
  id: string;
  name: string;
  pages: FunnelPage[];
  style: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
    typography: {
      heading: string;
      body: string;
    };
    animations: boolean;
  };
  tracking: {
    metalinkPixel: boolean;
    googleAnalytics: string;
    metaPixel: string;
    tiktokPixel: string;
  };
  domain: {
    type: 'subdomain' | 'custom';
    url: string;
  };
  stats: {
    views: number;
    leads: number;
    sales: number;
  };
}

const FunnelBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<FunnelTemplate | null>(null);
  const [currentFunnel, setCurrentFunnel] = useState<Funnel | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pages' | 'style' | 'tracking' | 'domain'>('pages');

  // Templates predefinidos
  const templates: FunnelTemplate[] = [
    {
      id: 'webinar',
      name: 'Webinar',
      type: 'webinar',
      description: 'Funnel optimizado para promocionar webinars y eventos en vivo',
      pages: [
        {
          id: 'landing',
          type: 'landing',
          title: 'Landing Page',
          content: {},
          order: 0
        },
        {
          id: 'form',
          type: 'form',
          title: 'Registro',
          content: {},
          order: 1
        },
        {
          id: 'video',
          type: 'video',
          title: 'Webinar',
          content: {},
          order: 2
        }
      ]
    },
    {
      id: 'lead-magnet',
      name: 'Lead Magnet',
      type: 'lead-magnet',
      description: 'Funnel para captar leads con contenido de valor',
      pages: [
        {
          id: 'landing',
          type: 'landing',
          title: 'Landing Page',
          content: {},
          order: 0
        },
        {
          id: 'form',
          type: 'form',
          title: 'Descarga',
          content: {},
          order: 1
        }
      ]
    }
  ];

  const handleCreateFunnel = (template: FunnelTemplate) => {
    setIsLoading(true);
    const newFunnel: Funnel = {
      id: Math.random().toString(36).substring(7),
      name: `${template.name} Funnel`,
      pages: template.pages,
      style: {
        colors: {
          primary: '#00ff9d',
          secondary: '#00b8ff',
          background: '#0a0a0a',
          text: '#ffffff'
        },
        typography: {
          heading: 'Orbitron',
          body: 'Inter'
        },
        animations: true
      },
      tracking: {
        metalinkPixel: true,
        googleAnalytics: '',
        metaPixel: '',
        tiktokPixel: ''
      },
      domain: {
        type: 'subdomain',
        url: ''
      },
      stats: {
        views: 0,
        leads: 0,
        sales: 0
      }
    };

    // Guardar en localStorage
    localStorage.setItem('currentFunnel', JSON.stringify(newFunnel));
    setCurrentFunnel(newFunnel);
    setSelectedTemplate(template);
    setIsLoading(false);
    setShowTemplates(false);
    toast.success('¡Funnel creado con éxito!');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !currentFunnel) return;

    const pages = Array.from(currentFunnel.pages);
    const [reorderedPage] = pages.splice(result.source.index, 1);
    pages.splice(result.destination.index, 0, reorderedPage);

    const updatedFunnel: Funnel = {
      ...currentFunnel,
      pages: pages.map((page, index) => ({ ...page, order: index }))
    };

    setCurrentFunnel(updatedFunnel);
    localStorage.setItem('currentFunnel', JSON.stringify(updatedFunnel));
  };

  const handleSaveFunnel = () => {
    if (!currentFunnel) return;
    localStorage.setItem('currentFunnel', JSON.stringify(currentFunnel));
    toast.success('Funnel guardado correctamente');
  };

  const handleAddPage = (type: FunnelPage['type']) => {
    if (!currentFunnel) return;

    const newPage: FunnelPage = {
      id: Math.random().toString(36).substring(7),
      type,
      title: `Nueva ${type}`,
      content: {},
      order: currentFunnel.pages.length
    };

    const updatedFunnel = {
      ...currentFunnel,
      pages: [...currentFunnel.pages, newPage]
    };

    setCurrentFunnel(updatedFunnel);
    localStorage.setItem('currentFunnel', JSON.stringify(updatedFunnel));
  };

  useEffect(() => {
    const savedFunnel = localStorage.getItem('currentFunnel');
    if (savedFunnel) {
      setCurrentFunnel(JSON.parse(savedFunnel));
    }
  }, []);

  return (
    <div className="min-h-screen bg-neurolink-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-orbitron text-neurolink-coldWhite mb-2">
              Constructor de Embudos
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Crea y personaliza tus embudos de ventas
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <Layout className="w-5 h-5" />
              Plantillas
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Configuración
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveFunnel}
              className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Guardar
            </motion.button>
          </div>
        </motion.div>

        {/* Contenido Principal */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-neurolink-matrixGreen animate-spin" />
          </div>
        ) : currentFunnel ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Panel de Páginas */}
            <div className="col-span-3 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-4">
              <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
                Páginas del Embudo
              </h2>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="pages">
                  {(provided: DroppableProvided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {currentFunnel.pages.map((page, index) => (
                        <Draggable
                          key={page.id}
                          draggableId={page.id}
                          index={index}
                        >
                          {(provided: DraggableProvided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-3 rounded-lg bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/30 cursor-move"
                            >
                              <div className="flex items-center gap-2">
                                {page.type === 'landing' && <Image className="w-4 h-4 text-neurolink-matrixGreen" />}
                                {page.type === 'form' && <FileText className="w-4 h-4 text-neurolink-matrixGreen" />}
                                {page.type === 'video' && <Video className="w-4 h-4 text-neurolink-matrixGreen" />}
                                {page.type === 'payment' && <CreditCard className="w-4 h-4 text-neurolink-matrixGreen" />}
                                <span className="text-neurolink-coldWhite font-orbitron text-sm">
                                  {page.title}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* Botones de Agregar Página */}
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => handleAddPage('landing')}
                  className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Landing
                </button>
                <button
                  onClick={() => handleAddPage('form')}
                  className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Formulario
                </button>
                <button
                  onClick={() => handleAddPage('video')}
                  className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Video
                </button>
                <button
                  onClick={() => handleAddPage('payment')}
                  className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Pago
                </button>
              </div>
            </div>

            {/* Editor Principal */}
            <div className="col-span-9 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`px-4 py-2 rounded-lg font-orbitron ${
                    activeTab === 'pages'
                      ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                      : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                  }`}
                >
                  Páginas
                </button>
                <button
                  onClick={() => setActiveTab('style')}
                  className={`px-4 py-2 rounded-lg font-orbitron ${
                    activeTab === 'style'
                      ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                      : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                  }`}
                >
                  Estilo
                </button>
                <button
                  onClick={() => setActiveTab('tracking')}
                  className={`px-4 py-2 rounded-lg font-orbitron ${
                    activeTab === 'tracking'
                      ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                      : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                  }`}
                >
                  Tracking
                </button>
                <button
                  onClick={() => setActiveTab('domain')}
                  className={`px-4 py-2 rounded-lg font-orbitron ${
                    activeTab === 'domain'
                      ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                      : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                  }`}
                >
                  Dominio
                </button>
              </div>

              {/* Contenido de las Pestañas */}
              <AnimatePresence mode="wait">
                {activeTab === 'pages' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                      <h3 className="text-neurolink-coldWhite font-orbitron mb-2">
                        Editor de Páginas
                      </h3>
                      <p className="text-neurolink-coldWhite/70">
                        Arrastra y suelta elementos para construir tu página
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'style' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                        <h3 className="text-neurolink-coldWhite font-orbitron mb-2">
                          Colores
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-neurolink-matrixGreen" />
                            <span className="text-neurolink-coldWhite">Color Primario</span>
                            <input
                              type="color"
                              value={currentFunnel.style.colors.primary}
                              onChange={(e) => {
                                const updatedFunnel = {
                                  ...currentFunnel,
                                  style: {
                                    ...currentFunnel.style,
                                    colors: {
                                      ...currentFunnel.style.colors,
                                      primary: e.target.value
                                    }
                                  }
                                };
                                setCurrentFunnel(updatedFunnel);
                              }}
                              className="w-8 h-8 rounded cursor-pointer"
                            />
                          </div>
                          {/* Agregar más opciones de color */}
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                        <h3 className="text-neurolink-coldWhite font-orbitron mb-2">
                          Tipografía
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Type className="w-4 h-4 text-neurolink-matrixGreen" />
                            <span className="text-neurolink-coldWhite">Fuente Principal</span>
                            <select
                              value={currentFunnel.style.typography.heading}
                              onChange={(e) => {
                                const updatedFunnel = {
                                  ...currentFunnel,
                                  style: {
                                    ...currentFunnel.style,
                                    typography: {
                                      ...currentFunnel.style.typography,
                                      heading: e.target.value
                                    }
                                  }
                                };
                                setCurrentFunnel(updatedFunnel);
                              }}
                              className="bg-black/40 border border-neurolink-cyberBlue/30 rounded px-2 py-1 text-neurolink-coldWhite"
                            >
                              <option value="Orbitron">Orbitron</option>
                              <option value="Inter">Inter</option>
                              <option value="Roboto">Roboto</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'tracking' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                      <h3 className="text-neurolink-coldWhite font-orbitron mb-2">
                        Configuración de Tracking
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={currentFunnel.tracking.metalinkPixel}
                            onChange={(e) => {
                              const updatedFunnel = {
                                ...currentFunnel,
                                tracking: {
                                  ...currentFunnel.tracking,
                                  metalinkPixel: e.target.checked
                                }
                              };
                              setCurrentFunnel(updatedFunnel);
                            }}
                            className="w-4 h-4 rounded border-neurolink-cyberBlue/30"
                          />
                          <span className="text-neurolink-coldWhite">Pixel de Metalink</span>
                        </div>

                        <div className="space-y-2">
                          <label className="text-neurolink-coldWhite">Google Analytics ID</label>
                          <input
                            type="text"
                            value={currentFunnel.tracking.googleAnalytics}
                            onChange={(e) => {
                              const updatedFunnel = {
                                ...currentFunnel,
                                tracking: {
                                  ...currentFunnel.tracking,
                                  googleAnalytics: e.target.value
                                }
                              };
                              setCurrentFunnel(updatedFunnel);
                            }}
                            placeholder="UA-XXXXXXXXX-X"
                            className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                          />
                        </div>

                        {/* Agregar más campos de tracking */}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'domain' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                      <h3 className="text-neurolink-coldWhite font-orbitron mb-2">
                        Configuración de Dominio
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              const updatedFunnel: Funnel = {
                                ...currentFunnel,
                                domain: {
                                  ...currentFunnel.domain,
                                  type: 'subdomain' as const
                                }
                              };
                              setCurrentFunnel(updatedFunnel);
                            }}
                            className={`px-4 py-2 rounded-lg font-orbitron ${
                              currentFunnel.domain.type === 'subdomain'
                                ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                                : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                            }`}
                          >
                            Subdominio
                          </button>
                          <button
                            onClick={() => {
                              const updatedFunnel: Funnel = {
                                ...currentFunnel,
                                domain: {
                                  ...currentFunnel.domain,
                                  type: 'custom' as const
                                }
                              };
                              setCurrentFunnel(updatedFunnel);
                            }}
                            className={`px-4 py-2 rounded-lg font-orbitron ${
                              currentFunnel.domain.type === 'custom'
                                ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                                : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                            }`}
                          >
                            Dominio Personalizado
                          </button>
                        </div>

                        {currentFunnel.domain.type === 'subdomain' ? (
                          <div className="space-y-2">
                            <label className="text-neurolink-coldWhite">Subdominio</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={currentFunnel.domain.url}
                                onChange={(e) => {
                                  const updatedFunnel = {
                                    ...currentFunnel,
                                    domain: {
                                      ...currentFunnel.domain,
                                      url: e.target.value
                                    }
                                  };
                                  setCurrentFunnel(updatedFunnel);
                                }}
                                placeholder="nombre-funnel"
                                className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                              />
                              <span className="text-neurolink-coldWhite/70">.metalink.ai</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-neurolink-coldWhite">Dominio Personalizado</label>
                            <input
                              type="text"
                              value={currentFunnel.domain.url}
                              onChange={(e) => {
                                const updatedFunnel = {
                                  ...currentFunnel,
                                  domain: {
                                    ...currentFunnel.domain,
                                    url: e.target.value
                                  }
                                };
                                setCurrentFunnel(updatedFunnel);
                              }}
                              placeholder="tudominio.com"
                              className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
              Comienza a Crear tu Embudo
            </h2>
            <p className="text-neurolink-coldWhite/70 mb-6">
              Selecciona una plantilla o crea un embudo desde cero
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTemplates(true)}
              className="px-6 py-3 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron"
            >
              Ver Plantillas
            </motion.button>
          </div>
        )}
      </div>

      {/* Modal de Plantillas */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 p-6 w-full max-w-4xl"
            >
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                Plantillas de Embudos
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 cursor-pointer"
                    onClick={() => handleCreateFunnel(template)}
                  >
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-2">
                      {template.name}
                    </h3>
                    <p className="text-neurolink-coldWhite/70 mb-4">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 text-neurolink-coldWhite/50 text-sm">
                      <Layout className="w-4 h-4" />
                      <span>{template.pages.length} páginas</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowTemplates(false)}
                  className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FunnelBuilder; 