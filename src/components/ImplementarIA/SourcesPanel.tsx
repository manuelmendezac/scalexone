import React, { useState } from 'react';
import './SourcesPanel.css';
import FilesSourcePanel from './FilesSourcePanel';
import TextSourcePanel from './TextSourcePanel';
import WebsiteSourcePanel from './WebsiteSourcePanel';
import QASourcePanel from './QASourcePanel';
import NotionSourcePanel from './NotionSourcePanel';

const SOURCES = [
  { key: 'files', label: 'Files', icon: '📄' },
  { key: 'text', label: 'Text', icon: '📝' },
  { key: 'website', label: 'Website', icon: '🌐' },
  { key: 'qa', label: 'Q&A', icon: '💬' },
  { key: 'notion', label: 'Notion', icon: '🗂️' },
];

const SourcesPanel: React.FC = () => {
  const [selected, setSelected] = useState('files');

  const renderContent = () => {
    switch (selected) {
      case 'files':
        return <FilesSourcePanel />;
      case 'text':
        return <TextSourcePanel />;
      case 'website':
        return <WebsiteSourcePanel />;
      case 'qa':
        return <QASourcePanel />;
      case 'notion':
        return <NotionSourcePanel />;
      default:
        return null;
    }
  };

  return (
    <div className="sources-panel-main">
      <aside className="sources-sidebar">
        <h2 className="sources-title">Fuentes</h2>
        <nav className="sources-menu">
          {SOURCES.map(src => (
            <button
              key={src.key}
              className={`sources-btn${selected === src.key ? ' active' : ''}`}
              onClick={() => setSelected(src.key)}
            >
              <span className="sources-btn-icon">{src.icon}</span>
              {src.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="sources-content-panel">
        {renderContent()}
      </main>
    </div>
  );
};

export default SourcesPanel; 