import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIAS = [
  'Tecnología',
  'Negocios',
  'Productividad',
  'Desarrollo personal',
  'Cultura general',
];
const NIVELES = ['Fácil', 'Intermedio', 'Avanzado'];

interface PreguntaIA {
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: string;
  explicacion: string;
}

// Endpoint temporal: mock local
async function obtenerPreguntas(categoria: string, nivel: string): Promise<PreguntaIA[]> {
  // Simulación de preguntas variadas
  return [
    {
      enunciado: '¿Qué es blockchain?',
      opciones: ['Base de datos', 'Red social', 'Aplicación móvil', 'Criptomoneda'],
      respuestaCorrecta: 'Base de datos',
      explicacion: 'Blockchain es una base de datos distribuida, segura y descentralizada.'
    },
    {
      enunciado: '¿Quién pintó la Mona Lisa?',
      opciones: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Claude Monet'],
      respuestaCorrecta: 'Leonardo da Vinci',
      explicacion: 'La Mona Lisa fue pintada por Leonardo da Vinci.'
    },
    {
      enunciado: '¿Cuál es la capital de Japón?',
      opciones: ['Pekín', 'Seúl', 'Tokio', 'Bangkok'],
      respuestaCorrecta: 'Tokio',
      explicacion: 'Tokio es la capital de Japón.'
    },
    {
      enunciado: '¿Qué es el metaverso?',
      opciones: ['Un videojuego', 'Un universo virtual', 'Una red social', 'Un robot'],
      respuestaCorrecta: 'Un universo virtual',
      explicacion: 'El metaverso es un universo virtual inmersivo y persistente.'
    },
    {
      enunciado: '¿Qué estudia la economía?',
      opciones: ['El clima', 'La mente', 'La producción y consumo', 'La biología'],
      respuestaCorrecta: 'La producción y consumo',
      explicacion: 'La economía estudia la producción, distribución y consumo de bienes y servicios.'
    }
  ];
}

