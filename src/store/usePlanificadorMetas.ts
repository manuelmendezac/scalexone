import { create } from 'zustand';

interface MicroMeta {
  id: number;
  texto: string;
  prioridad: 'alta' | 'media' | 'baja';
  fecha?: string;
  categoria?: string;
  completada: boolean;
}

interface PlanificadorMetasState {
  metaPrincipal: string;
  microMetas: MicroMeta[];
  progreso: number;
  xp: number;
  neurocoin: number;
  setMetaPrincipal: (meta: string) => void;
  addMicroMeta: (micro: Omit<MicroMeta, 'id'>) => void;
  setProgreso: (p: number) => void;
  setXP: (xp: number) => void;
  setNeurocoin: (n: number) => void;
  setMicroMetas: (arr: MicroMeta[]) => void;
}

export const usePlanificadorMetas = create<PlanificadorMetasState>((set, get) => ({
  metaPrincipal: '',
  microMetas: [],
  progreso: 0,
  xp: 0,
  neurocoin: 0,
  setMetaPrincipal: (meta) => set({ metaPrincipal: meta }),
  addMicroMeta: (micro) => set(state => ({ microMetas: [...state.microMetas, { ...micro, id: Date.now() }] })),
  setProgreso: (p) => set({ progreso: p }),
  setXP: (xp) => set({ xp }),
  setNeurocoin: (n) => set({ neurocoin: n }),
  setMicroMetas: (arr) => set({ microMetas: arr }),
})); 