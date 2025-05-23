import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useNeuroState from '../store/useNeuroState';

interface WidgetConfig {
  position: 'bottom-right' | 'bottom-left' | 'center';
  size: 'compact' | 'medium' | 'fullscreen';
  theme: {
    background: string;
    text: string;
    button: string;
  };
  welcomeMessage: string;
  showAvatar: boolean;
  enableAudio: boolean;
}

const defaultConfig: WidgetConfig = {
  position: 'bottom-right',
  size: 'medium',
  theme: {
    background: '#000000',
    text: '#ffffff',
    button: '#00ff00'
  },
  welcomeMessage: '¡Hola! Soy tu asistente IA personalizado. ¿En qué puedo ayudarte?',
  showAvatar: true,
  enableAudio: false
};

const EmbedGenerator = () => {
  const { userName, userProfile } = useNeuroState();
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.5);

  const generateEmbedCode = () => {
    const baseUrl = window.location.origin;
    const configString = encodeURIComponent(JSON.stringify(config));
    
    return `<iframe
  src="${baseUrl}/embed?config=${configString}"
  style="
    position: fixed;
    ${config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : ''}
    ${config.position === 'bottom-left' ? 'bottom: 20px; left: 20px;' : ''}
    ${config.position === 'center' ? 'top: 50%; left: 50%; transform: translate(-50%, -50%);' : ''}
    ${config.size === 'compact' ? 'width: 300px; height: 400px;' : ''}
    ${config.size === 'medium' ? 'width: 400px; height: 600px;' : ''}
    ${config.size === 'fullscreen' ? 'width: 100%; height: 100%;' : ''}
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 255, 0, 0.2);
    z-index: 9999;
  "
></iframe>`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const getPreviewStyles = () => {
    const sizeStyles = {
      compact: { width: '300px', height: '400px' },
      medium: { width: '400px', height: '600px' },
      fullscreen: { width: '100%', height: '100%' }
    };

    return {
      ...sizeStyles[config.size],
      backgroundColor: config.theme.background,
      color: config.theme.text,
      transform: `scale(${previewScale})`,
      transformOrigin: 'top left'
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-neurolink-background/80 backdrop-blur-sm border-2 border-neurolink-cyberBlue rounded-xl p-8">
        <h2 className="text-2xl font-futuristic text-neurolink-coldWhite mb-8">
          Generador de Widget
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Configuración */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
                Configuración
              </h3>
              
              {/* Posición */}
              <div className="mb-4">
                <label className="block text-neurolink-coldWhite/80 mb-2">
                  Posición
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['bottom-right', 'bottom-left', 'center'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setConfig({ ...config, position: pos as WidgetConfig['position'] })}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        config.position === pos
                          ? 'border-neurolink-cyberBlue bg-neurolink-cyberBlue/10'
                          : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/60'
                      }`}
                    >
                      <span className="text-neurolink-coldWhite">
                        {pos === 'bottom-right' ? '↘️' : pos === 'bottom-left' ? '↙️' : '⏺️'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tamaño */}
              <div className="mb-4">
                <label className="block text-neurolink-coldWhite/80 mb-2">
                  Tamaño
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['compact', 'medium', 'fullscreen'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setConfig({ ...config, size: size as WidgetConfig['size'] })}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        config.size === size
                          ? 'border-neurolink-cyberBlue bg-neurolink-cyberBlue/10'
                          : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/60'
                      }`}
                    >
                      <span className="text-neurolink-coldWhite">
                        {size === 'compact' ? '📱' : size === 'medium' ? '💻' : '🖥️'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mensaje de Bienvenida */}
              <div className="mb-4">
                <label className="block text-neurolink-coldWhite/80 mb-2">
                  Mensaje de Bienvenida
                </label>
                <textarea
                  value={config.welcomeMessage}
                  onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                  className="w-full p-2 rounded-lg bg-black/30 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite"
                  rows={3}
                />
              </div>

              {/* Opciones Adicionales */}
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-neurolink-coldWhite/80">
                  <input
                    type="checkbox"
                    checked={config.showAvatar}
                    onChange={(e) => setConfig({ ...config, showAvatar: e.target.checked })}
                    className="form-checkbox text-neurolink-cyberBlue"
                  />
                  <span>Mostrar Avatar</span>
                </label>
                
                <label className="flex items-center space-x-2 text-neurolink-coldWhite/80">
                  <input
                    type="checkbox"
                    checked={config.enableAudio}
                    onChange={(e) => setConfig({ ...config, enableAudio: e.target.checked })}
                    className="form-checkbox text-neurolink-cyberBlue"
                  />
                  <span>Habilitar Audio</span>
                </label>
              </div>
            </div>

            {/* Código Embed */}
            <div>
              <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
                Código para Incrustar
              </h3>
              <div className="relative">
                <pre className="p-4 rounded-lg bg-black/30 border border-neurolink-cyberBlue/30 text-neurolink-coldWhite/80 overflow-x-auto">
                  <code>{generateEmbedCode()}</code>
                </pre>
                <button
                  onClick={handleCopyCode}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-neurolink-cyberBlue/20 hover:bg-neurolink-cyberBlue/30 transition-colors"
                >
                  {copied ? '✓ Copiado' : '📋 Copiar'}
                </button>
              </div>
            </div>
          </div>

          {/* Vista Previa */}
          <div className="relative">
            <h3 className="text-xl font-futuristic text-neurolink-coldWhite mb-4">
              Vista Previa
            </h3>
            <div className="relative border-2 border-neurolink-cyberBlue/30 rounded-lg overflow-hidden">
              <div
                className="transition-all duration-300"
                style={getPreviewStyles()}
              >
                <div className="p-4">
                  {config.showAvatar && (
                    <div className="w-12 h-12 rounded-full bg-neurolink-cyberBlue/20 flex items-center justify-center mb-4">
                      <span className="text-2xl">🤖</span>
                    </div>
                  )}
                  <p className="text-neurolink-coldWhite/80 mb-4">
                    {config.welcomeMessage}
                  </p>
                  <div className="space-y-2">
                    <div className="h-8 bg-neurolink-cyberBlue/10 rounded-lg animate-pulse" />
                    <div className="h-8 bg-neurolink-cyberBlue/10 rounded-lg animate-pulse" />
                    <div className="h-8 bg-neurolink-cyberBlue/10 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Control de Escala */}
            <div className="mt-4">
              <label className="block text-neurolink-coldWhite/80 mb-2">
                Escala de Vista Previa
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={previewScale}
                onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbedGenerator; 