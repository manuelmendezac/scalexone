import React from 'react';
import { FaUserAstronaut } from 'react-icons/fa';

interface WelcomeAvatarProps {
  userName: string;
  avatarUrl?: string;
}

const WelcomeAvatar: React.FC<WelcomeAvatarProps> = ({ userName, avatarUrl }) => (
  <div className="flex flex-col items-center justify-center text-center mb-8 animate-fade-in">
    <div className="relative mb-4">
      <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/30 animate-pulse z-0" style={{ filter: 'blur(32px)' }} />
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-cyan-400 shadow-cyan-400/40 shadow-lg object-cover z-10 relative animate-avatar-float"
        />
      ) : (
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-cyan-700 to-purple-700 flex items-center justify-center border-4 border-cyan-400 shadow-cyan-400/40 shadow-lg z-10 relative animate-avatar-float">
          <FaUserAstronaut className="text-white text-6xl md:text-7xl" />
        </div>
      )}
    </div>
    <h1 className="text-2xl md:text-3xl font-orbitron text-cyan-300 mb-1">Bienvenido, <span className="text-white">{userName} AI</span></h1>
    <div className="text-cyan-200 text-lg font-light italic">"Hoy es un gran día para crear lo imposible 🚀"</div>
  </div>
);

export default WelcomeAvatar; 