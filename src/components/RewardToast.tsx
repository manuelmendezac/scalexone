import React from 'react';

interface RewardToastProps {
  xp: number;
  coins: number;
  show: boolean;
}

const RewardToast: React.FC<RewardToastProps> = ({ xp, coins, show }) => {
  return (
    <div 
      className={`absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900 bg-opacity-80 backdrop-blur-sm border border-yellow-400/50 rounded-full px-4 py-2 shadow-lg transition-all duration-500 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
    >
      <span className="font-bold text-yellow-400">+{xp} XP</span>
      <span className="font-bold text-yellow-400">+{coins} 🪙</span>
    </div>
  );
};

export default RewardToast; 