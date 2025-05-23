import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

interface Habito {
  id: string;
  nombre: string;
  tipo: 'productividad' | 'salud' | 'mente';
  meta: string;
  ciclo: 7 | 21 | 30;
  fechaInicio: string;
  diasCompletados: string[];
  rachaActual: number;
  xpGanada: number;
  monedasGanadas: number;
  ultimoCheck?: string; // ISO string
}

interface SugerenciaHabito {
  nombre: string;
  tipo: 'productividad' | 'salud' | 'mente';
  descripcion: string;
}

// Sugerencias mock (después se conectarán a IA)
const SUGERENCIAS_HABITOS: SugerenciaHabito[] = [
  {
    nombre: 'Meditación Matutina',
    tipo: 'mente',
    descripcion: '5 minutos de meditación al despertar'
  },
  {
    nombre: 'Hidratación',
    tipo: 'salud',
    descripcion: 'Beber 2L de agua al día'
  },
  {
    nombre: 'Lectura Diaria',
    tipo: 'mente',
    descripcion: '30 minutos de lectura'
  },
  {
    nombre: 'Ejercicio',
    tipo: 'salud',
    descripcion: '20 minutos de actividad física'
  },
  {
    nombre: 'Planificación',
    tipo: 'productividad',
    descripcion: 'Planificar el día siguiente'
  }
];

// Mensajes motivacionales mock (después se conectarán a IA)
const MENSAJES_MOTIVACIONALES = [
  '¡Excelente progreso! Cada día cuenta.',
  'La constancia es la clave del éxito.',
  '¡Sigue así! Estás construyendo tu mejor versión.',
  'Cada hábito es un paso hacia tus metas.',
  '¡Tu futuro yo te lo agradecerá!'
];

const MENSAJE_CONCIENCIA = "Recuerda: marcar un hábito como completado es un compromiso contigo mismo. La IA puede motivarte, pero el verdadero cambio depende de tu honestidad y constancia. ¡No te engañes, tu progreso es real solo si tus acciones lo son!";

