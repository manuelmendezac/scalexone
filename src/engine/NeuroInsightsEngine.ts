// Tipos de datos
interface Interaccion {
  id: string;
  tipo: 'chat' | 'archivo' | 'entrenamiento' | 'habito';
  contenido: string;
  timestamp: Date;
  categoria?: string;
  metadata?: Record<string, any>;
}

interface TareaRecomendada {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  categoria: string;
  razon: string;
}

interface Patron {
  tipo: 'habito' | 'tema' | 'comportamiento';
  descripcion: string;
  frecuencia: number;
  tendencia: 'aumentando' | 'estable' | 'disminuyendo';
  impacto: 'positivo' | 'neutral' | 'negativo';
}

// Datos de prueba
const INTERACCIONES_RECIENTES: Interaccion[] = [
  {
    id: '1',
    tipo: 'chat',
    contenido: '¿Cómo puedo mejorar mi productividad?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
    categoria: 'productividad'
  },
  {
    id: '2',
    tipo: 'archivo',
    contenido: 'plan_estrategico.pdf',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 horas atrás
    categoria: 'planificación'
  },
  {
    id: '3',
    tipo: 'entrenamiento',
    contenido: 'Módulo de gestión del tiempo',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 horas atrás
    categoria: 'desarrollo'
  }
];

const TAREAS_PREVIAS: TareaRecomendada[] = [
  {
    id: '1',
    titulo: 'Revisar métricas de productividad',
    descripcion: 'Analizar los datos de las últimas dos semanas',
    prioridad: 'alta',
    categoria: 'análisis',
    razon: 'Basado en tus objetivos de mejora'
  },
  {
    id: '2',
    titulo: 'Actualizar documentación del proyecto',
    descripcion: 'Completar la sección de arquitectura',
    prioridad: 'media',
    categoria: 'documentación',
    razon: 'Pendiente desde la última revisión'
  }
];

const PATRONES_DETECTADOS: Patron[] = [
  {
    tipo: 'habito',
    descripcion: 'Revisión matutina de tareas',
    frecuencia: 5,
    tendencia: 'estable',
    impacto: 'positivo'
  },
  {
    tipo: 'tema',
    descripcion: 'Consultas sobre productividad',
    frecuencia: 8,
    tendencia: 'aumentando',
    impacto: 'positivo'
  }
];

// Funciones principales
export const generarResumenDiario = (): string => {
  const hoy = new Date();
  const interaccionesHoy = INTERACCIONES_RECIENTES.filter(
    interaccion => interaccion.timestamp.toDateString() === hoy.toDateString()
  );

  const categorias = new Set(interaccionesHoy.map(i => i.categoria));
  const tipos = new Set(interaccionesHoy.map(i => i.tipo));

  const resumen = [
    `Hoy has interactuado ${interaccionesHoy.length} veces con tu IA.`,
    `Has trabajado en las categorías: ${Array.from(categorias).join(', ')}.`,
    `Tipos de interacción: ${Array.from(tipos).join(', ')}.`
  ].join(' ');

  return resumen;
};

export const recomendarTareasClaves = (): TareaRecomendada[] => {
  // Simular recomendaciones basadas en interacciones recientes
  const recomendaciones: TareaRecomendada[] = [
    {
      id: Date.now().toString(),
      titulo: 'Profundizar en técnicas de productividad',
      descripcion: 'Basado en tus consultas recientes, te sugiero explorar el método Pomodoro',
      prioridad: 'alta',
      categoria: 'desarrollo',
      razon: 'Frecuentes consultas sobre productividad'
    },
    {
      id: (Date.now() + 1).toString(),
      titulo: 'Revisar progreso del plan estratégico',
      descripcion: 'Actualizar el estado de los objetivos definidos',
      prioridad: 'media',
      categoria: 'planificación',
      razon: 'Archivo recientemente cargado'
    },
    {
      id: (Date.now() + 2).toString(),
      titulo: 'Completar módulo de gestión del tiempo',
      descripcion: 'Finalizar el entrenamiento iniciado',
      prioridad: 'alta',
      categoria: 'entrenamiento',
      razon: 'Módulo iniciado pero no completado'
    }
  ];

  return recomendaciones;
};

export const detectarPatrones = (): Patron[] => {
  // Simular detección de patrones basada en interacciones
  const nuevosPatrones: Patron[] = [
    ...PATRONES_DETECTADOS,
    {
      tipo: 'comportamiento',
      descripcion: 'Preferencia por sesiones matutinas',
      frecuencia: 7,
      tendencia: 'aumentando',
      impacto: 'positivo'
    }
  ];

  return nuevosPatrones;
};

// Funciones auxiliares
export const analizarTendencia = (patrones: Patron[]): string => {
  const tendencias = patrones.reduce((acc, patron) => {
    acc[patron.tendencia] = (acc[patron.tendencia] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tendenciaDominante = Object.entries(tendencias)
    .sort(([, a], [, b]) => b - a)[0][0];

  return `Tendencia dominante: ${tendenciaDominante}`;
};

export const calcularImpacto = (patrones: Patron[]): string => {
  const impactos = patrones.reduce((acc, patron) => {
    acc[patron.impacto] = (acc[patron.impacto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const impactoNeto = (impactos.positivo || 0) - (impactos.negativo || 0);
  return `Impacto neto: ${impactoNeto > 0 ? 'Positivo' : impactoNeto < 0 ? 'Negativo' : 'Neutral'}`;
};

// Exportar todo
export default {
  generarResumenDiario,
  recomendarTareasClaves,
  detectarPatrones,
  analizarTendencia,
  calcularImpacto
}; 