import React, { useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './TextSourcePanel.css';

interface TextSnippet {
  id: string;
  title: string;
  content: string;
  bytes: number;
}

const MAX_TOTAL_SIZE = 400 * 1024; // 400 KB

const TextSourcePanel: React.FC = () => {
  const [snippets, setSnippets] = useState<TextSnippet[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const quillRef = useRef<ReactQuill>(null);

  const getBytes = (str: string) => new Blob([str]).size;
  const contentBytes = getBytes(content);
  const totalSize = snippets.reduce((acc, s) => acc + s.bytes, 0) + contentBytes;

  const handleAddSnippet = () => {
    if (!title.trim() || !content.trim()) return;
    const snippet: TextSnippet = {
      id: `${title}-${Date.now()}`,
      title: title.trim(),
      content,
      bytes: getBytes(content)
    };
    setSnippets(prev => [...prev, snippet]);
    setTitle('');
    setContent('');
  };

  const handleRemove = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="text-panel-root">
      <div className="text-panel-main">
        <div className="text-panel-header">
          <h2>Texto</h2>
          <div className="text-panel-desc">
            Agrega y procesa fuentes de texto para entrenar tu agente IA con información precisa.
            <a href="#" className="text-panel-link">Aprende más</a>
          </div>
        </div>
        <div className="text-panel-form">
          <label className="text-panel-label">Título</label>
          <input
            className="text-panel-input"
            type="text"
            placeholder="Ej: Solicitudes de reembolso"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={120}
          />
          <label className="text-panel-label">Texto</label>
          <div className="text-panel-editor-wrapper">
            <ReactQuill
              ref={quillRef}
              value={content}
              onChange={setContent}
              placeholder="Escribe tu texto aquí"
              theme="snow"
              className="text-panel-editor"
            />
            <div className="text-panel-bytes">{contentBytes} B</div>
          </div>
          <button
            className="text-panel-add-btn"
            onClick={handleAddSnippet}
            disabled={!title.trim() || !content.trim() || totalSize > MAX_TOTAL_SIZE}
          >
            Agregar fragmento de texto
          </button>
        </div>
        <div className="text-snippets-section">
          <h3>Fragmentos de texto</h3>
          {snippets.length === 0 ? (
            <div className="text-snippets-empty">Aún no se han agregado fragmentos.</div>
          ) : (
            <ul className="text-snippets-list">
              {snippets.map(s => (
                <li key={s.id} className="text-snippet-item">
                  <span className="text-snippet-title">{s.title}</span>
                  <span className="text-snippet-bytes">{s.bytes} B</span>
                  <button className="text-snippet-remove" onClick={() => handleRemove(s.id)}>Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <aside className="text-panel-summary">
        <div className="text-summary-title">RESUMEN</div>
        <div className="text-summary-row">
          <span>{snippets.length} Fragmento{snippets.length !== 1 ? 's' : ''}</span>
          <span>{(snippets.reduce((acc, s) => acc + s.bytes, 0)/1024).toFixed(0)} KB</span>
        </div>
        <div className="text-summary-row text-summary-total">
          <span>Tamaño total:</span>
          <span>{(totalSize/1024).toFixed(0)} KB / 400 KB</span>
        </div>
        <button className="text-summary-btn" disabled={snippets.length === 0 || totalSize > MAX_TOTAL_SIZE}>
          Alimentar agente
        </button>
      </aside>
    </div>
  );
};

export default TextSourcePanel; 