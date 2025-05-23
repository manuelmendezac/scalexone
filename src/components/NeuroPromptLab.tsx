import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, Share2, Copy, Star, Brain, Briefcase, 
  Activity, Sparkles, ShoppingCart, MoreHorizontal,
  Send, Eye, Download, QrCode
} from 'lucide-react';
import { useStore } from '../store/store';

const CATEGORIAS = [
  { id: 'negocios', nombre: 'Negocios', icono: Briefcase },
  { id: 'productividad', nombre: 'Productividad', icono: Brain },
  { id: 'salud', nombre: 'Salud', icono: Activity },
  { id: 'creatividad', nombre: 'Creatividad', icono: Sparkles },
  { id: 'ventas', nombre: 'Ventas', icono: ShoppingCart },
  { id: 'otro', nombre: 'Otro', icono: MoreHorizontal }
];

const ETIQUETAS = [
  'estrategia',
  'storytelling',
  'investigación',
  'análisis',
  'planificación',
  'comunicación',
  'marketing',
  'desarrollo'
];

const SUGERENCIAS_IA = [
  'Hazlo más directo',
  'Hazlo como si hablaras a un CEO',
  'Hazlo para un niño de 10 años',
  'Agrega contexto educativo',
  'Enfócate en resultados',
  'Incluye ejemplos prácticos',
  'Añade datos estadísticos',
  'Hazlo más persuasivo'
];

