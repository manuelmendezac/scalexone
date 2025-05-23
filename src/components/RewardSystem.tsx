import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Gift } from 'lucide-react';
import useNeuroState from '../store/useNeuroState';

interface Reward {
  id: string;
  type: 'achievement' | 'level' | 'streak' | 'special';
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  reward: {
    type: 'xp' | 'coins' | 'badge';
    amount: number;
  };
}

const RewardSystem: React.FC = () => {
  const { iaModules, setIAModuleProgress } = useNeuroState();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showReward, setShowReward] = useState<Reward | null>(null);

  useEffect(() => {
    // Inicializar recompensas basadas en módulos
    const initialRewards: Reward[] = Object.entries(iaModules).map(([key, module]) => ({
      id: key,
      type: 'achievement',
      title: module.nombreAmigable,
      description: module.descripcion,
      icon: <Trophy className="w-6 h-6 text-neurolink-matrixGreen" />,
      unlocked: module.estado === 'completado',
      progress: module.progreso,
      reward: {
        type: 'xp',
        amount: 100
      }
    }));

    setRewards(initialRewards);
  }, [iaModules]);

  const handleRewardUnlock = (reward: Reward) => {
    setShowReward(reward);
    setTimeout(() => setShowReward(null), 3000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-orbitron text-neurolink-coldWhite mb-6">
        Sistema de Recompensas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <motion.div
            key={reward.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-neurolink-dark/50 border border-neurolink-cyberBlue/30
              hover:border-neurolink-matrixGreen/50 transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-neurolink-dark/50">
                {reward.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-orbitron text-neurolink-coldWhite">
                  {reward.title}
                </h3>
                <p className="text-sm text-neurolink-coldWhite/70">
                  {reward.description}
                </p>
                {reward.progress !== undefined && (
                  <div className="mt-2">
                    <div className="h-2 bg-neurolink-dark/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${reward.progress}%` }}
                        className="h-full bg-neurolink-matrixGreen"
                      />
                    </div>
                    <span className="text-xs text-neurolink-coldWhite/60 mt-1 block">
                      {reward.progress}% completado
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50"
          >
            <div className="p-6 rounded-lg bg-neurolink-dark border-2 border-neurolink-matrixGreen
              text-center max-w-sm mx-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Gift className="w-16 h-16 text-neurolink-matrixGreen mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-orbitron text-neurolink-matrixGreen mb-2">
                ¡Recompensa Desbloqueada!
              </h3>
              <p className="text-neurolink-coldWhite/80">
                {showReward.title}
              </p>
              <p className="text-neurolink-matrixGreen mt-2">
                +{showReward.reward.amount} {showReward.reward.type.toUpperCase()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RewardSystem; 