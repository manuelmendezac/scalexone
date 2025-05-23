import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// Tipos e interfaces
interface PreguntaTest {
  id: number;
  pregunta: string;
  opciones: {
    valor: number;
    texto: string;
  }[];
}

interface ResultadoTest {
  tipo: string;
  descripcion: string;
  fortalezas: string[];
  areasMejora: string[];
  color: string;
}

interface EstadoEmocional {
  energia: number;
  enfoque: number;
  emocion: number;
  fecha: string;
}

interface PerfilCognitivo {
  tipo: string;
  ultimoTest: string;
  estadoEmocional: EstadoEmocional[];
  ultimaActualizacion: string;
}

// Preguntas del test cognitivo
const PREGUNTAS_TEST: PreguntaTest[] = [
  {
    id: 1,
    pregunta: "¿Cómo prefieres procesar nueva información?",
    opciones: [
      { valor: 1, texto: "A través de ejemplos prácticos y experiencias" },
      { valor: 2, texto: "Mediante análisis lógico y datos" },
      { valor: 3, texto: "A través de patrones y conexiones" },
      { valor: 4, texto: "Combinando diferentes enfoques" }
    ]
  },
  {
    id: 2,
    pregunta: "Cuando resuelves problemas, tiendes a:",
    opciones: [
      { valor: 1, texto: "Seguir un proceso paso a paso" },
      { valor: 2, texto: "Explorar múltiples soluciones simultáneamente" },
      { valor: 3, texto: "Buscar patrones y conexiones" },
      { valor: 4, texto: "Adaptar el enfoque según el contexto" }
    ]
  },
  {
    id: 3,
    pregunta: "En situaciones de aprendizaje, prefieres:",
    opciones: [
      { valor: 1, texto: "Instrucciones claras y estructuradas" },
      { valor: 2, texto: "Libertad para explorar y experimentar" },
      { valor: 3, texto: "Ver el panorama general primero" },
      { valor: 4, texto: "Una combinación de estructura y flexibilidad" }
    ]
  }
];

// Resultados posibles del test
const RESULTADOS_TEST: { [key: string]: ResultadoTest } = {
  analitico: {
    tipo: "Analítico",
    descripcion: "Procesas la información de manera lógica y sistemática, prefiriendo datos concretos y análisis detallado.",
    fortalezas: [
      "Pensamiento crítico",
      "Análisis detallado",
      "Toma de decisiones basada en datos"
    ],
    areasMejora: [
      "Pensamiento creativo",
      "Adaptabilidad",
      "Tolerancia a la ambigüedad"
    ],
    color: "blue"
  },
  intuitivo: {
    tipo: "Intuitivo",
    descripcion: "Procesas la información de manera holística, buscando patrones y conexiones entre diferentes conceptos.",
    fortalezas: [
      "Pensamiento creativo",
      "Visión general",
      "Adaptabilidad"
    ],
    areasMejora: [
      "Atención al detalle",
      "Planificación",
      "Análisis sistemático"
    ],
    color: "purple"
  },
  practico: {
    tipo: "Práctico",
    descripcion: "Prefieres aprender a través de la experiencia directa y la aplicación práctica de conceptos.",
    fortalezas: [
      "Resolución de problemas",
      "Aplicación práctica",
      "Adaptabilidad"
    ],
    areasMejora: [
      "Pensamiento abstracto",
      "Planificación a largo plazo",
      "Análisis teórico"
    ],
    color: "green"
  },
  equilibrado: {
    tipo: "Equilibrado",
    descripcion: "Combinas diferentes estilos de pensamiento, adaptándote según el contexto y la situación.",
    fortalezas: [
      "Versatilidad",
      "Adaptabilidad",
      "Pensamiento integrador"
    ],
    areasMejora: [
      "Especialización",
      "Profundidad en áreas específicas",
      "Toma de decisiones rápida"
    ],
    color: "cyan"
  }
};

// --- NUEVO: Configuración de evolución ---
const MAX_NIVEL_EVOLUCION = 5;
const DIAS_PARA_SUBIR_NIVEL = 3; // Cada 3 días de interacción sube de nivel

