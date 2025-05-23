import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Plus,
  Settings,
  BarChart2,
  Clock,
  Users,
  Send,
  Code,
  Brain,
  Bell,
  BellOff,
  Eye,
  MousePointer,
  MessageSquare,
  Copy,
  Save,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';

// Interfaces
interface EmailTemplate {
  id: string;
  name: string;
  type: 'launch' | 'confirmation' | 'cart-recovery' | 'follow-up';
  subject: string;
  content: string;
  html: string;
  stats: {
    opens: number;
    clicks: number;
    conversions: number;
  };
}

interface WorkflowStep {
  id: string;
  type: 'condition' | 'action' | 'delay' | 'trigger';
  title: string;
  config: any;
  nextSteps: string[];
}

interface Workflow {
  id: string;
  name: string;
  type: 'welcome' | 'education' | 'sales' | 'reengagement';
  steps: WorkflowStep[];
  active: boolean;
  stats: {
    subscribers: number;
    completion: number;
    conversions: number;
  };
}

interface AutomationStats {
  totalEmails: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  replyRate: number;
  heatmap: {
    [key: string]: number;
  };
}

// Componente Principal
const EmailAutomationCenter: React.FC = () => {
  // Estados
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'stats'>('workflows');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Datos de ejemplo
  const workflows: Workflow[] = [
    {
      id: 'welcome',
      name: 'Secuencia de Bienvenida',
      type: 'welcome',
      steps: [
        {
          id: 'trigger',
          type: 'trigger',
          title: 'Nuevo Lead',
          config: { event: 'lead_capture' },
          nextSteps: ['welcome_email']
        },
        {
          id: 'welcome_email',
          type: 'action',
          title: 'Email de Bienvenida',
          config: { template: 'welcome_1' },
          nextSteps: ['delay_1']
        },
        {
          id: 'delay_1',
          type: 'delay',
          title: 'Esperar 2 días',
          config: { days: 2 },
          nextSteps: ['follow_up']
        }
      ],
      active: true,
      stats: {
        subscribers: 150,
        completion: 85,
        conversions: 12
      }
    }
  ];

  const templates: EmailTemplate[] = [
    {
      id: 'launch_1',
      name: 'Lanzamiento Premium',
      type: 'launch',
      subject: '🚀 Acceso Anticipado: [Producto]',
      content: 'Contenido del email...',
      html: '<div>HTML del email...</div>',
      stats: {
        opens: 1200,
        clicks: 450,
        conversions: 89
      }
    }
  ];

  // Handlers
  const handleCreateWorkflow = (type: Workflow['type']) => {
    setIsLoading(true);
    // Lógica para crear workflow
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Workflow creado con éxito');
    }, 1000);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedWorkflow) return;

    const steps = Array.from(selectedWorkflow.steps);
    const [reorderedStep] = steps.splice(result.source.index, 1);
    steps.splice(result.destination.index, 0, reorderedStep);

    const updatedWorkflow = {
      ...selectedWorkflow,
      steps
    };

    setSelectedWorkflow(updatedWorkflow);
  };

  const handleAIGenerate = async (type: 'subject' | 'content' | 'cta') => {
    setShowAIAssistant(true);
    // Lógica para generar con IA
    toast.success('Contenido generado con IA');
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
              Centro de Automatización
            </h1>
            <p className="text-neurolink-coldWhite/70">
              Gestiona tus automatizaciones de email y campañas
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
              Asistente IA
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`px-4 py-2 rounded-lg font-orbitron flex items-center gap-2 ${
                isFocusMode
                  ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                  : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
              }`}
            >
              {isFocusMode ? (
                <>
                  <BellOff className="w-5 h-5" />
                  Modo Silencio
                </>
              ) : (
                <>
                  <Bell className="w-5 h-5" />
                  Modo Normal
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-neurolink-cyberBlue/30">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'workflows'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Workflows
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'templates'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Plantillas
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-orbitron ${
              activeTab === 'stats'
                ? 'text-neurolink-matrixGreen border-b-2 border-neurolink-matrixGreen'
                : 'text-neurolink-coldWhite/70'
            }`}
          >
            Estadísticas
          </button>
        </div>

        {/* Contenido Principal */}
        <AnimatePresence mode="wait">
          {activeTab === 'workflows' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Lista de Workflows */}
              <div className="col-span-3 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-4">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
                  Workflows
                </h2>
                <div className="space-y-2">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      onClick={() => setSelectedWorkflow(workflow)}
                      className={`p-3 rounded-lg cursor-pointer ${
                        selectedWorkflow?.id === workflow.id
                          ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                          : 'bg-neurolink-cyberBlue/10 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron">{workflow.name}</span>
                        {workflow.active && (
                          <div className="w-2 h-2 rounded-full bg-neurolink-matrixGreen" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botones de Crear */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleCreateWorkflow('welcome')}
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Bienvenida
                  </button>
                  <button
                    onClick={() => handleCreateWorkflow('education')}
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Educación
                  </button>
                  <button
                    onClick={() => handleCreateWorkflow('sales')}
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Venta
                  </button>
                  <button
                    onClick={() => handleCreateWorkflow('reengagement')}
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Re-engagement
                  </button>
                </div>
              </div>

              {/* Editor de Workflow */}
              <div className="col-span-9 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                {selectedWorkflow ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
                        {selectedWorkflow.name}
                      </h2>
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            const updatedWorkflow = {
                              ...selectedWorkflow,
                              active: !selectedWorkflow.active
                            };
                            setSelectedWorkflow(updatedWorkflow);
                          }}
                          className={`px-4 py-2 rounded-lg font-orbitron ${
                            selectedWorkflow.active
                              ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                              : 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite'
                          }`}
                        >
                          {selectedWorkflow.active ? 'Activo' : 'Inactivo'}
                        </button>
                        <button
                          onClick={() => {
                            // Lógica para guardar
                            toast.success('Workflow guardado');
                          }}
                          className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          Guardar
                        </button>
                      </div>
                    </div>

                    {/* Editor Drag & Drop */}
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="workflow-steps">
                        {(provided: DroppableProvided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-4"
                          >
                            {selectedWorkflow.steps.map((step, index) => (
                              <Draggable
                                key={step.id}
                                draggableId={step.id}
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
                                      {step.type === 'trigger' && <Users className="w-5 h-5 text-neurolink-matrixGreen" />}
                                      {step.type === 'action' && <Send className="w-5 h-5 text-neurolink-matrixGreen" />}
                                      {step.type === 'delay' && <Clock className="w-5 h-5 text-neurolink-matrixGreen" />}
                                      {step.type === 'condition' && <AlertCircle className="w-5 h-5 text-neurolink-matrixGreen" />}
                                      <div>
                                        <h3 className="text-neurolink-coldWhite font-orbitron">
                                          {step.title}
                                        </h3>
                                        <p className="text-neurolink-coldWhite/70 text-sm">
                                          {step.type === 'delay' && `${step.config.days} días`}
                                          {step.type === 'trigger' && step.config.event}
                                          {step.type === 'action' && step.config.template}
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
                      Selecciona un Workflow
                    </h2>
                    <p className="text-neurolink-coldWhite/70">
                      O crea uno nuevo desde la lista
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'templates' && (
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
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4" />
                          {template.stats.opens}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botones de Crear */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleAIGenerate('content')}
                    className="w-full px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Generar con IA
                  </button>
                </div>
              </div>

              {/* Editor de Plantilla */}
              <div className="col-span-9 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                {selectedTemplate ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
                        {selectedTemplate.name}
                      </h2>
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleAIGenerate('subject')}
                          className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                        >
                          <Brain className="w-5 h-5" />
                          Generar Asunto
                        </button>
                        <button
                          onClick={() => handleAIGenerate('cta')}
                          className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/30 font-orbitron flex items-center gap-2"
                        >
                          <Brain className="w-5 h-5" />
                          Generar CTA
                        </button>
                      </div>
                    </div>

                    {/* Editor de Email */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-neurolink-coldWhite mb-2 block">
                          Asunto
                        </label>
                        <input
                          type="text"
                          value={selectedTemplate.subject}
                          onChange={(e) => {
                            const updatedTemplate = {
                              ...selectedTemplate,
                              subject: e.target.value
                            };
                            setSelectedTemplate(updatedTemplate);
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                        />
                      </div>

                      <div>
                        <label className="text-neurolink-coldWhite mb-2 block">
                          Contenido
                        </label>
                        <textarea
                          value={selectedTemplate.content}
                          onChange={(e) => {
                            const updatedTemplate = {
                              ...selectedTemplate,
                              content: e.target.value
                            };
                            setSelectedTemplate(updatedTemplate);
                          }}
                          rows={10}
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                        />
                      </div>

                      <div>
                        <label className="text-neurolink-coldWhite mb-2 block">
                          HTML
                        </label>
                        <textarea
                          value={selectedTemplate.html}
                          onChange={(e) => {
                            const updatedTemplate = {
                              ...selectedTemplate,
                              html: e.target.value
                            };
                            setSelectedTemplate(updatedTemplate);
                          }}
                          rows={10}
                          className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-4">
                      Selecciona una Plantilla
                    </h2>
                    <p className="text-neurolink-coldWhite/70">
                      O genera una nueva con IA
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Métricas Principales */}
              <div className="col-span-12 grid grid-cols-4 gap-4">
                <div className="p-6 rounded-xl bg-black/40 border border-neurolink-cyberBlue/30">
                  <h3 className="text-neurolink-coldWhite/70 mb-2">Total Emails</h3>
                  <p className="text-3xl font-orbitron text-neurolink-matrixGreen">
                    12,458
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-black/40 border border-neurolink-cyberBlue/30">
                  <h3 className="text-neurolink-coldWhite/70 mb-2">Tasa de Apertura</h3>
                  <p className="text-3xl font-orbitron text-neurolink-matrixGreen">
                    68.5%
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-black/40 border border-neurolink-cyberBlue/30">
                  <h3 className="text-neurolink-coldWhite/70 mb-2">Tasa de Clics</h3>
                  <p className="text-3xl font-orbitron text-neurolink-matrixGreen">
                    24.2%
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-black/40 border border-neurolink-cyberBlue/30">
                  <h3 className="text-neurolink-coldWhite/70 mb-2">Conversiones</h3>
                  <p className="text-3xl font-orbitron text-neurolink-matrixGreen">
                    8.7%
                  </p>
                </div>
              </div>

              {/* Mapa de Calor */}
              <div className="col-span-8 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
                  Mapa de Calor de Clics
                </h2>
                <div className="aspect-video bg-black/40 rounded-lg border border-neurolink-cyberBlue/30 flex items-center justify-center">
                  <MousePointer className="w-12 h-12 text-neurolink-matrixGreen" />
                </div>
              </div>

              {/* Campañas */}
              <div className="col-span-4 bg-black/40 backdrop-blur-xl rounded-xl border border-neurolink-cyberBlue/30 p-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4">
                  Campañas
                </h2>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="p-4 rounded-lg bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/30"
                    >
                      <h3 className="text-neurolink-coldWhite font-orbitron mb-2">
                        {workflow.name}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neurolink-coldWhite/70">
                            Suscriptores
                          </span>
                          <span className="text-neurolink-coldWhite">
                            {workflow.stats.subscribers}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neurolink-coldWhite/70">
                            Completado
                          </span>
                          <span className="text-neurolink-coldWhite">
                            {workflow.stats.completion}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neurolink-coldWhite/70">
                            Conversiones
                          </span>
                          <span className="text-neurolink-coldWhite">
                            {workflow.stats.conversions}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    Generar Contenido
                  </h3>
                  <p className="text-neurolink-coldWhite/70 mb-4">
                    Describe el tipo de contenido que necesitas
                  </p>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                    placeholder="Ej: Un email de bienvenida para nuevos suscriptores..."
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
                      toast.success('Contenido generado');
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

export default EmailAutomationCenter; 