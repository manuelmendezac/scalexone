import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Upload, FileText, X, Loader2, CheckCircle, ChevronDown } from 'lucide-react';

interface ArchivoSubido {
  id: string;
  nombre: string;
  tipo: string;
  size: number;
}

const tiposConocimiento = [
  'Marketing Digital',
  'Bienes Raíces',
  'Medicina',
  'Programación',
  'Finanzas',
  'Educación',
  'Diseño',
  'Negocios',
  'Otro'
];

const EntrenamientoIA = () => {
  const [conocimiento, setConocimiento] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [habilidad, setHabilidad] = useState('');
  const [archivos, setArchivos] = useState<ArchivoSubido[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newFiles: ArchivoSubido[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      nombre: file.name,
      tipo: file.type,
      size: file.size
    }));

    setArchivos(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setArchivos(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTraining(true);
    setIsComplete(false);

    // Simular entrenamiento
    setTimeout(() => {
      setIsTraining(false);
      setIsComplete(true);
      // Resetear después de 3 segundos
      setTimeout(() => {
        setIsComplete(false);
        setConocimiento('');
        setTipoSeleccionado('');
        setHabilidad('');
        setArchivos([]);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="w-full">
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border-2 border-neurolink-cyberBlue/30">
        <h2 className="text-xl font-futuristic text-neurolink-coldWhite mb-6 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-neurolink-matrixGreen" />
          Entrenamiento de IA
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo de Conocimiento */}
          <div>
            <label className="block text-neurolink-coldWhite mb-2">
              Escribe el conocimiento a entrenar
            </label>
            <textarea
              value={conocimiento}
              onChange={(e) => setConocimiento(e.target.value)}
              className="w-full h-32 bg-black/20 border-2 border-neurolink-cyberBlue/30
                rounded-lg p-3 text-neurolink-coldWhite placeholder-neurolink-coldWhite/40
                focus:outline-none focus:border-neurolink-matrixGreen transition-all
                resize-none"
              placeholder="Escribe aquí el conocimiento, experiencia o información que deseas que tu clon aprenda..."
            />
          </div>

          {/* Tipo de Conocimiento */}
          <div>
            <label className="block text-neurolink-coldWhite mb-2">
              Tipo de Conocimiento
            </label>
            <div className="relative">
              <select
                value={tipoSeleccionado}
                onChange={(e) => setTipoSeleccionado(e.target.value)}
                className="w-full bg-black/20 border-2 border-neurolink-cyberBlue/30
                  rounded-lg p-3 text-neurolink-coldWhite appearance-none
                  focus:outline-none focus:border-neurolink-matrixGreen transition-all"
              >
                <option value="">Selecciona un tipo</option>
                {tiposConocimiento.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2
                w-5 h-5 text-neurolink-coldWhite/60 pointer-events-none" />
            </div>
          </div>

          {/* Habilidad a Aprender */}
          <div>
            <label className="block text-neurolink-coldWhite mb-2">
              ¿Qué habilidad deseas que aprenda este clon?
            </label>
            <input
              type="text"
              value={habilidad}
              onChange={(e) => setHabilidad(e.target.value)}
              className="w-full bg-black/20 border-2 border-neurolink-cyberBlue/30
                rounded-lg p-3 text-neurolink-coldWhite placeholder-neurolink-coldWhite/40
                focus:outline-none focus:border-neurolink-matrixGreen transition-all"
              placeholder="Ej: Análisis de mercado, Diagnóstico médico, Desarrollo web..."
            />
          </div>

          {/* Subida de Archivos */}
          <div>
            <label className="block text-neurolink-coldWhite mb-2">
              Archivos de Entrenamiento
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${isDragging
                  ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
                  : 'border-neurolink-cyberBlue/30 hover:border-neurolink-cyberBlue/60'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-neurolink-cyberBlue" />
              <p className="text-neurolink-coldWhite mb-2">
                Arrastra y suelta tus archivos aquí
              </p>
              <p className="text-neurolink-coldWhite/60 text-sm">
                o haz clic para seleccionar archivos
              </p>
              <p className="text-neurolink-coldWhite/40 text-xs mt-2">
                Formatos permitidos: PDF, TXT, DOCX
              </p>
            </div>

            {/* Lista de Archivos */}
            <AnimatePresence>
              {archivos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-2"
                >
                  {archivos.map((archivo) => (
                    <motion.div
                      key={archivo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-black/20
                        rounded-lg border border-neurolink-cyberBlue/30"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-neurolink-cyberBlue" />
                        <span className="text-neurolink-coldWhite">{archivo.nombre}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFile(archivo.id)}
                        className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20
                          text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botón de Entrenamiento */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isTraining || (!conocimiento && archivos.length === 0)}
            className="w-full py-3 rounded-lg bg-neurolink-matrixGreen/20
              text-neurolink-coldWhite hover:bg-neurolink-matrixGreen/30
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center space-x-2"
          >
            {isTraining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Entrenando IA...</span>
              </>
            ) : isComplete ? (
              <>
                <CheckCircle className="w-5 h-5 text-neurolink-matrixGreen" />
                <span>¡Entrenamiento Completado!</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Entrenar IA</span>
              </>
            )}
          </motion.button>

          {/* Mensaje de Éxito */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 rounded-lg bg-neurolink-matrixGreen/10 border border-neurolink-matrixGreen/30
                  text-neurolink-coldWhite text-center"
              >
                <p className="font-futuristic">
                  ✅ Tu clon ha sido entrenado con éxito con la nueva información.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

export default EntrenamientoIA; 