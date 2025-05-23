import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, MessageCircle, CheckCircle, Star, Smile, Zap, Award, User, Coins } from 'lucide-react';

const preguntasDiagnostico = [
  { id: 1, texto: '¿Cómo te sientes hoy?', opciones: ['Motivado', 'Cansado', 'Ansioso', 'Enfocado'] },
  { id: 2, texto: '¿Nivel de energía?', opciones: ['Alta', 'Media', 'Baja'] },
  { id: 3, texto: '¿Dormiste bien?', opciones: ['Sí', 'No', 'Regular'] },
  { id: 4, texto: '¿Has hecho ejercicio esta semana?', opciones: ['Sí', 'No'] },
  { id: 5, texto: '¿Qué hábito quieres mejorar?', opciones: ['Foco', 'Descanso', 'Organización', 'Otro'] },
];

const recomendacionesMock = [
  'Hoy podrías priorizar tareas simples, tu energía es baja pero tu mente está activa.',
  'Tómate 5 minutos para respirar y recargar tu foco.',
  'Recuerda que el descanso es parte del progreso. ¡Haz una pausa consciente!',
];

const insigniasMock = [
  { nombre: 'Explorador de la Mente', icono: <Star className="w-6 h-6 text-yellow-400" /> },
  { nombre: 'Disciplina en Curso', icono: <Zap className="w-6 h-6 text-cyan-400" /> },
  { nombre: 'Sincronía Emocional', icono: <Smile className="w-6 h-6 text-pink-400" /> },
];

interface Props {
  imagen?: string;
}

