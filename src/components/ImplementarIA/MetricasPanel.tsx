import React, { useState } from 'react';
import './MetricasPanel.css';

const AGENTES = [
  { id: '1', nombre: 'Asistente de Ventas' },
  { id: '2', nombre: 'Soporte Técnico' },
  { id: '3', nombre: 'Agente Marketing' }
];

const METRICAS = {
  '1': {
    interacciones: 1200,
    usuarios: 340,
    ultima: '2024-05-20 15:30',
    estado: 'Activo',
    datos: [30, 50, 40, 60, 80, 70, 90]
  },
  '2': {
    interacciones: 800,
    usuarios: 210,
    ultima: '2024-05-19 18:10',
    estado: 'Activo',
    datos: [20, 30, 25, 40, 55, 60, 50]
  },
  '3': {
    interacciones: 400,
    usuarios: 120,
    ultima: '2024-05-18 12:00',
    estado: 'Mantenimiento',
    datos: [10, 15, 20, 18, 25, 30, 28]
  }
};

const FECHAS = ['Últimos 7 días', 'Últimos 30 días', 'Este mes'];

const MetricasPanel: React.FC = () => {
  const [agenteId, setAgenteId] = useState('1');
  const [filtroFecha, setFiltroFecha] = useState(FECHAS[0]);

  const m = METRICAS[agenteId as keyof typeof METRICAS];

  return (
    <div className="metricas-panel-root">
      <div className="metricas-panel-header">
        <h2>Métricas de agentes IA</h2>
        <div className="metricas-panel-selectores">
          <select value={agenteId} onChange={e => setAgenteId(e.target.value)} className="metricas-panel-select">
            {AGENTES.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
          <select value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} className="metricas-panel-select">
            {FECHAS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <div className="metricas-panel-metricas">
        <div className="metrica-card">
          <div className="metrica-titulo">Interacciones</div>
          <div className="metrica-valor">{m.interacciones}</div>
        </div>
        <div className="metrica-card">
          <div className="metrica-titulo">Usuarios únicos</div>
          <div className="metrica-valor">{m.usuarios}</div>
        </div>
        <div className="metrica-card">
          <div className="metrica-titulo">Última actividad</div>
          <div className="metrica-valor">{m.ultima}</div>
        </div>
        <div className="metrica-card">
          <div className="metrica-titulo">Estado</div>
          <div className={`metrica-valor metrica-estado ${m.estado.toLowerCase()}`}>{m.estado}</div>
        </div>
      </div>
      <div className="metricas-panel-grafica">
        <h3>Interacciones por día</h3>
        <div className="grafica-barras">
          {m.datos.map((v: number, i: number) => (
            <div key={i} className="barra-outer">
              <div className="barra-inner" style={{height: `${v * 2}px`}} title={`Día ${i+1}: ${v}`}></div>
              <div className="barra-label">{i+1}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="metricas-panel-acciones">
        <button className="metricas-btn">Exportar CSV</button>
        <button className="metricas-btn">Ver detalles</button>
        <button className="metricas-btn metricas-btn-reset">Resetear métricas</button>
      </div>
    </div>
  );
};

export default MetricasPanel; 