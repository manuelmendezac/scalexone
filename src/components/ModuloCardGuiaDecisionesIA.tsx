import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, CheckCircle, AlertTriangle, BadgeCheck, Loader2, BookOpen, Info } from 'lucide-react';
import useNeuroState from '../store/useNeuroState';
import { supabase } from '../supabase';

const COLOR_PRINCIPAL = '#ffe93c'; // Amarillo neón
const COLOR_SECUNDARIO = '#ffb13c'; // Ámbar
const COLOR_FONDO = '#23233a';

// Simulación de IA (puedes reemplazar por llamada real a GPT)
function simularIA(decision: string) {
  return {
    pros: [
      'Te permite explorar nuevas oportunidades',
      'Podrías aprender y crecer profesionalmente',
    ],
    contras: [
      'Implica salir de tu zona de confort',
      'Puede haber incertidumbre inicial',
    ],
    recomendacion: 'Considera tus prioridades actuales. Si buscas crecimiento, da el paso. Si valoras estabilidad, evalúa los riesgos.',
    preguntas: [
      '¿Qué es lo que más valoras en este momento?',
      '¿Qué perderías y qué ganarías con cada opción?'
    ]
  };
}

const REWARD_LIMIT = 2; // Máximo de recompensas diarias
const XP_REWARD = 30;
const COIN_REWARD = 1;
const PROGRESO_INCREMENT = 10;
const MAX_PROGRESO = 100;
const SUPABASE_TABLE = 'DecisionHistory';

// Definición de tipos para historial y resultado IA
interface IAResponse {
  pros: string[];
  contras: string[];
  recomendacion: string;
  preguntas: string[];
}
interface DecisionHistorial {
  user_id: string;
  decision_text: string;
  ia_response: string; // JSON.stringify(IAResponse)
  created_at: string;
  useful?: boolean;
}

interface Props {
  imagen?: string;
}

