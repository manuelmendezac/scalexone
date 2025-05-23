import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Loader2, Brain, CheckCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
}

const UploaderDocumentos = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedFileTypes = ['.pdf', '.txt', '.md', '.csv', '.docx'];
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
      status: 'uploaded',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const processFile = async (fileId: string) => {
    setUploadedFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, status: 'processing', progress: 0 }
          : file
      )
    );

    // Simular procesamiento
    const interval = setInterval(() => {
      setUploadedFiles(prev =>
        prev.map(file => {
          if (file.id === fileId) {
            const newProgress = file.progress + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...file, status: 'completed', progress: 100 };
            }
            return { ...file, progress: newProgress };
          }
          return file;
        })
      );
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border-2 border-neurolink-cyberBlue/30">
        <h2 className="text-xl font-futuristic text-neurolink-coldWhite mb-6 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-neurolink-matrixGreen" />
          Cargar Documentos
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
              Arrastra y suelta tus documentos aquí
            </p>
            <p className="text-neurolink-coldWhite/60 text-sm">
              o haz clic para seleccionar archivos
            </p>
            <p className="text-neurolink-coldWhite/40 text-xs mt-2">
              Formatos permitidos: PDF, TXT, MD, CSV, DOCX (máx. 10MB)
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
                  className="bg-black/20 rounded-lg p-4 border border-neurolink-cyberBlue/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-neurolink-cyberBlue" />
                      <div>
                        <p className="text-neurolink-coldWhite">{file.name}</p>
                        <p className="text-neurolink-coldWhite/60 text-sm">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {file.status === 'processing' && (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-neurolink-matrixGreen" />
                          <span className="text-neurolink-coldWhite/60 text-sm">
                            {file.progress}%
                          </span>
                        </div>
                      )}
                      {file.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-neurolink-matrixGreen" />
                      )}
                      {file.status === 'uploaded' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => processFile(file.id)}
                          className="px-3 py-1 rounded-lg bg-neurolink-matrixGreen/20 
                            text-neurolink-coldWhite text-sm hover:bg-neurolink-matrixGreen/30
                            transition-all"
                        >
                          Entrenar
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFile(file.id)}
                        className="p-1 rounded-lg hover:bg-neurolink-cyberBlue/20
                          text-neurolink-coldWhite/60 hover:text-neurolink-coldWhite
                          transition-all"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  {file.status === 'processing' && (
                    <div className="mt-2">
                      <div className="h-1 bg-neurolink-cyberBlue/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-neurolink-matrixGreen"
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                      <p className="text-neurolink-coldWhite/60 text-xs mt-1">
                        Analizando contenido...
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UploaderDocumentos; 