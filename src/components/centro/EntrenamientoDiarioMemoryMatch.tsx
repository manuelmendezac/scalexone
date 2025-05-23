import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Carta {
  id: number;
  contenido: string;
  tipo: 'imagen' | 'texto';
  parejaId: number;
  volteada: boolean;
  emparejada: boolean;
}

interface Nivel {
  nombre: string;
  grid: string;
  tiempo: number;
  tipoPares: string;
}

interface ParEjemplo {
  id: number;
  contenido: string;
  tipo: 'imagen' | 'texto';
  parejaId: number;
}

const NIVELES: Nivel[] = [
  {
    nombre: 'Iniciado',
    grid: '4x4',
    tiempo: 90,
    tipoPares: 'imagen-palabra'
  },
  {
    nombre: 'Avanzado',
    grid: '5x5',
    tiempo: 120,
    tipoPares: 'concepto-definición'
  },
  {
    nombre: 'Maestro',
    grid: '6x6',
    tiempo: 150,
    tipoPares: 'pregunta-respuesta'
  }
];

// Pares de ejemplo (esto luego se puede conectar a una API o base de datos)
const PARES_EJEMPLO: ParEjemplo[] = [
  { id: 1, contenido: 'https://picsum.photos/200/200?random=1', tipo: 'imagen', parejaId: 2 },
  { id: 2, contenido: 'Blockchain', tipo: 'texto', parejaId: 1 },
  { id: 3, contenido: 'https://picsum.photos/200/200?random=2', tipo: 'imagen', parejaId: 4 },
  { id: 4, contenido: 'Inteligencia Artificial', tipo: 'texto', parejaId: 3 },
  { id: 5, contenido: 'https://picsum.photos/200/200?random=3', tipo: 'imagen', parejaId: 6 },
  { id: 6, contenido: 'Machine Learning', tipo: 'texto', parejaId: 5 },
  { id: 7, contenido: 'https://picsum.photos/200/200?random=4', tipo: 'imagen', parejaId: 8 },
  { id: 8, contenido: 'Deep Learning', tipo: 'texto', parejaId: 7 },
  { id: 9, contenido: 'https://picsum.photos/200/200?random=5', tipo: 'imagen', parejaId: 10 },
  { id: 10, contenido: 'Neural Networks', tipo: 'texto', parejaId: 9 },
  { id: 11, contenido: 'https://picsum.photos/200/200?random=6', tipo: 'imagen', parejaId: 12 },
  { id: 12, contenido: 'Data Science', tipo: 'texto', parejaId: 11 },
  { id: 13, contenido: 'https://picsum.photos/200/200?random=7', tipo: 'imagen', parejaId: 14 },
  { id: 14, contenido: 'Big Data', tipo: 'texto', parejaId: 13 },
  { id: 15, contenido: 'https://picsum.photos/200/200?random=8', tipo: 'imagen', parejaId: 16 },
  { id: 16, contenido: 'Cloud Computing', tipo: 'texto', parejaId: 15 },
  { id: 17, contenido: 'https://picsum.photos/200/200?random=9', tipo: 'imagen', parejaId: 18 },
  { id: 18, contenido: 'IoT', tipo: 'texto', parejaId: 17 }
];

