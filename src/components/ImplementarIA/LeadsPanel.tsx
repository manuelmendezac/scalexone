import React, { useState } from 'react';
import './LeadsPanel.css';

const TITULO_DEF = 'Déjanos tus datos para ayudarte mejor 🚀';
const NAME_DEF = 'Nombre';
const EMAIL_DEF = 'Email';
const PHONE_DEF = 'Teléfono';

const LeadsPanel: React.FC = () => {
  const [titulo, setTitulo] = useState(TITULO_DEF);
  const [name, setName] = useState(false);
  const [email, setEmail] = useState(false);
  const [phone, setPhone] = useState(false);
  const [nameLabel, setNameLabel] = useState(NAME_DEF);
  const [emailLabel, setEmailLabel] = useState(EMAIL_DEF);
  const [phoneLabel, setPhoneLabel] = useState(PHONE_DEF);

  const handleReset = () => {
    setTitulo(TITULO_DEF);
    setName(false);
    setEmail(false);
    setPhone(false);
    setNameLabel(NAME_DEF);
    setEmailLabel(EMAIL_DEF);
    setPhoneLabel(PHONE_DEF);
  };

  return (
    <div className="leads-panel-main">
      <h2>Leads</h2>
      <div className="leads-panel-note">
        Nota: El formulario de leads solo aparece cuando el usuario chatea a través del iframe o la burbuja de chat.
      </div>
      <div className="leads-panel-section">
        <label>Título</label>
        <div className="leads-panel-title-row">
          <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} />
          <button className="leads-panel-reset" onClick={handleReset}>Restablecer</button>
        </div>
      </div>
      <div className="leads-panel-section leads-panel-switch-row">
        <span>Nombre</span>
        <input type="checkbox" checked={name} onChange={e => setName(e.target.checked)} />
      </div>
      {name && (
        <div className="leads-panel-edit-row">
          <input type="text" value={nameLabel} onChange={e => setNameLabel(e.target.value)} placeholder="Nombre" />
          <button className="leads-panel-reset" onClick={() => setNameLabel(NAME_DEF)}>Reset</button>
        </div>
      )}
      <div className="leads-panel-section leads-panel-switch-row">
        <span>Email</span>
        <input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)} />
      </div>
      {email && (
        <div className="leads-panel-edit-row">
          <input type="text" value={emailLabel} onChange={e => setEmailLabel(e.target.value)} placeholder="Email" />
          <button className="leads-panel-reset" onClick={() => setEmailLabel(EMAIL_DEF)}>Reset</button>
        </div>
      )}
      <div className="leads-panel-section leads-panel-switch-row">
        <span>Teléfono</span>
        <input type="checkbox" checked={phone} onChange={e => setPhone(e.target.checked)} />
      </div>
      {phone && (
        <div className="leads-panel-edit-row">
          <input type="text" value={phoneLabel} onChange={e => setPhoneLabel(e.target.value)} placeholder="Teléfono" />
          <button className="leads-panel-reset" onClick={() => setPhoneLabel(PHONE_DEF)}>Reset</button>
        </div>
      )}
      <div className="leads-panel-actions">
        <button className="leads-panel-save">Guardar</button>
      </div>
    </div>
  );
};

export default LeadsPanel; 