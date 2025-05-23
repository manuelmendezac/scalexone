import React from 'react';
import './Personalizacion.css';
import { useNavigate } from 'react-router-dom';

const AVATARES = [
  { id: 1, nombre: 'Clon IA Personalizado', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=clon' },
  { id: 2, nombre: 'Asistente Pro', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=pro' },
  // Puedes agregar más avatares aquí
];

const Personalizacion: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="ia-personalizacion-galeria">
      <h2>Personaliza tus Agentes</h2>
      <div className="ia-personalizacion-lista">
        {AVATARES.map(agente => (
          <div key={agente.id} className="ia-personalizacion-card">
            <img src={agente.url} alt={agente.nombre} className="ia-personalizacion-avatar" />
            <div className="ia-personalizacion-nombre">{agente.nombre}</div>
            <button
              className="ia-personalizacion-btn"
              onClick={() => navigate(`/personalizar-agente/${agente.id}`)}
            >
              Personalizar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Personalizacion; 