// Función para obtener pares desde IA o mock
async function obtenerParesIA(nivel: string, cantidad: number): Promise<{ palabra: string, definicion: string }[]> {
  // Aquí se conectará a la IA en el futuro
  // Ejemplo de fetch:
  // const res = await fetch('/api/pares-ia', { method: 'POST', body: JSON.stringify({ nivel, cantidad, perfil: 'usuario' }) });
  // const data = await res.json();
  // return data.pares;

  // Mock de palabras/conceptos
  if (nivel === 'Iniciado') {
    return [
      { palabra: 'Neuronas', definicion: 'Células del sistema nervioso' },
      { palabra: 'Sinapsis', definicion: 'Conexión entre neuronas' },
      { palabra: 'Memoria', definicion: 'Capacidad de retener información' },
      { palabra: 'Atención', definicion: 'Foco mental en estímulos' },
      { palabra: 'Cognición', definicion: 'Procesos mentales de conocimiento' },
      { palabra: 'Aprendizaje', definicion: 'Adquisición de conocimientos' },
      { palabra: 'Plasticidad', definicion: 'Capacidad de adaptación cerebral' },
      { palabra: 'Motivación', definicion: 'Impulso para actuar' }
    ].slice(0, cantidad);
  }
  if (nivel === 'Avanzado') {
    return [
      { palabra: 'Neurotransmisores', definicion: 'Mensajeros químicos del cerebro' },
      { palabra: 'Corteza prefrontal', definicion: 'Área de toma de decisiones' },
      { palabra: 'Hemisferios', definicion: 'Divisiones cerebrales' },
      { palabra: 'Glía', definicion: 'Células de soporte cerebral' },
      { palabra: 'Dopamina', definicion: 'Neurotransmisor de recompensa' },
      { palabra: 'Serotonina', definicion: 'Neurotransmisor de ánimo' },
      { palabra: 'Axón', definicion: 'Prolongación de la neurona' },
      { palabra: 'Dendrita', definicion: 'Receptor de señales neuronales' },
      { palabra: 'Hipocampo', definicion: 'Región de memoria' },
      { palabra: 'Amígdala', definicion: 'Centro de emociones' },
      { palabra: 'Cerebelo', definicion: 'Coordinación motora' },
      { palabra: 'Lóbulo frontal', definicion: 'Control ejecutivo' }
    ].slice(0, cantidad);
  }
  // Maestro o fallback
  return [
    { palabra: 'Potenciación a largo plazo', definicion: 'Mecanismo de memoria duradera' },
    { palabra: 'Neurogénesis', definicion: 'Formación de nuevas neuronas' },
    { palabra: 'Red neuronal', definicion: 'Conjunto de neuronas interconectadas' },
    { palabra: 'Plasticidad sináptica', definicion: 'Cambio en conexiones neuronales' },
    { palabra: 'Corteza motora', definicion: 'Control del movimiento' },
    { palabra: 'Corteza sensorial', definicion: 'Procesamiento de estímulos' },
    { palabra: 'Sistema límbico', definicion: 'Regulación de emociones' },
    { palabra: 'Cuerpo calloso', definicion: 'Comunicación entre hemisferios' },
    { palabra: 'Glutamato', definicion: 'Neurotransmisor excitador' },
    { palabra: 'GABA', definicion: 'Neurotransmisor inhibidor' },
    { palabra: 'Corteza visual', definicion: 'Procesamiento de imágenes' },
    { palabra: 'Corteza auditiva', definicion: 'Procesamiento de sonidos' },
    { palabra: 'Corteza parietal', definicion: 'Integración sensorial' },
    { palabra: 'Corteza temporal', definicion: 'Procesamiento auditivo y memoria' },
    { palabra: 'Corteza occipital', definicion: 'Procesamiento visual' },
    { palabra: 'Tronco encefálico', definicion: 'Funciones vitales' },
    { palabra: 'Tálamo', definicion: 'Relé sensorial' },
    { palabra: 'Hipotálamo', definicion: 'Regulación hormonal' }
  ].slice(0, cantidad);
}

