import React, { useState } from 'react';
import './Actividad.css';

const TABS = [
  { key: 'chat', label: 'Registros de chat' },
  { key: 'leads', label: 'Leads' }
];

const CHAT_LOGS = [
  {
    id: 1,
    pregunta: '¿Tienen marketing de afiliados?',
    respuesta: 'Sí, BePartnex cuenta con un sistema de marketing de afiliados...',
    fecha: 'Hace 4 días',
    fuente: 'Widget',
    score: 0.455,
    usuario: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    pregunta: '¿Cómo me registro?',
    respuesta: 'Para registrarte, visita el enlace de registro en BePartnex...',
    fecha: 'Hace 3 días',
    fuente: 'Iframe',
    score: 0.812,
    usuario: 'https://randomuser.me/api/portraits/women/44.jpg'
  }
];

const LEADS = [
  { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', fecha: '2024-05-20', origen: 'Widget' },
  { id: 2, nombre: 'Ana López', email: 'ana@email.com', fecha: '2024-05-19', origen: 'Iframe' }
];

const Actividad: React.FC = () => {
  const [tab, setTab] = useState('chat');
  const [modal, setModal] = useState<{open: boolean, log: any} | null>(null);
  const [respuestaEsperada, setRespuestaEsperada] = useState('');

  const abrirModal = (log: any) => {
    setModal({ open: true, log });
    setRespuestaEsperada('');
  };
  const cerrarModal = () => setModal(null);
  const guardarRespuesta = () => {
    // Aquí puedes conectar con backend o actualizar el estado
    cerrarModal();
  };

  return (
    <div className="actividad-root">
      <aside className="actividad-sidebar">
        <h2>Actividad</h2>
        <nav>
          {TABS.map(t => (
            <button
              key={t.key}
              className={tab === t.key ? 'actividad-tab active' : 'actividad-tab'}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="actividad-main">
        {tab === 'chat' && (
          <section className="actividad-panel">
            <div className="actividad-panel-header">
              <h3>Registros de chat</h3>
              <div className="actividad-panel-actions">
                <button>Actualizar</button>
                <button>Filtrar</button>
                <button>Exportar</button>
              </div>
            </div>
            <div className="actividad-chat-logs">
              {CHAT_LOGS.map(log => (
                <div key={log.id} className="actividad-chat-log">
                  <div className="actividad-chat-log-pregunta">
                    <strong>{log.pregunta}</strong>
                    <span className="actividad-chat-log-fecha">{log.fecha}</span>
                  </div>
                  <div className="actividad-chat-log-respuesta">
                    <img src={log.usuario} alt="usuario" className="actividad-chat-log-avatar" />
                    <div>
                      <div className="actividad-chat-log-score">Score: {log.score}</div>
                      <div>{log.respuesta}</div>
                      <div className="actividad-chat-log-fuente">Fuente: {log.fuente}</div>
                    </div>
                  </div>
                  <button className="actividad-mejorar-btn" onClick={() => abrirModal(log)}>Mejorar respuesta</button>
                </div>
              ))}
            </div>
            {modal?.open && (
              <div className="actividad-modal-bg">
                <div className="actividad-modal">
                  <button className="actividad-modal-close" onClick={cerrarModal}>✕</button>
                  <h3>Mejorar respuesta</h3>
                  <div className="actividad-modal-section">
                    <label>Mensaje del usuario</label>
                    <textarea value={modal.log.pregunta} readOnly />
                  </div>
                  <div className="actividad-modal-section">
                    <label>Respuesta del bot</label>
                    <textarea value={modal.log.respuesta} readOnly />
                  </div>
                  <div className="actividad-modal-section">
                    <label>Respuesta esperada</label>
                    <textarea value={respuestaEsperada} onChange={e => setRespuestaEsperada(e.target.value)} placeholder="Escribe aquí la respuesta mejorada..." />
                  </div>
                  <div className="actividad-modal-actions">
                    <button onClick={cerrarModal}>Cancelar</button>
                    <button onClick={guardarRespuesta} className="guardar">Guardar</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
        {tab === 'leads' && (
          <section className="actividad-panel">
            <div className="actividad-panel-header">
              <h3>Leads</h3>
              <div className="actividad-panel-actions">
                <button>Actualizar</button>
                <button>Filtrar</button>
                <button>Exportar</button>
              </div>
            </div>
            <table className="actividad-leads-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Fecha</th>
                  <th>Origen</th>
                </tr>
              </thead>
              <tbody>
                {LEADS.map(lead => (
                  <tr key={lead.id}>
                    <td>{lead.nombre}</td>
                    <td>{lead.email}</td>
                    <td>{lead.fecha}</td>
                    <td>{lead.origen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default Actividad; 