function calcularNivelEvolucion(dias: number) {
  return Math.min(MAX_NIVEL_EVOLUCION, Math.floor(dias / DIAS_PARA_SUBIR_NIVEL) + 1);
}

function calcularProgresoNivel(dias: number) {
  const nivel = calcularNivelEvolucion(dias);
  const diasEnNivel = dias - (DIAS_PARA_SUBIR_NIVEL * (nivel - 1));
  return Math.min(100, (diasEnNivel / DIAS_PARA_SUBIR_NIVEL) * 100);
}

const MENSAJE_EVOLUCION =
  "¡Cada vez que completas esta actividad, tu clon aprende a pensar y sentir como tú! Así, tu segundo cerebro evoluciona y se convierte en tu reflejo digital.";

export default function PerfilCognitivo() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilCognitivo | null>(null);
  const [mostrandoTest, setMostrandoTest] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [resultado, setResultado] = useState<ResultadoTest | null>(null);
  const [estadoEmocional, setEstadoEmocional] = useState<EstadoEmocional>({
    energia: 5,
    enfoque: 5,
    emocion: 5,
    fecha: dayjs().format('YYYY-MM-DD')
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [animarEvolucion, setAnimarEvolucion] = useState(false);

  // --- NUEVO: Calcular días únicos de interacción ---
  const diasUnicos = perfil?.estadoEmocional
    ? Array.from(new Set(perfil.estadoEmocional.map(e => e.fecha))).length
    : 0;
  const nivelEvolucion = calcularNivelEvolucion(diasUnicos);
  const progresoNivel = calcularProgresoNivel(diasUnicos);

  // --- NUEVO: Completado diario ---
  const hoy = dayjs().format('YYYY-MM-DD');
  const completadoHoy = perfil?.estadoEmocional.some(e => e.fecha === hoy);

  useEffect(() => {
    if (completadoHoy) {
      localStorage.setItem('modulo_perfilcognitivo_completado', 'true');
      localStorage.setItem('modulo_perfilcognitivo_completado_fecha', hoy);
    }
  }, [completadoHoy, hoy]);

  // Cargar perfil al iniciar
  useEffect(() => {
    const perfilGuardado = localStorage.getItem('perfil_cognitivo');
    if (perfilGuardado) {
      setPerfil(JSON.parse(perfilGuardado));
    }
  }, []);

  // Guardar perfil cuando cambia
  useEffect(() => {
    if (perfil) {
      localStorage.setItem('perfil_cognitivo', JSON.stringify(perfil));
    }
  }, [perfil]);

  const iniciarTest = () => {
    setMostrandoTest(true);
    setPreguntaActual(0);
    setRespuestas([]);
    setResultado(null);
  };

  const responderPregunta = (valor: number) => {
    const nuevasRespuestas = [...respuestas, valor];
    setRespuestas(nuevasRespuestas);

    if (nuevasRespuestas.length === PREGUNTAS_TEST.length) {
      calcularResultado(nuevasRespuestas);
    } else {
      setPreguntaActual(prev => prev + 1);
    }
  };

  const calcularResultado = (respuestas: number[]) => {
    const promedio = respuestas.reduce((a, b) => a + b, 0) / respuestas.length;
    let tipo: string;

    if (promedio <= 1.5) tipo = 'practico';
    else if (promedio <= 2.5) tipo = 'analitico';
    else if (promedio <= 3.5) tipo = 'intuitivo';
    else tipo = 'equilibrado';

    const resultadoTest = RESULTADOS_TEST[tipo];
    setResultado(resultadoTest);

    // Actualizar perfil
    const nuevoPerfil: PerfilCognitivo = {
      tipo: resultadoTest.tipo,
      ultimoTest: dayjs().format('YYYY-MM-DD'),
      estadoEmocional: perfil?.estadoEmocional || [],
      ultimaActualizacion: dayjs().format('YYYY-MM-DD')
    };
    setPerfil(nuevoPerfil);
    mostrarFeedbackEvolucion();
  };

  // --- NUEVO: Feedback y animación al registrar estado o test ---
  const mostrarFeedbackEvolucion = () => {
    setFeedback(MENSAJE_EVOLUCION);
    setAnimarEvolucion(true);
    setTimeout(() => setAnimarEvolucion(false), 1500);
    setTimeout(() => setFeedback(null), 4000);
  };

  const registrarEstadoEmocional = () => {
    if (!perfil) return;

    const nuevoEstado = {
      ...estadoEmocional,
      fecha: dayjs().format('YYYY-MM-DD')
    };

    const nuevoPerfil = {
      ...perfil,
      estadoEmocional: [...perfil.estadoEmocional, nuevoEstado],
      ultimaActualizacion: dayjs().format('YYYY-MM-DD')
    };

    setPerfil(nuevoPerfil);
    setEstadoEmocional({
      energia: 5,
      enfoque: 5,
      emocion: 5,
      fecha: dayjs().format('YYYY-MM-DD')
    });
    mostrarFeedbackEvolucion();
  };

  if (mostrandoTest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1826] to-[#10131a] p-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/centro-entrenamiento')}
            className="absolute top-6 right-6 bg-cyan-700 hover:bg-cyan-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg"
          >
            ×
          </button>

          {!resultado ? (
            <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 border border-cyan-400/30">
              <h2 className="text-2xl font-bold mb-6 text-cyan-200 font-orbitron">
                Pregunta {preguntaActual + 1} de {PREGUNTAS_TEST.length}
              </h2>
              <p className="text-lg mb-6 text-cyan-100">
                {PREGUNTAS_TEST[preguntaActual].pregunta}
              </p>
              <div className="space-y-4">
                {PREGUNTAS_TEST[preguntaActual].opciones.map((opcion, index) => (
                  <button
                    key={index}
                    onClick={() => responderPregunta(opcion.valor)}
                    className="w-full p-4 text-left bg-cyan-900/30 hover:bg-cyan-800/50 rounded-lg border border-cyan-400/30 text-cyan-100 transition-all"
                  >
                    {opcion.texto}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 border border-cyan-400/30">
              <h2 className="text-3xl font-bold mb-6 text-cyan-200 font-orbitron">
                Tu Perfil Cognitivo: {resultado.tipo}
              </h2>
              <p className="text-lg mb-6 text-cyan-100">{resultado.descripcion}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-cyan-900/30 rounded-lg p-4 border border-cyan-400/30">
                  <h3 className="text-xl font-bold mb-4 text-cyan-200">Fortalezas</h3>
                  <ul className="space-y-2">
                    {resultado.fortalezas.map((fortaleza, index) => (
                      <li key={index} className="text-cyan-100 flex items-center">
                        <span className="text-green-400 mr-2">✓</span>
                        {fortaleza}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-cyan-900/30 rounded-lg p-4 border border-cyan-400/30">
                  <h3 className="text-xl font-bold mb-4 text-cyan-200">Áreas de Mejora</h3>
                  <ul className="space-y-2">
                    {resultado.areasMejora.map((area, index) => (
                      <li key={index} className="text-cyan-100 flex items-center">
                        <span className="text-yellow-400 mr-2">→</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setMostrandoTest(false)}
                  className="px-6 py-3 bg-cyan-700 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all"
                >
                  Volver al Perfil
                </button>
                <button
                  onClick={iniciarTest}
                  className="px-6 py-3 bg-purple-700 hover:bg-purple-500 text-white rounded-lg font-bold transition-all"
                >
                  Realizar Test Nuevamente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1826] to-[#10131a] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Feedback de evolución */}
        {feedback && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-purple-800/90 text-white px-6 py-4 rounded-2xl shadow-xl border-2 border-purple-400/40 text-center text-lg font-semibold animate-fadein-sci-fi">
              {feedback}
            </div>
          </div>
        )}
        {/* Panel de evolución del clon */}
        <div className="mb-8 flex flex-col items-center">
          <div className={`w-32 h-32 rounded-full border-4 border-cyan-400/60 shadow-xl flex items-center justify-center mb-2 transition-all duration-500 ${animarEvolucion ? 'ring-4 ring-purple-400 scale-110' : ''}`}
            style={{ background: '#181f2a' }}>
            <span className="text-5xl font-bold text-cyan-200 font-orbitron">{nivelEvolucion}</span>
          </div>
          <div className="w-full max-w-xs">
            <div className="flex justify-between mb-1">
              <span className="text-cyan-200 text-sm font-bold">Nivel de evolución</span>
              <span className="text-cyan-400 text-sm font-bold">{nivelEvolucion} / {MAX_NIVEL_EVOLUCION}</span>
            </div>
            <div className="h-4 bg-cyan-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500" style={{ width: `${progresoNivel}%` }} />
            </div>
            <div className="text-cyan-100 text-xs mt-1 text-center">
              {progresoNivel === 100 ? '¡Listo para evolucionar al siguiente nivel!' : `Interactúa ${DIAS_PARA_SUBIR_NIVEL - (diasUnicos % DIAS_PARA_SUBIR_NIVEL)} día(s) más para subir de nivel`}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/centro-entrenamiento')}
          className="absolute top-6 right-6 bg-cyan-700 hover:bg-cyan-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg"
        >
          ×
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Panel de Perfil */}
          <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 border border-cyan-400/30">
            <h2 className="text-2xl font-bold mb-6 text-cyan-200 font-orbitron">
              Perfil Cognitivo
            </h2>
            
            {perfil ? (
              <div className="space-y-6">
                <div className="bg-cyan-900/30 rounded-lg p-4 border border-cyan-400/30">
                  <h3 className="text-xl font-bold mb-2 text-cyan-200">Tipo Cognitivo</h3>
                  <p className="text-cyan-100">{perfil.tipo}</p>
                  <p className="text-sm text-cyan-400 mt-2">
                    Último test: {dayjs(perfil.ultimoTest).format('DD/MM/YYYY')}
                  </p>
                </div>

                <div className="bg-cyan-900/30 rounded-lg p-4 border border-cyan-400/30">
                  <h3 className="text-xl font-bold mb-2 text-cyan-200">Estado Emocional</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-cyan-100 mb-2">Energía</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={estadoEmocional.energia}
                        onChange={(e) => setEstadoEmocional(prev => ({
                          ...prev,
                          energia: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan-100 mb-2">Enfoque</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={estadoEmocional.enfoque}
                        onChange={(e) => setEstadoEmocional(prev => ({
                          ...prev,
                          enfoque: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan-100 mb-2">Emoción</label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={estadoEmocional.emocion}
                        onChange={(e) => setEstadoEmocional(prev => ({
                          ...prev,
                          emocion: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>
                    <button
                      onClick={registrarEstadoEmocional}
                      className="w-full py-2 bg-cyan-700 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all"
                    >
                      Registrar Estado
                    </button>
                  </div>
                </div>

                <button
                  onClick={iniciarTest}
                  className="w-full py-3 bg-purple-700 hover:bg-purple-500 text-white rounded-lg font-bold transition-all"
                >
                  Realizar Test Cognitivo
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-cyan-100 mb-6">
                  Aún no has realizado el test cognitivo. Descubre tu perfil cognitivo para personalizar tu experiencia de entrenamiento.
                </p>
                <button
                  onClick={iniciarTest}
                  className="px-6 py-3 bg-purple-700 hover:bg-purple-500 text-white rounded-lg font-bold transition-all"
                >
                  Iniciar Test Cognitivo
                </button>
              </div>
            )}
          </div>

          {/* Panel de Historial */}
          <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 border border-cyan-400/30">
            <h2 className="text-2xl font-bold mb-6 text-cyan-200 font-orbitron">
              Historial de Estados
            </h2>
            
            {perfil?.estadoEmocional.length ? (
              <div className="space-y-4">
                {perfil.estadoEmocional.slice().reverse().map((estado, index) => (
                  <div
                    key={index}
                    className="bg-cyan-900/30 rounded-lg p-4 border border-cyan-400/30"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-cyan-200 font-bold">
                        {dayjs(estado.fecha).format('DD/MM/YYYY')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-cyan-100">Energía</span>
                        <div className="h-2 bg-cyan-800 rounded-full mt-1">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(estado.energia / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-cyan-100">Enfoque</span>
                        <div className="h-2 bg-cyan-800 rounded-full mt-1">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(estado.enfoque / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-cyan-100">Emoción</span>
                        <div className="h-2 bg-cyan-800 rounded-full mt-1">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${(estado.emocion / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-cyan-100 text-center">
                Aún no hay registros de estados emocionales.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 