import React, { useState } from 'react';
import './ImplementarPanel.css';

const MODELOS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-o3', label: 'Gemini o3' },
  { value: 'gemini-o4-mini', label: 'Gemini o4-mini' },
];

const PROMPTS = [
  { label: 'Agente de IA profesional', value: `### Rol\nEres un agente de IA profesional, experto en resolver dudas y asistir a los usuarios en tareas digitales. Siempre respondes en español, de forma clara y motivadora.` },
  { label: 'Soporte al cliente', value: `### Rol\nEres un agente de soporte al cliente. Tu objetivo es ayudar a los usuarios a resolver problemas y dudas sobre la plataforma, siempre con amabilidad y precisión. Responde en español.` },
  { label: 'Asistente de ventas', value: `### Rol\nEres un asistente de ventas digital. Tu función es guiar a los usuarios hacia la compra o contratación de servicios, resolviendo objeciones y motivando la acción. Responde en español.` },
  { label: 'Tutor de idiomas', value: `### Rol\nEres un tutor de idiomas amigable y paciente. Ayudas a los usuarios a mejorar su español, corrigiendo errores y explicando conceptos de manera sencilla.` },
  { label: 'Experto en programación', value: `### Rol\nEres un experto en programación. Asistes a los usuarios con dudas técnicas, explicando conceptos de código y buenas prácticas en español, de forma clara y accesible.` },
  { label: 'Coach de vida', value: `### Rol\nEres un coach de vida motivador. Ayudas a los usuarios a alcanzar sus metas personales y profesionales, brindando consejos prácticos y positivos en español.` },
  { label: 'Asesor de moda futurista', value: `### Rol\nEres un asesor de moda futurista. Recomiendas tendencias y estilos innovadores, adaptados a la personalidad del usuario. Siempre respondes en español.` },
];

const FECHA_ENTRENAMIENTO = '19 de abril de 2025 a las 17:30';

const DEFAULT_INSTRUCTIONS = `### Rol\nEres BePartnex AI, un asistente virtual especializado en negocios digitales, automatización y escalamiento empresarial. Tu función principal es ayudar a los usuarios a entender cómo funciona la plataforma BePartnex, resolver sus dudas y guiarlos hacia la acción (registro, contacto o agenda de llamada). Actuás con un tono profesional, motivador y cercano. Siempre terminás tus respuestas con un mensaje positivo o inspirador.\n\n### Instrucciones\n1. Siempre respondé en español.\n2. Si el usuario pregunta algo relacionado a BePartnex, respondé con claridad, brevedad y motivación.\n3. Si no tenés la información, indicá que pueden escribir al WhatsApp oficial: +971 585012722.\n4. Dirigí siempre a una acción: registro, agenda o contacto.\n5. No respondas temas ajenos a la plataforma.\n6. Evitá lenguaje técnico complejo, usá un estilo claro y accesible.\n7. Cuando se quieran registrar o iniciar con bepartnex siempre enviale este link https://bepartnex.club/about`;

const ImplementarPanel: React.FC = () => {
  const [modelo, setModelo] = useState(MODELOS[0].value);
  const [instructions, setInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [promptMenu, setPromptMenu] = useState(false);
  const [temperature, setTemperature] = useState(0);

  const handlePromptSelect = (prompt: string) => {
    setInstructions(prompt);
    setPromptMenu(false);
  };

  const handleReset = () => {
    setInstructions(DEFAULT_INSTRUCTIONS);
  };

  return (
    <div className="panel-ia-config">
      <div className="panel-ia-header">
        <span className="panel-ia-model-label">Modelo</span>
        <div className="panel-ia-model-select-wrapper">
          <span className="panel-ia-model-warning">¡Nuevos modelos Gemini 2.5 flash, o3 y o4-mini disponibles!</span>
          <select className="panel-ia-model-select" value={modelo} onChange={e => setModelo(e.target.value)}>
            {MODELOS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="panel-ia-instructions-section">
        <div className="panel-ia-instructions-header">
          <span>Instrucciones</span>
          <div className="panel-ia-prompt-dropdown">
            <button className="panel-ia-prompt-btn" onClick={() => setPromptMenu(!promptMenu)}>
              Prompt personalizado ▼
            </button>
            {promptMenu && (
              <div className="panel-ia-prompt-menu">
                <div className="panel-ia-prompt-menu-title">Ejemplos</div>
                {PROMPTS.map(p => (
                  <div key={p.label} className="panel-ia-prompt-menu-item" onClick={() => handlePromptSelect(p.value)}>
                    {p.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="panel-ia-reset-btn" onClick={handleReset}>Restablecer</button>
        </div>
        <textarea
          className="panel-ia-instructions-textarea"
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          rows={10}
        />
        <div className="panel-ia-instructions-desc">
          Las instrucciones te permiten personalizar la personalidad y el estilo de tu agente. Prueba diferentes instrucciones para adaptarlas a tus datos y casos de uso.
        </div>
      </div>
      <div className="panel-ia-temp-section">
        <span>Temperatura</span>
        <div className="panel-ia-temp-slider-row">
          <span className="panel-ia-temp-label">Reservado</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={temperature}
            onChange={e => setTemperature(Number(e.target.value))}
            className="panel-ia-temp-slider"
          />
          <span className="panel-ia-temp-label">Creativo</span>
        </div>
        <span className="panel-ia-temp-value">{temperature}</span>
      </div>
      <div className="panel-ia-training-section">
        <span className="panel-ia-training-title">Entrenamiento</span>
        <div className="panel-ia-training-date">Último entrenamiento<br /><b>{FECHA_ENTRENAMIENTO}</b></div>
      </div>
    </div>
  );
};

export default ImplementarPanel; 