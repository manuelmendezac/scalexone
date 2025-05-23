import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Coins, BadgeCheck, Brain, Search, FolderOpen } from 'lucide-react';
import { useBiblioteca } from '../context/BibliotecaContext';

const retosSemanales = [
  {
    id: 1,
    texto: 'Haz 2 búsquedas esta semana',
    recompensa: '+20 XP, +1 Neurocoin',
  },
  {
    id: 2,
    texto: 'Organiza 3 documentos en una nueva categoría',
    recompensa: '+20 XP',
  },
];

const preguntasSugeridas = [
  '¿Qué me dice la IA sobre procrastinación?',
  '¿Cómo mejorar mi enfoque según mis documentos?',
  '¿Qué hábitos recomienda la IA para la creatividad?',
];

export default function ProgresoTipsIAModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { documentos, categorias } = useBiblioteca();
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [insignia, setInsignia] = useState(false);
  const [retoCompletado, setRetoCompletado] = useState(false);

  // Calcular progreso por categoría
  const progresoPorCategoria = categorias.map(cat => {
    const total = documentos.length;
    const enCat = documentos.filter(d => d.categoria === cat.id).length;
    return {
      ...cat,
      porcentaje: total ? Math.round((enCat / total) * 100) : 0,
      cantidad: enCat,
    };
  });

  // Simular búsquedas y organización
  const totalBusquedas = 7; // Simulado
  const totalOrganizados = 5; // Simulado

  // Tips IA simulados
  const tipsIA = [
    'Te recomiendo repasar "Hábitos Atómicos" para mejorar tu productividad.',
    '¡Buen trabajo en creatividad! Prueba agregar un nuevo documento sobre innovación.',
    'Haz una búsqueda sobre "gestión del tiempo" para potenciar tu semana.',
  ];

  useEffect(() => {
    setXp(100 + (retoCompletado ? 20 : 0));
    setCoins(5 + (retoCompletado ? 1 : 0));
    if (retoCompletado) setInsignia(true);
  }, [retoCompletado]);

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a2f]/90 via-[#2a2a3f]/80 to-[#1a1a2f]/90 animate-pulse" aria-hidden="true" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-3xl mx-auto bg-gradient-to-br from-[#23233a] via-[#1a1a2f] to-[#23233a] border-4 border-[#f7c63e] rounded-2xl shadow-2xl p-8 flex flex-col gap-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-[#f7c63e] flex items-center gap-2"><Trophy /> Progreso y Tips IA</h2>
          <button onClick={onClose} className="text-white text-xl">✕</button>
        </div>
        {/* Gamificación */}
        <div className="flex items-center gap-4 mb-2">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#23232f] border border-[#f7c63e]/40 text-[#fff7ae] font-bold text-base"><Sparkles className="w-5 h-5 text-[#f7c63e]" /> {xp} XP</span>
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#23232f] border border-[#f7c63e]/40 text-[#fff7ae] font-bold text-base"><Coins className="w-5 h-5 text-yellow-400" /> {coins}</span>
          {insignia && <span className="flex items-center gap-1 text-green-400 font-bold ml-2"><BadgeCheck size={18}/> Misión semanal</span>}
        </div>
        {/* Progreso por categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          {progresoPorCategoria.map(cat => (
            <div key={cat.id} className="bg-[#1a1a2f]/80 rounded-xl p-6 border-2 border-[#f7c63e]/20 flex flex-col items-center shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-7 h-7 text-[#f7c63e]" />
                <span className="text-lg font-bold text-[#fff7ae]">{cat.nombre}</span>
              </div>
              <div className="relative w-24 h-24 mb-2">
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" stroke="#2a2a3f" strokeWidth="10" fill="none" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#f7c63e"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 - (cat.porcentaje / 100) * 2 * Math.PI * 40}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px #f7c63e)', transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)' }}
                  />
                  <text x="50%" y="54%" textAnchor="middle" fill="#fff7ae" fontSize="1.5rem" fontWeight="bold">{cat.porcentaje}%</text>
                </svg>
              </div>
              <div className="text-[#ffeeb6] text-sm">{cat.cantidad} documentos</div>
            </div>
          ))}
        </div>
        {/* Estadísticas generales */}
        <div className="flex flex-row gap-6 items-center justify-center mb-4">
          <div className="flex flex-col items-center">
            <FolderOpen className="w-7 h-7 text-[#f7c63e] mb-1" />
            <span className="text-[#fff7ae] font-bold">{documentos.length}</span>
            <span className="text-[#ffeeb6] text-xs">Subidos</span>
          </div>
          <div className="flex flex-col items-center">
            <Search className="w-7 h-7 text-[#f7c63e] mb-1" />
            <span className="text-[#fff7ae] font-bold">{totalBusquedas}</span>
            <span className="text-[#ffeeb6] text-xs">Búsquedas</span>
          </div>
          <div className="flex flex-col items-center">
            <BadgeCheck className="w-7 h-7 text-[#f7c63e] mb-1" />
            <span className="text-[#fff7ae] font-bold">{totalOrganizados}</span>
            <span className="text-[#ffeeb6] text-xs">Organizados</span>
          </div>
        </div>
        {/* Tips IA y retos */}
        <div className="bg-[#23233a]/80 rounded-xl p-6 border-2 border-[#f7c63e]/20 shadow-lg mb-2">
          <h3 className="text-lg font-bold text-[#f7c63e] mb-2 flex items-center gap-2"><Sparkles /> Tips IA personalizados</h3>
          <ul className="list-disc pl-6 text-[#fff7ae] mb-2">
            {tipsIA.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
          <h4 className="text-base font-bold text-[#ffeeb6] mt-4 mb-1 flex items-center gap-2"><Trophy className="w-5 h-5" /> Reto semanal</h4>
          <div className="flex flex-row gap-4 items-center mb-2">
            {retosSemanales.map(reto => (
              <button
                key={reto.id}
                className={`px-4 py-2 rounded-lg font-bold border-2 ${retoCompletado ? 'bg-green-400/20 border-green-400 text-green-300' : 'bg-[#f7c63e]/10 border-[#f7c63e]/40 text-[#f7c63e]'}`}
                onClick={() => setRetoCompletado(true)}
                disabled={retoCompletado}
              >
                {reto.texto} <span className="ml-2 text-xs">{reto.recompensa}</span>
              </button>
            ))}
          </div>
          <h4 className="text-base font-bold text-[#ffeeb6] mt-4 mb-1 flex items-center gap-2"><Brain className="w-5 h-5" /> Preguntas sugeridas</h4>
          <ul className="list-disc pl-6 text-[#fff7ae]">
            {preguntasSugeridas.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </div>
      </motion.div>
    </Dialog>
  );
} 