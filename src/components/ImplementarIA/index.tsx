import React, { useState } from 'react';
import Header from './Header';
import TabsMenu from './TabsMenu';
import AvatarPanel from './AvatarPanel';
import EstadoClonPanel from './EstadoClonPanel';
import Playground from './Playground';
import Actividad from './Actividad';
import Metricas from './Metricas';
import SourcesPanel from './SourcesPanel';
import Personalizacion from './Personalizacion';
import Configuracion from './Configuracion';
import AvatarUploader from '../AvatarUploader';
import NeuroConsole from '../NeuroConsole';
import Conectar from './Conectar';
import './ImplementarIA.css';

const ImplementarIA: React.FC = () => {
  const [activeTab, setActiveTab] = useState('playground');
  const [nivel, setNivel] = useState(3);
  const [energia, setEnergia] = useState(85);
  const [xp, setXp] = useState(1200);
  const [monedas, setMonedas] = useState(50);
  const [showChatModal, setShowChatModal] = useState(false);

  // Acciones rápidas (puedes conectar lógica real después)
  const alimentar = () => setEnergia(e => Math.min(100, e + 10));
  const personalizar = () => alert('Función de personalización próximamente');
  const activarChat = () => setShowChatModal(true);

  let contenido;
  switch (activeTab) {
    case 'playground':
      contenido = <Playground />;
      break;
    case 'actividad':
      contenido = <Actividad />;
      break;
    case 'metricas':
      contenido = <Metricas />;
      break;
    case 'fuentes':
      contenido = <SourcesPanel />;
      break;
    case 'personalizacion':
      contenido = <Personalizacion />;
      break;
    case 'configuracion':
      contenido = <Configuracion />;
      break;
    case 'conectar':
      contenido = <Conectar />;
      break;
    default:
      contenido = <Playground />;
  }

  return (
    <div className="ia-main-wrapper">
      <Header />
      <TabsMenu activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ia-main-content">
        {(activeTab !== 'fuentes' && activeTab !== 'metricas' && activeTab !== 'actividad' && activeTab !== 'conectar' && activeTab !== 'configuracion') && (
          <div className="ia-main-left">
            <AvatarPanel nivel={nivel} energia={energia} />
            <AvatarUploader onUpload={() => {}} />
            <EstadoClonPanel
              xp={xp}
              monedas={monedas}
              onAlimentar={alimentar}
              onPersonalizar={personalizar}
              onActivarChat={activarChat}
            />
          </div>
        )}
        <div className={activeTab === 'fuentes' || activeTab === 'metricas' || activeTab === 'actividad' || activeTab === 'conectar' || activeTab === 'configuracion' ? 'ia-main-right ia-main-right-full' : 'ia-main-right'}>
          {contenido}
        </div>
      </div>
      {showChatModal && (
        <div className="ia-modal-chat-bg">
          <div className="ia-modal-chat">
            <button className="ia-modal-chat-close" onClick={() => setShowChatModal(false)}>✕</button>
            <NeuroConsole />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImplementarIA; 