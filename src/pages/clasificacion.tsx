import React from 'react';
import NivelesClasificacionDashboard from '../components/NivelesClasificacionDashboard';
import ExperienciaUsuario from '../components/ExperienciaUsuario';

const Clasificacion: React.FC = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <ExperienciaUsuario />
      <NivelesClasificacionDashboard />
    </div>
  );
};

export default Clasificacion; 