export default function InteligenciaHabitos() {
  const navigate = useNavigate();
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [mensajeMotivacional, setMensajeMotivacional] = useState('');
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);
  const [monedasTotal, setMonedasTotal] = useState(0);

  // Cargar hábitos del localStorage
  useEffect(() => {
    const habitosGuardados = localStorage.getItem('habitos_activos');
    if (habitosGuardados) {
      setHabitos(JSON.parse(habitosGuardados));
    }
  }, []);

  // Guardar hábitos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('habitos_activos', JSON.stringify(habitos));
    // Calcular totales
    setXpTotal(habitos.reduce((acc, h) => acc + h.xpGanada, 0));
    setMonedasTotal(habitos.reduce((acc, h) => acc + h.monedasGanadas, 0));
  }, [habitos]);

  // Agregar un useEffect para actualizar el cronómetro cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setHabitos(habitos => [...habitos]); // Forzar re-render
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Añadir nuevo hábito
  const iniciarHabito = (sugerencia: SugerenciaHabito, ciclo: 7 | 21 | 30) => {
    const nuevoHabito: Habito = {
      id: Date.now().toString(),
      nombre: sugerencia.nombre,
      tipo: sugerencia.tipo,
      meta: sugerencia.descripcion,
      ciclo,
      fechaInicio: new Date().toISOString(),
      diasCompletados: [],
      rachaActual: 0,
      xpGanada: 0,
      monedasGanadas: 0
    };
    setHabitos([...habitos, nuevoHabito]);
    setMostrarSugerencias(false);
    setMensajeMotivacional(MENSAJES_MOTIVACIONALES[Math.floor(Math.random() * MENSAJES_MOTIVACIONALES.length)]);
    setMostrarFeedback(true);
  };

  // Marcar día como completado para un hábito
  const completarDia = (id: string) => {
    setHabitos(habitos => habitos.map(habito => {
      if (habito.id !== id) return habito;
      const hoy = dayjs().format('YYYY-MM-DD');
      if (habito.diasCompletados.includes(hoy)) return habito;
      const diasCompletados = [...habito.diasCompletados, hoy];
      const rachaActual = habito.rachaActual + 1;
      let xpGanada = habito.xpGanada + 5;
      let monedasGanadas = habito.monedasGanadas + 1;
      if (rachaActual === 3) xpGanada += 10;
      if (rachaActual === 7) xpGanada += 25;
      if (rachaActual === 21) xpGanada += 50;
      if (rachaActual === 30) xpGanada += 100;
      setMensajeMotivacional(MENSAJES_MOTIVACIONALES[Math.floor(Math.random() * MENSAJES_MOTIVACIONALES.length)]);
      setMostrarFeedback(true);
      // Actualizar XP global
      const xpGlobal = parseInt(localStorage.getItem('xp_global') || '0', 10) + 5;
      localStorage.setItem('xp_global', xpGlobal.toString());
      return {
        ...habito,
        diasCompletados,
        rachaActual,
        xpGanada,
        monedasGanadas,
        ultimoCheck: dayjs().toISOString()
      };
    }));
  };

  // Eliminar hábito
  const eliminarHabito = (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este hábito? Se perderá su progreso.')) {
      setHabitos(habitos => habitos.filter(h => h.id !== id));
    }
  };

  // Calcular progreso de un hábito
  const calcularProgreso = (habito: Habito) => {
    return (habito.diasCompletados.length / habito.ciclo) * 100;
  };

  // Pantalla de selección de hábitos si no hay ninguno
  if (habitos.length === 0 || mostrarSugerencias) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-[#0a1826] to-[#10131a]">
        <button onClick={() => navigate('/centro-entrenamiento')} className="fixed top-6 right-6 bg-cyan-700 hover:bg-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold shadow-lg z-50">×</button>
        <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 w-full max-w-4xl border border-cyan-400/30 flex flex-col items-center animate-fadein-sci-fi">
          <h2 className="text-3xl font-bold mb-6 text-cyan-200 font-orbitron animate-glow-sci-fi">Inteligencia de Hábitos</h2>
          <h3 className="text-xl font-bold mb-4 text-cyan-200">Sugerencias de Hábitos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUGERENCIAS_HABITOS.map((sugerencia, index) => (
              <div key={index} className="bg-[#1a2d3d] rounded-xl p-4 border border-cyan-400/20">
                <h4 className="text-lg font-bold text-cyan-200 mb-2">{sugerencia.nombre}</h4>
                <p className="text-cyan-100 mb-4">{sugerencia.descripcion}</p>
                <div className="flex gap-2">
                  <button onClick={() => iniciarHabito(sugerencia, 7)} className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full text-sm">7 días</button>
                  <button onClick={() => iniciarHabito(sugerencia, 21)} className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full text-sm">21 días</button>
                  <button onClick={() => iniciarHabito(sugerencia, 30)} className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-full text-sm">30 días</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setMostrarSugerencias(false)} className="mt-6 bg-cyan-700 hover:bg-cyan-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all text-lg">Volver</button>
        </div>
      </div>
    );
  }

  // Pantalla principal: tablero de hábitos
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-[#0a1826] to-[#10131a]">
      <button onClick={() => navigate('/centro-entrenamiento')} className="fixed top-6 right-6 bg-cyan-700 hover:bg-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold shadow-lg z-50">×</button>
      <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 w-full max-w-5xl border border-cyan-400/30 flex flex-col items-center animate-fadein-sci-fi">
        <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8 gap-4">
          <h2 className="text-3xl font-bold text-cyan-200 font-orbitron animate-glow-sci-fi">Tus Hábitos Activos</h2>
          <button onClick={() => setMostrarSugerencias(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all text-lg animate-glow-sci-fi">+ Añadir hábito</button>
        </div>
        {/* Panel resumen */}
        <div className="flex gap-8 mb-8">
          <div className="bg-cyan-900/60 px-6 py-3 rounded-xl text-cyan-200 font-bold text-lg border border-cyan-400/30 shadow">XP total: {xpTotal}</div>
          <div className="bg-yellow-900/60 px-6 py-3 rounded-xl text-yellow-200 font-bold text-lg border border-yellow-400/30 shadow">🪙 Monedas: {monedasTotal}</div>
        </div>
        {/* Lista de hábitos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {habitos.map(habito => {
            const ahora = dayjs();
            const ultimoCheck = habito.ultimoCheck ? dayjs(habito.ultimoCheck) : null;
            const puedeCompletar = !ultimoCheck || ahora.diff(ultimoCheck, 'hour') >= 24;
            const tiempoRestante = ultimoCheck ? 24 * 60 * 60 - ahora.diff(ultimoCheck, 'second') : 0;
            return (
              <div key={habito.id} className="bg-[#1a2d3d] rounded-2xl p-6 border border-cyan-400/20 flex flex-col items-center relative animate-fadein-sci-fi">
                <button onClick={() => eliminarHabito(habito.id)} className="absolute top-3 right-3 bg-red-700 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-lg">×</button>
                <h3 className="text-2xl font-bold text-cyan-200 mb-2">{habito.nombre}</h3>
                <p className="text-cyan-100 mb-4">{habito.meta}</p>
                {/* Progreso circular */}
                <div className="relative w-32 h-32 mb-4">
                  <div className="absolute inset-0 rounded-full border-8 border-cyan-400/20"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-cyan-400"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(2 * Math.PI * calcularProgreso(habito) / 100)}% ${50 + 50 * Math.sin(2 * Math.PI * calcularProgreso(habito) / 100)}%)`
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-cyan-200">{Math.round(calcularProgreso(habito))}%</span>
                  </div>
                </div>
                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4 mb-4 w-full">
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-200">{habito.rachaActual}</div>
                    <div className="text-cyan-100 text-xs">Días seguidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-200">{habito.xpGanada}</div>
                    <div className="text-cyan-100 text-xs">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-cyan-200">{habito.monedasGanadas}</div>
                    <div className="text-cyan-100 text-xs">Monedas</div>
                  </div>
                </div>
                {/* Botón de completar día */}
                <button
                  onClick={() => completarDia(habito.id)}
                  className={`bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-all text-lg animate-glow-sci-fi mb-2 ${!puedeCompletar ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!puedeCompletar}
                >
                  {puedeCompletar ? 'Completar Día' : `Disponible en ${Math.floor(tiempoRestante/3600)}h ${Math.floor((tiempoRestante%3600)/60)}m ${tiempoRestante%60}s`}
                </button>
                {/* Logros desbloqueados */}
                {habito.rachaActual >= 3 && (
                  <div className="mt-2 p-2 bg-yellow-400/10 rounded-xl border border-yellow-400/30 animate-glow-sci-fi">
                    <p className="text-yellow-300 text-center text-sm">🏅 ¡Insignia "Hábito Forjado"!</p>
                  </div>
                )}
                {habito.rachaActual >= 7 && (
                  <div className="mt-2 p-2 bg-purple-400/10 rounded-xl border border-purple-400/30 animate-glow-sci-fi">
                    <p className="text-purple-300 text-center text-sm">✨ ¡Moneda especial!</p>
                  </div>
                )}
                {habito.rachaActual >= 21 && (
                  <div className="mt-2 p-2 bg-green-400/10 rounded-xl border border-green-400/30 animate-glow-sci-fi">
                    <p className="text-green-300 text-center text-sm">🌟 ¡Boost de rendimiento!</p>
                  </div>
                )}
                {habito.rachaActual >= 30 && (
                  <div className="mt-2 p-2 bg-blue-400/10 rounded-xl border border-blue-400/30 animate-glow-sci-fi">
                    <p className="text-blue-300 text-center text-sm">🧬 ¡Evolución de avatar!</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Feedback motivacional global */}
        {mostrarFeedback && (
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-cyan-400/10 rounded-xl border border-cyan-400/30 animate-fadein-sci-fi">
              <p className="text-cyan-200 text-center">{mensajeMotivacional}</p>
            </div>
            <div className="p-4 bg-purple-400/10 rounded-xl border border-purple-400/30 animate-fadein-sci-fi">
              <p className="text-purple-200 text-center text-sm italic">{MENSAJE_CONCIENCIA}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 