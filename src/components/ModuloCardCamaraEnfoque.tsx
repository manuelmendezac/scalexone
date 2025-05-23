import React, { useState, useRef } from 'react';
import { Clock, Play, Pause, CheckCircle, Award, Zap, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import useNeuroState from '../store/useNeuroState';

const mensajesIA = [
  '¡Excelente! Has completado un bloque de enfoque. Sigue así 🚀',
  '¡Tu concentración es tu superpoder! 💡',
  '¡Gran trabajo! Recuerda tomar un descanso activo. 🧘‍♂️',
  '¡Enfocado como un láser! 🔥',
];

const imagenFoco = '/images/modulos/focus-avatar-provisional.png'; // Cambia por la definitiva luego

const sonidoFinalizacion = '/sounds/gong.mp3'; // Debes agregar este archivo en public/sounds/

interface Props {
  imagen?: string;
}

export default function ModuloCardCamaraEnfoque({ imagen }: Props) {
  const [nombreBloque, setNombreBloque] = useState('Bloque de Enfoque');
  const [duracion, setDuracion] = useState(25); // minutos
  const [tiempoRestante, setTiempoRestante] = useState(25 * 60); // segundos
  const [enCurso, setEnCurso] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [historial, setHistorial] = useState<{nombre: string, duracion: number, fecha: string}[]>([]);
  const [mensajeIA, setMensajeIA] = useState('');
  const [progreso, setProgreso] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [bloquesConsecutivos, setBloquesConsecutivos] = useState(0);
  const [mostrarBadge, setMostrarBadge] = useState(false);
  const [mute, setMute] = useState(false);
  const [pulse, setPulse] = useState(false);
  const { registrarAccionCognitiva, setUserName, setAvatarUrl, userXP, userCoins, userInfo, setUserName: setGlobalUserName, setAvatarUrl: setGlobalAvatarUrl, addXP, addCoins } = useNeuroState();

  function playSound() {
    if (mute) return;
    const audio = new window.Audio(sonidoFinalizacion);
    audio.volume = 0.4;
    audio.play();
  }

  // Iniciar bloque
  function iniciarBloque() {
    setEnCurso(true);
    setFinalizado(false);
    setTiempoRestante(duracion * 60);
    setMensajeIA('');
    setPulse(false);
    timerRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setEnCurso(false);
          setFinalizado(true);
          setXp(xp + 10);
          setCoins(coins + 1);
          setHistorial([{ nombre: nombreBloque, duracion, fecha: new Date().toLocaleString() }, ...historial]);
          setMensajeIA(mensajesIA[Math.floor(Math.random() * mensajesIA.length)]);
          setProgreso(Math.min(100, progreso + 20));
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          playSound();
          setPulse(true); // Efecto de pulso
          const nuevosConsecutivos = bloquesConsecutivos + 1;
          setBloquesConsecutivos(nuevosConsecutivos);
          if (nuevosConsecutivos % 3 === 0) {
            setMostrarBadge(true);
            setTimeout(() => setMostrarBadge(false), 3500);
          }
          // --- INTEGRACIÓN CON CLON IA ---
          registrarAccionCognitiva(
            'Cámara de Enfoque',
            nombreBloque,
            new Date().toISOString()
          );
          addXP(10);
          addCoins(1);
          // --- FIN INTEGRACIÓN ---
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // Pausar
  function pausarBloque() {
    setEnCurso(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  // Reset
  function resetBloque() {
    setEnCurso(false);
    setFinalizado(false);
    setTiempoRestante(duracion * 60);
    setMensajeIA('');
    if (timerRef.current) clearInterval(timerRef.current);
  }

  // Formato mm:ss
  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  // Temporizador Sci-Fi
  const porcentaje = (duracion * 60 - tiempoRestante) / (duracion * 60);
  const gradiente = 'conic-gradient(from 0deg, #00cfff, #a259ff, #ff2df7, #00ffcc, #00cfff 100%)';

  return (
    <div className="w-full min-h-[520px] relative rounded-2xl border-4 border-[#00cfff] shadow-2xl p-0 flex flex-col gap-0 mb-10 overflow-hidden bg-gradient-to-br from-[#0a2f3c] via-[#00cfff]/30 to-[#0a2f3c]">
      {/* Badge animado "Mente en Foco" */}
      {mostrarBadge && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex flex-col items-center bg-[#00cfff]/90 border-4 border-[#00ffcc] rounded-2xl px-8 py-4 shadow-xl">
            <span className="text-3xl font-extrabold text-[#101c2c] drop-shadow-lg flex items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="16" stroke="#00ffcc" strokeWidth="4" fill="#00cfff" /><path d="M18 10v8l6 3" stroke="#101c2c" strokeWidth="3" strokeLinecap="round" /></svg>
              ¡Mente en Foco!
            </span>
            <span className="text-[#101c2c] font-bold mt-1">3 bloques consecutivos</span>
          </div>
        </div>
      )}
      {/* Cabecera: Imagen y temporizador */}
      <div className="flex flex-row items-center justify-center gap-12 w-full px-8 py-8">
        {/* Imagen principal */}
        <div className="flex flex-col items-center">
          <div className="w-40 h-40 rounded-full bg-[#0a2f3c] border-4 border-[#00cfff] shadow-[0_0_32px_0_rgba(0,207,255,0.5)] flex items-center justify-center overflow-hidden">
            <img src="/images/modulos/camaradeenfoque.png" alt="Cámara de Enfoque" className="w-32 h-32 object-cover opacity-90" />
          </div>
        </div>
        {/* Temporizador sci-fi */}
        <div className="flex flex-col items-center min-w-[200px]">
          <div className={`relative w-[180px] h-[180px] flex items-center justify-center ${pulse && finalizado ? 'animate-pulse-sci-fi' : ''}`}> 
            <div className="absolute w-full h-full rounded-full" style={{ background: gradiente, maskImage: `conic-gradient(#fff ${porcentaje * 360}deg, transparent 0deg)` }} />
            <div className="absolute w-[160px] h-[160px] rounded-full bg-[#0a2f3c] flex items-center justify-center shadow-inner" />
            <span className="absolute text-6xl font-extrabold" style={{ fontFamily: 'Orbitron, sans-serif', color: '#a259ff', textShadow: '0 0 16px #ff2df7, 0 0 32px #00cfff' }}>{formatTime(tiempoRestante)}</span>
            {/* Botón mute */}
            <button className="absolute bottom-2 right-2 bg-[#101c2c]/80 rounded-full p-2 border-2 border-[#00cfff] hover:bg-[#00cfff]/20 transition" onClick={() => setMute(m => !m)} title={mute ? 'Activar sonido' : 'Silenciar sonido'}>
              {mute ? <span role="img" aria-label="mute">🔇</span> : <span role="img" aria-label="sound">🔊</span>}
            </button>
          </div>
        </div>
      </div>
      {/* Info principal */}
      <div className="flex flex-col items-center justify-center w-full mb-2">
        <div className="text-3xl font-extrabold font-orbitron text-[#00cfff] drop-shadow-lg tracking-wide mb-1 text-center">Cámara de Enfoque</div>
        <div className="text-[#b6ffe6] text-lg mb-2 font-semibold max-w-2xl drop-shadow text-center">Optimiza tu atención y alcanza tu máximo rendimiento con bloques de trabajo personalizados y asistencia IA.</div>
        <div className="flex flex-row gap-3 items-center mb-2 justify-center">
          <span className="px-4 py-2 rounded-full bg-[#0a2f3c] border border-[#00cfff]/40 shadow text-[#00cfff] font-bold text-lg flex items-center gap-2">{xp} XP</span>
          <span className="px-4 py-2 rounded-full bg-[#0a2f3c] border border-[#00cfff]/40 shadow text-[#00cfff] font-bold text-lg flex items-center gap-2">{coins} <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-6 h-6 inline-block ml-1" /></span>
          <span className={`px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2 ${enCurso ? 'bg-yellow-400/20 text-yellow-300' : finalizado ? 'bg-green-400/20 text-green-300' : 'bg-[#00cfff]/20 text-[#00cfff]'}`}>{enCurso ? 'En curso' : finalizado ? 'Finalizado' : 'Pendiente'}</span>
        </div>
      </div>
      {/* Acciones principales */}
      <div className="flex flex-row items-center justify-center gap-6 w-full px-8 pb-4">
        <input
          className="rounded-xl px-4 py-2 text-lg bg-[#0a2f3c] border border-[#00cfff] text-[#b6ffe6] focus:outline-none focus:ring-2 focus:ring-[#00cfff]/40 font-mono w-64"
          placeholder="Nombre del bloque"
          value={nombreBloque}
          onChange={e => setNombreBloque(e.target.value)}
          maxLength={40}
          disabled={enCurso}
        />
        <input
          type="number"
          min={5}
          max={120}
          className="rounded-xl px-4 py-2 text-lg bg-[#0a2f3c] border border-[#00cfff] text-[#b6ffe6] focus:outline-none focus:ring-2 focus:ring-[#00cfff]/40 font-mono w-28"
          value={duracion}
          onChange={e => setDuracion(Number(e.target.value))}
          disabled={enCurso}
        />
        <span className="text-[#00cfff] font-bold">min</span>
        {!enCurso && !finalizado && (
          <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#00cfff] to-[#00ffcc] text-[#101c2c] font-bold text-lg shadow-lg border-2 border-[#00cfff] hover:scale-105 transition" onClick={iniciarBloque}>
            <Play className="w-6 h-6" /> Iniciar
          </button>
        )}
        {enCurso && (
          <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#00cfff] to-[#00ffcc] text-[#101c2c] font-bold text-lg shadow-lg border-2 border-[#00cfff] hover:scale-105 transition" onClick={pausarBloque}>
            <Pause className="w-6 h-6" /> Pausar
          </button>
        )}
        {(enCurso || finalizado) && (
          <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#0a2f3c] border border-[#00cfff] text-[#00cfff] font-bold text-lg shadow hover:bg-[#00cfff]/10 transition" onClick={resetBloque}>
            <CheckCircle className="w-5 h-5" /> Reset
          </button>
        )}
      </div>
      {/* Guía de uso rápida */}
      <div className="flex flex-col items-center w-full mb-4 animate-fadein">
        <div className="bg-[#0a2f3c]/80 rounded-xl p-6 border-2 border-[#00cfff]/40 shadow-lg max-w-xl w-full flex flex-col gap-2">
          <div className="text-2xl font-bold text-[#00cfff] mb-2 flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>🧠 ¿Cómo usar la Cámara de Enfoque?</div>
          <div className="flex flex-col gap-1 text-[#b6ffe6] text-lg font-semibold">
            <span>1️⃣ <b>Nombra tu bloque de enfoque</b> (Ej: Diseñar mockup, Escribir artículo).</span>
            <span>2️⃣ <b>Elige el tiempo:</b> El recomendado es 25 min (modo Pomodoro), pero puedes ajustarlo.</span>
            <span>3️⃣ <b>Presiona Iniciar:</b> Verás el temporizador animado activarse.</span>
            <span>4️⃣ <b>Al finalizar:</b> Sonará una campana, y se registrará tu avance. ¡Suma XP y monedas!</span>
            <span className="mt-2 text-[#00ffcc]">🎯 <b>Consejo:</b> Completa varios bloques diarios para desbloquear recompensas cognitivas.</span>
          </div>
        </div>
      </div>
      {/* Mensaje motivacional IA */}
      {finalizado && (
        <div className="flex flex-col items-center mb-4 animate-fadein">
          <div className="bg-[#0a2f3c]/80 rounded-xl p-6 border-2 border-[#00cfff]/20 shadow-lg max-w-xl">
            <div className="text-[#00cfff] font-bold mb-2 flex items-center gap-2"><Smile className="w-5 h-5" /> Mensaje IA</div>
            <div className="text-[#b6ffe6] text-xl font-semibold">{mensajeIA}</div>
          </div>
        </div>
      )}
      {/* Historial de sesiones */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-[#0a2f3c]/80 rounded-xl p-6 border-2 border-[#00cfff]/20 shadow-lg max-w-xl w-full">
          <div className="text-[#00cfff] font-bold mb-2 flex items-center gap-2"><Clock className="w-5 h-5" /> Historial de bloques</div>
          {historial.length === 0 && <div className="text-[#b6ffe6]">Aún no has completado bloques de enfoque.</div>}
          {historial.length > 0 && (
            <ul className="flex flex-col gap-2">
              {historial.map((h, i) => (
                <li key={i} className="flex flex-row items-center gap-3 bg-[#00cfff]/10 border border-[#00cfff]/20 rounded-xl px-4 py-2">
                  <Award className="w-5 h-5 text-[#00cfff]" />
                  <span className="flex-1 text-[#b6ffe6] font-semibold">{h.nombre}</span>
                  <span className="text-[#00cfff] font-bold">{h.duracion} min</span>
                  <span className="text-xs text-[#b6ffe6]">{h.fecha}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Barra de progreso general */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-full max-w-xl">
          <div className="h-4 rounded-full bg-[#00cfff]/20 overflow-hidden">
            <div className="h-4 rounded-full bg-gradient-to-r from-[#00cfff] to-[#00ffcc]" style={{ width: `${progreso}%`, transition: 'width 0.6s cubic-bezier(.4,2,.6,1)' }} />
          </div>
          <div className="text-right text-[#00cfff] font-bold mt-1">{progreso}% completado</div>
        </div>
      </div>
      {/* Espacio para futuras integraciones: IA, música, feedback emocional, etc. */}
    </div>
  );
} 