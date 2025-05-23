import { useState, useRef } from 'react';
import useNeuroState from '../store/useNeuroState';

interface KnowledgeProfile {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  icon: string;
  subProfiles?: KnowledgeProfile[];
}

const knowledgeProfiles: KnowledgeProfile[] = [
  {
    id: 'ai-1',
    name: 'Inteligencia Artificial',
    category: 'Tecnología',
    description: 'Expertos en IA y Machine Learning',
    color: 'blue',
    icon: '🤖',
    subProfiles: [
      {
        id: 'ai-1-1',
        name: 'Closer de ventas en IA',
        category: 'Ventas',
        description: 'Especialista en ventas de soluciones IA',
        color: 'blue',
        icon: '💼'
      },
      {
        id: 'ai-1-2',
        name: 'Consultor IA',
        category: 'Consultoría',
        description: 'Asesoría en implementación de IA',
        color: 'blue',
        icon: '🎯'
      }
    ]
  },
  {
    id: 'web3-1',
    name: 'Web3',
    category: 'Tecnología',
    description: 'Expertos en Blockchain y Web3',
    color: 'purple',
    icon: '⛓️',
    subProfiles: [
      {
        id: 'web3-1-1',
        name: 'Consultor Web3',
        category: 'Consultoría',
        description: 'Asesoría en proyectos Web3',
        color: 'purple',
        icon: '🔗'
      }
    ]
  },
  {
    id: 'health-1',
    name: 'Salud',
    category: 'Bienestar',
    description: 'Expertos en salud y bienestar',
    color: 'green',
    icon: '💊',
    subProfiles: [
      {
        id: 'health-1-1',
        name: 'HealthTech Founder',
        category: 'Emprendimiento',
        description: 'Fundador de startups en salud',
        color: 'green',
        icon: '🏥'
      }
    ]
  }
];

const KnowledgeMatrix = () => {
  const { 
    userProfile, 
    selectKnowledgeProfile, 
    removeKnowledgeProfile, 
    addCustomKnowledge,
    removeCustomKnowledge 
  } = useNeuroState();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSelect = async (profile: KnowledgeProfile) => {
    setIsLoading(true);
    setLoadingMessage(`Activando modo experto en ${profile.name}...`);
    
    // Simular carga de conocimiento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    selectKnowledgeProfile(profile.id);
    setIsLoading(false);
    setLoadingMessage('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      addCustomKnowledge({
        name: file.name,
        type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.md') ? 'md' : 'txt',
        content
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-neurolink-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-neurolink-coldWhite font-futuristic text-xl animate-pulse">
            {loadingMessage}
          </div>
        </div>
      )}

      {/* Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {knowledgeProfiles.map((category) => (
          <div
            key={category.id}
            className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === category.id ? 'ring-2 ring-neurolink-cyberBlue' : ''
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <div className={`p-6 rounded-xl bg-neurolink-background border-2 border-${category.color}-500/30 hover:border-${category.color}-500/60 transition-all duration-300`}>
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <h3 className="text-neurolink-coldWhite font-futuristic text-xl">{category.name}</h3>
                  <p className="text-neurolink-coldWhite/60">{category.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subperfiles */}
      {selectedCategory && (
        <div className="mt-8">
          <h2 className="text-neurolink-coldWhite font-futuristic text-2xl mb-6">
            Subperfiles Disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeProfiles
              .find(cat => cat.id === selectedCategory)
              ?.subProfiles?.map((profile) => (
                <div
                  key={profile.id}
                  className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    userProfile.selectedProfiles.includes(profile.id)
                      ? 'ring-2 ring-neurolink-cyberBlue'
                      : ''
                  }`}
                  onClick={() => handleProfileSelect(profile)}
                >
                  <div className={`p-6 rounded-xl bg-neurolink-background border-2 border-${profile.color}-500/30 hover:border-${profile.color}-500/60 transition-all duration-300`}>
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{profile.icon}</span>
                      <div>
                        <h3 className="text-neurolink-coldWhite font-futuristic text-xl">{profile.name}</h3>
                        <p className="text-neurolink-coldWhite/60">{profile.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Carga de Documentos */}
      <div className="mt-12">
        <h2 className="text-neurolink-coldWhite font-futuristic text-2xl mb-6">
          Cargar Conocimiento Personalizado
        </h2>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-neurolink-cyberBlue bg-opacity-10 text-neurolink-coldWhite font-futuristic border-2 border-neurolink-cyberBlue rounded-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neurolink-cyberBlue focus:ring-opacity-50"
          >
            Seleccionar Archivo
          </button>
          <span className="text-neurolink-coldWhite/60">
            Formatos soportados: PDF, TXT, MD
          </span>
        </div>
      </div>

      {/* Documentos Cargados */}
      {userProfile.customKnowledge.length > 0 && (
        <div className="mt-8">
          <h2 className="text-neurolink-coldWhite font-futuristic text-2xl mb-6">
            Documentos Cargados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProfile.customKnowledge.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-neurolink-background border-2 border-neurolink-cyberBlue/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-neurolink-coldWhite font-futuristic">{doc.name}</h3>
                    <p className="text-neurolink-coldWhite/60 text-sm">{doc.type.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => removeCustomKnowledge(doc.id)}
                    className="text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeMatrix; 