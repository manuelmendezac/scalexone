import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import React from 'react';
import { supabase } from '../supabase';

export interface Message {
  id: string;
  text: string;
  from: 'user' | 'ai' | 'assistant';
  timestamp: Date;
}

interface Notification {
  id: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface CognitiveProfile {
  personalGoals: string;
  weeklyFocus: string;
  learningStyle: 'Visual' | 'Auditivo' | 'Kinestésico';
  peakProductivityTime: string;
  routinesToOptimize: string;
}

interface Knowledge {
  files: Array<{
    name: string;
    type: string;
    content: string;
    timestamp: Date;
  }>;
  notes: string;
  selectedProfile: string;
}

interface KnowledgeProfile {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  icon: string;
  subProfiles?: KnowledgeProfile[];
}

interface UserProfile {
  selectedProfiles: string[];
  customKnowledge: {
    id: string;
    name: string;
    type: 'pdf' | 'txt' | 'md';
    content: string;
  }[];
}

interface Task {
  id: string;
  title: string;
  duration: number;
  type: 'mental' | 'creativo' | 'técnico' | 'físico';
  completed: boolean;
  rescheduled: boolean;
}

interface DayRoutine {
  id: string;
  day: number;
  title: string;
  tasks: Task[];
}

interface WeeklyRoutine {
  id: string;
  weekNumber: number;
  startDate: Date;
  goal: string;
  hoursPerDay: number;
  intensity: 'intensivo' | 'equilibrado' | 'ligero';
  days: DayRoutine[];
  completed: boolean;
  reflection?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  resources: string[];
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md';
  content: string;
  category: string;
  uploadDate: string;
}

interface CustomKnowledge {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md';
  content: string;
}

interface Reflection {
  id: string;
  content: string;
  timestamp: Date;
}

interface IAModule {
  key: string;
  nombreAmigable: string;
  descripcion: string;
  instrucciones: string;
  icono?: string; // URL o nombre de icono
  progreso: number; // 0-100
  estado: 'pendiente' | 'activado' | 'completado';
}

interface Reward {
  id: string;
  type: 'achievement' | 'level' | 'streak' | 'special';
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  reward: {
    type: 'xp' | 'coins' | 'badge';
    amount: number;
  };
}

interface AccionCognitiva {
  modulo: string;
  accion: string;
  fecha: string;
}

interface NeuroState {
  userName: string;
  avatarUrl: string;
  messages: Message[];
  notifications: Notification[];
  cognitiveProfile: CognitiveProfile;
  knowledge: Knowledge;
  userInfo: {
    name: string;
    email: string;
    rol: string;
    community_id: string;
  };
  userProfile: UserProfile;
  reflections: Reflection[];
  knowledgeProfiles: KnowledgeProfile[];
  customKnowledge: CustomKnowledge[];
  isHydrated: boolean;
  showLeadForm: boolean;
  skills: Skill[];
  knowledgeSources: KnowledgeSource[];
  iaModules: Record<string, IAModule>;
  rewards: Reward[];
  userLevel: number;
  userXP: number;
  userCoins: number;
  historialCognitivo: AccionCognitiva[];
  registrarAccionCognitiva: (modulo: string, accion: string, fecha?: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setUserName: (name: string) => void;
  setAvatarUrl: (url: string) => void;
  updateCognitiveProfile: (profile: Partial<CognitiveProfile>) => void;
  updateKnowledge: (knowledge: Partial<Knowledge>) => void;
  addFile: (file: { name: string; type: string; content: string }) => void;
  updateUserInfo: (info: { name: string; email: string; rol?: string; community_id?: string }) => void;
  selectKnowledgeProfile: (profileId: string) => void;
  removeKnowledgeProfile: (profileId: string) => void;
  addCustomKnowledge: (knowledge: {
    name: string;
    type: 'pdf' | 'txt' | 'md';
    content: string;
  }) => void;
  removeCustomKnowledge: (knowledgeId: string) => void;
  weeklyRoutine: WeeklyRoutine | null;
  setWeeklyRoutine: (routine: WeeklyRoutine) => void;
  updateTaskStatus: (taskId: string, completed: boolean) => void;
  rescheduleTask: (taskId: string) => void;
  completeWeek: (reflection: string) => void;
  setShowLeadForm: (show: boolean) => void;
  addReflection: (reflection: Reflection) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (skillId: string) => void;
  updateSkillLevel: (skillId: string, level: Skill['level']) => void;
  addKnowledgeSource: (source: KnowledgeSource) => void;
  removeKnowledgeSource: (sourceId: string) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setNotifications: (notifications: Notification[] | ((prev: Notification[]) => Notification[])) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  setIAModuleProgress: (key: string, progreso: number) => void;
  setIAModuleState: (key: string, estado: 'pendiente' | 'activado' | 'completado') => void;
  resetIAModules: () => void;
  setHydrated: (state: boolean) => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  unlockReward: (rewardId: string) => void;
  updateRewardProgress: (rewardId: string, progress: number) => void;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
}

// Función para convertir las fechas de string a Date al cargar del localStorage
const parseDates = (state: any) => {
  if (state.messages) {
    state.messages = state.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  }
  return state;
};

// Función para limpiar el localStorage
const clearLocalStorage = () => {
  localStorage.removeItem('neurolink-storage');
};

const initialIAModules: Record<string, IAModule> = {
  realTimeMindSync: {
    key: 'realTimeMindSync',
    nombreAmigable: 'Sincronizador Mental',
    descripcion: 'Conecta ideas, tareas y pensamientos.',
    instrucciones: 'Conecta ideas y tareas en tiempo real con IA.',
    icono: '',
    progreso: 0,
    estado: 'pendiente',
  },
  neuroLinkMentor: {
    key: 'neuroLinkMentor',
    nombreAmigable: 'Guía de Decisiones IA',
    descripcion: 'Entrena a tu IA para tomar mejores decisiones.',
    instrucciones: 'Selecciona el tipo de consejos que deseas recibir.',
    icono: '',
    progreso: 0,
    estado: 'pendiente',
  },
  memoryCore: {
    key: 'memoryCore',
    nombreAmigable: 'Biblioteca de Conocimiento',
    descripcion: 'Almacena documentos clave y conocimientos.',
    instrucciones: 'Carga y gestiona tus documentos de conocimiento.',
    icono: '',
    progreso: 0,
    estado: 'pendiente',
  },
  visionPlanner: {
    key: 'visionPlanner',
    nombreAmigable: 'Mapa de Metas',
    descripcion: 'Diseña objetivos y estrategias.',
    instrucciones: 'Configura tus metas y visualiza tu progreso.',
    icono: '',
    progreso: 0,
    estado: 'pendiente',
  },
  focusMode: {
    key: 'focusMode',
    nombreAmigable: 'Cámara de Enfoque',
    descripcion: 'Espacio de enfoque profundo con IA.',
    instrucciones: 'Activa sesiones de enfoque y usa el temporizador.',
    icono: '',
    progreso: 0,
    estado: 'pendiente',
  },
  emotionTuner: {
    key: 'emotionTuner',
    nombreAmigable: 'Sensor Emocional',
    descripcion: 'Mejora tu estado emocional con IA.',
    instrucciones: 'Selecciona emociones y recibe sugerencias IA.',
    icono: '',
    progreso: 0,
    estado: 'pendiente',
  },
  expertMode: {
    key: 'expertMode',
    nombreAmigable: 'Clon Profesional',
    descripcion: 'Entrena tu IA para actuar como tú.',
    instrucciones: 'Elige tus temas principales y recibe un plan de estudio.',
    icono: '',
    progreso: 0,
    estado: 'pendiente',
  },
};

const useNeuroState = create<NeuroState>()(
  persist(
    (set, get) => ({
      userName: 'Invitado',
      avatarUrl: '',
      messages: [],
      notifications: [],
      cognitiveProfile: {
        personalGoals: '',
        weeklyFocus: '',
        learningStyle: 'Visual',
        peakProductivityTime: '',
        routinesToOptimize: ''
      },
      knowledge: {
        files: [],
        notes: '',
        selectedProfile: ''
      },
      userInfo: {
        name: '',
        email: '',
        rol: '',
        community_id: '',
      },
      userProfile: {
        selectedProfiles: [],
        customKnowledge: [],
      },
      reflections: [],
      knowledgeProfiles: [],
      customKnowledge: [],
      isHydrated: false,
      showLeadForm: true,
      skills: [],
      knowledgeSources: [],
      iaModules: initialIAModules,
      rewards: [],
      userLevel: 1,
      userXP: 0,
      userCoins: 0,
      historialCognitivo: [],
      registrarAccionCognitiva: async (modulo, accion, fecha) => {
        const now = fecha || new Date().toISOString();
        set(state => ({
          historialCognitivo: [
            ...state.historialCognitivo,
            { modulo, accion, fecha: now },
          ],
        }));
        // Guardar también en Supabase (tabla 'ClonKnowledge')
        const user_id = get().userInfo?.email || 'anon';
        await supabase.from('ClonKnowledge').insert([
          { user_id, modulo, accion, fecha: now }
        ]);
      },
      
      setHydrated: (state: boolean) => set({ isHydrated: state }),
      
      setMessages: (messages) => set((state) => ({
        messages: typeof messages === 'function' ? messages(state.messages) : messages
      })),
      
      setNotifications: (notifications) => set((state) => ({
        notifications: typeof notifications === 'function' ? notifications(state.notifications) : notifications
      })),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date()
        }]
      })),
      
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date()
        }]
      })),
      
      clearMessages: () => {
        clearLocalStorage();
        set((state) => ({
          messages: [{
            id: 'ai',
            text: 'Conversación reiniciada. ¿En qué puedo ayudarte?',
            from: 'assistant',
            timestamp: new Date()
          }]
        }));
      },
      
      setUserName: (name) => set({ userName: name }),
      
      setAvatarUrl: (url) => set({ avatarUrl: url }),

      updateCognitiveProfile: (profile) => set((state) => ({
        cognitiveProfile: { ...state.cognitiveProfile, ...profile }
      })),

      updateKnowledge: (knowledge) => set((state) => ({
        knowledge: { ...state.knowledge, ...knowledge }
      })),

      addFile: (file) => set((state) => ({
        knowledge: {
          ...state.knowledge,
          files: [...state.knowledge.files, { ...file, timestamp: new Date() }]
        }
      })),

      updateUserInfo: (info: { name: string; email: string; rol?: string; community_id?: string }) => set((state) => ({
        userInfo: {
          ...state.userInfo,
          ...info,
        }
      })),

      selectKnowledgeProfile: (profileId) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            selectedProfiles: [...state.userProfile.selectedProfiles, profileId],
          },
        })),

      removeKnowledgeProfile: (profileId) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            selectedProfiles: state.userProfile.selectedProfiles.filter(
              (id) => id !== profileId
            ),
          },
        })),

      addCustomKnowledge: (knowledge) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            customKnowledge: [
              ...state.userProfile.customKnowledge,
              { ...knowledge, id: Date.now().toString() },
            ],
          },
        })),

      removeCustomKnowledge: (knowledgeId) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            customKnowledge: state.userProfile.customKnowledge.filter(
              (k) => k.id !== knowledgeId
            ),
          },
        })),

      weeklyRoutine: null,
      
      setWeeklyRoutine: (routine) => set({ weeklyRoutine: routine }),
      
      updateTaskStatus: (taskId, completed) =>
        set((state) => {
          if (!state.weeklyRoutine) return state;
          
          const updatedDays = state.weeklyRoutine.days.map(day => ({
            ...day,
            tasks: day.tasks.map(task =>
              task.id === taskId ? { ...task, completed } : task
            )
          }));
          
          return {
            weeklyRoutine: {
              ...state.weeklyRoutine,
              days: updatedDays
            }
          };
        }),
      
      rescheduleTask: (taskId) =>
        set((state) => {
          if (!state.weeklyRoutine) return state;
          
          const updatedDays = state.weeklyRoutine.days.map(day => ({
            ...day,
            tasks: day.tasks.map(task =>
              task.id === taskId ? { ...task, rescheduled: true } : task
            )
          }));
          
          return {
            weeklyRoutine: {
              ...state.weeklyRoutine,
              days: updatedDays
            }
          };
        }),
      
      completeWeek: (reflection) =>
        set((state) => {
          if (!state.weeklyRoutine) return state;
          
          return {
            weeklyRoutine: {
              ...state.weeklyRoutine,
              completed: true,
              reflection
            }
          };
        }),

      setShowLeadForm: (show) => set({ showLeadForm: show }),

      addReflection: (reflection) => set((state) => ({
        reflections: [...state.reflections, { ...reflection, id: Date.now().toString() }],
      })),

      addSkill: (skill) => set((state) => ({ skills: [...state.skills, skill] })),

      removeSkill: (skillId) => set((state) => ({ skills: state.skills.filter(s => s.id !== skillId) })),

      updateSkillLevel: (skillId, level) => set((state) => ({
        skills: state.skills.map(skill => 
          skill.id === skillId ? { ...skill, level } : skill
        )
      })),

      addKnowledgeSource: (source) => set((state) => ({ 
        knowledgeSources: [...state.knowledgeSources, { ...source, id: Date.now().toString() }],
      })),

      removeKnowledgeSource: (sourceId) => set((state) => ({ 
        knowledgeSources: state.knowledgeSources.filter(s => s.id !== sourceId),
      })),

      setIAModuleProgress: (key, progreso) => {
        set((state) => ({
          iaModules: {
            ...state.iaModules,
            [key]: {
              ...state.iaModules[key],
              progreso,
              estado: progreso >= 100 ? 'completado' : (progreso > 0 ? 'activado' : 'pendiente'),
            },
          },
        }));
      },
      setIAModuleState: (key, estado) => {
        set((state) => ({
          iaModules: {
            ...state.iaModules,
            [key]: {
              ...state.iaModules[key],
              estado,
              progreso: estado === 'completado' ? 100 : state.iaModules[key].progreso,
            },
          },
        }));
      },
      resetIAModules: () => {
        set({ iaModules: initialIAModules });
      },
      addReward: (reward) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          rewards: [...state.rewards, { ...reward, id }]
        }));
      },
      unlockReward: (rewardId) => {
        set((state) => ({
          rewards: state.rewards.map((reward) =>
            reward.id === rewardId
              ? { ...reward, unlocked: true }
              : reward
          )
        }));
      },
      updateRewardProgress: (rewardId, progress) => {
        set((state) => ({
          rewards: state.rewards.map((reward) =>
            reward.id === rewardId
              ? { ...reward, progress }
              : reward
          )
        }));
      },
      addXP: (amount) => {
        set((state) => {
          const newXP = state.userXP + amount;
          const xpForNextLevel = state.userLevel * 1000;
          
          if (newXP >= xpForNextLevel) {
            return {
              userXP: newXP - xpForNextLevel,
              userLevel: state.userLevel + 1
            };
          }
          
          return { userXP: newXP };
        });
      },
      addCoins: (amount) => {
        set((state) => ({
          userCoins: state.userCoins + amount
        }));
      },
    }),
    {
      name: 'neurolink-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userName: state.userName,
        avatarUrl: state.avatarUrl,
        messages: state.messages,
        notifications: state.notifications,
        cognitiveProfile: state.cognitiveProfile,
        knowledge: state.knowledge,
        userInfo: state.userInfo,
        userProfile: state.userProfile,
        weeklyRoutine: state.weeklyRoutine,
        reflections: state.reflections,
        knowledgeProfiles: state.knowledgeProfiles,
        customKnowledge: state.customKnowledge,
        skills: state.skills,
        knowledgeSources: state.knowledgeSources,
        showLeadForm: state.showLeadForm,
        iaModules: state.iaModules,
        rewards: state.rewards,
        userLevel: state.userLevel,
        userXP: state.userXP,
        userCoins: state.userCoins,
        historialCognitivo: state.historialCognitivo,
      }),
      onRehydrateStorage: () => (state?: NeuroState) => {
        if (state) {
          parseDates(state);
          state.setHydrated(true);
        }
      },
      skipHydration: true
    }
  )
);

// Hook personalizado para manejar la hidratación inicial
export const useHydration = () => {
  const store = useNeuroState();
  const { isHydrated, setHydrated } = store;

  React.useEffect(() => {
    if (!isHydrated) {
      useNeuroState.persist.rehydrate();
      setHydrated(true);
    }
  }, [isHydrated, setHydrated]);

  return isHydrated;
};

export default useNeuroState; 