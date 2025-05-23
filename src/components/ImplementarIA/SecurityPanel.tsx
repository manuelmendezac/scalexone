import React, { useState } from 'react';
import './SecurityPanel.css';

const VISIBILIDAD_DEF = 'public';
const DOMINIOS_DEF = '';
const RATE_LIMIT_DEF = { mensajes: 10, segundos: 300 };
const MENSAJE_LIMITE_DEF = '¡Estás interactuando demasiado rápido! Esperá un momento para continuar 😉';

const SecurityPanel: React.FC = () => {
  const [visibilidad, setVisibilidad] = useState(VISIBILIDAD_DEF);
  const [soloDominios, setSoloDominios] = useState(false);
  const [dominios, setDominios] = useState(DOMINIOS_DEF);
  const [rateLimit, setRateLimit] = useState(RATE_LIMIT_DEF);
  const [mensajeLimite, setMensajeLimite] = useState(MENSAJE_LIMITE_DEF);

  const handleReset = () => {
    setVisibilidad(VISIBILIDAD_DEF);
    setSoloDominios(false);
    setDominios(DOMINIOS_DEF);
    setRateLimit(RATE_LIMIT_DEF);
    setMensajeLimite(MENSAJE_LIMITE_DEF);
  };

  return (
    <div className="security-panel-main">
      <h2>Seguridad</h2>
      <div className="security-panel-section">
        <label>Visibilidad</label>
        <select value={visibilidad} onChange={e => setVisibilidad(e.target.value)}>
          <option value="private">Privado</option>
          <option value="public">Público</option>
        </select>
        <div className="security-panel-desc">
          <b>Privado:</b> Nadie puede acceder a tu agente excepto tú (tu cuenta).<br/>
          <b>Público:</b> Otras personas pueden chatear con tu agente si les envías el enlace. También puedes embeberlo en tu web para que tus visitantes lo usen.
        </div>
      </div>
      <div className="security-panel-section">
        <label style={{display:'flex', alignItems:'center', gap:8}}>
          <span>Sólo permitir el iframe y widget en dominios específicos</span>
          <input type="checkbox" checked={soloDominios} onChange={e => setSoloDominios(e.target.checked)} />
        </label>
        <textarea
          value={dominios}
          onChange={e => setDominios(e.target.value)}
          placeholder="https://tudominio.com"
          disabled={!soloDominios}
          rows={2}
        />
        <div className="security-panel-desc">
          La visibilidad del agente debe ser "Público" para que esto funcione. Escribe cada dominio en una línea nueva.
        </div>
      </div>
      <div className="security-panel-section">
        <label>Límite de mensajes</label>
        <div className="security-panel-rate-row">
          <span>Limitar a</span>
          <input
            type="number"
            min={1}
            value={rateLimit.mensajes}
            onChange={e => setRateLimit({...rateLimit, mensajes: Number(e.target.value)})}
            style={{width: 60}}
          />
          <span>mensajes cada</span>
          <input
            type="number"
            min={10}
            value={rateLimit.segundos}
            onChange={e => setRateLimit({...rateLimit, segundos: Number(e.target.value)})}
            style={{width: 80}}
          />
          <span>segundos.</span>
        </div>
        <div className="security-panel-desc">
          Limita la cantidad de mensajes enviados desde un dispositivo en el iframe o burbuja de chat (no aplica en chatbase.co, sólo en tu web para evitar abusos).
        </div>
        <label>Mensaje a mostrar cuando se alcanza el límite</label>
        <input
          type="text"
          value={mensajeLimite}
          onChange={e => setMensajeLimite(e.target.value)}
        />
      </div>
      <div className="security-panel-actions">
        <button className="security-panel-reset" onClick={handleReset}>Restablecer</button>
        <button className="security-panel-save">Guardar</button>
      </div>
    </div>
  );
};

export default SecurityPanel; 