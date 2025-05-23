import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const RETOS = [
  'Comparte un consejo útil con alguien hoy.',
  'Haz una pequeña acción ecológica y cuéntanos cuál.',
  'Reconoce el esfuerzo de un compañero o amigo.',
  'Propón una idea para mejorar tu entorno.',
  'Ayuda a alguien sin esperar nada a cambio.',
  'Comparte algo positivo en tus redes sociales.',
  'Haz una donación (de tiempo, dinero o recursos) a una causa.',
  'Reflexiona sobre una acción positiva que hiciste esta semana.',
  'Enseña algo nuevo a alguien.',
  'Escucha activamente a alguien que lo necesite.'
];

const FRASES_MOTIVACION = [
  '¡Tu impacto deja huella en el universo!',
  'Cada acción positiva suma a tu legado.',
  'El mundo es mejor gracias a ti.',
  '¡Sigue brillando y generando impacto!',
  'Tus acciones inspiran a otros a mejorar.'
];

function getRandomRetos() {
  const indices = new Set<number>();
  while (indices.size < 3) {
    indices.add(Math.floor(Math.random() * RETOS.length));
  }
  return Array.from(indices).map((i: number) => RETOS[i]);
}

function getNextResetTime() {
  const now = new Date();
  const next = new Date();
  next.setHours(24, 0, 0, 0); // próximo día a las 00:00
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    next.setDate(now.getDate() + 1);
  }
  return next.getTime();
}

