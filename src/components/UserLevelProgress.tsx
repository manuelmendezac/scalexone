import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Coins } from 'lucide-react';
import useNeuroState from '../store/useNeuroState';

// Props: nombre, nivel, xp, xpMax, avatar, pais
const UserLevelProgress = ({
  nombre = 'Manuel Méndez',
  nivel = 7,
  xp = 4200,
  xpMax = 5000,
  avatar = '/avatars/7.png',
  pais = '🇲🇽',
}) => {
  const porcentaje = Math.min(100, Math.round((xp / xpMax) * 100));
  return (
    <div className="flex items-center gap-6 bg-black/40 border border-neurolink-cyberBlue/30 rounded-2xl p-6 shadow-xl">
      <div className="relative">
        <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full border-4 border-neurolink-matrixGreen shadow-lg" />
        <span className="absolute -bottom-2 -right-2 text-3xl" title="País">{pais}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-neurolink-coldWhite/90 font-bold text-lg">{nombre}</span>
          <span className="text-neurolink-cyberBlue font-orbitron text-base">Nivel {nivel}</span>
        </div>
        <div className="w-full h-4 bg-neurolink-coldWhite/10 rounded-lg overflow-hidden mb-1">
          <div
            className="h-full bg-gradient-to-r from-neurolink-matrixGreen to-neurolink-cyberBlue"
            style={{ width: `${porcentaje}%` }}
          ></div>
        </div>
        <div className="text-neurolink-coldWhite/60 text-xs font-mono">
          {xp} / {xpMax} XP
        </div>
      </div>
    </div>
  );
};

export default UserLevelProgress; 