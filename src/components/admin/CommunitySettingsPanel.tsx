import React from 'react';

const CommunitySettingsPanel: React.FC = () => {
  return (
    <div className="w-full py-10">
      <div className="w-full max-w-4xl mx-auto bg-black rounded-lg shadow-lg p-6 md:p-10 border-2 border-yellow-500">
        <h2 className="text-yellow-500 font-bold text-3xl mb-6">Configuración de la Comunidad</h2>
        <div className="space-y-8">
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Reglas de la Comunidad</h3>
            <textarea 
              className="input-perfil w-full"
              rows={6}
              placeholder="Establece las reglas y directrices para los miembros de la comunidad."
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Niveles y Rangos</h3>
            <p className="text-gray-400">Próximamente: Configura los niveles de los usuarios, rangos y permisos especiales.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Moderación</h3>
            <p className="text-gray-400">Próximamente: Asigna moderadores y gestiona el contenido reportado.</p>
          </div>
          
          <div className="flex justify-end">
            <button className="bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-colors">
              Guardar Cambios
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CommunitySettingsPanel; 