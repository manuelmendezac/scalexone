import React, { useState } from 'react';
import './NotionSourcePanel.css';

interface NotionPage {
  id: string;
  title: string;
  size: number;
}

const MAX_TOTAL_SIZE = 400 * 1024; // 400 KB

const NotionSourcePanel: React.FC = () => {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [loading, setLoading] = useState(false);

  const totalSize = pages.reduce((acc, p) => acc + p.size, 0);

  const handleImport = () => {
    setLoading(true);
    setTimeout(() => {
      // Simula la importación de una página de Notion
      const newPage: NotionPage = {
        id: `${Date.now()}`,
        title: `Página de Notion ${pages.length + 1}`,
        size: 18 * 1024 + Math.floor(Math.random() * 10 * 1024) // 18-28 KB
      };
      setPages(prev => [...prev, newPage]);
      setLoading(false);
    }, 1200);
  };

  const handleRemove = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="notion-panel-root">
      <div className="notion-panel-main">
        <div className="notion-panel-header">
          <h2>Notion</h2>
          <div className="notion-panel-desc">
            Agrega y procesa fuentes de Notion para entrenar tu agente IA con información precisa.<br/>
            <a href="#" className="notion-panel-link">Aprende más</a>
          </div>
        </div>
        <div className="notion-panel-form">
          <button className="notion-panel-import-btn" onClick={handleImport} disabled={loading || totalSize > MAX_TOTAL_SIZE}>
            {loading ? 'Importando...' : 'Importar desde Notion'}
          </button>
        </div>
        <div className="notion-list-section">
          <h3>Páginas importadas</h3>
          {pages.length === 0 ? (
            <div className="notion-list-empty">Aún no se han importado páginas.</div>
          ) : (
            <ul className="notion-list">
              {pages.map(p => (
                <li key={p.id} className="notion-list-item">
                  <span className="notion-list-title">{p.title}</span>
                  <span className="notion-list-size">{(p.size/1024).toFixed(1)} KB</span>
                  <button className="notion-list-remove" onClick={() => handleRemove(p.id)}>Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <aside className="notion-panel-summary">
        <div className="notion-summary-title">RESUMEN</div>
        <div className="notion-summary-row">
          <span>{pages.length} Página{pages.length !== 1 ? 's' : ''}</span>
          <span>{(totalSize/1024).toFixed(0)} KB</span>
        </div>
        <div className="notion-summary-row notion-summary-total">
          <span>Tamaño total:</span>
          <span>{(totalSize/1024).toFixed(0)} KB / 400 KB</span>
        </div>
        <button className="notion-summary-btn" disabled={pages.length === 0 || totalSize > MAX_TOTAL_SIZE}>
          Alimentar agente
        </button>
      </aside>
    </div>
  );
};

export default NotionSourcePanel; 