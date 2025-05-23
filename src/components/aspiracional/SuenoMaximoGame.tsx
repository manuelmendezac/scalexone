import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PREGUNTAS = [
  '¿Cómo sería tu vida ideal si todo fuera posible?',
  '¿Qué meta te haría sentir realmente realizado/a?',
  '¿Qué legado te gustaría dejar en el mundo?',
];

const FRASES_EPICAS = [
  '¡Tu sueño máximo es la estrella que guiará tu viaje!',
  'Cada paso que das acerca tu meta a la realidad.',
  'El universo conspira a favor de quienes se atreven a soñar en grande.',
  '¡Hoy has sembrado la semilla de tu futuro legendario!',
  'Tu constelación personal brilla con fuerza única.'
];

export default function SuenoMaximoGame() {
  const [fase, setFase] = useState<'preguntas' | 'meta' | 'pasos' | 'firma' | 'constelacion' | 'final'>('preguntas');
  const [respuestas, setRespuestas] = useState<string[]>(['', '', '']);
  const [meta, setMeta] = useState('');
  const [pasos, setPasos] = useState<string[]>(['']);
  const [obstaculos, setObstaculos] = useState<string[]>(['']);
  const [firma, setFirma] = useState('');
  const [feedback, setFeedback] = useState('');
  const [xp, setXp] = useState(0);
  const [monedas, setMonedas] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);
  const playSound = (type: 'select' | 'advance' | 'complete') => {
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
      case 'advance':
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

  // Animación de constelación (mock)
  const renderConstelacion = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center my-8"
    >
      <div className="relative w-72 h-72">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400/80 text-yellow-900 font-bold text-lg rounded-full flex items-center justify-center shadow-xl animate-pulse-slow" style={{width: 90, height: 90}}>
          {meta || 'Sueño'}
        </div>
        {pasos.map((p, i) => (
          <div key={i} className="absolute" style={{
            left: 120 + 90 * Math.cos((2 * Math.PI * i) / pasos.length),
            top: 120 + 90 * Math.sin((2 * Math.PI * i) / pasos.length)
          }}>
            <div className="bg-blue-200/80 text-blue-900 rounded-full px-4 py-2 text-xs font-bold shadow animate-glow-sci-fi">
              {p || 'Paso'}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-yellow-200 text-lg font-orbitron animate-glow-sci-fi">¡Tu constelación está lista!</div>
    </motion.div>
  );

  // Avance de preguntas
  const handleRespuesta = (idx: number, val: string) => {
    const nuevas = [...respuestas];
    nuevas[idx] = val;
    setRespuestas(nuevas);
    playSound('select');
  };

  // Añadir/quitar pasos y obstáculos
  const addPaso = () => setPasos([...pasos, '']);
  const setPaso = (i: number, val: string) => setPasos(pasos.map((p, idx) => idx === i ? val : p));
  const removePaso = (i: number) => setPasos(pasos.filter((_, idx) => idx !== i));
  const addObstaculo = () => setObstaculos([...obstaculos, '']);
  const setObstaculo = (i: number, val: string) => setObstaculos(obstaculos.map((o, idx) => idx === i ? val : o));
  const removeObstaculo = (i: number) => setObstaculos(obstaculos.filter((_, idx) => idx !== i));

  // Guardar y pasar de fase
  const handleGuardarMeta = () => {
    setFase('pasos');
    setXp(xp + 50);
    setMonedas(monedas + 25);
    playSound('advance');
  };
  const handleGuardarPasos = () => {
    setFase('firma');
    setXp(xp + 30);
    setMonedas(monedas + 15);
    playSound('advance');
  };
  const handleFirmar = () => {
    setFase('constelacion');
    setXp(xp + 50);
    setMonedas(monedas + 50);
    playSound('complete');
    setTimeout(() => {
      setFeedback(FRASES_EPICAS[Math.floor(Math.random() * FRASES_EPICAS.length)]);
      setFase('final');
    }, 2500);
  };

  // Reiniciar
  const reiniciar = () => {
    setFase('preguntas');
    setRespuestas(['', '', '']);
    setMeta('');
    setPasos(['']);
    setObstaculos(['']);
    setFirma('');
    setFeedback('');
    setXp(0);
    setMonedas(0);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 via-purple-900 to-blue-900 text-white p-8">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="flex flex-wrap gap-4 justify-center mt-8 mb-8 w-full">
          <div className="bg-yellow-400/30 px-6 py-2 rounded-lg text-lg font-bold text-yellow-100 shadow">XP: {xp}</div>
          <div className="bg-blue-400/30 px-6 py-2 rounded-lg text-lg font-bold text-blue-100 shadow">Monedas: {monedas}</div>
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
          className="mb-8 text-3xl font-bold text-center text-yellow-100 font-orbitron drop-shadow animate-glow-sci-fi"
        >
          Sueño Máximo: ¡Declara tu meta épica!
        </motion.h1>
        <AnimatePresence mode="wait">
          {fase === 'preguntas' && (
            <motion.div
              key="preguntas"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center gap-8 w-full max-w-xl bg-black/30 rounded-2xl p-8 shadow-xl"
            >
              <div className="text-lg text-yellow-200 mb-2 font-orbitron">Visualiza tu futuro y responde:</div>
              {PREGUNTAS.map((q, i) => (
                <div key={i} className="w-full">
                  <div className="mb-2 font-bold text-yellow-100">{q}</div>
                  <textarea
                    value={respuestas[i]}
                    onChange={e => handleRespuesta(i, e.target.value)}
                    rows={2}
                    className="w-full bg-yellow-100/10 border-2 border-yellow-300/20 rounded-xl p-3 text-white placeholder-yellow-200/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all mb-2"
                    placeholder="Tu respuesta..."
                  />
                </div>
              ))}
              <button
                onClick={() => setFase('meta')}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full font-bold shadow text-lg mt-2 transition-all"
                disabled={respuestas.some(r => !r.trim())}
              >
                Siguiente: Declara tu meta
              </button>
            </motion.div>
          )}
          {fase === 'meta' && (
            <motion.div
              key="meta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center gap-8 w-full max-w-xl bg-black/30 rounded-2xl p-8 shadow-xl"
            >
              <div className="text-lg text-yellow-200 mb-2 font-orbitron">Redacta tu Sueño Máximo en una frase poderosa:</div>
              <textarea
                value={meta}
                onChange={e => setMeta(e.target.value)}
                rows={2}
                className="w-full bg-yellow-100/10 border-2 border-yellow-300/20 rounded-xl p-3 text-white placeholder-yellow-200/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all mb-2"
                placeholder="Ejemplo: Crear una fundación que transforme vidas en mi país."
              />
              <button
                onClick={handleGuardarMeta}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full font-bold shadow text-lg mt-2 transition-all"
                disabled={!meta.trim()}
              >
                Siguiente: Pasos y obstáculos
              </button>
            </motion.div>
          )}
          {fase === 'pasos' && (
            <motion.div
              key="pasos"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center gap-8 w-full max-w-xl bg-black/30 rounded-2xl p-8 shadow-xl"
            >
              <div className="text-lg text-yellow-200 mb-2 font-orbitron">¿Cuáles son los primeros pasos y obstáculos?</div>
              <div className="w-full">
                <div className="font-bold text-yellow-100 mb-2">Primeros pasos:</div>
                {pasos.map((p, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={p}
                      onChange={e => setPaso(i, e.target.value)}
                      className="flex-1 bg-yellow-100/10 border-2 border-yellow-300/20 rounded-xl p-2 text-white placeholder-yellow-200/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                      placeholder={`Paso ${i + 1}`}
                    />
                    {pasos.length > 1 && (
                      <button onClick={() => removePaso(i)} className="text-red-400 font-bold">✕</button>
                    )}
                  </div>
                ))}
                <button onClick={addPaso} className="text-yellow-300 hover:text-yellow-100 text-sm font-bold mt-1">+ Añadir paso</button>
              </div>
              <div className="w-full mt-4">
                <div className="font-bold text-yellow-100 mb-2">Obstáculos posibles:</div>
                {obstaculos.map((o, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      value={o}
                      onChange={e => setObstaculo(i, e.target.value)}
                      className="flex-1 bg-yellow-100/10 border-2 border-yellow-300/20 rounded-xl p-2 text-white placeholder-yellow-200/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                      placeholder={`Obstáculo ${i + 1}`}
                    />
                    {obstaculos.length > 1 && (
                      <button onClick={() => removeObstaculo(i)} className="text-red-400 font-bold">✕</button>
                    )}
                  </div>
                ))}
                <button onClick={addObstaculo} className="text-yellow-300 hover:text-yellow-100 text-sm font-bold mt-1">+ Añadir obstáculo</button>
              </div>
              <button
                onClick={handleGuardarPasos}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full font-bold shadow text-lg mt-2 transition-all"
                disabled={pasos.some(p => !p.trim())}
              >
                Siguiente: Firma tu compromiso
              </button>
            </motion.div>
          )}
          {fase === 'firma' && (
            <motion.div
              key="firma"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center gap-8 w-full max-w-xl bg-black/30 rounded-2xl p-8 shadow-xl"
            >
              <div className="text-lg text-yellow-200 mb-2 font-orbitron">Firma tu compromiso con tu Sueño Máximo:</div>
              <textarea
                value={firma}
                onChange={e => setFirma(e.target.value)}
                rows={2}
                className="w-full bg-yellow-100/10 border-2 border-yellow-300/20 rounded-xl p-3 text-white placeholder-yellow-200/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all mb-2"
                placeholder="Ejemplo: Me comprometo a dar mi mejor esfuerzo cada día para lograr mi sueño."
              />
              <button
                onClick={handleFirmar}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full font-bold shadow text-lg mt-2 transition-all"
                disabled={!firma.trim()}
              >
                Firmar y visualizar constelación
              </button>
            </motion.div>
          )}
          {fase === 'constelacion' && (
            <motion.div
              key="constelacion"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center gap-8 w-full max-w-xl bg-black/30 rounded-2xl p-8 shadow-xl"
            >
              <div className="text-lg text-yellow-200 mb-2 font-orbitron">¡Visualiza tu constelación de meta!</div>
              {renderConstelacion()}
              <div className="text-yellow-100 text-lg mt-4 font-orbitron animate-glow-sci-fi">Guardando tu sueño en el universo...</div>
              <button
                onClick={() => setFase('final')}
                className="mt-8 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full font-bold shadow text-lg transition-all"
              >
                Ver declaración final
              </button>
            </motion.div>
          )}
          {fase === 'final' && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="flex flex-col items-center gap-8 w-full max-w-2xl bg-gradient-to-br from-yellow-400/30 via-purple-900/60 to-blue-900/60 rounded-2xl p-8 shadow-xl text-center"
            >
              <h3 className="text-2xl font-semibold mb-4 font-orbitron text-yellow-100 animate-glow-sci-fi">¡Sueño Máximo declarado!</h3>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="mb-6"
              >
                <div className="text-xl font-bold text-yellow-200 mb-2">Tu meta épica:</div>
                <div className="bg-yellow-100/10 border-2 border-yellow-300/20 rounded-xl p-4 text-yellow-100 text-lg font-orbitron shadow mb-4 animate-glow-sci-fi">{meta}</div>
                <div className="text-lg font-bold text-blue-200 mb-2">Primeros pasos:</div>
                <ul className="mb-4">
                  {pasos.filter(p => p.trim()).map((p, i) => (
                    <li key={i} className="text-blue-100 text-base mb-1">• {p}</li>
                  ))}
                </ul>
                <div className="text-lg font-bold text-pink-200 mb-2">Obstáculos posibles:</div>
                <ul className="mb-4">
                  {obstaculos.filter(o => o.trim()).map((o, i) => (
                    <li key={i} className="text-pink-100 text-base mb-1">• {o}</li>
                  ))}
                </ul>
                <div className="text-lg font-bold text-green-200 mb-2">Tu compromiso:</div>
                <div className="bg-green-100/10 border-2 border-green-300/20 rounded-xl p-4 text-green-100 text-base font-orbitron shadow animate-glow-sci-fi">{firma}</div>
              </motion.div>
              <div className="text-yellow-100 text-lg mb-4 font-orbitron animate-glow-sci-fi">{feedback || FRASES_EPICAS[0]}</div>
              <div className="text-yellow-200 text-base mb-4">Has desbloqueado la medalla <span className="font-bold text-yellow-300">“Soñador Galáctico”</span> 🏅</div>
              <div className="flex justify-center gap-6 mt-4">
                <button
                  onClick={reiniciar}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-white rounded-full font-bold shadow text-lg mt-2 transition-all"
                >
                  Volver a empezar
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-400 text-white rounded-full font-bold shadow text-lg mt-2 transition-all"
                >
                  Volver al mapa
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 