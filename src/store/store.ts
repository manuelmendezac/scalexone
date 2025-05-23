import { create } from 'zustand';

interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  progreso: number;
  estado: 'pendiente' | 'procesando' | 'completado' | 'error';
  temas: string[];
  palabrasClave: string[];
  esFavorito: boolean;
  esBasePerfil: boolean;
  fechaCarga: Date;
}

interface SesionEntrenamiento {
  id: string;
  titulo: string;
  nivel: 'Inicial' | 'Intermedio' | 'Experto';
  estado: 'pendiente' | 'en_progreso' | 'completada';
  progreso: number;
  bloques: {
    id: string;
    tipo: 'reflexion' | 'simulacion' | 'analisis';
    contenido: string;
    completado: boolean;
  }[];
  fechaInicio?: Date;
  fechaCompletado?: Date;
}

interface NodoSinapsis {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'idea' | 'concepto' | 'recuerdo' | 'aprendizaje';
  importancia: 'bajo' | 'medio' | 'alto';
  fuente?: {
    tipo: 'documento' | 'entrenamiento' | 'interaccion';
    id: string;
    nombre: string;
  };
  posicion: {
    x: number;
    y: number;
  };
  color: string;
}

interface ConexionSinapsis {
  id: string;
  origen: string;
  destino: string;
  fuerza: number;
  tipo: 'directa' | 'indirecta';
}

interface Logro {
  id: string;
  titulo: string;
  descripcion: string;
  icono: string;
  nivel: number;
  desbloqueado: boolean;
  fechaDesbloqueo?: Date;
}

interface ProgresoEntrenamiento {
  nivel: number;
  experiencia: number;
  experienciaNecesaria: number;
  logros: Logro[];
  sesionesCompletadas: number;
  tiempoTotalEntrenamiento: number;
  ultimaSesion?: Date;
}

interface BloqueEntrenamiento {
  id: string;
  tipo: 'resumen' | 'razonamiento' | 'simulacion' | 'recordatorio';
  contenido: string;
  opciones?: {
    id: string;
    texto: string;
    esCorrecta: boolean;
    explicacion: string;
  }[];
  completado: boolean;
  puntuacion?: number;
  feedback?: string;
}

interface SesionEntrenamientoPro {
  id: string;
  titulo: string;
  nivel: number;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  progreso: number;
  bloques: BloqueEntrenamiento[];
  fechaInicio?: Date;
  fechaCompletado?: Date;
  puntuacionTotal: number;
  tiempoCompletado?: number;
}

interface WidgetConfig {
  color: string;
  mensajeBienvenida: string;
  nombreClon: string;
  modo: 'claro' | 'oscuro';
  posicion: 'inferior-derecha' | 'inferior-izquierda' | 'superior-derecha' | 'superior-izquierda';
  activado: boolean;
}

interface MensajeWidget {
  id: string;
  contenido: string;
  tipo: 'usuario' | 'ia';
  timestamp: Date;
  estado: 'enviando' | 'enviado' | 'error';
}

interface ConfiguracionClon {
  tono: 'empatico' | 'profesional' | 'creativo' | 'directo';
  formalidad: 'casual' | 'neutro' | 'formal';
  personalidad: 'optimista' | 'estrategico' | 'analitico' | 'inspirador';
  objetivo: 'acompanar' | 'entrenar' | 'motivar' | 'resolver' | 'recordar';
  prioridades: {
    productividad: boolean;
    creatividad: boolean;
    bienestar: boolean;
    aprendizaje: boolean;
  };
}

interface ReflexionDiaria {
  id: string;
  fecha: Date;
  recapitulacion: {
    temasConversados: string[];
    temasRepetitivos: string[];
    enfoqueEnergia: string;
  };
  insights: {
    consejo: string;
    microreto: string;
    recordatorio: string;
  };
}

interface Habito {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: 'salud' | 'productividad' | 'aprendizaje' | 'emocional';
  frecuencia: 'diario' | 'semanal' | 'personalizado';
  diasPersonalizados?: string[];
  fechaInicio: Date;
  completado: {
    fecha: Date;
    completado: boolean;
  }[];
  diasConsecutivos: number;
  tiempoTotal: number; // en minutos
  prioridad: number;
  sugeridoPorIA: boolean;
}

