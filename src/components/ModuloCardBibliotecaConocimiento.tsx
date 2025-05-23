import React from 'react';
import UploaderBibliotecaConocimiento from './UploaderBibliotecaConocimiento';
import OrganizadorTableroModal from './OrganizadorTableroModal';
import BuscarIAModal from './BuscarIAModal';
import ProgresoTipsIAModal from './ProgresoTipsIAModal';

interface Props {
  progreso: number;
  estado: 'pendiente' | 'en_curso' | 'completado';
  xp?: number;
  monedas?: number;
  onSubirDocumento: () => void;
  onOrganizar: () => void;
  onBuscar: () => void;
  onProgreso: () => void;
  imagen?: string;
}

const estados = {
  pendiente: { texto: 'Pendiente', color: 'bg-yellow-400', icon: '📂' },
  en_curso: { texto: 'En curso', color: 'bg-green-400', icon: '📖' },
  completado: { texto: 'Completado', color: 'bg-cyan-400', icon: '🏆' },
};

export default function ModuloCardBibliotecaConocimiento({
  progreso,
  estado,
  xp = 0,
  monedas = 0,
  onSubirDocumento,
  onOrganizar,
  onBuscar,
  onProgreso,
  imagen,
}: Props) {
  const [openOrganizador, setOpenOrganizador] = React.useState(false);
  const [openBuscarIA, setOpenBuscarIA] = React.useState(false);
  const [openProgresoIA, setOpenProgresoIA] = React.useState(false);

  return (
    <div className="w-full min-h-[540px] relative rounded-2xl border-4 border-[#f7c63e] shadow-2xl p-0 flex flex-col gap-0 mb-10 overflow-hidden bg-gradient-to-br from-[#1a1a2f] via-[#2a2a3f] to-[#1a1a2f]">
      {/* Cabecera: imagen izquierda y barra de progreso derecha */}
      <div className="flex flex-row items-center justify-center gap-16 w-full flex-wrap md:flex-nowrap px-8 py-8">
        {/* Imagen biblioteca digital a la izquierda */}
        <div className="relative flex flex-col items-center justify-center min-w-[260px]">
          <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-[#f7c63e] bg-[#1a1623] flex items-center justify-center z-10">
            <img
              src="/images/modulos/modulo2.png"
              alt="Biblioteca de Conocimiento"
              className="object-cover w-full h-full animate-fadein"
              style={{filter: 'drop-shadow(0 0 24px #f7c63e)'}}
            />
          </div>
        </div>
        {/* Barra de progreso Sci-Fi a la derecha (idéntica a Módulo 1 pero con dorado) */}
        <div className="relative flex flex-col items-center justify-center min-w-[260px]">
          <svg width="260" height="260" viewBox="0 0 260 260">
            <defs>
              <linearGradient id="gaugeGradientGold" x1="0" y1="0" x2="1" y2="1">
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
              r="110"
              stroke="#2a2a3f"
              strokeWidth="18"
              fill="none"
            />
            {/* Barra de progreso gauge */}
            <circle
              cx="130"
              cy="130"
              r="110"
              stroke="url(#gaugeGradientGold)"
              strokeWidth="18"
              fill="none"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 - (progreso / 100) * 2 * Math.PI * 110}
              strokeLinecap="round"
              style={{filter: 'drop-shadow(0 0 16px #3ec6f7)', transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)'}}
            />
          </svg>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-extrabold text-[#fff7ae] drop-shadow-lg tracking-widest">{progreso}%</span>
          {/* XP y Neurocoin debajo de la barra */}
          <div className="flex flex-row items-center gap-3 mt-6">
            <span className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#23232f] border border-[#f7c63e]/40 shadow text-[#fff7ae] font-bold text-lg">
              <img src="/images/modulos/xp.svg" alt="XP" className="w-7 h-7 mr-1" />
              {xp}
            </span>
            <span className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#23232f] border border-[#f7c63e]/40 shadow text-[#fff7ae] font-bold text-lg">
              <img src="/images/modulos/neurocoin.svg" alt="Neurocoin" className="w-7 h-7 mr-1" />
              {monedas}
            </span>
          </div>
        </div>
      </div>
      {/* Título y descripción */}
      <div className="flex flex-col items-center justify-center w-full mb-4">
        <div className="font-extrabold text-4xl text-[#fff7ae] font-orbitron mb-2 drop-shadow-lg tracking-wide text-center">Biblioteca de Conocimiento</div>
        <div className="text-[#ffeeb6] text-xl mb-2 font-semibold max-w-2xl drop-shadow text-center">Almacena, organiza y consulta tus documentos clave. ¡Construye tu banco de aprendizaje con IA!</div>
        {/* Chips de categorías */}
        <div className="flex flex-row gap-4 mt-4 justify-center">
          {['Productividad', 'Salud Mental', 'Creatividad', 'IA'].map((cat, idx) => (
            <span key={idx} className="px-4 py-2 rounded-full bg-[#f7c63e]/20 text-[#f7c63e] font-bold text-base shadow hover:bg-[#f7c63e]/40 cursor-pointer transition-all">{cat}</span>
          ))}
        </div>
      </div>
      {/* Fondo animado de circuitos (placeholder visual) */}
      <div className="absolute inset-0 z-0 pointer-events-none animate-pulse" style={{background: 'radial-gradient(circle at 70% 20%, #f7c63e 0%, transparent 60%)'}} />
      {/* Uploader de documentos */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full mb-8">
        <UploaderBibliotecaConocimiento />
      </div>
      {/* Línea inferior: tareas con imagen y botón centrados */}
      <div className="relative z-10 flex flex-row items-center gap-8 px-8 py-8 bg-[#23232f]/80 border-t border-[#f7c63e]/30 justify-center">
        {/* Organizar por tema */}
        <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-[#f7c63e]/20 to-[#fff7ae]/10 rounded-2xl p-8 hover:bg-[#f7c63e]/30 transition group border-2 border-[#f7c63e]/30 shadow-xl min-w-[220px] animate-glow focus:outline-none focus:ring-4 focus:ring-[#f7c63e]/40">
          <img src="/images/modulos/organizaractual.svg" alt="Organizar por tema" className="w-16 h-16 mb-2 group-hover:scale-110 transition" />
          <span className="text-[#fff7ae] font-bold text-xl text-center mb-2">Organizar por tema</span>
          <div className="w-full flex flex-col items-center">
            <button
              className="px-8 py-3 rounded-xl bg-[#f7c63e] text-[#1a1a2f] font-bold text-lg shadow-lg border-2 border-[#fff7ae] hover:bg-[#fff7ae] hover:text-[#1a1a2f] transition mb-2"
              onClick={() => setOpenOrganizador(true)}
            >
              Organizar
            </button>
            <OrganizadorTableroModal open={openOrganizador} onClose={() => setOpenOrganizador(false)} />
          </div>
        </div>
        {/* Buscar IA */}
        <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-[#f7c63e]/20 to-[#fff7ae]/10 rounded-2xl p-8 hover:bg-[#f7c63e]/30 transition group border-2 border-[#f7c63e]/30 shadow-xl min-w-[220px] animate-glow focus:outline-none focus:ring-4 focus:ring-[#f7c63e]/40">
          <img src="/images/modulos/buscar.svg" alt="Buscar IA" className="w-16 h-16 mb-2 group-hover:scale-110 transition" />
          <span className="text-[#fff7ae] font-bold text-xl text-center mb-2">Buscar IA</span>
          <div className="w-full flex flex-col items-center">
            <button
              className="px-8 py-3 rounded-xl bg-[#f7c63e] text-[#1a1a2f] font-bold text-lg shadow-lg border-2 border-[#fff7ae] hover:bg-[#fff7ae] hover:text-[#1a1a2f] transition mb-2"
              onClick={() => setOpenBuscarIA(true)}
            >
              Buscar
            </button>
            <BuscarIAModal open={openBuscarIA} onClose={() => setOpenBuscarIA(false)} />
          </div>
        </div>
        {/* Progreso y tips IA */}
        <div className="flex flex-col items-center gap-3 bg-gradient-to-br from-[#f7c63e]/20 to-[#fff7ae]/10 rounded-2xl p-8 hover:bg-[#f7c63e]/30 transition group border-2 border-[#f7c63e]/30 shadow-xl min-w-[220px] animate-glow focus:outline-none focus:ring-4 focus:ring-[#f7c63e]/40">
          <img src="/images/modulos/progreso.svg" alt="Progreso IA" className="w-16 h-16 mb-2 group-hover:scale-110 transition" />
          <span className="text-[#fff7ae] font-bold text-xl text-center mb-2">Progreso y tips IA</span>
          <div className="w-full flex flex-col items-center">
            <button
              className="px-8 py-3 rounded-xl bg-[#f7c63e] text-[#1a1a2f] font-bold text-lg shadow-lg border-2 border-[#fff7ae] hover:bg-[#fff7ae] hover:text-[#1a1a2f] transition mb-2"
              onClick={() => setOpenProgresoIA(true)}
            >
              Ver progreso
            </button>
            <ProgresoTipsIAModal open={openProgresoIA} onClose={() => setOpenProgresoIA(false)} />
          </div>
        </div>
      </div>
      {/* Responsive: ajustar flex y gap para mobile */}
      <style>{`
        @media (max-width: 900px) {
          .sm\\:flex-row { flex-direction: row !important; }
          .sm\\:items-center { align-items: center !important; }
          .sm\\:justify-end { justify-content: flex-end !important; }
          .sm\\:gap-6 { gap: 1.5rem !important; }
        }
        @media (max-width: 700px) {
          .flex-row.items-center.gap-8 { flex-direction: column !important; gap: 1.5rem !important; }
          .px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
          .py-8 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
        }
        @media (max-width: 500px) {
          .w-44, .min-w-\[160px\], .w-32, .min-w-\[110px\], .min-w-\[220px\] { width: 100% !important; min-width: 0 !important; }
          .p-8 { padding: 0.5rem !important; }
        }
      `}</style>
    </div>
  );
} 