import React, { useState } from 'react';
import './Conectar.css';

const AGENTES = [
  { id: '1', nombre: 'Asistente de Ventas' },
  { id: '2', nombre: 'Soporte Técnico' },
  { id: '3', nombre: 'Agente Marketing' }
];

const SCRIPTS = {
  '1': '<script>/* Código de integración para Asistente de Ventas */</script>',
  '2': '<script>/* Código de integración para Soporte Técnico */</script>',
  '3': '<script>/* Código de integración para Agente Marketing */</script>'
};

const SECRET_KEYS = {
  '1': 'sk-ventas-1234',
  '2': 'sk-soporte-5678',
  '3': 'sk-marketing-9012'
};

const Conectar: React.FC = () => {
  const [agenteId, setAgenteId] = useState('1');
  const [embedType, setEmbedType] = useState('bubble');

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
  };

  return (
    <div className="conectar-root">
      <h2>Conectar tu agente IA</h2>
      <div className="conectar-selectores">
        <label>Selecciona el agente:</label>
        <select value={agenteId} onChange={e => setAgenteId(e.target.value)}>
          {AGENTES.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </div>
      <div className="conectar-section">
        <h3>Embed</h3>
        <div className="conectar-embed-cards">
          <label className={`conectar-embed-card${embedType === 'bubble' ? ' selected' : ''}`}>
            <input type="radio" name="embedType" checked={embedType === 'bubble'} onChange={() => setEmbedType('bubble')} />
            <div className="conectar-embed-card-content">
              <div className="conectar-embed-card-title">
                Burbuja de chat
                <span className="conectar-embed-recommended">Recomendado</span>
              </div>
              <div className="conectar-embed-card-desc">
                Inserta una burbuja de chat en tu sitio web. Permite usar todas las funciones avanzadas del agente. <a href="/docs" target="_blank" rel="noopener noreferrer">Documentación</a>
              </div>
            </div>
          </label>
          <label className={`conectar-embed-card${embedType === 'iframe' ? ' selected' : ''}`}>
            <input type="radio" name="embedType" checked={embedType === 'iframe'} onChange={() => setEmbedType('iframe')} />
            <div className="conectar-embed-card-content">
              <div className="conectar-embed-card-title">Iframe</div>
              <div className="conectar-embed-card-desc">
                Añade el agente en cualquier parte de tu web usando un iframe.
              </div>
            </div>
          </label>
        </div>
        <div className="conectar-embed-code conectar-embed-code-block">
          <code>
            {embedType === 'bubble'
              ? `<script src="https://tuagente.com/embed/${agenteId}.js"></script>`
              : `<iframe src="https://tuagente.com/iframe/${agenteId}" style="width:400px;height:600px;border:none;"></iframe>`}
          </code>
          <button onClick={() => copiar(embedType === 'bubble'
            ? `<script src="https://tuagente.com/embed/${agenteId}.js"></script>`
            : `<iframe src="https://tuagente.com/iframe/${agenteId}" style="width:400px;height:600px;border:none;"></iframe>`)}>Copiar</button>
        </div>
      </div>
      <div className="conectar-section">
        <h3>Configuración</h3>
        <div className="conectar-config-code">
          <div className="conectar-config-label">En tu sitio</div>
          <code>{SCRIPTS[agenteId as keyof typeof SCRIPTS]}</code>
          <button onClick={() => copiar(SCRIPTS[agenteId as keyof typeof SCRIPTS])}>Copiar</button>
        </div>
      </div>
      <div className="conectar-section">
        <h3>Verificación de identidad</h3>
        <div className="conectar-config-label">En tu servidor</div>
        <div className="conectar-secret-row">
          <input type="password" value={SECRET_KEYS[agenteId as keyof typeof SECRET_KEYS]} readOnly />
          <button onClick={() => copiar(SECRET_KEYS[agenteId as keyof typeof SECRET_KEYS])}>Copiar</button>
        </div>
        <div className="conectar-warning">
          ¡Guarda tu clave secreta! Nunca la subas a tu repositorio ni la compartas públicamente.
        </div>
        <div className="conectar-backend-code">
          <code>{`const crypto = require('crypto');
const secret = '${SECRET_KEYS[agenteId as keyof typeof SECRET_KEYS]}'; // Tu clave secreta
const userId = 'usuario_id';
const hash = crypto.createHmac('sha256', secret).update(userId).digest('hex');`}</code>
          <button onClick={() => copiar(`const crypto = require('crypto');\nconst secret = '${SECRET_KEYS[agenteId as keyof typeof SECRET_KEYS]}'; // Tu clave secreta\nconst userId = 'usuario_id';\nconst hash = crypto.createHmac('sha256', secret).update(userId).digest('hex');`)}>Copiar</button>
        </div>
      </div>
    </div>
  );
};

export default Conectar; 