import React, { useState } from 'react';
import './Configuracion.css';

const USER = {
  tipo: 'Gratuito', // o 'Pro'
  suscripcion: 'Free',
  creditos: 100,
  coins: 5,
  puedeCrearMasAgentes: false
};

const AGENTE = {
  id: 'cEYGkdwv5708BJuxDNG6m',
  size: '11 KB',
  nombre: 'Asistente BePartnex',
  creditLimit: false
};

const Configuracion: React.FC = () => {
  const [nombre, setNombre] = useState(AGENTE.nombre);
  const [creditLimit, setCreditLimit] = useState(AGENTE.creditLimit);
  const [coins, setCoins] = useState(USER.coins);
  const [creditos, setCreditos] = useState(USER.creditos);

  const convertirCoins = () => {
    if (coins > 0) {
      setCreditos(creditos + coins * 10);
      setCoins(0);
    }
  };

  return (
    <div className="config-root">
      <div className="config-card">
        <h3>General</h3>
        <div className="config-row">
          <label>ID del agente</label>
          <span className="config-id">{AGENTE.id}</span>
          <button className="config-copy" onClick={() => navigator.clipboard.writeText(AGENTE.id)}>Copiar</button>
        </div>
        <div className="config-row">
          <label>Tamaño</label>
          <span className="config-size">{AGENTE.size}</span>
        </div>
        <div className="config-row">
          <label>Nombre</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div className="config-row">
          <label>Límite de créditos <span title="Límite máximo de créditos para este agente">&#9432;</span></label>
          <input type="checkbox" checked={creditLimit} onChange={e => setCreditLimit(e.target.checked)} />
        </div>
        <button className="config-save">Guardar</button>
      </div>

      <div className="config-user-card">
        <h3>Información de usuario</h3>
        <div className="config-user-row"><b>Tipo de usuario:</b> {USER.tipo}</div>
        <div className="config-user-row"><b>Suscripción:</b> {USER.suscripcion}</div>
        <div className="config-user-row"><b>Créditos disponibles:</b> {creditos}</div>
        <div className="config-user-row"><b>Coins:</b> {coins} <button className="config-convert" disabled={coins === 0} onClick={convertirCoins}>Convertir a créditos</button></div>
        {!USER.puedeCrearMasAgentes && (
          <div className="config-user-alert">Solo puedes crear un agente. Actualiza tu plan para crear más agentes Pro.</div>
        )}
      </div>

      <div className="config-danger-zone">
        <div className="config-danger-title">ZONA DE PELIGRO</div>
        <div className="config-danger-card">
          <h4>Eliminar todas las conversaciones</h4>
          <p>Una vez que elimines todas tus conversaciones, no hay vuelta atrás. Todas las conversaciones de este agente serán eliminadas. <b>Esta acción no es reversible.</b></p>
          <button className="config-danger-btn">Eliminar</button>
        </div>
        <div className="config-danger-card">
          <h4>Eliminar agente</h4>
          <p>Una vez que elimines tu agente, no hay vuelta atrás. Todos tus datos subidos serán eliminados. <b>Esta acción no es reversible.</b></p>
          <button className="config-danger-btn">Eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default Configuracion; 