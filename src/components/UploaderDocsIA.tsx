import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploaded' | 'processing' | 'completed';
}

const UploaderDocsIA = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFileTypes = ['.pdf', '.docx', '.txt', '.md'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

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
    const validFiles = files.filter(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return allowedFileTypes.includes(extension) && file.size <= maxFileSize;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploaded'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const processFiles = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simular progreso
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simular procesamiento
    setTimeout(() => {
      setUploadedFiles(prev =>
        prev.map(file => ({
          ...file,
          status: 'completed'
        }))
      );
      setIsProcessing(false);
      setProgress(0);
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="bg-black/30 rounded-xl p-6 border-2 border-neurolink-cyberBlue">
        <h2 className="text-2xl font-futuristic text-neurolink-coldWhite mb-6">
          Carga de Documentos para IA
        </h2>

        {/* Área de Drag & Drop */}
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
            accept={allowedFileTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <motion.div
            animate={{ y: isDragging ? 5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-neurolink-cyberBlue" />
            <p className="text-neurolink-coldWhite mb-2">
              Arrastra y suelta tus archivos aquí
            </p>
            <p className="text-neurolink-coldWhite/60 text-sm">
              o haz clic para seleccionar archivos
            </p>
            <p className="text-neurolink-coldWhite/40 text-xs mt-2">
              Formatos permitidos: PDF, DOCX, TXT, MD (máx. 10MB)
            </p>
          </motion.div>
        </div>

        {/* Lista de Archivos */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 space-y-4"
            >
              {uploadedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-neurolink-cyberBlue/30"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-neurolink-cyberBlue" />
                    <div>
                      <p className="text-neurolink-coldWhite">{file.name}</p>
                      <p className="text-neurolink-coldWhite/60 text-sm">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  {file.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-neurolink-matrixGreen" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de Progreso */}
        {isProcessing && (
          <div className="mt-6">
            <div className="h-2 bg-neurolink-cyberBlue/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-neurolink-matrixGreen"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <p className="text-neurolink-coldWhite/60 text-sm mt-2 text-center">
              Procesando archivos... {progress}%
            </p>
          </div>
        )}

        {/* Botón de Procesar */}
        {uploadedFiles.length > 0 && !isProcessing && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={processFiles}
            className="w-full mt-6 py-3 rounded-lg bg-neurolink-matrixGreen/20 hover:bg-neurolink-matrixGreen/30 
              text-neurolink-coldWhite transition-all flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Procesar y Entrenar IA</span>
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default UploaderDocsIA; 