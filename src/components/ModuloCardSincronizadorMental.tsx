import React, { useState } from 'react';
import MapaMentalModal from './MapaMentalModal';
import ModalDecisionIA from './ModalDecisionIA';
import ModuloCardAgruparPensamientos from './ModuloCardAgruparPensamientos';

interface Props {
  progreso: number;
  estado: 'pendiente' | 'en_curso' | 'completado';
  xp?: number;
  neurocoin?: number;
  imagen?: string;
  onOrganizarMente: () => void;
  ideaCentral: string;
  avatarUrl?: string;
}

const estados = {
  pendiente: { texto: 'Pendiente', color: 'bg-yellow-400', icon: '🟡' },
  en_curso: { texto: 'En curso', color: 'bg-green-400', icon: '🧠' },
  completado: { texto: 'Completado', color: 'bg-cyan-400', icon: '✅' },
};

// Modal base reutilizable
function ModalFuturista({ open, onClose, avatarUrl, progreso, children }: { open: boolean; onClose: () => void; avatarUrl?: string; progreso: number; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1a2f]/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-[#101c2c] via-[#1a2a3f] to-[#101c2c] rounded-3xl shadow-2xl border-2 border-[#3ec6f7] p-10 min-w-[420px] max-w-full flex flex-col items-center">
        {/* Cerrar */}
        <button onClick={onClose} className="absolute top-4 right-4 text-[#3ec6f7] text-3xl font-bold hover:text-[#aef1ff] transition">×</button>
        {/* Avatar y progreso */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#3ec6f7] bg-[#0a1a2f] shadow-xl mb-2">
            <img
              src={avatarUrl || '/images/modulos/diseñofinalavatar.png'}
              alt="Avatar Usuario"
              className="w-full h-full object-cover"
              style={{ filter: 'drop-shadow(0 0 16px #3ec6f7)' }}
            />
          </div>
          {/* Gauge circular pequeño */}
          <svg width="90" height="90" viewBox="0 0 90 90">
            <defs>
              <linearGradient id="gaugeGradientModal" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff3c3c" />
                <stop offset="40%" stopColor="#ffb13c" />
                <stop offset="70%" stopColor="#ffe93c" />
                <stop offset="100%" stopColor="#3cff6e" />
              </linearGradient>
            </defs>
            <circle cx="45" cy="45" r="38" stroke="#1a2a3f" strokeWidth="8" fill="none" />
            <circle
              cx="45"
              cy="45"
              r="38"
              stroke="url(#gaugeGradientModal)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 38}
              strokeDashoffset={2 * Math.PI * 38 - (progreso / 100) * 2 * Math.PI * 38}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)' }}
            />
            <text x="50%" y="54%" textAnchor="middle" fill="#aef1ff" fontSize="1.5em" fontWeight="bold">{progreso}%</text>
          </svg>
        </div>
        {children}
      </div>
    </div>
  );
}

