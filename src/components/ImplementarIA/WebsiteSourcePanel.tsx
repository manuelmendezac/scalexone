import React, { useState } from 'react';
import './WebsiteSourcePanel.css';

interface WebsiteSource {
  id: string;
  type: 'crawl' | 'sitemap' | 'individual';
  url: string;
  include?: string;
  exclude?: string;
  status: 'pending' | 'fetched';
}

const MAX_TOTAL_SIZE = 400 * 1024; // 400 KB (simulado)

const TABS = [
  { key: 'crawl', label: 'Rastrear links' },
  { key: 'sitemap', label: 'Sitemap' },
  { key: 'individual', label: 'Link individual' }
];

const WebsiteSourcePanel: React.FC = () => {
  const [tab, setTab] = useState<'crawl' | 'sitemap' | 'individual'>('crawl');
  const [sources, setSources] = useState<WebsiteSource[]>([]);
  const [url, setUrl] = useState('');
  const [include, setInclude] = useState('');
  const [exclude, setExclude] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulación de tamaño total
  const totalSize = sources.length * 11 * 1024; // 11 KB por fuente (simulado)

  const handleFetch = () => {
    if (!url.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setSources(prev => [
        ...prev,
        {
          id: `${tab}-${url}-${Date.now()}`,
          type: tab,
          url: url.trim(),
          include: include.trim(),
          exclude: exclude.trim(),
          status: 'pending'
        }
      ]);
      setUrl('');
      setInclude('');
      setExclude('');
      setLoading(false);
    }, 1000);
  };

  const handleRemove = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="website-panel-root">
      <div className="website-panel-main">
        <div className="website-panel-header">
          <h2>Enlaces</h2>
          <div className="website-panel-desc">
            Rastrea páginas web específicas o envía sitemaps para actualizar continuamente tu IA con el contenido más reciente.<br/>
            Configura rutas incluidas y excluidas para refinar lo que aprende tu IA. <a href="#" className="website-panel-link">Aprende más</a>
          </div>
        </div>
        <div className="website-panel-tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`website-tab-btn${tab === t.key ? ' active' : ''}`}
              onClick={() => { setTab(t.key as any); setUrl(''); setInclude(''); setExclude(''); }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="website-panel-form">
          {tab === 'crawl' && (
            <>
              <label className="website-panel-label">URL</label>
              <div className="website-panel-url-input">
                <select className="website-panel-protocol" value={url.startsWith('https://') ? 'https://' : 'http://'} onChange={e => setUrl(e.target.value + url.replace(/^https?:\/\//, ''))}>
                  <option value="https://">https://</option>
                  <option value="http://">http://</option>
                </select>
                <input
                  className="website-panel-input"
                  type="text"
                  placeholder="www.ejemplo.com"
                  value={url.replace(/^https?:\/\//, '')}
                  onChange={e => setUrl((url.startsWith('https://') ? 'https://' : 'http://') + e.target.value)}
                />
              </div>
              <div className="website-panel-info">Si agregas múltiples links, todos se marcarán como "pendiente" y no se sobrescribirán entre sí.</div>
              <div className="website-panel-paths-row">
                <input
                  className="website-panel-input"
                  type="text"
                  placeholder="Incluir solo rutas (Ej: blog/*, dev/*)"
                  value={include}
                  onChange={e => setInclude(e.target.value)}
                />
                <input
                  className="website-panel-input"
                  type="text"
                  placeholder="Excluir rutas (Ej: blog/*, dev/*)"
                  value={exclude}
                  onChange={e => setExclude(e.target.value)}
                />
              </div>
              <button className="website-panel-fetch-btn" onClick={handleFetch} disabled={!url.trim() || loading}>
                {loading ? 'Buscando...' : 'Rastrear links'}
              </button>
            </>
          )}
          {tab === 'sitemap' && (
            <>
              <label className="website-panel-label">URL del Sitemap</label>
              <input
                className="website-panel-input"
                type="text"
                placeholder="https://www.ejemplo.com/sitemap.xml"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <button className="website-panel-fetch-btn" onClick={handleFetch} disabled={!url.trim() || loading}>
                {loading ? 'Buscando...' : 'Rastrear sitemap'}
              </button>
            </>
          )}
          {tab === 'individual' && (
            <>
              <label className="website-panel-label">Link individual</label>
              <input
                className="website-panel-input"
                type="text"
                placeholder="https://www.ejemplo.com/pagina"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <button className="website-panel-fetch-btn" onClick={handleFetch} disabled={!url.trim() || loading}>
                {loading ? 'Buscando...' : 'Rastrear link'}
              </button>
            </>
          )}
        </div>
        <div className="website-sources-section">
          <h3>Fuentes web</h3>
          {sources.length === 0 ? (
            <div className="website-sources-empty">Aún no se han agregado fuentes web.</div>
          ) : (
            <ul className="website-sources-list">
              {sources.map(s => (
                <li key={s.id} className="website-source-item">
                  <span className="website-source-type">{s.type === 'crawl' ? 'Rastreo' : s.type === 'sitemap' ? 'Sitemap' : 'Link'}</span>
                  <span className="website-source-url">{s.url}</span>
                  <span className="website-source-status">{s.status === 'pending' ? 'Pendiente' : 'Listo'}</span>
                  <button className="website-source-remove" onClick={() => handleRemove(s.id)}>Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <aside className="website-panel-summary">
        <div className="website-summary-title">RESUMEN</div>
        <div className="website-summary-row">
          <span>{sources.length} Fuente{sources.length !== 1 ? 's' : ''}</span>
          <span>{(totalSize/1024).toFixed(0)} KB</span>
        </div>
        <div className="website-summary-row website-summary-total">
          <span>Tamaño total:</span>
          <span>{(totalSize/1024).toFixed(0)} KB / 400 KB</span>
        </div>
        <button className="website-summary-btn" disabled={sources.length === 0 || totalSize > MAX_TOTAL_SIZE}>
          Alimentar agente
        </button>
      </aside>
    </div>
  );
};

export default WebsiteSourcePanel; 