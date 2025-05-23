import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Search,
  Save,
  Download,
  History,
  Sparkles,
  Target,
  Lightbulb,
  BarChart2,
  ArrowRight,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

interface Experimento {
  id: string;
  pregunta: string;
  enfoque: string;
  respuesta: string;
  fecha: Date;
  esInsight: boolean;
  estructura: 'bullet' | 'matriz' | 'decision';
}

interface Enfoque {
  id: string;
  nombre: string;
  icono: React.ReactNode;
  color: string;
  descripcion: string;
}

const ENFOQUES: Enfoque[] = [
  {
    id: 'estrategia',
    nombre: 'Estrategia',
    icono: <Target className="w-5 h-5" />,
    color: 'text-neurolink-cyberBlue',
    descripcion: 'Análisis estratégico y planificación'
  },
  {
    id: 'analisis',
    nombre: 'Análisis Profundo',
    icono: <BarChart2 className="w-5 h-5" />,
    color: 'text-neurolink-cyberGreen',
    descripcion: 'Exploración detallada y patrones'
  },
  {
    id: 'creativo',
    nombre: 'Ideas Creativas',
    icono: <Lightbulb className="w-5 h-5" />,
    color: 'text-neurolink-cyberYellow',
    descripcion: 'Pensamiento divergente e innovación'
  },
  {
    id: 'decision',
    nombre: 'Decisiones',
    icono: <Sparkles className="w-5 h-5" />,
    color: 'text-neurolink-cyberPurple',
    descripcion: 'Evaluación y toma de decisiones'
  }
];

