import React from 'react';

const NeonSpinner: React.FC<{ size?: number }> = ({ size = 48 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: size }}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      style={{ filter: 'drop-shadow(0 0 12px #FFD700)' }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#FFD700"
        strokeWidth="5"
        strokeDasharray="31.4 31.4"
        strokeLinecap="round"
        style={{ opacity: 0.25 }}
      />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#FFD700"
        strokeWidth="5"
        strokeDasharray="31.4 31.4"
        strokeDashoffset="0"
        strokeLinecap="round"
        style={{
          filter: 'drop-shadow(0 0 16px #FFD700)',
          transformOrigin: 'center',
          animation: 'neon-spin 1s linear infinite',
        } as React.CSSProperties}
      />
      <style>{`
        @keyframes neon-spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  </div>
);

export default NeonSpinner; 