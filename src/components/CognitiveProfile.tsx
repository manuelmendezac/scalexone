import { useState } from 'react';
import useNeuroState from '../store/useNeuroState';

const INDUSTRY_PROFILES = {
  'bienes-raices': 'Bienes Raíces',
  'ecommerce': 'E-commerce',
  'marketing-digital': 'Marketing Digital',
  'coaching': 'Coaching / Desarrollo Personal'
};

const CognitiveProfile = () => {
  const { userName, avatarUrl, knowledge, updateKnowledge } = useNeuroState();
  const [isTraining, setIsTraining] = useState(false);

  // Función para calcular tokens aproximados (1 token ≈ 4 caracteres)
  const calculateTokens = () => {
    const filesContent = knowledge.files.reduce((acc, file) => acc + file.content.length, 0);
    const notesContent = knowledge.notes.length;
    return Math.ceil((filesContent + notesContent) / 4);
  };

  const handleDeleteFile = (index: number) => {
    const newFiles = knowledge.files.filter((_, i) => i !== index);
    updateKnowledge({ files: newFiles });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateKnowledge({ selectedProfile: e.target.value });
  };

  const handleTrainAI = async () => {
    setIsTraining(true);
    // Simular entrenamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTraining(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl overflow-hidden shadow-lg">
        <div className="p-8">
          <h2 className="text-3xl font-futuristic text-neurolink-cyberBlue mb-8 text-center">
            Tu Segundo Cerebro IA
          </h2>

          {/* Información del Usuario */}
          <div className="flex items-center space-x-4 mb-8 p-4 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg">
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt={`Avatar de ${userName}`}
                className="w-16 h-16 rounded-full border-2 border-neurolink-cyberBlue"
              />
            )}
            <div>
              <h3 className="text-xl font-futuristic text-neurolink-coldWhite">
                {userName}
              </h3>
              <p className="text-neurolink-coldWhite/70">
                {knowledge.files.length} documentos cargados
              </p>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg">
              <h4 className="text-neurolink-coldWhite/70 font-futuristic mb-2">
                Tokens de Conocimiento
              </h4>
              <p className="text-2xl font-futuristic text-neurolink-cyberBlue">
                {calculateTokens().toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg">
              <h4 className="text-neurolink-coldWhite/70 font-futuristic mb-2">
                Perfil Base
              </h4>
              <select
                value={knowledge.selectedProfile}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg text-neurolink-coldWhite font-futuristic focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50 transition-all duration-300"
              >
                <option value="">Seleccionar perfil...</option>
                {Object.entries(INDUSTRY_PROFILES).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de Documentos */}
          {knowledge.files.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
                Documentos Cargados
              </h3>
              <div className="space-y-2">
                {knowledge.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neurolink-background border-2 border-neurolink-cyberBlue rounded-lg group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-neurolink-coldWhite font-futuristic">
                        {file.name}
                      </span>
                      <span className="text-neurolink-coldWhite/50 text-sm">
                        {Math.ceil(file.content.length / 4).toLocaleString()} tokens
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(index)}
                      className="p-2 text-neurolink-coldWhite/50 hover:text-neurolink-cyberBlue transition-colors duration-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de Entrenamiento */}
          <div className="flex justify-center">
            <button
              onClick={handleTrainAI}
              disabled={isTraining || knowledge.files.length === 0}
              className="px-8 py-3 bg-neurolink-cyberBlue bg-opacity-10 text-neurolink-coldWhite font-futuristic border-2 border-neurolink-cyberBlue rounded-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTraining ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-neurolink-cyberBlue border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrenando IA...</span>
                </div>
              ) : (
                'Entrenar IA'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognitiveProfile; 