function getTimeLeft(ts: number) {
  const now = Date.now();
  let diff = Math.max(0, ts - now);
  const h = Math.floor(diff / (1000 * 60 * 60));
  diff -= h * 1000 * 60 * 60;
  const m = Math.floor(diff / (1000 * 60));
  diff -= m * 1000 * 60;
  const s = Math.floor(diff / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ImpactoGame() {
  const [retos, setRetos] = useState<string[]>(getRandomRetos());
  const [retoSeleccionado, setRetoSeleccionado] = useState<string | null>(null);
  const [accion, setAccion] = useState('');
  const [xp, setXp] = useState(0);
  const [monedas, setMonedas] = useState(0);
  const [racha, setRacha] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [resetTime, setResetTime] = useState<number>(() => {
    const saved = localStorage.getItem('impacto_reset_time');
    return saved ? parseInt(saved, 10) : getNextResetTime();
  });
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(resetTime));
  const [retoHechoHoy, setRetoHechoHoy] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Cronómetro
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(resetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [resetTime]);

  // Cargar racha y si ya hizo reto hoy
  useEffect(() => {
    const rachaGuardada = parseInt(localStorage.getItem('impacto_racha') || '0', 10);
    setRacha(rachaGuardada);
    const lastDone = localStorage.getItem('impacto_last_done');
    const today = new Date().toISOString().slice(0, 10);
    setRetoHechoHoy(lastDone === today);
  }, []);

  // Guardar racha y reset time
  useEffect(() => {
    localStorage.setItem('impacto_racha', racha.toString());
    localStorage.setItem('impacto_reset_time', resetTime.toString());
  }, [racha, resetTime]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const playSound = (type: 'select' | 'register' | 'complete') => {
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
      case 'register':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.09, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.18);
        break;
      case 'complete':
        const notes = [523.25, 659.25, 783.99, 1046.50];
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

  const handleSeleccionarReto = (reto: string) => {
    setRetoSeleccionado(reto);
    playSound('select');
  };

  const handleRegistrarAccion = () => {
    if (!accion.trim()) return;
    setXp(xp + 20 + racha * 5);
    setMonedas(monedas + 10 + racha * 2);
    setRacha(racha + 1);
    setFeedback(FRASES_MOTIVACION[Math.floor(Math.random() * FRASES_MOTIVACION.length)]);
    setFinalizado(true);
    setRetoHechoHoy(true);
    // Guardar acción en historial
    const historial = JSON.parse(localStorage.getItem('impacto_historial') || '[]');
    historial.push({ fecha: new Date().toISOString(), reto: retoSeleccionado, accion });
    localStorage.setItem('impacto_historial', JSON.stringify(historial));
    // Guardar fecha de hoy
    localStorage.setItem('impacto_last_done', new Date().toISOString().slice(0, 10));
    // Setear próximo reset
    const next = getNextResetTime();
    setResetTime(next);
    localStorage.setItem('impacto_reset_time', next.toString());
    playSound('register');
    setTimeout(() => playSound('complete'), 400);
  };

  const handleNuevoDia = () => {
    setRetos(getRandomRetos());
    setRetoSeleccionado(null);
    setAccion('');
    setFinalizado(false);
    setFeedback('');
    setRetoHechoHoy(false);
    // Resetear XP y monedas si quieres (opcional)
  };

  // Mensaje motivacional fijo
  const mensajeMotivacional = (
    <div className="mt-6 mb-4 text-center text-lg text-cyan-200 font-orbitron bg-black/30 rounded-xl px-6 py-4 shadow-lg max-w-2xl mx-auto">
      Recuerda: el verdadero impacto no es para nosotros, sino para <b>ti</b> y el mundo. Si no cumples el reto, te lo pierdes <b>tú</b>, no la app. ¡Hazlo por ti!
    </div>
  );

  // Si ya hizo el reto hoy, solo muestra feedback y cronómetro
  if (retoHechoHoy && !finalizado) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-fadein-sci-fi">
        <div className="flex flex-col items-center w-full max-w-2xl px-4">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 mb-8 text-3xl font-bold text-center text-white font-orbitron drop-shadow animate-glow-sci-fi"
          >
            ¡Ya completaste tu reto de impacto hoy!
          </motion.div>
          <div className="text-xl text-cyan-200 mb-4">Próximo reto disponible en:</div>
          <div className="text-4xl font-mono text-cyan-300 mb-8 animate-pulse-slow">{timeLeft}</div>
          {mensajeMotivacional}
          <button
            onClick={() => window.history.back()}
            className="mt-8 px-8 py-3 bg-blue-700 hover:bg-blue-500 text-white rounded-full font-bold shadow-lg text-lg transition-all"
          >
            Volver al mapa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-fadein-sci-fi">
      <div className="flex flex-col items-center w-full max-w-2xl px-4">
        <div className="flex flex-wrap gap-4 justify-center mt-8 mb-8 w-full">
          <div className="bg-purple-500/30 px-6 py-2 rounded-lg text-lg font-bold text-purple-100 shadow">XP: {xp}</div>
          <div className="bg-yellow-500/30 px-6 py-2 rounded-lg text-lg font-bold text-yellow-100 shadow">Monedas: {monedas}</div>
          <div className="bg-blue-500/30 px-6 py-2 rounded-lg text-lg font-bold text-blue-100 shadow">Racha: {racha} días</div>
          <button
            onClick={() => window.history.back()}
            className="bg-red-500/30 hover:bg-red-500/50 px-6 py-2 rounded-lg text-lg font-bold text-red-100 shadow transition-all"
          >
            Volver al mapa
          </button>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-3xl font-bold text-center text-white font-orbitron drop-shadow animate-glow-sci-fi"
        >
          Impacto Diario: ¡Deja tu huella!
        </motion.h1>
        {mensajeMotivacional}
        {!retoSeleccionado && !finalizado && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8 w-full"
          >
            <div className="text-lg text-purple-200 mb-2 font-orbitron">Elige tu reto de impacto para hoy:</div>
            <div className="flex flex-wrap gap-6 justify-center w-full">
              {retos.map(reto => (
                <motion.button
                  key={reto}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.08 }}
                  onClick={() => handleSeleccionarReto(reto)}
                  className="px-8 py-5 rounded-2xl font-bold text-lg border-2 border-purple-300/20 bg-purple-500/30 text-purple-100 hover:bg-purple-500/60 transition-all shadow-lg w-full max-w-md"
                >
                  {reto}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {retoSeleccionado && !finalizado && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8 mt-8 w-full"
          >
            <div className="text-lg text-purple-200 mb-2 font-orbitron">Describe brevemente tu acción o reflexión:</div>
            <div className="w-full flex flex-col items-center">
              <textarea
                value={accion}
                onChange={e => setAccion(e.target.value)}
                rows={4}
                className="w-full max-w-lg bg-purple-900/40 border-2 border-purple-300/20 rounded-xl p-4 text-white placeholder-purple-200/40 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all mb-4"
                placeholder="¿Qué hiciste o cómo cumpliste el reto?"
              />
              <button
                onClick={handleRegistrarAccion}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-400 text-white rounded-full font-bold shadow text-lg mt-2 transition-all"
                disabled={!accion.trim()}
              >
                Registrar acción
              </button>
            </div>
          </motion.div>
        )}
        {finalizado && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-purple-500/30 to-blue-500/30 p-8 rounded-2xl text-center shadow-xl w-full max-w-xl"
          >
            <h3 className="text-2xl font-semibold mb-4 font-orbitron text-cyan-100 animate-glow-sci-fi">¡Reto completado!</h3>
            <div className="text-purple-100 text-lg mb-4 font-orbitron">{feedback}</div>
            <div className="text-cyan-200 text-base mb-4">Próximo reto disponible en:</div>
            <div className="text-3xl font-mono text-cyan-300 mb-6 animate-pulse-slow">{timeLeft}</div>
            <div className="flex justify-center gap-6 mt-4">
              <button
                onClick={handleNuevoDia}
                disabled={timeLeft !== '00:00:00'}
                className={`px-8 py-3 rounded-full font-bold shadow text-lg transition-all ${timeLeft === '00:00:00' ? 'bg-purple-600 hover:bg-purple-400 text-white' : 'bg-gray-500/40 text-gray-300 cursor-not-allowed'}`}
              >
                Nuevo reto
              </button>
              <button
                onClick={() => window.history.back()}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-400 text-white rounded-full font-bold shadow text-lg transition-all"
              >
                Volver al mapa
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 