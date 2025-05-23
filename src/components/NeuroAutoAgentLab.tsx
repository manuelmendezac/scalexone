import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Robot, 
  Calendar, 
  FlaskConical, 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Share2, 
  MessageSquare, 
  ArrowRight, 
  Code,
  CheckCircle,
  Clock,
  RefreshCcw,
  PanelRight,
  PanelLeft,
  ChevronDown,
  ChevronUp,
  Edit3,
  Activity
} from 'lucide-react';

// Interfaces
interface AgentTask {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  schedule: 'daily' | 'weekly' | 'monthly' | 'conditional';
  lastRun?: string;
  nextRun?: string;
}

interface FlowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  name: string;
  position: { x: number, y: number };
  connections: string[];
}

const EXAMPLE_TASKS = [
  { 
    id: '1', 
    name: 'Recordatorios de estudio', 
    description: 'Enviar recordatorio diario para estudiar a las 9am',
    status: 'running' as const,
    schedule: 'daily' as const,
    lastRun: '2024-06-02 09:00',
    nextRun: '2024-06-03 09:00'
  },
  { 
    id: '2', 
    name: 'Artículos de IA', 
    description: 'Buscar artículos nuevos sobre IA y enviar resumen semanal',
    status: 'idle' as const,
    schedule: 'weekly' as const,
    nextRun: '2024-06-08 10:00'
  }
];

const SAMPLE_FLOWS: FlowNode[] = [
  { 
    id: 'trigger1', 
    type: 'trigger', 
    name: 'Recibir email',
    position: { x: 100, y: 100 },
    connections: ['action1']
  },
  { 
    id: 'action1', 
    type: 'action', 
    name: 'Clasificar contenido',
    position: { x: 300, y: 200 },
    connections: ['condition1']
  },
  { 
    id: 'condition1', 
    type: 'condition', 
    name: '¿Es urgente?',
    position: { x: 500, y: 100 },
    connections: ['action2']
  },
  { 
    id: 'action2', 
    type: 'action', 
    name: 'Enviar notificación',
    position: { x: 700, y: 200 },
    connections: []
  }
];

