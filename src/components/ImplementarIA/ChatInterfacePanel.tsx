import React, { useState } from 'react';
import './ChatInterfacePanel.css';

const MENSAJES_SUGERIDOS_DEF = [
  '¿Qué es BePartnex?',
  '¿Cómo empiezo hoy?',
  '¿Cuánto cuesta el programa?',
  '¿En qué países puedo usarlo?',
  '¿Cómo agendo una llamada?',
  '¿Ofrecen mentoría?'
];

const MENSAJE_INICIAL_DEF = '👋Hola, soy Asistente BePartnex. ¿Querés escalar tu negocio digital? Estoy aquí para responder tus dudas y guiarte paso a paso 🚀';
const FOOTER_DEF = '¿Dudas? También podés escribirnos directo al WhatsApp 👉 +971 585012722';

const ChatInterfacePanel: React.FC = () => {
  const [mensajeInicial, setMensajeInicial] = useState(MENSAJE_INICIAL_DEF);
  const [mensajesSugeridos, setMensajesSugeridos] = useState(MENSAJES_SUGERIDOS_DEF);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [placeholder, setPlaceholder] = useState('Escribí tu duda aquí...');
  const [footer, setFooter] = useState(FOOTER_DEF);
  const [feedback, setFeedback] = useState(true);
  const [regenerar, setRegenerar] = useState(true);
  const [tema, setTema] = useState('light');
  const [nombre, setNombre] = useState('Asistente BePartnex');
  const [colorUser, setColorUser] = useState('#2563eb');
  const [colorBoton, setColorBoton] = useState('#23283a');
  const [alineacion, setAlineacion] = useState('right');
  const [autoShow, setAutoShow] = useState(3);
  const [imgPerfil, setImgPerfil] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const [imgChat, setImgChat] = useState('https://randomuser.me/api/portraits/men/33.jpg');

  // Handlers
  const handleAddMensaje = () => {
    if (nuevoMensaje.trim() && mensajesSugeridos.length < 8) {
      setMensajesSugeridos([...mensajesSugeridos, nuevoMensaje.trim()]);
      setNuevoMensaje('');
    }
  };
  const handleRemoveMensaje = (idx: number) => {
    setMensajesSugeridos(mensajesSugeridos.filter((_, i) => i !== idx));
  };
  const handleResetInicial = () => setMensajeInicial(MENSAJE_INICIAL_DEF);

  return (
    <div className="chat-panel-main">
      <div className="chat-panel-left">
        <h2>Chat Interface</h2>
        <div className="chat-panel-section">
          <label>Mensajes iniciales <button className="chat-panel-reset" onClick={handleResetInicial}>Restablecer</button></label>
          <textarea value={mensajeInicial} onChange={e => setMensajeInicial(e.target.value)} rows={2} />
        </div>
        <div className="chat-panel-section">
          <label>Mensajes sugeridos</label>
          <div className="chat-panel-sugeridos-list">
            {mensajesSugeridos.map((msg, i) => (
              <div className="chat-panel-sugerido-item" key={i}>
                <span>{msg}</span>
                <span className="chat-panel-sugerido-count">{msg.length}/40</span>
                <button className="chat-panel-sugerido-del" onClick={() => handleRemoveMensaje(i)}>🗑️</button>
              </div>
            ))}
          </div>
          <div className="chat-panel-sugerido-add">
            <input type="text" maxLength={40} value={nuevoMensaje} onChange={e => setNuevoMensaje(e.target.value)} placeholder="Agregar mensaje sugerido..." />
            <button onClick={handleAddMensaje}>+</button>
          </div>
        </div>
        <div className="chat-panel-section">
          <label>Placeholder del input</label>
          <input type="text" value={placeholder} onChange={e => setPlaceholder(e.target.value)} />
        </div>
        <div className="chat-panel-section chat-panel-switch-row">
          <label>Recolectar feedback del usuario</label>
          <input type="checkbox" checked={feedback} onChange={e => setFeedback(e.target.checked)} />
        </div>
        <div className="chat-panel-section chat-panel-switch-row">
          <label>Permitir regenerar mensajes</label>
          <input type="checkbox" checked={regenerar} onChange={e => setRegenerar(e.target.checked)} />
        </div>
        <div className="chat-panel-section">
          <label>Footer</label>
          <textarea value={footer} onChange={e => setFooter(e.target.value)} rows={2} maxLength={200} />
          <div className="chat-panel-footer-count">{footer.length}/200 caracteres</div>
        </div>
        <div className="chat-panel-section">
          <label>Tema</label>
          <select value={tema} onChange={e => setTema(e.target.value)}>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>
        <div className="chat-panel-section">
          <label>Nombre visible</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div className="chat-panel-section chat-panel-img-row">
          <div>
            <label>Foto de perfil</label>
            <img src={imgPerfil} alt="perfil" className="chat-panel-img-preview" />
            <input type="text" value={imgPerfil} onChange={e => setImgPerfil(e.target.value)} placeholder="URL de imagen" />
          </div>
          <div>
            <label>Icono de chat</label>
            <img src={imgChat} alt="chat" className="chat-panel-img-preview" />
            <input type="text" value={imgChat} onChange={e => setImgChat(e.target.value)} placeholder="URL de imagen" />
          </div>
        </div>
        <div className="chat-panel-section">
          <label>Color de mensaje del usuario</label>
          <input type="color" value={colorUser} onChange={e => setColorUser(e.target.value)} />
        </div>
        <div className="chat-panel-section">
          <label>Color del botón de chat</label>
          <input type="color" value={colorBoton} onChange={e => setColorBoton(e.target.value)} />
        </div>
        <div className="chat-panel-section">
          <label>Alinear botón de chat</label>
          <select value={alineacion} onChange={e => setAlineacion(e.target.value)}>
            <option value="right">Derecha</option>
            <option value="left">Izquierda</option>
          </select>
        </div>
        <div className="chat-panel-section">
          <label>Mostrar mensajes iniciales después de (segundos)</label>
          <input type="number" value={autoShow} onChange={e => setAutoShow(Number(e.target.value))} min={-1} />
        </div>
        <button className="chat-panel-save">Guardar</button>
      </div>
      <div className="chat-panel-right">
        <div className={`chat-panel-preview chat-panel-preview-${tema}`}>
          <div className="chat-panel-preview-header">
            <img src={imgPerfil} alt="perfil" className="chat-panel-preview-avatar" />
            <span className="chat-panel-preview-nombre">{nombre}</span>
            <button className="chat-panel-preview-refresh">⟳</button>
          </div>
          <div className="chat-panel-preview-msg-inicial">{mensajeInicial}</div>
          <div className="chat-panel-preview-msgs">
            {mensajesSugeridos.map((msg, i) => (
              <button key={i} className="chat-panel-preview-msgs-btn">{msg}</button>
            ))}
          </div>
          <div className="chat-panel-preview-input-row">
            <input type="text" placeholder={placeholder} disabled />
            <button className="chat-panel-preview-send" style={{background: colorBoton}}>
              <img src={imgChat} alt="chat" style={{width: 22, height: 22, borderRadius: '50%'}} />
            </button>
          </div>
          <div className="chat-panel-preview-footer">
            <span>{footer}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterfacePanel; 