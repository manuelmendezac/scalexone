import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, BadgeCheck, Coins } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd';
import { useBiblioteca } from '../context/BibliotecaContext';

export default function OrganizadorTableroModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { documentos, categorias, setDocumentos, setCategorias } = useBiblioteca();
  const [organizados, setOrganizados] = useState(0);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [insignia, setInsignia] = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);

  // Agrupa docs por categoría
  const docsPorCategoria = categorias.reduce((acc, cat) => {
    acc[cat.id] = documentos.filter(d => d.categoria === cat.id);
    return acc;
  }, {} as Record<string, typeof documentos>);

  // Drag & drop
  function onDragEnd(result: any) {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    setDocumentos(prev => prev.map(doc =>
      doc.id === draggableId ? { ...doc, categoria: destination.droppableId } : doc
    ));
    setOrganizados(o => o + 1);
    if ((organizados + 1) % 5 === 0) setCoins(c => c + 10);
    // Insignia si hay 3 en una categoría
    const nuevaCat = destination.droppableId;
    const count = documentos.filter(d => d.categoria === nuevaCat).length + 1;
    if (count >= 3) setInsignia(true);
  }

  // Nueva categoría
  function agregarCategoria() {
    const nombre = prompt('Nombre de la nueva categoría:');
    if (!nombre) return;
    setCategorias([...categorias, { id: nombre, nombre }]);
  }

  // Sugerencia IA (simulada)
  async function sugerenciaIA() {
    setLoadingIA(true);
    setTimeout(() => {
      setDocumentos(prev => prev.map(doc => ({ ...doc, categoria: 'IA' })));
      setXp(x => x + 25);
      setLoadingIA(false);
    }, 1500);
  }

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-gradient-to-br from-[#1a1a2f] via-[#2a2a3f] to-[#1a1a2f] border-4 border-[#f7c63e] rounded-2xl shadow-2xl w-full max-w-5xl mx-auto p-6 flex flex-col gap-4 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-[#f7c63e]">Organizador de Documentos</h2>
          <button onClick={onClose} className="text-white text-xl">✕</button>
        </div>
        <div className="flex flex-row gap-4 items-center mb-2 flex-wrap">
          <button onClick={agregarCategoria} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#2a2a3f] border border-[#f7c63e] text-[#f7c63e] hover:bg-[#f7c63e] hover:text-[#1a1a2f] transition"><Plus size={18}/> Nueva categoría</button>
          <button onClick={sugerenciaIA} disabled={loadingIA} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#2a2a3f] border border-[#00ffcc] text-[#00ffcc] hover:bg-[#00ffcc] hover:text-[#1a1a2f] transition disabled:opacity-50"><Sparkles size={18}/> {loadingIA ? 'Pensando...' : 'Sugerencia IA'}</button>
          <div className="flex items-center gap-2 ml-auto">
            <Coins size={20} className="text-yellow-400" /> <span className="text-yellow-300 font-bold">{coins}</span>
            <span className="mx-2">|</span>
            <Sparkles size={20} className="text-cyan-400" /> <span className="text-cyan-300 font-bold">{xp} XP</span>
            {insignia && <span className="ml-4 flex items-center gap-1 text-green-400 font-bold"><BadgeCheck size={18}/> Curador Galáctico</span>}
          </div>
        </div>
        <div className="overflow-x-auto pb-2">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-row gap-4 min-w-[600px]">
              {categorias.map(cat => (
                <Droppable droppableId={cat.id} key={cat.id}>
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-[#23233a] rounded-xl p-3 min-w-[220px] flex-1 border-2 ${snapshot.isDraggingOver ? 'border-[#00ffcc]' : 'border-[#2a2a3f]'} transition`}
                    >
                      <h3 className="text-lg font-bold text-[#f7c63e] mb-2 text-center">{cat.nombre}</h3>
                      {docsPorCategoria[cat.id]?.map((doc, idx) => (
                        <Draggable draggableId={doc.id} index={idx} key={doc.id}>
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-[#1a1a2f] rounded-lg p-3 mb-3 shadow-md border border-[#f7c63e] transition-all duration-150 ${snapshot.isDragging ? 'scale-105 shadow-xl' : 'hover:scale-105'} cursor-pointer`}
                            >
                              <div className="font-semibold text-[#fff7ae]">{doc.titulo}</div>
                              <div className="text-xs text-[#00ffcc]">{doc.categoria}</div>
                              <div className="text-xs text-gray-400">{doc.fecha}</div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      </motion.div>
    </Dialog>
  );
} 