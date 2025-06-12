import React from 'react';

interface ModalFuturistaProps {
  open: boolean;
  onClose: () => void;
  avatarUrl?: string;
  progreso?: number;
  children: React.ReactNode;
}

const ModalFuturista: React.FC<ModalFuturistaProps> = ({ open, onClose, avatarUrl, progreso = 0, children }) => {
  if (!open) return null;
  // Handler para cerrar al hacer clic fuera del modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a1a2f]/80 backdrop-blur-sm"
      onClick={handleOverlayClick}
      style={{padding: '32px 0'}}
    >
      <div className="relative bg-gradient-to-br from-[#101c2c] via-[#1a2a3f] to-[#101c2c] rounded-3xl shadow-2xl border-2 border-[#3ec6f7] p-6 w-full max-w-[420px] flex flex-col items-center" style={{maxHeight: '95vh', overflowY: 'auto', minWidth: 0}}>
        {/* Cerrar */}
        <button onClick={onClose} className="absolute top-4 right-4 text-[#3ec6f7] text-3xl font-bold hover:text-[#aef1ff] transition z-20">×</button>
        {/* Avatar y progreso (opcional) */}
        {(avatarUrl || progreso !== undefined) && (
          <div className="flex flex-col items-center mb-6">
            {avatarUrl && (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#3ec6f7] bg-[#0a1a2f] shadow-xl mb-2">
                <img
                  src={avatarUrl}
                  alt="Avatar Usuario"
                  className="w-full h-full object-cover"
                  style={{ filter: 'drop-shadow(0 0 16px #3ec6f7)' }}
                />
              </div>
            )}
            {progreso !== undefined && (
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
                  strokeDashoffset={2 * Math.PI * 38 - ((progreso || 0) / 100) * 2 * Math.PI * 38}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,2,.6,1)' }}
                />
                <text x="50%" y="54%" textAnchor="middle" fill="#aef1ff" fontSize="1.5em" fontWeight="bold">{progreso}%</text>
              </svg>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default ModalFuturista; 