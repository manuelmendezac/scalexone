import React, { useState } from 'react';
import { Upload, ImageIcon, Star, Hash, Save } from 'lucide-react';

const CommunitySettingsPanel: React.FC = () => {
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');

  const handleSaveChanges = () => {
    // Lógica para guardar los cambios
    console.log('Guardando cambios...', { communityName, communityDescription });
    // Aquí iría la llamada a la API para guardar los datos
  };

  return (
    <div className="w-full">
      <div className="w-full bg-gray-900/50 rounded-lg shadow-lg p-6 md:p-10 border border-gray-700">
        <h2 className="text-yellow-500 font-bold text-3xl mb-8">Configuración de la Comunidad</h2>

        {/* Información General */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-white mb-4">Información General</h3>
          <div className="space-y-6">
            <div>
              <label htmlFor="communityName" className="block text-sm font-medium text-gray-300 mb-2">Nombre de la comunidad</label>
              <input
                type="text"
                id="communityName"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                placeholder="Mi increíble comunidad"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label htmlFor="communityDescription" className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea
                id="communityDescription"
                rows={4}
                value={communityDescription}
                onChange={(e) => setCommunityDescription(e.target.value)}
                placeholder="Describe el propósito y las reglas de tu comunidad."
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-white mb-4">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Logo de la comunidad</label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-yellow-500 hover:text-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-yellow-500">
                      <span>Sube un archivo</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">o arrástralo aquí</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Imagen de portada</label>
               <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="cover-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-yellow-500 hover:text-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-yellow-500">
                      <span>Sube un archivo</span>
                      <input id="cover-upload" name="cover-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">o arrástralo aquí</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Canales y Gamificación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center"><Hash size={20} className="mr-2 text-yellow-500"/> Canales</h3>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors">
              Administrar Canales
            </button>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center"><Star size={20} className="mr-2 text-yellow-500"/> Niveles y Gamificación</h3>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition-colors">
              Configurar Niveles
            </button>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end pt-6 border-t border-gray-700">
          <button 
            onClick={handleSaveChanges}
            className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-md transition-colors"
          >
            <Save size={18} className="mr-2" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunitySettingsPanel; 