export default function ModuloCardGuiaDecisionesIA({ imagen }: Props) {
  const neuro = useNeuroState();
  const user_id = neuro.userInfo?.email || 'anon';
  const [prompt, setPrompt] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<IAResponse | null>(null);
  const [historial, setHistorial] = useState<DecisionHistorial[]>([]);
  const [progreso, setProgreso] = useState(0);
  const [xp, setXp] = useState(neuro.userXP || 0);
  const [coins, setCoins] = useState(neuro.userCoins || 0);
  const [showGuia, setShowGuia] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReflexion, setShowReflexion] = useState(false);
  const [reflexion, setReflexion] = useState('');
  const [verMas, setVerMas] = useState(false);
  const [rewardedToday, setRewardedToday] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [usefulFeedback, setUsefulFeedback] = useState<boolean | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [decisionGuardada, setDecisionGuardada] = useState(false);

  // Cargar historial desde Supabase al montar
  useEffect(() => {
    async function fetchHistorial() {
      const { data, error } = await supabase
        .from('decisionguide')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setHistorial(data);
        // Calcular progreso y recompensas del día
        const hoy = new Date().toDateString();
        const hoyCount = data.filter(d => new Date(d.created_at).toDateString() === hoy).length;
        setRewardedToday(hoyCount > REWARD_LIMIT ? REWARD_LIMIT : hoyCount);
        setProgreso(Math.min(100, Math.round((data.length / 8) * 100)));
      }
    }
    fetchHistorial();
  }, [user_id]);

  // Barra de progreso circular
  const circ = 2 * Math.PI * 50;
  const dash = circ - (progreso / 100) * circ;

  // Guardar decisión en Supabase y estado global
  async function guardarDecision(decisionText: string, iaResponse: IAResponse, reflexion?: string) {
    const now = new Date().toISOString();
    // Guardar en Supabase
    await supabase.from(SUPABASE_TABLE).insert([
      {
        user_id,
        decision: decisionText,
        created_at: now,
        reflexion: reflexion || '',
        xp: XP_REWARD,
        coins: COIN_REWARD,
      },
    ]);
    // Actualizar historial local
    setHistorial(prev => [
      {
        user_id,
        decision_text: decisionText,
        ia_response: JSON.stringify(iaResponse),
        created_at: now,
      },
      ...prev,
    ]);
    // Actualizar progreso
    setProgreso(p => Math.min(MAX_PROGRESO, p + PROGRESO_INCREMENT));
    neuro.setIAModuleProgress('neuroLinkMentor', Math.min(MAX_PROGRESO, progreso + PROGRESO_INCREMENT));
    // Recompensa
    setXp(xp + XP_REWARD);
    setCoins(coins + COIN_REWARD);
    neuro.addXP(XP_REWARD);
    neuro.addCoins(COIN_REWARD);
    setShowFeedback(true);
    setShowToast(true);
    setDecisionGuardada(true);
    setTimeout(() => {
      setShowFeedback(false);
      setShowToast(false);
      setDecisionGuardada(false);
    }, 2200);
  }

  // Función para guardar feedback útil en Supabase
  async function guardarFeedbackUtil(index: number, value: boolean) {
    const decision = historialMostrado[index];
    if (!decision) return;
    // Actualizar en Supabase
    await supabase.from('decisionguide').update({ useful: value }).eq('user_id', decision.user_id).eq('created_at', decision.created_at);
    // Actualizar localmente
    setHistorial(prev => prev.map((d, i) => (i === index ? { ...d, useful: value } : d)));
    setUsefulFeedback(value);
    setTimeout(() => setUsefulFeedback(null), 2000);
  }

  // Al hacer clic en "Explorar con IA"
  async function handleExplorar() {
    if (!prompt.trim()) return;
    setProcesando(true);
    // Simular llamada a IA (puedes reemplazar por fetch a tu backend/GPT)
    setTimeout(() => {
      const ia = simularIA(prompt);
      setResultado(ia);
      setProcesando(false);
      // Guardar decisión en Supabase y estado global
      guardarDecision(prompt, ia);
      setPrompt('');
    }, 1500);
  }

  // Mostrar solo las últimas 5 decisiones, o todas si "ver más"
  const historialMostrado = verMas ? historial : historial.slice(0, 5);

  return (
    <div className="w-full min-h-[480px] relative rounded-2xl border-4 mb-10 overflow-hidden shadow-2xl p-0 flex flex-col gap-0 bg-gradient-to-br from-[#23233a] via-[#ffe93c]/10 to-[#23233a] animate-fadein">
      {/* Nueva cabecera estilo Sincronizador Mental */}
      <div className="flex flex-row items-center justify-center gap-16 w-full px-8 py-10 relative">
        {/* Imagen central */}
        <div className="flex flex-col items-center justify-center min-w-[260px]">
          <div className="relative w-56 h-56 rounded-full overflow-hidden shadow-2xl border-4 border-[#ffe93c] bg-[#23233a] flex items-center justify-center z-10 animate-pulse" style={{boxShadow: `0 0 48px 0 #ffe93c55`}}>
            <img src="/images/modulos/guiadedecisionesia.png" alt="Guía de Decisiones IA" className="w-40 h-40 object-cover" />
          </div>
        </div>
        {/* Barra de progreso circular a la derecha */}
        <div className="flex flex-col items-center min-w-[220px]">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <linearGradient id="gaugeDecisionNeon" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffe93c" />
                <stop offset="100%" stopColor="#7fff7f" />
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r="80" stroke="#23233a" strokeWidth="18" fill="none" />
            <circle
              cx="90"
              cy="90"
              r="80"
              stroke="url(#gaugeDecisionNeon)"
              strokeWidth="18"
              fill="none"
              strokeDasharray={2 * Math.PI * 80}
              strokeDashoffset={(2 * Math.PI * 80) - (progreso / 100) * (2 * Math.PI * 80)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)', filter: 'drop-shadow(0 0 32px #ffe93c)' }}
            />
            <text x="50%" y="54%" textAnchor="middle" fill="#baffff" fontSize="2.8em" fontWeight="bold" style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 12px #ffe93c' }}>{progreso}%</text>
          </svg>
        </div>
      </div>
      {/* Título y subtítulo centrados */}
      <div className="flex flex-col items-center w-full -mt-8 mb-2 animate-fadein">
        <div className="text-4xl font-extrabold font-orbitron text-[#ffe93c] drop-shadow-lg tracking-wide mb-2 text-center">Guía de Decisiones IA</div>
        <div className="text-[#ffb13c] text-xl mb-4 font-semibold max-w-2xl drop-shadow text-center">Toma decisiones complejas con apoyo de tu IA personal.</div>
        <div className="flex flex-row gap-4 items-center mb-2 justify-center">
          <span className="px-6 py-2 rounded-full bg-[#23233a] border border-[#ffe93c]/40 shadow text-[#ffe93c] font-bold text-xl flex items-center gap-2 hover:scale-105 transition">{xp} XP</span>
          <span className="px-6 py-2 rounded-full bg-[#23233a] border border-[#ffe93c]/40 shadow text-[#ffe93c] font-bold text-xl flex items-center gap-2 hover:scale-105 transition">{coins} <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-7 h-7 inline-block ml-1" /></span>
          <span className={`px-6 py-2 rounded-full font-bold text-xl flex items-center gap-2 ${rewardedToday < REWARD_LIMIT ? 'bg-yellow-400/20 text-yellow-300' : 'bg-green-400/20 text-green-300'}`}>{rewardedToday < REWARD_LIMIT ? 'Recompensa disponible' : 'Recompensa obtenida'}</span>
        </div>
        {/* Badge IA activado */}
        {rewardedToday < REWARD_LIMIT && (
          <div className="flex flex-row items-center gap-2 mt-2 animate-fadein">
            <span className="px-6 py-2 rounded-full bg-[#ffe93c]/20 border border-[#ffe93c]/40 text-[#ffe93c] font-bold text-lg flex items-center gap-2 hover:scale-105 transition"><Sparkles className="w-6 h-6" /> Consultor IA activado</span>
          </div>
        )}
      </div>
      {/* Botón guía de usuario (arriba a la derecha) */}
      <button onClick={() => setShowGuia(v => !v)} className="absolute top-4 right-8 z-20 flex flex-row items-center gap-2 p-2 pr-4 rounded-full bg-[#ffe93c]/10 border border-[#ffe93c]/40 hover:bg-[#ffe93c]/30 transition focus:outline-none focus:ring-2 focus:ring-[#ffe93c] hover:scale-105" title="Guía de uso" tabIndex={0}>
        <Info className="w-6 h-6 text-[#ffe93c]" />
        <span className="text-[#ffe93c] font-bold text-base select-none">¿Cómo funciona?</span>
      </button>
      {/* Guía rápida emergente */}
      {showGuia && (
        <div className="absolute top-20 right-8 z-30 bg-[#23233a]/95 border-2 border-[#ffe93c]/40 rounded-xl shadow-lg p-6 max-w-xs w-[340px] animate-fadein backdrop-blur-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2"><span className="text-2xl">💡</span><span className="text-lg font-bold text-[#ffe93c]">Guía rápida</span></div>
          <div className="text-[#ffe93c] font-bold mb-1">🧠 ¿Cómo usar la Guía de Decisiones IA?</div>
          <ol className="list-decimal ml-5 text-[#ffb13c] text-base flex flex-col gap-1">
            <li>Escribe tu dilema (personal, profesional, emocional).</li>
            <li>Presiona "Explorar con IA".</li>
            <li>La IA analizará y te mostrará:
              <ul className="list-disc ml-5">
                <li>Alternativas</li>
                <li>Pros y contras</li>
                <li>Recomendación basada en lógica y contexto</li>
              </ul>
            </li>
          </ol>
          <div className="mt-2 text-[#ffe93c] text-sm">💬 <b>Ejemplo:</b> "¿Debo cambiar de trabajo o esperar una promoción?"</div>
        </div>
      )}
      {/* Input principal y acción IA */}
      <div className="flex flex-col items-center w-full mb-4 animate-fadein">
        <div className="bg-[#23233a]/80 rounded-xl p-6 border-2 border-[#ffe93c]/40 shadow-lg max-w-xl w-full flex flex-col gap-4 backdrop-blur-sm">
          <label className="text-[#ffe93c] font-bold mb-2 text-lg">¿Qué decisión necesitas tomar?</label>
          <input 
            className="rounded-xl px-4 py-2 text-lg bg-[#23233a] border border-[#ffe93c] text-[#ffb13c] focus:outline-none focus:ring-2 focus:ring-[#ffe93c]/40 font-mono w-full transition-all hover:border-[#ffe93c]/60" 
            placeholder="Describe tu dilema o decisión..." 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            maxLength={120} 
            disabled={procesando} 
          />
          <span className="text-[#ffe93c] text-sm mt-1 mb-2">Ejemplos: Cambiar de trabajo o quedarme, lanzar un nuevo producto o iterar el actual…</span>
          <button 
            className="mt-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#ffe93c] to-[#ffb13c] text-[#23233a] font-bold shadow-lg border-2 border-[#ffe93c] hover:scale-105 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" 
            onClick={handleExplorar} 
            disabled={procesando || !prompt.trim()}
          >
            {procesando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />} Explorar con IA
          </button>
        </div>
      </div>
      {/* Feedback visual de procesamiento */}
      {showFeedback && (
        <div className="flex flex-col items-center w-full mb-2 animate-fadein">
          <div className="bg-[#ffe93c]/10 rounded-xl p-4 border-2 border-[#ffe93c]/40 shadow-lg max-w-md w-full flex flex-row gap-4 items-center justify-center backdrop-blur-sm">
            <Loader2 className="w-8 h-8 text-[#ffe93c] animate-spin" />
            <span className="text-[#ffe93c] font-bold text-lg">Procesando decisión con IA...</span>
          </div>
        </div>
      )}
      {/* Resultado IA */}
      {resultado && (
        <div className="flex flex-col items-center w-full mb-4 animate-fadein">
          <div className="bg-[#23233a]/90 rounded-xl p-6 border-2 border-[#ffe93c]/40 shadow-lg max-w-2xl w-full flex flex-col gap-6 backdrop-blur-sm">
            {/* Bloque único de análisis IA */}
            <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center">
              <div className="flex-1 bg-[#23233a]/80 rounded-xl p-6 border-2 border-[#ffe93c]/30 shadow-lg flex flex-col gap-4 animate-slidein-left">
                <div className="flex items-center gap-2 mb-2 text-xl font-bold text-[#ffe93c]"><span>📌</span> Opción Analizada</div>
                <div className="mb-2">
                  <div className="flex items-center gap-2 text-green-400 font-bold text-lg mb-1">✅ Pros</div>
                  <ul className="list-disc ml-6 text-[#baff99] mb-2">{resultado.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg mb-1">⚠️ Contras</div>
                  <ul className="list-disc ml-6 text-[#ffe93c]">{resultado.contras.map((c, i) => <li key={i}>{c}</li>)}</ul>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-4 justify-between animate-slidein-right">
                <div className="bg-[#23233a]/80 rounded-xl p-6 border-2 border-[#ffe93c]/30 shadow-lg text-[#ffe93c] font-bold text-lg flex items-center justify-center text-center mb-2">
                  {resultado.recomendacion}
                </div>
                {/* Feedback de utilidad */}
                <div className="flex flex-col items-center gap-2 mt-2">
                  <span className="text-[#ffe93c] font-bold text-lg mb-1">¿Te ayudó esta recomendación?</span>
                  <div className="flex flex-row gap-4">
                    <button className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center text-2xl font-bold transition-all ${usefulFeedback === true ? 'bg-green-400/30 border-green-400 scale-110' : 'bg-[#23233a]/80 border-green-400 hover:scale-105'}`} onClick={() => guardarFeedbackUtil(0, true)}>
                      👍<span className="text-xs mt-1">Sí</span>
                    </button>
                    <button className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center text-2xl font-bold transition-all ${usefulFeedback === false ? 'bg-red-400/30 border-red-400 scale-110' : 'bg-[#23233a]/80 border-red-400 hover:scale-105'}`} onClick={() => guardarFeedbackUtil(0, false)}>
                      👎<span className="text-xs mt-1">No</span>
                    </button>
                  </div>
                  {usefulFeedback !== null && (
                    <span className="text-[#baff99] font-bold mt-2 animate-fadein">¡Gracias por tu feedback!</span>
                  )}
                </div>
                {/* Botón guardar decisión */}
                <button 
                  className={`mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-[#ffe93c] to-[#ffb13c] text-[#23233a] font-bold shadow-lg border-2 border-[#ffe93c] hover:scale-105 transition flex items-center gap-2 mx-auto animate-glow ${decisionGuardada ? 'opacity-60 cursor-not-allowed' : ''}`} 
                  onClick={() => guardarDecision(prompt, resultado)}
                  disabled={decisionGuardada}
                >
                  <CheckCircle className="w-5 h-5" /> {decisionGuardada ? '¡Guardado!' : 'Guardar decisión'}
                </button>
              </div>
            </div>
            {/* Preguntas para reflexionar */}
            <div className="mt-6 bg-[#ffe93c]/10 border border-[#ffe93c]/30 rounded-xl px-6 py-4 shadow text-[#ffe93c] font-bold text-lg flex flex-col gap-2 animate-fadein">
              <span className="mb-1">Preguntas para reflexionar:</span>
              <ul className="list-disc ml-6 text-[#baffff]">{resultado.preguntas.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </div>
          </div>
        </div>
      )}
      {/* Historial de decisiones previas */}
      <div className="flex flex-col items-center w-full mb-6 animate-fadein">
        <div className="bg-[#23233a]/80 rounded-xl p-6 border-2 border-[#ffe93c]/40 shadow-lg max-w-2xl w-full flex flex-col gap-4 backdrop-blur-sm">
          <div className="text-[#ffe93c] font-bold mb-2 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Historial de decisiones</div>
          {historialMostrado.length === 0 && <div className="text-[#ffb13c]">Aún no has registrado decisiones.</div>}
          {historialMostrado.length > 0 && (
            <ul className="flex flex-col gap-2">
              {historialMostrado.map((h, i) => {
                const ia = h.ia_response ? JSON.parse(h.ia_response) : null;
                return (
                  <li key={i} className="flex flex-col bg-[#ffe93c]/10 border border-[#ffe93c]/20 rounded-xl px-4 py-2 hover:scale-105 transition">
                    <div className="flex flex-row items-center gap-3">
                      <BadgeCheck className="w-5 h-5 text-[#ffe93c]" />
                      <span className="flex-1 text-[#ffb13c] font-semibold">{h.decision_text}</span>
                      <span className="text-xs text-[#ffe93c]">{new Date(h.created_at).toLocaleString()}</span>
                      <button className="ml-2 px-2 py-1 rounded bg-[#ffe93c]/20 text-[#ffe93c] font-bold text-xs border border-[#ffe93c]/40 hover:bg-[#ffe93c]/40 transition" onClick={() => setExpanded(expanded === i ? null : i)}>
                        {expanded === i ? 'Cerrar' : 'Ver detalles'}
                      </button>
                    </div>
                    {expanded === i && ia && (
                      <div className="mt-2 p-3 rounded-xl bg-[#23233a]/80 border border-[#ffe93c]/30 text-[#ffe93c] animate-fadein">
                        <div className="font-bold mb-1">Pros:</div>
                        <ul className="list-disc ml-6 mb-2 text-[#ffb13c]">{ia.pros.map((p: string, idx: number) => <li key={idx}>{p}</li>)}</ul>
                        <div className="font-bold mb-1">Contras:</div>
                        <ul className="list-disc ml-6 mb-2 text-[#ffe93c]">{ia.contras.map((c: string, idx: number) => <li key={idx}>{c}</li>)}</ul>
                        <div className="font-bold mb-1">Recomendación IA:</div>
                        <div className="mb-2 text-[#00ffcc]">{ia.recomendacion}</div>
                        <div className="font-bold mb-1">Preguntas para reflexionar:</div>
                        <ul className="list-disc ml-6 text-[#baffff]">{ia.preguntas.map((q: string, idx: number) => <li key={idx}>{q}</li>)}</ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <button 
            className="mt-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#ffe93c] to-[#ffb13c] text-[#23233a] font-bold shadow-lg border-2 border-[#ffe93c] flex items-center gap-2 transition-all" 
            onClick={() => setVerMas(!verMas)}
          >
            {verMas ? 'Mostrar menos' : 'Mostrar más'}
          </button>
        </div>
      </div>
      {/* Toast de éxito */}
      {showToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fadein">
          <div className="px-8 py-4 rounded-2xl bg-[#23233a]/90 border-2 border-[#ffe93c]/30 shadow-xl flex items-center gap-4 animate-glow-soft">
            <Sparkles className="w-7 h-7 text-[#ffe93c] animate-bounce" />
            <span className="text-[#ffe93c] font-bold text-lg">¡Decisión registrada! +30 XP y +1 Neurocoin</span>
          </div>
        </div>
      )}
    </div>
  );
}

<style>{`
@keyframes slidein-left {
  from { opacity: 0; transform: translateX(-40px) scale(0.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes slidein-right {
  from { opacity: 0; transform: translateX(40px) scale(0.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes glow {
  0% { box-shadow: 0 0 8px 2px #ffe93c88, 0 0 0 0 #ffb13c00; }
  50% { box-shadow: 0 0 24px 6px #ffe93c, 0 0 0 0 #ffb13c44; }
  100% { box-shadow: 0 0 8px 2px #ffe93c88, 0 0 0 0 #ffb13c00; }
}
.animate-slidein-left { animation: slidein-left 0.7s cubic-bezier(.4,2,.6,1) both; }
.animate-slidein-right { animation: slidein-right 0.7s cubic-bezier(.4,2,.6,1) both; }
.animate-glow { animation: glow 1.5s infinite alternate; }
.animate-bounce { animation: bounce 1s infinite alternate; }
@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-8px); }
}
`}</style> 