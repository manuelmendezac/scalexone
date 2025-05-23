import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Save, Mic, BadgeCheck, Coins } from 'lucide-react';
import { useBiblioteca } from '../context/BibliotecaContext';

const sugerencias = [
  '¿Qué dice mi archivo sobre productividad?',
  '¿Cuál es el resumen del documento sobre hábitos?',
  '¿Qué consejos de IA hay en mis documentos?',
];

const estilos = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'puntos', label: 'Puntos clave' },
  { id: 'cita', label: 'Cita textual' },
];

export default function BuscarIAModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { documentos, categorias } = useBiblioteca();
  const [pregunta, setPregunta] = useState('');
  const [chat, setChat] = useState<{ pregunta: string; respuesta: string; fuente: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [insignia, setInsignia] = useState(false);
  const [filtroCat, setFiltroCat] = useState('');
  const [estilo, setEstilo] = useState(estilos[0].id);
  const [busquedas, setBusquedas] = useState(0);

  async function handleBuscar(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!pregunta.trim()) return;
    setLoading(true);
    try {
      // Llamada real al backend para búsqueda semántica
      const res = await fetch('/api/searchDocs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: pregunta, categoria: filtroCat }),
      });
      const data = await res.json();
      const doc = data.resultados?.[0] || { titulo: 'Documento', fragmento: '', categoria: '', url: '' };
      // Simular respuesta IA usando fragmento
      const respuesta =
        estilo === 'resumen'
          ? `Resumen IA: ${doc.fragmento || 'No se encontró información relevante.'}`
          : estilo === 'puntos'
          ? `Puntos clave IA:\n- ${doc.fragmento || 'No se encontraron puntos clave.'}`
          : `Cita IA: "${doc.fragmento || 'Sin cita disponible.'}"`;
      setChat(prev => [...prev, { pregunta, respuesta, fuente: doc.titulo }]);
      setPregunta('');
      setLoading(false);
      setXp(x => x + 15);
      setBusquedas(b => {
        const nuevo = b + 1;
        if (nuevo >= 10) setInsignia(true);
        return nuevo;
      });
    } catch (err) {
      setChat(prev => [...prev, { pregunta, respuesta: 'Error al buscar en la biblioteca.', fuente: '' }]);
      setPregunta('');
      setLoading(false);
    }
  }

  function handleGuardar(idx: number) {
    setCoins(c => c + 1);
    // Aquí podrías guardar la respuesta en Supabase o local
  }

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-br from-[#1a1a2f]/90 via-[#2a2a3f]/80 to-[#1a1a2f]/90 animate-pulse" aria-hidden="true" />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl mx-auto bg-gradient-to-br from-[#23233a] via-[#1a1a2f] to-[#23233a] border-4 border-[#f7c63e] rounded-2xl shadow-2xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-[#f7c63e] flex items-center gap-2"><Sparkles /> Buscar IA</h2>
          <button onClick={onClose} className="text-white text-xl">✕</button>
        </div>
        {/* Gamificación */}
        <div className="flex items-center gap-4 mb-2">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#23232f] border border-[#f7c63e]/40 text-[#fff7ae] font-bold text-base"><Sparkles className="w-5 h-5 text-[#f7c63e]" /> {xp} XP</span>
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#23232f] border border-[#f7c63e]/40 text-[#fff7ae] font-bold text-base"><Coins className="w-5 h-5 text-yellow-400" /> {coins}</span>
          {insignia && <span className="flex items-center gap-1 text-green-400 font-bold ml-2"><BadgeCheck size={18}/> Investigador IA</span>}
        </div>
        {/* Filtros */}
        <div className="flex flex-row gap-3 mb-2 items-center">
          <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)} className="rounded-lg px-3 py-1 bg-[#23232f] border border-[#f7c63e]/40 text-[#f7c63e]">
            <option value="">Todas las categorías</option>
            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
          </select>
          <select value={estilo} onChange={e => setEstilo(e.target.value)} className="rounded-lg px-3 py-1 bg-[#23232f] border border-[#f7c63e]/40 text-[#f7c63e]">
            {estilos.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
          <button className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg bg-[#23232f] border border-[#f7c63e]/40 text-[#f7c63e] opacity-60 cursor-not-allowed" disabled><Mic className="w-5 h-5" /> Usar voz (pronto)</button>
        </div>
        {/* Chat */}
        <div className="flex-1 overflow-y-auto max-h-72 bg-[#1a1a2f]/60 rounded-xl p-4 mb-2 border border-[#f7c63e]/10">
          {chat.length === 0 && (
            <div className="text-[#fff7ae]/60 text-center italic">Sugerencias:<br />{sugerencias.map((s, i) => <div key={i} className="mt-1">{s}</div>)}</div>
          )}
          {chat.map((msg, idx) => (
            <div key={idx} className="mb-4">
              <div className="text-[#00ffcc] font-bold mb-1">Tú: {msg.pregunta}</div>
              <div className="bg-[#23233a] rounded-lg p-3 text-[#fff7ae] shadow-md relative">
                <div>{msg.respuesta}</div>
                <div className="text-xs text-[#f7c63e] mt-2">Fuente: {msg.fuente}</div>
                <button onClick={() => handleGuardar(idx)} className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-[#f7c63e]/20 text-[#f7c63e] text-xs font-bold hover:bg-[#f7c63e]/40 transition"><Save className="w-4 h-4" /> Guardar</button>
              </div>
            </div>
          ))}
        </div>
        {/* Input pregunta */}
        <form onSubmit={handleBuscar} className="flex flex-row gap-2 items-center mt-2">
          <input
            type="text"
            value={pregunta}
            onChange={e => setPregunta(e.target.value)}
            placeholder={sugerencias[Math.floor(Math.random() * sugerencias.length)]}
            className="flex-1 rounded-lg px-4 py-2 bg-[#23232f] border border-[#f7c63e]/40 text-[#fff7ae] focus:outline-none focus:ring-2 focus:ring-[#f7c63e]/40 font-mono"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !pregunta.trim()} className="px-4 py-2 rounded-lg bg-[#f7c63e] text-[#1a1a2f] font-bold hover:bg-[#fff7ae] transition flex items-center gap-1">
            <Send className="w-5 h-5" /> Buscar
          </button>
        </form>
      </motion.div>
    </Dialog>
  );
} 