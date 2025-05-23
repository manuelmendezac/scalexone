import React, { useState } from 'react';
import './Playground.css';
import AvatarUploader from '../AvatarUploader';
import { useNavigate } from 'react-router-dom';
import ImplementarPanel from './ImplementarPanel';

const SUGERENCIAS = [
  '¿Qué puedes hacer?',
  '¿Cómo me ayudas?',
  '¿Cuáles son tus funciones?',
  '¿Cómo entreno mi clon?',
  '¿Puedo personalizarte?'
];

const AGENTE_DEFAULT = {
  nombre: 'Clon IA Personalizado',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=clon',
  bienvenida: '👋 ¡Hola! Soy tu clon IA. Puedes alimentarme con información o hacerme preguntas.',
  color: '#2563eb',
  branding: '',
  poweredBy: '',
  rol: '',
  instrucciones: '',
  temperatura: 0.5,
  modelo: 'gpt-4o-mini',
  id: 1,
};

const Playground: React.FC = () => {
  // Estado de agentes
  const [agentes, setAgentes] = useState([
    { ...AGENTE_DEFAULT, id: 1 },
    { ...AGENTE_DEFAULT, id: 2, nombre: 'Asistente Pro', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=pro', color: '#111', bienvenida: '¡Hola! Soy tu asistente Pro.' }
  ]);
  const [agenteActivo, setAgenteActivo] = useState(agentes[0].id);
  const [tab, setTab] = useState<'chat' | 'config'>('chat');

  // Chat
  const [modo, setModo] = useState<'manual' | 'ia'>('manual');
  const [mensajes, setMensajes] = useState<{from: string, text: string, agenteId: number}[]>([
    { from: 'clon', text: agentes[0].bienvenida, agenteId: agentes[0].id }
  ]);
  const [input, setInput] = useState('');

  // Simulación de estado de suscripción
  const isProUser = false; // Cambia a true para probar el modo pro

  const navigate = useNavigate();

  // Crear nuevo agente
  const handleNuevoAgente = () => {
    const nuevo = {
      ...AGENTE_DEFAULT,
      id: Date.now(),
      nombre: `Nuevo Agente ${agentes.length + 1}`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=agente${agentes.length + 1}`
    };
    setAgentes([...agentes, nuevo]);
    setAgenteActivo(nuevo.id);
    setMensajes([...mensajes, { from: 'clon', text: nuevo.bienvenida, agenteId: nuevo.id }]);
    setTab('config');
  };

  // Seleccionar agente
  const handleSeleccionarAgente = (id: number) => {
    setAgenteActivo(id);
    setTab('chat');
    // Si no hay mensajes, agregar bienvenida
    if (!mensajes.find(m => m.agenteId === id)) {
      const agente = agentes.find(a => a.id === id);
      if (agente) setMensajes([...mensajes, { from: 'clon', text: agente.bienvenida, agenteId: id }]);
    }
  };

  // Eliminar agente
  const handleEliminarAgente = (id: number) => {
    if (agentes.length === 1) return;
    const nuevos = agentes.filter(a => a.id !== id);
    setAgentes(nuevos);
    setMensajes(mensajes.filter(m => m.agenteId !== id));
    setAgenteActivo(nuevos[0].id);
    setTab('chat');
  };

  // Editar agente
  const handleEditarAgente = (field: string, value: string) => {
    setAgentes(agentes.map(a => a.id === agenteActivo ? { ...a, [field]: value } : a));
    if (field === 'bienvenida') {
      setMensajes(mensajes.map(m => m.agenteId === agenteActivo && m.from === 'clon' ? { ...m, text: value } : m));
    }
  };

  // Chat: enviar mensaje
  const handleSend = (msg?: string) => {
    const texto = msg || input;
    if (!texto.trim()) return;
    setMensajes([...mensajes, { from: 'user', text: texto, agenteId: agenteActivo }]);
    setInput('');
    setTimeout(() => {
      if (modo === 'manual') {
        setMensajes(msgs => [
          ...msgs,
          { from: 'clon', text: 'Aún no tengo información sobre eso. ¡Aliméntame con más datos!', agenteId: agenteActivo }
        ]);
      } else {
        setMensajes(msgs => [
          ...msgs,
          { from: 'clon', text: '🤖 [IA Real] Respuesta generada automáticamente.', agenteId: agenteActivo }
        ]);
      }
    }, 800);
  };

  const agente = agentes.find(a => a.id === agenteActivo)!;
  const mensajesAgente = mensajes.filter(m => m.agenteId === agenteActivo);

  return (
    <div className="ia-dashboard-wrapper">
      {/* Barra lateral de agentes */}
      <aside className="ia-sidebar-agentes">
        <div className="ia-sidebar-header">
          <span className="ia-sidebar-title">Mis Agentes</span>
          <button className="ia-nuevo-agente-btn" onClick={handleNuevoAgente}>+ Nuevo agente</button>
        </div>
        <div className="ia-agentes-list">
          {agentes.map(a => (
            <div key={a.id} className={`ia-agente-card${a.id === agenteActivo ? ' active' : ''}`} onClick={() => handleSeleccionarAgente(a.id)}>
              <img src={a.avatar} alt={a.nombre} className="ia-agente-avatar" />
              <div className="ia-agente-info">
                <div className="ia-agente-nombre">{a.nombre}</div>
                <div className="ia-agente-estado">{a.id === agenteActivo ? 'Activo' : 'Inactivo'}</div>
              </div>
              <button className="ia-agente-eliminar" onClick={e => { e.stopPropagation(); handleEliminarAgente(a.id); }}>✕</button>
              <button className="ia-agente-lapiz" onClick={e => { e.stopPropagation(); navigate(`/personalizar-agente/${a.id}`); }} title="Personalizar">
                ✏️
              </button>
            </div>
          ))}
        </div>
      </aside>
      {/* Panel principal */}
      <main className="ia-main-panel">
        <div className="ia-playground-tabs">
          <button className={tab === 'chat' ? 'active' : ''} onClick={() => setTab('chat')}>Chat</button>
          <button className={tab === 'config' ? 'active' : ''} onClick={() => setTab('config')}>Configurar agente</button>
        </div>
        <div className="ia-playground-tabs-content">
          {tab === 'chat' && (
            <div className="ia-chat-card-pro">
              <div className="ia-chat-header-pro">
                <img src={agente.avatar} alt="avatar" className="ia-chat-avatar-pro" />
                <div className="ia-chat-nombre-pro">{agente.nombre}</div>
                <div className={`ia-chat-modo-pro ${modo}`}>{modo === 'manual' ? 'IA Manual' : 'IA Real (Pro)'}</div>
                <button className="ia-chat-toggle-pro" style={{background: agente.color}} onClick={() => setModo(modo === 'manual' ? 'ia' : 'manual')}>
                  Cambiar a {modo === 'manual' ? 'IA Real' : 'IA Manual'}
                </button>
              </div>
              <div className="ia-chat-mensajes-pro">
                {mensajesAgente.map((msg, idx) => (
                  <div key={idx} className={`ia-msg-pro ia-msg-pro-${msg.from}`}>{msg.text}</div>
                ))}
              </div>
              <div className="ia-chat-sugerencias-pro">
                {SUGERENCIAS.map((s, i) => (
                  <button key={i} style={{borderColor: agente.color, color: agente.color}} onClick={() => handleSend(s)}>{s}</button>
                ))}
              </div>
              <div className="ia-chat-input-pro">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button style={{background: agente.color}} onClick={() => handleSend()}>Enviar</button>
              </div>
              {/* Pie de chat personalizable */}
              <div className="ia-chat-footer-pro">
                <div className="ia-chat-footer-left">
                  <span className="ia-powered-by">{isProUser ? (agente.poweredBy || '⚡ Powered by Metalink3') : '⚡ Powered by Metalink3'}</span>
                </div>
                <div className="ia-chat-footer-right">
                  {agente.branding ? (
                    <span className="ia-chat-cta">{agente.branding}</span>
                  ) : (
                    <span className="ia-chat-cta">Personaliza tu llamado a la acción</span>
                  )}
                </div>
              </div>
            </div>
          )}
          {tab === 'config' && (
            <div className="ia-config-card-pro">
              <h3>Configurar agente</h3>
              <label>Nombre del agente</label>
              <input
                type="text"
                value={agente.nombre}
                onChange={e => handleEditarAgente('nombre', e.target.value)}
                placeholder="Nombre del agente"
              />
              <label>Avatar</label>
              <AvatarUploader
                initialUrl={agente.avatar}
                onUpload={url => handleEditarAgente('avatar', url)}
                label="Sube la imagen de avatar del agente"
              />
              <label>Rol o personalidad</label>
              <input
                type="text"
                value={agente.rol}
                onChange={e => handleEditarAgente('rol', e.target.value)}
                placeholder="Ej: Asistente motivador, Experto en ventas, etc."
              />
              <label>Instrucciones (prompt base)</label>
              <textarea
                value={agente.instrucciones}
                onChange={e => handleEditarAgente('instrucciones', e.target.value)}
                placeholder="Describe cómo debe comportarse este agente, reglas, tono, etc."
                rows={4}
              />
              <label>Temperatura</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={String(agente.temperatura)}
                onChange={e => handleEditarAgente('temperatura', parseFloat(e.target.value))}
              />
              <span style={{fontSize: '0.95em', color: '#2563eb', marginBottom: '0.7rem'}}>Creatividad: {agente.temperatura}</span>
              <label>Modelo IA</label>
              <select
                value={agente.modelo}
                onChange={e => handleEditarAgente('modelo', e.target.value)}
                style={{marginBottom: '1rem'}}>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="custom">Otro (personalizado)</option>
              </select>
              <label>Llamado a la acción (branding)</label>
              <input
                type="text"
                value={agente.branding}
                onChange={e => handleEditarAgente('branding', e.target.value)}
                placeholder="WhatsApp, web, slogan, etc."
              />
              {isProUser && (
                <>
                  <label>Pie de chat izquierdo (marca blanca)</label>
                  <input
                    type="text"
                    value={agente.poweredBy || ''}
                    onChange={e => handleEditarAgente('poweredBy', e.target.value)}
                    placeholder="Powered by..."
                  />
                </>
              )}
              <div className="ia-config-preview-pro">
                <div className="ia-chat-card-pro preview">
                  <div className="ia-chat-header-pro">
                    <img src={agente.avatar} alt="avatar" className="ia-chat-avatar-pro" />
                    <div className="ia-chat-nombre-pro">{agente.nombre}</div>
                  </div>
                  <div className="ia-msg-pro ia-msg-pro-clon">
                    <strong>Rol:</strong> {agente.rol || 'No definido'}<br/>
                    <strong>Instrucciones:</strong> {agente.instrucciones || 'Sin instrucciones'}<br/>
                    <strong>Modelo:</strong> {agente.modelo} | <strong>Creatividad:</strong> {agente.temperatura}
                    <br/><br/>{agente.bienvenida}
                  </div>
                  <div className="ia-chat-footer-pro">
                    <div className="ia-chat-footer-left">
                      <span className="ia-powered-by">{isProUser ? (agente.poweredBy || '⚡ Powered by Metalink3') : '⚡ Powered by Metalink3'}</span>
                    </div>
                    <div className="ia-chat-footer-right">
                      {agente.branding ? (
                        <span className="ia-chat-cta">{agente.branding}</span>
                      ) : (
                        <span className="ia-chat-cta">Personaliza tu llamado a la acción</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{marginTop: '2.5rem'}}>
                <ImplementarPanel />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Playground; 