export default function ModuloCardConsejeroInteligente({ imagen }: Props) {
  const [progreso, setProgreso] = useState(60);
  const [estado, setEstado] = useState<'pendiente' | 'en_curso' | 'completado'>('en_curso');
  const [xp, setXp] = useState(120);
  const [monedas, setMonedas] = useState(8);
  const [openDiagnostico, setOpenDiagnostico] = useState(false);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [diagnosticoIA, setDiagnosticoIA] = useState('');
  const [openChat, setOpenChat] = useState(false);
  const [chat, setChat] = useState<{ pregunta: string; respuesta: string }[]>([]);
  const [preguntaLibre, setPreguntaLibre] = useState('');
  const [progresoMental, setProgresoMental] = useState(15);
  const [sugerenciaActiva, setSugerenciaActiva] = useState(false);
  const [insignias, setInsignias] = useState([insigniasMock[0]]);

  // Diagnóstico IA simulado
  function enviarDiagnostico() {
    setDiagnosticoIA('Análisis IA: Tu energía está en nivel medio, pero tu motivación es alta. Hoy es ideal para avanzar en tareas creativas. ¡Recuerda tomar pausas!');
    setXp(xp + 10);
    setOpenDiagnostico(false);
  }

  // Chat mentor simulado
  function enviarPreguntaLibre(e: React.FormEvent) {
    e.preventDefault();
    if (!preguntaLibre.trim()) return;
    setChat(prev => [
      ...prev,
      { pregunta: preguntaLibre, respuesta: 'Respuesta IA: Cuando te sientas abrumado, divide tus tareas en pasos pequeños y prioriza lo esencial. ¡Tú puedes!' },
    ]);
    setPreguntaLibre('');
    setXp(xp + 5);
  }

  // Sugerencia de mejora activable
  function activarSugerencia() {
    setSugerenciaActiva(true);
    setProgresoMental(progresoMental + 5);
    setXp(xp + 5);
    setMonedas(monedas + 1);
    setInsignias([...insignias, insigniasMock[1]]);
  }

  return (
    <div className="w-full min-h-[540px] relative rounded-2xl border-4 border-[#a259f7] shadow-2xl p-0 flex flex-col gap-0 mb-10 overflow-hidden bg-gradient-to-br from-[#2a1a3f] via-[#4b2a7f] to-[#1a1a2f]">
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0 pointer-events-none animate-pulse" style={{background: 'radial-gradient(circle at 70% 20%, #a259f7 0%, transparent 60%)'}} />
      {/* Cabecera: avatar y barra de progreso */}
      <div className="flex flex-row items-center justify-center gap-16 w-full flex-wrap md:flex-nowrap px-8 py-8">
        {/* Avatar IA (provisional) */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src="/images/modulos/concejerointeligente.png"
              alt="Consejero Inteligente"
              className="w-40 h-40 rounded-full object-cover border-4 border-[#a259f7] shadow-[0_0_32px_0_rgba(162,89,247,0.7)] bg-[#1a1a2f]"
            />
          </div>
        </div>
        {/* Barra de progreso circular */}
        <div className="relative flex flex-col items-center justify-center min-w-[220px]">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="gaugeMentor" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a259f7" />
                <stop offset="60%" stopColor="#cfaaff" />
                <stop offset="100%" stopColor="#3ec6f7" />
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r="75" stroke="#4b2a7f" strokeWidth="18" fill="none" />
            <circle
              cx="90"
              cy="90"
              r="75"
              stroke="url(#gaugeMentor)"
              strokeWidth="18"
              fill="none"
              strokeDasharray={2 * Math.PI * 75}
              strokeDashoffset={2 * Math.PI * 75 - (progreso / 100) * 2 * Math.PI * 75}
              strokeLinecap="round"
              style={{filter: 'drop-shadow(0 0 16px #a259f7)', transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)'}}
            />
          </svg>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-extrabold text-[#cfaaff] drop-shadow-lg tracking-widest">{progreso}%</span>
        </div>
      </div>
      {/* Título y descripción */}
      <div className="flex flex-col items-center justify-center w-full mb-4">
        <div className="font-extrabold text-4xl text-[#cfaaff] font-orbitron mb-2 drop-shadow-lg tracking-wide text-center">Consejero Inteligente</div>
        <div className="text-[#e0cfff] text-xl mb-2 font-semibold max-w-2xl drop-shadow text-center">Conecta con tu mentor IA y recibe orientación personalizada sobre tu mente, emociones y rendimiento.</div>
        {/* Estado, XP y monedas */}
        <div className="flex flex-row items-center justify-center gap-6 mt-2 mb-2">
          <span className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#2a1a3f] border border-[#a259f7] shadow-md text-[#cfaaff] font-bold text-xl tracking-wide animate-glow">
            <img src="/images/modulos/xp.svg" alt="XP" className="w-7 h-7 mr-1" />
            {xp}
            <span className="ml-2 text-base font-semibold">XP</span>
          </span>
          <span className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#2a1a3f] border border-[#a259f7] shadow-md text-[#ffe93c] font-bold text-xl tracking-wide animate-glow">
            <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-7 h-7 mr-1" />
            {monedas}
          </span>
          <span className={`px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2 ${estado === 'en_curso' ? 'bg-green-400/20 text-green-300' : 'bg-[#f7c63e]/20 text-[#f7c63e]'}`}>{estado === 'en_curso' ? 'En curso' : estado === 'pendiente' ? 'Pendiente' : 'Completado'}</span>
        </div>
      </div>
      {/* Botón principal */}
      <div className="flex flex-col items-center mb-6">
        <button className="px-8 py-3 rounded-xl bg-[#f7c63e] text-[#1a1a2f] font-bold text-lg shadow-lg border-2 border-[#fff7ae] hover:bg-[#fff7ae] hover:text-[#1a1a2f] transition mb-2" onClick={() => setOpenDiagnostico(true)}>
          Activar Mentor
        </button>
      </div>
      {/* Diagnóstico IA (modal) */}
      {openDiagnostico && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-br from-[#23233a] via-[#1a1a2f] to-[#23233a] border-4 border-[#f7c63e] rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-4">
            <h3 className="text-2xl font-bold text-[#f7c63e] mb-2 flex items-center gap-2"><Brain /> Diagnóstico IA</h3>
            {preguntasDiagnostico.map((p, idx) => (
              <div key={p.id} className="mb-2">
                <div className="text-[#fff7ae] font-bold mb-1">{p.texto}</div>
                <div className="flex flex-wrap gap-2">
                  {p.opciones.map(op => (
                    <button
                      key={op}
                      className={`px-4 py-1 rounded-lg border-2 border-[#f7c63e]/40 text-[#f7c63e] bg-[#fff7ae]/10 hover:bg-[#f7c63e]/30 transition-all ${respuestas[idx] === op ? 'bg-[#f7c63e]/40 text-[#1a1a2f] font-bold' : ''}`}
                      onClick={() => setRespuestas(r => { const copy = [...r]; copy[idx] = op; return copy; })}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="mt-4 px-6 py-2 rounded-xl bg-[#f7c63e] text-[#1a1a2f] font-bold shadow-lg border-2 border-[#fff7ae] hover:bg-[#fff7ae] transition" onClick={enviarDiagnostico}>
              Enviar diagnóstico
            </button>
            <button className="mt-2 text-xs text-[#f7c63e]/60 underline" onClick={() => setOpenDiagnostico(false)}>Cancelar</button>
          </motion.div>
        </div>
      )}
      {/* Diagnóstico IA resultado */}
      {diagnosticoIA && (
        <div className="flex flex-col items-center mb-6 animate-fadein">
          <div className="bg-[#23233a]/80 rounded-xl p-6 border-2 border-[#f7c63e]/20 shadow-lg max-w-xl">
            <div className="text-[#fff7ae] font-bold mb-2 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Análisis del Mentor IA</div>
            <div className="text-[#ffeeb6] text-base mb-2">{diagnosticoIA}</div>
          </div>
        </div>
      )}
      {/* Recomendaciones personalizadas */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-[#23233a]/80 rounded-xl p-6 border-2 border-[#f7c63e]/20 shadow-lg max-w-xl w-full">
          <div className="text-[#fff7ae] font-bold mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#f7c63e]" /> Recomendaciones del Mentor</div>
          <ul className="list-disc pl-6 text-[#fff7ae] mb-2">
            {recomendacionesMock.map((rec, i) => (
              <li key={i} className="mb-1 flex items-center gap-2">{rec} <button className="ml-2 px-2 py-1 rounded bg-[#f7c63e]/20 text-[#f7c63e] text-xs font-bold hover:bg-[#f7c63e]/40 transition">Útil</button></li>
            ))}
          </ul>
        </div>
      </div>
      {/* Pregunta libre al mentor (chat) */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-[#23233a]/80 rounded-xl p-6 border-2 border-[#f7c63e]/20 shadow-lg max-w-xl w-full">
          <div className="text-[#fff7ae] font-bold mb-2 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-[#3ec6f7]" /> Pregunta libre al Mentor</div>
          <form onSubmit={enviarPreguntaLibre} className="flex flex-row gap-2 items-center mb-2">
            <input
              type="text"
              value={preguntaLibre}
              onChange={e => setPreguntaLibre(e.target.value)}
              placeholder="¿Cómo me organizo si estoy abrumado?"
              className="flex-1 rounded-lg px-4 py-2 bg-[#23232f] border border-[#f7c63e]/40 text-[#fff7ae] focus:outline-none focus:ring-2 focus:ring-[#f7c63e]/40 font-mono"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-[#f7c63e] text-[#1a1a2f] font-bold hover:bg-[#fff7ae] transition flex items-center gap-1">
              Enviar
            </button>
          </form>
          <div className="max-h-40 overflow-y-auto">
            {chat.map((msg, idx) => (
              <div key={idx} className="mb-2">
                <div className="text-[#00ffcc] font-bold mb-1">Tú: {msg.pregunta}</div>
                <div className="bg-[#23233a] rounded-lg p-3 text-[#fff7ae] shadow-md relative">
                  {msg.respuesta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Progreso mental y sugerencias */}
      <div className="flex flex-col items-center mb-6">
        <div className="bg-[#23233a]/80 rounded-xl p-6 border-2 border-[#f7c63e]/20 shadow-lg max-w-xl w-full">
          <div className="text-[#fff7ae] font-bold mb-2 flex items-center gap-2"><Brain className="w-5 h-5 text-[#f7c63e]" /> Progreso mental semanal</div>
          <div className="flex flex-row items-center gap-4 mb-2">
            <span className="text-3xl font-extrabold text-[#fff7ae]">+{progresoMental}%</span>
            <span className="text-[#ffeeb6]">Esta semana mejoraste tu foco</span>
          </div>
          <button
            className={`px-4 py-2 rounded-lg font-bold border-2 ${sugerenciaActiva ? 'bg-green-400/20 border-green-400 text-green-300' : 'bg-[#f7c63e]/10 border-[#f7c63e]/40 text-[#f7c63e]'}`}
            onClick={activarSugerencia}
            disabled={sugerenciaActiva}
          >
            Aplicar sugerencia de mejora
          </button>
        </div>
      </div>
      {/* Insignias */}
      <div className="flex flex-row items-center gap-4 justify-center mb-8">
        {insignias.map((ins, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#23232f] border-2 border-[#f7c63e]/40 mb-1">
              {ins.icono}
            </div>
            <span className="text-xs text-[#ffeeb6] text-center font-bold">{ins.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 