interface Prompt {
  id: string;
  titulo: string;
  contenido: string;
  descripcion: string;
  categoria: 'negocios' | 'productividad' | 'salud' | 'creatividad' | 'ventas' | 'otro';
  etiquetas: string[];
  fechaCreacion: Date;
  fechaModificacion: Date;
  vecesUsado: number;
  esFavorito: boolean;
  formato: 'texto' | 'json' | 'embed';
  compartido: boolean;
  enlaceCompartido?: string;
  qrCode?: string;
}

interface APIConnection {
  id: string;
  nombre: string;
  url: string;
  tipo: 'REST' | 'GraphQL';
  metodo: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  estado: 'activa' | 'inactiva' | 'error';
  ultimoAcceso?: Date;
  autorizadaParaClon: boolean;
  instruccionesInterpretacion: string;
}

interface UserState {
  userName: string;
  activeProfile: string;
  knowledgeBase: Documento[];
  sesionesEntrenamiento: SesionEntrenamiento[];
  nodosSinapsis: NodoSinapsis[];
  conexionesSinapsis: ConexionSinapsis[];
  progresoEntrenamiento: ProgresoEntrenamiento;
  sesionesEntrenamientoPro: SesionEntrenamientoPro[];
  widgetConfig: WidgetConfig;
  mensajesWidget: MensajeWidget[];
  configuracionClon: ConfiguracionClon;
  reflexionesDiarias: ReflexionDiaria[];
  habitos: Habito[];
  prompts: Prompt[];
  apiConnections: APIConnection[];
  setUserName: (name: string) => void;
  setActiveProfile: (profile: string) => void;
  agregarDocumento: (doc: Documento) => void;
  eliminarDocumento: (id: string) => void;
  actualizarDocumento: (id: string, updates: Partial<Documento>) => void;
  resetearBaseConocimiento: () => void;
  agregarSesionEntrenamiento: (sesion: SesionEntrenamiento) => void;
  actualizarSesionEntrenamiento: (id: string, updates: Partial<SesionEntrenamiento>) => void;
  eliminarSesionEntrenamiento: (id: string) => void;
  agregarNodoSinapsis: (nodo: NodoSinapsis) => void;
  actualizarNodoSinapsis: (id: string, updates: Partial<NodoSinapsis>) => void;
  eliminarNodoSinapsis: (id: string) => void;
  agregarConexionSinapsis: (conexion: ConexionSinapsis) => void;
  eliminarConexionSinapsis: (id: string) => void;
  setProgresoEntrenamiento: (progreso: Partial<ProgresoEntrenamiento>) => void;
  agregarSesionEntrenamientoPro: (sesion: SesionEntrenamientoPro) => void;
  actualizarSesionEntrenamientoPro: (id: string, updates: Partial<SesionEntrenamientoPro>) => void;
  eliminarSesionEntrenamientoPro: (id: string) => void;
  desbloquearLogro: (id: string) => void;
  ganarExperiencia: (cantidad: number) => void;
  setWidgetConfig: (config: Partial<WidgetConfig>) => void;
  agregarMensajeWidget: (mensaje: Omit<MensajeWidget, 'id' | 'timestamp'>) => void;
  actualizarMensajeWidget: (id: string, updates: Partial<MensajeWidget>) => void;
  eliminarMensajeWidget: (id: string) => void;
  setConfiguracionClon: (config: Partial<ConfiguracionClon>) => void;
  agregarReflexionDiaria: (reflexion: Omit<ReflexionDiaria, 'id'>) => void;
  obtenerReflexionPorFecha: (fecha: Date) => ReflexionDiaria | undefined;
  agregarHabito: (habito: Omit<Habito, 'id' | 'completado' | 'diasConsecutivos' | 'tiempoTotal'>) => void;
  actualizarHabito: (id: string, updates: Partial<Habito>) => void;
  eliminarHabito: (id: string) => void;
  marcarHabitoCompletado: (id: string, fecha: Date, completado: boolean) => void;
  obtenerHabitossugeridos: () => Habito[];
  agregarPrompt: (prompt: Omit<Prompt, 'id' | 'fechaCreacion' | 'fechaModificacion' | 'vecesUsado' | 'esFavorito' | 'compartido'>) => void;
  actualizarPrompt: (id: string, updates: Partial<Prompt>) => void;
  eliminarPrompt: (id: string) => void;
  duplicarPrompt: (id: string) => void;
  marcarFavorito: (id: string) => void;
  compartirPrompt: (id: string) => void;
  obtenerPromptsPorCategoria: (categoria: Prompt['categoria']) => Prompt[];
  obtenerPromptsPorEtiqueta: (etiqueta: string) => Prompt[];
  agregarAPIConnection: (conexion: Omit<APIConnection, 'id' | 'estado' | 'ultimoAcceso'>) => void;
  actualizarAPIConnection: (id: string, updates: Partial<APIConnection>) => void;
  eliminarAPIConnection: (id: string) => void;
  probarAPIConnection: (id: string) => Promise<boolean>;
}

