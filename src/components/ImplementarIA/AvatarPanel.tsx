import React from 'react';
import './AvatarPanel.css';
import useNeuroState from '../../store/useNeuroState';

interface AvatarPanelProps {
  nivel: number;
  energia: number;
}

const AvatarPanel: React.FC<AvatarPanelProps> = ({ nivel, energia }) => {
  const avatarUrl = useNeuroState(state => state.avatarUrl);
  return (
    <div className="ia-avatar-panel">
      <div className="ia-avatar-img-container">
        <img
          src={avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=clon"}
          alt="Avatar Clon"
          className="ia-avatar-img"
        />
        <div className="ia-avatar-nivel">Nv. {nivel}</div>
      </div>
      <div className="ia-avatar-energia">
        <span>⚡ Energía:</span> <strong>{energia}%</strong>
      </div>
    </div>
  );
};

export default AvatarPanel; 