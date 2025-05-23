import { useState } from 'react';
import useNeuroState from '../store/useNeuroState';

interface RoutineForm {
  goal: string;
  hoursPerDay: number;
  intensity: 'intensivo' | 'equilibrado' | 'ligero';
}

const taskIcons = {
  mental: '🧠',
  creativo: '🎨',
  técnico: '⚡',
  físico: '💪'
};

const taskColors = {
  mental: 'blue',
  creativo: 'purple',
  técnico: 'cyan',
  físico: 'green'
};

const RoutineGenerator = () => {
  const { 
    weeklyRoutine, 
    setWeeklyRoutine, 
    updateTaskStatus, 
    rescheduleTask,
    completeWeek,
    userProfile 
  } = useNeuroState();

  const [formData, setFormData] = useState<RoutineForm>({
    goal: '',
    hoursPerDay: 4,
    intensity: 'equilibrado'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState('');

  const generateRoutine = async () => {
    setIsGenerating(true);
    
    // Simular generación de rutina
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newRoutine = {
      id: Date.now().toString(),
      weekNumber: 1,
      startDate: new Date(),
      goal: formData.goal,
      hoursPerDay: formData.hoursPerDay,
      intensity: formData.intensity,
      completed: false,
      days: [
        {
          id: 'day-1',
          day: 1,
          title: 'Día 1 – Preparación de entorno',
          tasks: [
            {
              id: 'task-1-1',
              title: 'Configurar espacio de trabajo',
              duration: 60,
              type: 'técnico',
              completed: false,
              rescheduled: false
            },
            {
              id: 'task-1-2',
              title: 'Revisar objetivos semanales',
              duration: 30,
              type: 'mental',
              completed: false,
              rescheduled: false
            }
          ]
        },
        {
          id: 'day-2',
          day: 2,
          title: 'Día 2 – Desarrollo inicial',
          tasks: [
            {
              id: 'task-2-1',
              title: 'Investigación de mercado',
              duration: 90,
              type: 'mental',
              completed: false,
              rescheduled: false
            },
            {
              id: 'task-2-2',
              title: 'Diseño de estrategia',
              duration: 60,
              type: 'creativo',
              completed: false,
              rescheduled: false
            }
          ]
        }
      ]
    };

    setWeeklyRoutine(newRoutine);
    setIsGenerating(false);
  };

  const handleTaskClick = (taskId: string) => {
    updateTaskStatus(taskId, true);
  };

  const handleReschedule = (taskId: string) => {
    rescheduleTask(taskId);
  };

  const handleCompleteWeek = () => {
    completeWeek(reflection);
    setShowReflection(false);
  };

  if (!weeklyRoutine) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-8">
          <h2 className="text-2xl font-futuristic text-neurolink-coldWhite mb-6">
            Generar Rutina Semanal
          </h2>
          
          <form className="space-y-6">
            <div>
              <label className="block text-neurolink-coldWhite mb-2">
                ¿Cuál es tu meta principal esta semana?
              </label>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full px-4 py-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-neurolink-coldWhite mb-2">
                ¿Cuántas horas puedes dedicar por día?
              </label>
              <input
                type="number"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData({ ...formData, hoursPerDay: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
                min={1}
                max={12}
                required
              />
            </div>

            <div>
              <label className="block text-neurolink-coldWhite mb-2">
                ¿Prefieres enfoque intensivo, equilibrado o ligero?
              </label>
              <select
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: e.target.value as 'intensivo' | 'equilibrado' | 'ligero' })}
                className="w-full px-4 py-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
              >
                <option value="intensivo">Intensivo</option>
                <option value="equilibrado">Equilibrado</option>
                <option value="ligero">Ligero</option>
              </select>
            </div>

            <button
              onClick={generateRoutine}
              disabled={isGenerating || !formData.goal}
              className="w-full px-6 py-3 bg-neurolink-cyberBlue bg-opacity-10 text-neurolink-coldWhite font-futuristic border-2 border-neurolink-cyberBlue rounded-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-neurolink-cyberBlue border-t-transparent rounded-full animate-spin"></div>
                  <span>IA evaluando prioridades...</span>
                </div>
              ) : (
                'Generar Rutina Óptima'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Rutina Semanal */}
      <div className="space-y-8">
        {weeklyRoutine.days.map((day) => (
          <div
            key={day.id}
            className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-6"
          >
            <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
              {day.title}
            </h3>
            
            <div className="space-y-4">
              {day.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 border-${taskColors[task.type]}-500/30 hover:border-${taskColors[task.type]}-500/60 transition-all duration-300 ${
                    task.completed ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{taskIcons[task.type]}</span>
                      <div>
                        <h4 className="text-neurolink-coldWhite font-futuristic">
                          {task.title}
                        </h4>
                        <p className="text-neurolink-coldWhite/60 text-sm">
                          Duración: {task.duration} minutos
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!task.completed && (
                        <>
                          <button
                            onClick={() => handleTaskClick(task.id)}
                            className="p-2 text-neurolink-coldWhite hover:text-neurolink-cyberBlue transition-colors"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleReschedule(task.id)}
                            className="p-2 text-neurolink-coldWhite hover:text-neurolink-cyberBlue transition-colors"
                          >
                            ↻
                          </button>
                        </>
                      )}
                      {task.completed && (
                        <span className="text-neurolink-cyberBlue">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botón de Reflexión Semanal */}
      {weeklyRoutine.days.every(day => 
        day.tasks.every(task => task.completed)
      ) && !weeklyRoutine.completed && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowReflection(true)}
            className="px-6 py-3 bg-neurolink-cyberBlue bg-opacity-10 text-neurolink-coldWhite font-futuristic border-2 border-neurolink-cyberBlue rounded-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
          >
            Reflexión Semanal
          </button>
        </div>
      )}

      {/* Modal de Reflexión */}
      {showReflection && (
        <div className="fixed inset-0 bg-neurolink-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-xl p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-futuristic text-neurolink-coldWhite mb-4">
              Reflexión Semanal
            </h3>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full px-4 py-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50 mb-4"
              rows={4}
              placeholder="¿Cómo te fue esta semana? ¿Qué aprendiste? ¿Qué mejorarías?"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowReflection(false)}
                className="px-4 py-2 text-neurolink-coldWhite hover:text-neurolink-cyberBlue transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompleteWeek}
                className="px-6 py-2 bg-neurolink-cyberBlue bg-opacity-10 text-neurolink-coldWhite font-futuristic border-2 border-neurolink-cyberBlue rounded-lg hover:bg-opacity-20 transition-all duration-300"
              >
                Completar Semana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineGenerator; 