import React from 'react';

interface SwitchClienteIBProps {
  mode: 'Client' | 'IB';
  onChange: (mode: 'Client' | 'IB') => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-6 text-xs',
  md: 'h-7 text-sm',
  lg: 'h-9 text-base',
};

const SwitchClienteIB: React.FC<SwitchClienteIBProps> = ({ mode, onChange, size = 'md' }) => {
  return (
    <div className={`flex items-center bg-black rounded-full border border-gray-700 shadow-sm p-0.5 ${sizeClasses[size]} w-fit`}
      style={{ minWidth: size === 'sm' ? 90 : size === 'lg' ? 160 : 120 }}
      role="group"
      aria-label="Switch Cliente/IB"
    >
      <button
        className={`px-2 py-0.5 rounded-full font-bold transition-all focus:outline-none ${mode === 'Client' ? 'bg-yellow-500 text-black shadow' : 'text-gray-400 hover:bg-gray-800'}`}
        onClick={() => onChange('Client')}
        aria-pressed={mode === 'Client'}
        tabIndex={0}
        style={{ fontFamily: 'Orbitron, Inter, Arial, sans-serif' }}
      >
        Cliente
      </button>
      <button
        className={`px-2 py-0.5 rounded-full font-bold transition-all focus:outline-none ml-0.5 ${mode === 'IB' ? 'bg-yellow-500 text-black shadow' : 'text-gray-400 hover:bg-gray-800'}`}
        onClick={() => onChange('IB')}
        aria-pressed={mode === 'IB'}
        tabIndex={0}
        style={{ fontFamily: 'Orbitron, Inter, Arial, sans-serif' }}
      >
        IB
      </button>
    </div>
  );
};

export default SwitchClienteIB; 