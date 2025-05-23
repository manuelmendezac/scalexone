import React, { useState } from 'react';
import './WebhooksPanel.css';

const EVENTOS = [
  { value: 'lead', label: 'Nuevo lead' },
  { value: 'mensaje', label: 'Nuevo mensaje' },
  { value: 'alerta', label: 'Error o alerta' },
];

const WebhooksPanel: React.FC = () => {
  const [webhooks, setWebhooks] = useState([
    // Ejemplo inicial
    { url: 'https://miwebhook.com/endpoint', evento: 'lead', activo: true },
  ]);
  const [nuevo, setNuevo] = useState({ url: '', evento: EVENTOS[0].value, activo: true });
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [testMsg, setTestMsg] = useState('');

  const handleAdd = () => {
    if (!nuevo.url.trim() || !/^https?:\/\//.test(nuevo.url)) {
      setTestMsg('Ingresa una URL válida (debe comenzar con http:// o https://)');
      return;
    }
    setWebhooks([...webhooks, { ...nuevo }]);
    setNuevo({ url: '', evento: EVENTOS[0].value, activo: true });
    setTestMsg('');
  };

  const handleDelete = (idx: number) => {
    setWebhooks(webhooks.filter((_, i) => i !== idx));
  };

  const handleEdit = (idx: number) => {
    setEditIdx(idx);
    setNuevo(webhooks[idx]);
  };

  const handleSaveEdit = () => {
    if (!nuevo.url.trim() || !/^https?:\/\//.test(nuevo.url)) {
      setTestMsg('Ingresa una URL válida (debe comenzar con http:// o https://)');
      return;
    }
    setWebhooks(webhooks.map((w, i) => (i === editIdx ? { ...nuevo } : w)));
    setEditIdx(null);
    setNuevo({ url: '', evento: EVENTOS[0].value, activo: true });
    setTestMsg('');
  };

  const handleTest = () => {
    if (!nuevo.url.trim() || !/^https?:\/\//.test(nuevo.url)) {
      setTestMsg('Ingresa una URL válida para testear');
      return;
    }
    setTestMsg('✅ Evento de prueba enviado a ' + nuevo.url);
    setTimeout(() => setTestMsg(''), 2000);
  };

  const handleCancelEdit = () => {
    setEditIdx(null);
    setNuevo({ url: '', evento: EVENTOS[0].value, activo: true });
    setTestMsg('');
  };

  return (
    <div className="webhooks-panel-main">
      <h2>Webhooks</h2>
      <div className="webhooks-panel-list">
        <h3>Webhooks configurados</h3>
        {webhooks.length === 0 && <div className="webhooks-panel-empty">No hay webhooks configurados.</div>}
        {webhooks.map((w, i) => (
          <div className="webhooks-panel-item" key={i}>
            <div>
              <b>URL:</b> {w.url}<br/>
              <b>Evento:</b> {EVENTOS.find(e => e.value === w.evento)?.label}<br/>
              <b>Estado:</b> {w.activo ? 'Activo' : 'Inactivo'}
            </div>
            <div className="webhooks-panel-actions-row">
              <button onClick={() => handleEdit(i)}>Editar</button>
              <button onClick={() => handleDelete(i)} className="webhooks-panel-del">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
      <div className="webhooks-panel-form">
        <h3>{editIdx !== null ? 'Editar webhook' : 'Agregar nuevo webhook'}</h3>
        <label>URL del endpoint</label>
        <input type="text" value={nuevo.url} onChange={e => setNuevo({ ...nuevo, url: e.target.value })} placeholder="https://tuservicio.com/webhook" />
        <label>Evento</label>
        <select value={nuevo.evento} onChange={e => setNuevo({ ...nuevo, evento: e.target.value })}>
          {EVENTOS.map(ev => <option key={ev.value} value={ev.value}>{ev.label}</option>)}
        </select>
        <div className="webhooks-panel-switch-row">
          <span>Activo</span>
          <input type="checkbox" checked={nuevo.activo} onChange={e => setNuevo({ ...nuevo, activo: e.target.checked })} />
        </div>
        <div className="webhooks-panel-form-actions">
          <button type="button" onClick={handleTest}>Testear webhook</button>
          {editIdx !== null ? (
            <>
              <button type="button" onClick={handleSaveEdit} className="webhooks-panel-save">Guardar cambios</button>
              <button type="button" onClick={handleCancelEdit} className="webhooks-panel-cancel">Cancelar</button>
            </>
          ) : (
            <button type="button" onClick={handleAdd} className="webhooks-panel-save">Agregar</button>
          )}
        </div>
        {testMsg && <div className="webhooks-panel-msg">{testMsg}</div>}
      </div>
    </div>
  );
};

export default WebhooksPanel; 