export const useStore = create<UserState>((set, get) => ({
  userName: 'Usuario',
  activeProfile: 'Default',
  knowledgeBase: [],
  sesionesEntrenamiento: [],
  nodosSinapsis: [],
  conexionesSinapsis: [],
  progresoEntrenamiento: {
    nivel: 1,
    experiencia: 0,
    experienciaNecesaria: 1000,
    logros: [],
    sesionesCompletadas: 0,
    tiempoTotalEntrenamiento: 0
  },
  sesionesEntrenamientoPro: [],
  widgetConfig: {
    color: '#00ff9d',
    mensajeBienvenida: '¡Hola! Soy tu asistente neurocognitivo. ¿En qué puedo ayudarte?',
    nombreClon: 'NeuroAsistente',
    modo: 'oscuro',
    posicion: 'inferior-derecha',
    activado: true
  },
  mensajesWidget: [],
  configuracionClon: {
    tono: 'empatico',
    formalidad: 'neutro',
    personalidad: 'optimista',
    objetivo: 'acompanar',
    prioridades: {
      productividad: true,
      creatividad: true,
      bienestar: true,
      aprendizaje: true
    }
  },
  reflexionesDiarias: [],
  habitos: [],
  prompts: [],
  apiConnections: [],
  setUserName: (name) => set({ userName: name }),
  setActiveProfile: (profile) => set({ activeProfile: profile }),
  agregarDocumento: (doc) => set((state) => ({
    knowledgeBase: [...state.knowledgeBase, doc]
  })),
  eliminarDocumento: (id) => set((state) => ({
    knowledgeBase: state.knowledgeBase.filter(doc => doc.id !== id)
  })),
  actualizarDocumento: (id, updates) => set((state) => ({
    knowledgeBase: state.knowledgeBase.map(doc =>
      doc.id === id ? { ...doc, ...updates } : doc
    )
  })),
  resetearBaseConocimiento: () => set({ knowledgeBase: [] }),
  agregarSesionEntrenamiento: (sesion) => set((state) => ({
    sesionesEntrenamiento: [...state.sesionesEntrenamiento, sesion]
  })),
  actualizarSesionEntrenamiento: (id, updates) => set((state) => ({
    sesionesEntrenamiento: state.sesionesEntrenamiento.map(sesion =>
      sesion.id === id ? { ...sesion, ...updates } : sesion
    )
  })),
  eliminarSesionEntrenamiento: (id) => set((state) => ({
    sesionesEntrenamiento: state.sesionesEntrenamiento.filter(sesion => sesion.id !== id)
  })),
  agregarNodoSinapsis: (nodo) => set((state) => ({
    nodosSinapsis: [...state.nodosSinapsis, nodo]
  })),
  actualizarNodoSinapsis: (id, updates) => set((state) => ({
    nodosSinapsis: state.nodosSinapsis.map(nodo =>
      nodo.id === id ? { ...nodo, ...updates } : nodo
    )
  })),
  eliminarNodoSinapsis: (id) => set((state) => ({
    nodosSinapsis: state.nodosSinapsis.filter(nodo => nodo.id !== id)
  })),
  agregarConexionSinapsis: (conexion) => set((state) => ({
    conexionesSinapsis: [...state.conexionesSinapsis, conexion]
  })),
  eliminarConexionSinapsis: (id) => set((state) => ({
    conexionesSinapsis: state.conexionesSinapsis.filter(conexion => conexion.id !== id)
  })),
  setProgresoEntrenamiento: (progreso) => set((state) => ({
    progresoEntrenamiento: { ...state.progresoEntrenamiento, ...progreso }
  })),
  agregarSesionEntrenamientoPro: (sesion) => set((state) => ({
    sesionesEntrenamientoPro: [...state.sesionesEntrenamientoPro, sesion]
  })),
  actualizarSesionEntrenamientoPro: (id, updates) => set((state) => ({
    sesionesEntrenamientoPro: state.sesionesEntrenamientoPro.map(sesion =>
      sesion.id === id ? { ...sesion, ...updates } : sesion
    )
  })),
  eliminarSesionEntrenamientoPro: (id) => set((state) => ({
    sesionesEntrenamientoPro: state.sesionesEntrenamientoPro.filter(sesion => sesion.id !== id)
  })),
  desbloquearLogro: (id) => set((state) => ({
    progresoEntrenamiento: {
      ...state.progresoEntrenamiento,
      logros: state.progresoEntrenamiento.logros.map(logro =>
        logro.id === id ? { ...logro, desbloqueado: true, fechaDesbloqueo: new Date() } : logro
      )
    }
  })),
  ganarExperiencia: (cantidad) => set((state) => {
    const nuevaExperiencia = state.progresoEntrenamiento.experiencia + cantidad;
    const experienciaNecesaria = state.progresoEntrenamiento.experienciaNecesaria;
    const subioNivel = nuevaExperiencia >= experienciaNecesaria;

    return {
      progresoEntrenamiento: {
        ...state.progresoEntrenamiento,
        experiencia: subioNivel ? nuevaExperiencia - experienciaNecesaria : nuevaExperiencia,
        nivel: subioNivel ? state.progresoEntrenamiento.nivel + 1 : state.progresoEntrenamiento.nivel,
        experienciaNecesaria: subioNivel ? experienciaNecesaria * 1.5 : experienciaNecesaria
      }
    };
  }),
  setWidgetConfig: (config) => set((state) => ({
    widgetConfig: { ...state.widgetConfig, ...config }
  })),
  agregarMensajeWidget: (mensaje) => set((state) => ({
    mensajesWidget: [...state.mensajesWidget, {
      ...mensaje,
      id: Date.now().toString(),
      timestamp: new Date()
    }]
  })),
  actualizarMensajeWidget: (id, updates) => set((state) => ({
    mensajesWidget: state.mensajesWidget.map(mensaje =>
      mensaje.id === id ? { ...mensaje, ...updates } : mensaje
    )
  })),
  eliminarMensajeWidget: (id) => set((state) => ({
    mensajesWidget: state.mensajesWidget.filter(mensaje => mensaje.id !== id)
  })),
  setConfiguracionClon: (config) => set((state) => ({
    configuracionClon: { ...state.configuracionClon, ...config }
  })),
  agregarReflexionDiaria: (reflexion) => set((state) => ({
    reflexionesDiarias: [...state.reflexionesDiarias, {
      ...reflexion,
      id: Date.now().toString()
    }]
  })),
  obtenerReflexionPorFecha: (fecha) => {
    const state = get();
    return state.reflexionesDiarias.find(r => 
      r.fecha.toDateString() === fecha.toDateString()
    );
  },
  agregarHabito: (habito) => set((state) => ({
    habitos: [...state.habitos, {
      ...habito,
      id: Date.now().toString(),
      completado: [],
      diasConsecutivos: 0,
      tiempoTotal: 0
    }]
  })),
  actualizarHabito: (id, updates) => set((state) => ({
    habitos: state.habitos.map(habito =>
      habito.id === id ? { ...habito, ...updates } : habito
    )
  })),
  eliminarHabito: (id) => set((state) => ({
    habitos: state.habitos.filter(habito => habito.id !== id)
  })),
  marcarHabitoCompletado: (id, fecha, completado) => set((state) => {
    const habito = state.habitos.find(h => h.id === id);
    if (!habito) return state;

    const nuevoCompletado = [...habito.completado, { fecha, completado }];
    const diasConsecutivos = calcularDiasConsecutivos(nuevoCompletado);
    const tiempoTotal = habito.tiempoTotal + (completado ? 15 : 0); // 15 minutos por hábito completado

    return {
      habitos: state.habitos.map(h =>
        h.id === id
          ? { ...h, completado: nuevoCompletado, diasConsecutivos, tiempoTotal }
          : h
      )
    };
  }),
  obtenerHabitossugeridos: () => {
    const state = get();
    return state.habitos.filter(h => h.sugeridoPorIA);
  },
  agregarPrompt: (prompt) => set((state) => ({
    prompts: [...state.prompts, {
      ...prompt,
      id: Date.now().toString(),
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      vecesUsado: 0,
      esFavorito: false,
      compartido: false
    }]
  })),
  actualizarPrompt: (id, updates) => set((state) => ({
    prompts: state.prompts.map(prompt =>
      prompt.id === id
        ? { ...prompt, ...updates, fechaModificacion: new Date() }
        : prompt
    )
  })),
  eliminarPrompt: (id) => set((state) => ({
    prompts: state.prompts.filter(prompt => prompt.id !== id)
  })),
  duplicarPrompt: (id) => set((state) => {
    const promptOriginal = state.prompts.find(p => p.id === id);
    if (!promptOriginal) return state;

    const nuevoPrompt = {
      ...promptOriginal,
      id: Date.now().toString(),
      titulo: `${promptOriginal.titulo} (copia)`,
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      vecesUsado: 0,
      esFavorito: false,
      compartido: false
    };

    return {
      prompts: [...state.prompts, nuevoPrompt]
    };
  }),
  marcarFavorito: (id) => set((state) => ({
    prompts: state.prompts.map(prompt =>
      prompt.id === id
        ? { ...prompt, esFavorito: !prompt.esFavorito }
        : prompt
    )
  })),
  compartirPrompt: (id) => set((state) => {
    const prompt = state.prompts.find(p => p.id === id);
    if (!prompt) return state;

    const enlaceCompartido = `${window.location.origin}/prompt/${id}`;
    // Aquí se podría generar el QR code usando una librería

    return {
      prompts: state.prompts.map(p =>
        p.id === id
          ? { ...p, compartido: true, enlaceCompartido }
          : p
      )
    };
  }),
  obtenerPromptsPorCategoria: (categoria) => {
    const state = get();
    return state.prompts.filter(p => p.categoria === categoria);
  },
  obtenerPromptsPorEtiqueta: (etiqueta) => {
    const state = get();
    return state.prompts.filter(p => p.etiquetas.includes(etiqueta));
  },
  agregarAPIConnection: (conexion) => set((state) => ({
    apiConnections: [...state.apiConnections, {
      ...conexion,
      id: Date.now().toString(),
      estado: 'inactiva',
      ultimoAcceso: new Date()
    }]
  })),
  actualizarAPIConnection: (id, updates) => set((state) => ({
    apiConnections: state.apiConnections.map(conexion =>
      conexion.id === id ? { ...conexion, ...updates } : conexion
    )
  })),
  eliminarAPIConnection: (id) => set((state) => ({
    apiConnections: state.apiConnections.filter(conexion => conexion.id !== id)
  })),
  probarAPIConnection: async (id) => {
    const state = get();
    const conexion = state.apiConnections.find(c => c.id === id);
    if (!conexion) return false;

    try {
      // Aquí se implementaría la lógica real de prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 1500));
      set((state) => ({
        apiConnections: state.apiConnections.map(c =>
          c.id === id ? { ...c, estado: 'activa', ultimoAcceso: new Date() } : c
        )
      }));
      return true;
    } catch (error) {
      set((state) => ({
        apiConnections: state.apiConnections.map(c =>
          c.id === id ? { ...c, estado: 'error' } : c
        )
      }));
      return false;
    }
  }
}));

// Función auxiliar para calcular días consecutivos
const calcularDiasConsecutivos = (completado: { fecha: Date; completado: boolean }[]) => {
  const diasCompletados = completado
    .filter(c => c.completado)
    .map(c => c.fecha.toDateString())
    .sort();

  let maxConsecutivos = 0;
  let consecutivosActuales = 0;

  for (let i = 0; i < diasCompletados.length; i++) {
    const fechaActual = new Date(diasCompletados[i]);
    const fechaAnterior = i > 0 ? new Date(diasCompletados[i - 1]) : null;

    if (!fechaAnterior || 
        (fechaActual.getTime() - fechaAnterior.getTime()) === 86400000) {
      consecutivosActuales++;
      maxConsecutivos = Math.max(maxConsecutivos, consecutivosActuales);
    } else {
      consecutivosActuales = 1;
    }
  }

  return maxConsecutivos;
}; 