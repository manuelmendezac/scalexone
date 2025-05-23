import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { useBiblioteca } from '../context/BibliotecaContext';

const allowedFileTypes = ['.pdf', '.docx', '.txt'];
const maxFileSize = 10 * 1024 * 1024; // 10MB
const categorias = ['Productividad', 'Creatividad', 'IA', 'Salud Mental'];

export default function UploaderBibliotecaConocimiento({ onSuccess }: { onSuccess?: () => void }) {
  const { setDocumentos } = useBiblioteca();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [categoria, setCategoria] = useState('');
  const [step, setStep] = useState<'idle' | 'categoria' | 'uploading' | 'vectorizing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [xp, setXp] = useState(0);
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
    const valid = files.find(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return allowedFileTypes.includes(ext) && f.size <= maxFileSize;
    });
    if (!valid) {
      setError('Archivo no válido. Solo PDF, DOCX o TXT (máx. 10MB)');
      return;
    }
    setFile(valid);
    setStep('categoria');
    setError('');
  };
  const handleCategoria = (cat: string) => {
    setCategoria(cat);
    subirDocumento(validFile(), cat);
  };
  const validFile = () => file;

  const subirDocumento = async (file: File | null, categoria: string) => {
    if (!file) return;
    setStep('uploading');
    try {
      const formData = new FormData();
      formData.append('documents', file);
      formData.append('categoria', categoria);
      const res = await fetch('/api/document-upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error al subir documento');
      const { urls } = await res.json();
      if (!urls || !urls[0]) throw new Error('No se obtuvo URL');
      setStep('vectorizing');
      // Llamar a /api/vectorize
      const vecRes = await fetch('/api/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urls[0], categoria }),
      });
      if (!vecRes.ok) throw new Error('Error al vectorizar');
      setStep('success');
      setXp(50);
      if (onSuccess) onSuccess();
      setDocumentos(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          titulo: file.name,
          categoria,
          fecha: new Date().toISOString().slice(0, 10),
        }
      ]);
    } catch (e: any) {
      setError(e.message || 'Error inesperado');
      setStep('error');
    }
  };

  const reset = () => {
    setFile(null);
    setCategoria('');
    setStep('idle');
    setError('');
    setXp(0);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#23232f]/80 rounded-2xl p-8 border-2 border-[#f7c63e]/40 shadow-xl">
      <h2 className="text-2xl font-orbitron text-[#fff7ae] mb-6 flex items-center gap-2">
        <Sparkles className="w-7 h-7 text-[#f7c63e] animate-pulse" />
        Subir Documento
      </h2>
      {/* Drag & Drop */}
      {step === 'idle' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4
            ${isDragging ? 'border-[#f7c63e] bg-[#f7c63e]/10' : 'border-[#f7c63e]/40 hover:border-[#f7c63e]'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedFileTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-[#f7c63e]" />
          <p className="text-[#fff7ae] mb-2">Arrastra y suelta tu documento aquí</p>
          <p className="text-[#fff7ae]/60 text-sm">o haz clic para seleccionar archivo</p>
          <p className="text-[#fff7ae]/40 text-xs mt-2">Formatos: PDF, DOCX, TXT (máx. 10MB)</p>
        </div>
      )}
      {/* Selección de categoría */}
      {step === 'categoria' && file && (
        <div className="flex flex-col items-center gap-4">
          <FileText className="w-10 h-10 text-[#f7c63e]" />
          <p className="text-[#fff7ae] font-bold">{file.name}</p>
          <p className="text-[#fff7ae]/70 text-sm">Selecciona la categoría:</p>
          <div className="flex flex-wrap gap-3">
            {categorias.map(cat => (
              <button
                key={cat}
                className={`px-5 py-2 rounded-full font-bold text-base border-2 border-[#f7c63e]/60 text-[#f7c63e] bg-[#fff7ae]/10 hover:bg-[#f7c63e]/30 transition-all`}
                onClick={() => handleCategoria(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="mt-4 text-xs text-[#f7c63e]/60 underline" onClick={reset}>Cancelar</button>
        </div>
      )}
      {/* Subiendo documento */}
      {step === 'uploading' && (
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="w-10 h-10 text-[#f7c63e] animate-spin" />
          <p className="text-[#fff7ae]">Subiendo documento...</p>
        </div>
      )}
      {/* Vectorizando */}
      {step === 'vectorizing' && (
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="w-10 h-10 text-[#f7c63e] animate-spin" />
          <p className="text-[#fff7ae]">Procesando IA y generando embeddings...</p>
        </div>
      )}
      {/* Éxito */}
      {step === 'success' && (
        <div className="flex flex-col items-center gap-4 animate-fadein">
          <CheckCircle className="w-12 h-12 text-[#f7c63e] animate-bounce" />
          <p className="text-[#fff7ae] font-bold text-lg">¡Documento subido y procesado con IA!</p>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#f7c63e]/20 border border-[#f7c63e]/40 text-[#f7c63e] font-bold text-lg shadow"
          >
            +50 XP
          </motion.div>
          <button className="mt-4 text-xs text-[#f7c63e]/60 underline" onClick={reset}>Subir otro</button>
        </div>
      )}
      {/* Error */}
      {step === 'error' && (
        <div className="flex flex-col items-center gap-4 animate-fadein">
          <X className="w-10 h-10 text-red-400" />
          <p className="text-red-200 font-bold">{error}</p>
          <button className="mt-4 text-xs text-[#f7c63e]/60 underline" onClick={reset}>Intentar de nuevo</button>
        </div>
      )}
    </div>
  );
} 