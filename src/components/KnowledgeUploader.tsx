import { useState, useRef } from 'react';
import useNeuroState from '../store/useNeuroState';

const INDUSTRY_PROFILES = {
  'bienes-raices': {
    name: 'Bienes Raíces',
    content: 'Perfil base para profesionales de bienes raíces. Incluye:\n- Tendencias del mercado inmobiliario\n- Estrategias de venta y negociación\n- Análisis de propiedades\n- Gestión de clientes'
  },
  'ecommerce': {
    name: 'E-commerce',
    content: 'Perfil base para emprendedores de e-commerce. Incluye:\n- Optimización de tiendas online\n- Estrategias de marketing digital\n- Gestión de inventario\n- Experiencia de usuario'
  },
  'marketing-digital': {
    name: 'Marketing Digital',
    content: 'Perfil base para especialistas en marketing digital. Incluye:\n- SEO y SEM\n- Redes sociales\n- Email marketing\n- Análisis de datos'
  },
  'coaching': {
    name: 'Coaching / Desarrollo Personal',
    content: 'Perfil base para coaches y mentores. Incluye:\n- Técnicas de coaching\n- Desarrollo de habilidades blandas\n- Gestión del cambio\n- Liderazgo personal'
  }
};

const KnowledgeUploader = () => {
  const { knowledge, updateKnowledge, addFile } = useNeuroState();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const processFiles = async (files: FileList) => {
    setIsProcessing(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf' || file.type === 'text/plain') {
          const content = await file.text();
          addFile({
            name: file.name,
            type: file.type,
            content
          });
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
    }
    setIsProcessing(false);
  };

  const handleProfileSelect = (profileId: string) => {
    const profile = INDUSTRY_PROFILES[profileId as keyof typeof INDUSTRY_PROFILES];
    updateKnowledge({
      selectedProfile: profileId,
      notes: profile.content
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl overflow-hidden shadow-lg">
        <div className="p-8">
          <h2 className="text-3xl font-futuristic text-neurolink-cyberBlue mb-8 text-center">
            Cargador de Conocimiento
          </h2>

          {/* Sección de Perfiles Base */}
          <div className="mb-8">
            <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
              Perfiles Base por Industria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(INDUSTRY_PROFILES).map(([id, profile]) => (
                <button
                  key={id}
                  onClick={() => handleProfileSelect(id)}
                  className={`p-4 text-left border-2 rounded-lg transition-all duration-300 ${
                    knowledge.selectedProfile === id
                      ? 'border-neurolink-cyberBlue bg-neurolink-cyberBlue bg-opacity-20'
                      : 'border-neurolink-cyberBlue/50 hover:border-neurolink-cyberBlue hover:bg-neurolink-cyberBlue hover:bg-opacity-10'
                  }`}
                >
                  <h4 className="font-futuristic text-neurolink-coldWhite mb-2">
                    {profile.name}
                  </h4>
                </button>
              ))}
            </div>
          </div>

          {/* Sección de Carga de Archivos */}
          <div
            className={`mb-8 p-8 border-2 border-dashed rounded-lg transition-all duration-300 ${
              isDragging
                ? 'border-neurolink-cyberBlue bg-neurolink-cyberBlue bg-opacity-20'
                : 'border-neurolink-cyberBlue/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.txt"
              multiple
              className="hidden"
            />
            <div className="text-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-neurolink-cyberBlue bg-opacity-10 text-neurolink-coldWhite font-futuristic border-2 border-neurolink-cyberBlue rounded-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
              >
                Seleccionar Archivos
              </button>
              <p className="mt-4 text-neurolink-coldWhite/70">
                O arrastra y suelta archivos PDF o TXT aquí
              </p>
            </div>
          </div>

          {/* Sección de Notas */}
          <div>
            <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
              Notas y Contenido
            </h3>
            <textarea
              value={knowledge.notes}
              onChange={(e) => updateKnowledge({ notes: e.target.value })}
              className="w-full px-4 py-3 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite font-futuristic focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50 transition-all duration-300 min-h-[200px]"
              placeholder="Escribe o pega tu contenido aquí..."
            />
          </div>

          {/* Lista de Archivos Cargados */}
          {knowledge.files.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
                Archivos Cargados
              </h3>
              <div className="space-y-2">
                {knowledge.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg"
                  >
                    <span className="text-neurolink-coldWhite font-futuristic">
                      {file.name}
                    </span>
                    <span className="text-neurolink-coldWhite/70 text-sm">
                      {new Date(file.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="mt-4 p-4 bg-neurolink-cyberBlue bg-opacity-20 border border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-neurolink-cyberBlue border-t-transparent rounded-full animate-spin"></div>
                <span>Procesando archivos...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeUploader; 