const MindSyncLab = () => {
  const [pregunta, setPregunta] = useState('');
  const [enfoqueSeleccionado, setEnfoqueSeleccionado] = useState<string>('');
  const [experimentos, setExperimentos] = useState<Experimento[]>([]);
  const [experimentoActual, setExperimentoActual] = useState<Experimento | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize del textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [pregunta]);

  const procesarPregunta = async () => {
    if (!pregunta.trim() || !enfoqueSeleccionado) return;

    setProcesando(true);
    const enfoque = ENFOQUES.find(e => e.id === enfoqueSeleccionado);

    // Simulación de procesamiento
    setTimeout(() => {
      const nuevoExperimento: Experimento = {
        id: Date.now().toString(),
        pregunta,
        enfoque: enfoqueSeleccionado,
        respuesta: generarRespuestaSimulada(pregunta, enfoqueSeleccionado),
        fecha: new Date(),
        esInsight: false,
        estructura: determinarEstructura(enfoqueSeleccionado)
      };

      setExperimentos(prev => [nuevoExperimento, ...prev]);
      setExperimentoActual(nuevoExperimento);
      setProcesando(false);
      setPregunta('');
    }, 2000);
  };

  const generarRespuestaSimulada = (pregunta: string, enfoque: string): string => {
    // Aquí iría la lógica real de IA
    const respuestas: Record<string, string[]> = {
      estrategia: [
        `1. Análisis de Mercado
         • Identificar segmentos objetivo
         • Evaluar competencia
         • Analizar tendencias

         2. Plan de Acción
         • Establecer objetivos SMART
         • Definir métricas clave
         • Crear roadmap de implementación`,
        `Estrategia de Crecimiento:
         [ ] Validación de mercado
         [ ] MVP inicial
         [ ] Escalabilidad
         [ ] Optimización`
      ],
      analisis: [
        `Patrones Identificados:
         • Correlación entre X e Y
         • Tendencias emergentes
         • Puntos de mejora

         Métricas Clave:
         • KPIs principales
         • Indicadores de éxito
         • Umbrales críticos`
      ],
      creativo: [
        `Ideas Innovadoras:
         • Concepto A: [Descripción]
         • Concepto B: [Descripción]
         • Concepto C: [Descripción]

         Oportunidades:
         • Mercado emergente
         • Necesidad no cubierta
         • Ventaja competitiva`
      ],
      decision: [
        `Matriz de Decisión:
         Opción A | Opción B | Opción C
         Pros     | Pros     | Pros
         Contras  | Contras  | Contras

         Recomendación:
         • Análisis de riesgos
         • Impacto esperado
         • Próximos pasos`
      ]
    };

    return respuestas[enfoque][Math.floor(Math.random() * respuestas[enfoque].length)];
  };

  const determinarEstructura = (enfoque: string): 'bullet' | 'matriz' | 'decision' => {
    switch (enfoque) {
      case 'estrategia': return 'bullet';
      case 'analisis': return 'matriz';
      case 'creativo': return 'bullet';
      case 'decision': return 'decision';
      default: return 'bullet';
    }
  };

  const marcarComoInsight = (id: string) => {
    setExperimentos(prev =>
      prev.map(exp =>
        exp.id === id ? { ...exp, esInsight: !exp.esInsight } : exp
      )
    );
  };

  const exportarInsights = () => {
    const insights = experimentos.filter(exp => exp.esInsight);
    const contenido = insights.map(insight => `
      Pregunta: ${insight.pregunta}
      Enfoque: ${ENFOQUES.find(e => e.id === insight.enfoque)?.nombre}
      Fecha: ${insight.fecha.toLocaleDateString()}
      
      ${insight.respuesta}
      
      ---
    `).join('\n');

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insights-neurolink.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const experimentosFiltrados = busqueda
    ? experimentos.filter(exp =>
        exp.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
        exp.respuesta.toLowerCase().includes(busqueda.toLowerCase())
      )
    : experimentos;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
            Laboratorio Mental
          </h2>
          <p className="text-neurolink-coldWhite/70">
            Explora ideas y toma decisiones con IA
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMostrarHistorial(true)}
            className="px-4 py-2 rounded-lg bg-neurolink-cyberBlue/20 
              text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
              transition-colors flex items-center gap-2"
          >
            <History className="w-5 h-5" />
            <span>Historial</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportarInsights}
            className="px-4 py-2 rounded-lg bg-neurolink-cyberGreen/20 
              text-neurolink-cyberGreen hover:bg-neurolink-cyberGreen/30 
              transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>Exportar Insights</span>
          </motion.button>
        </div>
      </div>

      {/* Área Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Entrada */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-neurolink-background/50 rounded-xl border border-neurolink-cyberBlue/30 p-4">
            <textarea
              ref={textareaRef}
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              placeholder="¿Qué quieres explorar? Por ejemplo: '¿Cómo escalaría mi negocio de coaching?'"
              className="w-full bg-transparent text-neurolink-coldWhite placeholder-neurolink-coldWhite/50 
                resize-none focus:outline-none min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ENFOQUES.map(enfoque => (
              <motion.button
                key={enfoque.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEnfoqueSeleccionado(enfoque.id)}
                className={`p-4 rounded-xl border transition-colors flex flex-col items-center gap-2
                  ${enfoqueSeleccionado === enfoque.id
                    ? 'bg-neurolink-cyberBlue/20 border-neurolink-cyberBlue/50'
                    : 'bg-neurolink-background/50 border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/50'
                  }`}
              >
                <div className={`p-2 rounded-lg ${enfoque.color}`}>
                  {enfoque.icono}
                </div>
                <span className="text-neurolink-coldWhite text-sm">
                  {enfoque.nombre}
                </span>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={procesarPregunta}
            disabled={!pregunta.trim() || !enfoqueSeleccionado || procesando}
            className="w-full py-3 rounded-xl bg-neurolink-cyberBlue/20 
              text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
              transition-colors flex items-center justify-center gap-2 
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {procesando ? (
              <>
                <div className="w-5 h-5 border-2 border-neurolink-cyberBlue border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Explorar con IA</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Panel de Resultados */}
        <div className="bg-neurolink-background/50 rounded-xl border border-neurolink-cyberBlue/30 p-4">
          <h3 className="font-orbitron text-neurolink-coldWhite mb-4">
            Resultados
          </h3>
          {experimentoActual ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-neurolink-background/50">
                <p className="text-neurolink-coldWhite/70 text-sm">
                  {experimentoActual.pregunta}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-neurolink-background/50">
                <pre className="text-neurolink-coldWhite whitespace-pre-wrap font-mono text-sm">
                  {experimentoActual.respuesta}
                </pre>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => marcarComoInsight(experimentoActual.id)}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2
                  ${experimentoActual.esInsight
                    ? 'bg-neurolink-cyberGreen/20 text-neurolink-cyberGreen'
                    : 'bg-neurolink-background/50 text-neurolink-coldWhite'
                  }`}
              >
                {experimentoActual.esInsight ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Guardado como Insight</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar como Insight</span>
                  </>
                )}
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-neurolink-coldWhite/50">
              <Brain className="w-12 h-12 mb-2" />
              <p>Realiza una pregunta para comenzar</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Historial */}
      <AnimatePresence>
        {mostrarHistorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neurolink-background rounded-xl border border-neurolink-cyberBlue/30 
                p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron text-neurolink-coldWhite">
                  Historial de Experimentos
                </h3>
                <button
                  onClick={() => setMostrarHistorial(false)}
                  className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20 
                    text-neurolink-coldWhite/70 hover:text-neurolink-coldWhite"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neurolink-coldWhite/50" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar en experimentos..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-neurolink-background/50 
                      border border-neurolink-cyberBlue/30 text-neurolink-coldWhite 
                      placeholder-neurolink-coldWhite/50 focus:outline-none 
                      focus:border-neurolink-cyberBlue"
                  />
                </div>
              </div>

              <div className="overflow-y-auto space-y-4">
                {experimentosFiltrados.map(experimento => (
                  <motion.div
                    key={experimento.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neurolink-background/50 rounded-xl border border-neurolink-cyberBlue/30 
                      p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${
                          ENFOQUES.find(e => e.id === experimento.enfoque)?.color
                        }`}>
                          {ENFOQUES.find(e => e.id === experimento.enfoque)?.icono}
                        </div>
                        <div>
                          <h4 className="font-orbitron text-neurolink-coldWhite">
                            {experimento.pregunta}
                          </h4>
                          <p className="text-sm text-neurolink-coldWhite/70">
                            {ENFOQUES.find(e => e.id === experimento.enfoque)?.nombre} • 
                            {experimento.fecha.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {experimento.esInsight && (
                        <span className="px-2 py-1 rounded-full text-xs bg-neurolink-cyberGreen/20 
                          text-neurolink-cyberGreen">
                          Insight
                        </span>
                      )}
                    </div>
                    <pre className="text-neurolink-coldWhite/70 whitespace-pre-wrap font-mono text-sm">
                      {experimento.respuesta}
                    </pre>
                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setExperimentoActual(experimento);
                          setMostrarHistorial(false);
                        }}
                        className="px-3 py-1 rounded-lg bg-neurolink-cyberBlue/20 
                          text-neurolink-cyberBlue hover:bg-neurolink-cyberBlue/30 
                          transition-colors flex items-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-sm">Ver Detalles</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MindSyncLab; 