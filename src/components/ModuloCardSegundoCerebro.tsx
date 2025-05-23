import React from 'react';

interface ModuloCardProps {
  nombreAmigable: string;
  descripcion: string;
  instrucciones: string;
  icono?: React.ReactNode;
  progreso: number;
  estado: 'pendiente' | 'activado' | 'completado';
  onConfigurar: () => void;
  imagen?: string;
}

const estadosTexto: Record<string, string> = {
  pendiente: 'Pendiente',
  activado: 'En entrenamiento',
  completado: 'Completado',
};

const estadosColor: Record<string, string> = {
  pendiente: 'border-[#3ec6f7] text-[#3ec6f7] bg-[#101c2c]',
  activado: 'border-[#4fd1fa] text-[#4fd1fa] bg-[#101c2c]',
  completado: 'border-[#aef1ff] text-[#aef1ff] bg-[#101c2c]',
};

const ModuloCardSegundoCerebro: React.FC<ModuloCardProps> = ({
  nombreAmigable,
  descripcion,
  instrucciones,
  icono,
  progreso,
  estado,
  onConfigurar,
  imagen,
}) => {
  // Funciones específicas para Sincronizador Mental
  const funciones = [
    { icon: '🧠', texto: 'Mapas mentales rápidos' },
    { icon: '🔁', texto: 'Sincronizar tareas con IA' },
    { icon: '🗂️', texto: 'Agrupar pensamientos' },
  ];
  // Recompensa visual (placeholder animado)
  const recompensa = estado === 'completado' ? (
    <div className="flex flex-col items-center animate-bounce">
      <span className="text-yellow-400 text-3xl">🏅</span>
      <span className="text-xs text-yellow-300 font-bold">+100 XP</span>
    </div>
  ) : null;

  // Estado visual
  const estadoVisual = estado === 'pendiente' ? '🟡 Pendiente' : estado === 'activado' ? '🟢 En curso' : '✅ Completado';

  // Imagen AI de conexión mental (ejemplo de stock IA)
  const imagenAI = imagen || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="w-full bg-gradient-to-r from-[#101c2c] via-[#182a3a] to-[#0a1623] rounded-2xl border-2 border-[#3ec6f7] shadow-2xl mb-10 flex flex-col gap-0 overflow-hidden transition-all hover:scale-[1.01]">
      {/* Primera línea: info principal */}
      <div className="flex flex-row items-center w-full gap-8 px-8 py-6">
        {/* Imagen y barra de progreso */}
        <div className="flex flex-col items-center w-40 min-w-[120px]">
          <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg border-4 border-[#3ec6f7] bg-[#0a1623] flex items-center justify-center mb-2">
            <img src={imagenAI} alt="Sincronizador Mental" className="object-cover w-full h-full" />
          </div>
          <div className="w-24 h-3 bg-[#0a1623] rounded-full relative overflow-hidden">
            <div className="h-3 rounded-full bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] transition-all" style={{ width: `${progreso}%` }} />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-[#aef1ff] font-bold">{progreso}%</span>
          </div>
        </div>
        {/* Centro: nombre, descripción, estado */}
        <div className="flex-1 flex flex-col items-start justify-center gap-2">
          <div className="font-extrabold text-3xl text-[#aef1ff] font-orbitron mb-1 drop-shadow-lg tracking-wide">{nombreAmigable}</div>
          <div className="text-[#b6eaff] text-base mb-1 font-semibold max-w-xl drop-shadow">{descripcion}</div>
          <div className="text-lg font-bold mb-1 flex items-center gap-2">
            <span className="drop-shadow text-[#3ec6f7]">{estadoVisual}</span>
          </div>
        </div>
        {/* Derecha: botón y recompensa */}
        <div className="flex flex-col items-end gap-3 min-w-[140px]">
          <button
            className="px-7 py-2 rounded-xl font-bold text-lg bg-gradient-to-r from-[#3ec6f7] to-[#aef1ff] text-[#101c2c] hover:from-[#4fd1fa] hover:to-[#aef1ff] shadow-lg font-orbitron mb-1 transition-all"
            onClick={onConfigurar}
            disabled={estado === 'completado'}
          >
            {estado === 'pendiente' ? 'Activar' : estado === 'activado' ? 'Continuar' : 'Completado'}
          </button>
          {recompensa}
        </div>
      </div>
      {/* Segunda línea: funciones rápidas, con feedback visual */}
      <div className="flex flex-row items-center gap-8 px-10 py-4 bg-[#162232]/80 border-t border-[#3ec6f7]/30">
        {funciones.map((f, idx) => (
          <button
            key={idx}
            className="flex flex-col items-center gap-1 min-w-[120px] p-3 rounded-xl bg-[#101c2c]/70 hover:bg-[#3ec6f7]/20 transition-all shadow group border border-transparent hover:border-[#3ec6f7]"
            onClick={() => alert(`Función: ${f.texto}`)}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform drop-shadow-lg">{f.icon}</span>
            <span className="text-sm text-[#aef1ff] text-center font-bold group-hover:text-[#3ec6f7]">{f.texto}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModuloCardSegundoCerebro; 