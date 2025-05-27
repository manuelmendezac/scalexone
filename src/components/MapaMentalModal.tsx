import React, { useEffect, useState } from 'react';

interface MindMapData {
  idea: string;
  ramas: { tema: string; subtemas: string[] }[];
  organizacion?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  avatarUrl?: string;
  progreso?: number;
}

const objetivosMentales = [
  'Un proyecto personal',
  'Un plan semanal',
  'Una idea de negocio',
  'Mi vida en 3 áreas',
  'Explorar mis pensamientos',
];

const opcionesOrganizacion = [
  'Cronológico',
  'Por prioridad',
  'Árbol de ideas',
];

// SVG visualización de mapa mental
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
      {ramas.map((rama, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        // Subtemas
        const subRadius = 50;
        const subAngleStep = (Math.PI) / ((rama.subtemas?.length || 0) + 1);
        return (
          <g key={i}>
            {/* Línea rama */}
            <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#aef1ff" strokeWidth={3} />
            {/* Nodo rama */}
            <circle cx={x} cy={y} r={22} fill="#1a2a3f" />
            <text x={x} y={y} textAnchor="middle" dy="0.3em" fill="#aef1ff" fontWeight="bold" fontSize={12}>{rama.tema}</text>
            {/* Subtemas */}
            {rama.subtemas && rama.subtemas.map((sub, j) => {
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

// Activar voz para idea central
function activarVoz(setIdeaCentral: (text: string) => void) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Tu navegador no soporta reconocimiento de voz');
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.onresult = function (event: any) {
    const speechToText = event.results[0][0].transcript;
    setIdeaCentral(speechToText);
  };
  recognition.start();
}

// Llamada a OpenAI para generar el mapa mental
async function generarMapaMentalIA(ideaCentral: string, ramas: string[]): Promise<MindMapData | { error: string } | null> {
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
    const response = await fetch('/api/generateMindmap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    if (!response.ok) {
      return { error: data.error || 'Error desconocido del backend' };
    }
    if (!data.result) return { error: 'No se recibió resultado de la IA' };
    const text = data.result.trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return { error: 'No se encontró JSON en la respuesta de la IA' };
    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return { error: 'Error al parsear JSON: ' + (e as Error).message };
    }
  } catch (e: any) {
    return { error: e?.message || 'Error desconocido al llamar a la API' };
  }
}

export default function MapaMentalModal({ open, onClose, avatarUrl, progreso = 0 }: Props) {
  const [contexto, setContexto] = useState('');
  const [ideaCentral, setIdeaCentral] = useState('');
  const [ramas, setRamas] = useState<string[]>([]);
  const [ramaInput, setRamaInput] = useState('');
  const [organizacion, setOrganizacion] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapaGenerado, setMapaGenerado] = useState<MindMapData | null>(null);
  const [xp, setXp] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [badge, setBadge] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // Responsividad: resetear scroll al abrir
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleAddRama = () => {
    if (ramaInput.trim() && ramas.length < 5) {
      setRamas([...ramas, ramaInput.trim()]);
      setRamaInput('');
    }
  };
  const handleRemoveRama = (idx: number) => {
    setRamas(ramas.filter((_, i) => i !== idx));
  };

  const handleGenerarMapa = async () => {
    const idea = ideaCentral || contexto;
    if (!idea) {
      setMensaje('Necesitas una idea central');
      return;
    }
    if (ramas.length === 0) {
      setMensaje('Agrega al menos una rama temática');
      return;
    }
    setMensaje('');
    setLoading(true);
    setMapaGenerado(null);
    try {
      const resultado = await generarMapaMentalIA(idea, ramas);
      if ((resultado as any)?.error) {
        setMensaje('Error: ' + (resultado as any).error);
        setLoading(false);
        return;
      }
      setMapaGenerado(resultado as MindMapData);
      setLoading(false);
      setXp((prev) => prev + 30);
      setMensaje('¡Mapa mental sincronizado! +30 XP');
      if ((resultado as MindMapData)?.ramas && (resultado as MindMapData).ramas.length > 3 && (resultado as MindMapData).ramas.every(r => r.subtemas && r.subtemas.length > 2)) {
        setBadge(true);
      }
    } catch (e: any) {
      setMensaje('Error inesperado: ' + (e?.message || 'Intenta de nuevo.'));
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1a2f]/80 backdrop-blur-xl">
      <div className="relative bg-gradient-to-br from-[#101c2c] via-[#1a2a3f] to-[#101c2c] rounded-3xl shadow-2xl border-2 border-[#3ec6f7] w-full max-w-2xl flex flex-col items-center overflow-y-auto max-h-[90vh] p-0">
        {/* Cerrar */}
        <button onClick={onClose} className="absolute top-4 right-4 text-[#3ec6f7] text-3xl font-bold hover:text-[#aef1ff] transition z-20">×</button>
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row w-full gap-6 p-6 pb-0 items-center justify-center">
          {/* Avatar */}
          <div className="flex flex-col items-center min-w-[100px] relative mb-4 md:mb-0">
            <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-2xl border-4 border-[#3ec6f7] bg-[#0a1a2f] flex items-center justify-center z-10">
              <img
                src={avatarUrl || '/images/modulos/avataractualmodulo1.png'}
                alt="Avatar Usuario"
                className="w-full h-full object-cover animate-fadein"
                style={{ filter: 'drop-shadow(0 0 12px #3ec6f7)' }}
              />
            </div>
          </div>
          {/* Barra circular y título */}
          <div className="flex flex-col items-center min-w-[140px]">
            <img src="/images/modulos/mapamentalactual.svg" alt="Barra Mapa Mental" className="w-20 h-20 mb-2" />
            <div className="text-xl md:text-2xl font-extrabold text-[#aef1ff] font-orbitron drop-shadow-lg tracking-wide text-center">Mapa Mental Rápido</div>
            <div className="text-[#b6eaff] text-base font-semibold drop-shadow text-center mt-1">Conecta tus ideas y dale forma visual a tu pensamiento.</div>
          </div>
        </div>
        {/* Select de contexto */}
        <div className="w-full px-6 mt-4">
          <select
            className="w-full px-4 py-2 rounded-xl border border-[#3ec6f7] bg-[#0a1a2f] text-[#aef1ff] text-base focus:outline-none focus:ring-2 focus:ring-[#3ec6f7] font-orbitron mb-2"
            value={contexto}
            onChange={e => setContexto(e.target.value)}
          >
            <option value="">¿Qué te gustaría organizar hoy?</option>
            {objetivosMentales.map((o, i) => (
              <option key={i} value={o}>{o}</option>
            ))}
          </select>
        </div>
        {/* Inputs IA */}
        <div className="flex flex-col gap-3 w-full px-6 mt-2">
          <input
            className="w-full px-4 py-2 rounded-xl border border-[#3ec6f7] bg-[#0a1a2f] text-[#aef1ff] text-base focus:outline-none focus:ring-2 focus:ring-[#3ec6f7] font-orbitron"
            placeholder="¿Cuál es tu idea central? (opcional)"
            value={ideaCentral}
            onChange={e => setIdeaCentral(e.target.value)}
          />
          {/* Multi-tag ramas */}
          <div className="flex flex-row gap-2 items-center">
            <input
              className="flex-1 px-4 py-2 rounded-xl border border-[#3ec6f7] bg-[#0a1a2f] text-[#aef1ff] text-base focus:outline-none focus:ring-2 focus:ring-[#3ec6f7] font-orbitron"
              placeholder="Agrega una rama temática y presiona +"
              value={ramaInput}
              onChange={e => setRamaInput(e.target.value)}
              maxLength={32}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddRama(); } }}
              disabled={ramas.length >= 5}
            />
            <button
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] font-bold shadow border border-[#3ec6f7] disabled:opacity-40"
              onClick={handleAddRama}
              disabled={!ramaInput.trim() || ramas.length >= 5}
              type="button"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {ramas.map((rama, idx) => (
              <span key={idx} className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#3ec6f7]/20 border border-[#3ec6f7] text-[#aef1ff] font-orbitron text-sm">
                {rama}
                <button className="ml-1 text-[#ff3c3c] font-bold" onClick={() => handleRemoveRama(idx)} type="button">×</button>
              </span>
            ))}
          </div>
          {/* Organización */}
          <select
            className="w-full px-4 py-2 rounded-xl border border-[#3ec6f7] bg-[#0a1a2f] text-[#aef1ff] text-base focus:outline-none focus:ring-2 focus:ring-[#3ec6f7] font-orbitron"
            value={organizacion}
            onChange={e => setOrganizacion(e.target.value)}
          >
            <option value="">¿Cómo quieres organizarlo?</option>
            {opcionesOrganizacion.map((o, i) => (
              <option key={i} value={o}>{o}</option>
            ))}
          </select>
        </div>
        {/* Botones funcionales */}
        <div className="flex flex-row flex-wrap gap-4 w-full px-6 mt-6 mb-4 justify-center">
          <button
            className="px-8 py-3 rounded-2xl font-extrabold text-lg bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] shadow-2xl font-orbitron border-2 border-[#3ec6f7] hover:from-[#4fd1fa] hover:to-[#aef1ff] transition-all"
            onClick={handleGenerarMapa}
            disabled={loading}
          >
            {loading ? 'Generando...' : 'Generar mapa con IA'}
          </button>
          <button
            className="px-6 py-3 rounded-2xl font-extrabold text-lg bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] shadow font-orbitron border-2 border-[#3ec6f7] hover:from-[#4fd1fa] hover:to-[#aef1ff] transition-all"
            onClick={() => activarVoz(setIdeaCentral)}
            disabled={loading}
          >
            🎤 Usar voz
          </button>
          <button
            className="px-6 py-3 rounded-2xl font-extrabold text-lg bg-gradient-to-r from-[#3cff6e] to-[#aef1ff] text-[#101c2c] shadow font-orbitron border-2 border-[#3cff6e] opacity-80 cursor-not-allowed"
            disabled
          >
            Guardar mapa + recolectar XP
          </button>
        </div>
        {/* Mensaje de feedback y XP */}
        {mensaje && (
          <div className="w-full flex items-center justify-center mb-2">
            <span className="px-4 py-2 rounded-xl bg-[#3ec6f7]/10 border border-[#3ec6f7] text-[#aef1ff] font-orbitron text-base animate-glow">{mensaje}</span>
          </div>
        )}
        {/* Badge sorpresa */}
        {badge && (
          <div className="w-full flex items-center justify-center mb-2">
            <span className="px-4 py-2 rounded-xl bg-[#ffe93c]/20 border border-[#ffe93c] text-[#ffe93c] font-orbitron text-base animate-glow">¡Badge sorpresa desbloqueado!</span>
          </div>
        )}
        {/* Resultado visual */}
        <div className="w-full flex items-center justify-center pb-8 px-6">
          {loading ? (
            <div className="w-80 h-40 flex items-center justify-center text-[#3ec6f7] font-orbitron text-lg animate-pulse">
              Generando mapa mental...
            </div>
          ) : mapaGenerado ? (
            <div className="w-full max-w-lg bg-[#1a2a3f]/40 rounded-2xl flex flex-col items-center justify-center p-6">
              <MindMapSVG data={mapaGenerado} />
              <div className="flex flex-row gap-4 mt-4">
                <img src="/images/modulos/xp.svg" alt="XP" className="w-8 h-8" />
                <img src="/images/modulos/neurocoin.svg" alt="Coin" className="w-8 h-8" />
              </div>
            </div>
          ) : (
            <div className="w-80 h-40 bg-[#1a2a3f]/40 rounded-2xl flex items-center justify-center text-[#3ec6f7] font-orbitron text-lg opacity-60">
              Aquí aparecerá tu mapa mental generado
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 