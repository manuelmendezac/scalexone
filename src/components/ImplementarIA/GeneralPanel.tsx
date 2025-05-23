import React from 'react';
import './GeneralPanel.css';

interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  totalInteractions: number;
  creditsRemaining: number;
  lastInteraction: string;
}

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastActive: string;
  interactions: number;
}

const GeneralPanel: React.FC = () => {
  // TODO: Reemplazar con datos reales de la API
  const stats: AgentStats = {
    totalAgents: 5,
    activeAgents: 3,
    totalInteractions: 1250,
    creditsRemaining: 7500,
    lastInteraction: '2024-03-20T15:30:00Z'
  };

  const recentAgents: Agent[] = [
    {
      id: '1',
      name: 'Asistente de Ventas',
      status: 'active',
      lastActive: '2024-03-20T15:30:00Z',
      interactions: 450
    },
    {
      id: '2',
      name: 'Soporte Técnico',
      status: 'active',
      lastActive: '2024-03-20T14:20:00Z',
      interactions: 320
    },
    {
      id: '3',
      name: 'Asistente de Marketing',
      status: 'maintenance',
      lastActive: '2024-03-19T10:15:00Z',
      interactions: 280
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="general-panel">
      <div className="general-panel-header">
        <h2>Panel General</h2>
        <p className="general-panel-subtitle">
          Resumen de tus agentes IA y métricas principales
        </p>
      </div>

      <div className="general-panel-stats">
        <div className="general-panel-stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <h3>Agentes Totales</h3>
            <p className="stat-value">{stats.totalAgents}</p>
            <p className="stat-subtext">{stats.activeAgents} activos</p>
          </div>
        </div>

        <div className="general-panel-stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>Interacciones</h3>
            <p className="stat-value">{stats.totalInteractions}</p>
            <p className="stat-subtext">Total acumulado</p>
          </div>
        </div>

        <div className="general-panel-stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <h3>Créditos</h3>
            <p className="stat-value">{stats.creditsRemaining}</p>
            <p className="stat-subtext">Disponibles</p>
          </div>
        </div>

        <div className="general-panel-stat-card">
          <div className="stat-icon">🕒</div>
          <div className="stat-content">
            <h3>Última Interacción</h3>
            <p className="stat-value">{formatDate(stats.lastInteraction)}</p>
            <p className="stat-subtext">Hora local</p>
          </div>
        </div>
      </div>

      <div className="general-panel-recent">
        <h3>Agentes Recientes</h3>
        <div className="general-panel-agents-list">
          {recentAgents.map(agent => (
            <div key={agent.id} className="general-panel-agent-card">
              <div className="agent-info">
                <h4>{agent.name}</h4>
                <span className={`agent-status ${agent.status}`}>
                  {agent.status === 'active' ? 'Activo' : 
                   agent.status === 'inactive' ? 'Inactivo' : 'Mantenimiento'}
                </span>
              </div>
              <div className="agent-metrics">
                <div className="agent-metric">
                  <span className="metric-label">Interacciones</span>
                  <span className="metric-value">{agent.interactions}</span>
                </div>
                <div className="agent-metric">
                  <span className="metric-label">Última actividad</span>
                  <span className="metric-value">{formatDate(agent.lastActive)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralPanel; 