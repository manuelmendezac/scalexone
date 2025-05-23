import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Code,
  Globe,
  MessageSquare,
  Settings,
  Eye,
  Copy,
  Save,
  Brain,
  Plus,
  Layout,
  Type,
  Video,
  CreditCard,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';

// Interfaces
interface FunnelTemplate {
  id: string;
  name: string;
  type: 'capture' | 'webinar' | 'vsl' | 'checkout' | 'upsell';
  components: FunnelComponent[];
  preview: string;
}

interface FunnelComponent {
  id: string;
  type: 'text' | 'form' | 'video' | 'payment' | 'testimonial';
  content: any;
  position: number;
}

interface IAWidget {
  color: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  initialMessage: string;
  trigger: 'click' | 'time' | 'scroll' | 'exit';
  triggerValue?: number;
}

interface ExportSettings {
  utmParams: {
    source: string;
    medium: string;
    campaign: string;
  };
  tracking: {
    gtm: boolean;
    pixel: boolean;
  };
  domain: {
    type: 'subdomain' | 'custom';
    value: string;
  };
}

// Componente Principal
const ExportCenter: React.FC = () => {
  // Estados
  const [activeTab, setActiveTab] = useState<'funnels' | 'widget' | 'preview'>('funnels');
  const [selectedTemplate, setSelectedTemplate] = useState<FunnelTemplate | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<IAWidget>({
    color: '#00ff00',
    position: 'bottom-right',
    initialMessage: '¿En qué puedo ayudarte?',
    trigger: 'click'
  });
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    utmParams: {
      source: '',
      medium: '',
      campaign: ''
    },
    tracking: {
      gtm: false,
      pixel: false
    },
    domain: {
      type: 'subdomain',
      value: ''
    }
  });

  // Datos de ejemplo
  const templates: FunnelTemplate[] = [
    {
      id: 'webinar',
      name: 'Webinar de Alto Valor',
      type: 'webinar',
      components: [
        {
          id: 'header',
          type: 'text',
          content: {
            title: 'Webinar Exclusivo',
            subtitle: 'Descubre los secretos del éxito'
          },
          position: 0
        },
        {
          id: 'form',
          type: 'form',
          content: {
            fields: ['nombre', 'email'],
            button: 'Reservar mi lugar'
          },
          position: 1
        }
      ],
      preview: 'preview-url'
    }
  ];

  // Handlers
  const handleCreateFunnel = (type: FunnelTemplate['type']) => {
    setShowAIAssistant(true);
    // Lógica para crear funnel
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedTemplate) return;

    const components = Array.from(selectedTemplate.components);
    const [reorderedComponent] = components.splice(result.source.index, 1);
    components.splice(result.destination.index, 0, reorderedComponent);

    const updatedTemplate = {
      ...selectedTemplate,
      components
    };

    setSelectedTemplate(updatedTemplate);
  };

  const handleExport = (type: 'html' | 'iframe' | 'domain') => {
    switch (type) {
      case 'html':
        // Lógica para exportar HTML
        toast.success('HTML exportado con éxito');
        break;
      case 'iframe':
        // Lógica para generar iframe
        toast.success('Código iframe generado');
        break;
      case 'domain':
        // Lógica para configurar dominio
        toast.success('Dominio configurado');
        break;
    }
  };

  const handleAIGenerate = async (prompt: string) => {
    setShowAIAssistant(true);
    // Lógica para generar con IA
    toast.success('Funnel generado con IA');
  };

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
              Centro de Exportación
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Exporta y configura tus embudos y widgets
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAIAssistant(true)}
              className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
            >
              <Brain className="w-5 h-5" />
              Generar con IA
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-neurolink-cyberBlue/30">
          <button
            onClick={() => setActiveTab('funnels')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'funnels'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Embudos
          </button>
          <button
            onClick={() => setActiveTab('widget')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'widget'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Widget IA
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'preview'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Vista Previa
          </button>
        </div>

        {/* Contenido Principal */}
        <AnimatePresence mode="wait">
          {activeTab === 'funnels' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Lista de Plantillas */}
              <div className="col-span-3 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-4">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
                  Plantillas
                </h2>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 rounded-lg cursor-pointer ${
                        selectedTemplate?.id === template.id
                          ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                          : 'bg-neurolink-cyberBlue/10 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron">{template.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botones de Crear */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleCreateFunnel('capture')}
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Captación
                  </button>
                  <button
                    onClick={() => handleCreateFunnel('webinar')}
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Webinar
                  </button>
                  <button
                    onClick={() => handleCreateFunnel('vsl')}
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo VSL
                  </button>
                </div>
              </div>

              {/* Editor de Funnel */}
              <div className="col-span-9 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                {selectedTemplate ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
                        {selectedTemplate.name}
                      </h2>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleExport('html')}
                          className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Exportar HTML
                        </button>
                        <button
                          onClick={() => handleExport('iframe')}
                          className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                        >
                          <Code className="w-5 h-5" />
                          Generar iframe
                        </button>
                        <button
                          onClick={() => handleExport('domain')}
                          className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                        >
                          <Globe className="w-5 h-5" />
                          Configurar Dominio
                        </button>
                      </div>
                    </div>

                    {/* Editor Drag & Drop */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="funnel-components">
                        {(provided: DroppableProvided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                          >
                            {selectedTemplate.components.map((component, index) => (
                              <Draggable
                                key={component.id}
                                draggableId={component.id}
                                index={index}
                              >
                                {(provided: DraggableProvided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="p-4 rounded-lg bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/30 cursor-move"
                                  >
                                    <div className="flex items-center gap-4">
                                      {component.type === 'text' && <Type className="w-5 h-5 text-neurolink-matrixGreen" />}
                                      {component.type === 'form' && <Layout className="w-5 h-5 text-neurolink-matrixGreen" />}
                                      {component.type === 'video' && <Video className="w-5 h-5 text-neurolink-matrixGreen" />}
                                      {component.type === 'payment' && <CreditCard className="w-5 h-5 text-neurolink-matrixGreen" />}
                                      {component.type === 'testimonial' && <MessageCircle className="w-5 h-5 text-neurolink-matrixGreen" />}
                                      <div>
                                        <h3 className="text-neurolink-coldWhite font-orbitron">
                                          {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
                                        </h3>
                                        <p className="text-neurolink-coldWhite/70 text-sm">
                                          {JSON.stringify(component.content)}
                                        </p>
                                      </div>
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
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                      Selecciona una Plantilla
                    </h2>
                    <p className="text-neurolink-coldWhite/70">
                      O crea una nueva desde la lista
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'widget' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Configuración del Widget */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-6">
                  Configuración del Widget
                </h2>
                <div className="space-y-6">
                  {/* Color */}
                  <div>
                    <label className="text-neurolink-coldWhite mb-2 block">
                      Color
                    </label>
                    <input
                      type="color"
                      value={widgetConfig.color}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, color: e.target.value })}
                      className="w-full h-10 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30"
                    />
                  </div>

                  {/* Posición */}
                  <div>
                    <label className="text-neurolink-coldWhite mb-2 block">
                      Posición
                    </label>
                    <select
                      value={widgetConfig.position}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, position: e.target.value as IAWidget['position'] })}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    >
                      <option value="bottom-right">Inferior Derecha</option>
                      <option value="bottom-left">Inferior Izquierda</option>
                      <option value="top-right">Superior Derecha</option>
                      <option value="top-left">Superior Izquierda</option>
                    </select>
                  </div>

                  {/* Mensaje Inicial */}
                  <div>
                    <label className="text-neurolink-coldWhite mb-2 block">
                      Mensaje Inicial
                    </label>
                    <input
                      type="text"
                      value={widgetConfig.initialMessage}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, initialMessage: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    />
                  </div>

                  {/* Trigger */}
                  <div>
                    <label className="text-neurolink-coldWhite mb-2 block">
                      Activación
                    </label>
                    <select
                      value={widgetConfig.trigger}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, trigger: e.target.value as IAWidget['trigger'] })}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    >
                      <option value="click">Al hacer clic</option>
                      <option value="time">Después de tiempo</option>
                      <option value="scroll">Al hacer scroll</option>
                      <option value="exit">Al salir</option>
                    </select>
                  </div>

                  {widgetConfig.trigger !== 'click' && (
                    <div>
                      <label className="text-neurolink-coldWhite mb-2 block">
                        Valor del Trigger
                      </label>
                      <input
                        type="number"
                        value={widgetConfig.triggerValue}
                        onChange={(e) => setWidgetConfig({ ...widgetConfig, triggerValue: Number(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                      />
                    </div>
                  )}

                  {/* Código de Inserción */}
                  <div>
                    <label className="text-neurolink-coldWhite mb-2 block">
                      Código de Inserción
                    </label>
                    <div className="relative">
                      <textarea
                        value={`<script src="https://widget.neurolink.ai/embed.js" data-config='${JSON.stringify(widgetConfig)}'></script>`}
                        readOnly
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`<script src="https://widget.neurolink.ai/embed.js" data-config='${JSON.stringify(widgetConfig)}'></script>`);
                          toast.success('Código copiado');
                        }}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista Previa del Widget */}
              <div className="col-span-6 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-6">
                  Vista Previa
                </h2>
                <div className="relative h-[600px] bg-black/40 rounded-lg border border-neurolink-cyberBlue/30">
                  {/* Simulación de página web */}
                  <div className="absolute inset-0 p-8">
                    <h1 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                      Página de Ejemplo
                    </h1>
                    <p className="text-neurolink-coldWhite/70">
                      Este es un ejemplo de cómo se verá el widget en tu sitio web.
                    </p>
                  </div>

                  {/* Widget */}
                  <motion.div
                    className={`absolute ${widgetConfig.position === 'bottom-right' ? 'bottom-4 right-4' : 
                      widgetConfig.position === 'bottom-left' ? 'bottom-4 left-4' :
                      widgetConfig.position === 'top-right' ? 'top-4 right-4' : 'top-4 left-4'}`}
                    style={{ backgroundColor: widgetConfig.color }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Configuraciones Avanzadas */}
              <div className="col-span-4 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-6">
                  Configuraciones
                </h2>
                <div className="space-y-6">
                  {/* UTM Params */}
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Parámetros UTM
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-neurolink-coldWhite/70 mb-2 block">
                          Fuente
                        </label>
                        <input
                          type="text"
                          value={exportSettings.utmParams.source}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            utmParams: { ...exportSettings.utmParams, source: e.target.value }
                          })}
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                        />
                      </div>
                      <div>
                        <label className="text-neurolink-coldWhite/70 mb-2 block">
                          Medio
                        </label>
                        <input
                          type="text"
                          value={exportSettings.utmParams.medium}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            utmParams: { ...exportSettings.utmParams, medium: e.target.value }
                          })}
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                        />
                      </div>
                      <div>
                        <label className="text-neurolink-coldWhite/70 mb-2 block">
                          Campaña
                        </label>
                        <input
                          type="text"
                          value={exportSettings.utmParams.campaign}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            utmParams: { ...exportSettings.utmParams, campaign: e.target.value }
                          })}
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tracking */}
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Tracking
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={exportSettings.tracking.gtm}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            tracking: { ...exportSettings.tracking, gtm: e.target.checked }
                          })}
                          className="w-4 h-4 rounded border-neurolink-cyberBlue/30"
                        />
                        <label className="text-neurolink-coldWhite">
                          Google Tag Manager
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={exportSettings.tracking.pixel}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            tracking: { ...exportSettings.tracking, pixel: e.target.checked }
                          })}
                          className="w-4 h-4 rounded border-neurolink-cyberBlue/30"
                        />
                        <label className="text-neurolink-coldWhite">
                          Meta Pixel
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Dominio */}
                  <div>
                    <h3 className="text-neurolink-coldWhite font-orbitron mb-4">
                      Dominio
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-neurolink-coldWhite/70 mb-2 block">
                          Tipo
                        </label>
                        <select
                          value={exportSettings.domain.type}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            domain: { ...exportSettings.domain, type: e.target.value as 'subdomain' | 'custom' }
                          })}
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                        >
                          <option value="subdomain">Subdominio</option>
                          <option value="custom">Dominio Personalizado</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-neurolink-coldWhite/70 mb-2 block">
                          Valor
                        </label>
                        <input
                          type="text"
                          value={exportSettings.domain.value}
                          onChange={(e) => setExportSettings({
                            ...exportSettings,
                            domain: { ...exportSettings.domain, value: e.target.value }
                          })}
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                          placeholder={exportSettings.domain.type === 'subdomain' ? 'ejemplo.neurolink.ai' : 'ejemplo.com'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista Previa */}
              <div className="col-span-8 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-6">
                  Vista Previa
                </h2>
                <div className="aspect-video bg-black/40 rounded-lg border border-neurolink-cyberBlue/30 flex items-center justify-center">
                  <Eye className="w-12 h-12 text-neurolink-matrixGreen" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Asistente IA */}
      <AnimatePresence>
        {showAIAssistant && (
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
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 p-6 w-full max-w-2xl"
            >
              <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                Asistente IA
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30">
                  <h3 className="text-neurolink-coldWhite font-orbitron mb-2">
                    Generar Funnel
                  </h3>
                  <p className="text-neurolink-coldWhite/70 mb-4">
                    Describe el tipo de funnel que necesitas
                  </p>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    placeholder="Ej: Un funnel para webinar de alto valor en el nicho de marketing digital..."
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowAIAssistant(false)}
                    className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // Lógica para generar con IA
                      toast.success('Funnel generado');
                      setShowAIAssistant(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron"
                  >
                    Generar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportCenter; 