export const NeuroPromptLab: React.FC = () => {
  const [mostrarBiblioteca, setMostrarBiblioteca] = useState(false);
  const [promptActual, setPromptActual] = useState({
    titulo: '',
    contenido: '',
    descripcion: '',
    categoria: 'negocios' as const,
    etiquetas: [] as string[],
    formato: 'texto' as const
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState(false);

  const { 
    prompts, 
    agregarPrompt, 
    actualizarPrompt, 
    eliminarPrompt, 
    duplicarPrompt,
    marcarFavorito,
    compartirPrompt
  } = useStore();

  const handleGuardar = () => {
    if (promptActual.titulo && promptActual.contenido) {
      agregarPrompt(promptActual);
      setFeedback('Prompt guardado exitosamente');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleCompartir = (id: string) => {
    compartirPrompt(id);
    setFeedback('Enlace de compartir generado');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDuplicar = (id: string) => {
    duplicarPrompt(id);
    setFeedback('Prompt duplicado exitosamente');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSugerenciaIA = (sugerencia: string) => {
    // Aquí se implementaría la lógica de transformación del prompt
    setFeedback(`Aplicando: ${sugerencia}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neurolink-dark/80 backdrop-blur-sm rounded-xl border-2 border-neurolink-matrixGreen p-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-orbitron text-neurolink-coldWhite">
            Laboratorio de Prompts
          </h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMostrarBiblioteca(!mostrarBiblioteca)}
              className="px-4 py-2 rounded-lg bg-neurolink-dark/50 text-neurolink-coldWhite
                border border-neurolink-matrixGreen/30 font-orbitron"
            >
              Biblioteca
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGuardar}
              className="px-4 py-2 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark
                font-orbitron flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Guardar</span>
            </motion.button>
          </div>
        </div>

        {/* Editor y Biblioteca */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <div>
              <label className="block text-neurolink-coldWhite mb-2">Título</label>
              <input
                type="text"
                value={promptActual.titulo}
                onChange={(e) => setPromptActual({ ...promptActual, titulo: e.target.value })}
                className="w-full p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30
                  text-neurolink-coldWhite"
                placeholder="Nombre del prompt"
              />
            </div>
            <div>
              <label className="block text-neurolink-coldWhite mb-2">Contenido</label>
              <textarea
                value={promptActual.contenido}
                onChange={(e) => setPromptActual({ ...promptActual, contenido: e.target.value })}
                className="w-full h-64 p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30
                  text-neurolink-coldWhite resize-none"
                placeholder="Escribe tu prompt aquí..."
              />
            </div>
            <div>
              <label className="block text-neurolink-coldWhite mb-2">Descripción</label>
              <textarea
                value={promptActual.descripcion}
                onChange={(e) => setPromptActual({ ...promptActual, descripcion: e.target.value })}
                className="w-full p-2 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30
                  text-neurolink-coldWhite"
                placeholder="Describe el propósito del prompt"
              />
            </div>
            <div>
              <label className="block text-neurolink-coldWhite mb-2">Categoría</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIAS.map(cat => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPromptActual({ ...promptActual, categoria: cat.id as any })}
                    className={`p-2 rounded-lg flex items-center space-x-2
                      ${promptActual.categoria === cat.id
                        ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                        : 'bg-neurolink-dark/50 text-neurolink-coldWhite border border-neurolink-matrixGreen/30'
                      }`}
                  >
                    <cat.icono className="w-5 h-5" />
                    <span>{cat.nombre}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-neurolink-coldWhite mb-2">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {ETIQUETAS.map(etiqueta => (
                  <motion.button
                    key={etiqueta}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const etiquetas = [...promptActual.etiquetas];
                      const index = etiquetas.indexOf(etiqueta);
                      if (index === -1) {
                        etiquetas.push(etiqueta);
                      } else {
                        etiquetas.splice(index, 1);
                      }
                      setPromptActual({ ...promptActual, etiquetas });
                    }}
                    className={`px-3 py-1 rounded-full text-sm
                      ${promptActual.etiquetas.includes(etiqueta)
                        ? 'bg-neurolink-matrixGreen text-neurolink-dark'
                        : 'bg-neurolink-dark/50 text-neurolink-coldWhite border border-neurolink-matrixGreen/30'
                      }`}
                  >
                    {etiqueta}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Biblioteca o Sugerencias */}
          <div>
            {mostrarBiblioteca ? (
              <div className="space-y-4">
                <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-4">
                  Biblioteca de Prompts
                </h3>
                <div className="space-y-4">
                  {prompts.map(prompt => (
                    <motion.div
                      key={prompt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-orbitron text-neurolink-coldWhite">
                            {prompt.titulo}
                          </h4>
                          <p className="text-neurolink-coldWhite/80 text-sm">
                            {prompt.descripcion}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {prompt.etiquetas.map(etiqueta => (
                              <span
                                key={etiqueta}
                                className="px-2 py-1 rounded-full text-xs bg-neurolink-dark/50
                                  text-neurolink-coldWhite/60 border border-neurolink-matrixGreen/30"
                              >
                                {etiqueta}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => marcarFavorito(prompt.id)}
                            className="p-2 rounded-lg bg-neurolink-dark/50 text-neurolink-matrixGreen
                              hover:bg-neurolink-matrixGreen/10"
                          >
                            <Star className={`w-5 h-5 ${prompt.esFavorito ? 'fill-current' : ''}`} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCompartir(prompt.id)}
                            className="p-2 rounded-lg bg-neurolink-dark/50 text-neurolink-matrixGreen
                              hover:bg-neurolink-matrixGreen/10"
                          >
                            <Share2 className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDuplicar(prompt.id)}
                            className="p-2 rounded-lg bg-neurolink-dark/50 text-neurolink-matrixGreen
                              hover:bg-neurolink-matrixGreen/10"
                          >
                            <Copy className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-4">
                  Sugerencias de IA
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {SUGERENCIAS_IA.map(sugerencia => (
                    <motion.button
                      key={sugerencia}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSugerenciaIA(sugerencia)}
                      className="p-3 rounded-lg bg-neurolink-dark/50 text-neurolink-coldWhite
                        border border-neurolink-matrixGreen/30 text-left"
                    >
                      {sugerencia}
                    </motion.button>
                  ))}
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-4">
                    Acciones Rápidas
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setVistaPrevia(!vistaPrevia)}
                      className="p-3 rounded-lg bg-neurolink-dark/50 text-neurolink-coldWhite
                        border border-neurolink-matrixGreen/30 flex items-center space-x-2"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Vista Previa</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-lg bg-neurolink-dark/50 text-neurolink-coldWhite
                        border border-neurolink-matrixGreen/30 flex items-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Enviar a Clon</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-lg bg-neurolink-dark/50 text-neurolink-coldWhite
                        border border-neurolink-matrixGreen/30 flex items-center space-x-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>Exportar</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-lg bg-neurolink-dark/50 text-neurolink-coldWhite
                        border border-neurolink-matrixGreen/30 flex items-center space-x-2"
                    >
                      <QrCode className="w-5 h-5" />
                      <span>Generar QR</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vista Previa */}
        <AnimatePresence>
          {vistaPrevia && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 p-4 rounded-lg bg-neurolink-dark/50 border border-neurolink-matrixGreen/30"
            >
              <h3 className="text-lg font-orbitron text-neurolink-coldWhite mb-4">
                Vista Previa
              </h3>
              <div className="p-4 rounded-lg bg-neurolink-dark/30 text-neurolink-coldWhite/80">
                {promptActual.contenido || 'No hay contenido para previsualizar'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-4 right-4 p-4 rounded-lg bg-neurolink-matrixGreen text-neurolink-dark
                shadow-lg"
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}; 