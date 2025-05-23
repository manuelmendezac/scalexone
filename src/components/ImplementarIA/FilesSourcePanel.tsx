import React, { useRef, useState } from 'react';
import './FilesSourcePanel.css';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

const MAX_TOTAL_SIZE = 400 * 1024; // 400 KB

const FilesSourcePanel: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: FileItem[] = Array.from(fileList).map(f => ({
      id: `${f.name}-${f.size}-${Date.now()}`,
      name: f.name,
      size: f.size,
      type: f.type
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="files-panel-root">
      <div className="files-panel-main">
        <div className="files-dropzone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
            accept=".pdf,.doc,.docx,.txt"
          />
          <div className="files-dropzone-icon">📄</div>
          <div className="files-dropzone-text">
            <b>Arrastra y suelta archivos aquí, o haz clic para seleccionarlos</b>
            <div className="files-dropzone-subtext">Tipos soportados: .pdf, .doc, .docx, .txt</div>
          </div>
        </div>
        <div className="files-list-section">
          <h3>Archivos cargados</h3>
          {files.length === 0 ? (
            <div className="files-list-empty">Aún no se han subido archivos.</div>
          ) : (
            <ul className="files-list">
              {files.map(f => (
                <li key={f.id} className="files-list-item">
                  <span className="files-list-icon">{f.type.includes('pdf') ? '📕' : '📄'}</span>
                  <span className="files-list-name">{f.name}</span>
                  <span className="files-list-size">{(f.size/1024).toFixed(1)} KB</span>
                  <button className="files-list-remove" onClick={() => handleRemove(f.id)}>Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <aside className="files-panel-summary">
        <div className="files-summary-title">RESUMEN</div>
        <div className="files-summary-row">
          <span>{files.length} Archivo{files.length !== 1 ? 's' : ''}</span>
          <span>{(totalSize/1024).toFixed(0)} KB</span>
        </div>
        <div className="files-summary-row files-summary-total">
          <span>Tamaño total:</span>
          <span>{(totalSize/1024).toFixed(0)} KB / 400 KB</span>
        </div>
        <button className="files-summary-btn" disabled={files.length === 0 || totalSize > MAX_TOTAL_SIZE}>
          Alimentar agente
        </button>
      </aside>
    </div>
  );
};

export default FilesSourcePanel; 