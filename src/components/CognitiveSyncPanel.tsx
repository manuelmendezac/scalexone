import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Star, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { useStore } from '../store/store';

const TIPOS_PERMITIDOS = ['.pdf', '.docx', '.txt'];
const TAMANO_MAXIMO = 10 * 1024 * 1024; // 10MB

const FRASES_PROCESAMIENTO = [
  "Extrayendo conceptos clave...",
  "Mapeando conexiones cognitivas...",
  "Clasificando por temas relevantes...",
  "Analizando patrones de conocimiento...",
  "Sintetizando información principal..."
];

export const CognitiveSyncPanel: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [fraseActual, setFraseActual] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    knowledgeBase,
    agregarDocumento,
    eliminarDocumento,
    actualizarDocumento,
    resetearBaseConocimiento
  } = useStore();

  const validarArchivo = (file: File): boolean => {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!TIPOS_PERMITIDOS.includes(extension)) {
      setError('Tipo de archivo no soportado');
      return false;
    }
    if (file.size > TAMANO_MAXIMO) {
      setError('El archivo excede el tamaño máximo permitido');
      return false;
    }
    return true;
  };

  const procesarArchivo = async (file: File) => {
    const nuevoDoc = {
      id: Math.random().toString(36).substr(2, 9),
      nombre: file.name,
      tipo: file.name.substring(file.name.lastIndexOf('.')),
      tamaño: file.size,
      progreso: 0,
      estado: 'procesando' as const,
      temas: [],
      palabrasClave: [],
      esFavorito: false,
      esBasePerfil: false,
      fechaCarga: new Date()
    };

    agregarDocumento(nuevoDoc);

    // Simulación de procesamiento
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      actualizarDocumento(nuevoDoc.id, { progreso: i });
      setFraseActual(FRASES_PROCESAMIENTO[Math.floor(Math.random() * FRASES_PROCESAMIENTO.length)]);
    }

    // Simulación de extracción de temas y palabras clave
    const temasSimulados = ['Neurociencia', 'Inteligencia Artificial', 'Desarrollo Personal'];
    const palabrasClaveSimuladas = ['aprendizaje', 'cognición', 'innovación', 'tecnología'];

    actualizarDocumento(nuevoDoc.id, {
      estado: 'completado',
      temas: temasSimulados,
      palabrasClave: palabrasClaveSimuladas
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    setProcesando(true);

    files.forEach(file => {
      if (validarArchivo(file)) {
        procesarArchivo(file);
      }
    });

    setProcesando(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    setProcesando(true);

    files.forEach(file => {
      if (validarArchivo(file)) {
        procesarArchivo(file);
      }
    });

    setProcesando(false);
  };

  const toggleFavorito = (id: string) => {
    const doc = knowledgeBase.find(d => d.id === id);
    if (doc) {
      actualizarDocumento(id, { esFavorito: !doc.esFavorito });
    }
  };

  const toggleBasePerfil = (id: string) => {
    const doc = knowledgeBase.find(d => d.id === id);
    if (doc) {
      actualizarDocumento(id, { esBasePerfil: !doc.esBasePerfil });
    }
  };

  return (
    <div className="w-full h-full p-4 bg-neurolink-dark/50 backdrop-blur-sm rounded-lg border border-neurolink-neonBlue">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-orbitron text-neurolink-neonBlue">Sincronización Cognitiva</h2>
        <button
          onClick={() => resetearBaseConocimiento()}
          className="p-2 text-neurolink-matrixGreen hover:bg-neurolink-matrixGreen/10 rounded-lg transition-all"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-neurolink-matrixGreen bg-neurolink-matrixGreen/10'
            : 'border-neurolink-neonBlue'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept={TIPOS_PERMITIDOS.join(',')}
          className="hidden"
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-neurolink-neonBlue" />
        <p className="text-neurolink-neonBlue mb-2">
          Arrastra archivos aquí o{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-neurolink-matrixGreen hover:underline"
          >
            selecciona archivos
          </button>
        </p>
        <p className="text-sm text-neurolink-neonBlue/70">
          Formatos soportados: PDF, DOCX, TXT (máx. 10MB)
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center"
        >
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-500">{error}</span>
        </motion.div>
      )}

      {procesando && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-neurolink-matrixGreen/20 border border-neurolink-matrixGreen rounded-lg"
        >
          <p className="text-neurolink-matrixGreen font-orbitron">{fraseActual}</p>
        </motion.div>
      )}

      <div className="mt-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {knowledgeBase.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-neurolink-dark/50 border border-neurolink-neonBlue rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-neurolink-neonBlue" />
                  <div>
                    <h3 className="font-orbitron text-neurolink-neonBlue">{doc.nombre}</h3>
                    <p className="text-sm text-neurolink-neonBlue/70">
                      {(doc.tamaño / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleFavorito(doc.id)}
                    className={`p-2 rounded-lg transition-all ${
                      doc.esFavorito
                        ? 'text-yellow-400 bg-yellow-400/10'
                        : 'text-neurolink-neonBlue hover:bg-neurolink-neonBlue/10'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => eliminarDocumento(doc.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {doc.estado === 'procesando' && (
                <div className="mt-3">
                  <div className="h-2 bg-neurolink-neonBlue/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${doc.progreso}%` }}
                      className="h-full bg-neurolink-matrixGreen"
                    />
                  </div>
                </div>
              )}

              {doc.estado === 'completado' && (
                <div className="mt-3 space-y-2">
                  <div>
                    <h4 className="text-sm font-orbitron text-neurolink-matrixGreen">Temas:</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {doc.temas.map((tema, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-neurolink-matrixGreen/10 text-neurolink-matrixGreen rounded-full text-sm"
                        >
                          {tema}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-orbitron text-neurolink-neonBlue">Palabras Clave:</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {doc.palabrasClave.map((palabra, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-neurolink-neonBlue/10 text-neurolink-neonBlue rounded-full text-sm"
                        >
                          {palabra}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}; 