export const NeuroAutoAgentLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'creator' | 'automation' | 'lab'>('creator');
  const [tasks, setTasks] = useState<AgentTask[]>(EXAMPLE_TASKS);
  const [flows, setFlows] = useState<FlowNode[]>(SAMPLE_FLOWS);
  const [taskDescription, setTaskDescription] = useState('');
  const [generatedSteps, setGeneratedSteps] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Lógica para mostrar notificaciones temporales
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Función para generar un plan basado en la descripción
  const generatePlan = () => {
    if (!taskDescription) return;
    
    setIsGenerating(true);
    
    // Simulación de generación
    setTimeout(() => {
      const examples: {[key: string]: string[]} = {
        estudio: [
          'Configurar recordatorios diarios a las 9:00 AM',
          'Enviar mensaje con tema de estudio del día',
          'Seguimiento de progreso al finalizar el día'
        ],
        artículos: [
          'Buscar artículos recientes sobre IA en fuentes seleccionadas',
          'Filtrar artículos por relevancia y novedad',
          'Generar resumen semanal con enlaces'
        ],
        linkedin: [
          'Monitorear nuevos mensajes en LinkedIn',
          'Clasificar mensajes por urgencia y tipo',
          'Generar respuestas personalizadas basadas en plantillas'
        ]
      };
      
      let generatedPlan: string[] = [];
      
      if (taskDescription.includes('estudio')) {
        generatedPlan = examples.estudio;
      } else if (taskDescription.includes('artículo')) {
        generatedPlan = examples.artículos;
      } else if (taskDescription.includes('LinkedIn')) {
        generatedPlan = examples.linkedin;
      } else {
        generatedPlan = [
          'Analizar la tarea solicitada',
          'Crear un calendario de ejecución',
          'Configurar acciones automatizadas',
          'Implementar sistema de reportes'
        ];
      }
      
      setGeneratedSteps(generatedPlan);
      setIsGenerating(false);
    }, 1500);
  };

  // Función para crear una nueva tarea
  const createNewTask = () => {
    if (generatedSteps.length === 0) return;
    
    const newTask: AgentTask = {
      id: Date.now().toString(),
      name: taskDescription.length > 30 ? `${taskDescription.substring(0, 30)}...` : taskDescription,
      description: taskDescription,
      status: 'idle',
      schedule: 'daily',
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 09:00'
    };
    
    setTasks([...tasks, newTask]);
    setTaskDescription('');
    setGeneratedSteps([]);
    showNotification('¡Nuevo agente creado con éxito!');
  };

  // Renderizado del componente principal
  return (
    <div className="min-h-screen bg-neurolink-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-3xl font-orbitron text-neurolink-coldWhite mb-6 flex items-center gap-3">
          <Robot className="w-8 h-8 text-neurolink-matrixGreen" />
          NeuroAuto<span className="text-neurolink-matrixGreen">Agent</span>Lab
        </h1>
        
        {/* Pestañas de navegación */}
        <div className="flex mb-6 bg-black/30 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-orbitron transition-all ${
              activeTab === 'creator' 
                ? 'bg-neurolink-matrixGreen text-neurolink-dark' 
                : 'text-neurolink-coldWhite hover:bg-neurolink-matrixGreen/20'
            }`}
          >
            <Robot className="w-5 h-5" /> Creador de Agentes
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-orbitron transition-all ${
              activeTab === 'automation' 
                ? 'bg-neurolink-matrixGreen text-neurolink-dark' 
                : 'text-neurolink-coldWhite hover:bg-neurolink-matrixGreen/20'
            }`}
          >
            <Calendar className="w-5 h-5" /> Automatizaciones
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-orbitron transition-all ${
              activeTab === 'lab' 
                ? 'bg-neurolink-matrixGreen text-neurolink-dark' 
                : 'text-neurolink-coldWhite hover:bg-neurolink-matrixGreen/20'
            }`}
          >
            <FlaskConical className="w-5 h-5" /> Laboratorio de Flujos
          </button>
        </div>
        
        {/* Contenido principal */}
        <AnimatePresence mode="wait">
          {activeTab === 'creator' && (
            <motion.div
              key="creator"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30"
            >
              <h2 className="text-xl font-orbitron text-neurolink-coldWhite mb-4 flex items-center gap-2">
                <Robot className="w-5 h-5 text-neurolink-matrixGreen" />
                Describe tu agente automatizado
              </h2>
              
              <div className="mb-6">
                <div className="relative mb-4">
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Describe en lenguaje natural lo que deseas que haga tu agente..."
                    className="w-full h-32 bg-black/60 rounded-lg border border-neurolink-cyberBlue/30 text-neurolink-coldWhite p-4 font-orbitron"
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-neurolink-coldWhite/50">
                    {taskDescription.length} caracteres
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generatePlan}
                  disabled={!taskDescription || isGenerating}
                  className={`w-full py-3 rounded-lg font-orbitron flex items-center justify-center gap-2 transition-all ${
                    !taskDescription || isGenerating
                      ? 'bg-neurolink-cyberBlue/20 text-neurolink-coldWhite/50 cursor-not-allowed'
                      : 'bg-neurolink-cyberBlue text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/80'
                  }`}
                >
                  {isGenerating ? 
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-neurolink-coldWhite border-t-transparent rounded-full" />
                      <span>Generando plan...</span>
                    </> : 
                    <>
                      <MessageSquare className="w-5 h-5" />
                      <span>Generar Plan de Automatización</span>
                    </>
                  }
                </motion.button>
              </div>
              
              {/* Plan generado */}
              <AnimatePresence>
                {generatedSteps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6"
                  >
                    <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-3 flex items-center gap-2">
                      <Code className="w-5 h-5 text-neurolink-matrixGreen" />
                      Plan Generado
                    </h3>
                    
                    <div className="bg-black/40 rounded-lg border border-neurolink-matrixGreen/30 p-4 mb-4">
                      <ol className="space-y-3">
                        {generatedSteps.map((step, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 text-neurolink-coldWhite"
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neurolink-matrixGreen/20 border border-neurolink-matrixGreen/40 flex items-center justify-center text-sm text-neurolink-matrixGreen">
                              {index + 1}
                            </div>
                            <div className="flex-1">{step}</div>
                          </motion.li>
                        ))}
                      </ol>
                    </div>
                    
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={createNewTask}
                        className="flex-1 py-3 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Crear Agente</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setTaskDescription('');
                          setGeneratedSteps([]);
                        }}
                        className="py-3 px-4 rounded-lg border border-neurolink-cyberBlue/30 text-neurolink-coldWhite hover:bg-neurolink-cyberBlue/20"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Sugerencias */}
              <div className="mt-6">
                <h3 className="text-sm font-orbitron text-neurolink-coldWhite/70 mb-2">Ejemplos de tareas que puedes automatizar:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['Envíame recordatorios diarios para estudiar', 
                    'Busca artículos sobre IA esta semana', 
                    'Responde mis mensajes de LinkedIn'].map((example, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTaskDescription(example)}
                      className="p-3 rounded-lg bg-neurolink-cyberBlue/10 border border-neurolink-cyberBlue/20 text-neurolink-coldWhite/80 hover:bg-neurolink-cyberBlue/20 text-sm text-left"
                    >
                      {example}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'automation' && (
            <motion.div
              key="automation"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-neurolink-matrixGreen" />
                  Automatizaciones Recurrentes
                </h2>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setTaskDescription('');
                    setGeneratedSteps([]);
                    setActiveTab('creator');
                  }}
                  className="py-2 px-4 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark font-orbitron flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Agente
                </motion.button>
              </div>
              
              {/* Filtro de tareas */}
              <div className="flex flex-wrap gap-2 mb-4">
                {['Todos', 'Activos', 'Completados', 'Pendientes'].map((filter) => (
                  <button
                    key={filter}
                    className="py-1 px-3 rounded-lg text-sm bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue border border-neurolink-cyberBlue/30 hover:bg-neurolink-cyberBlue/30"
                  >
                    {filter}
                  </button>
                ))}
              </div>
              
              {/* Lista de tareas automatizadas */}
              <div className="space-y-4 mb-6">
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-neurolink-coldWhite/50 mb-2">No hay automatizaciones configuradas</div>
                    <button
                      onClick={() => setActiveTab('creator')}
                      className="py-2 px-4 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/30"
                    >
                      Crear tu primer agente
                    </button>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-black/30 rounded-lg border ${
                        task.status === 'running' 
                          ? 'border-neurolink-matrixGreen/40' 
                          : task.status === 'failed'
                            ? 'border-red-500/40'
                            : 'border-neurolink-cyberBlue/30'
                      } overflow-hidden transition-all hover:shadow-lg`}
                    >
                      <div 
                        onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                        className="p-4 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${
                            task.status === 'running' 
                              ? 'bg-neurolink-matrixGreen animate-pulse' 
                              : task.status === 'completed'
                                ? 'bg-neurolink-cyberBlue'
                                : task.status === 'failed'
                                  ? 'bg-red-500'
                                  : 'bg-gray-400'
                          }`} />
                          <div>
                            <h3 className="text-neurolink-coldWhite font-orbitron">{task.name}</h3>
                            <div className="text-xs text-neurolink-coldWhite/60 flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> 
                                {task.schedule}
                              </span>
                              {task.nextRun && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> 
                                  Próximo: {task.nextRun}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            className={`p-2 rounded-lg ${
                              task.status === 'running' 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen'
                            }`}
                          >
                            {task.status === 'running' ? <Trash2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          {selectedTask === task.id ? (
                            <ChevronUp className="w-5 h-5 text-neurolink-coldWhite/50" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-neurolink-coldWhite/50" />
                          )}
                        </div>
                      </div>
                      
                      {/* Detalles expandibles */}
                      <AnimatePresence>
                        {selectedTask === task.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-neurolink-cyberBlue/20">
                              <div className="mb-3">
                                <div className="text-sm text-neurolink-coldWhite/70 mb-1">Descripción:</div>
                                <div className="text-neurolink-coldWhite">{task.description}</div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <div className="bg-black/20 rounded-lg p-3">
                                  <div className="text-xs text-neurolink-coldWhite/60 mb-1">Programación</div>
                                  <select 
                                    value={task.schedule}
                                    onChange={(e) => {
                                      const updatedTasks = tasks.map(t => 
                                        t.id === task.id ? {...t, schedule: e.target.value as any} : t
                                      );
                                      setTasks(updatedTasks);
                                    }}
                                    className="w-full bg-black/40 border border-neurolink-cyberBlue/30 rounded-lg p-2 text-neurolink-coldWhite"
                                  >
                                    <option value="daily">Diario</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensual</option>
                                    <option value="conditional">Condicional</option>
                                  </select>
                                </div>
                                
                                <div className="bg-black/20 rounded-lg p-3">
                                  <div className="text-xs text-neurolink-coldWhite/60 mb-1">Integración</div>
                                  <select className="w-full bg-black/40 border border-neurolink-cyberBlue/30 rounded-lg p-2 text-neurolink-coldWhite">
                                    <option value="email">Email (Gmail)</option>
                                    <option value="calendar">Calendario</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="none">Ninguna</option>
                                  </select>
                                </div>
                                
                                <div className="bg-black/20 rounded-lg p-3">
                                  <div className="text-xs text-neurolink-coldWhite/60 mb-1">Último estado</div>
                                  <div className={`text-sm ${
                                    task.status === 'running' 
                                      ? 'text-neurolink-matrixGreen' 
                                      : task.status === 'failed'
                                        ? 'text-red-400'
                                        : 'text-neurolink-cyberBlue'
                                  }`}>
                                    {task.status === 'running' ? 'En ejecución' :
                                      task.status === 'completed' ? 'Completado' :
                                      task.status === 'failed' ? 'Fallido' : 'Pendiente'}
                                  </div>
                                  {task.lastRun && <div className="text-xs text-neurolink-coldWhite/50 mt-1">Última ejecución: {task.lastRun}</div>}
                                </div>
                              </div>
                              
                              <div className="flex justify-end gap-2 mt-4">
                                <button className="py-2 px-3 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue border border-neurolink-cyberBlue/30 text-sm flex items-center gap-1">
                                  <Edit3 className="w-4 h-4" /> Editar
                                </button>
                                <button className="py-2 px-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-sm flex items-center gap-1">
                                  <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </div>
              
              {/* Integración de APIs */}
              <div className="bg-black/20 rounded-lg p-4 border border-neurolink-cyberBlue/20">
                <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-3">Integraciones disponibles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Gmail', connected: true, icon: 'mail' },
                    { name: 'Google Calendar', connected: true, icon: 'calendar' },
                    { name: 'WhatsApp', connected: false, icon: 'message' }
                  ].map((integration) => (
                    <div 
                      key={integration.name}
                      className="bg-black/30 rounded-lg p-3 border border-neurolink-cyberBlue/20 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neurolink-cyberBlue/20 flex items-center justify-center">
                          <span className="text-xl">{integration.icon === 'mail' ? '✉️' : integration.icon === 'calendar' ? '📅' : '💬'}</span>
                        </div>
                        <div>
                          <div className="text-neurolink-coldWhite">{integration.name}</div>
                          <div className={`text-xs ${integration.connected ? 'text-neurolink-matrixGreen' : 'text-red-400'}`}>
                            {integration.connected ? 'Conectado' : 'No conectado'}
                          </div>
                        </div>
                      </div>
                      
                      <button className={`py-1 px-3 rounded-lg text-xs ${
                        integration.connected 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen border border-neurolink-matrixGreen/30'
                      }`}>
                        {integration.connected ? 'Desconectar' : 'Conectar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'lab' && (
            <motion.div
              key="lab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-neurolink-cyberBlue/30"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-orbitron text-neurolink-coldWhite flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-neurolink-matrixGreen" />
                  Laboratorio de Flujos
                </h2>
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 px-3 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue border border-neurolink-cyberBlue/30 font-orbitron flex items-center gap-1 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Flujo
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => showNotification('Flujo guardado correctamente')}
                    className="py-2 px-3 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen border border-neurolink-matrixGreen/30 font-orbitron flex items-center gap-1 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </motion.button>
                </div>
              </div>
              
              {/* Canvas de flujo */}
              <div className="mb-6 relative">
                <div className="min-h-[400px] bg-black/20 rounded-lg border border-neurolink-cyberBlue/20 p-4 overflow-hidden">
                  {/* Aquí se simula un canvas de flujo con nodos y conexiones */}
                  {flows.map((node) => (
                    <div
                      key={node.id}
                      style={{
                        position: 'absolute',
                        left: `${node.position.x}px`,
                        top: `${node.position.y}px`,
                        zIndex: 10
                      }}
                      className={`p-3 rounded-lg shadow-lg w-48 cursor-move ${
                        node.type === 'trigger' 
                          ? 'bg-neurolink-cyberBlue/90 text-neurolink-coldWhite' 
                          : node.type === 'action'
                            ? 'bg-neurolink-matrixGreen/90 text-neurolink-dark'
                            : 'bg-purple-500/90 text-white'
                      }`}
                    >
                      <div className="font-orbitron text-sm mb-1">{node.name}</div>
                      <div className="text-xs opacity-80">{
                        node.type === 'trigger' ? 'Desencadenante' :
                        node.type === 'action' ? 'Acción' : 'Condición'
                      }</div>
                    </div>
                  ))}
                  
                  {/* Simulación de líneas de conexión entre nodos */}
                  <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 5 }}>
                    {flows.map(node => 
                      node.connections.map(targetId => {
                        const target = flows.find(n => n.id === targetId);
                        if (!target) return null;
                        
                        // Calcular puntos de inicio y fin para las líneas
                        const startX = node.position.x + 75;
                        const startY = node.position.y + 30;
                        const endX = target.position.x;
                        const endY = target.position.y + 15;
                        
                        // Control points for curve
                        const ctrlX = (startX + endX) / 2 + 30;
                        const ctrlY = (startY + endY) / 2;
                        
                        return (
                          <path
                            key={`${node.id}-${targetId}`}
                            d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
                            fill="none"
                            stroke="rgba(64, 196, 255, 0.7)"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                          />
                        );
                      })
                    )}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 10 3.5, 0 7"
                          fill="rgba(64, 196, 255, 0.7)"
                        />
                      </marker>
                    </defs>
                  </svg>
                  
                  {/* Mensaje guía */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/70 py-2 px-4 rounded-lg text-neurolink-coldWhite/70 text-sm">
                      Arrastra elementos desde la barra lateral para crear tu flujo
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Panel de herramientas y configuración */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-black/30 rounded-lg p-4 border border-neurolink-cyberBlue/20">
                  <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-3">Componentes</h3>
                  
                  <div className="space-y-2">
                    {[
                      { type: 'trigger', name: 'Desencadenantes', items: ['Email recibido', 'Hora específica', 'Evento de calendario'] },
                      { type: 'action', name: 'Acciones', items: ['Enviar email', 'Crear recordatorio', 'Guardar en base de datos'] },
                      { type: 'condition', name: 'Condiciones', items: ['Filtro de contenido', 'Comprobación de fecha', 'Verificación de estado'] }
                    ].map(category => (
                      <div key={category.type} className="mb-3">
                        <div className="text-neurolink-coldWhite/70 text-sm mb-1">{category.name}</div>
                        <div className="space-y-1">
                          {category.items.map((item, i) => (
                            <div 
                              key={i}
                              className={`p-2 rounded-lg text-sm cursor-grab ${
                                category.type === 'trigger' 
                                  ? 'bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue border border-neurolink-cyberBlue/30' 
                                  : category.type === 'action'
                                    ? 'bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen border border-neurolink-matrixGreen/30'
                                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              }`}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2 bg-black/30 rounded-lg p-4 border border-neurolink-cyberBlue/20">
                  <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-3">Configuración</h3>
                  
                  <div className="bg-black/40 rounded-lg p-4 mb-4">
                    <div className="mb-3">
                      <div className="text-neurolink-coldWhite/70 text-sm mb-1">Nombre del flujo</div>
                      <input
                        type="text"
                        value="Procesamiento Automático de Emails"
                        onChange={() => {}}
                        className="w-full bg-black/60 rounded-lg border border-neurolink-cyberBlue/30 p-2 text-neurolink-coldWhite"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-neurolink-coldWhite/70 text-sm mb-1">Descripción</div>
                      <textarea
                        value="Este flujo automáticamente procesa emails entrantes, los clasifica por contenido y genera notificaciones si son urgentes."
                        onChange={() => {}}
                        className="w-full h-20 bg-black/60 rounded-lg border border-neurolink-cyberBlue/30 p-2 text-neurolink-coldWhite"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-neurolink-coldWhite/70 text-sm mb-1">Estado</div>
                        <select className="w-full bg-black/60 rounded-lg border border-neurolink-cyberBlue/30 p-2 text-neurolink-coldWhite">
                          <option value="active">Activo</option>
                          <option value="paused">Pausado</option>
                          <option value="draft">Borrador</option>
                        </select>
                      </div>
                      
                      <div>
                        <div className="text-neurolink-coldWhite/70 text-sm mb-1">Programación</div>
                        <select className="w-full bg-black/60 rounded-lg border border-neurolink-cyberBlue/30 p-2 text-neurolink-coldWhite">
                          <option value="realtime">Tiempo real</option>
                          <option value="scheduled">Programado</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => showNotification('¡Flujo activado correctamente!')}
                        className="py-2 px-4 rounded-lg bg-neurolink-matrixGreen/20 text-neurolink-matrixGreen border border-neurolink-matrixGreen/30 flex items-center gap-1"
                      >
                        <Play className="w-4 h-4" /> Activar
                      </button>
                      <button className="py-2 px-4 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue border border-neurolink-cyberBlue/30 flex items-center gap-1">
                        <Activity className="w-4 h-4" /> Probar
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="py-2 px-4 rounded-lg bg-neurolink-cyberBlue/20 text-neurolink-cyberBlue border border-neurolink-cyberBlue/30 flex items-center gap-1">
                        <Share2 className="w-4 h-4" /> Compartir
                      </button>
                      <button className="py-2 px-4 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Notificación flotante */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-neurolink-matrixGreen text-neurolink-dark px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-orbitron">{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default NeuroAutoAgentLab; 