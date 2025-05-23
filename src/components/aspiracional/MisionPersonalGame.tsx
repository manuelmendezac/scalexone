import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const PALABRAS_INICIALES = [
  'Creatividad', 'Impacto', 'Aprendizaje', 'Innovación', 'Liderazgo',
  'Equilibrio', 'Crecimiento', 'Excelencia', 'Colaboración', 'Transformación',
  'Sabiduría', 'Libertad', 'Propósito', 'Pasión', 'Éxito'
];

interface Palabra {
  id: string;
  texto: string;
  seleccionada: boolean;
}

export default function MisionPersonalGame() {
  const [palabras, setPalabras] = useState<Palabra[]>(
    PALABRAS_INICIALES.map((texto, index) => ({
      id: `palabra-${index}`,
      texto,
      seleccionada: false
    }))
  );
  const [palabrasSeleccionadas, setPalabrasSeleccionadas] = useState<Palabra[]>([]);
  const [xp, setXp] = useState(0);
  const [monedas, setMonedas] = useState(0);
  const [fraseGenerada, setFraseGenerada] = useState('');
  const [showInstrucciones, setShowInstrucciones] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const playSound = (type: 'select' | 'deselect' | 'complete') => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    switch (type) {
      case 'select':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      case 'deselect':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.07, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'complete':
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          gain.gain.setValueAtTime(0.09, ctx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.18);
          osc.start(ctx.currentTime + i * 0.1);
          osc.stop(ctx.currentTime + i * 0.1 + 0.18);
        });
        break;
    }
  };

  const handleSeleccionar = (palabra: Palabra) => {
    if (palabra.seleccionada || palabrasSeleccionadas.length >= 3) return;
    const nuevasPalabras = palabras.map(p =>
      p.id === palabra.id ? { ...p, seleccionada: true } : p
    );
    setPalabras(nuevasPalabras);
    const nuevasSeleccionadas = [...palabrasSeleccionadas, palabra];
    setPalabrasSeleccionadas(nuevasSeleccionadas);
    setXp(xp + 10);
    setMonedas(monedas + 5);
    if (nuevasSeleccionadas.length === 3) {
      setFraseGenerada(generarFrase(nuevasSeleccionadas));
    }
    playSound('select');
  };

  const handleDeseleccionar = (palabra: Palabra) => {
    const nuevasSeleccionadas = palabrasSeleccionadas.filter(p => p.id !== palabra.id);
    setPalabrasSeleccionadas(nuevasSeleccionadas);
    setPalabras(palabras.map(p =>
      p.id === palabra.id ? { ...p, seleccionada: false } : p
    ));
    setFraseGenerada('');
    playSound('deselect');
  };

  const generarFrase = (palabras: Palabra[]): string => {
    const frases = [
      `Tu misión personal se centra en ${palabras[0].texto} y ${palabras[1].texto}, buscando ${palabras[2].texto} en todo lo que haces.`,
      `Con ${palabras[0].texto} y ${palabras[1].texto} como pilares, tu propósito es alcanzar ${palabras[2].texto}.`,
      `Tu camino está guiado por ${palabras[0].texto}, impulsado por ${palabras[1].texto}, hacia ${palabras[2].texto}.`
    ];
    return frases[Math.floor(Math.random() * frases.length)];
  };

  useEffect(() => {
    if (palabrasSeleccionadas.length === 3 && fraseGenerada) {
      playSound('complete');
    }
    // eslint-disable-next-line
  }, [fraseGenerada]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8">
      {/* Panel de instrucciones */}
      {showInstrucciones && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black/70">
          <div className="bg-gradient-to-br from-cyan-900/90 to-blue-900/90 border border-cyan-400/30 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center animate-fadein-sci-fi">
            <h2 className="text-2xl font-bold text-cyan-200 mb-2 font-orbitron">Construye tu Propósito</h2>
            <p className="text-cyan-100 mb-4">Haz clic en las palabras que más te representen para agregarlas a <b>Tu Núcleo de Propósito</b>.<br/>Cuando completes tu selección, recibirás una frase personalizada.</p>
            <button onClick={() => setShowInstrucciones(false)} className="mt-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-400 text-white rounded-full font-bold shadow">¡Empezar!</button>
          </div>
        </div>
      )}
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex justify-between items-center mb-8 w-full max-w-4xl">
          <div className="flex gap-4">
            <div className="bg-blue-500/20 px-4 py-2 rounded-lg">XP: {xp}</div>
            <div className="bg-yellow-500/20 px-4 py-2 rounded-lg">Monedas: {monedas}</div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors"
          >
            Volver al mapa
          </button>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8 font-orbitron">
          Misión Personal: Construye tu Propósito
        </h1>
        <div className="grid grid-cols-3 gap-8 w-full max-w-4xl">
          {/* Zona de palabras disponibles */}
          <div className="col-span-2 bg-gray-800/50 rounded-xl p-6 min-h-[400px]">
            <h2 className="text-xl mb-4 font-orbitron">Palabras Disponibles</h2>
            <div className="flex flex-wrap gap-3">
              {palabras.map(palabra => !palabra.seleccionada && (
                <motion.button
                  key={palabra.id}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.08 }}
                  onClick={() => handleSeleccionar(palabra)}
                  className={`bg-blue-500/20 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-500/30 transition-colors font-bold border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-300`}
                  disabled={palabrasSeleccionadas.length >= 3}
                >
                  {palabra.texto}
                </motion.button>
              ))}
            </div>
          </div>
          {/* Zona de núcleo */}
          <div className="bg-purple-500/20 rounded-xl p-6 min-h-[400px] flex flex-col border-2 border-cyan-400/30">
            <h2 className="text-xl mb-4 font-orbitron">Tu Núcleo de Propósito</h2>
            <div className="flex-1 flex flex-wrap gap-3 content-start">
              {palabrasSeleccionadas.map(palabra => (
                <motion.button
                  key={palabra.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeseleccionar(palabra)}
                  className="bg-purple-500/40 px-4 py-2 rounded-lg font-bold border-2 border-cyan-400/40 cursor-pointer hover:bg-purple-500/60 transition-colors"
                  title="Quitar palabra"
                >
                  {palabra.texto}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-cyan-200 mt-2">Haz clic en una palabra para quitarla.</p>
          </div>
        </div>
        {/* Frase generada */}
        {fraseGenerada && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-2 font-orbitron">Tu Frase de Propósito:</h3>
            <p className="text-lg">{fraseGenerada}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 