import React, { useState } from 'react';
import './EstadoClonPanel.css';

interface EstadoClonPanelProps {
  xp: number;
  monedas: number;
  onAlimentar: () => void;
  onPersonalizar: () => void;
  onActivarChat: () => void;
}

const EstadoClonPanel: React.FC<EstadoClonPanelProps> = ({ xp, monedas, onAlimentar, onPersonalizar, onActivarChat }) => {
  const [energiaAnim, setEnergiaAnim] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [chatActivo, setChatActivo] = useState(false);

  const handleAlimentar = () => {
    setEnergiaAnim(true);
    setToast('¡Energía aumentada!');
    onAlimentar();
    setTimeout(() => setEnergiaAnim(false), 700);
    setTimeout(() => setToast(null), 1800);
  };
  const handlePersonalizar = () => {
    setToast('Abriendo personalización...');
    onPersonalizar();
    setTimeout(() => setToast(null), 1800);
  };
  const handleActivarChat = () => {
    setToast('Chat Pro IA activado');
    setChatActivo(true);
    onActivarChat();
    setTimeout(() => setToast(null), 1800);
  };

  return (
    <div className="ia-estado-clon-panel">
      <div className="ia-estado-stats">
        <div className={`ia-estado-xp${energiaAnim ? ' energia-anim' : ''}`}>
          <span role="img" aria-label="xp">⭐</span> XP: <strong>{xp}</strong>
        </div>
        <div className="ia-estado-monedas">
          <span role="img" aria-label="monedas">🪙</span> Monedas: <strong>{monedas}</strong>
        </div>
      </div>
      <div className="ia-estado-acciones">
        <button className="ia-accion-btn alimentar" onClick={handleAlimentar}>
          🧪 Alimentar
        </button>
        <button className="ia-accion-btn personalizar" onClick={handlePersonalizar}>
          🎨 Personalizar
        </button>
        <button className="ia-accion-btn activar" onClick={handleActivarChat} disabled={chatActivo}>
          ⚡ {chatActivo ? 'Chat Activo' : 'Activar Chat'}
        </button>
      </div>
      {toast && <div className="ia-toast-clon">{toast}</div>}
    </div>
  );
};

export default EstadoClonPanel; 