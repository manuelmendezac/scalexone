import React, { useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './QASourcePanel.css';

interface QAItem {
  id: string;
  title: string;
  questions: string[];
  answer: string;
  bytes: number;
}

const MAX_TOTAL_SIZE = 400 * 1024; // 400 KB

const QASourcePanel: React.FC = () => {
  const [qas, setQAs] = useState<QAItem[]>([]);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [answer, setAnswer] = useState('');
  const quillRef = useRef<ReactQuill>(null);

  const getBytes = (str: string) => new Blob([str]).size;
  const answerBytes = getBytes(answer);
  const totalSize = qas.reduce((acc, q) => acc + q.bytes, 0) + answerBytes;

  const handleQuestionChange = (idx: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => (i === idx ? value : q)));
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [...prev, '']);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddQA = () => {
    if (!title.trim() || !answer.trim() || questions.some(q => !q.trim())) return;
    const qa: QAItem = {
      id: `${title}-${Date.now()}`,
      title: title.trim(),
      questions: questions.map(q => q.trim()),
      answer,
      bytes: getBytes(answer)
    };
    setQAs(prev => [...prev, qa]);
    setTitle('');
    setQuestions(['']);
    setAnswer('');
  };

  const handleRemoveQA = (id: string) => {
    setQAs(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="qa-panel-root">
      <div className="qa-panel-main">
        <div className="qa-panel-header">
          <h2>Q&A</h2>
          <div className="qa-panel-desc">
            Crea respuestas para preguntas importantes y asegúrate de que tu agente IA comparta la información más relevante. Usa respuestas personalizadas para agregar imágenes, videos o enlaces.<br/>
            <a href="#" className="qa-panel-link">Aprende más</a>
          </div>
        </div>
        <div className="qa-panel-form">
          <label className="qa-panel-label">Título del grupo</label>
          <input
            className="qa-panel-input"
            type="text"
            placeholder="Ej: Solicitudes de reembolso"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={120}
          />
          <label className="qa-panel-label">Pregunta(s)</label>
          {questions.map((q, idx) => (
            <div key={idx} className="qa-panel-question-row">
              <input
                className="qa-panel-input"
                type="text"
                placeholder={idx === 0 ? 'Ej: ¿Cómo solicito un reembolso?' : 'Otra variante de la pregunta'}
                value={q}
                onChange={e => handleQuestionChange(idx, e.target.value)}
                maxLength={200}
              />
              {questions.length > 1 && (
                <button className="qa-panel-remove-question" onClick={() => handleRemoveQuestion(idx)} title="Eliminar pregunta">✕</button>
              )}
            </div>
          ))}
          <button className="qa-panel-add-question" onClick={handleAddQuestion} type="button">
            + Agregar otra pregunta
          </button>
          <label className="qa-panel-label">Respuesta</label>
          <div className="qa-panel-editor-wrapper">
            <ReactQuill
              ref={quillRef}
              value={answer}
              onChange={setAnswer}
              placeholder="Escribe la respuesta aquí"
              theme="snow"
              className="qa-panel-editor"
            />
            <div className="qa-panel-bytes">{answerBytes} B</div>
          </div>
          <button
            className="qa-panel-add-btn"
            onClick={handleAddQA}
            disabled={!title.trim() || !answer.trim() || questions.some(q => !q.trim()) || totalSize > MAX_TOTAL_SIZE}
          >
            Agregar Q&A
          </button>
        </div>
        <div className="qa-list-section">
          <h3>Q&A agregadas</h3>
          {qas.length === 0 ? (
            <div className="qa-list-empty">Aún no se han agregado Q&A.</div>
          ) : (
            <ul className="qa-list">
              {qas.map(q => (
                <li key={q.id} className="qa-list-item">
                  <span className="qa-list-title">{q.title}</span>
                  <span className="qa-list-questions">{q.questions.join(' | ')}</span>
                  <span className="qa-list-bytes">{q.bytes} B</span>
                  <button className="qa-list-remove" onClick={() => handleRemoveQA(q.id)}>Eliminar</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <aside className="qa-panel-summary">
        <div className="qa-summary-title">RESUMEN</div>
        <div className="qa-summary-row">
          <span>{qas.length} Q&A</span>
          <span>{(qas.reduce((acc, q) => acc + q.bytes, 0)/1024).toFixed(0)} KB</span>
        </div>
        <div className="qa-summary-row qa-summary-total">
          <span>Tamaño total:</span>
          <span>{(totalSize/1024).toFixed(0)} KB / 400 KB</span>
        </div>
        <button className="qa-summary-btn" disabled={qas.length === 0 || totalSize > MAX_TOTAL_SIZE}>
          Alimentar agente
        </button>
      </aside>
    </div>
  );
};

export default QASourcePanel; 