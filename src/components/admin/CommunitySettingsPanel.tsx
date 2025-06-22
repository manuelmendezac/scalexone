import React from 'react';

const CommunitySettingsPanel: React.FC = () => {
  return (
    <div className="w-full py-10">
      <div className="w-full max-w-4xl mx-auto bg-black rounded-lg shadow-lg p-6 md:p-10 border-2 border-yellow-500">
        <h2 className="text-yellow-500 font-bold text-3xl mb-6">Configuración de la Comunidad</h2>
        <p className="text-white">Aquí se mostrarán las opciones de configuración para la comunidad.</p>
      </div>
    </div>
  );
};

export default CommunitySettingsPanel; 