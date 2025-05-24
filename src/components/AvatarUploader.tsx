import React, { useRef, useState } from 'react';

interface AvatarUploaderProps {
  onUpload: (url: string) => void;
  label?: string;
  initialUrl?: string;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ onUpload, label = 'Sube tu imagen de avatar', initialUrl }) => {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setError('Debes seleccionar una imagen.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await fetch('/api/avatar-upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir la imagen');
      onUpload(data.url); // Llama al callback con la URL
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="avatar-preview"
            className="w-24 h-24 rounded-full border-2 border-cyan-400 object-cover shadow cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          />
        ) : (
          <button
            className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center text-cyan-400 bg-gray-900 hover:bg-cyan-900/20 transition"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            +
          </button>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          disabled={loading}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
            <span className="text-cyan-200">Subiendo...</span>
          </div>
        )}
      </div>
      {error && <div className="text-xs text-red-400">{error}</div>}
      <div className="text-xs text-cyan-300">{label}</div>
    </div>
  );
};

export default AvatarUploader; 