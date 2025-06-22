import React, { useState } from 'react';
import { Upload, ImageIcon, Star, Hash, Save } from 'lucide-react';

interface UploaderProps {
  title: string;
  description: string;
  recommendation: string;
  inputId: string;
}

const UploaderComponent: React.FC<UploaderProps> = ({ title, description, recommendation, inputId }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
    <label className="block text-base font-semibold text-white">{title}</label>
    <p className="mt-1 text-sm text-gray-400">{description}</p>
    <div className="mt-4 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
      <div className="space-y-1 text-center">
        <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
        <div className="flex text-sm text-gray-400">
          <label htmlFor={inputId} className="relative cursor-pointer bg-gray-900 rounded-md font-medium text-yellow-400 hover:text-yellow-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-yellow-500">
            <span>Sube un archivo</span>
            <input id={inputId} name={inputId} type="file" className="sr-only" />
          </label>
          <p className="pl-1">o arrástralo aquí</p>
        </div>
        <p className="text-xs text-gray-500">{recommendation}</p>
      </div>
    </div>
  </div>
);

const CommunitySettingsPanel: React.FC = () => {
  const [communityName, setCommunityName] = useState('Metalink'); // Placeholder
  const [communityDescription, setCommunityDescription] = useState('');
  const [communityStatus, setCommunityStatus] = useState('public');

  const handleSaveChanges = () => {
    console.log('Guardando cambios...', { communityName, communityDescription, communityStatus });
  };

  return (
    <div className="flex-1 sm:p-8 p-4 bg-black">
      <div className="mx-auto">
        <div className="w-full bg-gray-900/50 rounded-lg p-6 md:p-8">
          <h1 className="text-red-500 text-4xl font-bold mb-6">VERSIÓN MÁS RECIENTE</h1>
          <h2 className="text-2xl font-bold mb-6">Comunidad</h2>

          <div className="space-y-10 max-w-none">
            {/* Banner */}
            <UploaderComponent 
              title="Banner"
              description="Esta imagen aparecerá como portada en la pestaña de información de tu comunidad."
              recommendation="PNG, JPG, GIF. Mínimo 750x390px, 4MB o menos."
              inputId="banner-upload"
            />

            {/* Logo o icono */}
            <UploaderComponent 
              title="Logo o icono de la Comunidad"
              description="Aparecerá como icono principal en las conversaciones de tu comunidad y publicaciones."
              recommendation="PNG, JPG, GIF. Mínimo 100x100px, 4MB o menos."
              inputId="logo-upload"
            />
            
            {/* Nombre y Descripción */}
            <div className="space-y-6">
              <div>
                <label htmlFor="communityName" className="block text-base font-semibold text-white mb-2">Nombre de la comunidad</label>
                <input
                  type="text"
                  id="communityName"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label htmlFor="communityDescription" className="block text-base font-semibold text-white mb-2">Descripción de la comunidad</label>
                <textarea
                  id="communityDescription"
                  rows={5}
                  value={communityDescription}
                  onChange={(e) => setCommunityDescription(e.target.value)}
                  placeholder="Describe el propósito y las reglas de tu comunidad."
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
            
            {/* Status de la Comunidad */}
            <div>
              <label htmlFor="communityStatus" className="block text-base font-semibold text-white mb-2">Status de la comunidad</label>
              <select
                id="communityStatus"
                value={communityStatus}
                onChange={(e) => setCommunityStatus(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="public">Comunidad Pública (Los miembros no requieren permisos)</option>
                <option value="private">Comunidad Privada (Los miembros requieren aprobación)</option>
              </select>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end pt-8 mt-10 border-t border-gray-700">
            <button 
              onClick={handleSaveChanges}
              className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-md transition-colors text-base"
            >
              <Save size={20} className="mr-2" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySettingsPanel; 