export default function EntrenamientoDiarioMemoryMatch() {
  const navigate = useNavigate();
  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [cartasVolteadas, setCartasVolteadas] = useState<number[]>([]);
  const [paresEncontrados, setParesEncontrados] = useState<number>(0);
  const [tiempo, setTiempo] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [juegoCompletado, setJuegoCompletado] = useState<boolean>(false);
  const [perfecto, setPerfecto] = useState<boolean>(false);
  const [intentos, setIntentos] = useState<number>(0);
  const [racha, setRacha] = useState<number>(0);

  // Inicializar juego
  const iniciarJuego = useCallback((nivelSeleccionado?: Nivel) => {
    const nivelActual = nivelSeleccionado || nivel;
    if (!nivelActual) return;
    setNivel(nivelActual);
    const [filas, columnas] = nivelActual.grid.split('x').map(Number);
    const totalCartas = filas * columnas;
    const paresNecesarios = totalCartas / 2;
    const paresSeleccionados = PARES_EJEMPLO
      .sort(() => Math.random() - 0.5)
      .slice(0, paresNecesarios);
    const nuevasCartas: Carta[] = [];
    paresSeleccionados.forEach(par => {
      nuevasCartas.push({
        id: par.id,
        contenido: par.contenido,
        tipo: par.tipo,
        parejaId: par.parejaId,
        volteada: false,
        emparejada: false
      });
      nuevasCartas.push({
        id: par.parejaId,
        contenido: par.contenido,
        tipo: par.tipo === 'imagen' ? 'texto' : 'imagen',
        parejaId: par.id,
        volteada: false,
        emparejada: false
      });
    });
    setCartas(nuevasCartas.sort(() => Math.random() - 0.5));
    setCartasVolteadas([]);
    setParesEncontrados(0);
    setTiempo(nivelActual.tiempo);
    setXp(0);
    setJuegoCompletado(false);
    setPerfecto(false);
    setIntentos(0);
  }, [nivel]);

  // Efecto para el timer
  useEffect(() => {
    if (nivel && tiempo > 0 && !juegoCompletado) {
      const timer = setInterval(() => {
        setTiempo(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (tiempo === 0 && !juegoCompletado && nivel) {
      setJuegoCompletado(true);
    }
  }, [tiempo, juegoCompletado, nivel]);

  // Manejar clic en carta
  const voltearCarta = (id: number) => {
    if (!nivel || cartasVolteadas.length === 2 || cartas.find(c => c.id === id)?.emparejada) return;
    const nuevasCartas = cartas.map(carta =>
      carta.id === id ? { ...carta, volteada: true } : carta
    );
    setCartas(nuevasCartas);
    setCartasVolteadas([...cartasVolteadas, id]);
    if (cartasVolteadas.length === 1) {
      setIntentos(prev => prev + 1);
      const primeraCarta = cartas.find(c => c.id === cartasVolteadas[0]);
      const segundaCarta = cartas.find(c => c.id === id);
      if (primeraCarta?.parejaId === id) {
        setTimeout(() => {
          setCartas(cartas.map(carta =>
            carta.id === primeraCarta.id || carta.id === id
              ? { ...carta, emparejada: true }
              : carta
          ));
          setCartasVolteadas([]);
          setParesEncontrados(prev => prev + 1);
          setXp(prev => prev + 5);
        }, 500);
      } else {
        setTimeout(() => {
          setCartas(cartas.map(carta =>
            carta.id === primeraCarta?.id || carta.id === id
              ? { ...carta, volteada: false }
              : carta
          ));
          setCartasVolteadas([]);
        }, 1000);
      }
    }
  };

  // Verificar si el juego está completo
  useEffect(() => {
    if (nivel && paresEncontrados === cartas.length / 2 && !juegoCompletado) {
      setJuegoCompletado(true);
      setXp(prev => prev + 10); // Bonus por completar
      if (intentos === paresEncontrados) {
        setPerfecto(true);
      }
      // Guardar XP global y racha diaria
      const xpGlobal = parseInt(localStorage.getItem('xp_global') || '0', 10) + xp + 10;
      localStorage.setItem('xp_global', xpGlobal.toString());
      // Racha diaria
      const hoy = new Date().toISOString().slice(0, 10);
      const ultimaFecha = localStorage.getItem('entrenamiento_ultimo_dia');
      let nuevaRacha = 1;
      if (ultimaFecha) {
        const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (ultimaFecha === ayer) {
          nuevaRacha = parseInt(localStorage.getItem('entrenamiento_racha') || '0', 10) + 1;
        }
      }
      localStorage.setItem('entrenamiento_ultimo_dia', hoy);
      localStorage.setItem('entrenamiento_racha', nuevaRacha.toString());
      setRacha(nuevaRacha);
    }
  }, [paresEncontrados, cartas.length, juegoCompletado, intentos, nivel, xp]);

  // Al finalizar el juego (cuando juegoCompletado pasa a true)
  useEffect(() => {
    if (juegoCompletado) {
      localStorage.setItem('modulo2_usado', 'true');
    }
  }, [juegoCompletado]);

  // Mostrar selector de nivel si no hay nivel seleccionado
  if (!nivel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-[#0a1826] to-[#10131a]">
        <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-cyan-400/30 flex flex-col items-center animate-fadein-sci-fi">
          <h2 className="text-3xl font-bold mb-6 text-cyan-200 font-orbitron animate-glow-sci-fi">Selecciona tu nivel</h2>
          {NIVELES.map(n => (
            <button
              key={n.nombre}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all text-lg animate-glow-sci-fi mb-4 w-full"
              onClick={() => iniciarJuego(n)}
            >
              {n.nombre}
            </button>
          ))}
          <button className="bg-cyan-700 hover:bg-cyan-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all text-lg mt-2" onClick={() => navigate('/centro-entrenamiento')}>Volver al Centro</button>
        </div>
      </div>
    );
  }

  // Pantalla de resultados
  if (juegoCompletado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-[#0a1826] to-[#10131a]">
        <button onClick={() => navigate('/centro-entrenamiento')} className="absolute top-6 right-6 bg-cyan-700 hover:bg-cyan-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-lg z-50">×</button>
        <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-cyan-400/30 flex flex-col items-center animate-fadein-sci-fi">
          <h2 className="text-3xl font-bold mb-6 text-cyan-200 font-orbitron animate-glow-sci-fi">¡Entrenamiento Completado!</h2>
          <div className="mb-2 text-lg text-cyan-100">XP ganada: <span className="font-bold text-purple-400">{xp}</span></div>
          <div className="mb-2 text-lg text-cyan-100">Intentos: <span className="font-bold text-cyan-300">{intentos}</span></div>
          <div className="mb-2 text-lg text-cyan-100">Racha diaria: <span className="font-bold text-yellow-300">{racha}</span></div>
          {perfecto && (
            <div className="mb-6 text-lg text-yellow-300 font-bold text-center animate-glow-sci-fi">
              🏅 ¡Insignia "Mente Láser" desbloqueada!
            </div>
          )}
          {racha >= 5 && (
            <div className="mb-6 text-lg text-green-400 font-bold text-center animate-glow-sci-fi">
              ✨ ¡Mejora de avatar desbloqueada por 5 días seguidos!
            </div>
          )}
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-all text-lg animate-glow-sci-fi mb-2" onClick={() => iniciarJuego(nivel)}>Jugar de nuevo</button>
          <button className="bg-cyan-700 hover:bg-cyan-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all text-lg" onClick={() => navigate('/centro-entrenamiento')}>Volver al Centro</button>
        </div>
      </div>
    );
  }

  // Pantalla principal del juego
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-[#0a1826] to-[#10131a]">
      <button onClick={() => navigate('/centro-entrenamiento')} className="fixed top-6 right-6 bg-cyan-700 hover:bg-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold shadow-lg z-50">×</button>
      <div className="bg-[#0e2236]/90 rounded-2xl shadow-2xl p-8 w-full max-w-4xl border border-cyan-400/30 flex flex-col items-center animate-fadein-sci-fi">
        <div className="flex justify-between w-full mb-6">
          <div className="text-cyan-200 font-orbitron text-xl">Nivel: {nivel.nombre}</div>
          <div className="text-cyan-200 font-orbitron text-xl">Tiempo: {tiempo}s</div>
          <div className="text-cyan-200 font-orbitron text-xl">XP: {xp}</div>
        </div>
        <div className={`grid ${nivel.grid === '4x4' ? 'grid-cols-4' : nivel.grid === '5x5' ? 'grid-cols-5' : 'grid-cols-6'} gap-6`}>
          {cartas.map((carta, idx) => (
            <button
              key={carta.id}
              onClick={() => voltearCarta(carta.id)}
              className={`relative aspect-square w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-400/40
                ${carta.volteada ? 'bg-cyan-700 border-cyan-400 scale-105 flip-card' : 'bg-cyan-900 border-cyan-400/20'}
                ${carta.emparejada ? 'opacity-50 grayscale' : ''}`}
              style={{ perspective: '800px' }}
            >
              <div className={`w-full h-full flex items-center justify-center p-2 transition-transform duration-500 ${carta.volteada ? 'rotate-y-180' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}>
                {carta.volteada ? (
                  carta.tipo === 'imagen' ? (
                    carta.contenido ? (
                      <img
                        src={carta.contenido}
                        alt="Carta"
                        className="w-24 h-24 md:w-28 md:h-28 object-contain rounded-xl bg-black/30 shadow-lg"
                        style={{ maxWidth: '90%', maxHeight: '90%' }}
                      />
                    ) : (
                      <span className="text-5xl">🧠</span>
                    )
                  ) : (
                    <span className="text-cyan-100 text-lg md:text-xl font-bold text-center px-2 break-words">
                      {carta.contenido || `Palabra ${idx + 1}`}
                    </span>
                  )
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 