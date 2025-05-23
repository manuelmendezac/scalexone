import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, CheckCircle, AlertTriangle, BadgeCheck, Loader2, BookOpen, Info, Trash2 } from 'lucide-react';
import useNeuroState from '../store/useNeuroState';
import { supabase } from '../supabase';

const COLOR_PRINCIPAL = '#00ffcc'; // Cian neón
const COLOR_SECUNDARIO = '#00b8ff'; // Azul brillante
const COLOR_FONDO = '#23233a';

// Constantes
const REWARD_LIMIT = 3;
const XP_REWARD = 25;
const COIN_REWARD = 1;
const PROGRESO_INCREMENT = 15;
const MAX_PROGRESO = 100;
const SUPABASE_TABLE = 'ThoughtGroups';

// Interfaces
interface AgrupacionHistorial {
  user_id: string;
  pensamientos: string;
  agrupacion: string;
  created_at: string;
}

interface Categoria {
  nombre: string;
  items: string[];
  color: string;
}

interface ResultadoIA {
  categorias: Categoria[];
  resumen: string;
  recomendacion: string;
}

const ModuloCardAgruparPensamientos: React.FC = () => {
  const neuro = useNeuroState();
  const user_id = neuro.userInfo?.email || 'anon';
  const [pensamientos, setPensamientos] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoIA | null>(null);
  const [historial, setHistorial] = useState<AgrupacionHistorial[]>([]);
  const [progreso, setProgreso] = useState(0);
  const [xp, setXp] = useState(neuro.userXP || 0);
  const [coins, setCoins] = useState(neuro.userCoins || 0);
  const [showGuia, setShowGuia] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rewardedToday, setRewardedToday] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [agrupacionGuardada, setAgrupacionGuardada] = useState(false);
  const [expandedHistorial, setExpandedHistorial] = useState<number | null>(null);

  // Función para eliminar agrupación
  async function eliminarAgrupacion(index: number) {
    const agrupacion = historial[index];
    if (!agrupacion) return;

    // Eliminar de Supabase
    await supabase
      .from(SUPABASE_TABLE)
      .delete()
      .eq('user_id', agrupacion.user_id)
      .eq('created_at', agrupacion.created_at);

    // Actualizar estado local
    setHistorial((prev: AgrupacionHistorial[]) => prev.filter((_, i) => i !== index));
    
    // Mostrar feedback
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  {/* Historial de agrupaciones */}
  <div className="flex flex-col items-center w-full mb-6 animate-fadein">
    <div className="bg-[#23233a]/80 rounded-xl p-6 border-2 border-[#00ffcc]/40 shadow-lg max-w-2xl w-full flex flex-col gap-4 backdrop-blur-sm">
      <div className="text-[#00ffcc] font-bold mb-2 flex items-center gap-2">
        <BookOpen className="w-5 h-5" /> Historial de Agrupaciones
      </div>
      {historial.slice(0, 3).map((h, i) => {
        const agrupacion = JSON.parse(h.agrupacion);
        return (
          <div key={i} className="bg-[#00ffcc]/10 border border-[#00ffcc]/20 rounded-xl p-4 hover:scale-105 transition">
            <div className="flex flex-row items-center justify-between mb-2">
              <span className="text-[#00b8ff] font-semibold">{new Date(h.created_at).toLocaleString()}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setExpandedHistorial(expandedHistorial === i ? null : i)}
                  className="p-2 rounded-lg bg-[#23233a] border border-[#00ffcc]/40 hover:bg-[#00ffcc]/20 transition"
                >
                  <Info className="w-4 h-4 text-[#00ffcc]" />
                </button>
                <button 
                  onClick={() => eliminarAgrupacion(i)}
                  className="p-2 rounded-lg bg-[#23233a] border border-[#00ffcc]/40 hover:bg-[#00ffcc]/20 transition"
                >
                  <Trash2 className="w-4 h-4 text-[#00ffcc]" />
                </button>
              </div>
            </div>
            <div className="text-[#baffff] text-sm mb-2">{h.pensamientos.split('\n')[0]}...</div>
            <div className="grid grid-cols-3 gap-2">
              {agrupacion.categorias.map((cat: any, j: number) => (
                <div key={j} className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                  {cat.nombre}
                </div>
              ))}
            </div>
            {expandedHistorial === i && (
              <div className="mt-4 p-4 rounded-xl bg-[#23233a]/80 border border-[#00ffcc]/30 animate-fadein">
                <div className="text-[#00ffcc] font-bold mb-2">Pensamientos originales:</div>
                <div className="text-[#baffff] text-sm whitespace-pre-wrap mb-4">{h.pensamientos}</div>
                <div className="text-[#00ffcc] font-bold mb-2">Resumen:</div>
                <div className="text-[#baffff] text-sm mb-4">{agrupacion.resumen}</div>
                <div className="text-[#00ffcc] font-bold mb-2">Recomendación:</div>
                <div className="text-[#baffff] text-sm">{agrupacion.recomendacion}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>

  {/* Toast de éxito/eliminación */}
  {showToast && (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fadein">
      <div className="px-8 py-4 rounded-2xl bg-[#23233a]/90 border-2 border-[#00ffcc]/30 shadow-xl flex items-center gap-4 animate-glow-soft">
        <Sparkles className="w-7 h-7 text-[#00ffcc] animate-bounce" />
        <span className="text-[#00ffcc] font-bold text-lg">
          {agrupacionGuardada ? '¡Agrupación guardada! +25 XP y +1 Neurocoin' : 'Agrupación eliminada'}
        </span>
      </div>
    </div>
  )}

  return (
    <div className="w-full min-h-[480px] relative rounded-2xl border-4 mb-10 overflow-hidden shadow-2xl p-0 flex flex-col gap-0 bg-gradient-to-br from-[#23233a] via-[#00ffcc]/10 to-[#23233a] animate-fadein">
      {/* Cabecera con imagen y progreso */}
      {/* ...resto del JSX del componente... */}
    </div>
  );
};

export default ModuloCardAgruparPensamientos; 