// Popup visual avanzado para "Organizar mi mente"
function PopupSincronizadorVisual({ open, onClose, avatarUrl, progreso, xp, neurocoin }: { open: boolean; onClose: () => void; avatarUrl?: string; progreso: number; xp: number; neurocoin: number }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1a2f]/80 backdrop-blur-xl">
      <div className="relative bg-gradient-to-br from-[#101c2c] via-[#1a2a3f] to-[#101c2c] rounded-3xl shadow-2xl border-2 border-[#3ec6f7] p-0 w-full max-w-4xl flex flex-col items-center">
        {/* Cerrar */}
        <button onClick={onClose} className="absolute top-4 right-4 text-[#3ec6f7] text-3xl font-bold hover:text-[#aef1ff] transition z-20">×</button>
        {/* Layout horizontal: Avatar y Progreso */}
        <div className="flex flex-row w-full gap-0 md:gap-8 p-8 pb-0 items-start justify-center">
          {/* Avatar con fondo animado */}
          <div className="flex flex-col items-center min-w-[200px] relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <defs>
                  <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3ec6f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0a1a2f" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="avatarLine" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3ec6f7" />
                    <stop offset="100%" stopColor="#aef1ff" />
                  </linearGradient>
                </defs>
                <circle cx="90" cy="90" r="80" fill="url(#avatarGlow)" />
                {/* Nodos animados */}
                <circle cx="40" cy="60" r="5" fill="#aef1ff" opacity="0.7">
                  <animate attributeName="cy" values="60;80;60" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="140" cy="50" r="4" fill="#3ec6f7" opacity="0.6">
                  <animate attributeName="cx" values="140;160;140" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="150" cy="140" r="3" fill="#aef1ff" opacity="0.5">
                  <animate attributeName="cy" values="140;160;140" dur="2.8s" repeatCount="indefinite" />
                </circle>
                {/* Líneas de conexión animadas */}
                <polyline points="90,20 40,60 90,90" stroke="url(#avatarLine)" strokeWidth="2" fill="none" opacity="0.18">
                  <animate attributeName="points" values="90,20 40,60 90,90;90,20 40,80 90,90;90,20 40,60 90,90" dur="3s" repeatCount="indefinite" />
                </polyline>
                <polyline points="90,20 140,50 90,90" stroke="url(#avatarLine)" strokeWidth="2" fill="none" opacity="0.18">
                  <animate attributeName="points" values="90,20 140,50 90,90;90,20 160,50 90,90;90,20 140,50 90,90" dur="2.5s" repeatCount="indefinite" />
                </polyline>
                <polyline points="90,160 150,140 90,90" stroke="url(#avatarLine)" strokeWidth="2" fill="none" opacity="0.18">
                  <animate attributeName="points" values="90,160 150,140 90,90;90,160 150,160 90,90;90,160 150,140 90,90" dur="2.8s" repeatCount="indefinite" />
                </polyline>
              </svg>
            </div>
            <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-2xl border-4 border-[#3ec6f7] bg-[#0a1a2f] flex items-center justify-center z-10">
              <img
                src={avatarUrl || '/images/modulos/diseñofinalavatar.png'}
                alt="Avatar Usuario"
                className="w-full h-full object-cover animate-fadein"
                style={{ filter: 'drop-shadow(0 0 18px #3ec6f7)' }}
              />
            </div>
          </div>
          {/* Barra de progreso circular */}
          <div className="flex flex-col items-center min-w-[220px] relative">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <defs>
                <linearGradient id="gaugeGradientPopup" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff3c3c" />
                  <stop offset="40%" stopColor="#ffb13c" />
                  <stop offset="70%" stopColor="#ffe93c" />
                  <stop offset="100%" stopColor="#3cff6e" />
                </linearGradient>
              </defs>
              <circle cx="90" cy="90" r="80" stroke="#1a2a3f" strokeWidth="16" fill="none" />
              <circle
                cx="90"
                cy="90"
                r="80"
                stroke="url(#gaugeGradientPopup)"
                strokeWidth="16"
                fill="none"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 - (progreso / 100) * 2 * Math.PI * 80}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 16px #3ec6f7)', transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)' }}
              />
              <text x="50%" y="54%" textAnchor="middle" fill="#aef1ff" fontSize="2.5em" fontWeight="bold">{progreso}%</text>
            </svg>
            <span className="mt-2 text-lg text-[#aef1ff] font-bold tracking-wide">Progreso</span>
          </div>
        </div>
        {/* Recompensas */}
        <div className="flex flex-row items-center justify-center gap-8 mt-2 mb-4">
          <span className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1a2a3f] border border-[#3ec6f7] shadow-md text-[#aef1ff] font-bold text-xl tracking-wide animate-glow">
            <img src="/images/modulos/xp.svg" alt="XP" className="w-8 h-8 mr-1" />
            {xp}
            <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-8 h-8 ml-3" />
            {neurocoin}
          </span>
          <button
            className="px-8 py-3 rounded-2xl font-extrabold text-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] shadow-2xl font-orbitron border-2 border-[#3ec6f7] opacity-60 cursor-not-allowed"
            disabled
          >
            Recolectar recompensa
          </button>
        </div>
        {/* Tareas */}
        <div className="flex flex-row items-center justify-center gap-8 w-full px-8 pb-8 responsive-tareas-mentales">
          {/* Mapa mental */}
          <div className="flex flex-col items-center gap-3 bg-[#3ec6f7]/10 rounded-2xl p-8 border-2 border-[#3ec6f7]/30 shadow-xl animate-glow w-72 min-w-[220px]">
            <img src="/images/modulos/mapamentalactual.svg" alt="Mapa Mental" className="w-16 h-16 mb-1 drop-shadow-glow" />
            <span className="text-[#aef1ff] font-bold text-xl text-center">Mapa mental rápido</span>
            <button className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] font-bold text-lg shadow-lg border border-[#3ec6f7] opacity-70 cursor-not-allowed">Sincronizar</button>
          </div>
          {/* Sincronizar tareas IA */}
          <div className="flex flex-col items-center gap-3 bg-[#3ec6f7]/10 rounded-2xl p-8 border-2 border-[#3ec6f7]/30 shadow-xl animate-glow w-72 min-w-[220px]">
            <img src="/images/modulos/sincronizadordetareas.svg" alt="Sincronizar IA" className="w-16 h-16 mb-1 drop-shadow-glow" />
            <span className="text-[#aef1ff] font-bold text-xl text-center">Sincronizar tareas IA</span>
            <button className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] font-bold text-lg shadow-lg border border-[#3ec6f7] opacity-70 cursor-not-allowed">Sincronizar</button>
          </div>
          {/* Agrupar pensamientos */}
          <div className="flex flex-col items-center gap-3 bg-[#3ec6f7]/10 rounded-2xl p-8 border-2 border-[#3ec6f7]/30 shadow-xl animate-glow w-72 min-w-[220px]">
            <img src="/images/modulos/agruparpensamientos.svg" alt="Agrupar Pensamientos" className="w-16 h-16 mb-1 drop-shadow-glow" />
            <span className="text-[#aef1ff] font-bold text-xl text-center">Agrupar pensamientos</span>
            <button className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] font-bold text-lg shadow-lg border border-[#3ec6f7] opacity-70 cursor-not-allowed">Sincronizar</button>
          </div>
        </div>
        <style>{`
          @media (max-width: 900px) {
            .responsive-tareas-mentales {
              flex-direction: column !important;
              gap: 1.5rem !important;
              align-items: center !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
            .responsive-tareas-mentales > div {
              width: 90vw !important;
              max-width: 340px !important;
              min-width: 0 !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// Tipos para las funciones auxiliares
interface MindMapData {
  idea: string;
  ramas: { tema: string; subtemas: string[] }[];
}

async function generarMapaMentalIA(ideaCentral: string, ramas: string[]): Promise<MindMapData | null> {
  const prompt = `
Estoy creando un mapa mental y necesito que lo estructures en formato de árbol para visualizarlo y trabajarlo con IA.

🔹 Mi idea central es: "${ideaCentral}"
🔹 Ramas principales: ${ramas.join(", ")}

Para cada rama, genera entre 2 y 4 subtemas concretos, breves, útiles y aplicables al contexto de la idea central. Usa un formato de salida estructurado como JSON para que pueda procesarlo y pintarlo en forma de árbol visual.

Formato esperado:
{
  "idea": "${ideaCentral}",
  "ramas": [
    {
      "tema": "rama1",
      "subtemas": ["subtema1", "subtema2", "subtema3"]
    }
  ]
}
Solo responde con el JSON. No agregues explicación adicional ni encabezados.
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer TU_API_KEY_OPENAI` // <-- Cambia esto por tu API Key real
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('Error de red o API:', response.status, response.statusText);
      return null;
    }
    const data = await response.json();
    console.log('Respuesta IA:', data);
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Respuesta inesperada de la IA:', data);
      return null;
    }
    const text = data.choices[0].message.content.trim();
    // Intenta parsear el JSON (puede requerir limpieza si la IA agrega texto extra)
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('No se encontró JSON en la respuesta:', text);
      return null;
    }
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Error al parsear JSON:', e, jsonString);
      return null;
    }
  } catch (err) {
    console.error('Error general al llamar a la IA:', err);
    return null;
  }
}

function MindMapSVG({ data }: { data: MindMapData }) {
  if (!data) return null;
  const centerX = 200, centerY = 200, radius = 100;
  const ramas = data.ramas || [];
  const angleStep = (2 * Math.PI) / ramas.length;

  return (
    <svg width={400} height={400}>
      {/* Nodo central */}
      <circle cx={centerX} cy={centerY} r={32} fill="#3ec6f7" />
      <text x={centerX} y={centerY} textAnchor="middle" dy="0.3em" fill="#101c2c" fontWeight="bold">{data.idea}</text>
      {/* Ramas */}
      {ramas.map((rama: { tema: string; subtemas: string[] }, i: number) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        // Subtemas
        const subRadius = 50;
        const subAngleStep = (Math.PI) / (rama.subtemas.length + 1);
        return (
          <g key={i}>
            {/* Línea rama */}
            <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#aef1ff" strokeWidth={3} />
            {/* Nodo rama */}
            <circle cx={x} cy={y} r={22} fill="#1a2a3f" />
            <text x={x} y={y} textAnchor="middle" dy="0.3em" fill="#aef1ff" fontWeight="bold" fontSize={12}>{rama.tema}</text>
            {/* Subtemas */}
            {rama.subtemas && rama.subtemas.map((sub: string, j: number) => {
              const subAngle = angle - Math.PI / 2 + (j + 1) * subAngleStep;
              const sx = x + subRadius * Math.cos(subAngle);
              const sy = y + subRadius * Math.sin(subAngle);
              return (
                <g key={j}>
                  <line x1={x} y1={y} x2={sx} y2={sy} stroke="#ffe93c" strokeWidth={2} />
                  <circle cx={sx} cy={sy} r={12} fill="#ffe93c" />
                  <text x={sx} y={sy} textAnchor="middle" dy="0.3em" fill="#101c2c" fontSize={10}>{sub}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

function activarVoz(setIdeaCentral: (text: string) => void) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Tu navegador no soporta reconocimiento de voz. Prueba en Chrome o Edge.');
    return;
  }
  try {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.onresult = function (event: any) {
      const speechToText = event.results[0][0].transcript;
      setIdeaCentral(speechToText);
    };
    recognition.onerror = function (event: any) {
      alert('Error al capturar voz: ' + event.error);
    };
    recognition.start();
  } catch (e) {
    alert('No se pudo iniciar el reconocimiento de voz.');
  }
}

export default function ModuloCardSincronizadorMental({
  progreso,
  estado,
  xp = 0,
  neurocoin = 0,
  imagen,
  onOrganizarMente,
  ideaCentral,
  avatarUrl,
}: Props) {
  // Estado para modales
  const [modal, setModal] = useState<null | 'tareas' | 'agrupar'>(null);
  const [openMapaMental, setOpenMapaMental] = useState(false);
  const [showModalDecision, setShowModalDecision] = useState(false);
  const [loadingDecision, setLoadingDecision] = useState(false);
  const [resultadoDecision, setResultadoDecision] = useState('');
  const [sugerenciaDecision, setSugerenciaDecision] = useState('');
  // Cálculo para barra de progreso circular tipo gauge
  const radius = 110;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progreso / 100) * circ;

  // Nueva función para abrir el modal y simular IA
  const handleSincronizarTareasIA = () => {
    setShowModalDecision(true);
    setLoadingDecision(true);
    setResultadoDecision('');
    setSugerenciaDecision('');
    setTimeout(() => {
      setResultadoDecision('Basado en tus valores y prioridades, la mejor opción es la A. Confía en ti.');
      setSugerenciaDecision('Recuerda priorizar lo que más impacto tiene en tu día.');
      setLoadingDecision(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a1a2f]">
      <div className="w-full min-h-screen relative rounded-2xl border border-[#3ec6f7] shadow-2xl flex flex-col gap-0 mb-10 overflow-hidden bg-gradient-to-br from-[#0a1a2f] via-[#1a2a3f] to-[#0a1a2f] p-4 md:p-8">
        {/* Fila superior: Avatar y Gauge */}
        <div className="flex flex-row items-center justify-center gap-16 w-full flex-wrap md:flex-nowrap">
          {/* Avatar con efecto Sci-Fi detrás */}
          <div className="relative flex flex-col items-center justify-center min-w-[260px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
              <svg width="260" height="260" viewBox="0 0 260 260">
                <defs>
                  <radialGradient id="neuroGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3ec6f7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0a1a2f" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="neuroLine" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3ec6f7" />
                    <stop offset="100%" stopColor="#aef1ff" />
                  </linearGradient>
                </defs>
                {/* Glow */}
                <circle cx="130" cy="130" r="110" fill="url(#neuroGlow)" />
                {/* Nodos animados */}
                <circle cx="60" cy="80" r="7" fill="#aef1ff" opacity="0.7">
                  <animate attributeName="cy" values="80;100;80" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="200" cy="70" r="6" fill="#3ec6f7" opacity="0.6">
                  <animate attributeName="cx" values="200;220;200" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="210" cy="200" r="5" fill="#aef1ff" opacity="0.5">
                  <animate attributeName="cy" values="200;220;200" dur="2.8s" repeatCount="indefinite" />
                </circle>
                {/* Líneas de conexión animadas */}
                <polyline points="130,40 60,80 130,130" stroke="url(#neuroLine)" strokeWidth="2" fill="none" opacity="0.18">
                  <animate attributeName="points" values="130,40 60,80 130,130;130,40 60,100 130,130;130,40 60,80 130,130" dur="3s" repeatCount="indefinite" />
                </polyline>
                <polyline points="130,40 200,70 130,130" stroke="url(#neuroLine)" strokeWidth="2" fill="none" opacity="0.18">
                  <animate attributeName="points" values="130,40 200,70 130,130;130,40 220,70 130,130;130,40 200,70 130,130" dur="2.5s" repeatCount="indefinite" />
                </polyline>
                <polyline points="130,220 210,200 130,130" stroke="url(#neuroLine)" strokeWidth="2" fill="none" opacity="0.18">
                  <animate attributeName="points" values="130,220 210,200 130,130;130,220 210,220 130,130;130,220 210,200 130,130" dur="2.8s" repeatCount="indefinite" />
                </polyline>
              </svg>
            </div>
            <div className="relative w-56 h-56 rounded-full overflow-hidden shadow-2xl border-4 border-[#3ec6f7] bg-[#0a1a2f] flex items-center justify-center z-10">
              <img
                src="/images/modulos/disenoofinalavatar.png"
                alt="Sincronizador Mental"
                className="w-full h-full object-cover animate-fadein"
                style={{filter: 'drop-shadow(0 0 24px #3ec6f7)'}}
              />
            </div>
          </div>
          {/* Gauge Sci-Fi */}
          <div className="relative flex flex-col items-center justify-center min-w-[260px]">
            <svg width="260" height="260" viewBox="0 0 260 260">
              <defs>
                <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff3c3c" />
                  <stop offset="40%" stopColor="#ffb13c" />
                  <stop offset="70%" stopColor="#ffe93c" />
                  <stop offset="100%" stopColor="#3cff6e" />
                </linearGradient>
              </defs>
              {/* Fondo de la barra */}
              <circle
                cx="130"
                cy="130"
                r={radius}
                stroke="#1a2a3f"
                strokeWidth="18"
                fill="none"
              />
              {/* Barra de progreso gauge */}
              <circle
                cx="130"
                cy="130"
                r={radius}
                stroke="url(#gaugeGradient)"
                strokeWidth="18"
                fill="none"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{filter: 'drop-shadow(0 0 16px #3ec6f7)', transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)'}}
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-extrabold text-[#aef1ff] drop-shadow-lg tracking-widest">{progreso}%</span>
          </div>
        </div>
        {/* Info principal y botón */}
        <div className="flex flex-col items-center justify-center gap-4 mt-8 mb-8">
          <div className="font-extrabold text-4xl text-[#aef1ff] font-orbitron drop-shadow-lg tracking-wide text-center">Sincronizador Mental</div>
          <div className="text-[#b6eaff] text-lg font-semibold max-w-2xl drop-shadow text-center">Organiza, conecta y transforma tus ideas en proyectos claros. ¡Explora tu mente como un mapa interactivo!</div>
          {/* Estado y recompensas */}
          <div className="flex flex-row items-center gap-4 mt-2">
            <span className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#1a2a3f] border border-[#3ec6f7] shadow-md text-[#aef1ff] font-bold text-lg tracking-wide animate-glow">
              <span className="text-2xl">{estados[estado].icon}</span> <span>{estados[estado].texto}</span>
            </span>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0a1a2f]/80 border border-[#3ec6f7]/30 shadow text-[#aef1ff] font-bold text-lg">
              <img src="/images/modulos/xp.svg" alt="XP" className="w-7 h-7 mr-1" />
              {xp}
              <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-7 h-7 ml-3" />
              {neurocoin}
            </span>
          </div>
          <button
            className="mt-2 px-10 py-4 rounded-2xl font-extrabold text-2xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] hover:from-[#4fd1fa] hover:to-[#aef1ff] shadow-2xl font-orbitron transition-all animate-bounce border-2 border-[#3ec6f7]"
            onClick={() => setModal('tareas')}
          >
            Organizar mi mente
          </button>
        </div>
        {/* Funcionalidades horizontales */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-2 md:px-10 py-8 bg-[#162232]/80 border-t border-[#3ec6f7]/30">
          {/* Mapa mental rápido */}
          <div className="flex flex-col items-center gap-3 bg-[#3ec6f7]/10 rounded-2xl p-8 hover:bg-[#3ec6f7]/30 transition group border-2 border-[#3ec6f7]/30 shadow-xl animate-glow w-full max-w-md">
            <img src="/images/modulos/mapamentalactual.svg" alt="Mapa Mental" className="w-20 h-20 mb-1 group-hover:scale-110 transition-all drop-shadow-glow" />
            <span className="text-[#aef1ff] font-bold text-2xl text-center">Mapa mental rápido</span>
            <button
              className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] font-bold text-lg shadow-lg hover:from-[#4fd1fa] hover:to-[#aef1ff] transition-all animate-bounce border border-[#3ec6f7] w-full max-w-xs"
              onClick={() => setOpenMapaMental(true)}
            >
              Sincronizar
            </button>
          </div>
          {/* Sincronizar tareas IA */}
          <div className="flex flex-col items-center gap-3 bg-[#3ec6f7]/10 rounded-2xl p-8 hover:bg-[#3ec6f7]/30 transition group border-2 border-[#3ec6f7]/30 shadow-xl animate-glow w-full max-w-md">
            <img src="/images/modulos/sincronizadordetareas.svg" alt="Sincronizar IA" className="w-20 h-20 mb-1 group-hover:scale-110 transition-all drop-shadow-glow" />
            <span className="text-[#aef1ff] font-bold text-2xl text-center">Sincronizar tareas IA</span>
            <button
              className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] font-bold text-lg shadow-lg hover:from-[#4fd1fa] hover:to-[#aef1ff] transition-all animate-bounce border border-[#3ec6f7] w-full max-w-xs"
              onClick={handleSincronizarTareasIA}
            >
              Sincronizar
            </button>
          </div>
          {/* Agrupar pensamientos por tema */}
          <div className="flex flex-col items-center gap-3 bg-[#3ec6f7]/10 rounded-2xl p-8 hover:bg-[#3ec6f7]/30 transition group border-2 border-[#3ec6f7]/30 shadow-xl animate-glow w-full max-w-md">
            <img src="/images/modulos/agruparpensamientos.svg" alt="Agrupar Pensamientos" className="w-20 h-20 mb-1 group-hover:scale-110 transition-all drop-shadow-glow" />
            <span className="text-[#aef1ff] font-bold text-2xl text-center">Agrupar pensamientos</span>
            <button
              className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] font-bold text-lg shadow-lg hover:from-[#4fd1fa] hover:to-[#aef1ff] transition-all animate-bounce border border-[#3ec6f7] w-full max-w-xs"
              onClick={() => setModal('agrupar')}
            >
              Sincronizar
            </button>
          </div>
        </div>
        {/* Modal de tareas IA */}
        <ModalFuturista open={modal === 'tareas'} onClose={() => setModal(null)} avatarUrl={avatarUrl} progreso={progreso}>
          <div className="flex flex-col items-center justify-center gap-8 w-full px-4 pb-8">
            {/* Mapa mental */}
            <div className="flex flex-col items-center gap-3 bg-[#3ec6f7]/10 rounded-2xl p-8 border-2 border-[#3ec6f7]/30 shadow-xl animate-glow w-full max-w-md">
              <img src="/images/modulos/mapamentalactual.svg" alt="Mapa Mental" className="w-16 h-16 mb-1 drop-shadow-glow" />
              <span className="text-[#aef1ff] font-bold text-xl text-center">Mapa mental rápido</span>
              <button className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] font-bold text-lg shadow-lg border border-[#3ec6f7] w-full max-w-xs" onClick={() => setOpenMapaMental(true)}>Sincronizar</button>
            </div>
            {/* Sincronizar tareas IA */}
            <div className="flex flex-col items-center gap-3 bg-[#3ec6f7]/10 rounded-2xl p-8 border-2 border-[#3ec6f7]/30 shadow-xl animate-glow w-full max-w-md">
              <img src="/images/modulos/sincronizadordetareas.svg" alt="Sincronizar IA" className="w-16 h-16 mb-1 drop-shadow-glow" />
              <span className="text-[#aef1ff] font-bold text-xl text-center">Sincronizar tareas IA</span>
              <button className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] font-bold text-lg shadow-lg border border-[#3ec6f7] w-full max-w-xs" onClick={handleSincronizarTareasIA}>Sincronizar</button>
            </div>
            {/* Agrupar pensamientos */}
            <div className="flex flex-col items-center gap-3 bg-[#3ec6f7]/10 rounded-2xl p-8 border-2 border-[#3ec6f7]/30 shadow-xl animate-glow w-full max-w-md">
              <img src="/images/modulos/agruparpensamientos.svg" alt="Agrupar Pensamientos" className="w-16 h-16 mb-1 drop-shadow-glow" />
              <span className="text-[#aef1ff] font-bold text-xl text-center">Agrupar pensamientos</span>
              <button className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] font-bold text-lg shadow-lg border border-[#3ec6f7] w-full max-w-xs" onClick={() => setModal('agrupar')}>Sincronizar</button>
            </div>
          </div>
        </ModalFuturista>
        <MapaMentalModal open={openMapaMental} onClose={() => setOpenMapaMental(false)} avatarUrl={imagen} progreso={progreso} />
        {/* ModalDecisionIA integrado */}
        {showModalDecision && (
          <ModalDecisionIA
            decision="¿Qué tareas principales quieres sincronizar hoy?"
            resultado={resultadoDecision}
            sugerencia={sugerenciaDecision}
            loading={loadingDecision}
            onApply={() => setShowModalDecision(false)}
            onClose={() => setShowModalDecision(false)}
          />
        )}
        {/* Modal de agrupar pensamientos como modal ancho y bajo */}
        <ModalFuturista open={modal === 'agrupar'} onClose={() => setModal(null)} avatarUrl={avatarUrl} progreso={progreso}>
          <div className="w-full max-w-3xl mx-auto">
            <ModuloCardAgruparPensamientos />
          </div>
        </ModalFuturista>
      </div>
    </div>
  );
} 