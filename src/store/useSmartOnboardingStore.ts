import { create } from 'zustand';

interface SmartOnboardingState {
  name: string;
  style: string;
  knowledge: string;
  knowledgeDoc?: string;
  role: string;
  setName: (name: string) => void;
  setStyle: (style: string) => void;
  setKnowledge: (knowledge: string) => void;
  setKnowledgeDoc: (doc: string) => void;
  setRole: (role: string) => void;
}

const useSmartOnboardingStore = create<SmartOnboardingState>((set) => ({
  name: '',
  style: '',
  knowledge: '',
  knowledgeDoc: undefined,
  role: '',
  setName: (name) => set({ name }),
  setStyle: (style) => set({ style }),
  setKnowledge: (knowledge) => set({ knowledge }),
  setKnowledgeDoc: (doc) => set({ knowledgeDoc: doc }),
  setRole: (role) => set({ role }),
}));

export default useSmartOnboardingStore; 