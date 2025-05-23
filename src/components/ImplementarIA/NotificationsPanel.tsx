import React, { useState } from 'react';
import './NotificationsPanel.css';

const ASUNTO_DEF = {
  lead: 'Nuevo lead recibido',
  mensaje: 'Nuevo mensaje en tu agente',
  alerta: 'Alerta importante de tu agente',
};
const CUERPO_DEF = {
  lead: 'Has recibido un nuevo lead a través de tu agente IA.',
  mensaje: 'Tu agente ha recibido un nuevo mensaje de un usuario.',
  alerta: 'Se ha detectado un error o alerta importante en tu agente.',
};

const NotificationsPanel: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState(true);
  const [notifLead, setNotifLead] = useState(false);
  const [notifMensaje, setNotifMensaje] = useState(false);
  const [notifAlerta, setNotifAlerta] = useState(false);
  const [email, setEmail] = useState('');
  const [asunto, setAsunto] = useState(ASUNTO_DEF);
  const [cuerpo, setCuerpo] = useState(CUERPO_DEF);

  const handleReset = () => {
    setNotificaciones(true);
    setNotifLead(false);
    setNotifMensaje(false);
    setNotifAlerta(false);
    setEmail('');
    setAsunto(ASUNTO_DEF);
    setCuerpo(CUERPO_DEF);
  };

  return (
    <div className="notifications-panel-main">
      <h2>Notificaciones</h2>
      <div className="notifications-panel-section notifications-panel-switch-row">
        <span>Activar notificaciones</span>
        <input type="checkbox" checked={notificaciones} onChange={e => setNotificaciones(e.target.checked)} />
      </div>
      <div className="notifications-panel-section">
        <label>Email de destino</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" disabled={!notificaciones} />
      </div>
      <div className="notifications-panel-section notifications-panel-switch-row">
        <span>Notificar por email cuando recibas un nuevo lead</span>
        <input type="checkbox" checked={notifLead} onChange={e => setNotifLead(e.target.checked)} disabled={!notificaciones} />
      </div>
      {notifLead && notificaciones && (
        <div className="notifications-panel-edit-row">
          <input type="text" value={asunto.lead} onChange={e => setAsunto({...asunto, lead: e.target.value})} placeholder="Asunto del email" />
          <input type="text" value={cuerpo.lead} onChange={e => setCuerpo({...cuerpo, lead: e.target.value})} placeholder="Cuerpo del email" />
        </div>
      )}
      <div className="notifications-panel-section notifications-panel-switch-row">
        <span>Notificar por email cuando recibas un nuevo mensaje</span>
        <input type="checkbox" checked={notifMensaje} onChange={e => setNotifMensaje(e.target.checked)} disabled={!notificaciones} />
      </div>
      {notifMensaje && notificaciones && (
        <div className="notifications-panel-edit-row">
          <input type="text" value={asunto.mensaje} onChange={e => setAsunto({...asunto, mensaje: e.target.value})} placeholder="Asunto del email" />
          <input type="text" value={cuerpo.mensaje} onChange={e => setCuerpo({...cuerpo, mensaje: e.target.value})} placeholder="Cuerpo del email" />
        </div>
      )}
      <div className="notifications-panel-section notifications-panel-switch-row">
        <span>Notificar por email ante errores o alertas importantes</span>
        <input type="checkbox" checked={notifAlerta} onChange={e => setNotifAlerta(e.target.checked)} disabled={!notificaciones} />
      </div>
      {notifAlerta && notificaciones && (
        <div className="notifications-panel-edit-row">
          <input type="text" value={asunto.alerta} onChange={e => setAsunto({...asunto, alerta: e.target.value})} placeholder="Asunto del email" />
          <input type="text" value={cuerpo.alerta} onChange={e => setCuerpo({...cuerpo, alerta: e.target.value})} placeholder="Cuerpo del email" />
        </div>
      )}
      <div className="notifications-panel-actions">
        <button className="notifications-panel-reset" onClick={handleReset}>Restablecer</button>
        <button className="notifications-panel-save">Guardar</button>
      </div>
    </div>
  );
};

export default NotificationsPanel; 