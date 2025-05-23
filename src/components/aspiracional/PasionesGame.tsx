import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PAIRES_PASIONES = [
  ['Crear cosas nuevas', 'Resolver problemas'],
  ['Enseñar', 'Aprender'],
  ['Liderar equipos', 'Trabajar en solitario'],
  ['Innovar', 'Mejorar lo existente'],
  ['Ayudar a otros', 'Superarme a mí mismo'],
  ['Explorar el mundo', 'Profundizar en un tema'],
  ['Arte y creatividad', 'Ciencia y lógica'],
];

const FRASES_MOTIVACION = [
  '¡Tus pasiones son el combustible de tu propósito!',
  'Haz de tus pasiones tu motor diario.',
  'Cuando sigues tus pasiones, el éxito es inevitable.',
  'Tu ADN de pasiones te hace único. ¡Exprésalo!',
];

export default function PasionesGame() {
  const [ronda, setRonda] = useState(0);
  const [xp, setXp] = useState(0);
  const [monedas, setMonedas] = useState(0);
  const [selecciones, setSelecciones] = useState<string[]>([]);
  const [finalizado, setFinalizado] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const playSound = (type: 'select' | 'complete') => {
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

  const handleSeleccion = (pas: string) => {
    setSelecciones([...selecciones, pas]);
    setXp(xp + 10);
    setMonedas(monedas + 5);
    playSound('select');
    if (ronda < PAIRES_PASIONES.length - 1) {
      setTimeout(() => setRonda(ronda + 1), 350);
    } else {
      setTimeout(() => setFinalizado(true), 400);
      setTimeout(() => playSound('complete'), 400);
    }
  };

  const topPasiones = () => {
    const count: Record<string, number> = {};
    selecciones.forEach(p => { count[p] = (count[p] || 0) + 1; });
    return Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([p]) => p);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-900 via-purple-900 to-blue-900 text-white p-8">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex justify-between items-center mb-8 w-full max-w-2xl">
          <div className="flex gap-4">
            <div className="bg-pink-500/20 px-4 py-2 rounded-lg">XP: {xp}</div>
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
          Pasiones: ¿Qué te emociona más?
        </h1>
        {!finalizado ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={ronda}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="text-lg text-cyan-200 mb-2 font-orbitron">Elige la opción que más te emocione:</div>
              <div className="flex gap-8 w-full justify-center">
                {PAIRES_PASIONES[ronda].map((pas, idx) => (
                  <motion.button
                    key={pas}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.08 }}
                    onClick={() => handleSeleccion(pas)}
                    className="bg-pink-500/30 hover:bg-pink-500/50 px-8 py-6 rounded-2xl font-bold text-xl shadow-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-pink-300 min-w-[180px] transition-all"
                  >
                    {pas}
                  </motion.button>
                ))}
              </div>
              <div className="text-sm text-cyan-100 mt-4">Ronda {ronda + 1} de {PAIRES_PASIONES.length}</div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-pink-500/20 to-blue-500/20 p-6 rounded-xl text-center"
          >
            <h3 className="text-xl font-semibold mb-2 font-orbitron">¡Este es tu ADN de Pasiones!</h3>
            <div className="flex flex-wrap gap-4 justify-center mb-4 mt-2">
              {topPasiones().map((p, i) => (
                <span key={p} className="bg-pink-500/40 px-6 py-2 rounded-full font-bold text-lg border-2 border-pink-300/40 animate-glow-sci-fi">{p}</span>
              ))}
            </div>
            <div className="text-cyan-100 text-lg mb-2 font-orbitron">{FRASES_MOTIVACION[Math.floor(Math.random() * FRASES_MOTIVACION.length)]}</div>
            <button
              onClick={() => { setRonda(0); setSelecciones([]); setFinalizado(false); setXp(0); setMonedas(0); }}
              className="mt-4 px-6 py-2 bg-pink-600 hover:bg-pink-400 text-white rounded-full font-bold shadow"
            >
              Volver a jugar
            </button>
            <button
              onClick={() => window.history.back()}
              className="mt-4 ml-4 px-6 py-2 bg-blue-600 hover:bg-blue-400 text-white rounded-full font-bold shadow"
            >
              Volver al mapa
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 