export default function KnowledgeVaultQuiz() {
  const [fase, setFase] = useState<'inicio' | 'quiz' | 'resultado'>('inicio');
  const [categoria, setCategoria] = useState<string>('');
  const [nivel, setNivel] = useState<string>('');
  const [preguntas, setPreguntas] = useState<PreguntaIA[]>([]);
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<{opcion: string, correcta: boolean}[]>([]);
  const [ayudaUsada, setAyudaUsada] = useState<boolean>(false);
  const [xp, setXp] = useState<number>(0);
  const [monedas, setMonedas] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string | null>(null);
  const [confeti, setConfeti] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Mensaje motivacional según puntaje
  const getMensajeMotivacional = () => {
    const aciertos = respuestas.filter(r => r.correcta).length;
    if (aciertos === preguntas.length) return '¡Perfecto! Eres un genio del conocimiento.';
    if (aciertos >= preguntas.length * 0.8) return '¡Excelente! Estás por encima del promedio.';
    if (aciertos >= preguntas.length * 0.5) return '¡Bien hecho! Sigue practicando para mejorar.';
    return '¡No te rindas! Cada intento te hace más fuerte.';
  };

  // Barra de progreso
  const Progreso = () => (
    <div className="w-full flex items-center gap-2 mb-4">
      {preguntas.map((_, idx) => (
        <div key={idx} className={`h-2 flex-1 rounded-full ${idx < preguntaActual ? 'bg-cyan-400' : idx === preguntaActual ? 'bg-yellow-300' : 'bg-cyan-900/40'}`}></div>
      ))}
    </div>
  );

  // Selección de tema y nivel
  const iniciarQuiz = async () => {
    setError('');
    try {
      const preguntasIA = await obtenerPreguntas(categoria, nivel);
      setPreguntas(preguntasIA);
      setFase('quiz');
      setPreguntaActual(0);
      setRespuestas([]);
      setAyudaUsada(false);
      setXp(0);
      setMonedas(0);
      setTimer(30);
      setFeedback('');
      setOpcionSeleccionada(null);
      setConfeti(false);
    } catch (e) {
      setError('No se pudieron obtener preguntas de la IA. Verifica la conexión o el endpoint.');
    }
  };

  // Lógica de respuesta
  const responder = (opcion: string) => {
    if (opcionSeleccionada) return; // Evita doble click
    setOpcionSeleccionada(opcion);
    const pregunta = preguntas[preguntaActual];
    const correcta = opcion === pregunta.respuestaCorrecta;
    setRespuestas([...respuestas, { opcion, correcta }]);
    setXp(xp + (correcta ? 10 : 0));
    setFeedback(pregunta.explicacion);
    clearTimeout(timerRef.current!);
    setTimeout(() => {
      setOpcionSeleccionada(null);
      if (preguntaActual + 1 < preguntas.length) {
        setPreguntaActual(preguntaActual + 1);
        setFeedback('');
        setTimer(30);
      } else {
        // Calcular monedas
        const aciertos = [...respuestas, { opcion, correcta }].filter(r => r.correcta).length;
        if (aciertos / preguntas.length >= 0.8) setMonedas(5);
        setFase('resultado');
        setConfeti(true);
        // Badge de completado en localStorage
        localStorage.setItem('modulo1_usado', 'true');
      }
    }, 2000);
  };

  // Lógica de ayuda (50/50)
  const usarAyuda = () => {
    setAyudaUsada(true);
    // Aquí se podría implementar lógica para eliminar dos opciones incorrectas
  };

  // Confeti (simple SVG animado)
  const Confeti = () => confeti ? (
    <div className="fixed inset-0 pointer-events-none z-50 animate-fadein-sci-fi">
      <svg width="100%" height="100%" className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <circle key={i} cx={Math.random()*window.innerWidth} cy={Math.random()*window.innerHeight} r={Math.random()*6+2} fill={`hsl(${Math.random()*360},90%,60%)`} opacity="0.7">
            <animate attributeName="cy" from={0} to={window.innerHeight} dur={`${Math.random()*1.5+1.2}s`} repeatCount="1" />
          </circle>
        ))}
      </svg>
    </div>
  ) : null;

  // Renderizado
  if (fase === 'inicio') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-[#0a1826] to-[#10131a]">
        <button onClick={() => navigate('/centro-entrenamiento')} className="absolute top-6 right-6 bg-cyan-700 hover:bg-cyan-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg z-50">×</button>
        <div className="bg-[#0e2236]/80 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-cyan-400/30 flex flex-col items-center animate-fadein-sci-fi">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-200 font-orbitron text-center animate-glow-sci-fi">Accede al templo del conocimiento.<br />Elige un tema para iniciar tu desafío mental.</h2>
          {error && <div className="bg-red-200 text-red-900 p-2 rounded mb-4 w-full text-center font-bold animate-pulse">{error}</div>}
          <div className="mb-4 w-full">
            <label className="mr-2 text-cyan-100 font-semibold">Categoría:</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full p-2 rounded bg-[#14263a] text-cyan-200 border border-cyan-400/20 focus:outline-none">
              <option value="">Selecciona</option>
              {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="mb-6 w-full">
            <label className="mr-2 text-cyan-100 font-semibold">Nivel:</label>
            <select value={nivel} onChange={e => setNivel(e.target.value)} className="w-full p-2 rounded bg-[#14263a] text-cyan-200 border border-cyan-400/20 focus:outline-none">
              <option value="">Selecciona</option>
              {NIVELES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all text-lg animate-glow-sci-fi disabled:opacity-50" disabled={!categoria || !nivel} onClick={iniciarQuiz}>Iniciar Quiz</button>
        </div>
      </div>
    );
  }

  if (fase === 'quiz') {
    const pregunta = preguntas[preguntaActual];
    // Opciones para feedback visual
    const getOpcionClass = (op: string) => {
      if (!opcionSeleccionada) return 'bg-gradient-to-r from-cyan-700 to-blue-800 text-white';
      if (op === pregunta.respuestaCorrecta && op === opcionSeleccionada) return 'bg-green-500 text-white animate-pulse';
      if (op === opcionSeleccionada && op !== pregunta.respuestaCorrecta) return 'bg-red-500 text-white animate-pulse';
      if (op === pregunta.respuestaCorrecta) return 'bg-green-500 text-white';
      return 'bg-gradient-to-r from-cyan-700 to-blue-800 text-white opacity-60';
    };
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-[#0a1826] to-[#10131a]">
        <button onClick={() => navigate('/centro-entrenamiento')} className="absolute top-6 right-6 bg-cyan-700 hover:bg-cyan-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg z-50">×</button>
        <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-cyan-400/30 flex flex-col items-center animate-fadein-sci-fi relative">
          <Progreso />
          <div className="mb-2 text-cyan-300 font-orbitron text-lg">Pregunta {preguntaActual + 1} de {preguntas.length}</div>
          <div className="mb-2 text-cyan-200 font-semibold">Categoría: <span className="font-bold text-cyan-100">{categoria}</span> | Nivel: <span className="font-bold text-cyan-100">{nivel}</span></div>
          <div className="mb-6 text-2xl md:text-3xl font-bold text-cyan-100 text-center animate-glow-sci-fi">{pregunta.enunciado}</div>
          <div className="mb-4 text-cyan-200 font-semibold">Tiempo restante: <span className="font-bold text-yellow-300">{timer}s</span></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full">
            {pregunta.opciones.map(op => (
              <button key={op} className={`px-6 py-3 rounded-xl font-bold shadow-md hover:scale-105 transition-all text-lg border-2 border-cyan-400/20 ${getOpcionClass(op)}`} onClick={() => responder(op)} disabled={!!opcionSeleccionada}>{op}</button>
            ))}
          </div>
          {!ayudaUsada && <button className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold mb-4 shadow hover:scale-105 transition-all animate-glow-sci-fi" onClick={usarAyuda}>Usar ayuda 50/50</button>}
          {feedback && <div className="bg-blue-100/90 text-blue-900 p-3 rounded-xl mb-2 w-full text-center font-semibold animate-fadein-sci-fi">{feedback}</div>}
        </div>
      </div>
    );
  }

  if (fase === 'resultado') {
    const aciertos = respuestas.filter(r => r.correcta).length;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-[#0a1826] to-[#10131a]">
        <Confeti />
        <button onClick={() => navigate('/centro-entrenamiento')} className="absolute top-6 right-6 bg-cyan-700 hover:bg-cyan-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg z-50">×</button>
        <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-cyan-400/30 flex flex-col items-center animate-fadein-sci-fi">
          <h2 className="text-3xl font-bold mb-6 text-cyan-200 font-orbitron animate-glow-sci-fi">¡Desafío completado!</h2>
          <div className="mb-2 text-lg text-cyan-100">XP ganada: <span className="font-bold text-purple-400">{xp}</span></div>
          <div className="mb-2 text-lg text-cyan-100">Monedas ganadas: <span className="font-bold text-yellow-300">{monedas}</span></div>
          <div className="mb-2 text-lg text-cyan-100">Aciertos: <span className="font-bold text-cyan-300">{aciertos} / {preguntas.length}</span></div>
          <div className="mb-6 text-lg text-cyan-100 font-bold text-center animate-glow-sci-fi">{getMensajeMotivacional()}</div>
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all text-lg animate-glow-sci-fi mb-2" onClick={() => setFase('inicio')}>Volver a empezar</button>
          <button className="bg-cyan-700 hover:bg-cyan-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all text-lg" onClick={() => navigate('/centro-entrenamiento')}>Volver al Centro</button>
        </div>
      </div>
    );
  }

  return null;
} 